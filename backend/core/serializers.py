from rest_framework import serializers
from .models import (SiteInfo, Testimonial, GymGallery, EventFiles, 
                     LiveUpdateFiles, LiveUpdates, Events)

class SiteInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteInfo
        fields = "__all__"

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


class GymGallerySerializer(serializers.ModelSerializer):
    # Change this to CharField so it accepts the URL string from React
    image = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = GymGallery
        fields = ["id", "title", "description", "image"]

    def create(self, validated_data):
        """
        Custom create to prevent Django Storage from doubling the URL
        """
        image_url = validated_data.pop('image', None)
        # Create instance without the image first
        instance = GymGallery.objects.create(**validated_data)
        
        if image_url:
            # We save the string directly to the database field 
            # This bypasses the 'upload_to' prefixing logic
            instance.image = image_url
            instance.save()
            
        return instance

    def to_representation(self, instance):
        """
        Clean the URL before sending it back to React
        """
        representation = super().to_representation(instance)
        if instance.image:
            img_val = str(instance.image)
            # If the database already contains a full http link, return it as is
            if img_val.startswith('http'):
                representation['image'] = img_val
            else:
                # Fallback: If it's a relative path (from Admin upload), use the .url property
                representation['image'] = instance.image.url if hasattr(instance.image, 'url') else img_val
        return representation
    
    
    
class LiveUpdateFilesSerializer(serializers.ModelSerializer):
    # We use a MethodField to explicitly get the full Cloudinary URL
    file = serializers.SerializerMethodField()

    class Meta:
        model = LiveUpdateFiles
        fields = ['id', 'file']

    def get_file(self, obj):
        try:
            # This returns the full URL (e.g., https://res.cloudinary.com/...)
            if obj.file:
                return obj.file.url
        except Exception:
            return None
        return None
    
    
    

class LiveUpdatesSerializer(serializers.ModelSerializer):
    # Nested serializer for reading files (returns the array of file objects with URLs)
    files = LiveUpdateFilesSerializer(many=True, read_only=True, source='liveupdates_files')
    
    # Write-only field for handling multiple file uploads
    uploaded_files = serializers.ListField(
        child=serializers.FileField(max_length=10000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = LiveUpdates
        fields = ['id', 'subject', 'description', 'timestamp', 'last_modified', 'files', 'uploaded_files']

    def create(self, validated_data):
        # 1. Pop files from data so they aren't passed to the LiveUpdates model directly
        uploaded_files = validated_data.pop('uploaded_files', [])
        
        # 2. Create the Live Update post
        live_update = LiveUpdates.objects.create(**validated_data)
        
        # 3. Create the file associations
        for file in uploaded_files:
            LiveUpdateFiles.objects.create(live_update=live_update, file=file)
            
        return live_update

    def update(self, instance, validated_data):
        # 1. Handle new files if they are being uploaded during an edit
        uploaded_files = validated_data.pop('uploaded_files', [])
        
        # 2. Update the text fields
        instance.subject = validated_data.get('subject', instance.subject)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # 3. Add NEW files to the existing list (Appending, not replacing)
        for file in uploaded_files:
            LiveUpdateFiles.objects.create(live_update=instance, file=file)
            
        return instance
    

class EventFilesSerializer(serializers.ModelSerializer):
    # Returns the direct Cloudinary URL for the frontend
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = EventFiles
        fields = ['id', 'file_url']

    def get_file_url(self, obj):
        try:
            if obj.file:
                return obj.file.url
        except Exception:
            return None
        return None

class EventsSerializer(serializers.ModelSerializer):
    # Read-only nested representation of the images
    files = EventFilesSerializer(many=True, read_only=True, source='events_files')
    
    # Write-only field to accept multiple images during POST/PATCH requests
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=10000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Events
        fields = ['id', 'title', 'highlights', 'description', 'location', 'timestamp', 'files', 'uploaded_images']

    def create(self, validated_data):
        # Extract images from the request
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Create the Event instance
        event = Events.objects.create(**validated_data)
        
        # Create related EventFiles instances
        for image in uploaded_images:
            EventFiles.objects.create(event=event, file=image)
            
        return event

    def update(self, instance, validated_data):
        # Extract any new images from the request
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update text fields
        instance.title = validated_data.get('title', instance.title)
        instance.highlights = validated_data.get('highlights', instance.highlights)
        instance.description = validated_data.get('description', instance.description)
        instance.location = validated_data.get('location', instance.location)
        instance.save()

        # Append new images to the existing event
        for image in uploaded_images:
            EventFiles.objects.create(event=instance, file=image)
            
        return instance
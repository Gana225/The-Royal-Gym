from rest_framework import serializers
from .models import SiteInfo, Testimonial, GymGallery, EventFiles, LiveUpdateFiles

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
from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage, RawMediaCloudinaryStorage
from cloudinary.models import CloudinaryField

class SiteInfo(models.Model):
    main_bg_image = models.ImageField(upload_to="site_info_media/", storage=MediaCloudinaryStorage())
    membershi_plan = models.JSONField()
    phone1 = models.BigIntegerField()
    phone2 = models.BigIntegerField(null=True, blank=True)
    email = models.EmailField(max_length=254, default="exampleEmail@gmail.com")
    gym_address = models.TextField(max_length=350)
    instagram = models.CharField(max_length=600, blank=True, null=True)
    facebook = models.CharField(max_length=600, blank=True, null=True)
    twitter = models.CharField(max_length=600, blank=True, null=True)
    youtube = models.CharField(max_length=600, blank=True, null=True)
    footer_description = models.TextField(blank=True, null=True)

class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    text = models.TextField()
    rating = models.IntegerField(default=5)
    created = models.DateTimeField(auto_now_add=True)

class GymGallery(models.Model):
    # Standard images
    image = CloudinaryField(folder="gym_gallery/", resource_type="auto", use_filename=True, unique_filename=True, null=True, blank=True)
    title = models.CharField(max_length=250, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title or "Gym Gallery Image"
    
    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)

class LiveUpdates(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    # auto_now updates the field every time the model is saved
    last_modified = models.DateTimeField(auto_now=True) 
    subject = models.CharField(max_length=300)
    description = models.TextField()

    def __str__(self):
        return self.subject

    class Meta:
        ordering = ['-last_modified']

class LiveUpdateFiles(models.Model):
    live_update = models.ForeignKey(LiveUpdates, related_name="liveupdates_files", on_delete=models.CASCADE)
    file = CloudinaryField(
        resource_type="auto",
        folder="live_update_files", 
        use_filename=True,     
        unique_filename=True   
    )
    def __str__(self):
        return f"File for {self.live_update.subject}"

class Events(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=250)
    
   
    highlights = models.TextField() 
    
    description = models.TextField()
    location = models.CharField(max_length=500, null=True)

    def __str__(self):
        return self.title
    
    

class EventFiles(models.Model):
    event = models.ForeignKey(Events, related_name="events_files", on_delete=models.CASCADE)
    
    
    file = CloudinaryField(
        resource_type="image",
        folder="event_photos",
        use_filename=True,      
        unique_filename=True,  
        null=True, 
        blank=True
    )

    def __str__(self):
        return f"File for {self.event.title}"
from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage, RawMediaCloudinaryStorage

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
    image = models.ImageField(upload_to="gym_gallery/", null=True, blank=True, storage=MediaCloudinaryStorage())
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
    subject = models.CharField(max_length=300)
    description = models.TextField()

    def __str__(self):
        return self.subject

class LiveUpdateFiles(models.Model):
    live_update = models.ForeignKey(LiveUpdates, related_name="files", on_delete=models.CASCADE)
    # RAW storage for documents (PDF, DOCX, etc)
    file = models.FileField(upload_to="live_update_files/", storage=RawMediaCloudinaryStorage())

    def __str__(self):
        return f"File for {self.live_update.subject}"

class Events(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=250)
    highlights = models.TextField()
    description = models.TextField()
    location = models.CharField(max_length=500)

    def __str__(self):
        return self.title

class EventFiles(models.Model):
    event = models.ForeignKey(Events, related_name="files", on_delete=models.CASCADE)
    # Images for events
    file = models.ImageField(upload_to="event_photos/", null=True, blank=True, storage=MediaCloudinaryStorage())

    def __str__(self):
        return f"File for {self.event.title}"
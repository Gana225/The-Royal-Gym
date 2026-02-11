import cloudinary.uploader
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import GymGallery, EventFiles, LiveUpdateFiles

@receiver(post_delete, sender=GymGallery)
@receiver(post_delete, sender=EventFiles)
@receiver(post_delete, sender=LiveUpdateFiles)
def delete_from_cloudinary(sender, instance, **kwargs):
    # Determine which field holds the file
    file_field = getattr(instance, 'image', None) or getattr(instance, 'file', None)
    
    if file_field:
        try:
            # Extract the public_id from the URL
            # Example URL: https://res.cloudinary.com/demo/image/upload/v1/folder/sample.jpg
            # public_id: folder/sample
            url = str(file_field)
            if "upload/" in url:
                parts = url.split("upload/")[-1].split("/")
                # Remove versioning (v1234567) and extension (.jpg)
                public_id_with_ext = "/".join(parts[1:])
                public_id = public_id_with_ext.split(".")[0]
                
                # Delete from Cloudinary
                cloudinary.uploader.destroy(public_id)
                print(f"Successfully deleted {public_id} from Cloudinary")
        except Exception as e:
            print(f"Cloudinary cleanup failed: {e}")
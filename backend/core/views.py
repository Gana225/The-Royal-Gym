from rest_framework import viewsets, permissions, generics
from .models import SiteInfo, Testimonial, GymGallery
from .serializers import SiteInfoSerializer, TestimonialSerializer, GymGallerySerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import cloudinary.utils
from rest_framework.views import APIView
from django.conf import settings
import time


class SiteInfoViewSet(viewsets.ModelViewSet):
    queryset = SiteInfo.objects.all()
    serializer_class = SiteInfoSerializer

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all().order_by("-created")
    serializer_class = TestimonialSerializer
    # allow unauthenticated read, only admin can create/update/delete
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def edit_site_info(request):
    info = SiteInfo.objects.first() 
    
    if request.method == 'GET':
        # FIX: Pass context={'request': request} here
        serializer = SiteInfoSerializer(info, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        # FIX: Pass context={'request': request} here as well
        serializer = SiteInfoSerializer(info, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

class GymGalleryListCreateView(generics.ListCreateAPIView):
    queryset = GymGallery.objects.all().order_by("-id")
    serializer_class = GymGallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

# ADD THIS NEW VIEW for individual item actions (PUT/PATCH/DELETE)
class GymGalleryDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GymGallery.objects.all()
    serializer_class = GymGallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_destroy(self, instance):
        # 1. Get the image URL from the instance
        image_url = str(instance.image) if instance.image else None
        
        if image_url and 'res.cloudinary.com' in image_url:
            try:
                # 2. Extract Public ID
                # Handles doubled URLs by splitting at /upload/ and taking the right side
                parts = image_url.split('upload/')
                if len(parts) > 1:
                    # Remove the version (e.g., v1770798421/) and file extension
                    path_after_upload = parts[-1] 
                    path_parts = path_after_upload.split('/')
                    
                    # If it starts with 'v' and numbers, skip the version part
                    if path_parts[0].startswith('v') and path_parts[0][1:].isdigit():
                        public_id_with_ext = "/".join(path_parts[1:])
                    else:
                        public_id_with_ext = "/".join(path_parts)
                    
                    # Remove the extension (.png, .jpg)
                    public_id = public_id_with_ext.rsplit('.', 1)[0]
                    
                    # 3. Delete from Cloudinary
                    cloudinary.uploader.destroy(public_id, invalidate=True)
                    print(f"Successfully deleted from Cloudinary: {public_id}")
            except Exception as e:
                print(f"Cloudinary deletion error: {e}")

        # 4. Finally, delete the record from the database
        instance.delete()
        
        
class CloudinarySignatureView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # FIX: Generate a standard unix timestamp manually
        timestamp = int(time.time())
        
        # Define parameters to sign
        params = {
            'timestamp': timestamp,
            'folder': 'gym_gallery',
        }
        
        # Generate the signature using your API Secret
        # This will now work without the attribute error
        signature = cloudinary.utils.api_sign_request(
            params, 
            settings.CLOUDINARY_STORAGE['API_SECRET']
        )
        
        return Response({
            'signature': signature,
            'timestamp': timestamp,
            'api_key': settings.CLOUDINARY_STORAGE['API_KEY'],
            'cloud_name': settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
            'folder': 'gym_gallery'
        })
        
        
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist() # This invalidates the token in the DB
            return Response({"detail": "Successfully logged out."}, status=200)
        except Exception:
            return Response({"detail": "Invalid token."}, status=400)
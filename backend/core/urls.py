from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SiteInfoViewSet, TestimonialViewSet, edit_site_info
from .views import (GymGalleryListCreateView, GymGalleryDeleteView,
                    CloudinarySignatureView, LogoutView, LiveUpdatesViewSet,
                    EventsViewSet)
# 1. Register ViewSets with the Router
router = DefaultRouter()
router.register(r"site_info", SiteInfoViewSet, basename="site_info")
router.register(r"testimonials", TestimonialViewSet, basename="testimonials")
router.register(r'live-updates', LiveUpdatesViewSet, basename='liveupdates')
router.register(r'events', EventsViewSet, basename='events')

# 2. Define URL patterns explicitly
urlpatterns = [
    # Function-based views must be added here, not in the router
    path('edit/', edit_site_info, name='edit_site_info'),
    path("gallery/", GymGalleryListCreateView.as_view(), name="gym-gallery"),
    path("gallery/<int:pk>/", GymGalleryDeleteView.as_view(), name="gym-gallery-delete"),
    path('cloudinary-signature/', CloudinarySignatureView.as_view(), name='cloudinary-signature'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]

# 3. Append router URLs to urlpatterns
urlpatterns += router.urls
from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from core.auth import CustomTokenObtainPairView, CustomTokenRefreshView
from core.views import home
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("core.urls")),
    path("", home, name="home"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.contrib import admin


from .models import (
    SiteInfo,
    GymGallery,
    LiveUpdates,
    LiveUpdateFiles,
    Events,
    EventFiles,
)


admin.site.register(SiteInfo)

# =========================
# Gym Gallery Admin
# =========================
@admin.register(GymGallery)
class GymGalleryAdmin(admin.ModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)
    list_per_page = 20


# =========================
# Live Updates Admin
# =========================
class LiveUpdateFilesInline(admin.TabularInline):
    model = LiveUpdateFiles
    extra = 1


@admin.register(LiveUpdates)
class LiveUpdatesAdmin(admin.ModelAdmin):
    list_display = ("subject", "timestamp")
    search_fields = ("subject", "description")
    list_filter = ("timestamp",)
    ordering = ("-timestamp",)
    inlines = [LiveUpdateFilesInline]


# =========================
# Events Admin
# =========================
class EventFilesInline(admin.TabularInline):
    model = EventFiles
    extra = 1


@admin.register(Events)
class EventsAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "timestamp")
    search_fields = ("title", "location", "description")
    list_filter = ("timestamp",)
    ordering = ("-timestamp",)
    inlines = [EventFilesInline]


# =========================
# Register remaining models
# =========================
@admin.register(LiveUpdateFiles)
class LiveUpdateFilesAdmin(admin.ModelAdmin):
    list_display = ("live_update", "file")


@admin.register(EventFiles)
class EventFilesAdmin(admin.ModelAdmin):
    list_display = ("event", "file")

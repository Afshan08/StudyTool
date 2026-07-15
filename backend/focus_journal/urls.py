from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('tracker.urls')),
]

# Serve media files in all environments (Django handles it directly)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve the React SPA index.html for any non-API route.
# This must be last so it doesn't shadow API routes.
# WhiteNoise handles the JS/CSS/assets; this only serves the HTML shell.
urlpatterns += [
    re_path(r'^(?!api/|admin/|media/|static/).*$', TemplateView.as_view(template_name='index.html'), name='spa-index'),
]

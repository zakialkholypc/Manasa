from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CourseViewSet, DigitalProductViewSet, 
    OrderViewSet, PaymentViewSet, VideoPlayerView,
    RegisterView, LoginView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'products', DigitalProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # Authentication URLs
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    
    # Video Player URLs
    path('lesson/<uuid:lesson_id>/video/', VideoPlayerView.as_view(), name='video-player'),
    # path('', VideoPlayerView.as_view(), name='video-player'),
] 
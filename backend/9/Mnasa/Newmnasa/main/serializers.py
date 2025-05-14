from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, DigitalProduct, Order, Payment, Lesson, Quiz, Question, Answer, Certificate, Announcement, FAQ

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'phone_number', 'profile_image', 'bio',
            'date_of_birth', 'language', 'is_instructor','is_student'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'password': {'write_only': True},
            'phone_number': {'required': False},
            'profile_image': {'required': False},
            'bio': {'required': False},
            'date_of_birth': {'required': False},
            'language': {'required': False}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number'),
            is_instructor=validated_data.get('is_instructor', False),
            is_student=not validated_data.get('is_instructor', False)
        )
        return user

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'promo_video': {'required': False, 'allow_null': True}
        }
class DigitalProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    
    class Meta:
        model = DigitalProduct
        fields = ['id', 'title', 'description', 'price', 'seller', 'file', 'thumbnail', 'created_at', 'updated_at', 'is_published']
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    product = DigitalProductSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'course', 'product', 'amount', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'payment_method', 'transaction_id', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

# class LessonSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Lesson
#         fields = ['id', 'course', 'title', 'description', 'video', 'duration', 'order', 'is_free', 'created_at', 'updated_at']
#         read_only_fields = ['id', 'created_at', 'updated_at']
# class LessonSerializer(serializers.ModelSerializer):
#     video_url = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Lesson
#         fields = ['id', 'course', 'title', 'video_url', 'duration', 'order', 'is_preview']
    
#     def get_video_url(self, obj):
#         if obj.video:
#             return obj.video.url
#         return None
class LessonSerializer(serializers.ModelSerializer):
    video_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'title', 'content', 'lesson_type',
            'is_preview', 'video', 'video_info', 'duration',
            'order', 'created_at'
        ]
        read_only_fields = ['video_info', 'created_at']
    
    def get_video_info(self, obj):
        if not obj.video_public_id:
            return None
            
        return {
            'duration': obj.video_duration,
            'public_id': obj.video_public_id,
            'is_uploaded': bool(obj.video)
        }
        
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'course', 'title', 'description', 'passing_score', 'time_limit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'question_type', 'points', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'text', 'is_correct', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CertificateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = ['id', 'user', 'course', 'issue_date', 'certificate_number', 'download_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'course', 'title', 'content', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'course', 'question', 'answer', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 
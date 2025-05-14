from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from .models import (
    Course, DigitalProduct, Order, Payment, Lesson, Enrollment, Quiz, Question,
    Answer, UserQuizAttempt, Certificate, Announcement, FAQ
)
from .serializers import (
    UserSerializer, CourseSerializer, DigitalProductSerializer,
    OrderSerializer, PaymentSerializer, LessonSerializer, QuizSerializer,
    QuestionSerializer, CertificateSerializer, AnnouncementSerializer,
    FAQSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser
import uuid
import hmac
import hashlib
import time
from datetime import datetime, timedelta
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
import io
import boto3
from botocore.exceptions import ClientError
import ffmpeg
import tempfile
from rest_framework.views import APIView
import jwt
import logging
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)
User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    # permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Course.objects.filter(is_published=True)
        return Course.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        course = self.get_object()
        lessons = course.lessons.all()
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

class DigitalProductViewSet(viewsets.ModelViewSet):
    queryset = DigitalProduct.objects.all()
    serializer_class = DigitalProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return DigitalProduct.objects.filter(is_published=True)
        return DigitalProduct.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        order = self.get_object()
        # Here you would integrate with your payment gateway
        # This is a placeholder for the actual payment processing
        payment = Payment.objects.create(
            order=order,
            amount=order.amount,
            payment_method=request.data.get('payment_method'),
            transaction_id=request.data.get('transaction_id'),
            status='completed'
        )
        order.status = 'completed'
        order.save()
        return Response(PaymentSerializer(payment).data)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(order__user=self.request.user)

class VideoProtectionService:
    def __init__(self):
        self.s3_client = None
        self.mediaconvert_client = None
        try:
            if all([
                settings.AWS_ACCESS_KEY_ID,
                settings.AWS_SECRET_ACCESS_KEY,
                settings.AWS_REGION
            ]):
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION
                )
                if settings.AWS_MEDIACONVERT_ENDPOINT:
                    self.mediaconvert_client = boto3.client(
                        'mediaconvert',
                        endpoint_url=settings.AWS_MEDIACONVERT_ENDPOINT,
                        region_name=settings.AWS_REGION
                    )
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {str(e)}")
            # لا نرفع الاستثناء هنا، بل نترك الخدمة تعمل بدون AWS

    def process_video(self, video_file, user_id, watermark_text):
        if not self.s3_client:
            raise Exception("AWS S3 client not initialized. Please check AWS credentials.")
            
        try:
            temp_dir = tempfile.mkdtemp()
            input_path = os.path.join(temp_dir, 'input.mp4')
            output_path = os.path.join(temp_dir, 'output.mp4')
            
            with open(input_path, 'wb') as f:
                f.write(video_file.read())
            
            self.add_watermark(input_path, output_path, watermark_text)
            
            s3_key = f'protected_videos/{user_id}/{uuid.uuid4()}.mp4'
            self.s3_client.upload_file(output_path, settings.AWS_STORAGE_BUCKET_NAME, s3_key)
            
            if self.mediaconvert_client:
                job = self.create_media_convert_job(s3_key)
                return job['Job']['Id']
            else:
                return s3_key
                
        except Exception as e:
            logger.error(f"Failed to process video: {str(e)}")
            raise
        finally:
            try:
                if os.path.exists(input_path):
                    os.remove(input_path)
                if os.path.exists(output_path):
                    os.remove(output_path)
                if os.path.exists(temp_dir):
                    os.rmdir(temp_dir)
            except Exception as e:
                logger.error(f"Failed to clean up temp files: {str(e)}")

    def add_watermark(self, input_path, output_path, text):
        try:
            stream = ffmpeg.input(input_path)
            stream = ffmpeg.drawtext(
                stream,
                text=text,
                fontfile=settings.FONT_PATH,
                fontsize=24,
                fontcolor='white',
                x='(w-text_w)-20',
                y='(h-text_h)-20',
                box=1,
                boxcolor='black@0.5',
                boxborderw=5
            )
            stream = ffmpeg.output(stream, output_path)
            ffmpeg.run(stream, overwrite_output=True)
        except Exception as e:
            logger.error(f"Failed to add watermark: {str(e)}")
            raise

    def create_media_convert_job(self, s3_key):
        try:
            job_settings = {
                'OutputGroups': [{
                    'Name': 'HLS Output',
                    'OutputGroupSettings': {
                        'HlsGroupSettings': {
                            'Destination': f's3://{settings.AWS_STORAGE_BUCKET_NAME}/protected_videos/',
                            'SegmentLength': 10,
                            'Encryption': {
                                'Mode': 'AES_128',
                                'KeyProviderSettings': {
                                    'StaticKeySettings': {
                                        'KeyFormat': 'identity',
                                        'KeyFormatVersions': '1',
                                        'StaticKeyValue': settings.VIDEO_ENCRYPTION_KEY
                                    }
                                }
                            }
                        }
                    }
                }],
                'Inputs': [{
                    'FileInput': f's3://{settings.AWS_STORAGE_BUCKET_NAME}/{s3_key}'
                }]
            }
            
            return self.mediaconvert_client.create_job(
                Role=settings.AWS_MEDIACONVERT_ROLE,
                Settings=job_settings
            )
        except Exception as e:
            logger.error(f"Failed to create media convert job: {str(e)}")
            raise

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Lesson, Enrollment
from .serializers import LessonSerializer
from .cloudinary_service import CloudinaryVideoService
import logging

logger = logging.getLogger(__name__)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        تحسين استعلام الدروس ليشمل فقط الدروس المسموح بها للمستخدم
        """
        user = self.request.user
        return Lesson.objects.filter(
            course__in=user.enrolled_courses.all()
        ).distinct() | Lesson.objects.filter(is_preview=True)

    @action(detail=True, methods=['post'])
    def upload_video(self, request, pk=None):
        """
        رفع فيديو جديد إلى Cloudinary وحفظ الرابط في قاعدة البيانات
        """
        lesson = self.get_object()
        
        # التحقق من أن المستخدم هو المدرب المسؤول عن الدورة
        if lesson.course.instructor != request.user:
            return Response(
                {'error': 'You are not authorized to upload videos for this course'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not request.FILES.get('video'):
            return Response(
                {'error': 'No video file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            video_file = request.FILES['video']
            
            # رفع الفيديو إلى Cloudinary مع إضافة علامة مائية
            watermark_text = f"User: {request.user.username}"
            upload_options = {
                'resource_type': 'video',
                'folder': f'course_{lesson.course.id}/lessons/',
                'transformation': [
                    {'overlay': {'font_family': 'arial', 'font_size': 20, 
                                 'text': watermark_text, 'gravity': 'south_east',
                                 'x': 20, 'y': 20, 'color': 'white'},
                     'effect': 'shadow:10'}
                ]
            }
            
            result = CloudinaryVideoService.upload_video(video_file, upload_options)
            
            # حفظ بيانات الفيديو في قاعدة البيانات
            lesson.video = result['secure_url']
            lesson.video_public_id = result['public_id']
            lesson.video_duration = result.get('duration', 0)
            lesson.save()
            
            return Response({
                'message': 'Video uploaded successfully',
                'data': {
                    'url': result['secure_url'],
                    'duration': result.get('duration'),
                    'format': result.get('format'),
                    'public_id': result['public_id']
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Video upload failed: {str(e)}")
            return Response(
                {'error': 'Failed to upload video', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def video_url(self, request, pk=None):
        """
        الحصول على رابط مؤقت وآمن للفيديو من Cloudinary
        """
        lesson = self.get_object()
        
        # التحقق من صلاحية الوصول
        if not lesson.is_preview:
            if not Enrollment.objects.filter(
                student=request.user,
                course=lesson.course,
                is_active=True
            ).exists():
                return Response(
                    {'error': 'You must enroll in this course to access the video'},
                    status=status.HTTP_403_FORBIDDEN
                )

        try:
            if not lesson.video_public_id:
                return Response(
                    {'error': 'Video not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # إنشاء رابط مؤقت مع خيارات التحكم
            video_url = CloudinaryVideoService.generate_secure_url(
                public_id=lesson.video_public_id,
                expiration=3600,  # صلاحية ساعة واحدة
                transformation=[
                    {'quality': 'auto', 'fetch_format': 'auto'},
                    {'flags': 'splice', 'overlay': {'font_family': 'arial', 
                                                   'font_size': 16,
                                                   'text': request.user.email,
                                                   'gravity': 'north_east',
                                                   'color': 'white'}}
                ]
            )
            
            return Response({
                'video_url': video_url,
                'expires_in': 3600,
                'duration': lesson.video_duration
            })
            
        except Exception as e:
            logger.error(f"Failed to generate video URL: {str(e)}")
            return Response(
                {'error': 'Failed to generate video URL', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'])
    def delete_video(self, request, pk=None):
        """
        حذف الفيديو من Cloudinary وقاعدة البيانات
        """
        lesson = self.get_object()
        
        # التحقق من الصلاحيات
        if lesson.course.instructor != request.user:
            return Response(
                {'error': 'You are not authorized to delete this video'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            if lesson.video_public_id:
                # حذف الفيديو من Cloudinary
                CloudinaryVideoService.delete_video(lesson.video_public_id)
                
                # تحديث قاعدة البيانات
                lesson.video = None
                lesson.video_public_id = None
                lesson.video_duration = None
                lesson.save()
                
                return Response(
                    {'message': 'Video deleted successfully'},
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response(
                    {'error': 'No video associated with this lesson'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            logger.error(f"Failed to delete video: {str(e)}")
            return Response(
                {'error': 'Failed to delete video', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        quiz = self.get_object()
        attempt = UserQuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=0,
            passed=False
        )
        return Response({"attempt_id": attempt.id})

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        answers = request.data.get('answers', [])
        
        # حساب النتيجة
        score = 0
        total_questions = quiz.questions.count()
        
        for answer in answers:
            question = Question.objects.get(id=answer['question_id'])
            selected_answer = Answer.objects.get(id=answer['answer_id'])
            if selected_answer.is_correct:
                score += question.points

        # تحديث محاولة الاختبار
        attempt = UserQuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            passed=score >= quiz.passing_score
        )

        # إصدار شهادة إذا نجح في الاختبار
        if attempt.passed:
            self.issue_certificate(request.user, quiz.lesson.course)

        return Response({
            "score": score,
            "total_questions": total_questions,
            "passed": attempt.passed
        })

    def issue_certificate(self, user, course):
        certificate = Certificate.objects.create(
            user=user,
            course=course,
            verification_code=str(uuid.uuid4())
        )
        return certificate

def video_player(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    video_url = get_video_url(lesson)  # قم بتنفيذ هذه الدالة
    return render(request, 'main/video_player.html', {
        'lesson': lesson,
        'video_url': video_url
    })

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return self.queryset.filter(course_id=course_id)
        return self.queryset.none()

class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return self.queryset.filter(course_id=course_id)
        return self.queryset.none()

class VideoPlayerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        try:
            lesson = get_object_or_404(Lesson, id=lesson_id)
            
            # التحقق من صلاحية الوصول للدرس
            if not lesson.is_preview:
                enrollment = Enrollment.objects.filter(
                    student=request.user,
                    course=lesson.course
                ).first()
                
                if not enrollment:
                    return Response(
                        {'error': 'يجب عليك الاشتراك في الدورة أولاً'},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # إنشاء توكن للوصول للفيديو
            token = self.get_video_token(request.user.id, lesson_id)
            video_url = f"{lesson.video_url}?token={token}"

            # تحديث تقدم المشاهدة
            if not lesson.is_preview:
                enrollment = Enrollment.objects.get(student=request.user, course=lesson.course)
                enrollment.last_accessed = timezone.now()
                enrollment.current_lesson = lesson
                enrollment.save()

            return render(request, 'main/video_player.html', {
                'lesson': lesson,
                'video_url': video_url,
                'user': request.user
            })
        except Exception as e:
            logger.error(f"Video player view failed: {str(e)}")
            return Response(
                {'error': 'حدث خطأ أثناء تحميل الفيديو'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_video_token(self, user_id, lesson_id):
        timestamp = int(time.time())
        data = f"{user_id}:{lesson_id}:{timestamp}"
        secret = settings.SECRET_KEY
        token = hmac.new(
            secret.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f"{token}:{timestamp}"

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

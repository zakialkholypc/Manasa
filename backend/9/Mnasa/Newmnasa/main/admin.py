from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, InstructorProfile, Category, Course, Lesson,
    Enrollment, Review, DigitalProduct, Order, Payment,
    Certificate, Quiz, Question, Answer, UserQuizAttempt,
    Announcement, FAQ
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'is_instructor', 'is_staff', 'is_student')
    list_filter = ('is_instructor', 'is_staff', 'is_superuser', 'is_student', 'email_verified')
    search_fields = ('username', 'email', 'phone_number')
    list_editable = ('is_instructor', 'is_staff', 'is_student')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'profile_image', 'bio', 'date_of_birth')}),
        ('Security', {'fields': ('email_verified', 'verification_token', 'last_login_ip')}),
        ('Preferences', {'fields': ('language',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_instructor', 'is_student', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'is_approved')
    list_filter = ('is_approved',)
    search_fields = ('user__username', 'specialization')
    raw_id_fields = ('user',)
    list_editable = ('is_approved',)
    actions = ['approve_instructors', 'disapprove_instructors']

    def approve_instructors(self, request, queryset):
        queryset.update(is_approved=True)
    approve_instructors.short_description = "Approve selected instructors"

    def disapprove_instructors(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_instructors.short_description = "Disapprove selected instructors"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    list_filter = ('parent',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ('parent',)

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'lesson_type', 'order', 'is_preview', 'duration')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'price', 'level', 'is_published', 'is_featured')
    list_filter = ('is_published', 'is_featured', 'category', 'level', 'language', 'created_at')
    search_fields = ('title', 'description', 'short_description')
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ('instructor', 'category')
    filter_horizontal = ('students',)
    list_editable = ('is_published', 'is_featured')
    date_hierarchy = 'created_at'
    inlines = [LessonInline]
    actions = ['publish_courses', 'unpublish_courses']

    def publish_courses(self, request, queryset):
        queryset.update(is_published=True)
    publish_courses.short_description = "Publish selected courses"

    def unpublish_courses(self, request, queryset):
        queryset.update(is_published=False)
    unpublish_courses.short_description = "Unpublish selected courses"

    fieldsets = (
        (None, {'fields': ('title', 'slug', 'description', 'short_description')}),
        ('Category and Instructor', {'fields': ('category', 'instructor', 'students')}),
        ('Pricing', {'fields': ('price', 'discount_price', 'currency')}),
        ('Educational Details', {'fields': ('language', 'level', 'prerequisites', 'learning_outcomes')}),
        ('Management', {'fields': ('max_students', 'is_published', 'is_featured')}),
        ('Media', {'fields': ('thumbnail', 'promo_video')}),
    )

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'lesson_type', 'order', 'duration', 'is_preview')
    list_filter = ('lesson_type', 'is_preview', 'course')
    search_fields = ('title', 'content')
    raw_id_fields = ('course',)
    ordering = ('course', 'order')
    list_editable = ('order', 'is_preview')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'progress', 'completed', 'enrolled_at')
    list_filter = ('completed', 'enrolled_at')
    search_fields = ('student__username', 'course__title')
    raw_id_fields = ('student', 'course', 'current_lesson')
    date_hierarchy = 'enrolled_at'

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at')
    search_fields = ('user__username', 'course__title', 'comment')
    raw_id_fields = ('user', 'course')
    list_editable = ('is_approved',)
    date_hierarchy = 'created_at'
    actions = ['approve_reviews', 'disapprove_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"

    def disapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_reviews.short_description = "Disapprove selected reviews"

@admin.register(DigitalProduct)
class DigitalProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'price', 'download_limit', 'is_published')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'description')
    raw_id_fields = ('seller',)
    list_editable = ('is_published',)
    date_hierarchy = 'created_at'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email', 'billing_email')
    raw_id_fields = ('user', 'course', 'product')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'payment_method', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order__user__username', 'transaction_id')
    raw_id_fields = ('order',)
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'issued_at', 'verification_code')
    list_filter = ('issued_at',)
    search_fields = ('user__username', 'course__title', 'verification_code')
    raw_id_fields = ('user', 'course')
    readonly_fields = ('verification_code',)
    date_hierarchy = 'issued_at'

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'question_type', 'order', 'points')
    list_filter = ('question_type', 'quiz')
    search_fields = ('text',)
    raw_id_fields = ('quiz',)
    inlines = [AnswerInline]
    list_editable = ('order', 'points')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'passing_score', 'time_limit')
    search_fields = ('title', 'description')
    raw_id_fields = ('lesson',)

@admin.register(UserQuizAttempt)
class UserQuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'passed', 'completed_at')
    list_filter = ('passed', 'completed_at')
    search_fields = ('user__username', 'quiz__title')
    raw_id_fields = ('user', 'quiz')
    readonly_fields = ('score', 'passed', 'completed_at')
    date_hierarchy = 'completed_at'

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content', 'course__title')
    raw_id_fields = ('course',)
    date_hierarchy = 'created_at'

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('question', 'answer', 'course__title')
    raw_id_fields = ('course',)
    list_editable = ('order',)

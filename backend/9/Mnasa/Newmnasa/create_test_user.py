import os
import django
import uuid
from datetime import date

# إعداد بيئة Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Newmnasa.settings')
django.setup()

from main.models import User

def create_test_user():
    try:
        # إنشاء مستخدم وهمي
        test_user = User.objects.create_user(
            username='test_user',
            email='test@example.com',
            password='test123456',
            phone_number='+201234567890',
            date_of_birth=date(1990, 1, 1),
            is_instructor=True,
            is_student=True,
            language='ar'
        )
        
        print(f"تم إنشاء المستخدم بنجاح:")
        print(f"Username: {test_user.username}")
        print(f"Email: {test_user.email}")
        print(f"Phone: {test_user.phone_number}")
        print(f"Date of Birth: {test_user.date_of_birth}")
        print(f"Is Instructor: {test_user.is_instructor}")
        print(f"Is Student: {test_user.is_student}")
        print(f"Language: {test_user.language}")
        
    except Exception as e:
        print(f"حدث خطأ: {str(e)}")

if __name__ == '__main__':
    create_test_user() 
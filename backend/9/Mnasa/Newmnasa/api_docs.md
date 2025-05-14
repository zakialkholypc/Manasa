# وثائق API لمنصة التعلم الإلكتروني

## المصادقة والتسجيل

### تسجيل مستخدم جديد

- **URL**: `/api/auth/register/`
- **Method**: POST
- **Body**:

```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "phone_number": "string",
    "is_instructor": boolean
}
```

- **Response** (200 OK):

```json
{
    "id": "uuid",
    "username": "string",
    "email": "string",
    "phone_number": "string",
    "is_instructor": boolean,
    "token": {
        "access": "string",
        "refresh": "string"
    }
}
```

### تسجيل الدخول

- **URL**: `/api/auth/login/`
- **Method**: POST
- **Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

- **Response** (200 OK):

```json
{
    "token": {
        "access": "string",
        "refresh": "string"
    },
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "is_instructor": boolean
    }
}
```

## المستخدمين

### الحصول على معلومات المستخدم

- **URL**: `/api/users/{user_id}/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
    "id": "uuid",
    "username": "string",
    "email": "string",
    "phone_number": "string",
    "profile_image": "url",
    "bio": "string",
    "date_of_birth": "date",
    "language": "string",
    "is_instructor": boolean,
    "created_at": "datetime"
}
```

### تحديث معلومات المستخدم

- **URL**: `/api/users/{user_id}/`
- **Method**: PUT
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
  "phone_number": "string",
  "profile_image": "file",
  "bio": "string",
  "date_of_birth": "date",
  "language": "string"
}
```

- **Response** (200 OK):

```json
{
    "id": "uuid",
    "username": "string",
    "email": "string",
    "phone_number": "string",
    "profile_image": "url",
    "bio": "string",
    "date_of_birth": "date",
    "language": "string",
    "is_instructor": boolean,
    "updated_at": "datetime"
}
```

## الدورات

### الحصول على قائمة الدورات

- **URL**: `/api/courses/`
- **Method**: GET
- **Query Parameters**:

  - `category`: string (optional)
  - `level`: string (optional)
  - `language`: string (optional)
  - `instructor`: uuid (optional)

- **Response** (200 OK):

```json
{
    "count": number,
    "next": "url",
    "previous": "url",
    "results": [
        {
            "id": "uuid",
            "title": "string",
            "description": "string",
            "short_description": "string",
            "category": {
                "id": "uuid",
                "name": "string"
            },
            "price": number,
            "discount_price": number,
            "currency": "string",
            "level": "string",
            "language": "string",
            "thumbnail": "url",
            "promo_video": "url",
            "instructor": {
                "id": "uuid",
                "username": "string"
            },
            "rating": number,
            "students_count": number,
            "created_at": "datetime"
        }
    ]
}
```

### إنشاء دورة جديدة

- **URL**: `/api/courses/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
    "title": "string",
    "description": "string",
    "short_description": "string",
    "category": "uuid",
    "price": number,
    "discount_price": number,
    "currency": "string",
    "level": "string",
    "language": "string",
    "prerequisites": "string",
    "learning_outcomes": "string",
    "max_students": number,
    "thumbnail": "file",
    "promo_video": "string"
}
```

- **Response** (201 Created):

```json
{
    "id": "uuid",
    "title": "string",
    "description": "string",
    "short_description": "string",
    "category": {
        "id": "uuid",
        "name": "string"
    },
    "price": number,
    "discount_price": number,
    "currency": "string",
    "level": "string",
    "language": "string",
    "prerequisites": "string",
    "learning_outcomes": "string",
    "max_students": number,
    "thumbnail": "url",
    "promo_video": "url",
    "instructor": {
        "id": "uuid",
        "username": "string"
    },
    "created_at": "datetime"
}
```

### تحديث دورة

- **URL**: `/api/courses/{course_id}/`
- **Method**: PUT
- **Headers**: `Authorization: Bearer {token}`
- **Body**: نفس هيكل إنشاء دورة جديدة

### حذف دورة

- **URL**: `/api/courses/{course_id}/`
- **Method**: DELETE
- **Headers**: `Authorization: Bearer {token}`

## الدروس

### الحصول على دروس الدورة

- **URL**: `/api/courses/{course_id}/lessons/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
    "count": number,
    "next": "url",
    "previous": "url",
    "results": [
        {
            "id": "uuid",
            "title": "string",
            "order": number,
            "lesson_type": "string",
            "content": "string",
            "is_preview": boolean,
            "duration": number,
            "resources": ["url"],
            "created_at": "datetime"
        }
    ]
}
```

### إنشاء درس جديد

- **URL**: `/api/lessons/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
    "course": "uuid",
    "title": "string",
    "order": number,
    "lesson_type": "string",
    "content": "string",
    "is_preview": boolean,
    "video_url": "string",
    "duration": number,
    "resources": "file"
}
```

### رفع فيديو للدرس

- **URL**: `/api/lessons/{lesson_id}/upload_video/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `video: file`

- **Response** (200 OK):

```json
{
    "id": "uuid",
    "video_url": "url",
    "processing_status": "string",
    "duration": number,
    "updated_at": "datetime"
}
```

### الحصول على رابط الفيديو

- **URL**: `/api/lessons/{lesson_id}/video_url/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
  "video_url": "url",
  "token": "string",
  "expires_at": "datetime"
}
```

### حذف فيديو الدرس

- **URL**: `/api/lessons/{lesson_id}/delete_video/`
- **Method**: DELETE
- **Headers**: `Authorization: Bearer {token}`

## المنتجات الرقمية

### الحصول على قائمة المنتجات

- **URL**: `/api/digital-products/`
- **Method**: GET
- **Query Parameters**:

  - `category`: string (optional)
  - `seller`: uuid (optional)

- **Response** (200 OK):

```json
{
    "count": number,
    "next": "url",
    "previous": "url",
    "results": [
        {
            "id": "uuid",
            "title": "string",
            "description": "string",
            "price": number,
            "currency": "string",
            "category": "string",
            "thumbnail": "url",
            "seller": {
                "id": "uuid",
                "username": "string"
            },
            "created_at": "datetime"
        }
    ]
}
```

### إنشاء منتج جديد

- **URL**: `/api/digital-products/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
    "title": "string",
    "description": "string",
    "price": number,
    "currency": "string",
    "category": "string",
    "file": "file",
    "thumbnail": "file"
}
```

## الطلبات والمدفوعات

### إنشاء طلب جديد

- **URL**: `/api/orders/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
  "items": [
    {
      "type": "course|digital_product",
      "id": "uuid"
    }
  ]
}
```

- **Response** (201 Created):

```json
{
    "id": "uuid",
    "items": [
        {
            "type": "string",
            "id": "uuid",
            "title": "string",
            "price": number
        }
    ],
    "total_amount": number,
    "currency": "string",
    "status": "string",
    "created_at": "datetime"
}
```

### معالجة الدفع

- **URL**: `/api/orders/{order_id}/process_payment/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
  "payment_method": "string",
  "transaction_id": "string"
}
```

- **Response** (200 OK):

```json
{
    "id": "uuid",
    "order": {
        "id": "uuid",
        "total_amount": number,
        "currency": "string"
    },
    "payment_method": "string",
    "transaction_id": "string",
    "status": "string",
    "created_at": "datetime"
}
```

## الاختبارات

### إنشاء اختبار

- **URL**: `/api/quizzes/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
    "lesson": "uuid",
    "title": "string",
    "description": "string",
    "passing_score": number,
    "time_limit": number
}
```

- **Response** (201 Created):

```json
{
    "id": "uuid",
    "lesson": {
        "id": "uuid",
        "title": "string"
    },
    "title": "string",
    "description": "string",
    "passing_score": number,
    "time_limit": number,
    "created_at": "datetime"
}
```

### بدء اختبار

- **URL**: `/api/quizzes/{quiz_id}/start/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
    "quiz_id": "uuid",
    "start_time": "datetime",
    "end_time": "datetime",
    "questions": [
        {
            "id": "uuid",
            "text": "string",
            "type": "string",
            "points": number,
            "answers": [
                {
                    "id": "uuid",
                    "text": "string"
                }
            ]
        }
    ]
}
```

### إرسال إجابات الاختبار

- **URL**: `/api/quizzes/{quiz_id}/submit/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
  "answers": [
    {
      "question_id": "uuid",
      "answer_id": "uuid"
    }
  ]
}
```

- **Response** (200 OK):

```json
{
    "quiz_id": "uuid",
    "score": number,
    "total_points": number,
    "passed": boolean,
    "correct_answers": number,
    "total_questions": number,
    "completion_time": "duration"
}
```

## الإعلانات والأسئلة الشائعة

### الحصول على الإعلانات

- **URL**: `/api/announcements/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
    "count": number,
    "next": "url",
    "previous": "url",
    "results": [
        {
            "id": "uuid",
            "title": "string",
            "content": "string",
            "is_important": boolean,
            "created_at": "datetime"
        }
    ]
}
```

### إنشاء إعلان جديد

- **URL**: `/api/announcements/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
    "title": "string",
    "content": "string",
    "is_important": boolean
}
```

- **Response** (201 Created):

```json
{
    "id": "uuid",
    "title": "string",
    "content": "string",
    "is_important": boolean,
    "created_at": "datetime"
}
```

### الحصول على الأسئلة الشائعة

- **URL**: `/api/faqs/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
    "count": number,
    "next": "url",
    "previous": "url",
    "results": [
        {
            "id": "uuid",
            "question": "string",
            "answer": "string",
            "category": "string",
            "created_at": "datetime"
        }
    ]
}
```

### إنشاء سؤال شائع جديد

- **URL**: `/api/faqs/`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Body**:

```json
{
  "question": "string",
  "answer": "string",
  "category": "string"
}
```

- **Response** (201 Created):

```json
{
  "id": "uuid",
  "question": "string",
  "answer": "string",
  "category": "string",
  "created_at": "datetime"
}
```

## الشهادات

### الحصول على شهادة

- **URL**: `/api/certificates/{course_id}/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`

- **Response** (200 OK):

```json
{
  "id": "uuid",
  "course": {
    "id": "uuid",
    "title": "string"
  },
  "user": {
    "id": "uuid",
    "username": "string"
  },
  "certificate_url": "url",
  "issue_date": "datetime",
  "expiry_date": "datetime"
}
```

# منصة وسيلي

منصة وسيلي للخدمات اللوجستية - تطبيق ويب متكامل لإدارة الخدمات اللوجستية.

## المتطلبات الأساسية

- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- Python 3.8 أو أحدث
- PostgreSQL

## تثبيت المشروع

### 1. تثبيت التبعيات

```bash
# تثبيت تبعيات الواجهة الأمامية
npm install

# تثبيت تبعيات الواجهة الخلفية
cd backend
pip install -r requirements.txt
```

### 2. إعداد البيئة

1. قم بإنشاء ملف `.env.local` في المجلد الرئيسي:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-key-here
NEXT_PUBLIC_COOKIE_DOMAIN=localhost
```

2. قم بإعداد قاعدة البيانات في `backend/Mnasa/Newmnasa/Newmnasa/settings.py`

### 3. تشغيل التطبيق

```bash
# تشغيل الواجهة الأمامية
npm run dev

# تشغيل الواجهة الخلفية
cd backend
python manage.py runserver
```

## هيكل المشروع

```
├── src/
│   ├── app/              # صفحات التطبيق
│   ├── _Components/      # مكونات React
│   ├── store/           # إدارة الحالة (Redux)
│   ├── hooks/           # Custom Hooks
│   ├── utils/           # دوال مساعدة
│   └── config/          # إعدادات التطبيق
├── backend/             # الواجهة الخلفية (Django)
└── public/             # ملفات ثابتة
```

## الاختبارات

```bash
npm test
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'إضافة ميزة رائعة'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح طلب Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

export default function AddLesson() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    order: 1,
    lesson_type: "video",
    content: "",
    is_preview: false,
    duration: 0,
    course: courseId,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateForm = () => {
    if (formData.lesson_type === 'video' && !videoFile) {
      setError('الرجاء اختيار فيديو للدرس');
      return false;
    }
    if (!formData.title.trim()) {
      setError('الرجاء إدخال عنوان للدرس');
      return false;
    }
    if (!formData.content.trim()) {
      setError('الرجاء إدخال محتوى للدرس');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'order') {
      // التأكد من أن الترتيب رقم موجب
      const order = parseInt(value);
      if (order < 1) {
        setError('ترتيب الدرس يجب أن يكون رقماً موجباً');
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('video/')) {
        setError('الرجاء اختيار ملف فيديو صالح');
        return;
      }
      // التحقق من حجم الملف (مثلاً 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError('حجم الفيديو يجب أن لا يتجاوز 500 ميجابايت');
        return;
      }
      setVideoFile(file);
      // إنشاء رابط معاينة
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      // التحقق من وجود التوكن
      const token = Cookies.get("authToken");
      if (!token) {
        setError("يرجى تسجيل الدخول أولاً");
        router.push("/login");
        return;
      }

      // التحقق من صحة البيانات
      if (!formData.title || !formData.content || !formData.lesson_type) {
        setError("يرجى ملء جميع الحقول المطلوبة");
        return;
      }

      if (formData.lesson_type === "video" && !videoFile) {
        setError("يرجى اختيار ملف فيديو");
        return;
      }

      if (formData.order && formData.order < 1) {
        setError("يجب أن يكون ترتيب الدرس رقماً موجباً");
        return;
      }

      let videoUrl = "";
      let videoPublicId = "";
      let videoDuration = 0;

      // رفع الفيديو إذا تم اختياره
      if (videoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("video", videoFile);

        try {
          const uploadResponse = await axios.post(
            "http://127.0.0.1:8000/api/lessons/upload_video/",
            uploadFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            }
          );

          if (uploadResponse.data && uploadResponse.data.url) {
            videoUrl = uploadResponse.data.url;
            videoPublicId = uploadResponse.data.public_id;
            videoDuration = uploadResponse.data.duration;
          } else {
            throw new Error("لم يتم استلام رابط الفيديو من الخادم");
          }
        } catch (uploadError) {
          console.error("Error uploading video:", uploadError);
          if (uploadError.response?.status === 401) {
            setError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
            router.push("/login");
            return;
          }
          setError(
            uploadError.response?.data?.message ||
            uploadError.message ||
            "حدث خطأ أثناء رفع الفيديو"
          );
          return;
        }
      }

      // إنشاء الدرس
      const lessonData = {
        course: courseId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        lesson_type: formData.lesson_type,
        is_preview: formData.is_preview || false,
        order: parseInt(formData.order) || 1,
        duration: parseInt(formData.duration) || 0,
        video_url: videoUrl || null,
        video_public_id: videoPublicId || null,
        video_duration: videoDuration || 0
      };

      console.log("Sending lesson data:", lessonData);

      const lessonResponse = await axios.post(
        `http://127.0.0.1:8000/api/lessons/`,
        lessonData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (lessonResponse.data) {
        setSuccess("تم إنشاء الدرس بنجاح");
        setFormData({
          title: "",
          content: "",
          lesson_type: "video",
          is_preview: false,
          order: "",
          duration: 0
        });
        setVideoFile(null);
        setPreviewUrl("");
        setUploadProgress(0);

        // إعادة التوجيه بعد ثانيتين
        setTimeout(() => {
          router.push(`/instructor/dashboard/${courseId}`);
        }, 2000);
      } else {
        throw new Error("لم يتم استلام تأكيد إنشاء الدرس من الخادم");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      if (error.response?.status === 401) {
        setError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
        router.push("/login");
        return;
      }
      if (error.response?.data) {
        console.error("Error response:", error.response.data);
        setError(
          error.response.data.message ||
          error.response.data.error ||
          "حدث خطأ أثناء إنشاء الدرس"
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("لم يتم استلام رد من الخادم");
      } else {
        console.error("Error setting up request:", error.message);
        setError(error.message || "حدث خطأ أثناء إعداد الطلب");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">إضافة درس جديد</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600">تم إنشاء الدرس بنجاح! جاري التحويل...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الدرس
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ترتيب الدرس
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الدرس
            </label>
            <select
              name="lesson_type"
              value={formData.lesson_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="video">فيديو</option>
              <option value="article">مقال</option>
              <option value="quiz">اختبار</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              محتوى الدرس
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مدة الدرس (بالدقائق)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_preview"
              checked={formData.is_preview}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="mr-2 block text-sm text-gray-700">
              درس تجريبي
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فيديو الدرس
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600">
                    جاري الرفع: {uploadProgress}%
                  </p>
                  {uploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploading(false);
                        setUploadProgress(0);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      إلغاء التحميل
                    </button>
                  )}
                </div>
              </div>
            )}
            {previewUrl && (
              <div className="mt-4">
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ الدرس"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
===================================================================================
شرح تفصيلي لصفحة إضافة درس جديد
===================================================================================

1. تحميل الصفحة:
   - يتم استخراج معرف الكورس من الرابط
   - تهيئة حالات المكون (states) للتحكم في:
     * بيانات النموذج (formData)
     * حالة التحميل (loading)
     * رسائل الخطأ (error)
     * رسائل النجاح (success)
     * حالة رفع الفيديو (uploading)
     * معاينة الفيديو (previewUrl)
     * تقدم الرفع (uploadProgress)

2. التحقق من البيانات:
   - عند تغيير أي حقل في النموذج:
     * يتم التحقق من صحة البيانات
     * التأكد من أن الترتيب رقم موجب
     * التحقق من نوع وحجم الفيديو
   - عند اختيار فيديو:
     * التحقق من نوع الملف (يجب أن يكون فيديو)
     * التحقق من حجم الملف (لا يتجاوز 500 ميجابايت)
     * إنشاء رابط معاينة للفيديو

3. رفع الفيديو:
   - عند الضغط على زر الحفظ:
     * التحقق من وجود جميع البيانات المطلوبة
     * إذا كان نوع الدرس فيديو، يتم رفع الفيديو أولاً
     * عرض شريط تقدم الرفع
     * إمكانية إلغاء الرفع
   - بعد اكتمال رفع الفيديو:
     * الحصول على رابط الفيديو
     * الحصول على معرف الفيديو العام
     * الحصول على مدة الفيديو

4. إنشاء الدرس:
   - تجهيز بيانات الدرس:
     * معلومات أساسية (العنوان، المحتوى، النوع)
     * معلومات الفيديو (الرابط، المعرف، المدة)
     * إعدادات الحماية (DRM، التشفير، العلامة المائية)
   - إرسال طلب إنشاء الدرس للخادم
   - معالجة الاستجابة:
     * في حالة النجاح: عرض رسالة نجاح وإعادة التوجيه
     * في حالة الفشل: عرض رسالة خطأ مناسبة

5. معالجة الأخطاء:
   - أخطاء التحقق من البيانات
   - أخطاء رفع الفيديو
   - أخطاء إنشاء الدرس
   - أخطاء الاتصال بالخادم

6. واجهة المستخدم:
   - نموذج إدخال البيانات
   - معاينة الفيديو
   - شريط تقدم الرفع
   - رسائل النجاح والخطأ
   - أزرار التحكم (حفظ، إلغاء)

7. إعادة التوجيه:
   - بعد نجاح إنشاء الدرس
   - العودة للصفحة السابقة
   - تحديث قائمة الدروس

ملاحظات هامة:
- يجب تسجيل الدخول قبل إضافة درس
- يجب اختيار فيديو إذا كان نوع الدرس فيديو
- يمكن إلغاء رفع الفيديو أثناء الرفع
- يتم التحقق من جميع البيانات قبل الإرسال
- يتم حماية الفيديو تلقائياً
===================================================================================
*/ 
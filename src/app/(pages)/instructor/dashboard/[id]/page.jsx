"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import Hls from "hls.js";

export default function CourseDetails() {
  // استخراج معرف الكورس من الرابط
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  // حالات المكون
  const [courseData, setCourseData] = useState(null); // بيانات الكورس
  const [lessons, setLessons] = useState([]); // قائمة الدروس
  const [loading, setLoading] = useState(true); // حالة التحميل
  const [error, setError] = useState(null); // رسائل الخطأ
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoToken, setVideoToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // تحميل بيانات الكورس والدروس عند تحميل الصفحة
  useEffect(() => {
    fetchCourseData();
    // fetchLessons();
  }, [courseId]);

  // دالة جلب بيانات الكورس
  async function fetchCourseData() {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/courses/${courseId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCourseData(response.data);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError("فشل في جلب بيانات الكورس");
    } finally {
      setLoading(false);
    }
  }

  // دالة جلب الدروس
  // async function fetchLessons() {
  //   const token = Cookies.get("authToken");
  //   if (!token) {
  //     setError("يرجى تسجيل الدخول أولاً");
  //     return;
  //   }

  //   if (!courseId) {
  //     setError("معرف الكورس غير صالح");
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(`http://127.0.0.1:8000/api/lessons/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       params: {
  //         course_id: courseId,
  //       },
  //     });

  //     // معالجة البيانات المستلمة
  //     if (Array.isArray(response.data)) {
  //       // فلترة الدروس حسب الكورس
  //       const filteredLessons = response.data.filter(
  //         (lesson) => lesson.course === courseId
  //       );
  //       setLessons(filteredLessons);
  //     } else if (response.data.results) {
  //       // فلترة الدروس حسب الكورس
  //       const filteredLessons = response.data.results.filter(
  //         (lesson) => lesson.course === courseId
  //       );
  //       setLessons(filteredLessons);
  //     } else {
  //       setLessons([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching lessons:", error);
  //     if (error.response) {
  //       console.error("Error response:", error.response.data);
  //       setError(error.response.data.error || "فشل في جلب الدروس");
  //     } else if (error.request) {
  //       setError("لم يتم استلام رد من الخادم");
  //     } else {
  //       setError("حدث خطأ أثناء إعداد الطلب");
  //     }
  //     setLessons([]);
  //   }
  // }

  // دالة جلب فيديو الكورس
  const fetchCourseVideo = async () => {
    const token = Cookies.get("authToken");
    if (!token || !courseData) {
      console.log("No auth token or course data available");
      return;
    }

    try {
      console.log("Fetching course video for course:", courseId);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/courses/${courseId}/course_video/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Course video response:", response.data);

      if (response.data.error) {
        console.error("Server returned error:", response.data.error);
        setError(response.data.error);
        return;
      }

      if (!response.data.video_url) {
        console.error("Missing video URL in response:", response.data);
        setError("فشل في جلب بيانات الفيديو");
        return;
      }

      setVideoUrl(response.data.video_url);
      setVideoToken(response.data.token);
      console.log("Successfully set video URL and token");
    } catch (error) {
      console.error("Error fetching course video:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        setError(error.response.data.error || "فشل في جلب فيديو الكورس");
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("لم يتم استلام رد من الخادم");
      } else {
        console.error("Error setting up request:", error.message);
        setError("حدث خطأ أثناء إعداد الطلب");
      }
    }
  };

  // تهيئة مشغل الفيديو
  useEffect(() => {
    if (videoUrl && videoToken && isClient) {
      console.log("Initializing video player with URL:", videoUrl);
      const video = document.getElementById("course-video");
      if (!video) {
        console.error("Video element not found");
        return;
      }

      if (Hls.isSupported()) {
        console.log("Using HLS.js for video playback");
        const hls = new Hls({
          xhrSetup: function (xhr) {
            xhr.setRequestHeader("Authorization", `Bearer ${videoToken}`);
          },
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          console.log("HLS manifest parsed, starting playback");
          video.play();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          console.error("HLS error:", data);
          if (data.fatal) {
            setError("حدث خطأ أثناء تشغيل الفيديو");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("Using native HLS support");
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", function () {
          console.log("Video metadata loaded, starting playback");
          video.play();
        });
      } else {
        console.error("HLS not supported");
        setError("متصفحك لا يدعم تشغيل هذا الفيديو");
      }
    }
  }, [videoUrl, videoToken, isClient]);

  function handleSeeLesson(lessonid) {
    console.log(lessonid);
  }

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // عرض رسالة عدم وجود بيانات
  if (!courseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">لم يتم العثور على بيانات الكورس</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* رأس الصفحة مع زر إضافة درس */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">تفاصيل الكورس</h1>
          <Link
            href={`/instructor/dashboard/${courseId}/add-lesson`}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة درس جديد
          </Link>
        </div>

        {/* معلومات الكورس */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* القسم الأيمن - معلومات الكورس */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                معلومات الكورس
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  <span className="font-medium">عنوان الكورس:</span>{" "}
                  {courseData.title}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">الوصف:</span>{" "}
                  {courseData.description}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">الفئة:</span>{" "}
                  {courseData.category?.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">المستوى:</span>{" "}
                  {courseData.level}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">اللغة:</span>{" "}
                  {courseData.language}
                </p>
              </div>
            </div>

            {/* التقييمات والإحصائيات */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                التقييمات والإحصائيات
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  <span className="font-medium">التقييم:</span>{" "}
                  {courseData.rating}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">عدد الطلاب:</span>{" "}
                  {courseData.students_count}
                </p>
              </div>
            </div>
          </div>

          {/* القسم الأيسر - الأسعار والوسائط */}
          <div className="space-y-4">
            {/* الأسعار */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                الأسعار
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  <span className="font-medium">السعر:</span> {courseData.price}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">سعر الخصم:</span>{" "}
                  {courseData.discount_price}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">العملة:</span>{" "}
                  {courseData.currency}
                </p>
              </div>
            </div>

            {/* الوسائط */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                الوسائط
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {/* الصورة المصغرة */}
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-2">
                    الصورة المصغرة:
                  </p>
                  <img
                    src={`https://res.cloudinary.com/di5y7hnub/${courseData.thumbnail}`}
                    alt="Course thumbnail"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                {/* فيديو العرض */}
                <div>
                  <p className="font-medium text-gray-700 mb-2">فيديو العرض:</p>
                  <video controls className="w-full rounded-lg">
                    <source
                      src={`https://res.cloudinary.com/di5y7hnub/${courseData.promo_video}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم الدروس */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الدروس</h2>
          {lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {lesson.lesson_type === "video"
                            ? "درس فيديو"
                            : "درس نصي"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSeeLesson(lesson.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">لا توجد دروس متاحة</p>
          )}
        </div>

        {/* مشغل الفيديو */}
        {isClient && (
          <div className="mt-8">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              <video
                id="course-video"
                controls
                className="w-full h-full"
                playsInline
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={videoUrl} type="application/x-mpegURL" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*
===================================================================================
شرح تفصيلي لصفحة تفاصيل الكورس
===================================================================================

1. تحميل الصفحة:
   - استخراج معرف الكورس من الرابط
   - تهيئة حالات المكون (states):
     * بيانات الكورس (courseData)
     * قائمة الدروس (lessons)
     * حالة التحميل (loading)
     * رسائل الخطأ (error)
   - تحميل بيانات الكورس والدروس تلقائياً

2. جلب بيانات الكورس:
   - التحقق من وجود توكن المصادقة
   - إرسال طلب للحصول على تفاصيل الكورس
   - معالجة الاستجابة:
     * تخزين بيانات الكورس
     * عرض رسالة خطأ في حالة الفشل
   - عرض شاشة التحميل أثناء جلب البيانات

3. جلب قائمة الدروس:
   - إرسال طلب للحصول على دروس الكورس
   - معالجة البيانات المستلمة:
     * التحقق من نوع البيانات (مصفوفة أو كائن)
     * تخزين الدروس في الحالة
   - عرض رسالة في حالة عدم وجود دروس

4. عرض تفاصيل الكورس:
   - معلومات أساسية:
     * عنوان الكورس
     * الوصف
     * الفئة
     * المستوى
     * اللغة
   - التقييمات والإحصائيات:
     * تقييم الكورس
     * عدد الطلاب
   - الأسعار:
     * السعر الأساسي
     * سعر الخصم
     * العملة
   - الوسائط:
     * الصورة المصغرة
     * فيديو العرض

5. إدارة الدروس:
   - عرض قائمة الدروس:
     * عنوان الدرس
     * نوع الدرس
     * مدة الدرس
     * حالة الدرس (تجريبي/غير تجريبي)
   - إمكانية حذف الدرس:
     * تأكيد الحذف
     * إرسال طلب الحذف
     * تحديث القائمة بعد الحذف

6. التنقل:
   - زر إضافة درس جديد
   - العودة للصفحة السابقة
   - تحديث الصفحة بعد التغييرات

7. معالجة الأخطاء:
   - أخطاء المصادقة
   - أخطاء جلب البيانات
   - أخطاء حذف الدرس
   - عرض رسائل خطأ مناسبة

8. واجهة المستخدم:
   - تصميم متجاوب
   - مؤشرات التحميل
   - رسائل النجاح والخطأ
   - تأكيد الحذف
   - عرض الوسائط

ملاحظات هامة:
- يجب تسجيل الدخول للوصول للصفحة
- يتم تحديث البيانات تلقائياً عند التغييرات
- يمكن حذف الدروس مع التأكيد
- يتم عرض جميع تفاصيل الكورس بشكل منظم
- يمكن إضافة دروس جديدة من خلال زر مخصص
===================================================================================
*/

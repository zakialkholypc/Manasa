"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import Hls from "hls.js";

export default function LessonView() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, lessonId } = params;

  // حالات المكون
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoToken, setVideoToken] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // دالة جلب بيانات الدرس
  const fetchLesson = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      console.log("Fetching lesson with ID:", lessonId);
      console.log("Course ID:", courseId);
      console.log("Auth Token:", token);

      const response = await axios.get(
        `http://127.0.0.1:8000/api/lessons/${lessonId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      console.log("Lesson response:", response.data);
      setLesson(response.data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        setError(error.response.data.error || "فشل في جلب بيانات الدرس");
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("لم يتم استلام رد من الخادم");
      } else {
        console.error("Error setting up request:", error.message);
        setError("حدث خطأ أثناء إعداد الطلب");
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة جلب توكن الفيديو
  const fetchVideoToken = async () => {
    const token = Cookies.get("authToken");
    if (!token || !lesson) {
      console.log("No auth token or lesson data available");
      return;
    }

    try {
      console.log("Fetching video token for lesson:", lessonId);
      console.log("Lesson data:", lesson);
      console.log("Auth Token:", token);

      const response = await axios.get(
        `http://127.0.0.1:8000/api/lessons/${lessonId}/get_video_token/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Video token response:", response.data);
      
      if (response.data.error) {
        console.error("Server returned error:", response.data.error);
        setError(response.data.error);
        return;
      }
      
      if (!response.data.token || !response.data.video_url) {
        console.error("Missing token or video URL in response:", response.data);
        setError("فشل في جلب بيانات الفيديو");
        return;
      }

      // التحقق من صحة رابط الفيديو
      if (!response.data.video_url.startsWith('http')) {
        console.error("Invalid video URL format:", response.data.video_url);
        setError("رابط الفيديو غير صالح");
        return;
      }

      setVideoToken(response.data.token);
      setVideoUrl(response.data.video_url);
      console.log("Successfully set video token and URL:", {
        token: response.data.token,
        videoUrl: response.data.video_url,
        publicId: response.data.public_id
      });
    } catch (error) {
      console.error("Error fetching video token:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        setError(error.response.data.error || "فشل في جلب توكن الفيديو");
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
    let hls = null;

    const initializeVideoPlayer = () => {
      if (!videoUrl || !videoToken || !isClient || !lesson || lesson.lesson_type !== 'video') {
        console.log("Video player initialization skipped:", {
          hasUrl: !!videoUrl,
          hasToken: !!videoToken,
          isClient,
          lessonType: lesson?.lesson_type
        });
        return;
      }

      console.log("Initializing video player with URL:", videoUrl);
      const video = document.getElementById("lesson-video");
      if (!video) {
        console.error("Video element not found");
        return;
      }

      if (Hls.isSupported()) {
        console.log("Using HLS.js for video playback");
        hls = new Hls({
          xhrSetup: function (xhr) {
            xhr.setRequestHeader("Authorization", `Bearer ${videoToken}`);
          },
          debug: true // تفعيل وضع التصحيح
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          console.error("HLS error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Network error:", data.details);
                hls.startLoad(); // إعادة المحاولة
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Media error:", data.details);
                hls.recoverMediaError(); // محاولة استعادة التشغيل
                break;
              default:
                console.error("Fatal error:", data.details);
                setError("حدث خطأ أثناء تشغيل الفيديو");
                break;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          console.log("HLS manifest parsed, starting playback");
          video.play().catch(error => {
            console.error("Error playing video:", error);
            setError("حدث خطأ أثناء تشغيل الفيديو");
          });
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("Using native HLS support");
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", function () {
          console.log("Video metadata loaded, starting playback");
          video.play().catch(error => {
            console.error("Error playing video:", error);
            setError("حدث خطأ أثناء تشغيل الفيديو");
          });
        });
      } else {
        console.error("HLS not supported");
        setError("متصفحك لا يدعم تشغيل هذا الفيديو");
      }
    };

    // تأخير قصير للتأكد من تحميل المكون بالكامل
    const timer = setTimeout(() => {
      initializeVideoPlayer();
    }, 100);

    // دالة التنظيف
    return () => {
      clearTimeout(timer);
      if (hls) {
        console.log("Destroying HLS instance");
        hls.destroy();
      }
    };
  }, [videoUrl, videoToken, isClient, lesson]);

  // تحميل بيانات الدرس عند تحميل الصفحة
  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  // جلب توكن الفيديو عند تحميل الدرس
  useEffect(() => {
    if (lesson) {
      fetchVideoToken();
    }
  }, [lesson]);

  // تعيين isClient عند تحميل المكون
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الدرس...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">لم يتم العثور على الدرس</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>نوع الدرس: {lesson.lesson_type}</span>
            <span>المدة: {lesson.duration} دقيقة</span>
            {lesson.is_preview && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                درس تجريبي
              </span>
            )}
          </div>
        </div>

        {/* مشغل الفيديو */}
        {lesson.lesson_type === "video" && isClient && (
          <div className="mb-8">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              <video
                id="lesson-video"
                controls
                className="w-full h-full"
                playsInline
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                preload="auto"
              >
                <source src={videoUrl} type="application/x-mpegURL" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* محتوى الدرس */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">محتوى الدرس</h2>
          <div className="prose max-w-none">
            {lesson.content}
          </div>
        </div>
      </div>
    </div>
  );
} 
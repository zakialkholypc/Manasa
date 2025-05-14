"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Cookies from "js-cookie";

const NewCourse = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [promoVideo, setPromoVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'thumbnail') {
      setThumbnail(file);
    } else if (type === 'promoVideo') {
      setPromoVideo(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!isClient) return;

      setLoading(true);
      const formData = new FormData();

      // إضافة البيانات النصية
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      // إضافة الملفات
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      if (promoVideo) {
        formData.append('promo_video', promoVideo);
      }

      // إضافة التوكن
      const token = Cookies.get('authToken');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      const response = await axios.post('http://127.0.0.1:8000/api/courses/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast.success('تم إنشاء الدورة بنجاح');
      console.log(response.data);
      router.push('/instructor/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('حدث خطأ أثناء إنشاء الدورة');
    } finally {
      setLoading(false);
    }
  };

  // if (!user || !user.is_instructor) {
  //   router.push("/");
  //   return null;
  // }

  if (!isClient) {
    return null; // أو يمكنك عرض شاشة تحميل
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">إنشاء دورة جديدة</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* العنوان */}
        <div>
          <label className="block text-sm font-medium mb-2">عنوان الدورة</label>
          <input
            type="text"
            {...register('title', { required: 'هذا الحقل مطلوب' })}
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* الوصف القصير */}
        <div>
          <label className="block text-sm font-medium mb-2">الوصف القصير</label>
          <textarea
            {...register('short_description', { required: 'هذا الحقل مطلوب' })}
            className="w-full p-2 border rounded"
            rows={3}
          />
          {errors.short_description && (
            <p className="text-red-500 text-sm mt-1">{errors.short_description.message}</p>
          )}
        </div>

        {/* الوصف الكامل */}
        <div>
          <label className="block text-sm font-medium mb-2">الوصف الكامل</label>
          <textarea
            {...register('description', { required: 'هذا الحقل مطلوب' })}
            className="w-full p-2 border rounded"
            rows={5}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* الصورة المصغرة */}
        <div>
          <label className="block text-sm font-medium mb-2">الصورة المصغرة</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'thumbnail')}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* الفيديو الترويجي */}
        <div>
          <label className="block text-sm font-medium mb-2">الفيديو الترويجي</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange(e, 'promoVideo')}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* معلومات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">السعر</label>
            <input
              type="number"
              {...register('price', { required: 'هذا الحقل مطلوب' })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">السعر بعد الخصم</label>
            <input
              type="number"
              {...register('discount_price')}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">العملة</label>
            <select
              {...register('currency', { required: 'هذا الحقل مطلوب' })}
              className="w-full p-2 border rounded"
            >
              <option value="USD">دولار أمريكي</option>
              <option value="EUR">يورو</option>
              <option value="EGP">جنيه مصري</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المستوى</label>
            <select
              {...register('level', { required: 'هذا الحقل مطلوب' })}
              className="w-full p-2 border rounded"
            >
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>
        </div>

        {/* شريط التقدم */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'جاري الحفظ...' : 'إنشاء الدورة'}
        </button>
      </form>
    </div>
  );
};

export default NewCourse; 
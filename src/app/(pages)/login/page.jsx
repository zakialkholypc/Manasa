"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/authApi";
import { setCredentials } from "@/store/authSlice";
import { useDispatch } from "react-redux";
import LoadingSpinner from './../../_Components/LoadingSpinner/LoadingSpinner';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();

  const initialValues = {
    username: "",
    password: "",
  };

  const validate = (values) => {
    const errors = {};
    if (!values.username.trim()) {
      errors.username = "اسم المستخدم مطلوب";
    }
    if (!values.password) {
      errors.password = "كلمة المرور مطلوبة";
    }
    return errors;
  };

  const onSubmit = async (values) => {
    if (isLocked) {
      setError("تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد 5 دقائق.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await login(values).unwrap();
      console.log('استجابة تسجيل الدخول:', response);
      
      if (!response || !response.token) {
        throw new Error('فشل تسجيل الدخول: لم يتم استلام بيانات صالحة');
      }
      
      dispatch(setCredentials(response));
      router.push("/");
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      setLoginAttempts(prev => prev + 1);
      
      if (loginAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 5 * 60 * 1000);
      }
      
      const errorMessage = err.data?.message || 
                          err.data?.detail || 
                          err.message || 
                          "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            تسجيل الدخول
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-foreground rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="اسم المستخدم"
                onChange={formik.handleChange}
                value={formik.values.username}
              />
              {formik.errors.username && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-foreground rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingSpinner from './../../_Components/LoadingSpinner/LoadingSpinner';

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const initialValues = {
    username: "",
    email: "",
    password: "",
    phone_number: "",
    is_instructor: false,
  };

  const validate = (values) => {
    const errors = {};
    const regex = {
      username: /^[a-zA-Z0-9_]{3,30}$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      phone: /^01[0-2,5]{1}[0-9]{8}$/,
      password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };

    if (!values.username.trim()) {
      errors.username = "اسم المستخدم مطلوب";
    } else if (!regex.username.test(values.username)) {
      errors.username = "صيغة اسم المستخدم غير صحيحة";
    }

    if (!values.email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!regex.email.test(values.email)) {
      errors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    if (!values.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (!regex.password.test(values.password)) {
      errors.password = "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم وحرف خاص";
    }

    if (!values.phone_number) {
      errors.phone_number = "رقم الهاتف مطلوب";
    } else if (!regex.phone.test(values.phone_number)) {
      errors.phone_number = "رقم هاتف مصري غير صحيح";
    }

    return errors;
  };

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        values
      );
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit,
  });

  const formFields = [
    {
      id: "username",
      label: "اسم المستخدم",
      type: "text",
      placeholder: "أدخل اسم المستخدم",
    },
    {
      id: "email",
      label: "البريد الإلكتروني",
      type: "email",
      placeholder: "أدخل البريد الإلكتروني",
    },
    {
      id: "password",
      label: "كلمة المرور",
      type: "password",
      placeholder: "أدخل كلمة المرور",
    },
    {
      id: "phone_number",
      label: "رقم الهاتف",
      type: "tel",
      placeholder: "أدخل رقم الهاتف",
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            إنشاء حساب جديد
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            تم التسجيل بنجاح! جاري التوجيه إلى صفحة تسجيل الدخول...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {formFields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`relative block w-full appearance-none rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                    formik.errors[field.id] && formik.touched[field.id]
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field.id]}
                />
                {formik.errors[field.id] && formik.touched[field.id] && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <input
              id="is_instructor"
              name="is_instructor"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              onChange={formik.handleChange}
              checked={formik.values.is_instructor}
            />
            <label htmlFor="is_instructor" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              هل أنت مدرب؟
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "جاري التسجيل..." : "تسجيل"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            لديك حساب بالفعل؟{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";
import React from 'react';
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            مرحباً بك في وسيلي
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            منصة متكاملة لخدمات النقل والتوصيل
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-3xl text-primary dark:text-yellow-500 mb-4">
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                توصيل سريع
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                خدمة توصيل سريعة وآمنة لجميع احتياجاتك
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-3xl text-primary dark:text-yellow-500 mb-4">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                أمان وموثوقية
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                نضمن لك خدمة آمنة وموثوقة في كل مرة
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-3xl text-primary dark:text-yellow-500 mb-4">
                <i className="fa-solid fa-headset"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                دعم فني
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                فريق دعم فني متاح على مدار الساعة
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

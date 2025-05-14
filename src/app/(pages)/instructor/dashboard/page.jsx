"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";

export default function InstructorDashboard() {
  const { user, handleLogout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.is_instructor) {
      router.push("/");
      return;
    }

    fetchCourses();
  }, [user]);

  async function fetchCourses() {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setCourses(response.data.filter((course) => course.instructor.id === user.id));
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }

  if (!user || !user.is_instructor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              لوحة تحكم المعلم
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">مرحباً، {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("courses")}
              className={`${
                activeTab === "courses"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              دوراتي
            </button>
            <button
              onClick={() => setActiveTab("new-course")}
              className={`${
                activeTab === "new-course"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              إنشاء دورة جديدة
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`${
                activeTab === "students"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              طلابي
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "courses" && (
            <div>
              <h2 className="text-lg font-medium text-gray-900">دوراتي</h2>
              {loading ? (
                <p>جاري التحميل...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white overflow-hidden shadow rounded-lg"
                      >
                        <div className="p-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {course.description || "وصف مختصر للدورة"}
                          </p>
                          <div className="mt-4">
                         
                              <Link
                                href={`/instructor/dashboard/${course.id}`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                عرض التفاصيل
                              </Link>
                            
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>لا توجد دورات متاحة</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "new-course" && (
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                إنشاء دورة جديدة
              </h2>
              <div className="mt-4">
                <Link
                  href="/instructor/courses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  إنشاء دورة جديدة
                </Link>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <h2 className="text-lg font-medium text-gray-900">طلابي</h2>
              <div className="mt-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {/* Student List will go here */}
                    <li className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            اسم الطالب
                          </p>
                          <p className="text-sm text-gray-500">
                            البريد الإلكتروني
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          مسجل في: 3 دورات
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

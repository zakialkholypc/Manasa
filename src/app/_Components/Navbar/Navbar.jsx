"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, logout } from "@/store/authSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href={"/"}>
          <div className="flex items-center gap-5">
            <i className="fa-solid fa-car-burst text-4xl text-primary dark:text-yellow-500"></i>
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-900 dark:text-white">
              وسيلي
            </span>
          </div>
        </Link>

        <div className="flex md:order-2 items-center space-x-3 md:space-x-0 rtl:space-x-reverse">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              type="button"
              className="text-white bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              تسجيل الخروج
            </button>
          ) : (
            <div className="flex flex-row font-medium">
              <Link
                href={"/login"}
                className={`block text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
                  isActive("/login") ? "md:dark:text-yellow-500" : ""
                }`}
              >
                تسجيل الدخول
              </Link>
              <span className="mx-2 text-gray-900 dark:text-white">/</span>
              <Link
                href={"/signup"}
                className={`block text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
                  isActive("/signup") ? "md:dark:text-yellow-500" : ""
                }`}
              >
                إنشاء حساب
              </Link>
            </div>
          )}

          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex cursor-pointer items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">فتح القائمة الرئيسية</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isOpen ? "" : "hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                href="/"
                className={`block py-2 px-3 rounded-sm md:p-0 ${
                  isActive("/")
                    ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-yellow-500"
                    : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-yellow-500"
                }`}
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <Link
                href="/instructor/courses/new"
                className={`block py-2 px-3 rounded-sm md:p-0 ${
                  isActive("/about")
                    ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-yellow-500"
                    : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-yellow-500"
                }`}
              >
                انشاء دورة
              </Link>
            </li>
            <li>
              <Link
                href="/instructor/dashboard"
                className={`block py-2 px-3 rounded-sm md:p-0 ${
                  isActive("/instructor/dashboard")
                    ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-yellow-500"
                    : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-yellow-500"
                }`}
              >
                الخدمات
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

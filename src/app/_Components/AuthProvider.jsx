"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/authSlice";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    // إذا كان مسجلاً دخولاً وحاول الوصول إلى login أو register
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      router.push("/");
    }
    // إذا لم يكن مسجلاً دخولاً وحاول الوصول إلى صفحة محمية
    else if (!isAuthenticated && pathname !== "/login" && pathname !== "/" && pathname !== "/signup") {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
} 
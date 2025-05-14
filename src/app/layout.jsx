"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import AuthProvider from "./_Components/AuthProvider";
import Navbar from "./_Components/Navbar/Navbar";
// تحميل الخطوط بشكل غير متزامن
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  useEffect(() => {
    // تعطيل Browsing Topics API
    if (typeof window !== "undefined") {
      window.chrome = window.chrome || {};
      window.chrome.privacy = window.chrome.privacy || {};
      window.chrome.privacy.websites = window.chrome.privacy.websites || {};
      window.chrome.privacy.websites.topicsEnabled = false;
    }
  }, []);

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground`}
      >
        <Provider store={store}>
          <AuthProvider>
            <Navbar />
            <div className="min-h-screen">
              <main className=" mx-auto pt-16 ">
                {children}
              </main>
            </div>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}

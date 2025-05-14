// store/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout, setError } from './authSlice';

// التحقق من وجود عنوان الخادم
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/';
if (!API_URL) {
  console.error('تحذير: لم يتم العثور على عنوان الخادم. يرجى إضافة NEXT_PUBLIC_API_URL في ملف .env.local');
}

// إضافة CSRF token للطلبات
const getCsrfToken = () => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return csrfToken;
};

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    // إضافة CSRF token
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }

    // إضافة التوكن
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // إضافة الرؤوس الأساسية
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    return headers;
  },
  credentials: 'include',
});

// معالجة تجديد التوكن التلقائي
const baseQueryWithReauth = async (args, api, extraOptions) => {
  try {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result?.error?.status === 401) {
      // محاولة تجديد التوكن
      const refreshToken = getState().auth.refreshToken;
      if (!refreshToken) {
        api.dispatch(logout());
        return result;
      }

      const refreshResult = await baseQuery(
        {
          url: 'auth/refresh/',
          method: 'POST',
          body: { refresh: refreshToken }
        },
        api,
        extraOptions
      );
      
      if (refreshResult?.data) {
        // تخزين التوكن الجديد
        api.dispatch(setCredentials(refreshResult.data));
        // إعادة المحاولة مع التوكن الجديد
        result = await baseQuery(args, api, extraOptions);
      } else {
        // تسجيل الخروج إذا فشل تجديد التوكن
        api.dispatch(logout());
      }
    }
    
    return result;
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return {
      error: {
        status: 'FETCH_ERROR',
        data: {
          message: 'حدث خطأ في الاتصال بالخادم',
          details: error.message
        }
      }
    };
  }
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        if (!response) {
          throw new Error("لم يتم استلام استجابة من الخادم");
        }

        // معالجة التنسيق الجديد للاستجابة
        const token = response.access || response.token;
        const user = response.user || response;

        if (!token) {
          throw new Error("لم يتم استلام التوكن من الخادم");
        }

        return {
          token,
          user
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          console.error('خطأ في تسجيل الدخول:', error);
          dispatch(setError(error.message));
        }
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'auth/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout/',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          console.error('خطأ في تسجيل الخروج:', error);
          dispatch(setError(error.message));
        }
      },
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: 'auth/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),
    getUser: builder.query({
      query: () => 'auth/user/',
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetUserQuery,
} = authApi;
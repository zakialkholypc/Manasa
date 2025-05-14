// hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { selectCurrentUser, selectIsAuthenticated, logout, setCredentials } from '@/store/authSlice';
import { useGetUserQuery } from '@/store/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: userData, error } = useGetUserQuery(undefined, {
    skip: !isAuthenticated
  });

  useEffect(() => {
    // إذا كان هناك مستخدم مسجل دخوله ولكن لا توجد بيانات مستخدم
    if (isAuthenticated && !user) {
      if (userData) {
        dispatch(setCredentials({ token: selectCurrentToken(store.getState()), user: userData }));
      } else if (error) {
        dispatch(logout());
      }
    }
  }, [isAuthenticated, user, userData, error, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return {
    user,
    isAuthenticated,
    handleLogout,
  };
};
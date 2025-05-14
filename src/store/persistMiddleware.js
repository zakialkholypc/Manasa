// store/persistMiddleware.js
export const persistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    
    if (action.type.startsWith('auth/')) {
      const { auth } = store.getState();
      if (typeof window !== 'undefined') {
        localStorage.setItem('authState', JSON.stringify(auth));
      }
    }
    
    return result;
  };
  
  // ثم أضفه في store.js
  export const store = configureStore({
    // ...
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(persistMiddleware),
  });
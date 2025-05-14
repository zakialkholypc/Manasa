export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  // يجب أن يبدأ بـ + ويتبعه أرقام
  const re = /^\+[0-9]{10,15}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
}; 
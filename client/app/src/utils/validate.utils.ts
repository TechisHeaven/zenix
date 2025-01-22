export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (pwd: string) => {
  const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/;
  return passwordRules.test(pwd);
};

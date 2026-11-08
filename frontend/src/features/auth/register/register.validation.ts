import type { RegisterFormValues } from "./register.types";

export function validateRegisterForm(
  values: RegisterFormValues,
): string | null {
  if (!values.name.trim()) {
    return "Введите имя";
  }

  if (!values.secondName.trim()) {
    return "Введите фамилию";
  }

  if (values.password.length < 8) {
    return "Пароль должен содержать минимум 8 символов";
  }

  if (values.password !== values.confirmPassword) {
    return "Пароли не совпадают";
  }

  return null;
}
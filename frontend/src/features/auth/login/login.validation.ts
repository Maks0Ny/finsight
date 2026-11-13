import type { LoginFormValues } from "./login.types";

export function validateLoginForm(
  values: LoginFormValues,
): string | null {
  if (!values.email.trim()) {
    return "Введите рабочую почту";
  }

  if (!values.password) {
    return "Введите пароль";
  }

  return null;
}

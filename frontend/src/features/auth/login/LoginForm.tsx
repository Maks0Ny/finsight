import {
  type FormEvent,
  useState,
} from "react";

import { Link } from "react-router";

import googleIcon from "../../../../assets/auth/google.svg";
import yandexIcon from "../../../../assets/auth/yandex.svg";

import { useLogin } from "./useLogin";
import { validateLoginForm } from "./login.validation";
import type {
  LoginFormValues,
  LoginRequest,
} from "./login.types";

import styles from "./LoginForm.module.css";

export function LoginForm() {
  const {
    login,
    isLoading,
    error: requestError,
  } = useLogin();

  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const values: LoginFormValues = {
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password")),
      remember: formData.get("remember") === "on",
    };

    const validationResult = validateLoginForm(values);

    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setValidationError("");
    setSuccessMessage("");

    const requestData: LoginRequest = {
      email: values.email,
      password: values.password,
    };

    const tokens = await login(requestData, values.remember);

    if (tokens) {
      setSuccessMessage("Вход выполнен. Сессия сохранена.");
    }
  }

  const displayedError = validationError || requestError;

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Добро пожаловать в FinSight
        </h1>

        <p className={styles.description}>
          Войдите, чтобы продолжить работу с вашими данными
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login_email_input">
            Рабочая почта
          </label>

          <input
            className={styles.input}
            id="login_email_input"
            type="email"
            name="email"
            placeholder="name@company.ru"
            autoComplete="email"
            maxLength={100}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login_password_input">
            Пароль
          </label>

          <input
            className={styles.input}
            id="login_password_input"
            type="password"
            name="password"
            placeholder="Введите пароль"
            autoComplete="current-password"
            required
          />
        </div>

        <div className={styles.options}>
          <label className={styles.remember}>
            <input
              className={styles.checkbox}
              type="checkbox"
              name="remember"
            />

            <span>Запомнить меня</span>
          </label>

          <Link className={styles.link} to="/forgot-password">
            Забыли пароль?
          </Link>
        </div>

        {displayedError && (
          <p className={styles.error} role="alert">
            {displayedError}
          </p>
        )}

        {successMessage && (
          <p className={styles.success} role="status">
            {successMessage}
          </p>
        )}

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Входим..." : "Войти"}
        </button>
      </form>

      <div className={styles.divider}>
        <span>или войдите через</span>
      </div>

      <div className={styles.providers}>
        <button className={styles.providerButton} type="button">
          <span className={styles.providerIconBox}>
            <img className={styles.providerIcon} src={yandexIcon} alt="" />
          </span>
          <span>Войти через Яндекс ID</span>
        </button>

        <button className={styles.providerButton} type="button">
          <span className={styles.providerIconBox}>
            <img className={styles.providerIcon} src={googleIcon} alt="" />
          </span>
          <span>Войти через Google Workspace</span>
        </button>
      </div>

      <footer className={styles.footer}>
        <p className={styles.registrationText}>
          Нет аккаунта?{" "}
          <Link className={styles.link} to="/register">
            Создать аккаунт компании
          </Link>
        </p>

        <aside className={styles.security}>
          <strong>Ваши данные защищены</strong>
          <p>
            Используем современные методы шифрования и корпоративные
            стандарты безопасности.
          </p>
        </aside>
      </footer>
    </section>
  );
}

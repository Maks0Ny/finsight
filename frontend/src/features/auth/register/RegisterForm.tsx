import {
  type FormEvent,
  useState,
} from "react";

import { Link, useNavigate } from "react-router";

import { useRegister } from "./useRegister";
import { validateRegisterForm } from "./register.validation";

import type {
  RegisterFormValues,
  RegisterRequest,
} from "./register.types";

import styles from "./RegisterForm.module.css";

export function RegisterForm() {
  const navigate = useNavigate(); {/* В отличие от компонента <Link>, который рендерит стандартную ссылку <a>, useNavigate позволяет перенаправлять пользователя */}

  const {
    register,
    isLoading,
    error: requestError,
  } = useRegister();

  const [validationError, setValidationError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const values: RegisterFormValues = {
      secondName: String(
        formData.get("second_name"),
      ).trim(),

      name: String(
        formData.get("name"),
      ).trim(),

      middleName: String(
        formData.get("middle_name"),
      ).trim(),

      email: String(
        formData.get("email"),
      ).trim(),

      password: String(
        formData.get("password"),
      ),

      confirmPassword: String(
        formData.get("confirm_password"),
      ),
    };

    const validationResult =
      validateRegisterForm(values);

    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setValidationError("");

    const requestData: RegisterRequest = {
      second_name: values.secondName,
      name: values.name,
      middle_name: values.middleName || null,
      email: values.email,
      password: values.password,
    };

    const registeredUser = await register(requestData);

    if (registeredUser) {
      navigate("/login", {
        replace: true,
      });
    }
  }

  const displayedError =
    validationError || requestError;

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Создайте аккаунт FinSight
        </h1>

        <p className={styles.description}>
          Зарегистрируйтесь, чтобы начать работу
          с вашими данными
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.nameGrid}>
          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="second_name_input"
            >
              Фамилия
            </label>

            <input
              className={styles.input}
              id="second_name_input"
              type="text"
              name="second_name"
              placeholder="Иванов"
              autoComplete="family-name"
              maxLength={50}
              required
            />
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="name_input"
            >
              Имя
            </label>

            <input
              className={styles.input}
              id="name_input"
              type="text"
              name="name"
              placeholder="Иван"
              autoComplete="given-name"
              maxLength={50}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="middle_name_input"
          >
            Отчество

            <span className={styles.optional}>
              Необязательно
            </span>
          </label>

          <input
            className={styles.input}
            id="middle_name_input"
            type="text"
            name="middle_name"
            placeholder="Иванович"
            autoComplete="additional-name"
            maxLength={50}
          />
        </div>

        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="register_email_input"
          >
            Рабочая почта
          </label>

          <input
            className={styles.input}
            id="register_email_input"
            type="email"
            name="email"
            placeholder="name@company.ru"
            autoComplete="email"
            maxLength={100}
            required
          />
        </div>

        <div className={styles.passwordGrid}>
          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="register_password_input"
            >
              Пароль
            </label>

            <input
              className={styles.input}
              id="register_password_input"
              type="password"
              name="password"
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="confirm_password_input"
            >
              Повторите пароль
            </label>

            <input
              className={styles.input}
              id="confirm_password_input"
              type="password"
              name="confirm_password"
              placeholder="Пароль ещё раз"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
            />
          </div>
        </div>

        <label className={styles.agreement}>
          <input
            className={styles.checkbox}
            type="checkbox"
            name="terms"
            required
          />

          <span>
            Я принимаю условия использования
            и политику конфиденциальности
          </span>
        </label>

        {displayedError && (
          <p
            className={styles.error}
            role="alert"
          >
            {displayedError}
          </p>
        )}

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Создаём аккаунт..."
            : "Создать аккаунт"}
        </button>
      </form>

      <footer className={styles.footer}>
        <p className={styles.loginText}>
          Уже есть аккаунт?{" "}

          <Link
            className={styles.loginLink}
            to="/login"
          >
            Войти
          </Link>
        </p>

        <aside className={styles.security}>
          <strong>Ваши данные защищены</strong>

          <p>
            Используем современные методы шифрования
            и корпоративные стандарты безопасности.
          </p>
        </aside>
      </footer>
    </section>
  );
}
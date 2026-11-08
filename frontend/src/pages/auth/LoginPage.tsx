import {AuthLayout} from "./layout/AuthLayout";

import yandexIcon from "../../../assets/auth/yandex.svg";
import googleIcon from "../../../assets/auth/google.svg";

export function LoginPage(){
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AuthLayout>
      <section className="auth-panel">
        <header className="auth-panel__header">
          <h1 className="auth-panel__title">
            Добро пожаловать в FinSight 
          </h1>

          <p className="auth-panel__description">
            Войдите, чтобы продолжить работу с вашими данными
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label
              className="form-field__label"
              htmlFor="email_input"
            >
              Рабочая почта
            </label>

            <input
              className="form-field__input"
              id="email_input"
              type="email"
              name="email"
              placeholder="name@company.ru"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label
              className="form-field__label"
              htmlFor="password_input"
            >
              Пароль
            </label>

            <input
              className="form-field__input"
              id="password_input"
              type="password"
              name="password"
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="auth-options">
            <label
              className="remember-option"
              htmlFor="remember_input"
            >
              <input
                className="remember-option__checkbox"
                id="remember_input"
                type="checkbox"
                name="remember"
              />

              Запомнить меня
            </label>

            <a className="auth-link" href="#">
              Забыли пароль?
            </a>
          </div>

          <button className="auth-button" type="submit">
            Войти
          </button>
        </form>

        <div className="auth-divider">
          <span>или войдите через</span>
        </div>

        <div className="provider-list">
          <button className="provider-button" type="button">
            <span className="provider-button__icon-box">
              <img
                className="provider-button__icon"
                src={yandexIcon}
                alt=""
              />
            </span>

            <span>Войти через Яндекс ID</span>
          </button>

          <button className="provider-button" type="button">
            <span className="provider-button__icon-box">
              <img
                className="provider-button__icon"
                src={googleIcon}
                alt=""
              />
            </span>

            <span>Войти через MAX</span>
          </button>
        </div>

        <footer className="auth-panel__footer">
          <p className="registration-link">
            Нет аккаунта?{" "}

            <a className="auth-link" href="#">
              Создать аккаунт компании
            </a>
          </p>

          <aside className="security-note">
            <strong>Ваши данные защищены</strong>

            <p>
              Используем современные методы шифрования
              и корпоративные стандарты безопасности.
            </p>
          </aside>
        </footer>
      </section>
    </AuthLayout>
  );
}
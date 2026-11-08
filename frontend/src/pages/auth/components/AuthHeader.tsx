import brandMark from "../../../../assets/brand/finsight-mark.svg";

import { Link } from "react-router";

export function AuthHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        <img
          className="brand__mark"
          src={brandMark}
          alt=""
        />

        <span className="brand__text">
          <strong className="brand__name">
            FinSight - Финсигхт
          </strong>

          <span className="brand__description">
            Данные. Аналитика. Результаты.
          </span>
        </span>
      </a>

      <nav
        className="site-header__actions"
        aria-label="Действия пользователя"
      >
        <a
          className="site-header__link"
          href="mailto:support@finsight.ru"
        >
          Помощь
        </a>

        <Link className="site-header__button" to="/register">
          Создать аккаунт
        </Link>
      </nav>
    </header>
  );
}
import brandMark from "../../../../assets/brand/finsight-mark.svg";

import { Link } from "react-router";

export function AuthFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <img
          className="site-footer__mark"
          src={brandMark}
          alt=""
        />

        <div className="site-footer__brand-text">
          <strong>FinSight</strong>
          <span>© 2026. Все права защищены.</span>
        </div>
      </div>

      <nav
        className="site-footer__links"
        aria-label="Правовая информация"
      >
        <Link to="/privacy">
          Политика конфиденциальности
        </Link>
        
        <a href="#">Условия использования</a>
        <a href="#">Поддержка</a>
      </nav>
    </footer>
  );
}
import { NavLink } from "react-router";

import { OrganizationSwitcher } from "../../../../features/organization/select";
import { HeaderSearch } from "../../../../features/organization/search";
import { UserMenu } from "../../../../features/profile/user-menu";

import { HeaderBrand } from "./HeaderBrand";

import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <HeaderBrand />
        <OrganizationSwitcher />
      </div>

      <div className={styles.actions}>
        <NavLink className={styles.aboutLink} to="/about">
          О нас
        </NavLink>

        <HeaderSearch />
        <UserMenu />
      </div>
    </header>
  );
}

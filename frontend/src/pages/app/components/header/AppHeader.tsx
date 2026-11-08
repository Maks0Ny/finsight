import { OrganizationSwitcher } from "../../../../features/organization/select";
import { HeaderSearch } from "../../../features/search/header";
import { NotificationsMenu } from "../../../features/notifications/menu";
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
        <HeaderSearch />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
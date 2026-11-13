import { Outlet } from "react-router";

import { AppHeader } from "../../../pages/app/components/header/AppHeader";
import { AppSidebar } from "../../../pages/app/components/sidebar/AppSidebar";

import styles from "./AppLayout.module.css";

export function AppLayout() {
  return (
    <div className={styles.app}>
      <AppHeader />

      <div className={styles.body}>
        <AppSidebar />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
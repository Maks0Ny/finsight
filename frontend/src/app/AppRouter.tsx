import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router";

import { AppLayout} from "../pages/app/layout/AppLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { AboutPage } from "../pages/about/AboutPage";
import { PrivacyPage } from "../pages/legal/PrivacyPage";

import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { DatasetPage } from "../pages/dataset/DatasetPage";
import { TransactionsPage } from "../pages/transactions/TransactionsPage";
import { TeamPage } from "../pages/team/TeamPage";

export function AppRouter() {
  return (
    <BrowserRouter> {/* Позволяет переключать React-страницы без полной перезагрузки сайта */}
      <Routes> {/* Контейнер со всеми доступными маршрутами*/}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />
        
        <Route
          path="/privacy"
          element={<PrivacyPage />}
        />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/datasets" element={<DatasetPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Route>

        
        <Route
          path="*" 
          element={<Navigate to="/login" replace />}
        /> {/*Любой неизвестный адрес*/}

      </Routes>
    </BrowserRouter>
  );
}
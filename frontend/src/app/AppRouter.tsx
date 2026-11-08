import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router";

import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

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
          path="*" 
          element={<Navigate to="/login" replace />}
        /> {/*Любой неизвестный адрес*/}
      </Routes>
    </BrowserRouter>
  );
}
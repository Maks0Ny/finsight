import { LoginForm } from "../../features/auth/login";

import { AuthLayout } from "./layout/AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

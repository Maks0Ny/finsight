import { RegisterForm } from "../../features/auth/register/RegisterForm";
import { AuthLayout } from "./layout/AuthLayout";

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
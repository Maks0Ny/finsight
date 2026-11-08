import type {ReactNode} from "react";

import {AuthHeader} from "../components/AuthHeader";
import {AuthFooter} from "../components/AuthFooter";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout(props: AuthLayoutProps) {
  
  const children = props.children;

  return (
    <div className="auth-page">
      <AuthHeader />

      <main className="auth-main">{children}</main>

      <AuthFooter />
    </div>
  );
}
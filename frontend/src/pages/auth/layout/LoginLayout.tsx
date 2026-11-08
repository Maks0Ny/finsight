import type {ReactNode} from "react";

import {AuthHeader} from "../components/AuthHeader";
import {AuthFooter} from "../components/AuthFooter";

type RegisterLayoutProps = {
  children: ReactNode;
};

export function RegisterLayout(props: RegisterLayoutProps) {
  
  const children = props.children;

  return (
    <div className="auth-page">
      <AuthHeader />

      <main className="auth-main">{children}</main>

      <AuthFooter />
    </div>
  );
}
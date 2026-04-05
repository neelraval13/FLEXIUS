// src/app/login/page.tsx
import type React from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

const LoginPage: React.FC = () => {
  return <LoginForm />;
};

export default LoginPage;

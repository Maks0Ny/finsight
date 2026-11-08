import { useState } from "react";

import { registerUser } from "./register.api";
import { REGISTER_ERRORS } from "./register.errors";
import type { RegisterRequest } from "./register.types";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function register(data: RegisterRequest) {
    setIsLoading(true);
    setError("");

    try {
      return await registerUser(data);
    } 
    catch {
      setError(REGISTER_ERRORS.unknown);
      return null;
    } 
    finally {
      setIsLoading(false);
    }
  }

  return {
    register,
    isLoading,
    error,
  };
}
import { useState } from "react";

import { ApiError } from "../../../shared/api/ApiError";
import { saveAuthTokens } from "../../../shared/api/authTokens";

import { loginUser } from "./login.api";
import { LOGIN_ERRORS } from "./login.errors";
import type { LoginRequest } from "./login.types";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(
    data: LoginRequest,
    remember: boolean,
  ) {
    setIsLoading(true);
    setError("");

    try {
      const tokens = await loginUser(data);
      saveAuthTokens(tokens, remember);
      return tokens;
    } catch (loginError) {
      if (
        loginError instanceof ApiError &&
        loginError.status === 401
      ) {
        setError(LOGIN_ERRORS.invalidCredentials);
      } else {
        setError(LOGIN_ERRORS.unknown);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    login,
    isLoading,
    error,
  };
}

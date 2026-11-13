import { httpClient } from "../../../shared/api/httpClient";

import type {
  LoginRequest,
  LoginResponse,
} from "./login.types";

export function loginUser(
  data: LoginRequest,
): Promise<LoginResponse> {
  return httpClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

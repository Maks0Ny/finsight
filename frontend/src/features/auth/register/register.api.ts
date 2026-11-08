import { httpClient } from "../../../shared/api/httpClient";
import type { User } from "../../../entities/user/user.types";
import type { RegisterRequest } from "./register.types";

export function registerUser(
  data: RegisterRequest,
): Promise<User> {
  return httpClient<User>("/users/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
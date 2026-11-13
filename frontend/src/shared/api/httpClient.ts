import { ApiError } from "./ApiError";
import { getAccessToken } from "./authTokens";

const API_BASE_URL = "/api";

export async function httpClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers,
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      "Ошибка запроса",
      response.status,
      data,
    );
  }

  return data as T;
}

import { ApiError } from "./ApiError";

const API_BASE_URL = "/api";

export async function httpClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
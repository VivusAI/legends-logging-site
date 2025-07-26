export const IS_DEV = import.meta.env.DEV;

type ApiResponse<T> = {
  status: string;
  data: T;
};

export class ApiError extends Error {
  constructor(error: string, errorMessage: string) {
    super(error);

    this.message = errorMessage;
  }
}

export async function fetchApi<T = unknown>(
  input: string | URL,
  init?: RequestInit,
): Promise<T | undefined> {
  try {
    const res = await fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      if (IS_DEV && res.status === 401) {
        window.location.href = "/auth";
      }

      const errorResponse = (await res.json()) as {
        error: string;
        message: string;
      };

      throw new ApiError(errorResponse.error, errorResponse.message);
    }

    const response = await res.json();
    return response.data ?? response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
}

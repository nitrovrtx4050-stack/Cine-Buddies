/**
 * Centralised API client for the future Spring Boot backend.
 *
 * The prototype runs entirely on mock implementations, so `request` is a
 * documented no-op stub: it exists so swapping `USE_MOCK_SERVICES` to false
 * and pointing VITE_API_BASE_URL at the Spring Boot host is the only change
 * required later. No real external service is called today.
 */

export const USE_MOCK_SERVICES = true;

const env = import.meta.env as Record<string, string | undefined>;
const API_BASE_URL: string = env["VITE_API_BASE_URL"] ?? "";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * REST request helper prepared for the Spring Boot endpoints.
 * Never called while USE_MOCK_SERVICES is true.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (USE_MOCK_SERVICES) {
    throw new ApiError(
      `Mock services are active; "${path}" was not sent over the network. ` +
        "Set USE_MOCK_SERVICES=false and configure VITE_API_BASE_URL to enable REST calls.",
    );
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed`, response.status);
  }
  return (await response.json()) as T;
}

/** Simulated network latency for the mock implementations. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

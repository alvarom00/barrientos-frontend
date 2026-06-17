type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

export type ApiInit = Omit<RequestInit, "body"> & {
  auth?: boolean;
  query?: Record<string, QueryValue | QueryValue[]>;
  body?: unknown;
};


const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, ""); // sin trailing slash

function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function buildUrl(path: string, query?: ApiInit["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`
  );
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach((i) => url.searchParams.append(k, String(i)));
      else url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function handle<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data: unknown = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    // Si expira sesión → a login
    if (res.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch {
        // localStorage may be unavailable in restricted browser contexts.
      }
      // Evita loops si ya estás en login
      if (!location.pathname.startsWith("/admin/login")) {
        location.replace("/admin/login");
      }
    }
    const jsonMessage =
      isJson &&
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : undefined;
    const message =
      jsonMessage ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return (isJson ? data : (data as unknown)) as T;
}

function toRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return body;
  }
  if (typeof Blob !== "undefined" && body instanceof Blob) return body;
  if (body instanceof ArrayBuffer) return body;
  if (ArrayBuffer.isView(body)) return body;
  return JSON.stringify(body);
}

export async function api<T = unknown>(
  path: string,
  method: HttpMethod = "GET",
  init: ApiInit = {}
): Promise<T> {
  const { auth = true, query, headers, body, ...rest } = init;

  const token = auth ? getToken() : null;

  const finalHeaders = new Headers(headers);

  // Si es FormData, no seteamos content-type (el browser lo hace)
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestBody = toRequestBody(body);
  if (!isFormData && body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers: finalHeaders,
    body: requestBody,
    ...rest,
  });

  return handle<T>(res);
}

// Shorthands
api.get = <T = unknown>(path: string, init?: ApiInit) => api<T>(path, "GET", init);
api.post = <T = unknown>(path: string, body?: unknown, init?: ApiInit) =>
  api<T>(path, "POST", { ...init, body });
api.put = <T = unknown>(path: string, body?: unknown, init?: ApiInit) =>
  api<T>(path, "PUT", { ...init, body });
api.del = <T = unknown>(path: string, init?: ApiInit) => api<T>(path, "DELETE", init);

export function abortable() {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
  };
}

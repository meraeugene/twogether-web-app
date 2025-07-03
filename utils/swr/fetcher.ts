export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Failed to fetch") as any;
    error.status = res.status;

    try {
      const data = await res.json();
      error.message = data?.message || "Unknown error";
      error.details = data;
    } catch {
      error.message = "Failed to parse error response.";
    }

    throw error;
  }

  const json = await res.json();
  return json as T;
}

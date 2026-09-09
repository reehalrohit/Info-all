const UPSTREAM_API_URL = process.env.UPSTREAM_API_URL;

export async function searchUpstream(query) {
  if (!UPSTREAM_API_URL) {
    throw new Error("UPSTREAM_API_URL is not configured");
  }

  const url = new URL(UPSTREAM_API_URL);

  url.searchParams.set("q", query);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Authorized-API-Gateway/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

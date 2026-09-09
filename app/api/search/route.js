import { NextResponse } from "next/server";
import { searchUpstream } from "../../../lib/api";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

const rateLimitStore = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || now - existing.start >= WINDOW_MS) {
    rateLimitStore.set(ip, {
      start: now,
      count: 1,
    });

    return true;
  }

  if (existing.count >= MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  return true;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^\d{10,15}$/.test(value);
}

export async function POST(request) {
  try {
    const expectedKey = process.env.API_KEY;

    if (!expectedKey) {
      console.error("API_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const suppliedKey = request.headers.get("x-api-key");

    if (!suppliedKey || suppliedKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ip = getClientIp(request);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    const body = await request.json();

    const type = String(body?.type || "").toLowerCase().trim();
    const query = String(body?.query || "").trim();

    if (!["phone", "email"].includes(type)) {
      return NextResponse.json(
        {
          error: "Invalid type. Supported types: phone, email",
        },
        { status: 400 }
      );
    }

    if (!query || query.length > 254) {
      return NextResponse.json(
        { error: "Invalid query" },
        { status: 400 }
      );
    }

    if (type === "phone" && !isValidPhone(query)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (type === "email" && !isValidEmail(query)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const result = await searchUpstream(query);

    return NextResponse.json(
      {
        success: true,
        type,
        data: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Search API error:", error.message);

    return NextResponse.json(
      {
        error: "Unable to process request",
      },
      { status: 500 }
    );
  }
        }

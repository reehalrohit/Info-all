"use client";

import { useState } from "react";

export default function Home() {
  const [type, setType] = useState("phone");
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          type,
          query,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Information API</h1>

      <p>
        Authorized API gateway for approved phone and email searches.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Search type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 6,
              marginBottom: 16,
            }}
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
          </select>
        </label>

        <label>
          Search value
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              type === "phone"
                ? "9876543210"
                : "name@example.com"
            }
            required
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 6,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />
        </label>

        <label>
          API key
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Enter your API key"
            required
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 6,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #cc0000",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <pre
          style={{
            marginTop: 24,
            padding: 16,
            overflowX: "auto",
            background: "#f5f5f5",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
      }

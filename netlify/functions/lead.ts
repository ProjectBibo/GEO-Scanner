import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  const rawAllowList = process.env.ORIGIN_ALLOWLIST ?? "";
  const allowedOrigins = rawAllowList
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = event.headers.origin || event.headers.Origin;
  const allowOrigin = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] ?? "*";

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const { url, email, company } = payload as {
      url?: string;
      email?: string;
      company?: string;
    };

    if (!url || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: "Vereiste velden ontbreken." }),
      };
    }

    console.log("Nieuwe lead:", { url, email, company });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, message: "Bedankt! We nemen contact op." }),
    };
  } catch (error) {
    console.error("Lead verwerking mislukt:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, message: "Er is iets misgegaan." }),
    };
  }
};

export { handler };

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function resolveRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || url.protocol.replace(":", "") || "https";
  const host = forwardedHost || request.headers.get("host") || url.host;
  return `${protocol}://${host}`;
}

// WhatsApp, Facebook and other crawlers require an absolute og:image URL.
// The route head is shared by client and server, so the relative path is
// upgraded to the real request origin only in the SSR response.
async function absolutizeSocialImage(response: Response, request: Request): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.clone().text();
  if (!html.includes('content="/og-jaika.jpg"')) return response;

  const imageUrl = `${resolveRequestOrigin(request)}/og-jaika.jpg`;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");

  return new Response(html.replaceAll('content="/og-jaika.jpg"', `content="${imageUrl}"`), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return await absolutizeSocialImage(normalized, request);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

export const boilerplateServices = {
  'hello-world': {
    'index.ts': `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/health") {
    return new Response(JSON.stringify({ status: "ok", service: "hello-world" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method === "POST" && path === "/call") {
    const body = await req.json();
    return new Response(JSON.stringify({
      success: true,
      message: "Hello from hello-world service!",
      received: body
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "3000");
  serve(handler, { port });
}
`
  },
  'echo-service': {
    'index.ts': `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/health") {
    return new Response(JSON.stringify({ status: "ok", service: "echo-service" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method === "POST" && path === "/call") {
    const body = await req.json();
    return new Response(JSON.stringify({
      success: true,
      echo: body,
      timestamp: nowISO()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "3000");
  serve(handler, { port });
}
`
  },
  'api-gateway': {
    'index.ts': `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/health") {
    return new Response(JSON.stringify({ status: "ok", service: "api-gateway" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method === "POST" && path === "/call") {
    const body = await req.json();
    const { endpoint, method = "GET", data } = body;

    try {
      const fetchOptions: RequestInit = {
        method: method,
        headers: { "Content-Type": "application/json" }
      };

      if (data) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, fetchOptions);
      const responseData = await response.json();

      return new Response(JSON.stringify({
        success: true,
        status: response.status,
        data: responseData
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "3000");
  serve(handler, { port });
}
`
  }
};

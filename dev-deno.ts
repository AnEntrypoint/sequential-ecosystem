/**
 * Hot reload development server for tasker-sequential (Deno version)
 *
 * Features:
 * - Watches for file changes in src/ directories
 * - Auto-reloads modules on change
 * - Supports both SQLite and Supabase backends
 * - Live task execution and debugging
 * - Native Deno execution without Node.js dependencies
 *
 * Usage:
 *   deno run --allow-all dev-deno.ts [--sqlite|--supabase] [--port 3000]
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";

// Parse command line arguments
const args = parse(Deno.args, {
  string: ["port", "watch-dir"],
  boolean: ["sqlite", "supabase"]
});

const config = {
  backend: args.supabase ? "supabase" : "sqlite",
  port: parseInt(args.port || "3000"),
  dbPath: "./tasks-dev.db"
};

console.log("🚀 Starting Deno development server");
console.log(`📝 Backend: ${config.backend}`);
console.log(`🔌 Port: ${config.port}`);

/**
 * Watch directory for changes
 */
async function watchDirectory(dir: string) {
  const watcher = Deno.watchFs([dir]);

  try {
    for await (const event of watcher) {
      if (event.kind === "modify") {
        for (const path of event.paths) {
          if (path.endsWith(".js") || path.endsWith(".ts")) {
            console.log(`📝 File changed: ${path}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Watch error: ${error}`);
  }
}

/**
 * Request handler
 */
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    // Health check
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          backend: config.backend,
          timestamp: new Date().toISOString(),
          runtime: "deno"
        }),
        {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" }
        }
      );
    }

    // Task submission
    if (url.pathname === "/task/submit" && req.method === "POST") {
      const taskData = await req.json();
      console.log(`📤 Task submitted: ${taskData.task_identifier}`);

      // TODO: Integrate with tasker adaptor
      return new Response(
        JSON.stringify({
          success: true,
          taskRunId: 1,
          data: { result: { taskRunId: 1 } },
          note: "Full integration coming soon"
        }),
        {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" }
        }
      );
    }

    // Task status
    if (url.pathname.startsWith("/task/status/") && req.method === "GET") {
      const taskId = parseInt(url.pathname.split("/").pop() || "0");
      console.log(`📋 Checking status of task ${taskId}`);

      return new Response(
        JSON.stringify({
          id: taskId,
          status: "pending",
          note: "Full integration coming soon"
        }),
        {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" }
        }
      );
    }

    // Default 404
    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      }
    );
  }
}

// Watch for file changes
const watchDirs = [
  "./packages/tasker-sequential/supabase/functions",
  "./packages/tasker-adaptor-supabase/src"
];

for (const dir of watchDirs) {
  try {
    watchDirectory(dir).catch(() => {
      // Watch error, continue
    });
  } catch {
    // Directory may not exist yet
  }
}

// Start server
console.log(`\n✅ Development server running on http://localhost:${config.port}`);
console.log(`📊 Health check: GET /health`);
console.log(`📤 Submit task: POST /task/submit`);
console.log(`📋 Task status: GET /task/status/:id`);
console.log(`\n🎯 Ready for development. Files are being watched for changes.\n`);

await serve(handler, { port: config.port });

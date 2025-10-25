/**
 * Fixed Bun dev server for tasker-sequential
 * Uses static imports instead of dynamic imports to work around module resolution issues
 *
 * Usage:
 *   bun dev-bun-fixed.ts [--sqlite|--supabase] [--port 3000]
 */

import { serve } from "bun";
import { watch } from "fs";

// Static imports - these will work with npm link
import { SQLiteAdapter } from "tasker-adaptor-sqlite";
import { SupabaseAdapter } from "tasker-adaptor-supabase";
import { TaskExecutor, StackProcessor, ServiceClient } from "tasker-adaptor";

interface Config {
  backend: "sqlite" | "supabase";
  port: number;
  dbPath: string;
}

// Parse command line arguments
const config: Config = {
  backend: "sqlite",
  port: 3000,
  dbPath: "./tasks-dev.db"
};

for (let i = 0; i < Bun.argv.length; i++) {
  if (Bun.argv[i] === "--sqlite") {
    config.backend = "sqlite";
  } else if (Bun.argv[i] === "--supabase") {
    config.backend = "supabase";
  } else if (Bun.argv[i] === "--port") {
    config.port = parseInt(Bun.argv[++i]);
  }
}

console.log("🚀 Starting Bun development server (Fixed)");
console.log(`📝 Backend: ${config.backend}`);
console.log(`🔌 Port: ${config.port}`);
console.log(`🎯 Runtime: Bun ${Bun.version}`);

// Watch directories for changes
const watchDirs = [
  "packages/tasker-sequential/supabase/functions",
  "packages/tasker-adaptor/src",
  config.backend === "sqlite"
    ? "packages/tasker-adaptor-sqlite/src"
    : "packages/tasker-adaptor-supabase/src"
];

console.log(`👁️  Watching: ${watchDirs.join(", ")}`);

// Watch for file changes
for (const dir of watchDirs) {
  try {
    watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith(".js") || filename.endsWith(".ts"))) {
        console.log(`📝 File changed: ${filename}`);
      }
    });
  } catch {
    // Directory may not exist yet
  }
}

// Request handler
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
          runtime: `Bun ${Bun.version}`,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" }
        }
      );
    }

    // Task submission
    if (url.pathname === "/task/submit" && req.method === "POST") {
      const taskData = await req.json() as any;
      console.log(`📤 Task submitted: ${taskData.task_identifier}`);

      try {
        // Create adapter based on backend
        let adapter: any;

        if (config.backend === "sqlite") {
          adapter = new SQLiteAdapter(config.dbPath);
        } else {
          adapter = new SupabaseAdapter(
            process.env.SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_KEY || "",
            process.env.SUPABASE_ANON_KEY || ""
          );
        }

        await adapter.init();

        // Create task run
        const taskRun = await adapter.createTaskRun({
          task_identifier: taskData.task_identifier,
          status: "pending",
          input: taskData.input
        });

        console.log(`✅ Task created: ID ${taskRun.id}`);

        await adapter.close();

        return new Response(
          JSON.stringify({
            success: true,
            taskRunId: taskRun.id,
            data: { result: { taskRunId: taskRun.id } }
          }),
          {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" }
          }
        );
      } catch (taskError) {
        console.error("Task creation error:", taskError);
        throw taskError;
      }
    }

    // Task status
    if (url.pathname.startsWith("/task/status/") && req.method === "GET") {
      const taskId = parseInt(url.pathname.split("/").pop() || "0");

      let adapter: any;

      if (config.backend === "sqlite") {
        adapter = new SQLiteAdapter(config.dbPath);
      } else {
        adapter = new SupabaseAdapter(
          process.env.SUPABASE_URL || "",
          process.env.SUPABASE_SERVICE_KEY || "",
          process.env.SUPABASE_ANON_KEY || ""
        );
      }

      await adapter.init();
      const taskRun = await adapter.getTaskRun(taskId);
      await adapter.close();

      if (!taskRun) {
        return new Response(
          JSON.stringify({ error: "Task not found" }),
          {
            status: 404,
            headers: { ...headers, "Content-Type": "application/json" }
          }
        );
      }

      return new Response(JSON.stringify(taskRun), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // List available endpoints
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          message: "Tasker Development Server",
          runtime: `Bun ${Bun.version}`,
          backend: config.backend,
          endpoints: {
            "GET /health": "Health check",
            "POST /task/submit": "Submit a new task",
            "GET /task/status/:id": "Get task status"
          }
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
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      }
    );
  }
}

// Start server
console.log(`\n✅ Development server starting on http://localhost:${config.port}`);
console.log(`📊 Health check: GET /health`);
console.log(`📤 Submit task: POST /task/submit`);
console.log(`📋 Task status: GET /task/status/:id`);
console.log(`\n🎯 Ready for development. Files are being watched for changes.\n`);

serve(
  {
    fetch: handler,
    port: config.port
  }
);

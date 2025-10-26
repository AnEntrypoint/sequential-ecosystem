/**
 * Bun dev server using local relative imports
 * This bypasses module resolution issues by directly importing from package directories
 *
 * Usage:
 *   bun dev-bun-local.ts [--sqlite|--supabase] [--port 3000]
 */

import { serve } from "bun";
import { watch } from "fs";

// Local imports - directly from package directories
import { SQLiteAdapter } from "./packages/tasker-adaptor-sqlite/src/index.js";
import { SupabaseAdapter } from "./packages/tasker-adaptor-supabase/src/adapters/supabase.js";
import { TaskExecutor, StackProcessor, ServiceClient } from "./packages/tasker-adaptor/src/index.js";

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

console.log("🚀 Starting Bun development server (Local Imports)");
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
        console.log(`📊 Task: ${JSON.stringify(taskRun)}`);

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

    // Store task function/code
    if (url.pathname === "/task/store-function" && req.method === "POST") {
      const { task_identifier, code, metadata } = await req.json() as any;

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
      await adapter.storeTaskFunction({
        identifier: task_identifier,
        code,
        metadata
      });
      await adapter.close();

      return new Response(
        JSON.stringify({ success: true, message: "Function stored" }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Execute or resume a task
    if (url.pathname.startsWith("/task/execute/") && req.method === "POST") {
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
      if (!taskRun) {
        await adapter.close();
        return new Response(
          JSON.stringify({ error: "Task not found" }),
          { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      const taskFunction = await adapter.getTaskFunction(taskRun.task_identifier);
      if (!taskFunction) {
        await adapter.close();
        return new Response(
          JSON.stringify({ error: "Task function not found" }),
          { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      const executor = new TaskExecutor(adapter);
      let result;

      if (taskRun.status === "pending") {
        result = await executor.execute(taskRun, taskFunction.code);
      } else {
        result = await executor.resume(taskRun, taskRun.input, taskFunction.code);
      }

      await adapter.close();

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Process pending stack runs (external service calls)
    if (url.pathname === "/task/process" && req.method === "POST") {
      try {
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
        const processor = new StackProcessor(adapter);
        await processor.processPending();
        await adapter.close();

        return new Response(
          JSON.stringify({ success: true, message: "Processed pending stack runs" }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Stack processing error:", errorMsg);
        console.error("Stack trace:", error instanceof Error ? error.stack : "");
        return new Response(
          JSON.stringify({ error: errorMsg }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
    }

    // Google API wrapper - execute Google Admin/Gmail API calls
    if ((url.pathname === "/wrappedgapi" || url.pathname === "/functions/v1/wrappedgapi") && req.method === "POST") {
      try {
        const { chain } = await req.json() as any;

        if (!chain || !Array.isArray(chain)) {
          return new Response(
            JSON.stringify({ error: "Invalid request: chain array required" }),
            { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
          );
        }

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

        // Get credentials from keystore
        const gapiKey = await adapter.getKeystore("GAPI_KEY");
        const adminEmail = await adapter.getKeystore("GAPI_ADMIN_EMAIL");

        if (!gapiKey) {
          await adapter.close();
          return new Response(
            JSON.stringify({ error: "Google API credentials (GAPI_KEY) not found in keystore" }),
            { status: 401, headers: { ...headers, "Content-Type": "application/json" } }
          );
        }

        // Import Google API wrapper
        const { GoogleAPIWrapper } = await import("./google-api-wrapper.js");
        const wrapper = new GoogleAPIWrapper(gapiKey, adminEmail);

        // Execute the chain of API calls
        let result: any = null;
        for (const call of chain) {
          const { property, args } = call;

          if (property === "admin.domains.list") {
            result = await wrapper.listDomains(args[0]?.customer || "my_customer");
          } else if (property === "admin.users.list") {
            const params = args[0] || {};
            result = await wrapper.listUsers(
              params.customer || "my_customer",
              params.domain,
              params.maxResults || 500,
              params.pageToken
            );
          } else if (property === "gmail.users.messages.list") {
            const params = args[0] || {};
            result = await wrapper.listMessages(
              params.userId || "me",
              params.q || "",
              params.maxResults || 10,
              params.pageToken
            );
          } else if (property === "gmail.users.messages.get") {
            const params = args[0] || {};
            result = await wrapper.getMessage(
              params.userId || "me",
              params.messageId
            );
          } else {
            await adapter.close();
            return new Response(
              JSON.stringify({ error: `Unknown API method: ${property}` }),
              { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
            );
          }
        }

        await adapter.close();

        return new Response(
          JSON.stringify({ result }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Google API error:", errorMsg);
        return new Response(
          JSON.stringify({ error: errorMsg }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
    }

    // Keystore - get credential
    if (url.pathname.startsWith("/task/keystore/") && req.method === "GET") {
      const key = url.pathname.split("/").pop();

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
      const value = await adapter.getKeystore(key);
      await adapter.close();

      if (!value) {
        return new Response(
          JSON.stringify({ success: false, error: "Key not found", key }),
          { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, key, value }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Keystore - set credential
    if (url.pathname === "/task/keystore" && req.method === "POST") {
      const { key, value } = await req.json() as any;

      if (!key || !value) {
        return new Response(
          JSON.stringify({ error: "key and value are required" }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

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
      await adapter.setKeystore(key, value);
      await adapter.close();

      return new Response(
        JSON.stringify({ success: true, message: `Stored ${key}` }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
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
            "POST /task/store-function": "Store task code/function",
            "POST /task/execute/:id": "Execute or resume a task",
            "POST /task/process": "Process pending stack runs (service calls)",
            "GET /task/status/:id": "Get task status",
            "GET /task/keystore/:key": "Get credential from keystore",
            "POST /task/keystore": "Set credential in keystore"
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

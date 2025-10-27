import { serve } from "bun";
import { watch } from "fs";
import { TaskExecutor, StackProcessor } from "./packages/tasker-adaptor/src/index.js";
import { createAdapter } from "./packages/tasker-adaptor/src/adapter-factory.js";

interface Config {
  backend: "sqlite" | "supabase";
  port: number;
  dbPath: string;
}

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

console.log("🚀 Starting Bun development server");
console.log(`📝 Backend: ${config.backend}`);
console.log(`🔌 Port: ${config.port}`);
console.log(`🎯 Runtime: Bun ${Bun.version}`);

const watchDirs = [
  "packages/tasker-sequential",
  "packages/tasker-adaptor/src",
  config.backend === "sqlite"
    ? "packages/tasker-adaptor-sqlite/src"
    : "packages/tasker-adaptor-supabase/src"
];

console.log(`👁️  Watching: ${watchDirs.join(", ")}`);

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

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

async function handleHealth(url: URL): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: "ok",
      backend: config.backend,
      runtime: `Bun ${Bun.version}`,
      timestamp: new Date().toISOString()
    }),
    { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
  );
}

async function handleTaskSubmit(req: Request): Promise<Response> {
  try {
    const taskData = await req.json() as any;
    console.log(`📤 Task submitted: ${taskData.task_identifier}`);

    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
    const taskRun = await adapter.createTaskRun({
      task_identifier: taskData.task_identifier,
      status: "pending",
      input: taskData.input
    });
    await adapter.close();

    console.log(`✅ Task created: ID ${taskRun.id}`);
    console.log(`📊 Task: ${JSON.stringify(taskRun)}`);

    return new Response(
      JSON.stringify({
        success: true,
        taskRunId: taskRun.id,
        data: { result: { taskRunId: taskRun.id } }
      }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Task creation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleTaskStatus(url: URL): Promise<Response> {
  try {
    const taskId = parseInt(url.pathname.split("/").pop() || "0");

    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
    const taskRun = await adapter.getTaskRun(taskId);
    await adapter.close();

    if (!taskRun) {
      return new Response(
        JSON.stringify({ error: "Task not found" }),
        { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(taskRun),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Task status error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleStoreFunction(req: Request): Promise<Response> {
  try {
    const { task_identifier, code, metadata } = await req.json() as any;

    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
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
  } catch (error) {
    console.error("Store function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleTaskExecute(url: URL, req: Request): Promise<Response> {
  try {
    const taskId = parseInt(url.pathname.split("/").pop() || "0");

    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
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
    const result = taskRun.status === "pending"
      ? await executor.execute(taskRun, taskFunction.code)
      : await executor.resume(taskRun, taskRun.input, taskFunction.code);

    await adapter.close();

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Task execute error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleTaskProcess(): Promise<Response> {
  try {
    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
    console.log("Processing pending stack runs...");

    const processor = new StackProcessor(adapter);
    await processor.processPending();

    await adapter.close();
    console.log("Stack processing completed");

    return new Response(
      JSON.stringify({ success: true, message: "Processed pending stack runs" }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Stack processing error:", errorMsg);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleKeystoreGet(url: URL): Promise<Response> {
  try {
    const key = url.pathname.split("/").pop();

    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
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
  } catch (error) {
    console.error("Keystore get error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleKeystoreSet(req: Request): Promise<Response> {
  try {
    const { key, value } = await req.json() as any;

    if (!key || !value) {
      return new Response(
        JSON.stringify({ error: "key and value are required" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const adapter = await createAdapter(config.backend, { dbPath: config.dbPath });
    await adapter.setKeystore(key, value);
    await adapter.close();

    return new Response(
      JSON.stringify({ success: true, message: `Stored ${key}` }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Keystore set error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

async function handleRoot(): Promise<Response> {
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
    { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
  );
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    if (url.pathname === "/health" && req.method === "GET") {
      return await handleHealth(url);
    }

    if (url.pathname === "/task/submit" && req.method === "POST") {
      return await handleTaskSubmit(req);
    }

    if (url.pathname.startsWith("/task/status/") && req.method === "GET") {
      return await handleTaskStatus(url);
    }

    if (url.pathname === "/task/store-function" && req.method === "POST") {
      return await handleStoreFunction(req);
    }

    if (url.pathname.startsWith("/task/execute/") && req.method === "POST") {
      return await handleTaskExecute(url, req);
    }

    if (url.pathname === "/task/process" && req.method === "POST") {
      return await handleTaskProcess();
    }

    if (url.pathname.startsWith("/task/keystore/") && req.method === "GET") {
      return await handleKeystoreGet(url);
    }

    if (url.pathname === "/task/keystore" && req.method === "POST") {
      return await handleKeystoreSet(req);
    }

    if (url.pathname === "/") {
      return await handleRoot();
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}

console.log(`\n✅ Development server starting on http://localhost:${config.port}`);
console.log(`📊 Health check: GET /health`);
console.log(`📤 Submit task: POST /task/submit`);
console.log(`📋 Task status: GET /task/status/:id`);
console.log(`\n🎯 Ready for development. Files are being watched for changes.\n`);

serve({
  fetch: handler,
  port: config.port
});

/**
 * Simple Stack Processor - Lightweight version for fast boot times
 *
 * Processes stack runs with minimal complexity to avoid worker timeouts
 * Uses unified service registry for all external calls to enable FlowState integration
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, log, createSupabaseClient } from './utils.ts';
import { cleanupStaleLocks } from './db-operations.ts';
import { processSingleStackRun, processStackRun } from './processor-core.ts';

const port = parseInt(Deno.env.get('PORT') || '8001', 10);

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Simple Stack Processor',
        version: '1.0.0',
        architecture: 'pure-http-chaining'
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const requestData = await req.json();

    await cleanupStaleLocks();

    if (requestData.stackRunId) {
      await processStackRun(requestData.stackRunId);
    } else if (requestData.trigger === 'process-next') {
      const result = await processSingleStackRun();

      return new Response(JSON.stringify({
        status: 'success',
        processed: result.processed,
        reason: result.reason,
        stackRunId: result.stackRunId
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({
        error: "Invalid request: must specify stackRunId or trigger=process-next"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      status: 'success'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    log("error", `Error in serve function: ${error instanceof Error ? error.message : String(error)}`);

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}, { port });

console.log(`🚀 Simple Stack Processor started successfully on port ${port}`);

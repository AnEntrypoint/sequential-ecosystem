import { nowISO } from '@sequential/sequential-utils/timestamps';

export const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
export const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
export const INTERNAL_URL = 'http://kong:8000';

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function log(level: string, message: string) {
  console.log(`[${nowISO()}] [${level.toUpperCase()}] [SIMPLE-STACK-PROCESSOR] ${message}`);
}

export async function createSupabaseClient() {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export function triggerStackProcessorAsync(): void {
  const triggerUrl = `${INTERNAL_URL}/functions/v1/simple-stack-processor`;
  log("info", `🔄 Triggering next stack processor cycle via ${triggerUrl}`);

  setTimeout(() => {
    const startTime = Date.now();
    fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ trigger: 'process-next' })
    }).then(response => {
      const duration = Date.now() - startTime;
      log("info", `✅ HTTP trigger completed: status=${response.status} duration=${duration}ms url=${triggerUrl}`);
      return response.text().then(text => {
        log("debug", `HTTP trigger response body: ${text.substring(0, 200)}`);
      });
    }).catch(error => {
      const duration = Date.now() - startTime;
      log("error", `❌ HTTP trigger FAILED after ${duration}ms: ${error instanceof Error ? error.message : String(error)} url=${triggerUrl} stack=${error instanceof Error ? error.stack : 'N/A'}`);
    });
  }, 0);
}

import { corsHeaders } from '../_shared/cors.ts'
import { nowISO } from '@sequential/sequential-utils/timestamps'
import logger from 'tasker-logging'
import { getAdminEmail, getCredentials } from './gapi-credentials.ts'
import { getCacheInfo, clearTokenCache } from './gapi-tokens.ts'

export async function handleEcho(body: any): Promise<Response> {
  return new Response(
    JSON.stringify({ echo: body.args[0] || {} }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

export async function handleTestGetStepData(body: any): Promise<Response> {
  const args = body.chain[1]?.args?.[0] || {};
  logger.debug('Test getStepData called', { args });

  return new Response(
    JSON.stringify({
      stepNumber: args.stepNumber,
      timestamp: args.timestamp,
      testData: `Step ${args.stepNumber} data`,
      responseAt: nowISO()
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

export async function handleCheckCredentials(): Promise<Response> {
  try {
    const adminEmail = await getAdminEmail();
    const creds = await getCredentials();

    return new Response(
      JSON.stringify({
        status: 'ok',
        adminEmail: adminEmail,
        clientEmail: creds.client_email,
        timestamp: nowISO()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: (error as Error).message,
        timestamp: nowISO()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export function handleGetTokenInfo(): Response {
  const tokenInfo = getCacheInfo();

  return new Response(
    JSON.stringify({
      tokens: tokenInfo,
      count: tokenInfo.length,
      timestamp: nowISO()
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

export function handleClearTokenCache(body: any): Response {
  const scope = body.args?.[0];

  if (scope) {
    clearTokenCache(scope);
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: `Cleared token cache for scope: ${scope}`,
        timestamp: nowISO()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } else {
    clearTokenCache();
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Cleared all token caches',
        timestamp: nowISO()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

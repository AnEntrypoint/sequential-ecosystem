import { BaseHttpHandler, createHealthCheckResponse } from "../_shared/http-handler.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { nowISO } from '@sequentialos/sequential-utils/timestamps'
import logger from 'tasker-logging'
import { getTokenCache } from './gapi-tokens.ts'
import { handleEcho, handleTestGetStepData, handleCheckCredentials, handleGetTokenInfo, handleClearTokenCache } from './gapi-debug-handlers.ts'
import { handleAdminDomainsList, handleAdminUsersList } from './gapi-admin-handlers.ts'
import { handleGmailMessagesList, handleGmailMessageGet } from './gapi-gmail-handlers.ts'

export class WrappedGapiHandler extends BaseHttpHandler {
  protected async routeHandler(req: Request, url: URL): Promise<Response> {
    if (url.pathname.endsWith('/health')) {
      return createHealthCheckResponse("wrappedgapi", "healthy", {
        cache_size: getTokenCache().size,
        timestamp: nowISO()
      });
    }

    try {
      logger.debug('About to read request body');
      const bodyText = await req.text().catch(() => '{"method":"unknown"}');
      logger.debug('Request body read successfully', { length: bodyText.length });
      const body = JSON.parse(bodyText);
      logger.debug('Request body parsed', { method: body?.method });

      if (body?.method === 'echo') return handleEcho(body);

      if (body?.chain?.[0]?.property === 'test' && body.chain[1]?.property === 'getStepData') {
        return handleTestGetStepData(body);
      }

      if (body?.method === 'checkCredentials') return handleCheckCredentials();
      if (body?.method === 'getTokenInfo') return handleGetTokenInfo();
      if (body?.method === 'clearTokenCache') return handleClearTokenCache(body);

      if (body?.chain?.[0]?.property === 'admin' && body.chain[1]?.property === 'domains' && body.chain[2]?.property === 'list') {
        return handleAdminDomainsList(body);
      }

      if (body?.chain?.[0]?.property === 'admin' && body.chain[1]?.property === 'users' && body.chain[2]?.property === 'list') {
        return handleAdminUsersList(body);
      }

      if (body?.chain?.[0]?.property === 'gmail' && body.chain[1]?.property === 'users' && body.chain[2]?.property === 'messages' && body.chain[3]?.property === 'list') {
        return handleGmailMessagesList(body);
      }

      if (body?.chain?.[0]?.property === 'gmail' && body.chain[1]?.property === 'users' && body.chain[2]?.property === 'messages' && body.chain[3]?.property === 'get') {
        return handleGmailMessageGet(body);
      }

      logger.debug('No direct implementation found for request, returning error');

      return new Response(
        JSON.stringify({
          error: `Unsupported Google API request. Supports: admin.domains.list, admin.users.list, gmail.users.messages.list, gmail.users.messages.get, echo, checkCredentials, getTokenInfo, clearTokenCache`,
          received_method: body?.method,
          received_chain: body?.chain?.map((item: any) => item.property),
          timestamp: nowISO()
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (error) {
      return this.handleError(error, 'Error in wrappedgapi');
    }
  }
}

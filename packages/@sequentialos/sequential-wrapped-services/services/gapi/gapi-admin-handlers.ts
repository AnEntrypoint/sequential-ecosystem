import { corsHeaders } from '../_shared/cors.ts'
import { nowISO } from '@sequentialos/sequential-utils/timestamps'
import logger from 'tasker-logging'
import { getAdminEmail } from './gapi-credentials.ts'
import { getAccessToken } from './gapi-tokens.ts'

export async function handleAdminDomainsList(body: any): Promise<Response> {
  try {
    const adminEmail = await getAdminEmail();
    const token = await getAccessToken(['https://www.googleapis.com/auth/admin.directory.domain.readonly']);

    const customerArgs = body.chain[2]?.args?.[0] || {};
    let customerId: string;

    if (customerArgs.customer) {
      customerId = customerArgs.customer === adminEmail ? 'my_customer' : encodeURIComponent(customerArgs.customer);
      if (customerArgs.customer === adminEmail) logger.debug('Converting admin email to my_customer');
    } else {
      customerId = 'my_customer';
    }

    logger.debug('Using customer ID', { customerId });

    const domainsUrl = `https://admin.googleapis.com/admin/directory/v1/customer/${customerId}/domains`;
    const response = await fetch(domainsUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    logger.debug('Reading Google API response body');
    const responseBody = await response.text();
    logger.debug('Response body read', { status: response.status });

    if (response.ok) {
      const data = JSON.parse(responseBody);
      logger.debug('Response parsed successfully');
      const cleanedResponse = { domains: data.domains || [] };
      logger.debug('Returning cleaned domains response', { count: cleanedResponse.domains.length });

      return new Response(
        JSON.stringify(cleanedResponse),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      logger.debug('API error response', { body: responseBody });
      throw new Error(`Google API returned ${response.status}: ${responseBody}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Domain list error: ${(error as Error).message}`,
        timestamp: nowISO()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function handleAdminUsersList(body: any): Promise<Response> {
  try {
    await getAdminEmail();
    const token = await getAccessToken(['https://www.googleapis.com/auth/admin.directory.user.readonly']);

    const usersArgs = body.chain[2]?.args?.[0] || {};
    const queryParams = new URLSearchParams();

    if (usersArgs.domain) queryParams.set('domain', usersArgs.domain);
    const maxResults = usersArgs.maxResults || 100;
    queryParams.set('maxResults', maxResults.toString());
    queryParams.set('customer', usersArgs.customer || 'my_customer');
    if (usersArgs.orderBy) queryParams.set('orderBy', usersArgs.orderBy);
    if (usersArgs.query) queryParams.set('query', usersArgs.query);
    if (usersArgs.showDeleted) queryParams.set('showDeleted', usersArgs.showDeleted.toString());
    if (usersArgs.viewType) queryParams.set('viewType', usersArgs.viewType);

    logger.debug('Listing users with params', { params: queryParams.toString() });

    const usersUrl = `https://admin.googleapis.com/admin/directory/v1/users?${queryParams.toString()}`;
    const response = await fetch(usersUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    logger.debug('Reading Google API response body');
    const responseBody = await response.text();
    logger.debug('Response body read', { status: response.status });

    if (response.ok) {
      const data = JSON.parse(responseBody);
      logger.debug('Response parsed successfully');
      const cleanedResponse = { users: data.users || [] };
      logger.debug('Returning cleaned users response', { count: cleanedResponse.users.length });

      return new Response(
        JSON.stringify(cleanedResponse),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      logger.debug('API error response', { body: responseBody });
      throw new Error(`Google API returned ${response.status}: ${responseBody}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `User list error: ${(error as Error).message}`,
        timestamp: nowISO()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

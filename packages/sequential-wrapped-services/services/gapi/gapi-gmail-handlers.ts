import { corsHeaders } from '../_shared/cors.ts'
import { nowISO } from '@sequentialos/sequential-utils/timestamps'
import logger from 'tasker-logging'
import { getAccessToken } from './gapi-tokens.ts'

export async function handleGmailMessagesList(body: any): Promise<Response> {
  try {
    const listArgs = body.chain[3]?.args?.[0] || {};
    const userId = listArgs.userId || 'me';

    const token = await getAccessToken([
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://mail.google.com/'
    ], userId);

    const queryParams = new URLSearchParams();
    if (listArgs.q) queryParams.set('q', listArgs.q);
    if (listArgs.maxResults) queryParams.set('maxResults', listArgs.maxResults.toString());
    if (listArgs.pageToken) queryParams.set('pageToken', listArgs.pageToken);
    if (listArgs.labelIds) queryParams.set('labelIds', listArgs.labelIds.join(','));

    logger.debug('Listing Gmail messages', { userId, params: queryParams.toString() });

    const messagesUrl = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(userId)}/messages?${queryParams.toString()}`;
    const response = await fetch(messagesUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    const responseBody = await response.text();
    logger.debug('Gmail API response', { status: response.status });

    if (response.ok) {
      const data = JSON.parse(responseBody);
      logger.debug('Gmail messages list success');
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      logger.debug('Gmail API error response', { body: responseBody });
      throw new Error(`Gmail API returned ${response.status}: ${responseBody}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Gmail messages list error: ${(error as Error).message}`,
        timestamp: nowISO()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function handleGmailMessageGet(body: any): Promise<Response> {
  try {
    const getArgs = body.chain[3]?.args?.[0] || {};
    const userId = getArgs.userId || 'me';
    const messageId = getArgs.id;

    if (!messageId) throw new Error('Message ID is required');

    const token = await getAccessToken([
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://mail.google.com/'
    ], userId);

    const queryParams = new URLSearchParams();
    if (getArgs.format) queryParams.set('format', getArgs.format);
    if (getArgs.metadataHeaders) queryParams.set('metadataHeaders', getArgs.metadataHeaders.join(','));

    logger.debug('Getting Gmail message', { messageId, userId, params: queryParams.toString() });

    const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}?${queryParams.toString()}`;
    const response = await fetch(messageUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    const responseBody = await response.text();
    logger.debug('Gmail API response', { status: response.status });

    if (response.ok) {
      const data = JSON.parse(responseBody);
      logger.debug('Gmail message get success');
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      logger.debug('Gmail API error response', { body: responseBody });
      throw new Error(`Gmail API returned ${response.status}: ${responseBody}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Gmail message get error: ${(error as Error).message}`,
        timestamp: nowISO()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

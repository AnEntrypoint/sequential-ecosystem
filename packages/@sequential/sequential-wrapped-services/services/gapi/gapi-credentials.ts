import { serviceRegistry } from '../_shared/service-registry.ts'
import logger from 'tasker-logging'

let cachedCreds: any = null;
let cachedAdminEmail: string | null = null;

export async function getCredentials(): Promise<any> {
  if (cachedCreds) return cachedCreds;

  try {
    const result = await serviceRegistry.call('keystore', 'getKey', ['default', 'GAPI_KEY']);

    if (!result.success) {
      throw new Error(`Failed to get credentials: ${result.error}`);
    }

    logger.debug('Got credentials from keystore');
    const credentialsJson = result.data?.data?.data;

    if (!credentialsJson || typeof credentialsJson !== 'string') {
      logger.error('Invalid credentials format', { type: typeof credentialsJson });
      throw new Error('No credentials returned from keystore');
    }

    cachedCreds = JSON.parse(credentialsJson);
    logger.info('Loaded credentials', { clientEmail: cachedCreds.client_email });
    return cachedCreds;
  } catch (error) {
    logger.error('Credential parsing error', { message: (error as Error).message });
    throw new Error(`Failed to parse credentials: ${(error as Error).message}`);
  }
}

export async function getAdminEmail(): Promise<string> {
  if (cachedAdminEmail) return cachedAdminEmail;

  try {
    const result = await serviceRegistry.call('keystore', 'getKey', ['default', 'GAPI_ADMIN_EMAIL']);

    if (!result.success) {
      throw new Error(`Failed to get admin email: ${result.error}`);
    }

    logger.debug('Got admin email from keystore');
    const emailValue = result.data?.data?.data;

    if (!emailValue || typeof emailValue !== 'string' || emailValue.trim() === '') {
      throw new Error(`Empty or invalid admin email received`);
    }

    cachedAdminEmail = emailValue;
    logger.info('Loaded admin email', { email: cachedAdminEmail });
    return cachedAdminEmail;
  } catch (error) {
    logger.error('Admin email parsing error', { message: (error as Error).message });
    throw new Error(`Failed to parse admin email: ${(error as Error).message}`);
  }
}

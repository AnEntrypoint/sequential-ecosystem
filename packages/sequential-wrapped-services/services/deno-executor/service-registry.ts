import { hostLog, SUPABASE_URL, SERVICE_ROLE_KEY } from './utilities.ts';

export class MinimalServiceRegistry {
  private supabaseUrl: string;
  private serviceKey: string;

  constructor() {
    this.supabaseUrl = SUPABASE_URL;
    this.serviceKey = SERVICE_ROLE_KEY;
  }

  async call(serviceName: string, method: string, params: any): Promise<any> {
    const logPrefix = `ServiceRegistry-${serviceName}`;

    try {
      const serviceMap: Record<string, string> = {
        'database': 'wrappedsupabase',
        'keystore': 'wrappedkeystore',
        'openai': 'wrappedopenai',
        'websearch': 'wrappedwebsearch',
        'gapi': 'wrappedgapi'
      };

      const actualServiceName = serviceMap[serviceName] || serviceName;
      const url = `${this.supabaseUrl}/functions/v1/${actualServiceName}`;

      hostLog(logPrefix, 'info', `Calling ${serviceName}.${method} via HTTP`);

      let requestBody;
      if (method === 'processChain') {
        const actualChain = (Array.isArray(params) && params.length === 1 && params[0].chain)
          ? params[0].chain
          : params;
        requestBody = { chain: actualChain };
      } else {
        requestBody = { chain: [{ property: method, args: params }] };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Service call failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      hostLog(logPrefix, 'info', `${serviceName}.${method} call completed successfully`);
      return result;

    } catch (error) {
      hostLog(logPrefix, 'error', `Service call failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async databaseCall(table: string, action: string, params: any): Promise<any> {
    const logPrefix = `DatabaseCall-${table}`;

    try {
      const url = `${this.supabaseUrl}/functions/v1/wrappedsupabase`;

      hostLog(logPrefix, 'info', `Database ${action} on ${table}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chain: params
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Database call failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      hostLog(logPrefix, 'info', `Database ${action} on ${table} completed`);
      return result;

    } catch (error) {
      hostLog(logPrefix, 'error', `Database call failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export const serviceRegistry = new MinimalServiceRegistry();

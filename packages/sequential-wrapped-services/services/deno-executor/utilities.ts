import { nowISO } from '@sequential/sequential-utils/timestamps';

export function hostLog(prefix: string, level: 'info' | 'error' | 'warn', message: string): void {
  const timestamp = nowISO();
  console.log(`[${timestamp}] [${level}] [${prefix}] ${message}`);
}

export function simpleStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
export const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface ExecutionResult {
  status: 'completed' | 'paused' | 'error';
  result?: any;
  error?: string;
  suspensionData?: any;
}

export interface SerializedVMState {
  [key: string]: any;
}

import { SupabaseClient, PostgrestSingleResponse, PostgrestResponse } from 'https://esm.sh/@supabase/supabase-js@2';

export interface ConnectionPool {
  client: SupabaseClient;
  inUse: boolean;
  created: number;
  lastUsed: number;
}

export interface QueryOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  enablePerformanceLogging?: boolean;
  context?: Record<string, any>;
}

export type TransactionCallback<T> = (client: SupabaseClient) => Promise<T>;

export type DatabaseResult<T> = {
  data: T | null;
  error: Error | null;
  success: boolean;
  performance?: {
    duration: number;
    operation: string;
    retryCount: number;
  };
};

export type TaskRun = {
  id: string;
  task_function_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'suspended_waiting_child';
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  suspended_at?: string;
  resume_payload?: any;
};

export type StackRun = {
  id: string;
  task_run_id: string;
  parent_stack_run_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  function_name: string;
  parameters?: any;
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  waiting?: boolean;
  waiting_on_stack_run_id?: string;
};

export type TaskFunction = {
  id: string;
  name: string;
  description?: string;
  code: string;
  created_at: string;
  updated_at: string;
};

export type KeyStoreEntry = {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
};

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { WrappedGapiHandler } from './gapi-handler.ts'

const wrappedGapiHandler = new WrappedGapiHandler();
serve((req) => wrappedGapiHandler.handle(req));

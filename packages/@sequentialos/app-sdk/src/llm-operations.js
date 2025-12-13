/**
 * llm-operations.js
 *
 * LLM/AI operations (chat completion, context)
 */

export function createLlmOperations(baseUrl, appId, userId) {
  return {
    async chat(prompt, options = {}) {
      const body = {
        prompt,
        model: options.model || 'claude-3-5-sonnet-20241022',
        maxTokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        system: options.system,
        tools: options.tools || [],
        toolChoice: options.toolChoice,
        context: { appId, userId }
      };

      const res = await fetch(`${baseUrl}/api/llm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`LLM request failed: ${res.statusText}`);
      return await res.json();
    }
  };
}

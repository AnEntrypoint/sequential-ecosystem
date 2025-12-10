import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import { createValidationError } from '@sequentialos/error-handling';

export function registerLLMRoutes(app, container) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  app.post('/api/llm/chat', asyncHandler(async (req, res) => {
    if (!apiKey) {
      return res.status(503).json(formatResponse({
        error: 'LLM service unavailable',
        message: 'ANTHROPIC_API_KEY not configured'
      }));
    }

    const { prompt, model = 'claude-3-5-sonnet-20241022', maxTokens = 1024, temperature = 0.7, system, tools = [], context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      throw createValidationError('prompt', 'prompt is required and must be a string');
    }

    const messages = [{ role: 'user', content: prompt }];
    const body = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
      system: system || 'You are a helpful assistant.'
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = req.body.toolChoice || 'auto';
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      res.json(formatResponse({
        success: true,
        response: data,
        context
      }));
    } catch (error) {
      res.status(500).json(formatResponse({
        error: 'LLM request failed',
        message: error.message
      }));
    }
  }));
}

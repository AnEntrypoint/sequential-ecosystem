export function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    library: null,
    port: 3100,
    outputDir: './services',
    force: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') {
      config.port = parseInt(args[++i]);
    } else if (args[i] === '--output') {
      config.outputDir = args[++i];
    } else if (args[i] === '--force' || args[i] === '-f') {
      config.force = true;
    } else if (!config.library && !args[i].startsWith('--')) {
      config.library = args[i];
    }
  }

  return config;
}

export function printHelp(library) {
  return `
wrap-sdk - Zero-code SDK wrapping

Usage: npx wrap-sdk <library-name> [options]

Examples:
  npx wrap-sdk supabase
  npx wrap-sdk openai --port 3101
  npx wrap-sdk stripe --output ./my-services

Options:
  --port <number>      Base port for service (default: 3100)
  --output <dir>       Output directory (default: ./services)
  --force, -f          Overwrite existing service
  --help               Show this help message

Supported libraries (auto-detected):
  - supabase           Database + Auth
  - openai             LLM API
  - stripe             Payments
  - twilio             Communications
  - mongodb            NoSQL database
  - redis              Cache
  - elasticsearch      Search
  - anthropic          LLM API
  - And many more!
`;
}

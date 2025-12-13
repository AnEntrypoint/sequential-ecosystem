export function detectCredentials(moduleName, module) {
  const credentials = [];
  const normalized = moduleName.toLowerCase().replace(/[@/-]/g, '_');

  const patterns = {
    supabase: ['SUPABASE_URL', 'SUPABASE_KEY'],
    openai: ['OPENAI_API_KEY'],
    anthropic: ['ANTHROPIC_API_KEY'],
    stripe: ['STRIPE_SECRET_KEY'],
    twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    google: ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'],
    mongodb: ['MONGODB_URI'],
    redis: ['REDIS_URL'],
    elasticsearch: ['ELASTICSEARCH_URL', 'ELASTICSEARCH_USERNAME', 'ELASTICSEARCH_PASSWORD'],
    firebase: ['FIREBASE_SERVICE_ACCOUNT_JSON'],
    auth0: ['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'],
    github: ['GITHUB_TOKEN'],
    slack: ['SLACK_BOT_TOKEN'],
    discord: ['DISCORD_BOT_TOKEN']
  };

  for (const [key, creds] of Object.entries(patterns)) {
    if (normalized.includes(key)) {
      return creds;
    }
  }

  for (const part of normalized.split('_')) {
    if (patterns[part]) {
      return patterns[part];
    }
  }

  const upperNormalized = normalized.toUpperCase();
  return [
    `${upperNormalized}_API_KEY`,
    `${upperNormalized}_TOKEN`,
    `${upperNormalized}_SECRET`
  ].filter(k => k.length < 50);
}

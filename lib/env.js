// Environment variable validation
function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Warn about default JWT secret in production
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET ||
     process.env.JWT_SECRET === 'your-super-strong-secret-key-change-this-in-production')
  ) {
    console.error('⚠️  WARNING: Using default JWT_SECRET in production is insecure!');
    console.error('Please set a strong, random JWT_SECRET environment variable.');
    console.error('Generate one with: openssl rand -base64 32');
  }

  // Warn about HTTP in production
  if (process.env.NODE_ENV === 'production' && !process.env.TRUST_PROXY) {
    console.warn('ℹ️  If your app is behind a proxy/load balancer, set TRUST_PROXY=true');
  }

  return true;
}

// Run validation on import
validateEnv();

module.exports = { validateEnv };

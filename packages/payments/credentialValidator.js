const REQUIRED_FIELDS = {
  RAZORPAY: ["key_id", "key_secret"],
  CASHFREE: ["app_id", "secret_key"],
};

function validateGatewayCredentials(provider, credentials) {
  if (!REQUIRED_FIELDS[provider]) {
    throw new Error("Unsupported payment provider");
  }

  if (!credentials || typeof credentials !== "object") {
    throw new Error("Credentials must be a JSON object");
  }

  const missing = REQUIRED_FIELDS[provider].filter((key) => !credentials[key]);

  if (missing.length) {
    throw new Error(
      `Missing required credentials for ${provider}: ${missing.join(", ")}`
    );
  }

  return true;
}

module.exports = { validateGatewayCredentials };

/**
 * Frontend Environment Configuration
 * All values are injected at build time from .env
 */

export const ENV = {
  // API Configuration
  apiUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
  
  // Stripe Configuration
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  
  // OAuth Configuration
  oauthPortalUrl: import.meta.env.VITE_OAUTH_PORTAL_URL || "https://portal.manus.im",
  appId: import.meta.env.VITE_APP_ID || "",
  
  // Analytics
  analyticsEndpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || "",
  analyticsWebsiteId: import.meta.env.VITE_ANALYTICS_WEBSITE_ID || "",
  
  // Manus APIs
  forgeApiUrl: import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.manus.im",
  forgeApiKey: import.meta.env.VITE_FRONTEND_FORGE_API_KEY || "",
  
  // App Configuration
  appTitle: import.meta.env.VITE_APP_TITLE || "AmarenLogist",
  appLogo: import.meta.env.VITE_APP_LOGO || "/logo.svg",
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Validate that critical environment variables are set
 */
export function validateEnv() {
  const criticalVars = [
    "apiUrl",
    "stripePublishableKey",
    "appId",
  ];
  
  const missing = criticalVars.filter(
    (key) => !ENV[key as keyof typeof ENV]
  );
  
  if (missing.length > 0 && ENV.isProduction) {
    console.error(
      "Missing critical environment variables:",
      missing.join(", ")
    );
  }
}

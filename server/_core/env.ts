export const ENV = {
  // Authentication
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Environment
  isProduction: process.env.NODE_ENV === "production",
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3000"),
  
  // Stripe Payment
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  
  // Email
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@amarenlogist.com",
  emailFromName: process.env.EMAIL_FROM_NAME ?? "AmarenLogist",
  
  // SMS (Twilio)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER ?? "",
  
  // AWS S3
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  awsS3Region: process.env.AWS_S3_REGION ?? "eu-central-1",
  awsS3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID ?? "",
  awsS3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY ?? "",
  
  // Business Configuration
  systemCommissionPercentage: parseFloat(process.env.SYSTEM_COMMISSION_PERCENTAGE ?? "10"),
  insuranceFeePercentage: parseFloat(process.env.INSURANCE_FEE_PERCENTAGE ?? "15"),
  minOrderAmount: parseFloat(process.env.MIN_ORDER_AMOUNT ?? "50"),
  maxOrderAmount: parseFloat(process.env.MAX_ORDER_AMOUNT ?? "10000"),
  
  // Manus APIs
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // URLs
  backendUrl: process.env.VITE_BACKEND_URL ?? "http://localhost:3000",
  frontendUrl: process.env.VITE_FRONTEND_URL ?? "http://localhost:5173",
  
  // Logging
  logLevel: process.env.LOG_LEVEL ?? "info",
  logRequests: process.env.LOG_REQUESTS === "true",
};

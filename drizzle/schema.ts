import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with custom authentication and role system for AmarenLogist platform.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).unique(),
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }).notNull().default("password"),
  role: mysqlEnum("role", ["super_admin", "admin", "client", "driver"]).notNull().default("client"),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Driver profiles with additional information
 */
export const driverProfiles = mysqlTable("driver_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  licenseNumber: varchar("licenseNumber", { length: 64 }),
  vehicleType: text("vehicleType"),
  experienceYears: int("experienceYears"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  completedOrders: int("completedOrders").default(0).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DriverProfile = typeof driverProfiles.$inferSelect;
export type InsertDriverProfile = typeof driverProfiles.$inferInsert;

/**
 * Vehicle transport orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  driverId: int("driverId"),
  vehicleType: varchar("vehicleType", { length: 128 }).notNull(),
  vehicleMake: varchar("vehicleMake", { length: 128 }),
  vehicleModel: varchar("vehicleModel", { length: 128 }),
  pickupLocation: text("pickupLocation").notNull(),
  deliveryLocation: text("deliveryLocation").notNull(),
  pickupDate: timestamp("pickupDate").notNull(),
  deliveryDate: timestamp("deliveryDate"),
  status: mysqlEnum("status", ["erstellt", "bestätigt", "unterwegs", "abgeschlossen", "storniert"]).notNull().default("erstellt"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  insuranceFee: decimal("insuranceFee", { precision: 10, scale: 2 }).notNull(),
  systemCommission: decimal("systemCommission", { precision: 10, scale: 2 }).notNull(),
  driverPayout: decimal("driverPayout", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  // Ratings and feedback
  driverRating: int("driverRating"),
  driverFeedback: text("driverFeedback"),
  // Document URLs
  documentsUrl: text("documentsUrl"),
  beforePhotoUrl: text("beforePhotoUrl"),
  afterPhotoUrl: text("afterPhotoUrl"),
  handoverProtocolUrl: text("handoverProtocolUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  clientId: int("clientId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "paypal"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
  transactionId: varchar("transactionId", { length: 255 }),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Driver payouts
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  driverId: int("driverId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payoutStatus: mysqlEnum("payoutStatus", ["pending", "processing", "completed", "failed"]).notNull().default("pending"),
  payoutMethod: varchar("payoutMethod", { length: 64 }),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * System configuration for pricing and fees
 */
export const systemConfig = mysqlTable("system_config", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 128 }).notNull().unique(),
  configValue: text("configValue").notNull(),
  description: text("description"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

/**
 * System activity logs
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Invoices for clients and drivers
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 64 }).notNull().unique(),
  orderId: int("orderId").notNull(),
  recipientType: mysqlEnum("recipientType", ["client", "driver"]).notNull(),
  recipientId: int("recipientId").notNull(),
  recipientName: text("recipientName").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientAddress: text("recipientAddress"),
  invoiceDate: timestamp("invoiceDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
  invoiceStatus: mysqlEnum("invoiceStatus", ["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).notNull().default("draft"),
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 255 }),
  notes: text("notes"),
  paymentTerms: varchar("paymentTerms", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Invoice line items
 */
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

/**
 * Invoice payment tracking
 */
export const invoicePayments = mysqlTable("invoice_payments", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  paymentAmount: decimal("paymentAmount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoicePayment = typeof invoicePayments.$inferSelect;
export type InsertInvoicePayment = typeof invoicePayments.$inferInsert;

/**
 * Onboarding verification documents
 */
export const verificationDocuments = mysqlTable("verification_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: mysqlEnum("documentType", [
    "business_registration",
    "id_document",
    "tax_number",
    "drivers_license",
    "liability_insurance",
    "vehicle_insurance",
    "transport_insurance",
  ]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "in_review", "verified", "rejected"]).default("unverified").notNull(),
  rejectionReason: text("rejectionReason"),
  expiryDate: timestamp("expiryDate"),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = typeof verificationDocuments.$inferInsert;

/**
 * User verification status and onboarding progress
 */
export const userVerification = mysqlTable("user_verification", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "in_review", "verified", "rejected", "suspended"]).default("unverified").notNull(),
  businessName: varchar("businessName", { length: 255 }),
  businessAddress: text("businessAddress"),
  taxNumber: varchar("taxNumber", { length: 64 }),
  minAge: int("minAge"),
  licenseClass: varchar("licenseClass", { length: 10 }),
  vehicleType: varchar("vehicleType", { length: 100 }),
  insuranceValid: boolean("insuranceValid").default(false),
  insuranceExpiryDate: timestamp("insuranceExpiryDate"),
  rejectionReason: text("rejectionReason"),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserVerification = typeof userVerification.$inferSelect;
export type InsertUserVerification = typeof userVerification.$inferInsert;

/**
 * SMS notifications log
 */
export const smsNotifications = mysqlTable("sms_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 32 }).notNull(),
  messageType: varchar("messageType", { length: 64 }).notNull(),
  messageContent: text("messageContent").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "delivered"]).default("pending").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  sentAt: timestamp("sentAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmsNotification = typeof smsNotifications.$inferSelect;
export type InsertSmsNotification = typeof smsNotifications.$inferInsert;


/**
 * Service models (Marketplace vs Transport Service)
 */
export const serviceModels = mysqlTable("service_models", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  modelType: mysqlEnum("modelType", ["marketplace", "transport_service"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceModel = typeof serviceModels.$inferSelect;
export type InsertServiceModel = typeof serviceModels.$inferInsert;

/**
 * Driver service providers (Fahrdienste)
 */
export const driverServiceProviders = mysqlTable("driver_service_providers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  businessRegistration: text("businessRegistration"),
  taxNumber: varchar("taxNumber", { length: 64 }),
  insuranceCertificate: text("insuranceCertificate"),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "in_review", "verified", "rejected"]).default("unverified").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalOrders: int("totalOrders").default(0),
  completedOrders: int("completedOrders").default(0),
  averageResponseTime: int("averageResponseTime"), // in minutes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DriverServiceProvider = typeof driverServiceProviders.$inferSelect;
export type InsertDriverServiceProvider = typeof driverServiceProviders.$inferInsert;

/**
 * Marketplace offers from drivers
 */
export const marketplaceOffers = mysqlTable("marketplace_offers", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  driverId: int("driverId").notNull(),
  quotedPrice: decimal("quotedPrice", { precision: 10, scale: 2 }).notNull(),
  estimatedDuration: int("estimatedDuration"), // in hours
  driverRating: decimal("driverRating", { precision: 3, scale: 2 }),
  completedJobs: int("completedJobs"),
  offerStatus: mysqlEnum("offerStatus", ["pending", "accepted", "rejected", "expired"]).notNull().default("pending"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceOffer = typeof marketplaceOffers.$inferSelect;
export type InsertMarketplaceOffer = typeof marketplaceOffers.$inferInsert;

/**
 * Transport Service assignments
 */
export const transportServiceAssignments = mysqlTable("transport_service_assignments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  assignedDriverId: int("assignedDriverId"),
  assignedBy: int("assignedBy"), // Admin ID
  matchingScore: decimal("matchingScore", { precision: 5, scale: 2 }),
  assignmentStatus: mysqlEnum("assignmentStatus", ["pending", "assigned", "accepted", "rejected"]).notNull().default("pending"),
  assignedAt: timestamp("assignedAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TransportServiceAssignment = typeof transportServiceAssignments.$inferSelect;
export type InsertTransportServiceAssignment = typeof transportServiceAssignments.$inferInsert;

/**
 * Blog posts and content
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: int("authorId"),
  category: varchar("category", { length: 64 }),
  tags: text("tags"), // JSON array
  featuredImageUrl: text("featuredImageUrl"),
  publishStatus: mysqlEnum("publishStatus", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Customer testimonials
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userCompany: varchar("userCompany", { length: 255 }),
  userRole: varchar("userRole", { length: 128 }),
  content: text("content").notNull(),
  rating: int("rating"), // 1-5
  imageUrl: text("imageUrl"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Pricing configuration for different service models
 */
export const pricingConfig = mysqlTable("pricing_config", {
  id: int("id").autoincrement().primaryKey(),
  serviceModel: mysqlEnum("serviceModel", ["marketplace", "transport_service"]).notNull(),
  vehicleType: varchar("vehicleType", { length: 128 }).notNull(),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  pricePerKm: decimal("pricePerKm", { precision: 10, scale: 2 }),
  insurancePercentage: decimal("insurancePercentage", { precision: 5, scale: 2 }).default("15.00"),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("10.00"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingConfig = typeof pricingConfig.$inferSelect;
export type InsertPricingConfig = typeof pricingConfig.$inferInsert;

/**
 * Telemetry data for tracking
 */
export const telemetryData = mysqlTable("telemetry_data", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  driverId: int("driverId").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  speed: decimal("speed", { precision: 6, scale: 2 }), // km/h
  heading: decimal("heading", { precision: 6, scale: 2 }), // degrees
  altitude: decimal("altitude", { precision: 8, scale: 2 }), // meters
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }), // meters
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TelemetryData = typeof telemetryData.$inferSelect;
export type InsertTelemetryData = typeof telemetryData.$inferInsert;

/**
 * Insurance policies
 */
export const insurancePolicies = mysqlTable("insurance_policies", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  policyNumber: varchar("policyNumber", { length: 128 }).notNull().unique(),
  insuranceProvider: varchar("insuranceProvider", { length: 255 }).notNull(),
  coverageAmount: decimal("coverageAmount", { precision: 10, scale: 2 }).notNull(),
  deductible: decimal("deductible", { precision: 10, scale: 2 }),
  policyStartDate: timestamp("policyStartDate").notNull(),
  policyEndDate: timestamp("policyEndDate").notNull(),
  policyStatus: mysqlEnum("policyStatus", ["active", "expired", "cancelled", "claimed"]).notNull().default("active"),
  policyDocumentUrl: text("policyDocumentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsurancePolicy = typeof insurancePolicies.$inferInsert;

/**
 * Industry-specific configurations
 */
export const industryConfigs = mysqlTable("industry_configs", {
  id: int("id").autoincrement().primaryKey(),
  industryType: varchar("industryType", { length: 128 }).notNull().unique(),
  industryName: varchar("industryName", { length: 255 }).notNull(),
  description: text("description"),
  supportedServices: text("supportedServices"), // JSON array
  specialRequirements: text("specialRequirements"), // JSON
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IndustryConfig = typeof industryConfigs.$inferSelect;
export type InsertIndustryConfig = typeof industryConfigs.$inferInsert;

/**
 * API keys for REST API access
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyName: varchar("keyName", { length: 255 }).notNull(),
  keyValue: varchar("keyValue", { length: 255 }).notNull().unique(),
  keySecret: text("keySecret").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

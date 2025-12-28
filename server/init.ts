import { initializeAdminAccounts } from "./auth";

/**
 * Initialize admin accounts and system configuration
 * This runs automatically when the server starts
 */
export async function initializeSystem() {
  try {
    // Skip initialization in development mode to avoid database issues
    if (process.env.NODE_ENV === "development") {
      console.log("[Init] Skipping initialization in development mode");
      return;
    }
    
    await initializeAdminAccounts();
    console.log("[Init] System initialization completed");
  } catch (error) {
    console.error("[Init] System initialization failed:", error);
    // Don't crash the server in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("[Init] Continuing despite initialization failure");
    }
  }
}

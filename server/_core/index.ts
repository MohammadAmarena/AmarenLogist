import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import Stripe from "stripe";
import { initializeSystem } from "../init";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Stripe webhook (only if configured)
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && stripeKey !== "sk_test_dummy_key_for_development" && !stripeKey.includes("dummy")) {
    const stripe = new Stripe(stripeKey);
    app.post("/api/webhooks/stripe", express.raw({type: "application/json"}), async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret || "");
      } catch (err) {
        res.status(400).send(`Webhook Error: ${(err as Error).message}`);
        return;
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = parseInt(session.metadata?.orderId || "0");
        
        // Update order status
        // await updateOrderStatus(orderId, "bestätigt");
      }

      res.json({received: true});
    });
  } else {
    console.log("[Stripe] Webhook endpoint not configured - using dummy mode");
    app.post("/api/webhooks/stripe", express.json(), async (req, res) => {
      console.log("[Stripe] Dummy webhook received:", req.body);
      res.json({received: true, mode: "dummy"});
    });
  }

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Initialize admin accounts and system config
    await initializeSystem();
  });
}

startServer().catch(console.error);

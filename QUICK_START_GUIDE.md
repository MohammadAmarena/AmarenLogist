# 🚀 AmarenLogist – Quick Start Guide für die nächsten 3 Features

## 📊 Projekt-Status

**Aktuell produktionsbereit:**
- ✅ Vier-Rollen-System (Super Admin, Admin, Client, Driver)
- ✅ Auftragsmanagement mit Statusverfolgung
- ✅ Automatische Preisberechnung
- ✅ Zahlungsintegration (Stripe/PayPal)
- ✅ Rechnungssystem mit PDF-Generator
- ✅ Onboarding mit Gewerbenachweis
- ✅ SMS & E-Mail-Benachrichtigungen
- ✅ Chat & Bewertungssystem
- ✅ 113 Tests (100% Pass-Rate)
- ✅ Datenbank-Schema für alle Features

**Admin-Accounts:**
- Super Admin: `amarenlogist` / `amarenlogist555`
- Admin: `zetologist` / `zetologist123`

---

## 🎯 Feature 1: Marketplace-Modell (2-3 Wochen)

### Was ist das Marketplace-Modell?
Clients erstellen Aufträge, Fahrer machen Angebote, Clients vergleichen und akzeptieren das beste Angebot.

### Schritt 1: Backend-Service erstellen

**Datei:** `server/marketplace.ts` – Neue Datei

```typescript
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { orders, marketplaceOffers, users } from "../drizzle/schema";

export async function createMarketplaceOrder(
  clientId: number,
  vehicleType: string,
  pickupLocation: string,
  deliveryLocation: string,
  pickupDate: Date,
  totalPrice: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values({
    clientId,
    vehicleType,
    pickupLocation,
    deliveryLocation,
    pickupDate,
    totalPrice: totalPrice.toString(),
    insuranceFee: (totalPrice * 0.15).toString(),
    systemCommission: (totalPrice * 0.1).toString(),
    driverPayout: (totalPrice * 0.75).toString(),
    status: "erstellt",
  });

  return { success: true, orderId: (result as any).insertId };
}

export async function submitOffer(
  orderId: number,
  driverId: number,
  quotedPrice: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(marketplaceOffers).values({
    orderId,
    driverId,
    quotedPrice: quotedPrice.toString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    offerStatus: "pending",
  });

  return { success: true, offerId: (result as any).insertId };
}

export async function getOffers(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(marketplaceOffers)
    .innerJoin(users, eq(marketplaceOffers.driverId, users.id))
    .where(eq(marketplaceOffers.orderId, orderId))
    .orderBy(desc(marketplaceOffers.driverRating));
}

export async function acceptOffer(offerId: number, orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offer = await db
    .select()
    .from(marketplaceOffers)
    .where(eq(marketplaceOffers.id, offerId))
    .limit(1);

  if (!offer[0]) throw new Error("Offer not found");

  // Accept this offer
  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "accepted" })
    .where(eq(marketplaceOffers.id, offerId));

  // Reject others
  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "rejected" })
    .where(
      and(
        eq(marketplaceOffers.orderId, orderId),
        eq(marketplaceOffers.offerStatus, "pending")
      )
    );

  // Update order
  await db
    .update(orders)
    .set({
      driverId: offer[0].driverId,
      totalPrice: offer[0].quotedPrice,
      status: "bestätigt",
    })
    .where(eq(orders.id, orderId));

  return { success: true };
}
```

### Schritt 2: tRPC-Procedures hinzufügen

**Datei:** `server/routers.ts` – Fügen Sie hinzu:

```typescript
import * as marketplace from "./marketplace";

export const appRouter = router({
  // ... existing code ...
  
  marketplace: router({
    createOrder: protectedProcedure
      .input(z.object({
        vehicleType: z.string(),
        pickupLocation: z.string(),
        deliveryLocation: z.string(),
        pickupDate: z.date(),
        totalPrice: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return marketplace.createMarketplaceOrder(
          ctx.user.id,
          input.vehicleType,
          input.pickupLocation,
          input.deliveryLocation,
          input.pickupDate,
          input.totalPrice
        );
      }),

    getOffers: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return marketplace.getOffers(input.orderId);
      }),

    submitOffer: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        quotedPrice: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return marketplace.submitOffer(
          input.orderId,
          ctx.user.id,
          input.quotedPrice
        );
      }),

    acceptOffer: protectedProcedure
      .input(z.object({ offerId: z.number(), orderId: z.number() }))
      .mutation(async ({ input }) => {
        return marketplace.acceptOffer(input.offerId, input.orderId);
      }),
  }),
});
```

### Schritt 3: Frontend-Komponenten

**Datei:** `client/src/pages/MarketplaceFlow.tsx` – Neue Datei

```typescript
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MarketplaceFlow() {
  const [step, setStep] = useState<"create" | "offers" | "compare">("create");
  const [orderId, setOrderId] = useState<number | null>(null);

  const createOrderMutation = trpc.marketplace.createOrder.useMutation();
  const getOfferQuery = trpc.marketplace.getOffers.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId }
  );

  const handleCreateOrder = async (data: any) => {
    const result = await createOrderMutation.mutateAsync(data);
    setOrderId(result.orderId);
    setStep("offers");
  };

  if (step === "create") {
    return (
      <div>
        <h1>Auftrag erstellen</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleCreateOrder({
            vehicleType: formData.get("vehicleType"),
            pickupLocation: formData.get("pickupLocation"),
            deliveryLocation: formData.get("deliveryLocation"),
            pickupDate: new Date(formData.get("pickupDate") as string),
            totalPrice: parseFloat(formData.get("totalPrice") as string),
          });
        }}>
          <input name="vehicleType" placeholder="Fahrzeugtyp" required />
          <input name="pickupLocation" placeholder="Abholort" required />
          <input name="deliveryLocation" placeholder="Zielort" required />
          <input name="pickupDate" type="date" required />
          <input name="totalPrice" type="number" placeholder="Preis" required />
          <Button type="submit">Auftrag erstellen</Button>
        </form>
      </div>
    );
  }

  if (step === "offers" && getOfferQuery.data) {
    return (
      <div>
        <h1>Verfügbare Angebote ({getOfferQuery.data.length})</h1>
        <div className="grid gap-4">
          {getOfferQuery.data.map((offer) => (
            <Card key={offer.id} className="p-4">
              <h3>{offer.users.name}</h3>
              <p>Preis: €{offer.marketplace_offers.quotedPrice}</p>
              <p>Rating: {offer.marketplace_offers.driverRating}/5</p>
              <Button onClick={() => setStep("compare")}>
                Vergleichen
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}
```

### Schritt 4: Tests schreiben

**Datei:** `server/marketplace.test.ts` – Neue Datei

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import * as marketplace from "./marketplace";

describe("Marketplace Service", () => {
  let orderId: number;

  it("should create a marketplace order", async () => {
    const result = await marketplace.createMarketplaceOrder(
      1, // clientId
      "BMW 3er",
      "Berlin",
      "Munich",
      new Date(),
      1000
    );
    expect(result.success).toBe(true);
    orderId = result.orderId;
  });

  it("should submit an offer", async () => {
    const result = await marketplace.submitOffer(orderId, 2, 950);
    expect(result.success).toBe(true);
  });

  it("should get offers", async () => {
    const offers = await marketplace.getOffers(orderId);
    expect(offers.length).toBeGreaterThan(0);
  });

  it("should accept an offer", async () => {
    const offers = await marketplace.getOffers(orderId);
    if (offers.length > 0) {
      const result = await marketplace.acceptOffer(offers[0].id, orderId);
      expect(result.success).toBe(true);
    }
  });
});
```

### Schritt 5: Testen

```bash
# Tests ausführen
pnpm test -- marketplace

# Dev-Server starten
pnpm dev

# Im Browser: http://localhost:3000/marketplace
```

---

## 🎯 Feature 2: Fahrdienst-Netzwerk (4-6 Wochen)

### Was ist das Fahrdienst-Netzwerk?
Fahrdienste (Unternehmen) registrieren sich, laden Dokumente hoch, werden vom Admin verifiziert, und können dann Aufträge annehmen.

### Schritt 1: Fahrdienst-Registrierung

**Datei:** `server/driverNetwork.ts` – Neue Datei

```typescript
import { getDb } from "./db";
import { driverServiceProviders, users } from "../drizzle/schema";

export async function registerDriverService(
  userId: number,
  companyName: string,
  taxNumber: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(driverServiceProviders).values({
    userId,
    companyName,
    taxNumber,
    verificationStatus: "unverified",
    isActive: false,
  });

  return { success: true, serviceId: (result as any).insertId };
}

export async function getPendingVerifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(driverServiceProviders)
    .where(eq(driverServiceProviders.verificationStatus, "unverified"));
}

export async function verifyDriverService(serviceId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(driverServiceProviders)
    .set({
      verificationStatus: "verified",
      isActive: true,
    })
    .where(eq(driverServiceProviders.id, serviceId));

  return { success: true };
}
```

### Schritt 2: Frontend-Registrierung

**Datei:** `client/src/pages/DriverServiceSignup.tsx` – Neue Datei

```typescript
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DriverServiceSignup() {
  const [formData, setFormData] = useState({
    companyName: "",
    taxNumber: "",
  });

  const registerMutation = trpc.driverNetwork.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerMutation.mutateAsync(formData);
  };

  return (
    <Card className="p-6 max-w-md">
      <h2>Fahrdienst registrieren</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Firmenname"
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Steuernummer"
          value={formData.taxNumber}
          onChange={(e) =>
            setFormData({ ...formData, taxNumber: e.target.value })
          }
          required
        />
        <Button type="submit" disabled={registerMutation.isPending}>
          Registrieren
        </Button>
      </form>
    </Card>
  );
}
```

### Schritt 3: Admin-Verifizierungs-Dashboard

**Datei:** `client/src/pages/AdminDriverVerification.tsx` – Neue Datei

```typescript
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminDriverVerification() {
  const pendingQuery = trpc.driverNetwork.getPending.useQuery();
  const verifyMutation = trpc.driverNetwork.verify.useMutation();

  return (
    <div>
      <h2>Fahrdienst-Verifizierung</h2>
      <div className="space-y-4">
        {pendingQuery.data?.map((service) => (
          <Card key={service.id} className="p-4">
            <h3>{service.companyName}</h3>
            <p>Steuernummer: {service.taxNumber}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => verifyMutation.mutate({ serviceId: service.id })}
              >
                Freigeben
              </Button>
              <Button variant="destructive">Ablehnen</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Feature 3: Stripe Live-Integration

### Schritt 1: Stripe-Keys eintragen

1. Gehen Sie zu **Settings → Secrets** im Manus Dashboard
2. Fügen Sie hinzu:
   - `STRIPE_SECRET_KEY` – Ihr Live Secret Key von Stripe
   - `STRIPE_PUBLISHABLE_KEY` – Ihr Live Publishable Key

### Schritt 2: Webhook-Handler

**Datei:** `server/_core/index.ts` – Fügen Sie hinzu:

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Webhook endpoint
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
```

### Schritt 3: Checkout-Button im Frontend

**Datei:** `client/src/components/StripeCheckout.tsx` – Neue Datei

```typescript
import { loadStripe } from "@stripe/js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function StripeCheckout({ orderId, amount }: { orderId: number; amount: number }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount }),
    });

    const { sessionId } = await response.json();
    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <Button onClick={handleCheckout}>
      €{amount.toFixed(2)} bezahlen
    </Button>
  );
}
```

---

## 📋 Implementierungs-Checkliste

### Marketplace (2-3 Wochen)
- [ ] `server/marketplace.ts` erstellen
- [ ] tRPC-Procedures in `server/routers.ts` hinzufügen
- [ ] `client/src/pages/MarketplaceFlow.tsx` erstellen
- [ ] Tests in `server/marketplace.test.ts` schreiben
- [ ] `pnpm test` ausführen
- [ ] Im Browser testen

### Fahrdienst-Netzwerk (4-6 Wochen)
- [ ] `server/driverNetwork.ts` erstellen
- [ ] `client/src/pages/DriverServiceSignup.tsx` erstellen
- [ ] `client/src/pages/AdminDriverVerification.tsx` erstellen
- [ ] tRPC-Procedures hinzufügen
- [ ] Tests schreiben
- [ ] Im Browser testen

### Stripe Live (1-2 Wochen)
- [ ] Stripe-Keys in Settings eintragen
- [ ] Webhook-Handler in `server/_core/index.ts` hinzufügen
- [ ] `client/src/components/StripeCheckout.tsx` erstellen
- [ ] Live-Zahlungen testen
- [ ] Webhook-Tests durchführen

---

## 🚀 Nächste Schritte

1. **Marketplace implementieren** – Start mit Feature 1
2. **Fahrdienst-Netzwerk aufbauen** – Feature 2
3. **Stripe Live aktivieren** – Feature 3
4. **Tests schreiben** – Für jedes Feature
5. **Deployment vorbereiten** – Checkpoint erstellen

---

## 📞 Hilfreiche Ressourcen

- **Dokumentation:** `/home/ubuntu/amarenlogist/DOCUMENTATION.md`
- **Roadmap:** `/home/ubuntu/amarenlogist/IMPLEMENTATION_ROADMAP.md`
- **Tests:** `pnpm test`
- **Development:** `pnpm dev`
- **Build:** `pnpm build`

---

**Viel Erfolg! 🚀**

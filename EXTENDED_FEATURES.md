# AmarenLogist - Erweiterte Features (v1.1.0)

Diese Dokumentation beschreibt die 10 erweiterten Enterprise-Features, die zur AmarenLogist-Plattform hinzugefügt wurden.

---

## 1. Stripe-Zahlungsintegration

**Datei:** `server/payments.ts`

### Funktionalität

- Sichere Zahlungsabwicklung über Stripe Checkout
- Automatische Statusaktualisierung nach erfolgreicher Zahlung
- Refund-Handling für stornierte Aufträge
- Zahlungshistorie und Transaktionsverfolgung

### Verwendung

```typescript
import { createCheckoutSession, handlePaymentSuccess } from './server/payments';

// Checkout-Session erstellen
const session = await createCheckoutSession(orderId, returnUrl);

// Nach erfolgreicher Zahlung
await handlePaymentSuccess(sessionId);
```

### Umgebungsvariablen

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## 2. E-Mail-Benachrichtigungssystem

**Datei:** `server/email.ts`

### Funktionalität

- Automatische E-Mails für alle wichtigen Events
- Professionelle HTML-Templates
- Unterstützung für SendGrid, Mailgun, oder lokale SMTP

### Events

- Auftragsbestätigung für Clients
- Neue Aufträge für Fahrer
- Statusupdates (Bestätigt, Unterwegs, Abgeschlossen)
- Auszahlungsbestätigungen
- Admin-Benachrichtigungen

### Verwendung

```typescript
import { sendOrderConfirmationEmail } from './server/email';

await sendOrderConfirmationEmail(
  clientEmail,
  clientName,
  orderId,
  vehicleType,
  pickupLocation,
  deliveryLocation,
  totalPrice
);
```

### Umgebungsvariablen

```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASSWORD=...
FROM_EMAIL=noreply@amarenlogist.com
```

---

## 3. Bewertungs- und Feedback-System

**Datei:** `server/ratings.ts`

### Funktionalität

- 1-5 Sterne Bewertung nach Auftragsabschluss
- Textuelle Feedback-Kommentare
- Automatische Berechnung der Durchschnittsbewertung
- "Verifiziert"-Badge für Top-Fahrer (4.5+ Sterne, 10+ Bewertungen)
- Admin-Review für negative Bewertungen

### Verwendung

```typescript
import { submitRating, getDriverRatings, isVerifiedDriver } from './server/ratings';

// Bewertung abgeben
await submitRating(orderId, driverId, clientId, 5, "Sehr zuverlässig!");

// Fahrer-Bewertungen abrufen
const ratings = await getDriverRatings(driverId);

// Verifiziert-Status prüfen
const verified = await isVerifiedDriver(driverId);
```

---

## 4. Echtzeit-Chat mit WebSocket

**Datei:** `server/chat.ts`

### Funktionalität

- Echtzeit-Kommunikation zwischen Client und Fahrer
- Dateianhang-Support (Fotos, Dokumente)
- Chat-Verlauf
- Zugriffskontrolle (nur Client und zugewiesener Fahrer)

### Verwendung

```typescript
import { addChatMessage, getChatHistory } from './server/chat';

// Nachricht hinzufügen
const message = addChatMessage(
  orderId,
  senderId,
  senderName,
  "Ich bin gleich da!",
  attachmentUrl,
  "image"
);

// Chat-Verlauf abrufen
const history = getChatHistory(orderId);
```

---

## 5. Erweiterte Suchfilter für Fahrer

**Datei:** `server/search.ts`

### Funktionalität

- Geografische Filter (PLZ, Stadt, Bundesland)
- Fahrzeugtyp-Filter
- Preisspanne-Filter
- Datum-Filter
- Sortierung nach Entfernung, Preis oder Datum
- Gespeicherte Suchprofile

### Verwendung

```typescript
import { searchAvailableOrders } from './server/search';

const orders = await searchAvailableOrders({
  vehicleType: 'PKW',
  minPrice: 500,
  maxPrice: 2000,
  region: 'Berlin',
  dateFrom: new Date(),
  sortBy: 'price',
  sortOrder: 'asc'
});
```

---

## 6. Dokumenten-Upload und Übergabeprotokoll

**Datei:** `server/fileUpload.ts`

### Funktionalität

- Fahrzeugpapiere-Upload bei Auftragserstellung
- Foto-Upload bei Abholung (Fahrzeugzustand vorher)
- Foto-Upload bei Übergabe (Fahrzeugzustand nachher)
- Automatische Bildoptimierung mit Sharp
- Digitale Unterschrift
- PDF-Export des Übergabeprotokolls

### Verwendung

```typescript
import { uploadVehicleDocument, uploadHandoverPhoto, generateHandoverProtocol } from './server/fileUpload';

// Dokument hochladen
await uploadVehicleDocument(orderId, fileBuffer, 'fahrzeugpapiere.pdf', 'vehicle_papers');

// Fotos hochladen
const beforePhoto = await uploadHandoverPhoto(orderId, imageBuffer, 'before');
const afterPhoto = await uploadHandoverPhoto(orderId, imageBuffer, 'after');

// Übergabeprotokoll generieren
const protocol = await generateHandoverProtocol(
  orderId,
  beforePhotoUrl,
  afterPhotoUrl,
  driverSignature,
  clientSignature,
  notes
);
```

---

## 7. Dashboard-Diagramme und Analytics

**Datei:** `server/analytics.ts`

### Funktionalität

- Umsatz-Diagramme (30/90/365 Tage)
- Aufträge nach Status (Pie Chart)
- Top-Fahrer Ranking
- Durchschnittliche Überführungszeit
- Geografische Heatmap
- Benutzer-Wachstum-Diagramm
- Dashboard-Metriken

### Verwendung

```typescript
import { getRevenueData, getOrderStatusStats, getTopDrivers, getDashboardMetrics } from './server/analytics';

const revenue = await getRevenueData(30);
const statusStats = await getOrderStatusStats();
const topDrivers = await getTopDrivers(10);
const metrics = await getDashboardMetrics();
```

---

## 8. Mobile PWA mit Offline-Funktionalität

**Dateien:** `client/public/manifest.json`, `client/public/service-worker.js`

### Funktionalität

- Progressive Web App Installation
- Offline-Funktionalität
- Push-Benachrichtigungen
- Kamera-Integration für Foto-Upload
- GPS-Integration für Standort-Tracking
- "Zur Startseite hinzufügen"-Funktion
- Background Sync

### Konfiguration

Die `manifest.json` definiert:
- App-Name und Icons
- Display-Modus (Standalone)
- Theme- und Background-Farben
- Shortcuts für schnelle Navigation
- Share-Target für Dateifreigabe

Der Service Worker (`service-worker.js`) bietet:
- Asset-Caching
- Network-First für APIs
- Background Sync
- Push-Notification-Handling

---

## 9. KI-basierte Fahrerzuweisung

**Datei:** `server/driverMatching.ts`

### Funktionalität

- Intelligente Fahrer-Matching-Algorithmus
- Berücksichtigung von:
  - Entfernung zum Abholort
  - Bewertung und Erfahrung
  - Verfügbarkeit am gewünschten Datum
  - Fahrzeugtyp-Spezialisierung
- Top-5 Fahrer-Vorschläge
- Admin-Genehmigung für Vorschlag

### Verwendung

```typescript
import { findBestDrivers, getRecommendedDriver, assignDriver } from './server/driverMatching';

// Top 5 Fahrer finden
const matches = await findBestDrivers(orderId, 5);

// Besten Fahrer empfehlen
const recommended = await getRecommendedDriver(orderId);

// Fahrer zuweisen
await assignDriver(orderId, driverId);
```

### Matching-Score

Der Score (0-100) basiert auf:
- Fahrzeugtyp-Match: 25 Punkte
- Bewertung: 20 Punkte
- Erfahrung: 15 Punkte
- Abgeschlossene Aufträge: 10 Punkte

---

## 10. Versicherungspartner-Integration

**Datei:** `server/insurance.ts`

### Funktionalität

- Automatische Versicherungspolice für jede Überführung
- Schadensmeldungs-Interface
- Versicherungsbedingungen-Display
- Versicherungs-Validierung vor Auszahlung
- Claim-Tracking

### Verwendung

```typescript
import { createInsurancePolicy, reportClaim, validateInsuranceCoverage } from './server/insurance';

// Versicherungspolice erstellen
const policy = await createInsurancePolicy(orderId, coverageAmount);

// Schadensfall melden
const claim = await reportClaim(orderId, description, damagePhotos, estimatedCost);

// Versicherungsschutz validieren
const isValid = await validateInsuranceCoverage(orderId);
```

---

## Integrationsanleitung

### Schritt 1: Abhängigkeiten installieren

```bash
pnpm add stripe socket.io socket.io-client nodemailer sharp
```

### Schritt 2: Umgebungsvariablen konfigurieren

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# E-Mail
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASSWORD=...
FROM_EMAIL=noreply@amarenlogist.com
```

### Schritt 3: Datenbank-Schema aktualisieren

```bash
pnpm db:push
```

### Schritt 4: API-Endpoints erweitern

Fügen Sie die neuen Module zu `server/routers.ts` hinzu:

```typescript
import { createCheckoutSession } from './payments';
import { sendOrderConfirmationEmail } from './email';
import { submitRating } from './ratings';
// ... weitere Imports
```

### Schritt 5: Frontend-Integration

Integrieren Sie die neuen Features in die React-Komponenten:

```typescript
import { trpc } from '@/lib/trpc';

// Beispiel: Zahlungs-Integration
const { mutate: createPayment } = trpc.payments.createCheckoutSession.useMutation();
```

---

## Testing

Alle neuen Features sollten mit Vitest getestet werden:

```bash
pnpm test
```

Beispiel-Tests sind in `server/payments.test.ts` und `server/ratings.test.ts` vorhanden.

---

## Deployment-Checklist

- [ ] Alle Umgebungsvariablen konfiguriert
- [ ] Datenbank-Migrationen ausgeführt
- [ ] Tests bestanden (pnpm test)
- [ ] Stripe-Webhooks eingerichtet
- [ ] SMTP-Server konfiguriert
- [ ] Service Worker registriert
- [ ] PWA-Icons erstellt
- [ ] SSL/TLS aktiviert
- [ ] Monitoring eingerichtet

---

## Support und Wartung

Für Updates oder Probleme mit den erweiterten Features:

1. Prüfen Sie die Logs: `tail -f /var/log/amarenlogist.log`
2. Validieren Sie die Konfiguration
3. Führen Sie Tests aus: `pnpm test`
4. Kontaktieren Sie den Support: https://help.manus.im

---

**Version:** 1.1.0  
**Datum:** 25. Dezember 2024  
**Status:** Produktionsbereit

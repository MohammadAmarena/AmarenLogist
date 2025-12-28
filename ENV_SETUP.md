# AmarenLogist Environment Setup Guide

## 📋 Übersicht

Dieses Dokument beschreibt alle Environment Variables, die Sie für AmarenLogist benötigen, und wie Sie diese konfigurieren.

---

## 🚀 Schnelleinstieg (Quick Start)

### 1. Projekt klonen/öffnen in VSCode

```bash
# Projekt öffnen
cd /home/ubuntu/amarenlogist
code .
```

### 2. Dependencies installieren

```bash
# Im Terminal (VSCode: Ctrl+`)
pnpm install
```

### 3. Environment Variables konfigurieren

Gehen Sie zu **Settings → Secrets** im Manus Dashboard und tragen Sie folgende Werte ein:

---

## 🔐 Environment Variables - Vollständige Liste

### A. DATABASE CONFIGURATION

```
DATABASE_URL="mysql://user:password@localhost:3306/amarenlogist"
```

**Was ist das?** Verbindungsstring zu Ihrer MySQL/TiDB Datenbank

**Wie bekommen Sie den Wert?**
- Wenn Sie Manus hosting verwenden: Automatisch bereitgestellt
- Lokal: `mysql://root:password@localhost:3306/amarenlogist`

**Im Code verwendet:** `server/db.ts`

---

### B. AUTHENTICATION & SECURITY

#### JWT_SECRET
```
JWT_SECRET="your-jwt-secret-key-here-change-this"
```

**Was ist das?** Geheimer Schlüssel für JWT Token-Signierung

**Wie bekommen Sie den Wert?**
```bash
# Terminal:
openssl rand -base64 32
```

**Im Code verwendet:** `server/_core/context.ts`, `server/auth.ts`

---

#### VITE_APP_ID
```
VITE_APP_ID="your-manus-app-id"
```

**Was ist das?** Ihre Manus OAuth Application ID

**Wie bekommen Sie den Wert?**
- Im Manus Dashboard: **Settings → OAuth**
- Automatisch bereitgestellt

**Im Code verwendet:** `server/_core/oauth.ts`, `client/src/_core/hooks/useAuth.ts`

---

#### OWNER_NAME & OWNER_OPEN_ID
```
OWNER_NAME="Mohammad Amaren"
OWNER_OPEN_ID="your-owner-open-id"
```

**Was ist das?** Informationen des Plattform-Besitzers

**Wie bekommen Sie den Wert?**
- Im Manus Dashboard automatisch gesetzt

**Im Code verwendet:** `server/db.ts`, `server/_core/env.ts`

---

### C. STRIPE PAYMENT CONFIGURATION

#### STRIPE_SECRET_KEY
```
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
```

**Was ist das?** Geheimer API-Schlüssel für Stripe (Backend)

**Wie bekommen Sie den Wert?**
1. Gehen Sie zu https://dashboard.stripe.com/apikeys
2. Kopieren Sie den **Secret Key** (beginnt mit `sk_test_` oder `sk_live_`)

**Im Code verwendet:** `server/stripePaymentService.ts`

**⚠️ WICHTIG:** 
- Für Development: `sk_test_...` verwenden
- Für Production: `sk_live_...` verwenden

---

#### STRIPE_PUBLISHABLE_KEY
```
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
```

**Was ist das?** Öffentlicher API-Schlüssel für Stripe (Frontend)

**Wie bekommen Sie den Wert?**
1. Gehen Sie zu https://dashboard.stripe.com/apikeys
2. Kopieren Sie den **Publishable Key** (beginnt mit `pk_test_` oder `pk_live_`)

**Im Code verwendet:** 
- `client/src/pages/PaymentCheckout.tsx`
- `server/stripePaymentService.ts`

---

#### STRIPE_WEBHOOK_SECRET
```
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

**Was ist das?** Geheimer Schlüssel für Stripe Webhooks (Zahlungsbestätigungen)

**Wie bekommen Sie den Wert?**
1. Gehen Sie zu https://dashboard.stripe.com/webhooks
2. Erstellen Sie einen neuen Webhook Endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `charge.failed`, `charge.refunded`
3. Kopieren Sie den **Signing Secret**

**Im Code verwendet:** `server/stripePaymentService.ts`

---

### D. EMAIL CONFIGURATION

#### SENDGRID_API_KEY
```
SENDGRID_API_KEY="SG.your_sendgrid_api_key_here"
```

**Was ist das?** API-Schlüssel für E-Mail-Versand via SendGrid

**Wie bekommen Sie den Wert?**
1. Registrieren Sie sich bei https://sendgrid.com
2. Gehen Sie zu **Settings → API Keys**
3. Erstellen Sie einen neuen API Key
4. Kopieren Sie den Schlüssel

**Im Code verwendet:** `server/email.ts`

**Alternative:** Verwenden Sie Mailgun statt SendGrid

---

#### EMAIL_FROM & EMAIL_FROM_NAME
```
EMAIL_FROM="noreply@amarenlogist.com"
EMAIL_FROM_NAME="AmarenLogist"
```

**Was ist das?** Absender-E-Mail-Adresse für automatische E-Mails

**Wie bekommen Sie den Wert?**
- Beliebig, aber sollte mit Ihrer Domain übereinstimmen

**Im Code verwendet:** `server/email.ts`

---

### E. SMS CONFIGURATION (Twilio)

#### TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN
```
TWILIO_ACCOUNT_SID="AC_your_account_sid_here"
TWILIO_AUTH_TOKEN="your_auth_token_here"
```

**Was ist das?** Authentifizierungsdaten für Twilio SMS-Versand

**Wie bekommen Sie den Wert?**
1. Registrieren Sie sich bei https://www.twilio.com
2. Gehen Sie zu **Console → Account**
3. Kopieren Sie **Account SID** und **Auth Token**

**Im Code verwendet:** `server/smsNotifications.ts`

---

#### TWILIO_PHONE_NUMBER
```
TWILIO_PHONE_NUMBER="+49123456789"
```

**Was ist das?** Ihre Twilio Telefonnummer für SMS-Versand

**Wie bekommen Sie den Wert?**
1. Im Twilio Console: **Phone Numbers → Manage Numbers**
2. Kopieren Sie Ihre Nummer im Format `+49...`

**Im Code verwendet:** `server/smsNotifications.ts`

---

### F. FILE STORAGE (AWS S3)

#### AWS_S3_BUCKET, AWS_S3_REGION, AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY
```
AWS_S3_BUCKET="amarenlogist-files"
AWS_S3_REGION="eu-central-1"
AWS_S3_ACCESS_KEY_ID="your_aws_access_key_here"
AWS_S3_SECRET_ACCESS_KEY="your_aws_secret_key_here"
```

**Was ist das?** AWS S3 Konfiguration für Datei-Upload (Dokumente, Fotos)

**Wie bekommen Sie den Wert?**
1. Gehen Sie zu https://console.aws.amazon.com
2. Erstellen Sie einen S3 Bucket: **S3 → Create Bucket**
3. Erstellen Sie einen IAM User: **IAM → Users → Add User**
4. Geben Sie dem User S3 Zugriff
5. Kopieren Sie **Access Key ID** und **Secret Access Key**

**Im Code verwendet:** `server/fileUpload.ts`, `server/storage.ts`

---

### G. BUSINESS CONFIGURATION

#### SYSTEM_COMMISSION_PERCENTAGE
```
SYSTEM_COMMISSION_PERCENTAGE="10"
```

**Was ist das?** Systemgebühr in Prozent (z.B. 10% von jeder Zahlung)

**Wie bekommen Sie den Wert?**
- Beliebig, abhängig von Ihrem Geschäftsmodell
- Beispiel: 10 = 10%

**Im Code verwendet:** `server/pricing.ts`

---

#### INSURANCE_FEE_PERCENTAGE
```
INSURANCE_FEE_PERCENTAGE="15"
```

**Was ist das?** Versicherungsgebühr in Prozent

**Wie bekommen Sie den Wert?**
- Standardmäßig: 15% (wie in ONLOGIST)

**Im Code verwendet:** `server/pricing.ts`

---

#### MIN_ORDER_AMOUNT & MAX_ORDER_AMOUNT
```
MIN_ORDER_AMOUNT="50"
MAX_ORDER_AMOUNT="10000"
```

**Was ist das?** Minimaler und maximaler Auftragsbetrag in EUR

**Wie bekommen Sie den Wert?**
- MIN_ORDER_AMOUNT: 50 EUR (Beispiel)
- MAX_ORDER_AMOUNT: 10000 EUR (Beispiel)

**Im Code verwendet:** `server/orders.ts`

---

### H. FRONTEND CONFIGURATION

#### VITE_FRONTEND_URL & VITE_BACKEND_URL
```
VITE_FRONTEND_URL="http://localhost:5173"
VITE_BACKEND_URL="http://localhost:3000"
```

**Was ist das?** URLs für Frontend und Backend

**Wie bekommen Sie den Wert?**
- Development: `http://localhost:5173` (Frontend), `http://localhost:3000` (Backend)
- Production: Ihre Domain URLs

**Im Code verwendet:** `client/src/lib/trpc.ts`

---

### I. MANUS BUILT-IN APIS

```
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="your_forge_api_key_here"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your_frontend_forge_api_key_here"
```

**Was ist das?** Manus Platform APIs für LLM, Storage, Notifications

**Wie bekommen Sie den Wert?**
- Automatisch bereitgestellt im Manus Dashboard

**Im Code verwendet:** `server/_core/llm.ts`, `server/storage.ts`

---

## 📝 Schritt-für-Schritt Setup

### Schritt 1: Projekt öffnen

```bash
# VSCode öffnen
code /home/ubuntu/amarenlogist
```

### Schritt 2: Terminal öffnen

```
Ctrl + ` (oder View → Terminal)
```

### Schritt 3: Dependencies installieren

```bash
pnpm install
```

### Schritt 4: Environment Variables in Manus Dashboard setzen

1. Gehen Sie zu **Settings → Secrets**
2. Tragen Sie folgende Werte ein:

| Variable | Wert | Priorität |
|----------|------|-----------|
| `STRIPE_SECRET_KEY` | sk_test_... | 🔴 Kritisch |
| `STRIPE_PUBLISHABLE_KEY` | pk_test_... | 🔴 Kritisch |
| `JWT_SECRET` | openssl rand -base64 32 | 🔴 Kritisch |
| `SENDGRID_API_KEY` | SG.... | 🟡 Wichtig |
| `TWILIO_ACCOUNT_SID` | AC_... | 🟡 Wichtig |
| `TWILIO_AUTH_TOKEN` | ... | 🟡 Wichtig |
| `TWILIO_PHONE_NUMBER` | +49... | 🟡 Wichtig |
| `AWS_S3_ACCESS_KEY_ID` | ... | 🟡 Wichtig |
| `AWS_S3_SECRET_ACCESS_KEY` | ... | 🟡 Wichtig |

### Schritt 5: Entwicklungsserver starten

```bash
pnpm dev
```

### Schritt 6: Im Browser öffnen

```
http://localhost:3000
```

---

## 🔧 Konfiguration nach Umgebung

### Development (lokal)

```bash
NODE_ENV="development"
STRIPE_SECRET_KEY="sk_test_..." (Stripe Test Keys)
DATABASE_URL="mysql://root:password@localhost:3306/amarenlogist"
VITE_BACKEND_URL="http://localhost:3000"
```

### Production (Live)

```bash
NODE_ENV="production"
STRIPE_SECRET_KEY="sk_live_..." (Stripe Live Keys)
DATABASE_URL="mysql://prod_user:prod_password@prod_host:3306/amarenlogist"
VITE_BACKEND_URL="https://amarenlogist.com"
SSL_ENABLED="true"
```

---

## ✅ Checkliste nach Setup

- [ ] Alle kritischen Variables gesetzt (Stripe, JWT, Database)
- [ ] `pnpm install` erfolgreich ausgeführt
- [ ] `pnpm dev` läuft ohne Fehler
- [ ] Frontend erreichbar unter http://localhost:3000
- [ ] Login funktioniert (amarenlogist/amarenlogist555)
- [ ] Stripe Checkout funktioniert
- [ ] E-Mails werden versendet
- [ ] SMS werden versendet

---

## 🆘 Häufige Fehler

### Fehler: "DATABASE_URL is not set"
**Lösung:** Setzen Sie `DATABASE_URL` in Manus Settings → Secrets

### Fehler: "Stripe API key is invalid"
**Lösung:** 
- Überprüfen Sie, dass Sie `sk_test_` oder `sk_live_` verwenden
- Kopieren Sie den kompletten Schlüssel ohne Leerzeichen

### Fehler: "SENDGRID_API_KEY is not set"
**Lösung:** Setzen Sie `SENDGRID_API_KEY` in Manus Settings → Secrets

### Fehler: "Cannot connect to database"
**Lösung:**
- Überprüfen Sie DATABASE_URL
- Stellen Sie sicher, dass MySQL läuft
- Testen Sie die Verbindung: `mysql -u user -p -h localhost amarenlogist`

---

## 📚 Weitere Ressourcen

- [Stripe Documentation](https://stripe.com/docs)
- [SendGrid Documentation](https://sendgrid.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Manus Documentation](https://docs.manus.im)

---

## 🎯 Nächste Schritte

1. ✅ Alle Environment Variables setzen
2. ✅ `pnpm install` ausführen
3. ✅ `pnpm dev` starten
4. ✅ Im Browser testen: http://localhost:3000
5. ✅ Login testen: amarenlogist/amarenlogist555
6. ✅ Stripe Zahlung testen (mit Test-Kartennummern)
7. ✅ Produktiv deployen (siehe DEPLOYMENT.md)

---

**Fragen?** Kontaktieren Sie support@amarenlogist.com

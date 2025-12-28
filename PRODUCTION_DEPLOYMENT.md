# AmarenLogist - Production Deployment Guide

## 🚀 Vollständige Anleitung für Production-Einsatz

Dieses Dokument beschreibt alle Schritte, um AmarenLogist produktiv zu deployen und zetologist.com von Hostinger zu verbinden.

---

## 📋 Phase 1: Environment Variables in Manus Dashboard eintragen

### Schritt 1.1: Manus Dashboard öffnen

1. Gehen Sie zu: https://manus.im
2. Melden Sie sich an
3. Gehen Sie zu Ihrem Projekt Dashboard
4. Klicken Sie auf **Settings** (Zahnrad-Icon)

### Schritt 1.2: Secrets Panel öffnen

Klicken Sie auf **Secrets** im linken Menü

### Schritt 1.3: Kritische Variables eintragen

Tragen Sie folgende Werte ein (kopieren Sie aus den entsprechenden Services):

#### 1. STRIPE_SECRET_KEY

**Was:** Geheimer API-Schlüssel für Stripe (Backend)

**Wie bekommen:**
1. Gehen Sie zu https://dashboard.stripe.com/apikeys
2. Kopieren Sie den **Secret Key** (beginnt mit `sk_test_` oder `sk_live_`)

**Wert eintragen:**
```
sk_test_YOUR_STRIPE_SECRET_KEY_HERE
```

#### 2. STRIPE_PUBLISHABLE_KEY

**Was:** Öffentlicher API-Schlüssel für Stripe (Frontend)

**Wie bekommen:**
1. Gehen Sie zu https://dashboard.stripe.com/apikeys
2. Kopieren Sie den **Publishable Key** (beginnt mit `pk_test_` oder `pk_live_`)

**Wert eintragen:**
```
pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

#### 3. STRIPE_WEBHOOK_SECRET

**Was:** Geheimer Schlüssel für Stripe Webhooks

**Wie bekommen:**
1. Gehen Sie zu https://dashboard.stripe.com/webhooks
2. Klicken Sie auf **Add endpoint**
3. URL eingeben: `https://zetologist.com/api/webhooks/stripe`
4. Events wählen: `checkout.session.completed`, `charge.failed`, `charge.refunded`
5. Klicken Sie auf **Add endpoint**
6. Kopieren Sie den **Signing secret**

**Wert eintragen:**
```
whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE
```

#### 4. JWT_SECRET

**Was:** Geheimer Schlüssel für JWT Token-Signierung

**Wie bekommen:**
```bash
# Im Terminal:
openssl rand -base64 32
```

**Wert eintragen:**
```
YOUR_SECURE_JWT_SECRET_HERE_GENERATE_WITH_OPENSsl_RAND
```

#### 5. SENDGRID_API_KEY

**Was:** API-Schlüssel für E-Mail-Versand

**Wie bekommen:**
1. Registrieren Sie sich bei https://sendgrid.com
2. Gehen Sie zu **Settings → API Keys**
3. Klicken Sie auf **Create API Key**
4. Geben Sie einen Namen ein (z.B. "AmarenLogist")
5. Kopieren Sie den API Key

**Wert eintragen:**
```
SG.YOUR_SENDGRID_API_KEY_HERE
```

#### 6. TWILIO_ACCOUNT_SID

**Was:** Twilio Account ID für SMS-Versand

**Wie bekommen:**
1. Registrieren Sie sich bei https://www.twilio.com
2. Gehen Sie zu **Console → Account**
3. Kopieren Sie **Account SID**

**Wert eintragen:**
```
AC_YOUR_TWILIO_ACCOUNT_SID_HERE
```

#### 7. TWILIO_AUTH_TOKEN

**Was:** Twilio Authentication Token

**Wie bekommen:**
1. Im Twilio Console
2. Kopieren Sie **Auth Token**

**Wert eintragen:**
```
YOUR_TWILIO_AUTH_TOKEN_HERE
```

#### 8. TWILIO_PHONE_NUMBER

**Was:** Ihre Twilio Telefonnummer für SMS-Versand

**Wie bekommen:**
1. Im Twilio Console: **Phone Numbers → Manage Numbers**
2. Kopieren Sie Ihre Nummer im Format `+49...`

**Wert eintragen:**
```
+49123456789
```

#### 9. AWS_S3_ACCESS_KEY_ID

**Was:** AWS Access Key für S3 Datei-Upload

**Wie bekommen:**
1. Gehen Sie zu https://console.aws.amazon.com
2. Erstellen Sie einen S3 Bucket: **S3 → Create Bucket**
3. Erstellen Sie einen IAM User: **IAM → Users → Add User**
4. Geben Sie dem User S3 Zugriff
5. Kopieren Sie **Access Key ID**

**Wert eintragen:**
```
AKIA_YOUR_AWS_ACCESS_KEY_ID_HERE
```

#### 10. AWS_S3_SECRET_ACCESS_KEY

**Was:** AWS Secret Key für S3

**Wie bekommen:**
1. Vom IAM User (siehe oben)
2. Kopieren Sie **Secret Access Key**

**Wert eintragen:**
```
YOUR_AWS_SECRET_ACCESS_KEY_HERE
```

### Schritt 1.4: Weitere wichtige Variables

Tragen Sie auch folgende Variables ein (falls noch nicht vorhanden):

- `DATABASE_URL` - MySQL Verbindungsstring
- `VITE_BACKEND_URL` - Backend URL (https://zetologist.com)
- `VITE_FRONTEND_URL` - Frontend URL (https://zetologist.com)
- `EMAIL_FROM` - Absender-E-Mail (noreply@zetologist.com)
- `EMAIL_FROM_NAME` - Absender-Name (AmarenLogist)

---

## 📊 Phase 2: Datenbank-Backups und Monitoring

### Schritt 2.1: Automatische Backups einrichten

#### Option A: Mit Manus (empfohlen)

Manus erstellt automatisch tägliche Backups. Überprüfen Sie:

1. Gehen Sie zu **Settings → Database**
2. Überprüfen Sie, dass Backups aktiviert sind
3. Backup-Häufigkeit: täglich oder stündlich

#### Option B: Mit MySQL Dump (manuell)

```bash
# Backup erstellen
mysqldump -u user -p amarenlogist > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup wiederherstellen
mysql -u user -p amarenlogist < backup_20240101_120000.sql
```

### Schritt 2.2: Monitoring einrichten

#### Option A: Mit Sentry (Error-Tracking)

1. Registrieren Sie sich bei https://sentry.io
2. Erstellen Sie ein neues Projekt (Node.js)
3. Kopieren Sie den DSN
4. Tragen Sie `SENTRY_DSN` in Manus Settings ein
5. Im Code wird automatisch Error-Tracking aktiviert

#### Option B: Mit LogRocket (Session-Replay)

1. Registrieren Sie sich bei https://logrocket.com
2. Erstellen Sie ein neues Projekt
3. Kopieren Sie den App ID
4. Tragen Sie `LOGROCKET_APP_ID` in Manus Settings ein

### Schritt 2.3: Health Check einrichten

Erstellen Sie einen Health Check Endpoint:

```bash
# Im Terminal testen:
curl https://zetologist.com/api/health
```

Sollte zurückgeben:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected"
}
```

---

## 🔒 Phase 3: SSL/TLS und CORS konfigurieren

### Schritt 3.1: SSL/TLS aktivieren

#### Mit Manus (automatisch)

Manus aktiviert automatisch SSL/TLS mit Let's Encrypt. Überprüfen Sie:

1. Gehen Sie zu **Settings → Domains**
2. Überprüfen Sie, dass SSL aktiviert ist (grünes Schloss)
3. Zertifikat sollte automatisch erneuert werden

#### Mit Hostinger (manuell)

1. Gehen Sie zu Hostinger Dashboard: https://hpanel.hostinger.com
2. Gehen Sie zu **SSL/TLS → Manage SSL**
3. Wählen Sie **Let's Encrypt (Free)**
4. Klicken Sie auf **Install**
5. Warten Sie auf Bestätigung (5-10 Minuten)

### Schritt 3.2: CORS konfigurieren

Bearbeiten Sie `server/_core/index.ts`:

```typescript
import cors from "cors";

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    "https://zetologist.com",
    "https://www.zetologist.com",
    "http://localhost:5173", // Development
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

### Schritt 3.3: Security Headers hinzufügen

```typescript
import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 🌐 Phase 4: Domain zetologist.com von Hostinger verbinden

### Schritt 4.1: Domain bei Hostinger überprüfen

1. Gehen Sie zu https://hpanel.hostinger.com
2. Klicken Sie auf **Domains**
3. Überprüfen Sie, dass `zetologist.com` vorhanden ist

### Schritt 4.2: Nameserver bei Manus konfigurieren

#### Option A: Manus Nameserver verwenden (empfohlen)

1. Gehen Sie zu Manus Dashboard: **Settings → Domains**
2. Klicken Sie auf **Add Domain**
3. Geben Sie `zetologist.com` ein
4. Kopieren Sie die Manus Nameserver:
   ```
   ns1.manus.im
   ns2.manus.im
   ns3.manus.im
   ns4.manus.im
   ```

5. Gehen Sie zu Hostinger: **Domains → zetologist.com → Nameservers**
6. Klicken Sie auf **Edit Nameservers**
7. Ersetzen Sie die Nameserver mit den Manus Nameservern
8. Speichern Sie die Änderungen

**Warten Sie 24-48 Stunden auf DNS-Propagation**

#### Option B: DNS Records bei Hostinger konfigurieren

Falls Sie Hostinger Nameserver behalten möchten:

1. Gehen Sie zu Hostinger: **Domains → zetologist.com → DNS Records**
2. Fügen Sie folgende Records hinzu:

**A Record:**
```
Type: A
Name: @
Value: <Manus Server IP>
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: zetologist.com
TTL: 3600
```

**MX Record (für E-Mail):**
```
Type: MX
Name: @
Value: mail.zetologist.com
Priority: 10
TTL: 3600
```

### Schritt 4.3: DNS-Propagation überprüfen

```bash
# Im Terminal:
nslookup zetologist.com
dig zetologist.com

# Sollte zeigen:
# zetologist.com. 3600 IN A <Manus Server IP>
```

### Schritt 4.4: SSL-Zertifikat für Domain

1. Gehen Sie zu Manus Dashboard: **Settings → Domains**
2. Klicken Sie auf `zetologist.com`
3. Überprüfen Sie, dass SSL aktiviert ist
4. Zertifikat sollte automatisch erstellt werden (Let's Encrypt)

### Schritt 4.5: Domain testen

```bash
# HTTPS überprüfen
curl -I https://zetologist.com

# Sollte zeigen:
# HTTP/2 200
# Strict-Transport-Security: max-age=31536000
```

---

## ✅ Deployment Checkliste

### Vor dem Go-Live

- [ ] Alle Environment Variables in Manus Dashboard gesetzt
- [ ] Stripe Keys konfiguriert (Test-Keys für Staging, Live-Keys für Production)
- [ ] SendGrid API Key gesetzt
- [ ] Twilio Credentials gesetzt
- [ ] AWS S3 Zugriff konfiguriert
- [ ] Datenbank-Backups aktiviert
- [ ] SSL/TLS aktiviert
- [ ] CORS konfiguriert
- [ ] Domain zetologist.com verbunden
- [ ] DNS-Propagation abgeschlossen (24-48 Stunden)

### Nach dem Go-Live

- [ ] Website erreichbar unter https://zetologist.com
- [ ] Login funktioniert (amarenlogist/amarenlogist555)
- [ ] Stripe Zahlung funktioniert (mit Test-Kartennummern)
- [ ] E-Mails werden versendet
- [ ] SMS werden versendet
- [ ] Datenbank-Backups laufen
- [ ] Monitoring aktiv (Sentry/LogRocket)
- [ ] SSL-Zertifikat gültig
- [ ] Performance akzeptabel (< 2 Sekunden Ladezeit)

---

## 🔧 Häufige Probleme und Lösungen

### Problem: "Domain nicht erreichbar"

**Lösung:**
1. Überprüfen Sie DNS-Propagation: `nslookup zetologist.com`
2. Warten Sie 24-48 Stunden
3. Überprüfen Sie Nameserver bei Hostinger

### Problem: "SSL-Zertifikat ungültig"

**Lösung:**
1. Gehen Sie zu Manus: **Settings → Domains**
2. Klicken Sie auf **Renew Certificate**
3. Warten Sie 5-10 Minuten

### Problem: "Stripe Zahlung funktioniert nicht"

**Lösung:**
1. Überprüfen Sie `STRIPE_SECRET_KEY` in Manus Settings
2. Überprüfen Sie, dass Sie `sk_test_` verwenden (nicht `sk_live_`)
3. Überprüfen Sie Stripe Webhook: https://dashboard.stripe.com/webhooks

### Problem: "E-Mails werden nicht versendet"

**Lösung:**
1. Überprüfen Sie `SENDGRID_API_KEY` in Manus Settings
2. Überprüfen Sie SendGrid Logs: https://app.sendgrid.com/email_activity
3. Überprüfen Sie E-Mail-Adresse in `EMAIL_FROM`

---

## 📞 Support und Kontakt

Wenn Sie Probleme haben:

1. **Logs überprüfen:** Manus Dashboard → Logs
2. **Dokumentation:** ENV_SETUP.md, VSCODE_SETUP.md
3. **Stripe Support:** https://support.stripe.com
4. **Manus Support:** https://help.manus.im

---

## 🎉 Gratulation!

Sie haben AmarenLogist erfolgreich deployed! 🚀

**Nächste Schritte:**
1. Testen Sie alle Features
2. Sammeln Sie Feedback von Benutzern
3. Optimieren Sie basierend auf Feedback
4. Skalieren Sie das Fahrdienst-Netzwerk

---

**Viel Erfolg mit AmarenLogist! 💪**

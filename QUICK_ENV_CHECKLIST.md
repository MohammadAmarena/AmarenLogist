# AmarenLogist - Schnell-Referenz Environment Setup

## ⚡ 5-Minuten Setup

### Schritt 1: VSCode öffnen
```bash
code /home/ubuntu/amarenlogist
```

### Schritt 2: Terminal öffnen
```
Ctrl + `
```

### Schritt 3: Dependencies installieren
```bash
pnpm install
```

### Schritt 4: Environment Variables in Manus Dashboard setzen

Gehen Sie zu: **Manus Dashboard → Settings → Secrets**

Fügen Sie folgende Werte ein:

| Variable | Wert | Quelle |
|----------|------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | https://dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | https://dashboard.stripe.com/apikeys |
| `JWT_SECRET` | `openssl rand -base64 32` | Terminal |
| `SENDGRID_API_KEY` | `SG....` | https://sendgrid.com/settings/api_keys |
| `TWILIO_ACCOUNT_SID` | `AC_...` | https://www.twilio.com/console |
| `TWILIO_AUTH_TOKEN` | `...` | https://www.twilio.com/console |
| `TWILIO_PHONE_NUMBER` | `+49...` | https://www.twilio.com/console/phone-numbers |

### Schritt 5: Datenbank initialisieren
```bash
pnpm db:push
```

### Schritt 6: Server starten
```bash
pnpm dev
```

### Schritt 7: Im Browser öffnen
```
http://localhost:3000
```

### Schritt 8: Login testen
```
Benutzername: amarenlogist
Passwort: amarenlogist555
```

---

## 📋 Environment Variables Checkliste

### 🔴 KRITISCH (müssen gesetzt sein)

- [ ] `DATABASE_URL` - MySQL Verbindung
- [ ] `JWT_SECRET` - Session Token Secret
- [ ] `STRIPE_SECRET_KEY` - Stripe Backend Key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe Frontend Key

### 🟡 WICHTIG (für E-Mail & SMS)

- [ ] `SENDGRID_API_KEY` - E-Mail Versand
- [ ] `TWILIO_ACCOUNT_SID` - SMS Versand
- [ ] `TWILIO_AUTH_TOKEN` - SMS Authentifizierung
- [ ] `TWILIO_PHONE_NUMBER` - SMS Telefonnummer

### 🟢 OPTIONAL (für Datei-Upload)

- [ ] `AWS_S3_ACCESS_KEY_ID` - S3 Zugriff
- [ ] `AWS_S3_SECRET_ACCESS_KEY` - S3 Secret

---

## 🔑 Wie bekomme ich die Werte?

### JWT_SECRET generieren
```bash
openssl rand -base64 32
```

### Stripe Keys
1. Gehen Sie zu https://dashboard.stripe.com/apikeys
2. Kopieren Sie `Secret Key` und `Publishable Key`
3. Verwenden Sie `sk_test_` und `pk_test_` für Development

### SendGrid API Key
1. Registrieren Sie sich bei https://sendgrid.com
2. Gehen Sie zu **Settings → API Keys**
3. Erstellen Sie einen neuen API Key
4. Kopieren Sie den Wert

### Twilio Credentials
1. Registrieren Sie sich bei https://www.twilio.com
2. Gehen Sie zu **Console → Account**
3. Kopieren Sie **Account SID** und **Auth Token**
4. Gehen Sie zu **Phone Numbers → Manage Numbers**
5. Kopieren Sie Ihre Nummer (Format: `+49...`)

### AWS S3 Keys
1. Gehen Sie zu https://console.aws.amazon.com
2. Erstellen Sie einen S3 Bucket
3. Erstellen Sie einen IAM User mit S3 Zugriff
4. Kopieren Sie **Access Key ID** und **Secret Access Key**

---

## 🧪 Nach dem Setup testen

```bash
# 1. Tests ausführen
pnpm test

# 2. Server starten
pnpm dev

# 3. Im Browser öffnen
# http://localhost:3000

# 4. Login testen
# amarenlogist / amarenlogist555

# 5. Stripe Zahlung testen
# Gehen Sie zu /payment/checkout/1
# Verwenden Sie Test-Kartennummer: 4242 4242 4242 4242
```

---

## 🆘 Häufige Fehler

| Fehler | Lösung |
|--------|--------|
| `DATABASE_URL is not set` | Setzen Sie DATABASE_URL in Manus Settings → Secrets |
| `Stripe API key is invalid` | Überprüfen Sie, dass Sie `sk_test_` verwenden |
| `Cannot find module` | Führen Sie `pnpm install` aus |
| `Port 3000 already in use` | Verwenden Sie `PORT=3001 pnpm dev` |
| `SENDGRID_API_KEY is not set` | Setzen Sie SENDGRID_API_KEY in Manus Settings |

---

## 📚 Weitere Dokumentation

- **ENV_SETUP.md** - Detaillierte Erklärung aller Variables
- **VSCODE_SETUP.md** - Schritt-für-Schritt VSCode Setup
- **DOCUMENTATION.md** - Vollständige Projekt-Dokumentation

---

## 🚀 Nächste Schritte

1. ✅ Alle Schritte oben abgeschlossen
2. ✅ Server läuft auf http://localhost:3000
3. ✅ Login funktioniert
4. ✅ Tests bestanden

**Jetzt können Sie:**
- Code bearbeiten und Auto-Reload nutzen
- Neue Features hinzufügen
- Tests schreiben
- Produktiv deployen

---

**Viel Erfolg! 🎉**

# AmarenLogist - VSCode Setup Anleitung

## 📋 Was Sie nach dem Öffnen in VSCode machen müssen

Folgen Sie diese Schritte genau in dieser Reihenfolge!

---

## ✅ Schritt 1: Projekt öffnen

### 1.1 VSCode öffnen
```bash
code /home/ubuntu/amarenlogist
```

### 1.2 Oder manuell:
- VSCode öffnen
- **File → Open Folder**
- Wählen Sie `/home/ubuntu/amarenlogist`

---

## ✅ Schritt 2: Terminal öffnen

Drücken Sie: **Ctrl + `** (Backtick)

Oder: **View → Terminal**

Sie sollten jetzt ein Terminal am unteren Rand sehen.

---

## ✅ Schritt 3: Dependencies installieren

Kopieren Sie diesen Befehl ins Terminal und drücken Sie Enter:

```bash
pnpm install
```

**Was passiert?**
- Alle npm Packages werden heruntergeladen (~500MB)
- Dauert 2-5 Minuten
- Sie sehen: `✓ Packages in lockfile are up to date`

**Wenn Fehler auftreten:**
```bash
# Cache löschen und erneut versuchen
pnpm store prune
pnpm install
```

---

## ✅ Schritt 4: Environment Variables in Manus Dashboard setzen

### 4.1 Manus Dashboard öffnen

Gehen Sie zu: **https://manus.im → Dashboard → Ihr Projekt**

### 4.2 Settings öffnen

Klicken Sie auf **Settings** (Zahnrad-Icon oben rechts)

### 4.3 Secrets Panel öffnen

Klicken Sie auf **Secrets** im linken Menü

### 4.4 Folgende Secrets hinzufügen

Tragen Sie diese Werte ein (kopieren Sie aus den entsprechenden Services):

#### 🔴 KRITISCH (müssen gesetzt sein):

1. **STRIPE_SECRET_KEY**
   - Wert: `sk_test_...` (von Stripe Dashboard)
   - Gehen Sie zu: https://dashboard.stripe.com/apikeys
   - Kopieren Sie den **Secret Key**

2. **STRIPE_PUBLISHABLE_KEY**
   - Wert: `pk_test_...` (von Stripe Dashboard)
   - Gehen Sie zu: https://dashboard.stripe.com/apikeys
   - Kopieren Sie den **Publishable Key**

3. **JWT_SECRET**
   - Generieren Sie einen zufälligen Wert:
   ```bash
   # Im Terminal:
   openssl rand -base64 32
   ```
   - Kopieren Sie den Output

#### 🟡 WICHTIG (für E-Mail & SMS):

4. **SENDGRID_API_KEY**
   - Registrieren Sie sich bei: https://sendgrid.com
   - Gehen Sie zu: **Settings → API Keys**
   - Erstellen Sie einen neuen API Key
   - Kopieren Sie den Wert

5. **TWILIO_ACCOUNT_SID**
   - Registrieren Sie sich bei: https://www.twilio.com
   - Gehen Sie zu: **Console → Account**
   - Kopieren Sie **Account SID**

6. **TWILIO_AUTH_TOKEN**
   - Im Twilio Console
   - Kopieren Sie **Auth Token**

7. **TWILIO_PHONE_NUMBER**
   - Im Twilio Console: **Phone Numbers → Manage Numbers**
   - Kopieren Sie Ihre Nummer (Format: `+49...`)

#### 🟢 OPTIONAL (für Datei-Upload):

8. **AWS_S3_ACCESS_KEY_ID**
   - Registrieren Sie sich bei: https://aws.amazon.com
   - Erstellen Sie einen S3 Bucket
   - Erstellen Sie einen IAM User mit S3 Zugriff
   - Kopieren Sie **Access Key ID**

9. **AWS_S3_SECRET_ACCESS_KEY**
   - Vom IAM User
   - Kopieren Sie **Secret Access Key**

---

## ✅ Schritt 5: Datenbank initialisieren

```bash
# Im Terminal:
pnpm db:push
```

**Was passiert?**
- Datenbank-Schema wird erstellt
- Tabellen werden angelegt
- Sie sehen: `✓ Pushed database schema`

---

## ✅ Schritt 6: Entwicklungsserver starten

```bash
# Im Terminal:
pnpm dev
```

**Was passiert?**
- Server startet auf Port 3000
- Sie sehen: `Server running on http://localhost:3000/`
- Frontend lädt auf Port 5173

---

## ✅ Schritt 7: Im Browser öffnen

Öffnen Sie: **http://localhost:3000**

Sie sollten die AmarenLogist Landing Page sehen.

---

## ✅ Schritt 8: Login testen

Klicken Sie auf **Login** und testen Sie mit:

**Super Admin:**
- Benutzername: `amarenlogist`
- Passwort: `amarenlogist555`

**Admin (Nur-Lese):**
- Benutzername: `zetologist`
- Passwort: `zetologist123`

---

## ✅ Schritt 9: Tests ausführen

```bash
# Im Terminal:
pnpm test
```

**Was passiert?**
- 113 Tests werden ausgeführt
- Sie sehen: `✓ 113 tests passed`

---

## 📦 Was Sie installieren müssen

### Wenn Sie noch nicht installiert haben:

1. **Node.js** (v22+)
   ```bash
   # Überprüfen Sie die Version:
   node --version
   ```

2. **pnpm** (Package Manager)
   ```bash
   # Überprüfen Sie die Version:
   pnpm --version
   
   # Wenn nicht installiert:
   npm install -g pnpm
   ```

3. **MySQL** (lokal, optional)
   ```bash
   # Wenn Sie lokal entwickeln wollen
   # macOS:
   brew install mysql
   
   # Ubuntu:
   sudo apt-get install mysql-server
   
   # Windows:
   # Laden Sie herunter: https://dev.mysql.com/downloads/mysql/
   ```

4. **VSCode Extensions** (optional, aber empfohlen)
   - **Prettier** - Code Formatter
   - **ESLint** - Code Linter
   - **Thunder Client** - API Testing
   - **Database Clients** - MySQL GUI

---

## 🎯 Typische Workflow nach Setup

### Täglich:

```bash
# 1. Terminal öffnen (Ctrl + `)
# 2. Entwicklungsserver starten
pnpm dev

# 3. Im Browser öffnen
# http://localhost:3000

# 4. Code bearbeiten (VSCode macht Auto-Reload)

# 5. Tests ausführen (wenn nötig)
pnpm test

# 6. Änderungen committen
git add .
git commit -m "Feature: ..."
```

### Datenbank-Änderungen:

```bash
# 1. Schema bearbeiten: drizzle/schema.ts
# 2. Migration pushen:
pnpm db:push

# 3. Server neustarten (Ctrl+C, dann pnpm dev)
```

### Neue Dependencies:

```bash
# 1. Package installieren
pnpm add package-name

# 2. Server neustarten
# Ctrl+C, dann pnpm dev
```

---

## 🆘 Häufige Probleme und Lösungen

### Problem: "pnpm: command not found"
**Lösung:**
```bash
npm install -g pnpm
```

### Problem: "Port 3000 already in use"
**Lösung:**
```bash
# Finden Sie den Prozess:
lsof -i :3000

# Oder starten Sie auf anderem Port:
PORT=3001 pnpm dev
```

### Problem: "DATABASE_URL is not set"
**Lösung:**
- Setzen Sie DATABASE_URL in Manus Settings → Secrets
- Oder lokal: `mysql://root:password@localhost:3306/amarenlogist`

### Problem: "Cannot find module"
**Lösung:**
```bash
# Cache löschen und neu installieren
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problem: "TypeScript errors"
**Lösung:**
```bash
# TypeScript überprüfen
pnpm check

# Oder automatisch reparieren
pnpm format
```

### Problem: "Stripe API key is invalid"
**Lösung:**
- Überprüfen Sie, dass Sie `sk_test_` verwenden (nicht `sk_live_`)
- Kopieren Sie den kompletten Schlüssel ohne Leerzeichen
- Gehen Sie zu https://dashboard.stripe.com/apikeys

---

## 📝 Dateistruktur nach Setup

```
amarenlogist/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Seiten-Komponenten
│   │   ├── components/    # UI-Komponenten
│   │   └── lib/           # Utilities
│   └── public/            # Statische Assets
├── server/                # Backend (Node.js/Express)
│   ├── routers/           # tRPC Router
│   ├── _core/             # Framework-Code
│   └── db.ts              # Datenbank-Queries
├── drizzle/               # Datenbank-Schema
│   └── schema.ts          # Tabellen-Definition
├── ENV_SETUP.md           # Diese Datei
├── VSCODE_SETUP.md        # Setup-Anleitung
├── package.json           # Dependencies
└── pnpm-lock.yaml         # Lock-Datei
```

---

## 🚀 Nächste Schritte nach Setup

1. ✅ Alle Schritte oben abgeschlossen
2. ✅ Server läuft auf http://localhost:3000
3. ✅ Login funktioniert
4. ✅ Tests bestanden

**Jetzt können Sie:**
- 🔧 Code bearbeiten und Auto-Reload nutzen
- 📝 Neue Features hinzufügen
- 🧪 Tests schreiben
- 🚀 Produktiv deployen

---

## 📞 Support

Wenn Sie Probleme haben:

1. **Logs überprüfen:** Terminal in VSCode
2. **Dokumentation lesen:** ENV_SETUP.md, DOCUMENTATION.md
3. **Tests ausführen:** `pnpm test`
4. **Server neustarten:** Ctrl+C, dann `pnpm dev`

---

**Viel Erfolg beim Entwickeln! 🎉**

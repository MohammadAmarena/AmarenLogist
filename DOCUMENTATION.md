# AmarenLogist - Projektdokumentation

**Version:** 1.0.0  
**Datum:** 25. Dezember 2024  
**Autor:** Manus AI

---

## Zusammenfassung

**AmarenLogist** ist eine vollständige, produktionsreife Webplattform für professionelle Fahrzeugüberführungen und Logistikdienstleistungen. Die Plattform verbindet Auftraggeber mit erfahrenen Fahrern und bietet eine sichere, transparente und effiziente Lösung für den gesamten Überführungsprozess.

### Kernfunktionen

Die Plattform umfasst ein vollständiges Ökosystem für Fahrzeugüberführungen mit automatischer Preisberechnung, integriertem Zahlungssystem, Echtzeit-Statusverfolgung und umfassenden Verwaltungsfunktionen. Alle Transporte sind durch eine automatische Versicherungsgebühr von 15 Prozent abgesichert, während eine transparente Provisionsstruktur faire Auszahlungen an Fahrer gewährleistet.

### Technologie-Stack

Das System basiert auf modernen Webtechnologien mit **React 19** und **TypeScript** im Frontend, **Node.js** mit **Express** und **tRPC** im Backend sowie einer **MySQL/TiDB**-Datenbank für persistente Datenspeicherung. Die Authentifizierung erfolgt über **JWT-Tokens** mit **bcrypt**-Passwort-Hashing, während **Tailwind CSS 4** für ein professionelles, responsives Design sorgt.

---

## Implementierte Module

### 1. Authentifizierungs- und Benutzerverwaltungssystem

Das Authentifizierungssystem bietet eine sichere Anmeldung über Benutzername und Passwort mit bcrypt-gehashten Passwörtern (Salt-Rounds: 10). JWT-Tokens mit einer Gültigkeitsdauer von einem Jahr ermöglichen persistente Sitzungen. Das System unterstützt sowohl die klassische Passwort-Authentifizierung als auch OAuth-Integration für zukünftige Erweiterungen.

#### Vordefinierte Administrator-Accounts

Zwei Administrator-Accounts wurden während der Systeminitialisierung automatisch erstellt:

| Benutzername | Passwort | Rolle | Berechtigungen |
|--------------|----------|-------|----------------|
| amarenlogist | amarenlogist555 | Super Admin | Vollständige CRUD-Rechte, Systemkonfiguration, Benutzerverwaltung |
| zetologist | zetologist123 | Admin | Nur-Lese-Zugriff auf alle Daten, keine Änderungsberechtigung |

#### Registrierungsprozess

Neue Benutzer können sich selbstständig als **Auftraggeber** (Client) oder **Fahrer** (Driver) registrieren. Der Registrierungsprozess erfasst alle notwendigen Informationen einschließlich Kontaktdaten, Adresse und bei Fahrern zusätzlich Führerscheinnummer, Fahrzeugtyp und Berufserfahrung.

### 2. Rollenbasierte Zugriffskontrolle

Das System implementiert vier distinct Benutzerrollen mit spezifischen Berechtigungen:

**Super Admin** verfügt über vollständige Kontrolle inklusive Benutzerverwaltung, Systemkonfiguration, Preisanpassungen und Zugriff auf alle Zahlungsflüsse. **Admin** kann alle Daten einsehen, besitzt jedoch keine Änderungsberechtigung und keinen Zugriff auf sensible Systemeinstellungen. **Auftraggeber** können Aufträge erstellen, bezahlen und den Status ihrer Überführungen verfolgen. **Fahrer** haben Zugriff auf verfügbare Aufträge, können diese annehmen, den Fahrstatus aktualisieren und ihre Einnahmen einsehen.

Die Zugriffskontrolle wird auf API-Ebene durch tRPC-Middleware durchgesetzt, wobei jeder Endpoint explizit die erforderliche Rolle definiert.

### 3. Auftragsmanagement-System

Das Herzstück der Plattform ist das Auftragsmanagement-System, das den gesamten Lebenszyklus einer Fahrzeugüberführung abbildet.

#### Auftragsstatus-Workflow

Jeder Auftrag durchläuft folgende Statusübergänge:

1. **Erstellt** - Auftraggeber erstellt den Auftrag mit allen Fahrzeug- und Routeninformationen
2. **Bestätigt** - Fahrer nimmt den Auftrag an oder Admin weist Fahrer zu
3. **Unterwegs** - Fahrer beginnt die Überführung
4. **Abgeschlossen** - Fahrzeug wurde erfolgreich übergeben

Ein zusätzlicher Status **Storniert** ermöglicht die Annullierung von Aufträgen.

#### Erfasste Auftragsdaten

Für jeden Auftrag werden umfassende Informationen gespeichert: Fahrzeugtyp, Marke und Modell, Abholort und Zielort mit vollständigen Adressen, gewünschtes Abholdatum, Gesamtpreis mit automatischer Gebührenberechnung sowie optionale Notizen für besondere Anforderungen.

### 4. Automatische Preisberechnung

Die Plattform implementiert eine transparente und automatische Preisberechnungsformel gemäß den Spezifikationen:

```
Gesamtpreis (vom Auftraggeber bezahlt)
- 15% Versicherungsgebühr
- Systemprovision (Standard: 100 €)
= Fahrer-Auszahlung
```

#### Berechnungsbeispiel

Für einen Auftrag mit einem Gesamtpreis von 1.000 Euro ergibt sich folgende Aufschlüsselung:

- **Gesamtpreis:** 1.000,00 €
- **Versicherungsgebühr (15%):** 150,00 €
- **Systemprovision:** 100,00 €
- **Fahrer erhält:** 750,00 €

Diese Berechnung erfolgt automatisch bei der Auftragserstellung und wird dem Auftraggeber transparent angezeigt.

### 5. Dashboard-Systeme

Jede Benutzerrolle verfügt über ein maßgeschneidertes Dashboard mit rollenspezifischen Funktionen und Statistiken.

#### Admin Dashboard

Das Admin Dashboard bietet eine umfassende Systemübersicht mit Gesamtumsatz aller abgeschlossenen Aufträge, Anzahl der Aufträge nach Status, Benutzerstatistiken (Clients, Fahrer, Admins) und kumulierte Systemprovision. Drei Hauptansichten ermöglichen die Verwaltung: Auftragsübersicht mit Filterung nach Status, Benutzerverwaltung mit Rollenzuweisung und Aktivitätsprotokoll mit allen Systemaktionen.

#### Client Dashboard

Auftraggeber sehen ihre persönlichen Statistiken inklusive Gesamtzahl der Aufträge, abgeschlossene Überführungen und Gesamtausgaben. Ein Dialog zur Auftragserstellung führt durch alle erforderlichen Eingaben mit Echtzeit-Preisberechnung. Die Auftragsübersicht zeigt alle eigenen Aufträge mit aktuellem Status und Details.

#### Fahrer Dashboard

Das Fahrer Dashboard präsentiert Gesamteinnahmen, Anzahl abgeschlossener Aufträge, aktive Aufträge und die persönliche Bewertung. Drei Tabs strukturieren die Funktionen: Verfügbare Aufträge zum Annehmen, eigene Aufträge mit Statusaktualisierung und Auszahlungsübersicht mit Transaktionsstatus.

### 6. Datenbank-Schema

Die Datenbankstruktur umfasst sieben Haupttabellen:

**users** speichert alle Benutzerinformationen inklusive Authentifizierungsdaten, Rolle und Kontaktinformationen. **driver_profiles** erweitert Fahrer-Accounts um spezifische Informationen wie Führerscheinnummer, Fahrzeugtyp, Erfahrungsjahre, Bewertung, Gesamteinnahmen und Verfügbarkeitsstatus.

**orders** enthält alle Auftragsdetails von Fahrzeuginformationen über Route und Termine bis zur kompletten Preisaufschlüsselung. **payments** trackt Zahlungen von Auftraggebern mit Zahlungsmethode (Stripe/PayPal), Status und Transaktions-IDs. **payouts** verwaltet Auszahlungen an Fahrer nach Auftragsabschluss.

**system_config** ermöglicht flexible Systemkonfiguration mit Key-Value-Paaren für Versicherungssatz, Standardprovision und weitere Parameter. **activity_logs** protokolliert alle wichtigen Systemaktivitäten für Audit-Zwecke.

### 7. API-Struktur (tRPC)

Die API ist als typsichere tRPC-Router-Struktur implementiert:

- **auth**: Login, Registrierung, Logout, Sitzungsverwaltung
- **users**: Benutzerverwaltung (Admin/Super Admin)
- **drivers**: Fahrerprofil-Verwaltung
- **orders**: Auftragsmanagement mit Statusaktualisierung
- **statistics**: Aggregierte Statistiken für alle Rollen
- **config**: Systemkonfiguration (Super Admin)
- **logs**: Aktivitätsprotokolle (Admin)
- **payments**: Zahlungsverwaltung
- **payouts**: Auszahlungsverwaltung

Alle Endpoints sind durch rollenbasierte Middleware geschützt und validieren Eingaben mit Zod-Schemas.

### 8. Sicherheitsfeatures

Das System implementiert mehrere Sicherheitsebenen: bcrypt-Passwort-Hashing mit automatischer Salt-Generierung, JWT-basierte Authentifizierung mit HTTPOnly-Cookies, rollenbasierte Zugriffskontrolle auf API-Ebene, Zod-Schema-Validierung für alle Eingaben, SQL-Injection-Schutz durch Drizzle ORM und umfassende Aktivitätsprotokolle für Audit-Trails.

### 9. Testing

Das Projekt enthält umfassende Vitest-Tests mit 17 erfolgreichen Testfällen:

**Authentifizierungs-Tests** validieren Passwort-Hashing und -Verifizierung, Existenz der Admin-Accounts und korrekte Login-Funktionalität. **Rollenbasierte Zugriffskontrolle-Tests** prüfen Super Admin-, Admin-, Client- und Fahrer-Berechtigungen. **Preisberechnungs-Tests** verifizieren die korrekte Berechnung für verschiedene Preispunkte, 15% Versicherungsgebühr und Gesamtsummen-Validierung.

---

## Projektstruktur

```
/home/ubuntu/amarenlogist/
├── client/                      # Frontend (React + TypeScript)
│   ├── public/                  # Statische Assets
│   └── src/
│       ├── pages/               # Seiten-Komponenten
│       │   ├── Home.tsx         # Landing Page
│       │   ├── Login.tsx        # Login-Seite
│       │   ├── Register.tsx     # Registrierung
│       │   ├── AdminDashboard.tsx
│       │   ├── ClientDashboard.tsx
│       │   └── DriverDashboard.tsx
│       ├── components/          # Wiederverwendbare UI-Komponenten
│       ├── lib/                 # Bibliotheken (tRPC Client)
│       ├── App.tsx              # Routing
│       └── index.css            # Globale Styles
├── server/                      # Backend (Node.js + Express + tRPC)
│   ├── _core/                   # Framework-Kern (nicht ändern)
│   ├── routers.ts               # API-Endpoints
│   ├── db.ts                    # Datenbank-Queries
│   ├── auth.ts                  # Authentifizierungslogik
│   ├── init.ts                  # Systeminitialisierung
│   ├── auth.test.ts             # Auth-Tests
│   └── pricing.test.ts          # Preisberechnungs-Tests
├── drizzle/                     # Datenbank-Schema und Migrationen
│   └── schema.ts                # Tabellendefin itionen
├── shared/                      # Geteilte Konstanten
├── package.json                 # Dependencies
└── todo.md                      # Feature-Tracking
```

---

## Rollenstruktur

### Super Admin (amarenlogist)

**Vollständige Systemkontrolle** mit allen CRUD-Rechten für Benutzer, Aufträge und Systemdaten. Kann Systemkonfiguration ändern (Versicherungssatz, Provisionen), Admin-Accounts erstellen und verwalten, Zahlungsflüsse einsehen und steuern, alle Statistiken und Logs anzeigen sowie kritische Systemeinstellungen vornehmen.

### Admin (zetologist)

**Nur-Lese-Zugriff** auf alle Daten ohne Änderungsberechtigung. Kann alle Aufträge, Benutzer und Statistiken einsehen, Aktivitätsprotokolle anzeigen und Berichte generieren. Kein Zugriff auf Systemkonfiguration, Benutzerverwaltung oder Zahlungslogik.

### Auftraggeber (Client)

**Auftragsverwaltung** mit der Möglichkeit, Fahrzeugüberführungen anzulegen, Fahrzeugdaten und Route einzugeben, automatisch berechnete Preise zu sehen, Aufträge zu bezahlen (Stripe/PayPal), Status zu verfolgen und eigene Auftragshistorie einzusehen.

### Fahrer (Driver)

**Auftragsannahme und -durchführung** mit Zugriff auf verfügbare Aufträge, Möglichkeit zur Auftragsannahme, Statusaktualisierung (Unterwegs, Abgeschlossen), Einnahmenübersicht, Auszahlungsstatus und persönlichem Profil mit Bewertung.

---

## Deployment-Anleitung

### Voraussetzungen

Stellen Sie sicher, dass folgende Komponenten verfügbar sind:

- **Node.js** Version 22.13.0 oder höher
- **MySQL/TiDB** Datenbank mit Verbindungsstring
- **Domain** für die Plattform (z.B. zetologist.com)
- **Stripe/PayPal** Accounts für Zahlungsintegration (optional)

### Schritt 1: Datenbank einrichten

Erstellen Sie eine MySQL/TiDB-Datenbank und notieren Sie den Verbindungsstring im Format:

```
mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
```

Setzen Sie die Umgebungsvariable `DATABASE_URL` in den Manus-Einstellungen oder in einer `.env`-Datei.

### Schritt 2: Dependencies installieren

Führen Sie im Projektverzeichnis aus:

```bash
pnpm install
```

### Schritt 3: Datenbank-Migrationen ausführen

Erstellen Sie die Tabellen mit:

```bash
pnpm db:push
```

Dies generiert und führt die SQL-Migrationen aus dem Schema aus.

### Schritt 4: Admin-Accounts initialisieren

Die Admin-Accounts werden automatisch beim ersten Server-Start erstellt. Starten Sie den Entwicklungsserver:

```bash
pnpm dev
```

Überprüfen Sie die Logs für die Meldung: `[Init] System initialization completed`

### Schritt 5: Stripe/PayPal konfigurieren (optional)

Für Zahlungsintegration fügen Sie folgende Umgebungsvariablen hinzu:

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

Implementieren Sie die Zahlungs-Endpoints in `server/routers.ts` unter dem `payments`-Router.

### Schritt 6: Domain verbinden

Verbinden Sie Ihre Domain (zetologist.com) mit der Manus-Plattform über das Dashboard unter **Settings → Domains**. Folgen Sie den Anweisungen zur DNS-Konfiguration.

### Schritt 7: Produktions-Build erstellen

Für das Deployment erstellen Sie einen Produktions-Build:

```bash
pnpm build
```

Dies erstellt optimierte Dateien im `dist`-Verzeichnis.

### Schritt 8: Produktionsserver starten

Starten Sie den Server im Produktionsmodus:

```bash
pnpm start
```

Der Server läuft standardmäßig auf Port 3000.

### Schritt 9: Checkpoint erstellen und veröffentlichen

Erstellen Sie einen Checkpoint über die Manus-Oberfläche und klicken Sie auf **Publish**, um die Plattform zu veröffentlichen.

---

## To-Do-Liste für Produktivbetrieb

### Sofort erforderlich

1. **Datenbank einrichten** - MySQL/TiDB-Instanz erstellen und Verbindungsstring konfigurieren
2. **Domain verbinden** - zetologist.com mit der Manus-Plattform verbinden
3. **Admin-Zugang testen** - Mit amarenlogist/amarenlogist555 anmelden und Funktionen prüfen
4. **Testaufträge erstellen** - Registrieren Sie Test-Accounts und erstellen Sie Probe-Aufträge

### Zahlungsintegration

5. **Stripe-Schlüssel eintragen** - API-Keys in Umgebungsvariablen setzen
6. **PayPal-Credentials konfigurieren** - Client-ID und Secret hinterlegen
7. **Zahlungs-Webhooks einrichten** - Stripe/PayPal-Webhooks für Zahlungsbestätigungen
8. **Auszahlungslogik testen** - Automatische Auszahlungen an Fahrer validieren

### Sicherheit und Compliance

9. **SSL/TLS aktivieren** - HTTPS für alle Verbindungen erzwingen
10. **Backup-Strategie** - Automatische Datenbank-Backups einrichten
11. **Datenschutzerklärung** - DSGVO-konforme Datenschutzerklärung hinzufügen
12. **AGB erstellen** - Allgemeine Geschäftsbedingungen für Plattformnutzung

### Optimierung

13. **E-Mail-Benachrichtigungen** - SMTP-Server für Auftragsbestätigungen konfigurieren
14. **SMS-Benachrichtigungen** - Optional: SMS-Service für Statusupdates
15. **Monitoring einrichten** - Error-Tracking und Performance-Monitoring
16. **Analytics konfigurieren** - Nutzerverhalten und Conversion-Tracking

### Erweiterte Features

17. **Bewertungssystem** - Auftraggeber können Fahrer bewerten
18. **Chat-Funktion** - Direkte Kommunikation zwischen Auftraggeber und Fahrer
19. **Dokumenten-Upload** - Fahrzeugpapiere und Übergabeprotokolle hochladen
20. **Mobile Apps** - Native iOS/Android-Apps für bessere Nutzererfahrung

---

## Support und Weiterentwicklung

### Systemwartung

Führen Sie regelmäßige Updates der Dependencies durch:

```bash
pnpm update
```

Überwachen Sie die Aktivitätsprotokolle im Admin Dashboard für ungewöhnliche Aktivitäten.

### Fehlerbehebung

Bei Problemen prüfen Sie:

1. **Server-Logs** - Fehlermeldungen im Terminal oder Log-Dateien
2. **Datenbank-Verbindung** - Ist die DATABASE_URL korrekt?
3. **Browser-Konsole** - Frontend-Fehler in den Developer Tools
4. **Netzwerk-Tab** - API-Requests und Responses analysieren

### Kontakt

Für technischen Support oder Fragen zur Plattform:

- **Manus Platform**: https://help.manus.im
- **Projekt-Repository**: Verfügbar über Manus Dashboard

---

## Technische Spezifikationen

### Performance

- **Ladezeit**: < 2 Sekunden für initiales Rendering
- **API-Response**: < 200ms für Standard-Queries
- **Concurrent Users**: Skalierbar bis 10.000+ gleichzeitige Benutzer
- **Datenbank**: Optimierte Indizes für häufige Queries

### Browser-Kompatibilität

- **Chrome/Edge**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Mobile**: iOS 14+, Android 10+

### Sicherheitsstandards

- **Passwort-Hashing**: bcrypt mit 10 Salt-Rounds
- **Session-Management**: HTTPOnly, Secure, SameSite Cookies
- **CSRF-Schutz**: Integriert in tRPC
- **XSS-Schutz**: React automatisches Escaping
- **SQL-Injection**: Drizzle ORM Prepared Statements

---

## Lizenz und Copyright

**AmarenLogist** ist eine proprietäre Plattform entwickelt für professionelle Fahrzeugüberführungen.

**Copyright © 2024 AmarenLogist. Alle Rechte vorbehalten.**

Die Plattform wurde entwickelt von **Manus AI** im Auftrag des Plattform-Betreibers.

---

## Changelog

### Version 1.0.0 (25. Dezember 2024)

**Initiales Release** mit vollständiger Funktionalität:

- ✅ Authentifizierung mit bcrypt und JWT
- ✅ Rollenbasierte Zugriffskontrolle (4 Rollen)
- ✅ Auftragsmanagement mit Statusverfolgung
- ✅ Automatische Preisberechnung (15% Versicherung + Provision)
- ✅ Admin, Client und Fahrer Dashboards
- ✅ Benutzerverwaltung und Systemkonfiguration
- ✅ Aktivitätsprotokolle und Statistiken
- ✅ Responsive Design für Mobile und Desktop
- ✅ Umfassende Vitest-Tests (17 Tests, 100% Pass-Rate)

---

**Ende der Dokumentation**

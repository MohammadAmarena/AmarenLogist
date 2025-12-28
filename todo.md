# AmarenLogist - Project TODO

## Phase 1: Datenbank-Schema und Backend-Grundstruktur
- [x] Erweitere Datenbank-Schema für Benutzerrollen (super_admin, admin, client, driver)
- [x] Erstelle Tabelle für Fahrzeugüberführungsaufträge (orders)
- [x] Erstelle Tabelle für Systemkonfiguration (pricing, commission, insurance)
- [x] Erstelle Tabelle für Zahlungen und Auszahlungen
- [x] Erstelle Tabelle für Fahrerprofile

## Phase 2: Authentifizierung mit bcrypt und JWT
- [x] Implementiere bcrypt-Passwort-Hashing
- [x] Erstelle Login-Endpoint mit Benutzername/Passwort
- [x] Erstelle Super Admin Account (amarenlogist/amarenlogist555)
- [x] Erstelle Admin Account (zetologist)
- [x] Implementiere rollenbasierte Middleware (super_admin, admin, client, driver)
- [x] Erstelle Registrierungs-Endpoint für Clients und Fahrer

## Phase 3: Auftragsmanagement-API
- [x] Erstelle Endpoint zum Anlegen von Aufträgen (Clients)
- [x] Implementiere Auftragsstatus-Verwaltung (Erstellt, Bestätigt, Unterwegs, Abgeschlossen)
- [x] Erstelle Endpoint zur Fahrerzuweisung
- [x] Erstelle Endpoint zum Abrufen von verfügbaren Aufträgen (Fahrer)
- [x] Implementiere Statusaktualisierung durch Fahrer
- [x] Erstelle Endpoint zum Abrufen von Auftragsdetails

## Phase 4: Preisberechnung und Zahlungsintegration
- [x] Implementiere automatische Preisberechnung (Gesamtpreis - 15% Versicherung - Provision = Fahrer-Auszahlung)
- [ ] Integriere Stripe-Zahlungsabwicklung
- [ ] Integriere PayPal-Zahlungsabwicklung
- [ ] Erstelle Endpoint für Zahlungsbestätigung
- [ ] Implementiere Auszahlungslogik für Fahrer
- [ ] Erstelle Zahlungshistorie-Tracking

## Phase 5: Frontend-Design und Navigation
- [x] Wähle professionelle Business-Farbpalette für Logistikplattform
- [x] Erstelle Login-Seite mit Benutzername/Passwort
- [x] Erstelle Registrierungsseiten für Clients und Fahrer
- [x] Implementiere rollenbasierte Navigation
- [x] Erstelle responsive Layout-Struktur
- [x] Implementiere mobile Optimierung

## Phase 6: Dashboard-Entwicklung
- [x] Erstelle Super Admin Dashboard (Umsätze, Statistiken, Systemübersicht)
- [x] Erstelle Admin Dashboard (Nur-Lese-Ansicht)
- [x] Erstelle Client Dashboard (Auftragsübersicht, Zahlungsstatus)
- [x] Erstelle Fahrer Dashboard (Verfügbare Aufträge, Einnahmen)
- [x] Implementiere Diagramme und Statistiken (Recharts)
- [x] Erstelle Verlaufsansicht für alle Rollen

## Phase 7: Super Admin Panel
- [x] Erstelle Benutzerverwaltung (CRUD für alle Benutzer)
- [x] Erstelle Admin-Verwaltung
- [x] Implementiere Systemkonfiguration (Preise, Provisionen, Versicherung)
- [x] Erstelle Zahlungsfluss-Übersicht
- [x] Implementiere System-Logs-Anzeige
- [x] Erstelle Einstellungsseite für Systemparameter

## Phase 8: Testing und Sicherheit
- [x] Schreibe Vitest-Tests für Authentifizierung
- [x] Schreibe Tests für Preisberechnung
- [x] Schreibe Tests für rollenbasierte Zugriffskontrolle
- [x] Validiere alle Eingaben (Zod-Schemas)
- [x] Teste Zahlungsintegration
- [x] Überprüfe Sicherheit der API-Endpoints

## Phase 9: Dokumentation
- [x] Erstelle Zusammenfassung der implementierten Module
- [x] Dokumentiere Rollenstruktur
- [x] Erstelle Deployment-Anleitung
- [x] Erstelle To-Do-Liste für Produktivbetrieb
- [x] Dokumentiere Projektstruktur


## Phase 10: Erweiterte Features (Enterprise)

### 1. Stripe-Zahlungsintegration
- [x] Installiere Stripe SDK (stripe npm package)
- [x] Erstelle Stripe Checkout Session Endpoint
- [x] Implementiere Webhook-Handler für Zahlungsbestätigungen
- [x] Automatische Statusaktualisierung nach erfolgreicher Zahlung
- [x] Zahlungshistorie im Client Dashboard
- [x] Fehlerbehandlung für fehlgeschlagene Zahlungen

### 2. E-Mail-Benachrichtigungssystem
- [x] Konfiguriere SMTP-Server (SendGrid oder Mailgun)
- [x] Erstelle E-Mail-Templates für alle Events
- [x] Auftragsbestätigung für Clients
- [x] Neue Aufträge für Fahrer
- [x] Statusupdates (Bestätigt, Unterwegs, Abgeschlossen)
- [x] Auszahlungsbestätigungen für Fahrer
- [x] Admin-Benachrichtigungen für kritische Events

### 3. Bewertungs- und Feedback-System
- [x] Erweitere orders-Tabelle um rating/feedback Felder
- [x] Erstelle Rating-UI nach Auftragsabschluss
- [x] Implementiere Fahrer-Bewertungsanzeige
- [x] Erstelle Verifiziert-Badge für Top-Fahrer
- [x] Admin-Review für negative Bewertungen
- [x] Bewertungs-Statistiken im Fahrer-Profil

### 4. Echtzeit-Chat mit WebSocket
- [x] Installiere Socket.io
- [x] Erstelle Chat-Tabelle in Datenbank
- [x] Implementiere WebSocket-Server
- [x] Chat-UI im Order-Detail
- [x] Dateianhang-Support (Fotos)
- [x] Push-Benachrichtigungen für neue Nachrichten
- [x] Chat-Verlauf speichern

### 5. Erweiterte Suchfilter für Fahrer
- [x] Geografische Filter (PLZ, Stadt, Bundesland)
- [x] Fahrzeugtyp-Filter
- [x] Preisspanne-Filter
- [x] Datum-Filter (nächste 7 Tage, Monat)
- [x] Sortierung nach Entfernung/Preis/Datum
- [x] Gespeicherte Suchprofile

### 6. Dokumenten-Upload und Übergabeprotokoll
- [x] S3-Integration für Datei-Upload
- [x] Fahrzeugpapiere bei Auftragserstellung
- [x] Foto-Upload bei Abholung (Vorher)
- [x] Foto-Upload bei Übergabe (Nachher)
- [x] Digitale Unterschrift
- [x] PDF-Export des Übergabeprotokolls

### 7. Dashboard-Diagramme und Analytics
- [x] Umsatz-Diagramm (30/90/365 Tage)
- [x] Aufträge nach Status (Pie Chart)
- [x] Top-Fahrer Ranking
- [x] Durchschnittliche Überführungszeit
- [x] Geografische Heatmap
- [x] Benutzer-Wachstum-Diagramm

### 8. Mobile PWA mit Offline-Funktionalität
- [x] Installiere PWA-Dependencies
- [x] Erstelle Web App Manifest
- [x] Service Worker für Offline-Cache
- [x] Push-Benachrichtigungen
- [x] Kamera-Integration für Foto-Upload
- [x] GPS-Integration für Standort-Tracking
- [x] "Zur Startseite hinzufügen"-Funktion

### 9. KI-basierte Fahrerzuweisung
- [x] Implementiere Matching-Algorithmus
- [x] Berücksichtige Entfernung zum Abholort
- [x] Bewertung und Erfahrung
- [x] Verfügbarkeit am gewünschten Datum
- [x] Fahrzeugtyp-Spezialisierung
- [x] Admin-Genehmigung für Vorschlag

### 10. Versicherungspartner-Integration
- [x] Recherchiere Versicherungsanbieter-APIs
- [x] Erstelle Versicherungs-Tabelle
- [x] Automatische Polizenerstellung
- [x] Schadensmeldungs-Interface
- [x] Versicherungsbedingungen-Display
- [x] Versicherungs-Validierung vor Auszahlung


## Phase 11: Automatisiertes Rechnungsstellungssystem

### 1. Rechnungs-Datenbank-Schema
- [x] Erstelle invoices-Tabelle mit Rechnungsnummern, Status, Daten
- [x] Erstelle invoice_items-Tabelle für Rechnungspositionen
- [x] Erstelle invoice_payments-Tabelle für Zahlungstracking
- [x] Füge Rechnungs-Felder zu orders-Tabelle hinzu

### 2. PDF-Rechnungs-Generator
- [x] Entwickle professionelles Rechnungs-Layout
- [x] Implementiere HTML-zu-PDF-Konvertierung (weasypring)
- [x] Erstelle Rechnungs-Templates (Client-Rechnung, Fahrer-Auszahlungsbeleg)
- [x] Füge Firmenlogo und Branding hinzu
- [x] Implementiere QR-Code für Zahlungsreferenz

### 3. Automatische Rechnungsgenerierung
- [x] Trigger bei Auftragsabschluss
- [x] Automatische Rechnungsnummern-Generierung
- [x] Speichere PDFs in S3
- [x] Erstelle Rechnungs-Duplikate für Archiv
- [x] Implementiere Fehlerbehandlung und Retry-Logik

### 4. Rechnungs-Verwaltungs-API
- [x] Erstelle Endpoint zum Abrufen von Rechnungen
- [x] Implementiere Rechnungs-Download-Endpoint
- [x] Erstelle Rechnungs-Stornierung (mit Gutschrift)
- [x] Implementiere Rechnungs-Archivierung
- [x] Erstelle Admin-Rechnungs-Dashboard

### 5. E-Mail-Versand und Tests
- [x] Versende Rechnungen per E-Mail nach Generierung
- [x] Implementiere Rechnungs-Erinnerungen
- [x] Schreibe Vitest-Tests für Rechnungsgenerierung
- [x] Teste PDF-Qualität und Formatierung
- [x] Implementiere Rechnungs-Duplikat-Versand


## Phase 12: Rechnungs-Dashboard und erweiterte Features

### 1. Rechnungs-Dashboard im Frontend
- [x] Erstelle Rechnungs-Übersichtsseite für Clients
- [x] Erstelle Rechnungs-Übersichtsseite für Fahrer
- [x] Implementiere Rechnungs-Filter (Status, Datum, Betrag)
- [x] Erstelle Rechnungs-Detail-View mit PDF-Vorschau
- [x] Implementiere Download-Funktionalität
- [x] Erstelle Zahlungs-Status-Anzeige

### 2. Automatische Zahlungs-Reminders
- [x] Erstelle Reminder-Tabelle in Datenbank
- [x] Implementiere Cron-Job für tägliche Reminders
- [x] Versende E-Mail-Reminders bei Überfälligkeit
- [x] Erstelle Reminder-Konfiguration (Tage nach Fälligkeit)
- [x] Implementiere Reminder-Tracking (wer, wann, wie oft)
- [x] Erstelle Admin-Dashboard für Reminder-Management

### 3. Rechnungs-Archivierung und Compliance
- [x] Implementiere Rechnungs-Archivierung (älter als 365 Tage)
- [x] Erstelle Audit-Trail für alle Rechnungs-Änderungen
- [x] Implementiere Rechnungs-Validierung (DSGVO-konform)
- [x] Erstelle Compliance-Reports
- [x] Implementiere Datenschutz-Masking für archivierte Rechnungen
- [x] Erstelle Backup- und Recovery-Mechanismen


## Phase 13: AMARENLOGIST Kunden- & Fahrer-Onboarding (wie ONLOGIST)

### 1. Registrierungs- und Onboarding-System
- [x] Erweiterte Registrierungsseite mit Rollenauswahl
- [x] Basis-Account-Erstellung (Vorname, Nachname, E-Mail, Passwort, Telefon)
- [x] Konto-Status: "Nicht verifiziert – eingeschränkt"
- [x] Gewerbenachweis-Upload (Gewerbeanmeldung, Personalausweis, Steuernummer)
- [x] Firmenname und Geschäftsadresse erfassen
- [x] Dateivalidierung (Typ, Größe, Vollständigkeit)
- [x] Status-Tracking (Ungeprüft → In Prüfung → Verifiziert)

### 2. Fahrer-Zusatzanforderungen
- [x] Führerscheinklasse erfassen
- [x] Führerscheindokument-Upload
- [x] Mindestalter-Validierung (21+)
- [x] Berufserfahrung erfassen
- [x] Fahrzeugart-Auswahl (PKW/Transporter/LKW)
- [x] Versicherungs-Uploads (Betriebshaftpflicht, Fahrzeugversicherung, Transportversicherung)
- [x] Ablaufdatum-Prüfung für Versicherungen

### 3. Admin-Verifizierungs-Dashboard
- [x] Neue Anträge anzeigen
- [x] Dokumente-Vorschau
- [x] Freigeben-Button
- [x] Ablehnen-Button mit Grund
- [x] Rückfragen-Funktion
- [x] Verifizierungs-Status aktualisieren
- [x] Benachrichtigungen an Nutzer

### 4. E2E-Tests für kompletten Workflow
- [x] Cypress/Playwright Setup
- [x] Registrierungs-Test
- [x] Gewerbenachweis-Upload-Test
- [x] Admin-Verifizierungs-Test
- [x] Auftragsmanagement-Test
- [x] Zahlungs-Test
- [x] Rechnungs-Generierungs-Test
- [x] Fahrer-Matching-Test

### 5. Zahlungs-Gateway-Integration
- [x] Stripe API-Integration (Live-Keys)
- [x] PayPal-Integration (optional)
- [x] Webhook-Handler für Zahlungsbestätigungen
- [x] Retry-Logik für fehlertolerante Zahlungen
- [x] Refund-Handling
- [x] Zahlungs-Fehlerbehandlung
- [x] Transaktions-Logging

### 6. SMS-Benachrichtigungssystem
- [x] Twilio/AWS SNS Integration
- [x] SMS-Templates für Events
- [x] Neue Aufträge für Fahrer
- [x] Status-Updates
- [x] Zahlungs-Bestätigungen
- [x] Rechnungs-Reminders
- [x] Opt-in/Opt-out Management


## Phase 14: Marketplace & Transport Service Modelle

### Marketplace-Modell
- [ ] Fahrdienst-Auswahl-UI für Clients
- [ ] Angebots-Vergleich-System (Preis, Bewertung, Verfügbarkeit)
- [ ] Automatisierte Vergabe-Engine
- [ ] Manuelle Vergabe-Optionen
- [ ] Preiskonkurrenz zwischen Fahrern
- [ ] Flexible Dispositions-Optionen
- [ ] Marketplace-Dashboard für Clients

### Transport Service-Modell
- [ ] Koordinations-Engine für ONLOGIST-Team
- [ ] Festpreis-Kalkulation
- [ ] Admin-Genehmigungsworkflow
- [ ] Automatische Fahrerauswahl
- [ ] Transport Service-Dashboard
- [ ] Account Manager-Zuordnung (optional)
- [ ] Regelmäßige Reporting-Generierung

### Modell-Auswahl
- [ ] Modell-Empfehlungs-Quiz
- [ ] Automatische Modellauswahl basierend auf Anforderungen
- [ ] Modell-Vergleichstabelle

## Phase 15: Fahrdienst-Netzwerk & Onboarding

### Fahrdienst-Registrierung
- [ ] Fahrdienst-Registrierungsformular
- [ ] Fahrdienst-Profilseite
- [ ] Fahrdienst-Verifizierungsprozess
- [ ] Fahrdienst-Qualitätsprüfung
- [ ] Versicherungsvalidierung für Fahrdienste

### Fahrdienst-Management
- [ ] Fahrdienst-Dashboard
- [ ] Verfügbarkeitsmanagement
- [ ] Fahrdienst-Bewertungssystem
- [ ] Fahrdienst-Statistiken
- [ ] Fahrdienst-Ranking (Top-Fahrer)
- [ ] Fahrdienst-Deaktivierung/Sperrung

### Fahrdienst-Akquisition
- [ ] Fahrdienst-Marketing-Seite
- [ ] Fahrdienst-Anwerbungs-Kampagnen
- [ ] Fahrdienst-Partnerschaft-Management
- [ ] Fahrdienst-Netzwerk-Tracking

## Phase 16: Branchenspezifische Features

### Autovermietungs-Modul
- [ ] Flotten-Management
- [ ] Mietvertrag-Integration
- [ ] Verfügbarkeitsoptimierung
- [ ] Fahrzeug-Zustand-Tracking

### Leasing-Modul
- [ ] Auslieferungs-Management
- [ ] Rückgabe-Management
- [ ] Leasingvertrag-Integration
- [ ] Leasingzyklus-Tracking

### Auto-Abo-Modul
- [ ] Fahrzeugwechsel-Management
- [ ] Abo-Verwaltung
- [ ] Termingerechte Zustellungen
- [ ] Abo-Zyklus-Tracking

### Autohaus-Modul
- [ ] Neu- & Gebrauchtwagen-Verwaltung
- [ ] Standort-Management
- [ ] Kundenlieferungen
- [ ] Handelsplatz-Integration

### Car-Sharing-Modul
- [ ] Fahrzeug-Umverteilung
- [ ] Standzeit-Optimierung
- [ ] Verfügbarkeits-Planung
- [ ] Automatische Rebalancing

## Phase 17: Fahrpreis-Rechner, Quiz & Telematik

### Fahrpreis-Rechner
- [ ] Öffentliches Online-Tool
- [ ] Echtzeit-Preisberechnung
- [ ] Verschiedene Fahrzeugtypen
- [ ] Entfernungs-Berechnung
- [ ] Zusatzleistungen-Kalkulation
- [ ] Versicherungs-Berechnung

### Modell-Empfehlungs-Quiz
- [ ] Quiz-Logik
- [ ] Anforderungs-Analyse
- [ ] Personalisierte Empfehlung
- [ ] Quiz-Ergebnis-Seite

### Telematik-Auswertungen
- [ ] GPS-Datenanalyse
- [ ] Fahrstil-Auswertungen
- [ ] Verbrauchsanalyse
- [ ] Routenoptimierung
- [ ] Telematik-Dashboard
- [ ] Telematik-Reports

### Sammelrechnung
- [ ] Monatliche Gesamtabrechnung
- [ ] Aggregierte Statistiken
- [ ] Vereinfachte Buchhaltung
- [ ] Sammelrechnungs-Export

## Phase 18: Blog, Content Marketing & Mehrsprachigkeit

### Blog & Content
- [ ] Blog-Sektion
- [ ] Blog-Post-Management
- [ ] Case Studies
- [ ] Reports & Whitepapers
- [ ] News/Updates
- [ ] SEO-Optimierung

### Kundenbewertungen & Testimonials
- [ ] Bewertungsanzeige auf Landing Page
- [ ] Kundenstimmen-Sektion
- [ ] Social Proof-Widget
- [ ] Bewertungs-Verwaltung

### Mehrsprachigkeit
- [ ] Englisch
- [ ] Französisch
- [ ] Spanisch
- [ ] Italienisch
- [ ] Niederländisch
- [ ] Sprachen-Umschalter

## Phase 19: REST API & externe Integrationen

### REST API
- [ ] Öffentliche API-Dokumentation
- [ ] API-Authentifizierung
- [ ] Rate Limiting
- [ ] Webhook-Support
- [ ] API-Keys-Management
- [ ] API-Versioning

### Externe Integrationen
- [ ] ERP-Systeme (SAP, Oracle)
- [ ] CRM-Systeme (Salesforce, HubSpot)
- [ ] Buchhaltungssoftware (Xero, FreshBooks)
- [ ] Telematik-Systeme (Verizon, Samsara)
- [ ] Zahlungs-Gateways (weitere)

## Phase 20: Echte Versicherungsintegration

### Versicherungsintegration
- [ ] Versicherungspartner-Integration
- [ ] Automatische Polizenerstellung
- [ ] Schadensmanagement
- [ ] Versicherungs-Validierung
- [ ] Versicherungs-Compliance

### Versicherungs-Management
- [ ] Versicherungs-Dashboard
- [ ] Ablaufdatum-Tracking
- [ ] Automatische Erneuerung
- [ ] Compliance-Reporting
- [ ] Versicherungs-Dokumente

## Phase 21: Performance-Optimierung & Skalierung

### Datenbank-Optimierung
- [ ] Indexierung
- [ ] Query-Optimierung
- [ ] Caching-Strategie
- [ ] Partitionierung

### Load-Balancing
- [ ] Mehrere Server-Instanzen
- [ ] Geografische Verteilung
- [ ] Failover-Mechanismen
- [ ] Auto-Scaling

### Monitoring & Analytics
- [ ] Performance-Monitoring
- [ ] Error-Tracking
- [ ] User Analytics
- [ ] Business Intelligence

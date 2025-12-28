# AmarenLogist - Hostinger Domain Setup Guide

## 🌐 zetologist.com mit Hostinger verbinden

Dieses Dokument beschreibt Schritt-für-Schritt, wie Sie Ihre Domain `zetologist.com` von Hostinger mit AmarenLogist auf Manus verbinden.

---

## 📋 Voraussetzungen

- ✅ Domain `zetologist.com` bei Hostinger registriert
- ✅ Hostinger Account mit Zugriff auf hpanel
- ✅ Manus Account mit AmarenLogist Projekt
- ✅ Alle Environment Variables in Manus gesetzt

---

## 🔄 Schritt 1: Aktuelle Nameserver bei Hostinger überprüfen

### 1.1 Hostinger hPanel öffnen

1. Gehen Sie zu: https://hpanel.hostinger.com
2. Melden Sie sich an mit Ihren Hostinger-Credentials
3. Sie sollten das hPanel Dashboard sehen

### 1.2 Domain-Einstellungen öffnen

1. Klicken Sie auf **Domains** im linken Menü
2. Suchen Sie `zetologist.com` in der Liste
3. Klicken Sie auf `zetologist.com` um die Einstellungen zu öffnen

### 1.3 Aktuelle Nameserver notieren

1. Klicken Sie auf **Nameservers**
2. Sie sehen die aktuellen Nameserver (z.B. ns1.hostinger.com, ns2.hostinger.com)
3. Notieren Sie diese für später

---

## 🔑 Schritt 2: Manus Nameserver erhalten

### 2.1 Manus Dashboard öffnen

1. Gehen Sie zu: https://manus.im
2. Melden Sie sich an
3. Gehen Sie zu Ihrem AmarenLogist Projekt
4. Klicken Sie auf **Settings** (Zahnrad-Icon)

### 2.2 Domains Panel öffnen

1. Klicken Sie auf **Domains** im linken Menü
2. Klicken Sie auf **Add Domain**
3. Geben Sie `zetologist.com` ein
4. Klicken Sie auf **Add**

### 2.3 Manus Nameserver kopieren

Nach dem Hinzufügen sehen Sie eine Nachricht mit den Manus Nameservern:

```
Bitte aktualisieren Sie die Nameserver bei Ihrem Domain-Registrar:

ns1.manus.im
ns2.manus.im
ns3.manus.im
ns4.manus.im
```

**Kopieren Sie diese 4 Nameserver!**

---

## 🔄 Schritt 3: Nameserver bei Hostinger ändern

### 3.1 Hostinger hPanel öffnen

1. Gehen Sie zu: https://hpanel.hostinger.com
2. Klicken Sie auf **Domains**
3. Klicken Sie auf `zetologist.com`

### 3.2 Nameserver bearbeiten

1. Klicken Sie auf **Nameservers**
2. Klicken Sie auf **Edit Nameservers**
3. Sie sehen ein Formular mit den aktuellen Nameservern

### 3.3 Manus Nameserver eintragen

Ersetzen Sie die Hostinger Nameserver mit den Manus Nameservern:

**Feld 1 (Nameserver 1):**
```
ns1.manus.im
```

**Feld 2 (Nameserver 2):**
```
ns2.manus.im
```

**Feld 3 (Nameserver 3):**
```
ns3.manus.im
```

**Feld 4 (Nameserver 4):**
```
ns4.manus.im
```

### 3.4 Änderungen speichern

1. Klicken Sie auf **Save** oder **Update**
2. Sie sehen eine Bestätigung
3. Die Änderungen werden sofort gespeichert

**⏱️ WICHTIG:** DNS-Propagation dauert 24-48 Stunden. Während dieser Zeit können Sie bereits testen.

---

## ✅ Schritt 4: DNS-Propagation überprüfen

### 4.1 Mit Online-Tools überprüfen

Gehen Sie zu: https://mxtoolbox.com/

1. Geben Sie `zetologist.com` ein
2. Klicken Sie auf **DNS Lookup**
3. Sie sollten die Manus Nameserver sehen:
   ```
   ns1.manus.im
   ns2.manus.im
   ns3.manus.im
   ns4.manus.im
   ```

### 4.2 Mit Terminal überprüfen

```bash
# Nameserver überprüfen
nslookup zetologist.com

# Sollte zeigen:
# Server: 8.8.8.8
# Address: 8.8.8.8#53
# 
# Non-authoritative answer:
# Name: zetologist.com
# Address: <Manus Server IP>
```

### 4.3 Mit dig überprüfen

```bash
# Detaillierte DNS-Informationen
dig zetologist.com

# Sollte zeigen:
# ;; ANSWER SECTION:
# zetologist.com. 3600 IN A <Manus Server IP>
```

---

## 🔒 Schritt 5: SSL-Zertifikat aktivieren

### 5.1 Manus Dashboard öffnen

1. Gehen Sie zu: https://manus.im
2. Gehen Sie zu Ihrem Projekt
3. Klicken Sie auf **Settings → Domains**

### 5.2 SSL aktivieren

1. Klicken Sie auf `zetologist.com`
2. Überprüfen Sie, dass **SSL** aktiviert ist (grünes Schloss)
3. Manus erstellt automatisch ein Let's Encrypt Zertifikat

**⏱️ Warten Sie 5-10 Minuten auf die Zertifikat-Erstellung**

### 5.3 SSL-Zertifikat überprüfen

```bash
# HTTPS überprüfen
curl -I https://zetologist.com

# Sollte zeigen:
# HTTP/2 200
# Strict-Transport-Security: max-age=31536000
# SSL-Certificate: valid
```

---

## 🌐 Schritt 6: Domain testen

### 6.1 Im Browser öffnen

1. Öffnen Sie: https://zetologist.com
2. Sie sollten die AmarenLogist Landing Page sehen
3. Überprüfen Sie, dass das grüne Schloss-Icon sichtbar ist (SSL aktiv)

### 6.2 Login testen

1. Klicken Sie auf **Login**
2. Testen Sie mit:
   - Benutzername: `amarenlogist`
   - Passwort: `amarenlogist555`
3. Sie sollten zum Admin-Dashboard weitergeleitet werden

### 6.3 Stripe Zahlung testen

1. Erstellen Sie einen Test-Auftrag
2. Gehen Sie zu `/payment/checkout/1`
3. Klicken Sie auf **Mit Stripe bezahlen**
4. Verwenden Sie Test-Kartennummer: `4242 4242 4242 4242`
5. Zahlung sollte erfolgreich sein

---

## 📧 Schritt 7: E-Mail-Konfiguration (optional)

Falls Sie E-Mails von `zetologist.com` versenden möchten:

### 7.1 MX Record bei Hostinger hinzufügen

1. Gehen Sie zu Hostinger: **Domains → zetologist.com → DNS Records**
2. Klicken Sie auf **Add Record**
3. Wählen Sie **MX Record**
4. Tragen Sie ein:
   ```
   Type: MX
   Name: @
   Value: mail.zetologist.com
   Priority: 10
   TTL: 3600
   ```

### 7.2 SPF Record hinzufügen

1. Klicken Sie auf **Add Record**
2. Wählen Sie **TXT Record**
3. Tragen Sie ein:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:sendgrid.net ~all
   TTL: 3600
   ```

### 7.3 DKIM Record hinzufügen

Siehe SendGrid Dokumentation für DKIM Setup.

---

## 🆘 Häufige Probleme und Lösungen

### Problem: "Domain nicht erreichbar"

**Lösung:**
1. Überprüfen Sie, dass Nameserver bei Hostinger geändert wurden
2. Warten Sie 24-48 Stunden auf DNS-Propagation
3. Überprüfen Sie mit `nslookup zetologist.com`

### Problem: "SSL-Zertifikat ungültig"

**Lösung:**
1. Gehen Sie zu Manus: **Settings → Domains → zetologist.com**
2. Klicken Sie auf **Renew Certificate**
3. Warten Sie 5-10 Minuten
4. Aktualisieren Sie den Browser (Ctrl+Shift+R)

### Problem: "Nameserver ändern funktioniert nicht"

**Lösung:**
1. Überprüfen Sie, dass Sie bei Hostinger angemeldet sind
2. Überprüfen Sie, dass Sie die richtigen Nameserver eingeben
3. Warten Sie 5 Minuten und versuchen Sie erneut
4. Kontaktieren Sie Hostinger Support

### Problem: "www.zetologist.com funktioniert nicht"

**Lösung:**
1. Gehen Sie zu Hostinger: **Domains → zetologist.com → DNS Records**
2. Fügen Sie einen CNAME Record hinzu:
   ```
   Type: CNAME
   Name: www
   Value: zetologist.com
   TTL: 3600
   ```

---

## ✅ Hostinger Setup Checkliste

- [ ] Domain `zetologist.com` bei Hostinger vorhanden
- [ ] Aktuelle Nameserver bei Hostinger notiert
- [ ] Manus Nameserver erhalten
- [ ] Nameserver bei Hostinger geändert
- [ ] DNS-Propagation überprüft (24-48 Stunden)
- [ ] SSL-Zertifikat bei Manus aktiviert
- [ ] Domain im Browser erreichbar (https://zetologist.com)
- [ ] Login funktioniert
- [ ] Stripe Zahlung funktioniert
- [ ] E-Mails werden versendet (optional)

---

## 📞 Support

### Hostinger Support

- **Website:** https://www.hostinger.com/support
- **E-Mail:** support@hostinger.com
- **Chat:** Im hPanel verfügbar

### Manus Support

- **Website:** https://help.manus.im
- **E-Mail:** support@manus.im

---

## 🎉 Gratulation!

Sie haben Ihre Domain `zetologist.com` erfolgreich mit AmarenLogist verbunden! 🚀

**Nächste Schritte:**
1. Testen Sie alle Features
2. Laden Sie Fahrer ein
3. Starten Sie Marketing-Kampagnen
4. Skalieren Sie das Netzwerk

---

**Viel Erfolg mit AmarenLogist! 💪**

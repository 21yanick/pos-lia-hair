# Funktionstest-Checkliste POS-LIA-HAIR

**Ziel:** Systematischer Test aller Kernfunktionen gegen das definierte Konzept  
**Datum:** 25.01.2025

## Vorbereitung

### System starten
- [ ] `npm run dev` oder entsprechenden Start-Befehl ausführen
- [ ] Browser öffnen: `http://localhost:3000`
- [ ] Mit Admin-Credentials anmelden (`admin@lia-hair.ch`)
- [ ] Dashboard-Seite lädt ohne Fehler

---

## 🏪 **TEST 1: POS-System (Verkäufe)**

### Normaler Verkaufsvorgang
- [ ] **POS-Seite öffnen** (`/pos`)
- [ ] **Produkt auswählen** (z.B. "Herrenschnitt")
- [ ] **Zum Warenkorb hinzufügen** - erscheint in der Liste?
- [ ] **Menge ändern** - funktioniert die +/- Buttons?
- [ ] **Preis individuell anpassen** - Edit-Button funktional?
- [ ] **Zweites Produkt hinzufügen** (z.B. "Haargel")
- [ ] **Gesamtsumme** wird korrekt berechnet?

### Zahlungsabwicklung testen
- [ ] **"Bezahlen" klicken** - Payment-Dialog öffnet sich?
- [ ] **Barzahlung testen:**
  - [ ] Betrag eingeben (mehr als Gesamtsumme)
  - [ ] Rückgeld wird berechnet?
  - [ ] Verkauf abschließen
  - [ ] **Quittung wird generiert?** (PDF-Popup?)
- [ ] **TWINT-Zahlung testen:**
  - [ ] Zahlung abschließen
  - [ ] Quittung wird generiert?
- [ ] **SumUp-Zahlung testen:**
  - [ ] Zahlung abschließen  
  - [ ] Quittung wird generiert?

### Status prüfen
- [ ] **Dashboard öffnen** - werden die Verkäufe angezeigt?
- [ ] **Aktuelle Tagesstatistiken** korrekt?

---

## 📊 **TEST 2: Tagesabschluss-System**

### Tagesabschluss erstellen
- [ ] **Daily Reports öffnen** (`/reports/daily`)
- [ ] **Heutiges Datum auswählen** 
- [ ] **Verkäufe werden angezeigt?** (vom POS-Test)
- [ ] **Berechnete Summen korrekt?**
  - [ ] Bargeld-Summe stimmt?
  - [ ] TWINT-Summe stimmt?
  - [ ] SumUp-Summe stimmt?
  - [ ] Gesamtsumme stimmt?

### Tagesabschluss schließen
- [ ] **"Tagesabschluss erstellen" klicken**
- [ ] **Bargeld-Anfangsbestand eingeben** (z.B. 100 CHF)
- [ ] **Bargeld-Endbestand eingeben** (Anfang + Barverkäufe)
- [ ] **Notizen hinzufügen** (optional)
- [ ] **Abschluss erstellen**
- [ ] **Status ändert sich auf "CLOSED"?**
- [ ] **PDF wird generiert?** (Download/Preview?)

### Nach dem Schließen testen
- [ ] **Erneut POS öffnen**
- [ ] **Weiteren Verkauf versuchen** 
- [ ] **⚠️ KRITISCH: Gibt es eine Warnung?** (sollte nach Konzept)
- [ ] Falls keine Warnung: Verkauf trotzdem möglich?

---

## 💰 **TEST 3: Ausgaben-System**

### Ausgabe erfassen
- [ ] **Supplier Invoices öffnen** (`/supplier-invoices`)
- [ ] **"Neue Ausgabe" klicken**
- [ ] **Ausgabe erfassen:**
  - [ ] Kategorie: "supplies" (Einkauf)
  - [ ] Betrag: 50 CHF
  - [ ] Beschreibung: "Shampoo Nachbestellung"
  - [ ] Zahlungsart: "cash" (Bar)
  - [ ] Datum: heute
- [ ] **Ausgabe speichern**

### Bargeld-Auswirkung prüfen
- [ ] **Dashboard öffnen** - hat sich Bargeld-Bestand geändert?
- [ ] **Daily Reports öffnen** 
- [ ] **⚠️ KRITISCH: Wird die Ausgabe im Tagesabschluss angezeigt?** 
  - [ ] Falls JA → **FEHLER** (sollte nicht laut Konzept)
  - [ ] Falls NEIN → **KORREKT**

### Bank-Ausgabe testen
- [ ] **Weitere Ausgabe erfassen:**
  - [ ] Kategorie: "rent" (Miete) 
  - [ ] Betrag: 1200 CHF
  - [ ] Zahlungsart: "bank"
- [ ] **Speichern**
- [ ] **Bargeld-Bestand unverändert?** (sollte so sein)

---

## 📄 **TEST 4: Documents-System**

### Documents-Übersicht
- [ ] **Documents-Seite öffnen** (`/documents`)
- [ ] **Werden alle generierten Quittungen angezeigt?**
- [ ] **Wird das Tagesabschluss-PDF angezeigt?**
- [ ] **Sind die Dokumente nach Datum sortiert?**

### Dokument-Aktionen
- [ ] **Quittung anklicken** - öffnet sich PDF?
- [ ] **Tagesabschluss-PDF anklicken** - öffnet sich?
- [ ] **Filter testen** (verschiedene Dokumenttypen)
- [ ] **Suche testen** (nach Datum oder Betrag)

### Upload-Funktion
- [ ] **"Upload" klicken**
- [ ] **Test-PDF hochladen** (beliebige PDF-Datei)
- [ ] **Kategorie zuweisen** (z.B. "expense_receipt")
- [ ] **Upload erfolgreich?**
- [ ] **Erscheint in der Dokument-Liste?**

---

## 📈 **TEST 5: Monatsabschluss**

### Monthly Reports
- [ ] **Monthly Reports öffnen** (`/reports/monthly`)
- [ ] **Aktueller Monat wird angezeigt?**
- [ ] **Tagesabschlüsse sind aufgelistet?**
- [ ] **Summen werden berechnet?**

### Monatsabschluss erstellen (falls möglich)
- [ ] **"Monatsabschluss erstellen" (falls Button vorhanden)**
- [ ] **PDF wird generiert?**
- [ ] **⚠️ BEKANNTES PROBLEM: PDF-Generation funktioniert?**
- [ ] **Erscheint PDF in Documents?**

---

## 🔧 **TEST 6: Edge Cases & Error Handling**

### Fehlerbedingungen
- [ ] **Leerer Warenkorb bezahlen** - Fehlermeldung?
- [ ] **Negativen Betrag bei Bargeld** - Validierung?
- [ ] **Ungültiges Datum bei Ausgaben** - Validierung?
- [ ] **Sehr langen Text in Notizen** - funktioniert?

### Browser-Tests
- [ ] **F5 drücken auf verschiedenen Seiten** - Daten bleiben?
- [ ] **Zurück-Button des Browsers** - funktioniert Navigation?
- [ ] **Mehrere Tabs öffnen** - Daten synchron?

---

## 📋 **TEST 7: Konzept-Compliance**

### Kern-Prinzipien prüfen
- [ ] **✅ Saubere Trennung:** Ausgaben ≠ Tagesabschluss
- [ ] **✅ Status-Logik:** draft → closed funktioniert  
- [ ] **❌ Korrektur-System:** Ist implementiert? (vermutlich nicht)
- [ ] **✅ Dokumente:** Werden automatisch erstellt
- [ ] **❌ Buchhaltungs-Export:** Ist verfügbar? (vermutlich nicht)

---

## 📊 **ERGEBNIS-DOKUMENTATION (25.01.2025)**

### **✅ ERFOLGREICH GETESTET:**
- **POS-System:** Alle Zahlungsarten funktionieren, PDF-Download repariert
- **Kassenbuch:** Zeigt alle Bargeld-Bewegungen des Monats korrekt an
- **Ausgaben-System:** Funktioniert separat von Tagesabschlüssen
- **Konzept-Compliance:** Saubere Trennung Salon ≠ Business-Ausgaben

### **🔧 GEFUNDENE & GEFIXTE PROBLEME:**

#### **1. POS PDF-Download** ✅ GEFIXT
```
❌ PROBLEM: PDF wird nicht angezeigt, nur leerer Tab
📍 ORT: /pos - nach Verkaufsabschluss
🔄 SCHRITTE: Verkauf → Bezahlen → "PDF herunterladen"  
💡 LÖSUNG: Signed URLs statt Public URLs implementiert
🎯 STATUS: FUNKTIONIERT
```

#### **2. Kassenbuch-Integration** ✅ GEFIXT
```
❌ PROBLEM: Ausgaben werden nicht im Kassenbuch angezeigt
📍 ORT: /reports/cash-register
🔄 SCHRITTE: Bar-Ausgabe erfassen → Kassenbuch prüfen
💡 LÖSUNG: getCashMovementsForMonth() implementiert, Monatsansicht
🎯 STATUS: FUNKTIONIERT
```

### **⚠️ VERBLEIBENDE ISSUES:**

#### **3. Documents Page** ❌ NOCH OFFEN
```
❌ PROBLEM: Unübersichtliche Anzeige, fehlende Integration
📍 ORT: /documents
🔄 SCHRITTE: Documents öffnen → wenig Infos, Monthly Reports fehlen
💡 ERWARTUNG: Zentrale Dokumentenverwaltung mit allen PDFs
🎯 PRIORITÄT: Hoch (Buchhaltungs-zentral)
```

#### **4. Daily Reports UI** ⚠️ VERBESSERUNG NÖTIG
```
❌ PROBLEM: "Aktualisieren"-Workflow verwirrend
📍 ORT: /reports/daily  
🔄 SCHRITTE: Tagesabschluss bereits gemacht → verwirrende UI
💡 ERWARTUNG: Klarere Status-Anzeige und Workflow
🎯 PRIORITÄT: Medium (UX-Optimierung)
```

#### **5. Monthly Reports Status** ⚠️ VERBESSERUNG NÖTIG
```
❌ PROBLEM: Status springt von "closed" zurück zu "draft"
📍 ORT: /reports/monthly
🔄 SCHRITTE: Monatsabschluss → Seite verlassen → zurück
💡 ERWARTUNG: Status bleibt persistent
🎯 PRIORITÄT: Medium (Status-Konsistenz)
```

---

## 🎯 **NEXT STEPS nach Test**

1. **✅ Funktionierende Bereiche:** Dokumentieren
2. **⚠️ Teilweise funktionierende:** Priorisieren  
3. **❌ Fehlerhafte Bereiche:** Fix-Plan erstellen
4. **🔧 Fehlende Features:** Implementierungs-Roadmap

**Dann können wir gezielt die wichtigsten Issues beheben und das System konzept-konform machen!**
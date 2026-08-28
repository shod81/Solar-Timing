# ☀️ Solar Time (Wahre Sonnenzeit, Organuhr, Planetenstunden & Mondphase)

Ein moderne, responsive Web-App zur Berechnung der **wahren Sonnenzeit**, der **TCM-Organuhr**, der **astrologischen Planetenstunden**, der **Tierkreiszeichen** und der **astronomischen Mondphase** für jeden beliebigen Standort der Erde. 

Alle mathematischen und astronomischen Berechnungen laufen zu 100 % clientseitig im Browser – es wird kein eigener Server oder Backend benötigt.

---

## 🌟 Hauptfunktionen

### 1. ☀️ Wahre Sonnenzeit (True Solar Time) & Polartag/Polarnacht
- **Präzise Berechnung:** Basierend auf GPS-Koordinaten, der Zeitgleichung (*Equation of Time*, EoT) und der exakten Längengrad-Korrektur (`4 min / °`).
- **Polartag & Polarnacht:** Vollständiges Handling für extreme Breitengrade (>66°) mit visuellen Hinweisen (*„Polartag (24h Tageslicht)“* / *„Polarnacht (24h Dunkelheit)“*).
- **Anzeige:** Digitale Zeitanzeige, analoge SVG-Uhr mit Sonnenstandsanzeige sowie visueller **Sonnenstandsbogen (Solar Arc)** für den Tagesverlauf (Sonnenaufgang, Sonnenmittag, Sonnenuntergang).

### 2. 🫀 TCM-Organuhr (Traditionelle Chinesische Medizin)
- **12 Organfenster:** Exakte 2-Stunden-Intervalle nach der Traditionellen Chinesischen Medizin.
- **Wahre Sonnenzeit als Basis:** Passt sich dynamisch an die echte Sonnenzeit des aktuellen Standorts an.
- **Interaktives Organuhr-Rad:** Kreisförmige SVG-Visualisierung mit Farbcodes für die 5 Elemente (Metall, Erde, Feuer, Wasser, Holz) sowie vollständiger **Tastaturnavigation (a11y)** über Pfeiltasten.

### 3. 🪐 Astrologische Planetenstunden (Chaldäische Reihe)
- **Tagstunden & Nachtstunden:** Aufteilung des Tages von Sonnenaufgang bis -untergang (12 Tagstunden) und Sonnenuntergang bis -aufgang (12 Nachtstunden).
- **Chaldäische Planetenfolge:** Zuordnung der Stunden nach der klassischen Reihe (*Saturn, Jupiter, Mars, Sonne, Venus, Merkur, Mond*).
- **Tagesherrscher & Fortschritt:** Anzeige des Hauptplaneten des Wochentags, der aktiven Stunde mit Zeitfenster und Fortschrittsbalken.

### 4. ✨ Tierkreis & Himmelsstand (Sonnen- & Mondzeichen)
- **Sonnenzeichen (Sternzeichen):** Berechnet die exakte Position der Sonne im Tierkreis (0°–360°) inklusive Graddarstellung in den 12 Sternzeichen.
- **Mondzeichen:** Berechnet die Position des Mondes im Tierkreis (wechselt alle ~2,5 Tage).

### 5. 🌙 Astronomische Mondphase
- **Hohe Genauigkeit:** Berechnet nach astronomischen Algorithmen (Jean Meeus) über den mittleren Phasenwinkel der Ekliptik.
- **Phasen & Beleuchtung:** Exakter Beleuchtungsgrad (in %), Mondalter (Tage seit Neumond), Zyklustag und Mondphasen-Visualisierung.
- **Vollmondwoche:** Visueller Helligkeitseffekt ("Glowing") in der Woche um den Vollmond (±3 Tage).

### 6. 🗺️ Interaktive Karte (Leaflet.js)
- **Drag-&-Drop Pin:** Marker kann frei auf der Karte verschoben werden – Standort, Sonnenzeit & Organuhr aktualisieren sich sofort beim Loslassen.
- **Klick-Auswahl:** Klick auf einen Ort setzt die Position umgehend.
- **Geocoding & IP-Fallback:** Suche per Adresse, GPS-Taster & automatisches IP-Fallback (via ipwho.is).

### 7. ⏳ Zeitauswahl & Jahreszeiten-Quick-Select
- **Simulationsmodus:** Beliebiges Datum & Uhrzeit einstellen.
- **Schnellauswahl für Solstitien & Equinoxien:** Schnellwahl-Buttons für Frühlingsanfang (20. März), Sommersonnenwende (21. Juni), Herbstanfang (22. September) und Wintersonnenwende (21. Dezember).

### 8. 💀 Skeleton-Screen Loading State
- **Sanftes Laden:** Statt blasser Ladehinweise erscheinen während der GPS-/IP-Ermittlung Shimmer-Platzhalter (Skeleton Screens).

### 9. 🖨️ Druck-Stylesheet (Print & PDF Export)
- **A4 PDF/Druck-Optimierung:** 1-Klick-Button `🖨️` oder `Strg+P` schaltet auf ein tintentaugliches Black-on-White-Layout ohne störende Interaktionselemente.

---

## 🛠️ Technologie-Stack

- **Frontend-Framework:** React 18
- **Sprache:** TypeScript
- **Karten-Bibliothek:** Leaflet.js
- **Build Tool / Bundler:** Vite 5 (mit automatischem Service Worker Cache-Buster Plugin)
- **Styling:** Vanilla CSS (CSS Variablen, Dark-Mode, Nightshift Rotlicht-Modus, Print-CSS)

---

## 🚀 Entwicklung & Build

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungs-Server starten
npm run dev

# 3. Produktions-Build erstellen (TypeScript-Check + SW-Cache-Buster + Vite Build)
npm run build
```

---

## 🌐 Deployment & Hosting

Lade den **gesamten Inhalt des `dist/`-Ordners** (oder entpacke `SolarTime_Webhosting_Files.zip`) per FTP in das Webroot deines Shared Hostings. Kein Node.js-Server erforderlich!

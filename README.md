# fi-go [![Deploy to Firebase Hosting](https://github.com/MrGoro/fi-go/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/MrGoro/fi-go/actions/workflows/firebase-hosting-merge.yml)

**fi-go** ist eine moderne, hochperformante Progressiv Web App (PWA) zur präzisen Erfassung und Verwaltung von Arbeitszeiten. Entwickelt für maximale Effizienz auf der Firebase-Plattform, bietet fi-go eine nahtlose Synchronisation über alle Endgeräte hinweg – spezialisiert auf die Anforderungen moderner Browser-Technologien inklusive nativer Safari-Push-Benachrichtigungen unter iOS.

**Live App:** [https://fi-go.schuermann.app](https://fi-go.schuermann.app)

---

## 🚀 Moderne Architektur
Die Anwendung wurde von Grund auf modernisiert und nutzt eine skalierbare Monorepo-Struktur:

*   **Frontend**: React mit Vite 8 & Tailwind CSS v4 für ein blitzschnelles und premium UI/UX Erlebnis.
*   **Shared Logic (`@figo/shared`)**: Zentralisierte Geschäftslogik für Zeit- und Pausenberechnungen, die konsistent von Frontend und Backend genutzt wird.
*   **Backend**: Firebase Functions (V2) auf Node.js 22 LTS Basis.
*   **Push-Engine**: Hochpräzises Benachrichtigungs-Scheduling via **Google Cloud Tasks** (sekundengenaue Trigger).
*   **Realtime-Sync**: Datenspeicherung in der Firebase Realtime Database für sofortige Geräteübergreifende Updates.

## ✨ Features
*   **Passwordless Login**: Sicherer und einfacher Einstieg per Telefonnummer (Firebase Auth).
*   **Native Push-Notifications**: Intelligente Reminder kurz vor Feierabend und vor Erreichen der 10-Stunden-Grenze – optimiert für Desktop Safari und iOS PWA.
*   **Echtzeit-Fortschritt**: Dynamische Anzeige der verbleibenden Arbeitszeit und des Saldos direkt im Browser.
*   **Pausen-Management**: Automatische Berechnung gesetzlicher Pausenzeiten sowie Unterstützung für manuelle Pausenerfassungen.
*   **Cross-Device**: Stemple am Desktop ein und verwalte deinen Fortschritt mobil am iPhone – alles in Echtzeit.

## 🕒 Zeitregeln (Default)
In der Shared-Logik sind aktuell folgende Standardwerte konfiguriert:
*   **Soll-Arbeitszeit**: 7:36 Stunden.
*   **Pausenregelung**: 
    *   30 Minuten nach 6 Stunden Arbeitszeit.
    *   45 Minuten nach 9 Stunden Arbeitszeit.
*   **10-Stunden-Warnung**: Proaktive Benachrichtigung vor Erreichen der gesetzlichen Höchstarbeitszeit.

## 🛠 Entwicklung
fi-go nutzt npm workspaces. Zum lokalen Starten einfach im Root-Verzeichnis:

```bash
# Abhängigkeiten installieren
npm install

# Shared Package bauen
npm run shared:build

# Web App im Dev-Modus starten
npm run dev
```

## 📸 Screenshots

![Login mit Telefonnummer](screens/01-login.png)

![Eingabe der Arbeitszeit](screens/02-time-input.png)

![Verwalten von Pausen](screens/03-breaks.png)

![Anzeige der Arbeitszeit](screens/04-timer.png)

![Warnung vor Überschreiten der 10-Stunden-Grenze](screens/05-warning.png)

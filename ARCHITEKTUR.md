# Architektur-Dokumentation: MathMaster Neun

Dieses Projekt ist als hochperformante **Single Page Application (SPA)** mit React 19 konzipiert.

## 1. Modularer Aufbau (Service Layer)
Die Geschäftslogik ist strikt von der UI getrennt. Dies ermöglicht einen einfachen Austausch des Backends:
- **`apiService.ts`**: Simuliert aktuell die Datenbank-Interaktion via `localStorage`. Hier liegen die Schnittstellen für Auth, Leaderboard und Chat.
- **`taskFactory.ts`**: Ein deterministischer Generator, der basierend auf der Quest-ID pädagogisch sinnvolle Aufgaben erstellt.
- **`geminiService.ts`**: Brücke zur Google AI für dynamische Hilfestellungen.

## 2. Datenmodell & Persistenz
- **User-Objekt**: Speichert XP, Coins, freigeschaltete Items und absolvierte Quests.
- **State Management**: React `useState` für lokale UI-Zustände, während kritische Daten synchron in den `localStorage` gespiegelt werden.

## 3. Social & PvP-Logik
Das Battle-System vergleicht die Performance des Spielers gegen gespeicherte "Ghosts" (Bots) oder andere User-Snapshots. Ein Sieg triggert ein **Global Broadcast Event**, welches im Chat für alle sichtbar wird, um sozialen Wettbewerb zu fördern.

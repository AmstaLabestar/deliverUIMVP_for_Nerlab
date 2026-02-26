# Profiling Release Android 2GB RAM

## Objectif
- Valider 60 FPS stable en build release.
- Ajuster `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `estimatedItemSize` par ecran.
- Verifier le seuil FlashList (`>500` items) en conditions reelles.

## Prerequis
1. Installer FlashList:
```bash
npm install @shopify/flash-list
```
2. Build release Android:
```bash
npm run android:release
```
3. Lancer Flipper et connecter le device Android 2GB RAM.

## Ecrans concernes
- `HomeScreen` (courses disponibles)
- `ReservationsScreen` (historique)
- `WalletScreen` (transactions)
- `PressingScreen` (offres)

Les presets sont centralises dans:
- `src/shared/performance/listPresets.ts`

## Workflow de mesure
1. Ouvrir Flipper.
2. Plugins a activer:
- `Performance`
- `React DevTools` (Profiler)
- `Network`
3. Scenario par ecran:
- Charger l'ecran
- Scroller 15-20 secondes
- Pull-to-refresh (si dispo)
- Naviguer vers un autre onglet puis retour

## Metriques a collecter
- JS FPS (p50/p95)
- UI FPS (p50/p95)
- Temps de commit React (p95)
- Long tasks JS > 16ms
- Pic memoire sur scroll long
- Nombre de requetes reseau et retries

## Regles d'ajustement par ecran
1. Si JS FPS chute au debut du scroll:
- Baisser `initialNumToRender` de 1-2.
2. Si blank area au scroll rapide:
- Augmenter `windowSize` de 1-2.
3. Si pics memoire:
- Reduire `windowSize`.
4. Si cadence de rendu trop agressive:
- Reduire `maxToRenderPerBatch`.
5. Si jank persistant sur FlashList:
- Ajuster `estimatedItemSize` a la hauteur reelle moyenne.

## Presets actuels
- `home`: `estimatedItemSize=280`, `initialNumToRender=4`, `maxToRenderPerBatch=4`, `windowSize=10`
- `reservations`: `estimatedItemSize=92`, `initialNumToRender=8`, `maxToRenderPerBatch=8`, `windowSize=10`
- `wallet`: `estimatedItemSize=84`, `initialNumToRender=10`, `maxToRenderPerBatch=10`, `windowSize=11`
- `pressing`: `estimatedItemSize=220`, `initialNumToRender=6`, `maxToRenderPerBatch=6`, `windowSize=9`

## Critere Go/No-Go
- UI FPS p95 >= 55
- JS FPS p95 >= 50
- Aucun freeze > 500ms pendant scroll/navigation
- Pas de croissance memoire continue sur 5 minutes d'usage

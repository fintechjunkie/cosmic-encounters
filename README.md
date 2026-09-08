# Cosmic Encounters

A single-player, browser-based tribute to the 1977–1983 Eon era of *Cosmic Encounter*. One human plays against three deterministic computer opponents. The game runs entirely in the browser and saves the current expedition on the device.

This is an independent personal adaptation. It is not affiliated with or endorsed by the game’s designers or publishers. Original game art and scans are not included.

## Playable alpha

- Complete turn loop from regroup through resolution and victory
- Alliances, attack cards, Compromise, consolation, shared victories
- Clone, Macron, Virus, and Zombie powers
- Lucre economy and combat contribution
- Kickers and three representative Edicts
- Clone and Macron Flares
- Twelve representative Moon effects
- Standard and relaxed computer personalities
- Expansion toggles and local save/resume

The field guide inside the game lists deliberate simplifications. The source of truth for the implemented behavior is `site/lib/game.ts`.

## Local development

The website is in `site/`.

```powershell
cd site
npm install
npm run dev
```

For a production check:

```powershell
npm run build
```

## Project documents

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Rules coverage](docs/RULES.md)
- [Original consolidated Eon rules](https://daveola.com/CosmicEncounter/Rules/Eon.Rules.pdf)
- [Original Eon appendix](https://daveola.com/CosmicEncounter/Rules/Eon_Appendix.pdf)


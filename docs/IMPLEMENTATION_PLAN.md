# Implementation plan

## Product goal

Recreate the feel of the Eon-era tabletop game for one human and three computer opponents. Preserve the race for five foreign bases, hidden challenge cards, alliances, negotiation, asymmetric powers, Flares, Moons, Lucre, Kickers, Edicts, and the possibility of shared victory.

The project should remain a rules engine with a user interface around it. Humans and computer opponents submit the same legal actions. Randomness is seeded, so a failed game can be reproduced.

## Architecture

`site/lib/game.ts` owns game state, legal actions, resolution, serialization, invariant checks, and computer decisions. It has no React or browser dependencies. `site/app/page.tsx` renders the board and submits action IDs. The computer policy receives a restricted observation that excludes opponents’ hands, committed challenge cards, the deck order, and unknown Moons.

This separation lets us simulate thousands of games without a browser and replace either the presentation or computer policy without rewriting the rules.

## Delivery phases

### 1. Playable vertical slice — complete

Four players, complete turns, five-base victory, alliances, basic negotiation, seeded randomness, saves, four aliens, and representative content from Flares, Moons, Lucre, Kickers, and Edicts.

### 2. Faithful Eon core

- Implement all fifteen aliens from the 1977 base set.
- Complete the eight base Edicts and their response timing.
- Add explicit defensive reward selection.
- Let players select token sources and return destinations.
- Add complete card and Lucre terms to deals.
- Add Reverse Cone and its ally reward inversion.
- Add a rules inspector that explains every modifier in an encounter total.

Exit criterion: every non-expansion rule in the consolidated rulebook has a fixture or simulation covering it.

### 3. Expansion sets 1–4

- Add fifth and sixth player support to the data model, while retaining the four-seat solo default.
- Implement the forty alien powers added by sets 1–3.
- Expand the challenge deck with the period-correct cards.
- Implement all matching Flares, including the Eon rule that used Flares return to hand.
- Introduce a priority queue for timing conflicts: non-main players clockwise from offense, then offense, then defense.

Exit criterion: the base game plus Flares can run 1,000 seeded simulations without a deadlock or conservation failure.

### 4. Moons and Lucre

- Replace the representative Moon set with all 100 effects.
- Model Immediate, Continuing, and Secret Moon timing separately.
- Add moon-specific prompts where the tabletop rule calls for speech, choice, or judgment; provide a practical solo equivalent for social effects.
- Complete the Lucre aliens and transfers between players.
- Add the Praw and purchases that move tokens from Praw to Warp.

Exit criterion: Moon and Lucre modules can be enabled independently or together, and every effect has a documented solo adaptation.

### 5. Expansion sets 7–9

- Add the remaining aliens, Flares, Edicts, and five Kickers.
- Implement the unique planet systems and their four-base victory rule.
- Build compatibility metadata for combinations the original materials prohibit or leave to house rules.

Exit criterion: all 75 Eon aliens and all nine expansion modules are selectable at game setup.

### 6. Stronger computer play and polish

- Replace fixed action scores with short Monte Carlo rollouts using only legal observations.
- Add opponent personalities, alliance memory, and threat assessment for simultaneous wins.
- Add a tutorial game, animation speed, accessible color alternatives, keyboard shortcuts, and import/export saves.
- Add balance telemetry stored locally and exportable by the player.

## Quality strategy

Every state-changing rule must preserve twenty tokens per player and the original number of cards. Automated simulations should check those invariants after every action and fail on phases with no legal move. Interaction tests should cover every human decision surface; browser checks should cover desktop and narrow layouts.

## Legal and art direction

The repository should contain original interface art, descriptions written for this adaptation, and factual references to the historical rules. Do not distribute scans, card illustrations, logos, or other publisher assets. Before any public commercial release, obtain legal advice about the title, rule text, trade dress, and underlying rights.


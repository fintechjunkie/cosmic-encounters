// Eon-era rules engine. No UI, clock, network, or unseeded randomness.
// The supported subset and deliberate adaptations are recorded in docs/RULES.md.
export type Alien = 'Clone' | 'Macron' | 'Virus' | 'Zombie' | 'Anti-Matter' | 'Pacifist' | 'Warpish' | 'Mutant';
export type Card = { id: string; kind: 'attack' | 'compromise' | 'edict' | 'flare' | 'kicker'; name: string; value: number };
export type Planet = { id: string; home: number; index: number; ships: number[]; moon?: string; revealed?: boolean };
export type Player = { id: number; name: string; alien: Alien; color: string; hand: Card[]; warp: number; lucre: number };
export type Phase = 'regroup' | 'destiny' | 'launch' | 'inviteO' | 'inviteD' | 'alliance' | 'tactics' | 'planning' | 'reveal' | 'deal' | 'resolution' | 'gameover';
export type Settings = { alien: Alien; flares: boolean; moons: boolean; lucre: boolean; kickers: boolean; difficulty: 'relaxed' | 'standard' };
export type Encounter = { defense: number; system: number; target: string; ships: number[]; sides: ('offense' | 'defense' | null)[]; invitedO: number[]; invitedD: number[]; cursor: number; order: number[]; selected: (Card | null)[]; kickers: (Card | null)[]; zapped: number[]; flare: number[]; bought: number[]; success: boolean; totals: number[]; summary: string; dealOffered: boolean };
export type Game = { version: 1; seed: number; rng: number; settings: Settings; players: Player[]; planets: Planet[]; deck: Card[]; discard: Card[]; destiny: number[]; destinyDiscard: number[]; active: number; turn: number; challenge: number; phase: Phase; encounter: Encounter; log: string[]; winners: number[]; actionCount: number; cardCount: number };
export type Action = { id: string; label: string; detail?: string; kind: string; target?: string; count?: number; ids?: number[]; cardId?: string; player?: number; side?: 'offense' | 'defense'; score?: number };
export type Decision = { player: number; title: string; help: string; actions: Action[] };

export const ALIENS: Record<Alien, { title: string; description: string; hint: string }> = {
  Clone: { title: 'Replication', description: 'Keep the challenge cards you play.', hint: 'A good attack can become a reliable companion.' },
  Macron: { title: 'Mass', description: 'Each token fights with a strength of four. Launch only one token without your Super Flare.', hint: 'Small fleets. Enormous consequences.' },
  Virus: { title: 'Multiplication', description: 'Multiply your attack card by the number of tokens on your side, including allies.', hint: 'In the Eon version, your allies multiply too.' },
  Zombie: { title: 'Immortality', description: 'Your lost tokens return to your bases instead of entering the Warp.', hint: 'Take risks. You tend to come back.' },
  'Anti-Matter': { title: 'Negation', description: 'When you are a main player and both sides attack, the lower total wins. Defense still wins ties.', hint: 'Small cards become terrifying. Keep your total lean.' },
  Pacifist: { title: 'Peace', description: 'As a main player, your Compromise defeats an opponent’s Attack.', hint: 'Your opponent must decide whether your surrender is a trap.' },
  Warpish: { title: 'Necromancy', description: 'As a main player, add the number of your tokens in the Warp to your combat total.', hint: 'A crowded Warp can turn a modest attack into a victory.' },
  Mutant: { title: 'Regeneration', description: 'After an encounter in which you are a main player, refill your hand to eight cards.', hint: 'Spend cards freely. Your hand keeps growing back.' },
};
export const MOONS: Record<string, { name: string; description: string }> = {
  mass: { name: 'Mass Generation', description: 'Your attack cards gain 10 while you occupy this moon.' },
  plus: { name: 'Plus Moon', description: 'Add 10 to your total as a main player.' },
  minus: { name: 'Minus Moon', description: 'Subtract 10 from your total as a main player.' },
  power: { name: 'Power Trip', description: 'Keep your alien power even with fewer than three home bases.' },
  null: { name: 'Null', description: 'Your alien power is inactive while you occupy this moon.' },
  mobius: { name: 'Mobius Moon', description: 'On arrival, recover all your tokens from the Warp.' },
  worm: { name: 'Warp Worm', description: 'On arrival, the landing tokens go to the Warp.' },
  quantum: { name: 'Quantum', description: 'On arrival, bring all your Warp tokens to this moon.' },
  ten: { name: 'Ten Spot', description: 'Your main opponent’s attack card gains 10.' },
  mini: { name: 'Mini Mac', description: 'Your tokens contribute twice their normal token count in combat.' },
  salvage: { name: 'Salvage', description: 'Take a card from the top of the discard for each arriving token.' },
  defense: { name: 'Defense Moon', description: 'Add the combat strength of tokens here when you defend.' },
};
export const FLARES: Record<string, { wild: string; super: string }> = {
  Clone: { wild: 'Keep an Edict you use for another challenge.', super: 'Take twice the normal consolation.' },
  Macron: { wild: 'Launch up to your number of bases instead of four.', super: 'Launch up to four Macron tokens.' },
};
export const cardLabel = (c: Card) => c.kind === 'attack' ? `Attack ${c.value}` : c.kind === 'kicker' ? `Kicker ×${c.value}` : c.kind === 'flare' ? `${c.name} Flare` : c.name;
const emptyEncounter = (): Encounter => ({ defense: -1, system: -1, target: '', ships: [0,0,0,0], sides: [null,null,null,null], invitedO: [], invitedD: [], cursor: 0, order: [], selected: [null,null,null,null], kickers: [null,null,null,null], zapped: [], flare: [], bought: [0,0,0,0], success: false, totals: [0,0,0,0], summary: '', dealOffered: false });
function random(g: Game) { g.rng = (Math.imul(g.rng, 1664525) + 1013904223) >>> 0; return g.rng / 4294967296; }
function shuffle<T>(g: Game, a: T[]) { for (let i=a.length-1;i>0;i--) { const j=Math.floor(random(g)*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function record(g: Game, message: string) { g.log.push(message); if(g.log.length>160) g.log.shift(); }
export function bases(g: Game, p: number) { return g.planets.filter(x=>x.ships[p]>0); }
export function homeBases(g: Game,p:number) { return bases(g,p).filter(x=>x.home===p && !x.moon).length; }
export function foreignBases(g: Game,p:number) { return bases(g,p).filter(x=>x.home!==p && !x.moon).length; }
export function moonEffect(g: Game,p:number,key:string) { return g.planets.some(x=>x.moon===key && x.revealed && x.ships[p]>0); }
export function powerActive(g:Game,p:number) { return !g.encounter.zapped.includes(p) && !moonEffect(g,p,'null') && (homeBases(g,p)>=3 || moonEffect(g,p,'power')); }
function hasPower(g:Game,p:number,a:Alien) { return g.players[p].alien===a && powerActive(g,p); }
function hasFlare(g:Game,p:number,name:string) { return g.players[p].hand.some(c=>c.kind==='flare'&&c.name===name); }
export function availableShips(g:Game,p:number) { return bases(g,p).reduce((n,x)=>n+x.ships[p],0); }
export function launchLimit(g:Game,p:number) {
  let limit=hasPower(g,p,'Macron') ? 1 : 4;
  if(hasFlare(g,p,'Macron')) limit=hasPower(g,p,'Macron') ? 4 : Math.max(limit,bases(g,p).length);
  return Math.min(limit,availableShips(g,p)+(g.encounter.ships[p]||0));
}
// Choose surplus tokens first; preserve foreign bases and then home power where possible.
function takeShips(g:Game,p:number,n:number) {
  let taken=0;
  while(taken<n) {
    const places=bases(g,p).sort((a,b)=> {
      const value=(x:Planet)=> (x.ships[p]>1?100:0)+(x.home===p?10:0)+x.ships[p]-(x.moon?5:0);
      return value(b)-value(a);
    });
    if(!places.length) break;
    places[0].ships[p]--; taken++;
  }
  return taken;
}
function returnShips(g:Game,p:number,n:number) {
  if(!n)return;
  const places=bases(g,p).sort((a,b)=>(Number(b.home===p&&!b.moon)-Number(a.home===p&&!a.moon)) || a.ships[p]-b.ships[p]);
  if(places.length) places[0].ships[p]+=n; else g.players[p].warp+=n;
}
function loseShips(g:Game,p:number,n:number,immortal=hasPower(g,p,'Zombie')) { if(!n)return;if(immortal && bases(g,p).length) {returnShips(g,p,n); record(g,`${g.players[p].name} invokes Immortality: ${n} token${n===1?' returns':'s return'} to base.`);} else {g.players[p].warp+=n;record(g,`${n} ${g.players[p].name} token${n===1?' falls':'s fall'} into the Warp.`);} }
function recover(g:Game,p:number,n:number) { const amount=Math.min(n,g.players[p].warp); if(!bases(g,p).length)return 0; g.players[p].warp-=amount; returnShips(g,p,amount); return amount; }
function draw(g:Game,p:number,n:number) {
  for(let i=0;i<n;i++) {
    if(!g.deck.length) g.deck=shuffle(g,g.discard.splice(0));
    if(!g.deck.length) break;
    g.players[p].hand.push(g.deck.pop()!);
  }
}
function challengeCards(g:Game,p:number) { return g.players[p].hand.filter(c=>c.kind==='attack'||c.kind==='compromise'); }
function newHand(g:Game,p:number) {
  g.discard.push(...g.players[p].hand.splice(0)); draw(g,p,7);
  // Eon redraws when no challenge card is available; guard against impossible custom saves.
  for(let i=0;!challengeCards(g,p).length && i<20;i++) { g.discard.push(...g.players[p].hand.splice(0)); draw(g,p,7); }
  record(g,`${g.players[p].name} draws a fresh seven-card hand.`);
}
function begin(g:Game,first:boolean) {
  g.encounter=emptyEncounter(); g.phase='regroup';
  if(first) { if(g.settings.lucre)g.players[g.active].lucre++; if(!challengeCards(g,g.active).length)newHand(g,g.active); }
  const p=g.active;
  if(g.players[p].warp) {
    if(!bases(g,p).length){g.players[p].warp--;g.encounter.ships[p]=1;record(g,`${g.players[p].name} returns one token directly to the cone.`);}
    else recover(g,p,1);
  }
  record(g,`Turn ${g.turn} · ${g.players[p].name} begins challenge ${g.challenge}.`);
}
export function newGame(settings:Partial<Settings>={},seed=1977):Game {
  const config:Settings={alien:'Clone',flares:true,moons:true,lucre:true,kickers:true,difficulty:'standard',...settings};
  let rosterRng=seed>>>0;const candidates=(Object.keys(ALIENS) as Alien[]).filter(a=>a!==config.alien);
  for(let i=candidates.length-1;i>0;i--){rosterRng=(Math.imul(rosterRng,1664525)+1013904223)>>>0;const j=Math.floor((rosterRng/4294967296)*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  const roster:Alien[]=[config.alien,...candidates.slice(0,3)];
  const g:Game={version:1,seed:seed>>>0,rng:rosterRng,settings:config,players:roster.map((alien,id)=>({id,name:id===0?'You':alien,alien,color:['#efad59','#79c4b4','#ae9bdb','#e47f74'][id],hand:[],warp:0,lucre:config.lucre?4:0})),planets:[],deck:[],discard:[],destiny:[],destinyDiscard:[],active:0,turn:1,challenge:1,phase:'regroup',encounter:emptyEncounter(),log:[],winners:[],actionCount:0,cardCount:0};
  for(let p=0;p<4;p++)for(let i=0;i<5;i++)g.planets.push({id:`p${p}-${i}`,home:p,index:i,ships:[0,1,2,3].map(x=>x===p?4:0)});
  if(config.moons) { const pool=shuffle(g,Object.keys(MOONS)); for(let p=0;p<4;p++)for(let i=0;i<2;i++)g.planets.push({id:`m${p}-${i}`,home:p,index:i,ships:[0,0,0,0],moon:pool.pop()!,revealed:false}); }
  let id=0; const add=(kind:Card['kind'],name:string,value:number,count=1)=>{for(let i=0;i<count;i++)g.deck.push({id:`c${id++}`,kind,name,value});};
  for(const [v,n] of [[30,1],[20,2],[18,1],[15,2],[14,2],[12,4],[10,6],[8,8],[6,8],[4,2]])add('attack','Attack',v,n);
  add('compromise','Compromise',0,10);
  add('edict','Mobius Tubes',0,2);add('edict','Cosmic Zap',0,2);add('edict','Force Field',0);
  if(config.flares) { add('flare','Clone',0);add('flare','Macron',0); }
  if(config.kickers) {add('kicker','Kicker',3);add('kicker','Kicker',2,3);add('kicker','Kicker',0);}
  g.cardCount=g.deck.length;
  shuffle(g,g.deck);for(let p=0;p<4;p++)draw(g,p,7);
  g.destiny=shuffle(g,[0,0,0,1,1,1,2,2,2,3,3,3]);
  record(g,'A new galaxy. Establish five foreign planet bases to win.');begin(g,true);return g;
}
export function targetName(g:Game,x:Planet) { return x.moon ? (x.revealed ? MOONS[x.moon].name : `${g.players[x.home].name=== 'You'?'Your':g.players[x.home].name+"’s"} moon ${x.index+1}`) : `${g.players[x.home].name=== 'You'?'Your':g.players[x.home].name+"’s"} planet ${x.index+1}`; }
function getTargets(g:Game) {
  const system=g.encounter.system;
  return g.planets.filter(x=>x.home===system && (x.moon ? x.ships[g.active]===0 : system!==g.active || x.ships.some((n,p)=>p!==g.active&&n>0)));
}
function invitationOptions(g:Game):Action[] {
  const others=g.players.filter(x=>x.id!==g.active&&x.id!==g.encounter.defense).map(x=>x.id);
  return [{id:'invite-none',label:'Go alone',kind:'invite',ids:[]},...others.map(id=>({id:`invite-${id}`,label:`Invite ${g.players[id].name}`,kind:'invite',ids:[id]})),{id:'invite-all',label:'Invite both players',kind:'invite',ids:others}];
}
export function decision(g:Game):Decision {
  const e=g.encounter,p=g.active;
  const make=(player:number,title:string,help:string,actions:Action[]):Decision=>({player,title,help,actions});
  if(g.phase==='gameover')return make(0,'The galaxy has its winners','Start another expedition to play again.',[]);
  if(g.phase==='regroup') {
    const actions:Action[]=[{id:'destiny',label:'Turn the destiny disc',kind:'destiny'}];
    if(g.settings.lucre&&g.players[p].lucre>0&&g.players[p].warp>0&&bases(g,p).length)actions.push({id:'buy-token',label:'Recover a token · 1 Lucre',kind:'buy-token'});
    for(const c of g.players[p].hand.filter(c=>c.kind==='edict'&&c.name==='Mobius Tubes'))actions.push({id:`edict-${c.id}`,label:'Play Mobius Tubes',detail:'Release everyone’s Warp tokens to their existing bases.',kind:'tubes',cardId:c.id});
    return make(p,'Regroup & destiny','A recovered token returns automatically. Spend Lucre now, or discover your next destination.',actions);
  }
  if(g.phase==='destiny')return make(p,'Your own color','Draw again, or challenge a foreign base or moon in your home system.',[{id:'redraw',label:'Draw another disc',kind:'redraw'},...(getTargets(g).length?[{id:'home',label:'Challenge in your home system',kind:'home'}]:[])]);
  if(g.phase==='launch') {
    const actions:Action[]=[];
    for(const target of getTargets(g))for(let n=1;n<=launchLimit(g,p);n++) {
      const def=target.moon || target.home===p ? target.ships.findIndex((v,id)=>id!==p&&v>0) : target.home;
      actions.push({id:`launch-${target.id}-${n}`,label:`${targetName(g,target)} · ${n} token${n===1?'':'s'}`,kind:'launch',target:target.id,count:n,player:def,detail:target.moon?'Moon challenge · no allies':`Defending tokens: ${target.ships[def]??0}`});
    }
    if(!actions.length)actions.push({id:'no-launch',label:'End this turn',kind:'no-launch'});
    return make(p,'Choose your destination',`Destiny: ${g.players[e.system].name}. Choose a planet or moon, then how many tokens to launch. Surplus tokens move first.`,actions);
  }
  if(g.phase==='inviteO'||g.phase==='inviteD')return make(g.phase==='inviteO'?p:e.defense,'Invite your allies','Offensive allies can earn a base. Defensive allies earn cards or recovered tokens.',invitationOptions(g));
  if(g.phase==='alliance') {
    const who=e.order[e.cursor]; const actions:Action[]=[{id:'decline',label:'Stay out of this challenge',kind:'decline'}];
    for(const side of ['offense','defense'] as const)if((side==='offense'?e.invitedO:e.invitedD).includes(who))for(let n=1;n<=launchLimit(g,who);n++)actions.push({id:`ally-${side}-${n}`,label:`Join ${g.players[side==='offense'?p:e.defense].name} · ${n} token${n===1?'':'s'}`,kind:'ally',side,count:n});
    return make(who,'An invitation to the encounter','Choose a side, or sit this one out. You can join only one side.',actions);
  }
  if(g.phase==='tactics') {
    const who=e.order[e.cursor]; const actions:Action[]=[{id:'ready',label:'Ready for challenge cards',kind:'ready'}];
    if(g.settings.lucre&&(who===p||who===e.defense)&&e.bought[who]<4&&g.players[who].lucre>0)actions.push({id:'buy-card',label:'Buy a card · 1 Lucre',detail:`${4-e.bought[who]} purchases remaining`,kind:'buy-card'});
    for(const c of g.players[who].hand) {
      if(c.kind==='edict'&&c.name==='Cosmic Zap')for(const other of g.players)if(other.id!==who&&powerActive(g,other.id))actions.push({id:`zap-${c.id}-${other.id}`,label:`Zap ${other.name}`,detail:'Suspend their alien power for this challenge.',kind:'zap',cardId:c.id,player:other.id});
      if(c.kind==='edict'&&c.name==='Force Field')for(const other of g.players)if(e.sides[other.id]&&other.id!==p&&other.id!==e.defense)actions.push({id:`field-${c.id}-${other.id}`,label:`Exclude ${other.name}`,detail:'Return this ally’s tokens to base.',kind:'field',cardId:c.id,player:other.id});
      if(c.kind==='kicker'&&(who===p||who===e.defense)&&!e.kickers[who])actions.push({id:`kicker-${c.id}`,label:`Commit Kicker ×${c.value}`,kind:'kicker',cardId:c.id});
    }
    return make(who,'Tactics before the reveal','Main players may buy cards or commit a Kicker. Edicts can change the encounter.',actions);
  }
  if(g.phase==='planning') {
    const who=e.selected[p] ? e.defense : p;
    return make(who,'Choose your challenge card','Attack for the base, or play Compromise to seek a deal. Both cards remain secret until the reveal.',challengeCards(g,who).map(c=>({id:`card-${c.id}`,label:cardLabel(c),kind:'card',cardId:c.id})));
  }
  if(g.phase==='reveal')return make(0,'The cards are down','Reveal both cards and resolve the challenge.',[{id:'reveal',label:'Reveal challenge cards',kind:'reveal'}]);
  if(g.phase==='deal') {
    const who=e.dealOffered?e.defense:p;
    const canTrade=dealPlanets(g).length===2;
    return make(who,e.dealOffered?'A base for a base?':'Both sides chose Compromise',e.dealOffered?'Your opponent proposes one new planet base for each of you.':'Offer a mutual base exchange. No allies participate in a deal.',[{id:'no-deal',label:e.dealOffered?'Reject the deal':'Make no deal',kind:'no-deal'},...(canTrade?[{id:'deal',label:e.dealOffered?'Accept · exchange bases':'Offer · exchange bases',kind:'deal'}]:[])]);
  }
  const continuation=e.success&&g.challenge===1&&challengeCards(g,p).length>0;
  return make(0,'Challenge complete',e.summary,[{id:'continue',label:continuation&&p===0?'Take a second challenge':'Continue',kind:'continue'},...(continuation&&p===0?[{id:'pass',label:'End your turn',kind:'pass'}]:[])]);
}
function consume(g:Game,p:number,id:string,retain=false) { const i=g.players[p].hand.findIndex(c=>c.id===id); const c=g.players[p].hand[i];if(!c)throw Error('Card unavailable');if(!retain){g.players[p].hand.splice(i,1);g.discard.push(c);}return c; }
function consumeEdict(g:Game,p:number,id:string) { const retain=hasFlare(g,p,'Clone')&&!hasPower(g,p,'Clone');const c=consume(g,p,id,retain);if(retain) {g.encounter.flare.push(p);record(g,`${g.players[p].name} uses the Clone Wild Flare to retain ${c.name}.`);}return c; }
function drawDestiny(g:Game) {
  if(g.destiny.length<=1)g.destiny=shuffle(g,[...g.destiny.splice(0),...g.destinyDiscard.splice(0)]);
  const system=g.destiny.pop()!; g.destinyDiscard.push(system);g.encounter.system=system;
  record(g,`Destiny points to ${g.players[system].name=== 'You'?'your':g.players[system].name+"’s"} system.`);
  g.phase=system===g.active?'destiny':'launch';
}
function startTactics(g:Game) { const e=g.encounter;e.order=[(g.active+1)%4,(g.active+2)%4,(g.active+3)%4].filter(p=>p!==e.defense).concat(g.active,e.defense);e.cursor=0;g.phase='tactics'; }
function startPlanning(g:Game) { if(!challengeCards(g,g.encounter.defense).length)newHand(g,g.encounter.defense);if(!challengeCards(g,g.active).length){g.encounter.summary='The offense has no challenge cards. The turn ends.';for(let p=0;p<4;p++){returnShips(g,p,g.encounter.ships[p]);g.encounter.ships[p]=0;}g.phase='resolution';}else g.phase='planning'; }
function enterMoon(g:Game,target:Planet,p:number) {
  if(!target.moon)return;target.revealed=true;const key=target.moon;record(g,`${g.players[p].name} reveals ${MOONS[key].name}.`);
  if(key==='quantum'){target.ships[p]+=g.players[p].warp;g.players[p].warp=0;}
  if(key==='mobius')recover(g,p,g.players[p].warp);
  if(key==='worm'){const n=target.ships[p];target.ships[p]=0;loseShips(g,p,n);}
  if(key==='salvage')for(let n=0;n<target.ships[p];n++){const c=g.discard.pop();if(c)g.players[p].hand.push(c);}
}
function tokenValue(g:Game,p:number,n:number) { return n*(hasPower(g,p,'Macron')?4:moonEffect(g,p,'mini')?2:1); }
export function combatTotal(g:Game,p:number,card:Card) {
  const e=g.encounter,offense=p===g.active,target=g.planets.find(x=>x.id===e.target)!;
  const own=offense?e.ships[p]:target.ships[p];
  const allies=g.players.filter(x=>x.id!==p&&e.sides[x.id]===(offense?'offense':'defense'));
  const allyStrength=allies.reduce((n,x)=>n+tokenValue(g,x.id,e.ships[x.id]),0);
  let attack=card.value*(e.kickers[p]?.value??1);
  if(moonEffect(g,p,'mass'))attack+=10;
  const opponent=offense?e.defense:g.active;
  if(moonEffect(g,opponent,'ten'))attack+=10;
  let total=hasPower(g,p,'Virus') ? attack*(own+allies.reduce((n,x)=>n+e.ships[x.id],0)) : attack+tokenValue(g,p,own)+allyStrength;
  if(moonEffect(g,p,'plus'))total+=10;if(moonEffect(g,p,'minus'))total-=10;
  if(!offense)total+=g.planets.filter(x=>x.moon==='defense'&&x.revealed).reduce((n,x)=>n+tokenValue(g,p,x.ships[p]),0);
  if(hasPower(g,p,'Warpish'))total+=g.players[p].warp;
  return total+g.players[p].lucre;
}
function checkWin(g:Game) {g.winners=g.players.filter(p=>foreignBases(g,p.id)>=5).map(p=>p.id);if(g.winners.length){g.phase='gameover';record(g,`${g.winners.map(p=>g.players[p].name).join(' and ')} win${g.winners.length===1?'s':''} the galaxy!`);}}
function cleanup(g:Game) {
  const e=g.encounter;
  for(const p of [g.active,e.defense]) {
    const c=e.selected[p];if(c){if(hasPower(g,p,'Clone')){g.players[p].hand.push(c);record(g,`${g.players[p].name} keeps ${cardLabel(c)} through Replication.`);}else g.discard.push(c);e.selected[p]=null;}
    if(e.kickers[p]){g.discard.push(e.kickers[p]!);e.kickers[p]=null;}
  }
}
function resolveCombat(g:Game) {
  const e=g.encounter,o=g.active,d=e.defense,target=g.planets.find(x=>x.id===e.target)!;
  const oc=e.selected[o]!,dc=e.selected[d]!;
  record(g,`${g.players[o].name} reveals ${cardLabel(oc)}. ${g.players[d].name} reveals ${cardLabel(dc)}.`);
  if(oc.kind==='compromise'&&dc.kind==='compromise') {
    for(let p=0;p<4;p++)if(p!==o&&p!==d){returnShips(g,p,e.ships[p]);e.ships[p]=0;}
    g.phase='deal';return;
  }
  e.totals[o]=oc.kind==='attack'?combatTotal(g,o,oc):0;e.totals[d]=dc.kind==='attack'?combatTotal(g,d,dc):0;
  for(const p of [o,d])if(powerActive(g,p)){
    const alien=g.players[p].alien;
    if(alien==='Macron')record(g,`${g.players[p].name} invokes Mass: every token counts as four.`);
    if(alien==='Virus')record(g,`${g.players[p].name} invokes Multiplication: card strength multiplies by allied tokens.`);
    if(alien==='Warpish')record(g,`${g.players[p].name} invokes Necromancy: ${g.players[p].warp} Warp token${g.players[p].warp===1?'':'s'} join the total.`);
    if(alien==='Anti-Matter')record(g,`${g.players[p].name} invokes Negation: the lower total will win.`);
  }
  const pacifistO=oc.kind==='compromise'&&dc.kind==='attack'&&hasPower(g,o,'Pacifist');
  const pacifistD=dc.kind==='compromise'&&oc.kind==='attack'&&hasPower(g,d,'Pacifist');
  const reverse=hasPower(g,o,'Anti-Matter')||hasPower(g,d,'Anti-Matter');
  const offenseWins=pacifistO?true:pacifistD?false:oc.kind==='attack'&&(dc.kind==='compromise'||(reverse?e.totals[o]<e.totals[d]:e.totals[o]>e.totals[d]));
  // Snapshot power status before losing home bases, since losses are simultaneous.
  const immortal=g.players.map(p=>hasPower(g,p.id,'Zombie'));
  const loser=offenseWins?d:o,winner=offenseWins?o:d;
  const lost=loser===o?e.ships[o]:target.ships[d];
  const cloneSuper=hasPower(g,loser,'Clone')&&hasFlare(g,loser,'Clone');
  const loserMacron=hasPower(g,loser,'Macron');
  if(offenseWins) { const n=target.ships[d];target.ships[d]=0;loseShips(g,d,n,immortal[d]); }
  for(let p=0;p<4;p++) {
    if(!e.ships[p])continue;
    const won=e.sides[p]===(offenseWins?'offense':'defense'); const n=e.ships[p];e.ships[p]=0;
    if(!won)loseShips(g,p,n,immortal[p]);
    else if(offenseWins)target.ships[p]+=n;
    else {returnShips(g,p,n);const reward=hasPower(g,p,'Macron')?n*2:n;const recovered=recover(g,p,reward);draw(g,p,reward-recovered);record(g,`${g.players[p].name} earns ${reward} defensive reward${reward===1?'':'s'}.`);}
  }
  if(offenseWins&&target.moon)enterMoon(g,target,o);
  if((loser===o?oc:dc).kind==='compromise') {
    const count=Math.min(g.players[winner].hand.length,lost*(loserMacron?2:1)*(cloneSuper?2:1)*(e.kickers[loser]?.value??1));
    for(let i=0;i<count;i++){const index=Math.floor(random(g)*g.players[winner].hand.length);g.players[loser].hand.push(g.players[winner].hand.splice(index,1)[0]);}
    record(g,`${g.players[loser].name} takes ${count} consolation card${count===1?'':'s'}.`);
  }
  e.success=offenseWins;e.summary=`${g.players[winner].name} ${offenseWins?'takes the destination':'holds the destination'}. ${pacifistO||pacifistD?'The Pacifist invokes Peace and turns surrender into victory.':oc.kind==='attack'&&dc.kind==='attack'?`${e.totals[o]} against ${e.totals[d]}${reverse?' — Anti-Matter makes the lower total win':e.totals[o]===e.totals[d]?' — defense wins ties':''}.`: 'Attack defeats Compromise.'}`;
  record(g,e.summary);cleanup(g);for(const p of [o,d])if(hasPower(g,p,'Mutant')){const n=Math.max(0,8-g.players[p].hand.length);draw(g,p,n);if(n)record(g,`${g.players[p].name} invokes Regeneration and draws ${n} card${n===1?'':'s'}.`);}g.phase='resolution';checkWin(g);
}
function dealPlanets(g:Game) {
  const o=g.active,d=g.encounter.defense;
  const forOffense=g.planets.find(x=>!x.moon&&x.home!==o&&x.ships[d]>0&&x.ships[o]===0);
  const forDefense=g.planets.find(x=>!x.moon&&x.home!==d&&x.ships[o]>0&&x.ships[d]===0);
  return forOffense&&forDefense&&(availableShips(g,o)+g.encounter.ships[o]>0)&&availableShips(g,d)>0 ? [forOffense,forDefense] : [];
}
function resolveDeal(g:Game,success:boolean) {
  const e=g.encounter,o=g.active,d=e.defense;
  const places=dealPlanets(g);
  if(success&&places.length===2) {
    const on=e.ships[o] ? (e.ships[o]--,1) : takeShips(g,o,1);
    const dn=takeShips(g,d,1);places[0].ships[o]+=on;places[1].ships[d]+=dn;
    e.summary=`Deal accepted. ${g.players[o].name} and ${g.players[d].name} each establish a foreign base.`;
  } else {
    success=false;
    returnShips(g,o,e.ships[o]);e.ships[o]=0;
    for(const p of [o,d]) {const immortal=hasPower(g,p,'Zombie');const multiplier=e.kickers[p===o?d:o]?.value??1;const n=takeShips(g,p,3*multiplier);loseShips(g,p,n,immortal);}
    e.summary='No deal. Each main player loses three tokens, modified by the opposing Kicker.';
  }
  returnShips(g,o,e.ships[o]);e.ships[o]=0;e.success=success;record(g,e.summary);cleanup(g);g.phase='resolution';checkWin(g);
}
export function applyAction(state:Game,id:string):Game {
  const choice=decision(state);const a=choice.actions.find(x=>x.id===id);if(!a)throw Error('That action is not legal in the current phase.');
  const g=structuredClone(state),p=choice.player,e=g.encounter;g.actionCount++;
  switch(a.kind) {
    case 'buy-token':g.players[p].lucre--;recover(g,p,1);record(g,`${g.players[p].name} spends 1 Lucre to recover a token.`);break;
    case 'tubes':consumeEdict(g,p,a.cardId!);for(let i=0;i<4;i++)recover(g,i,g.players[i].warp);record(g,`${g.players[p].name} opens the Mobius Tubes.`);break;
    case 'destiny':case 'redraw':drawDestiny(g);break;
    case 'home':g.phase='launch';break;
    case 'no-launch':e.summary='No tokens are available to launch.';g.phase='resolution';break;
    case 'launch': {
      const target=g.planets.find(x=>x.id===a.target)!; e.target=target.id;e.defense=a.player!;e.ships[p]+=takeShips(g,p,a.count!-e.ships[p]);e.sides[p]='offense';
      if(hasFlare(g,p,'Macron')&&a.count!>(hasPower(g,p,'Macron')?1:4))record(g,`${g.players[p].name} uses the Macron Flare to launch ${a.count} tokens.`);
      record(g,`${g.players[p].name} launches ${e.ships[p]} token${e.ships[p]===1?'':'s'} toward ${targetName(g,target)}.`);
      if(target.moon&&e.defense<0) {target.ships[p]+=e.ships[p];e.ships[p]=0;enterMoon(g,target,p);e.success=true;e.summary=`${g.players[p].name} occupies ${MOONS[target.moon].name}. Moons do not count toward victory.`;g.phase='resolution';record(g,e.summary);}
      else {e.sides[e.defense]='defense';if(target.moon)startTactics(g);else g.phase='inviteO';}break;
    }
    case 'invite':if(g.phase==='inviteO'){e.invitedO=a.ids!;g.phase='inviteD';}else {e.invitedD=a.ids!;g.phase='alliance';e.order=[(g.active+1)%4,(g.active+2)%4,(g.active+3)%4].filter(x=>x!==e.defense);e.cursor=0;}break;
    case 'ally':e.sides[p]=a.side!;e.ships[p]=takeShips(g,p,a.count!);record(g,`${g.players[p].name} joins the ${a.side} with ${e.ships[p]} tokens.`);e.cursor++;if(e.cursor>=e.order.length)startTactics(g);break;
    case 'decline':record(g,`${g.players[p].name} stays out.`);e.cursor++;if(e.cursor>=e.order.length)startTactics(g);break;
    case 'buy-card':g.players[p].lucre--;e.bought[p]++;draw(g,p,1);record(g,`${g.players[p].name} buys one card.`);break;
    case 'zap':consumeEdict(g,p,a.cardId!);e.zapped.push(a.player!);record(g,`${g.players[p].name} zaps ${g.players[a.player!].name}.`);break;
    case 'field':consumeEdict(g,p,a.cardId!);returnShips(g,a.player!,e.ships[a.player!]);e.ships[a.player!]=0;e.sides[a.player!]=null;record(g,`${g.players[p].name} excludes ${g.players[a.player!].name} with a Force Field.`);break;
    case 'kicker':{const index=g.players[p].hand.findIndex(c=>c.id===a.cardId);e.kickers[p]=g.players[p].hand.splice(index,1)[0];record(g,`${g.players[p].name} commits a face-down Kicker.`);break;}
    case 'ready':e.cursor++;if(e.cursor>=e.order.length)startPlanning(g);break;
    case 'card':{const index=g.players[p].hand.findIndex(c=>c.id===a.cardId);e.selected[p]=g.players[p].hand.splice(index,1)[0];if(e.selected[g.active]&&e.selected[e.defense])g.phase='reveal';break;}
    case 'reveal':resolveCombat(g);break;
    case 'deal':if(e.dealOffered)resolveDeal(g,true);else {e.dealOffered=true;record(g,`${g.players[p].name} offers a mutual base exchange.`);}break;
    case 'no-deal':resolveDeal(g,false);break;
    case 'continue':case 'pass': {
      const again=a.kind!=='pass'&&e.success&&g.challenge===1&&challengeCards(g,g.active).length>0;
      if(again){g.challenge++;begin(g,false);}else {g.active=(g.active+1)%4;g.turn++;g.challenge=1;begin(g,true);}break;
    }
  }
  return g;
}

// A restricted observation is the only input supplied to the computer policy.
// The deck order, other hands, committed cards, and unknown moons are absent.
export function observation(g:Game,p:number) {
  const e=g.encounter;
  return {
    phase:g.phase,active:g.active,defense:e.defense,player:p,difficulty:g.settings.difficulty,
    ownHand:g.players[p].hand,players:g.players.map(x=>({id:x.id,alien:x.alien,handSize:x.hand.length,warp:x.warp,lucre:x.lucre,bases:foreignBases(g,x.id),power:powerActive(g,x.id)})),
    planets:g.planets.map(x=>({...x,moon:x.moon?(x.revealed||x.home===p?x.moon:'unknown'):undefined})),
    ships:[...e.ships],sides:[...e.sides],target:e.target,challenge:g.challenge,
  };
}
export function chooseBotAction(g:Game):string {
  const d=decision(g),v=observation(g,d.player),me=v.players[v.player];
  let best=d.actions[0],bestScore=-Infinity;
  for(const a of d.actions) {
    let score=0;
    if(a.kind==='destiny'||a.kind==='redraw'||a.kind==='continue'||a.kind==='reveal')score=10;
    if(a.kind==='buy-token')score=me.warp>7&&me.lucre>2?15:-5;
    if(a.kind==='tubes')score=me.warp>5?20:-10;
    if(a.kind==='launch') {
      const target=v.planets.find(x=>x.id===a.target)!;
      score=target.moon? (target.moon==='unknown'?7:['minus','null','worm','ten'].includes(target.moon)?-20:15) : target.ships[v.player]? -10:25;
      if(!target.moon&&a.player!==undefined)score-=target.ships[a.player]*1.5;
      score+=a.count!*.75;
      if(a.player!==undefined&&a.player>=0)score+=v.players[a.player].bases*2;
    }
    if(a.kind==='invite')score=(a.ids??[]).reduce((n,id)=>n+(v.players[id].bases>=4&&me.bases<4?-20:4),0);
    if(a.kind==='ally') {
      const leader=v.players[a.side==='offense'?v.active:v.defense];
      score=(a.side==='offense'?12:5)+a.count!*.3;
      if(leader.bases>=4&&me.bases<4&&a.side==='offense')score=-20;
      if(a.side==='defense'&&v.players[v.active].bases>=4)score+=15;
      if(me.alien==='Zombie'&&me.power)score+=3;
    }
    if(a.kind==='ready')score=2;
    if(a.kind==='buy-card')score=v.ownHand.filter(c=>c.kind==='attack'||c.kind==='compromise').length<2&&me.lucre>1?12:-5;
    if(a.kind==='zap')score=a.player===(v.player===v.active?v.defense:v.active)&&v.sides[v.player]&&v.players[a.player!].alien==='Virus'?18:-8;
    if(a.kind==='field')score=v.sides[v.player]&&v.sides[a.player!]!==v.sides[v.player]?8:-8;
    if(a.kind==='kicker'){const c=v.ownHand.find(c=>c.id===a.cardId)!;score=c.value>1&&v.ownHand.some(c=>c.kind==='attack'&&c.value>=12)?10:-8;}
    if(a.kind==='card') {
      const c=v.ownHand.find(c=>c.id===a.cardId)!;
      const other=v.players[v.player===v.active?v.defense:v.active];
      const target=v.planets.find(x=>x.id===v.target)!;
      const own=v.player===v.active?v.ships[v.player]:target.ships[v.player];
      const estimatedEnemy=12+(other.alien==='Macron'&&other.power?8:4)+other.lucre;
      const total=me.alien==='Virus'&&me.power?c.value*own+me.lucre:c.value+own+me.lucre;
      score=c.kind==='compromise'?(v.ownHand.filter(c=>c.kind==='attack').every(c=>c.value<10)?6:-5):(total>estimatedEnemy?24-c.value*.3:c.value*.4);
      if(other.bases>=4||me.bases>=4)score=c.kind==='attack'?c.value*2:-20;
      if(me.alien==='Clone'&&me.power&&c.kind==='attack')score=c.value;
    }
    if(a.kind==='deal'){const other=v.players[v.player===v.active?v.defense:v.active];score=other.bases>=4&&me.bases<4?-10:15;}
    if(a.kind==='no-deal')score=0;
    // Deterministic variation uses public turn progress, never hidden state or RNG.
    if(v.difficulty==='relaxed')score=score*.5+Math.sin(g.actionCount*13+d.actions.indexOf(a)*7)*8;
    if(score>bestScore){bestScore=score;best=a;}
  }
  if(!best)throw Error('No legal action');return best.id;
}

export function assertInvariants(g:Game) {
  if(g.players.length!==4||g.planets.length!==(g.settings.moons?28:20))throw Error('Invalid galaxy');
  for(let p=0;p<4;p++) {
    const counts=[g.players[p].warp,g.encounter.ships[p],...g.planets.map(x=>x.ships[p])];
    if(counts.some(n=>!Number.isInteger(n)||n<0)||counts.reduce((a,b)=>a+b,0)!==20)throw Error(`Token conservation failed for player ${p}`);
    if(!Number.isInteger(g.players[p].lucre)||g.players[p].lucre<0)throw Error('Invalid Lucre');
  }
  const cards=[...g.deck,...g.discard,...g.players.flatMap(p=>p.hand),...g.encounter.selected.filter((c):c is Card=>!!c),...g.encounter.kickers.filter((c):c is Card=>!!c)];
  if(cards.length!==g.cardCount||new Set(cards.map(c=>c.id)).size!==cards.length)throw Error('Card conservation failed');
  if(g.phase!=='gameover'&&!decision(g).actions.length)throw Error(`Deadlock in ${g.phase}`);
}
export function serialize(g:Game) {return JSON.stringify(g);}
export function deserialize(raw:string):Game {const g=JSON.parse(raw) as Game;if(g.version!==1)throw Error('Unsupported save version');assertInvariants(g);return g;}

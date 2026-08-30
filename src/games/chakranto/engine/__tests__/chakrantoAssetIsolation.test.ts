/**
 * CHAKRANTO Artwork Integration & Asset Isolation Unit Tests
 */

import { CHAKRANTO_CARD_ASSETS, CHAKRANTO_GAME_ASSETS, CHAKRANTO_CHARACTERS } from '../../assets/chakrantoAssets';
import { INITIAL_GAMES } from '../../../../data/games';
import { CARD_ASSETS as CHOR_POLICE_CARD_ASSETS } from '../../../chorPoliceDakatBabu/assets/gameAssets';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Asset Test Assertion Failed: ${msg}`);
  }
}

console.log('--- Running Chakranto Artwork Integration & Isolation Tests ---');

// 1. Verify Chakranto Card Assets Point Strictly to /assets/games/chakranto/
assert(
  CHAKRANTO_CARD_ASSETS.brahmodoetto === '/assets/games/chakranto/brahmodoetto.png',
  `Brahmodoetto must map to /assets/games/chakranto/brahmodoetto.png, got ${CHAKRANTO_CARD_ASSETS.brahmodoetto}`
);
assert(
  CHAKRANTO_CARD_ASSETS.kalu_dakat === '/assets/games/chakranto/kalu_dakat.png',
  `Kalu Dakat must map to /assets/games/chakranto/kalu_dakat.png, got ${CHAKRANTO_CARD_ASSETS.kalu_dakat}`
);
assert(
  CHAKRANTO_CARD_ASSETS.petukchondro === '/assets/games/chakranto/petukchondro.png',
  `Petukchondro must map to /assets/games/chakranto/petukchondro.png, got ${CHAKRANTO_CARD_ASSETS.petukchondro}`
);
assert(
  CHAKRANTO_CARD_ASSETS.bir_bikrom === '/assets/games/chakranto/bir_bikrom.png',
  `Bir Bikrom must map to /assets/games/chakranto/bir_bikrom.png, got ${CHAKRANTO_CARD_ASSETS.bir_bikrom}`
);
assert(
  CHAKRANTO_CARD_ASSETS.ginner_badsha === '/assets/games/chakranto/ginner_badsha.png',
  `Ginner Badsha must map to /assets/games/chakranto/ginner_badsha.png, got ${CHAKRANTO_CARD_ASSETS.ginner_badsha}`
);
assert(
  CHAKRANTO_CARD_ASSETS.cardBack === '/assets/games/chakranto/card_back.png',
  `Card Back must map to /assets/games/chakranto/card_back.png, got ${CHAKRANTO_CARD_ASSETS.cardBack}`
);
console.log('✓ Test 1: All 5 Chakranto characters & card back mapped to explicit /assets/games/chakranto/ paths');

// 2. Verify Chakranto Banner and Thumbnail Assets (Both map strictly to Banner.png)
assert(
  CHAKRANTO_GAME_ASSETS.banner === '/assets/games/chakranto/Banner.png',
  `Chakranto banner must map to /assets/games/chakranto/Banner.png, got ${CHAKRANTO_GAME_ASSETS.banner}`
);
assert(
  CHAKRANTO_GAME_ASSETS.thumbnail === '/assets/games/chakranto/Banner.png',
  `Chakranto thumbnail must map to /assets/games/chakranto/Banner.png, got ${CHAKRANTO_GAME_ASSETS.thumbnail}`
);
assert(
  CHAKRANTO_GAME_ASSETS.coverArt === '/assets/games/chakranto/Banner.png',
  `Chakranto coverArt must map to /assets/games/chakranto/Banner.png, got ${CHAKRANTO_GAME_ASSETS.coverArt}`
);
console.log('✓ Test 2: Chakranto game banner & thumbnail mapped to /assets/games/chakranto/Banner.png');

// 3. Verify Zero Cross-Game Asset Leaks from Chor Police to Chakranto
const chakrantoPaths = [
  ...Object.values(CHAKRANTO_CARD_ASSETS),
  ...Object.values(CHAKRANTO_GAME_ASSETS),
];
chakrantoPaths.forEach((path) => {
  assert(
    !path.includes('chor-police-dakat-babu') &&
      !path.includes('Babu.png') &&
      !path.includes('Police.png') &&
      !path.includes('Dakath') &&
      !path.includes('chore.png'),
    `Chakranto asset path ${path} must not contain Chor Police filenames`
  );
});
console.log('✓ Test 3: Zero Chor Police asset dependencies or paths inside Chakranto asset registry');

// 4. Verify Game Catalog (INITIAL_GAMES) Isolation
const chakrantoGame = INITIAL_GAMES.find((g) => g.id === 'chakranto');
assert(!!chakrantoGame, 'Chakranto must exist in INITIAL_GAMES');
assert(
  chakrantoGame!.banner === '/assets/games/chakranto/Banner.png',
  `Chakranto banner in catalog must be /assets/games/chakranto/Banner.png, got ${chakrantoGame!.banner}`
);
assert(
  chakrantoGame!.thumbnail === '/assets/games/chakranto/Banner.png',
  `Chakranto thumbnail in catalog must be /assets/games/chakranto/Banner.png, got ${chakrantoGame!.thumbnail}`
);

const chorPoliceGame = INITIAL_GAMES.find((g) => g.id === 'chor-police-dakat-babu');
assert(!!chorPoliceGame, 'Chor Police must exist in INITIAL_GAMES');
assert(
  chorPoliceGame!.banner === '/assets/games/chor-police-dakat-babu/Banner.png',
  'Chor Police banner in catalog must remain /assets/games/chor-police-dakat-babu/Banner.png'
);
assert(
  !chorPoliceGame!.banner.includes('chakranto'),
  'Chor Police must not reference Chakranto assets'
);
console.log('✓ Test 4: Catalog entries for Chakranto and Chor Police are mutually isolated');

// 5. Verify Chor Police Roles remain distinct
assert(CHOR_POLICE_CARD_ASSETS.babu === '/assets/games/chor-police-dakat-babu/Babu.png', 'Chor police babu asset intact');
assert(CHOR_POLICE_CARD_ASSETS.police === '/assets/games/chor-police-dakat-babu/Police.png', 'Chor police police asset intact');
assert(CHOR_POLICE_CARD_ASSETS.dakat === '/assets/games/chor-police-dakat-babu/Dakath f.png', 'Chor police dakat asset intact');
assert(CHOR_POLICE_CARD_ASSETS.chor === '/assets/games/chor-police-dakat-babu/chore.png', 'Chor police chor asset intact');
console.log('✓ Test 5: Chor Police role assets remain 100% intact and unaffected');

console.log('--- ALL CHAKRANTO ARTWORK ISOLATION TESTS PASSED ---');


export const API_BASE_URL = "https://pokeapi.co/api/v2";
export const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Curated roster for the assignment: #001-#019 plus Pikachu (#025).
export const DEX_IDS = [...Array.from({ length: 19 }, (_, i) => i + 1), 25];
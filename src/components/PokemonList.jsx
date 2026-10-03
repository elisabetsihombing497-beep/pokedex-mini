import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, DEX_IDS } from "../config.js";
import { capitalize } from "../utils.js";
import { playTick, playPop } from "../sound.js";

const TYPE_FILTERS = ["all", "grass", "fire", "water", "bug", "normal", "poison", "flying", "electric"];

const CARD_STATS = [
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["speed", "Speed"],
];

function statOf(pokemon, name) {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

function TiltCard({ index, primaryType, children }) {
  const ref = useRef(null);

  const onPointerMove = useCallback((event) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--shift-x", `${(px * 12).toFixed(1)}px`);
    el.style.setProperty("--shift-y", `${(py * 8).toFixed(1)}px`);
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--shift-x", "0px");
    el.style.setProperty("--shift-y", "0px");
  }, []);

  return (
    <li
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`pokemon-card ${primaryType ? `type-${primaryType}` : ""}`}
      style={{ "--card-delay": `${(index % 12) * 45}ms`, "--breathe-delay": `${(index % 7) * 0.45}s` }}
    >
      {children}
    </li>
  );
}

function PokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("number");

  useEffect(() => {
    let isMounted = true;

    async function fetchPokemons() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/pokemon?limit=25&offset=0`);
        if (!res.ok) throw new Error("Failed to fetch Pokémon list.");
        const data = await res.json();

        const roster = data.results.filter((p) => {
          const id = Number(p.url.match(/\/(\d+)\/$/)[1]);
          return DEX_IDS.includes(id);
        });

        const detailedList = await Promise.all(
          roster.map(async (p) => {
            const detailRes = await fetch(p.url);
            if (!detailRes.ok) throw new Error("Some Pokémon data failed to load.");
            return await detailRes.json();
          })
        );

        if (isMounted) setPokemonList(detailedList);
      } catch {
        if (isMounted) setError("Pokémon data is not reachable. Check your connection and try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPokemons();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const visiblePokemon = useMemo(() => {
    const filtered = pokemonList.filter(
      (pokemon) => selectedType === "all" || pokemon.types.some(({ type }) => type.name === selectedType)
    );
    return [...filtered].sort((a, b) => (sortBy === "name" ? a.name.localeCompare(b.name) : a.id - b.id));
  }, [pokemonList, selectedType, sortBy]);

  if (isLoading) {
    return (
      <div className="pokemon-grid" aria-label="Loading Pokémon">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="pokemon-skeleton" key={index}>
            <span />
            <i />
            <b />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="catalog-section" aria-label="Pokémon catalog">
      <div className="catalog-toolbar">
        <div className="catalog-heading">
          <h2>Pokédex list</h2>
        </div>
        <label className="sort-control">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => { playTick(); setSortBy(event.target.value); }} aria-label="Sort Pokémon">
            <option value="number">Pokédex number</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      <div className="type-filter" role="group" aria-label="Filter by type">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            type="button"
            className={`filter-chip ${selectedType === type ? "is-active" : ""} ${type !== "all" ? `chip-color-${type}` : ""}`}
            onClick={() => { playTick(); setSelectedType(type); }}
          >
            {type === "all" ? "All types" : capitalize(type)}
          </button>
        ))}
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => { playPop(); setRetryCount((count) => count + 1); }}>Try again</button>
        </div>
      )}

      {visiblePokemon.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">◌</span>
          <h3>No Pokémon of this type yet</h3>
          <p>Pick another type to continue your exploration.</p>
          <button type="button" onClick={() => { playPop(); setSelectedType("all"); }}>Show all</button>
        </div>
      ) : (
        <ul className="pokemon-list-card">
          {visiblePokemon.map((pokemon, index) => {
            const primaryType = pokemon.types[0].type.name;
            const sprite = pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default;

            return (
              <TiltCard key={pokemon.id} index={index} primaryType={primaryType}>
                <Link to={`/pokemon/${pokemon.name}`} className="pokemon-card-link" onClick={playPop}>
                  <span className="card-hp-badge">HP {statOf(pokemon, "hp")}</span>
                  <span className="card-sprite">
                    <span className="sprite-breathe">
                      <img src={sprite} alt={capitalize(pokemon.name)} className="pokemon-avatar-img" loading={index < 8 ? "eager" : "lazy"} />
                    </span>
                  </span>
                  <div className="card-tags">
                    {pokemon.types.map(({ type }) => (
                      <span key={type.name} className="card-type-tag">
                        {capitalize(type.name)}
                      </span>
                    ))}
                  </div>
                  <strong className="pokemon-name-title">{capitalize(pokemon.name)}</strong>
                  <ul className="card-stats">
                    {CARD_STATS.map(([key, label]) => {
                      const value = statOf(pokemon, key);
                      return (
                        <li key={key}>
                          <span className="card-stat-label">{label}</span>
                          <span className="card-stat-track">
                            <b style={{ width: `${Math.min((value / 150) * 100, 100)}%` }} />
                          </span>
                          <em className="card-stat-value">{value}</em>
                        </li>
                      );
                    })}
                  </ul>
                </Link>
              </TiltCard>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default PokemonList;

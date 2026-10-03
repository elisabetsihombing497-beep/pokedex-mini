import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL, SPRITE_BASE_URL, DEX_IDS } from "../config.js";
import { capitalize, formatId, getDexEntries } from "../utils.js";
import { playTick, playPop, playBack, playSpark } from "../sound.js";

const SPARK_COLORS = ["#ffd23f", "#ee1515", "#ffffff", "#4bc0c0", "#ff8f3f", "#c084fc", "#4ade80", "#f472b6"];

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return undefined;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 850;
    setDisplay(0);
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

function DetailPage() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [flavorText, setFlavorText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [hitCount, setHitCount] = useState(0);
  const [dexEntries, setDexEntries] = useState([]);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setActiveTab("stats");
      try {
        const res = await fetch(`${API_BASE_URL}/pokemon/${encodeURIComponent(name.toLowerCase())}`);
        if (!res.ok) throw new Error("Pokémon not found");
        const data = await res.json();
        if (!DEX_IDS.includes(data.id)) throw new Error("OUT_OF_SCOPE");
        const speciesResponse = await fetch(data.species.url);
        const species = speciesResponse.ok ? await speciesResponse.json() : null;
        const description =
          species?.flavor_text_entries?.find((entry) => entry.language.name === "en")?.flavor_text || "";
        if (isCurrent) {
          setPokemon(data);
          setFlavorText(description.replace(/[\f\n]/g, " "));
        }
      } catch (err) {
        if (isCurrent) setError(err.message === "OUT_OF_SCOPE" ? "PokéDex Mini only covers a curated roster of 20 Pokémon." : "Pokémon not found. Check the name or Pokédex number.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]);

  useEffect(() => {
    let isCurrent = true;
    getDexEntries().then((entries) => {
      if (isCurrent) setDexEntries(entries);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="scan-stage" aria-label="Scanning Pokémon">
        <div className="scan-ball" aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}pokeball.svg`} alt="" />
          <span className="scan-line" />
        </div>
        <p className="scan-text">SCANNING<span className="scan-dots" /></p>
      </div>
    );
  }

  if (error) {
    const suggestions = [...dexEntries]
      .filter((entry) => entry.name !== name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return (
      <div className="empty-state detail-error" role="alert">
        <span aria-hidden="true">?</span>
        <h2>Not registered in this Pokédex</h2>
        <p>{error}</p>
        {suggestions.length > 0 && (
          <div className="suggest-block">
            <p className="suggest-label">Try one of these instead:</p>
            <div className="suggest-list">
              {suggestions.map((entry) => (
                <Link key={entry.id} to={`/pokemon/${entry.name}`} className="suggest-chip" onClick={playPop}>
                  <img src={`${SPRITE_BASE_URL}/${entry.id}.png`} alt="" loading="lazy" />
                  <span>{capitalize(entry.name)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <Link to="/" className="primary-link" onClick={playBack}>Back to Pokédex</Link>
      </div>
    );
  }

  if (!pokemon) return null;

  const primaryType = pokemon.types[0].type.name;
  const sprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

  const statLabels = {
    hp: "HP",
    attack: "ATTACK",
    defense: "DEFENSE",
    "special-attack": "SP. ATK",
    "special-defense": "SP. DEF",
    speed: "SPEED",
  };

  function pokeSprite() {
    playSpark();
    setHitCount((n) => n + 1);
    window.setTimeout(() => setHitCount(0), 700);
  }

  return (
    <div className="detail-page">
      <Link to="/" className="detail-back-link" onClick={playBack}>← Back to list</Link>
      <section className={`detail-hero type-${primaryType} pack-in`}>
        <div className="detail-title-row">
          <span className="detail-number">{formatId(pokemon.id)}</span>
          <h2 className="detail-pokemon-name">{capitalize(pokemon.name)}</h2>
        </div>

        <div
          className="detail-art-wrap"
          role="button"
          tabIndex={0}
          aria-label={`Poke ${capitalize(pokemon.name)}`}
          onClick={pokeSprite}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              pokeSprite();
            }
          }}
        >
          <span className="detail-shine" aria-hidden="true" />
          <span className={`sprite-inner ${hitCount > 0 ? "is-hit" : ""}`} key={`${pokemon.id}-${activeTab}-${hitCount}`}>
            <img src={sprite} alt={capitalize(pokemon.name)} className="detail-pokemon-img" />
          </span>
          {hitCount > 0 && (
            <span className="fx-sparks" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => {
                const angle = i * 45;
                return (
                  <span
                    key={i}
                    className="spark"
                    style={{
                      "--sx": `${Math.round(Math.cos((angle * Math.PI) / 180) * 90)}px`,
                      "--sy": `${Math.round(Math.sin((angle * Math.PI) / 180) * 90)}px`,
                      "--spark": SPARK_COLORS[i],
                    }}
                  />
                );
              })}
            </span>
          )}
        </div>

        <div className="detail-types-container">
          {pokemon.types.map((t) => (
            <span key={t.type.name} className="card-type-tag big">
              {capitalize(t.type.name)}
            </span>
          ))}
        </div>

        <div className="detail-tabs" role="tablist" aria-label="Pokémon information">
          {[
            { id: "about", label: "About" },
            { id: "stats", label: "Stats" },
            { id: "moves", label: "Moves" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`detail-tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => { playTick(); setActiveTab(tab.id); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "about" && (
          <div className="detail-tab-panel about-panel panel-in" id="panel-about" role="tabpanel" key="about">
            <p className="detail-description">{flavorText || "Get closer to this Pokémon and check its base stats."}</p>
            <div className="physical-facts">
              <div><span>Height</span><strong>{(pokemon.height / 10).toFixed(1)} m</strong></div>
              <div><span>Weight</span><strong>{(pokemon.weight / 10).toFixed(1)} kg</strong></div>
              <div><span>Base EXP</span><strong>{pokemon.base_experience ?? "—"}</strong></div>
            </div>
          </div>
        )}
      </section>

      {activeTab === "stats" && (
        <section className="detail-panel pack-in pack-in-2" id="panel-stats" role="tabpanel" key="stats">
          <div className="stats-heading">
            <span className="eyebrow">ABILITY SUMMARY</span>
            <h3 className="stats-header-title">Base stats</h3>
          </div>
          <div className="stats-table">
            {pokemon.stats.map((s, i) => {
              const statName = s.stat.name;
              const label = statLabels[statName] || statName.toUpperCase();
              const value = s.base_stat;
              const percentage = Math.min(Math.round((value / 150) * 100), 100);

              let statColorClass = "bar-hp";
              if (statName === "attack") statColorClass = "bar-attack";
              if (statName === "defense") statColorClass = "bar-defense";
              if (statName === "special-attack") statColorClass = "bar-sp-attack";
              if (statName === "special-defense") statColorClass = "bar-sp-defense";
              if (statName === "speed") statColorClass = "bar-speed";

              return (
                <div key={statName} className={`stat-row ${statColorClass}`}>
                  <span className="stat-label">{label}</span>
                  <div className="stat-bar-wrapper">
                    <div
                      className="stat-bar-fill"
                      style={{ "--bar-width": `${percentage}%`, animationDelay: `${i * 90}ms` }}
                    />
                  </div>
                  <span className="stat-number"><CountUp value={value} /></span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "moves" && (
        <section className="detail-panel moves-panel pack-in pack-in-2" id="panel-moves" role="tabpanel" key="moves">
          <div className="stats-heading">
            <span className="eyebrow">KNOWN MOVES</span>
            <h3 className="stats-header-title">Moves</h3>
          </div>
          {pokemon.moves.length > 0 ? (
            <ul className="moves-list">
              {pokemon.moves.slice(0, 12).map(({ move }) => (
                <li key={move.name}>{capitalize(move.name.replaceAll("-", " "))}</li>
              ))}
            </ul>
          ) : (
            <p className="detail-description">No move data available.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default DetailPage;

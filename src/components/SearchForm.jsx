import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { playPop, playError, playTick } from "../sound.js";

function SearchForm() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const name = query.trim().toLowerCase();

    if (name === "") {
      setError("Enter a Pokémon name or number.");
      playError();
      return;
    }

    setError(null);
    playPop();
    navigate(`/pokemon/${encodeURIComponent(name)}`);
  }

  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <span className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.2 4.2" />
          </svg>
        </span>
        <input
          aria-label="Search Pokémon by name or number"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or number…"
          className="search-input"
        />
        {query && (
          <button type="button" className="search-clear" onClick={() => { playTick(); setQuery(""); setError(null); }} aria-label="Clear search">
            ×
          </button>
        )}
        <button type="submit" className="search-button">Search</button>
      </form>
      {error && <p className="search-error" role="alert">{error}</p>}
    </div>
  );
}

export default SearchForm;

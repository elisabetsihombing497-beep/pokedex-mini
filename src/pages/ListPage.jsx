import { useState } from "react";
import SearchForm from "../components/SearchForm.jsx";
import PokemonList from "../components/PokemonList.jsx";
import GateScreen from "../components/GateScreen.jsx";

function ListPage({ showIntro, onIntroDismiss }) {
  const [gateVisible, setGateVisible] = useState(showIntro);
  const [booting, setBooting] = useState(false);

  function handleDismiss() {
    setGateVisible(false);
    setBooting(true);
    window.setTimeout(() => setBooting(false), 1000);
    onIntroDismiss();
  }

  return (
    <>
      <section className="home-page" aria-live="off">
        <div className="home-intro">
          <h2>Find your favorite Pokémon</h2>
          <p>Explore 20 Pokémon, learn their types, and make a new friend.</p>
        </div>
        <SearchForm />
        <PokemonList />
        {booting && (
          <div className="boot-scan" aria-hidden="true">
            <span className="boot-text">SYNCING DATA…</span>
          </div>
        )}
      </section>
      {gateVisible && <GateScreen onDismiss={handleDismiss} />}
    </>
  );
}

export default ListPage;

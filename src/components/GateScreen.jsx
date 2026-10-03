import { useEffect, useRef, useState } from "react";
import FieldScene from "./FieldScene.jsx";
import { playPress, playGateOpen, playBack } from "../sound.js";

const BALL_URL = `${import.meta.env.BASE_URL}pokeball.svg`;

function GateScreen({ onDismiss }) {
  const [phase, setPhase] = useState("idle");
  const ballRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    const el = ballRef.current;
    if (!el) return undefined;
    let frame = 0;
    function onMove(event) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
        const dy = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
        el.style.setProperty("--tilt-x", `${(-dy * 5).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${(dx * 7).toFixed(2)}deg`);
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  function open() {
    if (phase !== "idle") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onDismiss();
      return;
    }
    playPress();
    setPhase("charging");
    window.setTimeout(() => {
      setPhase("opening");
      playGateOpen();
    }, 220);
    window.setTimeout(onDismiss, 1400);
  }

  return (
    <div className={`gate ${phase === "opening" ? "is-opening" : ""} ${phase === "charging" ? "is-charging" : ""}`} role="dialog" aria-modal="true" aria-label="Welcome to Pokédex Mini">
      <FieldScene />
      <p className="gate-kicker">SOMETHING IS ASLEEP INSIDE THIS POKÉBALL</p>
      <div className="gate-ball-tilt" ref={ballRef}>
        <div className="gate-ball" aria-hidden="true">
          <span className="gate-half gate-half-top">
            <img src={BALL_URL} alt="" />
          </span>
          <span className="gate-half gate-half-bottom">
            <img src={BALL_URL} alt="" />
          </span>
          <span className="gate-shine" />
          <button
            type="button"
            className="gate-button"
            onClick={open}
            disabled={phase !== "idle"}
            aria-label="Press the center button to open the Pokédex"
          />
        </div>
      </div>
      <p className="gate-hint">press the center button</p>
      <span className="gate-flash" aria-hidden="true" />
      <button type="button" className="gate-skip" onClick={() => { playBack(); onDismiss(); }} disabled={phase !== "idle"}>
        Skip intro
      </button>
    </div>
  );
}

export default GateScreen;

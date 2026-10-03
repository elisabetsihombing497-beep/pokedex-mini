function Cloud({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 90" aria-hidden="true">
      <g fill="#ffffff">
        <ellipse cx="72" cy="64" rx="58" ry="20" />
        <ellipse cx="58" cy="44" rx="30" ry="22" />
        <ellipse cx="94" cy="42" rx="30" ry="24" />
        <ellipse cx="124" cy="54" rx="26" ry="18" />
        <ellipse cx="38" cy="56" rx="22" ry="14" />
      </g>
      <ellipse cx="86" cy="70" rx="52" ry="10" fill="#e8f3fa" />
    </svg>
  );
}

function Bird({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 10" aria-hidden="true">
      <path d="M2 8 Q7 1.5 12 6.5 Q17 1.5 22 8" fill="none" stroke="#5b6b7a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const GRASS_BLADES = (() => {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const shades = ["#4a9440", "#3d8636", "#57a84b", "#2f7a33"];
  const blades = [];
  for (let i = 0; i < 150; i += 1) {
    const cluster = rand() * 1200;
    const cx = Math.min(1196, Math.max(4, cluster + (rand() - 0.5) * 38));
    const baseY = 66 + rand() * 8;
    const h = 8 + rand() * 22;
    const lean = (rand() - 0.5) * (h > 20 ? 26 : 14);
    const w = 2 + rand() * 2.2;
    const tipX = cx + lean;
    const tipY = baseY - h;
    const bendX = cx + lean * 0.3;
    const bendY = baseY - h * 0.62;
    blades.push({
      d: `M${(cx - w / 2).toFixed(1)} ${baseY.toFixed(1)} Q${(bendX - w * 0.35).toFixed(1)} ${bendY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q${(bendX + w * 0.35).toFixed(1)} ${bendY.toFixed(1)} ${(cx + w / 2).toFixed(1)} ${baseY.toFixed(1)} Z`,
      c: shades[Math.floor(rand() * shades.length)],
      o: (0.75 + rand() * 0.25).toFixed(2),
    });
  }
  return blades;
})();

const FLOWERS = [
  { x: 70, y: 56 }, { x: 215, y: 64 }, { x: 355, y: 57 }, { x: 520, y: 68 },
  { x: 645, y: 60 }, { x: 800, y: 70 }, { x: 935, y: 58 }, { x: 1085, y: 66 },
];

function FieldScene() {
  return (
    <div className="field-scene" aria-hidden="true">
      <div className="field-clouds">
        <Cloud className="cloud cloud-1" />
        <Cloud className="cloud cloud-2" />
        <Cloud className="cloud cloud-3" />
        <Cloud className="cloud cloud-4" />
      </div>
      <div className="field-birds">
        <Bird className="bird bird-1" />
        <Bird className="bird bird-2" />
      </div>
      <svg className="field-grass" viewBox="0 0 1200 90" preserveAspectRatio="none">
        <path d="M0 90 V42 Q160 26 330 36 T660 30 T980 38 T1200 28 V90 Z" fill="#93d17d" />
        <path d="M0 90 V56 Q200 42 420 50 T820 48 T1200 44 V90 Z" fill="#70bd58" />
        <path d="M0 90 V68 Q150 58 340 64 T700 62 T1000 66 T1200 60 V90 Z" fill="#57a84b" />
        {GRASS_BLADES.map((b, i) => (
          <path key={i} d={b.d} fill={b.c} opacity={b.o} />
        ))}
        {FLOWERS.map((f, i) => (
          <g key={`f${i}`}>
            <path d={`M${f.x} ${f.y + 9} q -1.5 -5 0 -9`} fill="none" stroke="#3d8636" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx={f.x - 3.2} cy={f.y - 3} r="2.6" fill="#fff" />
            <circle cx={f.x + 3.2} cy={f.y - 3} r="2.6" fill="#fff" />
            <circle cx={f.x} cy={f.y - 6.4} r="2.6" fill="#fff" />
            <circle cx={f.x} cy={f.y - 0.8} r="2.6" fill="#fff" />
            <circle cx={f.x} cy={f.y - 3.4} r="2" fill="#ffd23f" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default FieldScene;

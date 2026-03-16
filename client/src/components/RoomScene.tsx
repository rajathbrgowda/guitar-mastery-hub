import { useEffect, useRef, useState } from 'react';

interface RoomSceneProps {
  lampOn: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function RoomScene({ lampOn, className, style }: RoomSceneProps) {
  const [t, setT] = useState(lampOn ? 1 : 0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const dir = lampOn ? 1 : -1;
    const tick = () =>
      setT((p) => {
        const n = Math.min(1, Math.max(0, p + dir * 0.028));
        if (n > 0 && n < 1) raf.current = requestAnimationFrame(tick);
        return n;
      });
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [lampOn]);

  const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
  const lc = (a: number[], b: number[], v: number) => a.map((x, i) => Math.round(lerp(x, b[i], v)));
  const rgb = (c: number[]) => `rgb(${c.join(',')})`;

  const wallT = rgb(lc([46, 116, 112], [7, 18, 17], t));
  const wallB = rgb(lc([22, 80, 76], [4, 11, 10], t));
  const floorT = rgb(lc([208, 204, 198], [20, 15, 12], t));
  const floorB = rgb(lc([190, 186, 180], [12, 9, 7], t));
  const fab = rgb(lc([128, 166, 170], [90, 120, 124], t));
  const fabL = rgb(lc([156, 190, 194], [108, 142, 146], t));
  const fabD = rgb(lc([88, 122, 126], [58, 86, 90], t));
  const leg = '#181614';

  const LX = 848;
  const LY = 205;
  const PX = 940;
  const PY = 556;
  const PTOP = 175;

  const arm = `M ${LX} ${LY} C ${LX} ${LY - 90}, ${PX} ${PTOP - 90}, ${PX} ${PTOP}`;

  const CX = 810;
  const chairL = CX - 80;
  const chairR = CX + 80;

  return (
    <div
      className={className}
      style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', ...style }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rs-wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={wallT} />
            <stop offset="100%" stopColor={wallB} />
          </linearGradient>
          <linearGradient id="rs-fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={floorT} />
            <stop offset="100%" stopColor={floorB} />
          </linearGradient>
          <radialGradient id="rs-wallBloom" cx="71%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#e8a030" stopOpacity={String(lerp(0, 0.38, t))} />
            <stop offset="35%" stopColor="#c07820" stopOpacity={String(lerp(0, 0.18, t))} />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rs-floorPool" cx={`${LX / 12}%`} cy="5%" r="60%">
            <stop offset="0%" stopColor="#ffe878" stopOpacity={String(lerp(0, 0.75, t))} />
            <stop offset="22%" stopColor="#d08020" stopOpacity={String(lerp(0, 0.38, t))} />
            <stop offset="60%" stopColor="#804010" stopOpacity={String(lerp(0, 0.08, t))} />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rs-floorDark" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity={String(lerp(0, 0.55, t))} />
          </radialGradient>
          <radialGradient id="rs-vig" cx="50%" cy="50%" r="68%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity={String(lerp(0.08, 0.82, t))} />
          </radialGradient>
          <radialGradient id="rs-csh" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#000" stopOpacity={String(lerp(0.12, 0.55, t))} />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rs-lsh" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#000" stopOpacity={String(lerp(0.1, 0.45, t))} />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rs-bulb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffce0" />
            <stop offset="45%" stopColor="#ffd050" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#ff9000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rs-cone" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fff4b0" stopOpacity={String(lerp(0, 0.72, t))} />
            <stop offset="30%" stopColor="#e09030" stopOpacity={String(lerp(0, 0.28, t))} />
            <stop offset="75%" stopColor="#804010" stopOpacity={String(lerp(0, 0.04, t))} />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Wall + floor */}
        <rect x={0} y={0} width={1200} height={560} fill="url(#rs-wg)" />
        <rect x={0} y={0} width={1200} height={560} fill="url(#rs-wallBloom)" />
        <rect x={0} y={558} width={1200} height={117} fill="url(#rs-fg)" />
        <ellipse cx={LX} cy={580} rx={380} ry={55} fill="url(#rs-floorPool)" />
        <rect x={0} y={558} width={1200} height={117} fill="url(#rs-floorDark)" />
        <rect x={0} y={553} width={1200} height={10} fill="#000" opacity={0.22} />

        {/* Light cone from shade */}
        <polygon
          points={`${LX - 62},${LY + 28} ${LX - 220},560 ${LX + 220},560 ${LX + 62},${LY + 28}`}
          fill="url(#rs-cone)"
        />

        {/* Chair shadow */}
        <ellipse cx={CX} cy={562} rx={120} ry={13} fill="url(#rs-csh)" />

        {/* Chair legs */}
        <line
          x1={chairL + 14}
          y1={510}
          x2={chairL}
          y2={558}
          stroke={leg}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        <line
          x1={chairR - 14}
          y1={510}
          x2={chairR}
          y2={558}
          stroke={leg}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        <line
          x1={chairL + 26}
          y1={502}
          x2={chairL + 12}
          y2={552}
          stroke={leg}
          strokeWidth={3.5}
          strokeLinecap="round"
          opacity={0.75}
        />
        <line
          x1={chairR - 26}
          y1={502}
          x2={chairR - 12}
          y2={552}
          stroke={leg}
          strokeWidth={3.5}
          strokeLinecap="round"
          opacity={0.75}
        />

        {/* Chair seat */}
        <rect x={chairL} y={470} width={160} height={44} rx={12} fill={fab} />
        <rect x={chairL} y={470} width={160} height={18} rx={12} fill={fabL} opacity={0.45} />
        <rect x={chairL} y={496} width={160} height={18} rx={6} fill={fabD} opacity={0.4} />

        {/* Chair back */}
        <rect x={chairL + 10} y={316} width={140} height={164} rx={20} fill={fab} />
        <rect
          x={chairR - 18}
          y={326}
          width={20}
          height={144}
          rx={10}
          fill={fabL}
          opacity={String(lerp(0.1, 0.5, t))}
        />
        <rect x={chairL + 18} y={316} width={124} height={44} rx={20} fill={fabL} opacity={0.35} />
        <rect x={chairL + 10} y={444} width={140} height={36} rx={8} fill={fabD} opacity={0.38} />
        <rect x={chairL + 10} y={326} width={22} height={134} rx={10} fill={fabL} opacity={0.22} />

        {/* Lamp pole shadow + base */}
        <ellipse cx={PX} cy={562} rx={40} ry={7} fill="url(#rs-lsh)" />
        <ellipse cx={PX} cy={557} rx={28} ry={6} fill="#101010" />
        <rect x={PX - 8} y={542} width={16} height={16} rx={3} fill="#141210" />

        {/* Pole */}
        <rect x={PX - 5} y={PTOP} width={10} height={PY - PTOP} rx={4} fill="#161412" />
        <rect
          x={PX + 2}
          y={PTOP}
          width={3}
          height={PY - PTOP}
          rx={2}
          fill="#242220"
          opacity={0.7}
        />

        {/* Arm */}
        <path d={arm} fill="none" stroke="#090806" strokeWidth={9} strokeLinecap="round" />
        <path d={arm} fill="none" stroke="#1a1816" strokeWidth={5.5} strokeLinecap="round" />
        <path
          d={arm}
          fill="none"
          stroke="#2e2a26"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Shade */}
        <ellipse cx={LX} cy={LY} rx={50} ry={13} fill="#0f0d0b" />
        <path
          d={`M ${LX - 50} ${LY} L ${LX - 68} ${LY + 38} Q ${LX} ${LY + 52} ${LX + 68} ${LY + 38} L ${LX + 50} ${LY} Z`}
          fill="#111"
        />
        <path
          d={`M ${LX - 68} ${LY + 38} Q ${LX} ${LY + 52} ${LX + 68} ${LY + 38}`}
          fill="none"
          stroke="#2a2826"
          strokeWidth={1.5}
          opacity={0.9}
        />

        {/* Lamp inner glow */}
        <path
          d={`M ${LX - 60} ${LY + 36} Q ${LX} ${LY + 50} ${LX + 60} ${LY + 36} L ${LX + 42} ${LY + 4} Q ${LX} ${LY + 12} ${LX - 42} ${LY + 4} Z`}
          fill={`rgba(255,232,150,${lerp(0, 0.9, t)})`}
        />

        {/* Bulb */}
        <ellipse cx={LX} cy={LY + 22} rx={15} ry={6} fill="url(#rs-bulb)" opacity={t * 0.95} />
        <ellipse cx={LX} cy={LY + 20} rx={6} ry={2.5} fill="#fffde8" opacity={t} />
        <circle cx={LX} cy={LY} r={8} fill="#141210" />
        <circle cx={LX} cy={LY} r={4.5} fill="#1e1c18" />

        {/* Vignette */}
        <rect x={0} y={0} width={1200} height={675} fill="url(#rs-vig)" />
      </svg>
    </div>
  );
}

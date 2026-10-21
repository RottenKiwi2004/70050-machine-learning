// Width versus depth for ReLU networks on [0, 1] (slides L3 59 to 70).
// Width: one hidden layer of m ReLUs, f(x) = b + sum_j a_j ReLU(x - t_j), built to pass through m + 1 points of the
// target (the a_j are the changes of slope). Shown either as m ramps or as the same function written as tents.
// Depth: k layers of the tent T(x) = 2 ReLU(x) - 4 ReLU(x - 1/2) + 2 ReLU(x - 1), each layer's output plotted,
// so 3k units give 2^k linear pieces; one hidden layer would need at least 2^k - 1 units for that.
import { useState } from 'react';
import { P, R, Tex } from 'principia';
import { num } from './linalg';
import './widgets.css';

const relu = (z: number) => Math.max(0, z);
const TARGETS = {
  wave: { f: (x: number) => 0.5 + 0.35 * Math.sin(2 * Math.PI * x) + 0.1 * Math.sin(6 * Math.PI * x), name: 'smooth wave' },
  bump: { f: (x: number) => Math.exp(-((x - 0.5) ** 2) / 0.006) * 0.85 + 0.05, name: 'narrow bump' },
  step: { f: (x: number) => (x < 0.45 ? 0.2 : 0.8), name: 'step (discontinuous)' },
} as const;
type TName = keyof typeof TARGETS;
const T = (x: number) => 2 * relu(x) - 4 * relu(x - 0.5) + 2 * relu(x - 1);

const W = 420;
const H = 230;
const PAD = 18;
const X = (v: number) => PAD + v * (W - 2 * PAD);
const Y = (v: number, lo = -0.15, hi = 1.15) => H - PAD - ((v - lo) / (hi - lo)) * (H - 2 * PAD);
const XS = Array.from({ length: 401 }, (_, i) => i / 400);
const path = (f: (x: number) => number, lo?: number, hi?: number) => XS.map((x) => `${X(x).toFixed(1)},${Y(f(x), lo, hi).toFixed(1)}`).join(' ');

function widthNet(m: number, f: (x: number) => number) {
  const t = Array.from({ length: m + 1 }, (_, j) => j / m); // knots 0, 1/m, ..., 1
  const v = t.map(f);
  const slope = Array.from({ length: m }, (_, j) => (v[j + 1] - v[j]) * m);
  const a = slope.map((s, j) => (j === 0 ? s : s - slope[j - 1])); // change of slope at knot t_j
  const b = v[0];
  const fhat = (x: number) => a.reduce((s, aj, j) => s + aj * relu(x - t[j]), b);
  return { t, v, a, b, fhat };
}

export default function ExpressivenessExplorer() {
  const [tab, setTab] = useState<'width' | 'depth'>('width');
  const [m, setM] = useState(4);
  const [target, setTarget] = useState<TName>('wave');
  const [view, setView] = useState<'ramps' | 'tents'>('ramps');
  const [k, setK] = useState(3);

  const f = TARGETS[target].f;
  const net = widthNet(m, f);
  const maxErr = Math.max(...XS.map((x) => Math.abs(f(x) - net.fhat(x))));
  const tent = (j: number) => (x: number) => {
    // hat function: 1 at t_j, 0 at t_{j-1} and t_{j+1}; written with three ReLUs (two at the ends)
    const h = 1 / m;
    return (relu(x - (net.t[j] - h)) - 2 * relu(x - net.t[j]) + relu(x - (net.t[j] + h))) / h;
  };

  const layers = Array.from({ length: k }, (_, l) => (x: number) => {
    let v = x;
    for (let i = 0; i <= l; i++) v = T(v);
    return v;
  });

  const widthHint =
    target === 'step'
      ? R`A jump cannot be matched exactly by a continuous function: near the jump one linear piece has to climb steeply, and that piece gets narrower as $m$ grows. The theorem promises a uniform fit only for continuous targets.`
      : m <= 3
        ? R`With ${m} units there are only ${m} kinks, so at most ${m + 1} straight pieces: too few for the shape of the target.`
        : target === 'bump' && m < 16
          ? R`The narrow bump falls between the knots: until the spacing $1/m$ is smaller than the bump's width, the network misses most of it. Universal approximation says some $m$ is enough, not that a small $m$ is.`
          : R`Each extra unit adds one kink. Doubling $m$ roughly quarters the maximum error for a smooth target (the error of linear interpolation shrinks like $1/m^2$).`;

  return (
    <div className="w-box">
      <p className="w-title">Expressiveness: wide versus deep ReLU networks</p>
      <div className="w-row">
        <label>
          <input type="radio" checked={tab === 'width'} onChange={() => setTab('width')} /> one wide layer
        </label>
        <label>
          <input type="radio" checked={tab === 'depth'} onChange={() => setTab('depth')} /> stacked layers (sawtooth)
        </label>
      </div>

      {tab === 'width' ? (
        <>
          <svg className="w-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Target function and its ReLU approximation">
            <defs>
              <clipPath id="w-expr-clip">
                <rect x={X(0)} y={PAD / 2} width={X(1) - X(0)} height={H - PAD} />
              </clipPath>
            </defs>
            <line className="axis" x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(0)} />
            {(view === 'ramps' ? net.a.map((aj, j) => (x: number) => aj * relu(x - net.t[j]) + (j === 0 ? net.b : 0)) : net.v.map((vj, j) => (x: number) => vj * tent(j)(x))).map(
              (g, j) => (
                <polyline key={j} points={path(g)} fill="none" stroke="var(--purple)" strokeOpacity={0.45} strokeWidth={1} clipPath="url(#w-expr-clip)" />
              ),
            )}
            <polyline points={path(f)} fill="none" stroke="var(--ink-2)" strokeWidth={1.6} strokeDasharray="5 4" />
            <polyline points={path(net.fhat)} fill="none" stroke="var(--teal)" strokeWidth={2.2} />
            {net.t.map((tj, j) => (
              <circle key={j} cx={X(tj)} cy={Y(net.v[j])} r={3} fill="var(--orange)" />
            ))}
            <text className="tick" x={X(1)} y={H - 3} textAnchor="end">
              x
            </text>
          </svg>
          <div className="w-row">
            <label>
              hidden units <Tex>{R`m=${m}`}</Tex>{' '}
              <input type="range" min={1} max={40} step={1} value={m} onChange={(e) => setM(Number(e.target.value))} />
            </label>
            <label>
              target{' '}
              <select value={target} onChange={(e) => setTarget(e.target.value as TName)}>
                {(Object.keys(TARGETS) as TName[]).map((t) => (
                  <option key={t} value={t}>
                    {TARGETS[t].name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              purple curves{' '}
              <select value={view} onChange={(e) => setView(e.target.value as 'ramps' | 'tents')}>
                <option value="ramps">one ramp per unit</option>
                <option value="tents">the same sum as tents (bumps)</option>
              </select>
            </label>
          </div>
          <div className="w-readout">
            <Tex display>
              {R`\hat f(x)=b+\sum_{j=1}^{${m}}a_j\,\text{ReLU}(x-t_j),\quad t_j=\tfrac{j-1}{${m}},\quad b=${num(net.b, 2)},\quad\mathbf a=(${net.a.slice(0, 5).map((v) => num(v, 2)).join(',\\,')}${m > 5 ? ',\\dots' : ''})`}
            </Tex>
            <Tex display>{R`\text{kinks}\le m=${m}\ \Rightarrow\ \text{pieces}\le m+1=${m + 1},\qquad\max_x\big|f(x)-\hat f(x)\big|=${num(maxErr)}`}</Tex>
          </div>
          <p className="w-hint">
            <P>{widthHint}</P>
          </p>
          <p className="w-hint">
            <P>{R`Dashed: the target $f$. Teal: the network $\hat f$, which passes through the orange points $f(t_j)$. Purple: ${view === 'ramps' ? R`the ${m} terms $a_j\,\text{ReLU}(x-t_j)$ (the first one includes $b$); their sum is the teal curve.` : R`the same $\hat f$ written as $\sum_j f(t_j)\,\text{tent}_j(x)$, each tent made of three ReLUs: a sum of local bumps, the picture behind the universal approximation theorem.`}`}</P>
          </p>
        </>
      ) : (
        <>
          <svg className="w-plot" viewBox={`0 0 ${W} ${(k + 1) * 66 + 6}`} role="img" aria-label="Each layer's output as a function of the input">
            {[(x: number) => x, ...layers].map((g, l) => {
              const top = 4 + l * 66;
              const yy = (v: number) => top + 62 - v * 44;
              return (
                <g key={l}>
                  <line className="axis" x1={X(0)} y1={yy(0)} x2={X(1)} y2={yy(0)} />
                  <polyline
                    points={XS.map((x) => `${X(x).toFixed(1)},${yy(g(x)).toFixed(1)}`).join(' ')}
                    fill="none"
                    stroke={l === k ? 'var(--teal)' : 'var(--purple)'}
                    strokeWidth={l === k ? 2 : 1.4}
                  />
                  <text className="tick" x={X(0)} y={top + 11}>
                    {l === 0 ? 'input: a[0] = x' : `layer ${l}: a[${l}] = T(a[${l - 1}]), ${2 ** l} linear pieces`}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="w-row">
            <label>
              layers <Tex>{R`k=${k}`}</Tex>{' '}
              <input type="range" min={1} max={6} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} />
            </label>
          </div>
          <div className="w-readout">
            <Tex display>{R`T(x)=2\,\text{ReLU}(x)-4\,\text{ReLU}\big(x-\tfrac12\big)+2\,\text{ReLU}(x-1),\qquad a^{[l]}=T\big(a^{[l-1]}\big),\ a^{[0]}=x`}</Tex>
            <Tex display>
              {R`k=${k}:\quad 3k=${3 * k}\ \text{units}\ \to\ 2^{k}=${2 ** k}\ \text{pieces};\qquad\text{one hidden layer needs}\ \ge2^{k}-1=${2 ** k - 1}\ \text{units}`}
            </Tex>
          </div>
          <p className="w-hint">
            <P>{R`Each layer folds the interval $[0,1]$ onto itself: $T$ maps both $[0,\tfrac12]$ and $[\tfrac12,1]$ onto $[0,1]$. Every layer's output is a new representation of $x$, and the next layer applies the same fold to it, so the number of teeth doubles per layer while the number of units only grows by 3. This is why depth can be exponentially more efficient than width.`}</P>
          </p>
        </>
      )}
    </div>
  );
}

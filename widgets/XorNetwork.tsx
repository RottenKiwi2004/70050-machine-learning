// Train a one-hidden-layer network on XOR by gradient descent and watch the hidden representation
// (slides L3 44 to 58). h = g(V x + b1), P(y = 1 | x) = sigma(w^T h + b2), mean binary cross-entropy loss.
// Left: input space with P(y = 1 | x), the decision boundary P = 0.5 and each hidden unit's line V_j x + b1_j = 0.
// Right: the same points (and the input grid) mapped into the hidden space (h1, h2), where the output unit draws a line.
import { useEffect, useMemo, useRef, useState } from 'react';
import { P, R, Tex } from 'principia';
import { gauss, num, rng } from './linalg';
import { contour } from './svm';
import './widgets.css';

type Act = 'sigmoid' | 'tanh' | 'relu' | 'linear';
const sig = (z: number) => 1 / (1 + Math.exp(-z));
const ACT: Record<Act, { g: (s: number) => number; d: (s: number) => number; tex: string }> = {
  sigmoid: { g: sig, d: (s) => sig(s) * (1 - sig(s)), tex: R`\sigma` },
  tanh: { g: Math.tanh, d: (s) => 1 - Math.tanh(s) ** 2, tex: R`\tanh` },
  relu: { g: (s) => Math.max(0, s), d: (s) => (s > 0 ? 1 : 0), tex: R`\operatorname{ReLU}` },
  linear: { g: (s) => s, d: () => 1, tex: R`\operatorname{id}` },
};

type Net = { V: number[][]; b1: number[]; w: number[]; b2: number };
type Pt = { x: [number, number]; y: 0 | 1 };

const CORNERS: Pt[] = [
  { x: [0, 0], y: 0 },
  { x: [0, 1], y: 1 },
  { x: [1, 0], y: 1 },
  { x: [1, 1], y: 0 },
];
function clouds(seed: number): Pt[] {
  const u = rng(seed);
  return Array.from({ length: 40 }, (_, i) => {
    const c = CORNERS[i % 4];
    return { x: [c.x[0] + 0.12 * gauss(u), c.x[1] + 0.12 * gauss(u)] as [number, number], y: c.y };
  });
}
function init(H: number, seed: number): Net {
  const u = rng(seed);
  return {
    V: Array.from({ length: H }, () => [gauss(u), gauss(u)]),
    b1: Array.from({ length: H }, () => 0.5 * gauss(u)),
    w: Array.from({ length: H }, () => gauss(u)),
    b2: 0,
  };
}
function forward(n: Net, x: [number, number], g: (s: number) => number) {
  const s = n.V.map((v, j) => v[0] * x[0] + v[1] * x[1] + n.b1[j]);
  const h = s.map(g);
  const z = n.w.reduce((t, wj, j) => t + wj * h[j], n.b2);
  return { s, h, z, p: sig(z) };
}
/** One full-batch gradient-descent step on the mean cross-entropy; returns the loss before the step. */
function step(n: Net, data: Pt[], act: Act, eta: number) {
  const { g, d } = ACT[act];
  const H = n.w.length;
  const gV = n.V.map(() => [0, 0]);
  const gb1 = new Array<number>(H).fill(0);
  const gw = new Array<number>(H).fill(0);
  let gb2 = 0;
  let L = 0;
  for (const pt of data) {
    const { s, h, p } = forward(n, pt.x, g);
    L -= pt.y ? Math.log(Math.max(p, 1e-12)) : Math.log(Math.max(1 - p, 1e-12));
    const gz = p - pt.y; // dL/dz for sigmoid + cross-entropy
    gb2 += gz;
    for (let j = 0; j < H; j++) {
      gw[j] += gz * h[j];
      const gs = gz * n.w[j] * d(s[j]); // back through w, then through the activation
      gb1[j] += gs;
      gV[j][0] += gs * pt.x[0];
      gV[j][1] += gs * pt.x[1];
    }
  }
  const m = data.length;
  for (let j = 0; j < H; j++) {
    n.V[j][0] -= (eta * gV[j][0]) / m;
    n.V[j][1] -= (eta * gV[j][1]) / m;
    n.b1[j] -= (eta * gb1[j]) / m;
    n.w[j] -= (eta * gw[j]) / m;
  }
  n.b2 -= (eta * gb2) / m;
  return L / m;
}

const S = 280;
const PAD = 14;
const LO = -0.5;
const HI = 1.5;
const ix = (v: number) => PAD + ((v - LO) / (HI - LO)) * (S - 2 * PAD);
const iy = (v: number) => S - PAD - ((v - LO) / (HI - LO)) * (S - 2 * PAD);
const G = 40;
const mat = (rows: number[][]) => R`\begin{bmatrix}${rows.map((r) => r.map((v) => num(v, 2)).join('&')).join('\\\\')}\end{bmatrix}`;

export default function XorNetwork() {
  const [act, setAct] = useState<Act>('sigmoid');
  const [H, setH] = useState(2);
  const [eta, setEta] = useState(2);
  const [seed, setSeed] = useState(4);
  const [dataKind, setDataKind] = useState<'corners' | 'clouds'>('clouds');
  const [running, setRunning] = useState(false);
  const [, setTick] = useState(0);
  const net = useRef<Net>(init(2, 4));
  const iter = useRef(0);
  const losses = useRef<number[]>([]);
  const data = useMemo(() => (dataKind === 'corners' ? CORNERS : clouds(17)), [dataKind]);

  const reset = (h = H, s = seed) => {
    net.current = init(h, s);
    iter.current = 0;
    losses.current = [];
    setTick((t) => t + 1);
  };
  const run = (k: number) => {
    for (let i = 0; i < k; i++) {
      const L = step(net.current, data, act, eta);
      if (iter.current % 10 === 0) losses.current.push(L);
      iter.current++;
    }
    setTick((t) => t + 1);
  };

  useEffect(() => {
    if (!running) return;
    let id = 0;
    const loop = () => {
      run(25);
      if (iter.current >= 20000) setRunning(false);
      else id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  });
  // a new architecture or data set starts again from a fresh initialisation
  useEffect(() => reset(), [H, act, dataKind]); // eslint-disable-line react-hooks/exhaustive-deps

  const n = net.current;
  const { g } = ACT[act];
  const out = data.map((pt) => forward(n, pt.x, g));
  const loss = out.reduce((t, o, i) => t - (data[i].y ? Math.log(Math.max(o.p, 1e-12)) : Math.log(Math.max(1 - o.p, 1e-12))), 0) / data.length;
  const acc = out.filter((o, i) => (o.p >= 0.5 ? 1 : 0) === data[i].y).length / data.length;

  // input-space probability grid and boundary
  const gridP = Array.from({ length: G + 1 }, (_, r) => Array.from({ length: G + 1 }, (_, c) => forward(n, [LO + ((HI - LO) * c) / G, LO + ((HI - LO) * r) / G], g).p));
  const boundary = contour(gridP, 0.5);
  const gp = (c: number) => ix(LO + ((HI - LO) * c) / G);
  const gq = (r: number) => iy(LO + ((HI - LO) * r) / G);

  // hidden-space view (H = 2): map the data and the input grid lines through h(x)
  const hid = H === 2;
  const gridLines: [number, number][][] = [];
  if (hid) {
    for (let k = 0; k <= 8; k++) {
      const c = LO + ((HI - LO) * k) / 8;
      gridLines.push(Array.from({ length: 41 }, (_, i) => forward(n, [c, LO + ((HI - LO) * i) / 40], g).h as [number, number]));
      gridLines.push(Array.from({ length: 41 }, (_, i) => forward(n, [LO + ((HI - LO) * i) / 40, c], g).h as [number, number]));
    }
  }
  const pts = gridLines.flat();
  const hx0 = hid ? Math.min(...pts.map((p) => p[0])) : 0;
  const hx1 = hid ? Math.max(...pts.map((p) => p[0])) : 1;
  const hy0 = hid ? Math.min(...pts.map((p) => p[1])) : 0;
  const hy1 = hid ? Math.max(...pts.map((p) => p[1])) : 1;
  const pw = Math.max(hx1 - hx0, 1e-6) * 0.08;
  const ph = Math.max(hy1 - hy0, 1e-6) * 0.08;
  const hxs = (v: number) => PAD + ((v - (hx0 - pw)) / (hx1 - hx0 + 2 * pw || 1)) * (S - 2 * PAD);
  const hys = (v: number) => S - PAD - ((v - (hy0 - ph)) / (hy1 - hy0 + 2 * ph || 1)) * (S - 2 * PAD);
  const hInv = (px: number, py: number): [number, number] => [
    hx0 - pw + ((px - PAD) / (S - 2 * PAD)) * (hx1 - hx0 + 2 * pw),
    hy0 - ph + ((S - PAD - py) / (S - 2 * PAD)) * (hy1 - hy0 + 2 * ph),
  ];

  // loss sparkline
  const LW = 280;
  const LH = 70;
  const ls = losses.current;
  const lmax = Math.max(0.8, ...ls);
  const lpath = ls.map((v, i) => `${(6 + (i / Math.max(1, ls.length - 1)) * (LW - 12)).toFixed(1)},${(LH - 8 - (v / lmax) * (LH - 16)).toFixed(1)}`).join(' ');

  const solved = acc === 1 && loss < 0.2;
  const hint =
    act === 'linear'
      ? R`Without a nonlinearity the two layers collapse into one: $\mathbf w^\top(V\mathbf x+\mathbf b^{[1]})+b^{[2]}=(\mathbf w^\top V)\mathbf x+\text{const}$. The boundary stays a straight line and can never separate XOR (at best 3 of the 4 corners).`
      : H === 1
        ? R`One hidden unit is one line through the input space: the output can only threshold a single feature, which is still not enough for XOR.`
        : solved
          ? R`Solved. In the hidden space the two classes now sit on opposite sides of one straight line: the hidden layer has learned a representation in which XOR is linearly separable, and the output unit is just logistic regression on $\mathbf h$.`
          : act === 'relu' && out.every((o) => o.h.every((v) => v === 0))
            ? R`Every hidden ReLU outputs 0 on every point (dead units): no gradient flows back, so training is stuck. Press "new initialisation".`
            : iter.current > 15000
              ? R`Stuck in a poor solution (a local minimum or a flat region): this happens on XOR with few hidden units. Try "new initialisation" or more hidden units.`
              : R`Press play: gradient descent moves the hidden lines (purple, left) until the four corners land in a hidden space where one line separates them (right).`;

  return (
    <div className="w-box">
      <p className="w-title">Learn XOR with a hidden layer</p>
      <div className="w-grid">
        <svg className="w-plot" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Input space: network probability, decision boundary and hidden-unit lines">
          {gridP.slice(0, G).map((row, r) =>
            row.slice(0, G).map((p, c) => (
              <rect
                key={`${r}-${c}`}
                x={gp(c)}
                y={gq(r + 1)}
                width={gp(c + 1) - gp(c)}
                height={gq(r) - gq(r + 1)}
                fill={p >= 0.5 ? 'var(--teal)' : 'var(--orange)'}
                fillOpacity={0.05 + 0.32 * Math.abs(p - 0.5) * 2}
                shapeRendering="crispEdges"
              />
            )),
          )}
          {act !== 'linear' &&
            n.V.map((v, j) => {
              // hidden line V_j1 x1 + V_j2 x2 + b1_j = 0, clipped to the view
              const ends: [number, number][] = [];
              for (const xv of [LO, HI]) if (Math.abs(v[1]) > 1e-9) ends.push([xv, -(v[0] * xv + n.b1[j]) / v[1]]);
              for (const yv of [LO, HI]) if (Math.abs(v[0]) > 1e-9) ends.push([-(v[1] * yv + n.b1[j]) / v[0], yv]);
              const inb = ends.filter(([a, b]) => a >= LO - 1e-9 && a <= HI + 1e-9 && b >= LO - 1e-9 && b <= HI + 1e-9);
              return inb.length >= 2 ? (
                <line key={j} x1={ix(inb[0][0])} y1={iy(inb[0][1])} x2={ix(inb[1][0])} y2={iy(inb[1][1])} stroke="var(--purple)" strokeWidth={1.2} strokeDasharray="3 3" />
              ) : null;
            })}
          <path
            d={boundary.map(([a, b, c, d]) => `M${gp(a).toFixed(1)},${gq(b).toFixed(1)}L${gp(c).toFixed(1)},${gq(d).toFixed(1)}`).join('')}
            stroke="var(--ink)"
            strokeWidth={2}
            fill="none"
          />
          {data.map((pt, i) => (
            <circle key={i} cx={ix(pt.x[0])} cy={iy(pt.x[1])} r={dataKind === 'corners' ? 6 : 3.4} fill={pt.y ? 'var(--teal)' : 'none'} stroke={pt.y ? 'var(--teal)' : 'var(--orange)'} strokeWidth={1.6} />
          ))}
          <text className="tick" x={S - PAD} y={S - 2} textAnchor="end">
            input space (x₁, x₂)
          </text>
        </svg>
        <div>
          <svg className="w-plot" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Hidden space: the data mapped through the hidden layer">
            {hid ? (
              <>
                {Array.from({ length: 30 }, (_, r) =>
                  Array.from({ length: 30 }, (_, c) => {
                    const x0 = PAD + ((S - 2 * PAD) * c) / 30;
                    const y0 = PAD + ((S - 2 * PAD) * r) / 30;
                    const [h1, h2] = hInv(x0 + (S - 2 * PAD) / 60, y0 + (S - 2 * PAD) / 60);
                    const z = n.w[0] * h1 + n.w[1] * h2 + n.b2;
                    return (
                      <rect key={`${r}-${c}`} x={x0} y={y0} width={(S - 2 * PAD) / 30} height={(S - 2 * PAD) / 30} fill={z >= 0 ? 'var(--teal)' : 'var(--orange)'} fillOpacity={0.12} shapeRendering="crispEdges" />
                    );
                  }),
                )}
                {gridLines.map((l, k) => (
                  <polyline key={k} points={l.map((p) => `${hxs(p[0]).toFixed(1)},${hys(p[1]).toFixed(1)}`).join(' ')} fill="none" stroke="var(--rule)" strokeWidth={0.8} />
                ))}
                {out.map((o, i) => (
                  <circle key={i} cx={hxs(o.h[0])} cy={hys(o.h[1])} r={dataKind === 'corners' ? 6 : 3.4} fill={data[i].y ? 'var(--teal)' : 'none'} stroke={data[i].y ? 'var(--teal)' : 'var(--orange)'} strokeWidth={1.6} />
                ))}
                <text className="tick" x={S - PAD} y={S - 2} textAnchor="end">
                  hidden space (h₁, h₂)
                </text>
              </>
            ) : (
              <text className="tick" x={S / 2} y={S / 2} textAnchor="middle">
                set H = 2 to see the hidden space
              </text>
            )}
          </svg>
          <svg className="w-plot" viewBox={`0 0 ${LW} ${LH}`} role="img" aria-label="Training loss">
            <line className="axis" x1={6} y1={LH - 8} x2={LW - 6} y2={LH - 8} />
            <polyline points={lpath} fill="none" stroke="var(--red)" strokeWidth={1.6} />
            <text className="tick" x={LW - 8} y={LH - 13} textAnchor="end">
              loss L (every 10 steps)
            </text>
          </svg>
        </div>
      </div>
      <div className="w-row">
        <button type="button" onClick={() => setRunning((r) => !r)}>
          {running ? 'pause' : 'play'}
        </button>
        <button type="button" onClick={() => run(500)}>
          +500 steps
        </button>
        <button
          type="button"
          onClick={() => {
            const s = Math.floor(rng(seed)() * 1e6);
            setSeed(s);
            reset(H, s);
          }}
        >
          new initialisation
        </button>
        <label>
          activation{' '}
          <select value={act} onChange={(e) => setAct(e.target.value as Act)}>
            <option value="sigmoid">sigmoid</option>
            <option value="tanh">tanh</option>
            <option value="relu">ReLU</option>
            <option value="linear">none (linear)</option>
          </select>
        </label>
        <label>
          hidden units <Tex>{R`H=${H}`}</Tex>{' '}
          <input type="range" min={1} max={6} step={1} value={H} onChange={(e) => setH(Number(e.target.value))} />
        </label>
        <label>
          <Tex>{R`\eta=${num(eta, 2)}`}</Tex>{' '}
          <input type="range" min={0.1} max={5} step={0.1} value={eta} onChange={(e) => setEta(Number(e.target.value))} />
        </label>
        <label>
          data{' '}
          <select value={dataKind} onChange={(e) => setDataKind(e.target.value as 'corners' | 'clouds')}>
            <option value="clouds">clouds around the corners</option>
            <option value="corners">the four corners only</option>
          </select>
        </label>
      </div>
      <div className="w-readout">
        <Tex display>{R`\mathbf h=${ACT[act].tex}\big(V\mathbf x+\mathbf b^{[1]}\big),\quad P(y=1\mid\mathbf x)=\sigma\big(\mathbf w^\top\mathbf h+b^{[2]}\big)`}</Tex>
        <Tex display>{R`t=${iter.current}\ \text{steps},\qquad L=-\frac1N\sum_i\big[y_i\log p_i+(1-y_i)\log(1-p_i)\big]=${num(loss)},\qquad\text{accuracy}=${num(acc)}`}</Tex>
        <Tex display>
          {R`\underbrace{V}_{${H}\times2}=${mat(n.V)},\quad\underbrace{\mathbf b^{[1]}}_{${H}\times1}=${mat(n.b1.map((v) => [v]))},\quad\underbrace{\mathbf w^\top}_{1\times${H}}=${mat([n.w])},\quad b^{[2]}=${num(n.b2, 2)}`}
        </Tex>
      </div>
      <p className="w-hint">
        <P>{hint}</P>
      </p>
      <p className="w-hint">
        <P>{R`Each step is one gradient-descent update on the mean cross-entropy, with the gradients from backpropagation: $\frac{\partial L}{\partial z}=p-y$, then $\mathbf g_{\mathbf h}=(p-y)\mathbf w$, $\mathbf g_{\mathbf s}=\mathbf g_{\mathbf h}\odot g'(\mathbf s)$, $\nabla_VL=\mathbf g_{\mathbf s}\mathbf x^\top$. Grey lines on the right are the input grid bent by the hidden layer.`}</P>
      </p>
    </div>
  );
}

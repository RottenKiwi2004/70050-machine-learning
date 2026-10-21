// Step through the forward and backward pass of the worked two-layer network of files 47 and 48 (slides L3 85 to 100):
// z = V x, a = ReLU(z), y_hat = W a, L = 1/2 ||y_hat - y||^2, with V: 3x2 and W: 2x3. Every step shows its
// arithmetic with shapes. Change x and y, take a gradient step, and check any weight's gradient by finite differences.
import { useState } from 'react';
import { P, R, Tex } from 'principia';
import { num } from './linalg';
import './widgets.css';

type M = number[][];
const V0: M = [
  [1, -1],
  [2, 0],
  [-1, 1],
];
const W0: M = [
  [1, 0, 1],
  [0, 1, -1],
];
const mv = (A: M, x: number[]) => A.map((r) => r.reduce((s, v, j) => s + v * x[j], 0));
const tr = (A: M) => A[0].map((_, j) => A.map((r) => r[j]));
const outer = (u: number[], v: number[]) => u.map((ui) => v.map((vj) => ui * vj));

function pass(V: M, W: M, x: number[], y: number[]) {
  const z = mv(V, x);
  const a = z.map((v) => Math.max(0, v));
  const yh = mv(W, a);
  const L = 0.5 * yh.reduce((s, v, c) => s + (v - y[c]) ** 2, 0);
  const gy = yh.map((v, c) => v - y[c]);
  const gW = outer(gy, a);
  const ga = mv(tr(W), gy);
  const gz = ga.map((v, h) => (z[h] > 0 ? v : 0));
  const gV = outer(gz, x);
  const gx = mv(tr(V), gz);
  return { z, a, yh, L, gy, gW, ga, gz, gV, gx };
}

const n = (v: number) => num(v, 3);
const col = (v: number[]) => R`\begin{bmatrix}${v.map(n).join('\\\\')}\end{bmatrix}`;
const mat = (A: M) => R`\begin{bmatrix}${A.map((r) => r.map(n).join('&')).join('\\\\')}\end{bmatrix}`;
const row = (v: number[]) => R`\begin{bmatrix}${v.map(n).join('&')}\end{bmatrix}`;
const par = (v: number) => (v < 0 ? `(${n(v)})` : n(v));

const STEPS = [
  'start',
  'forward: first linear layer',
  'forward: ReLU',
  'forward: output linear layer',
  'forward: loss',
  'backward: loss block',
  'backward: output linear layer',
  'backward: ReLU',
  'backward: first linear layer',
  'gradient-descent update',
];

// layout of the computation graph
const GW = 560;
const GH = 190;
const NODES = [
  { key: 'x', label: 'x', x: 30, shape: '2×1' },
  { key: 'z', label: 'z', x: 170, shape: '3×1' },
  { key: 'a', label: 'a', x: 300, shape: '3×1' },
  { key: 'yh', label: 'ŷ', x: 430, shape: '2×1' },
  { key: 'L', label: 'L', x: 535, shape: '1×1' },
];
const BLOCKS = [
  { label: 'Linear V', x: 100, step: 1, back: 8 },
  { label: 'ReLU', x: 235, step: 2, back: 7 },
  { label: 'Linear W', x: 365, step: 3, back: 6 },
  { label: 'Loss', x: 485, step: 4, back: 5 },
];

export default function BackpropStepper() {
  const [V, setV] = useState<M>(V0);
  const [W, setW] = useState<M>(W0);
  const [x, setX] = useState([1, 2]);
  const [y, setY] = useState([0, 2]);
  const [s, setS] = useState(0);
  const [eta, setEta] = useState(0.05);
  const [param, setParam] = useState('V-2-1');
  const r = pass(V, W, x, y);
  const nV = V.map((rw, h) => rw.map((v, i) => v - eta * r.gV[h][i]));
  const nW = W.map((rw, c) => rw.map((v, h) => v - eta * r.gW[c][h]));
  const after = pass(nV, nW, x, y);

  // finite-difference check of one weight
  const [which, pi, pj] = param.split('-');
  const ii = Number(pi);
  const jj = Number(pj);
  const eps = 1e-4;
  const bump = (d: number) => {
    const V2 = V.map((rw) => [...rw]);
    const W2 = W.map((rw) => [...rw]);
    if (which === 'V') V2[ii][jj] += d;
    else W2[ii][jj] += d;
    return pass(V2, W2, x, y).L;
  };
  const fd = (bump(eps) - bump(-eps)) / (2 * eps);
  const bp = which === 'V' ? r.gV[ii][jj] : r.gW[ii][jj];
  const nearKink = r.z.some((v) => Math.abs(v) < 1e-3);

  const vals: Record<string, { fwd: number[] | null; bwd: number[] | null }> = {
    x: { fwd: x, bwd: s >= 8 ? r.gx : null },
    z: { fwd: s >= 1 ? r.z : null, bwd: s >= 7 ? r.gz : null },
    a: { fwd: s >= 2 ? r.a : null, bwd: s >= 6 ? r.ga : null },
    yh: { fwd: s >= 3 ? r.yh : null, bwd: s >= 5 ? r.gy : null },
    L: { fwd: s >= 4 ? [r.L] : null, bwd: s >= 5 ? [1] : null },
  };

  const stepTex: string[] =
    s === 0
      ? [R`\mathbf x=${col(x)},\quad V=${mat(V)},\quad W=${mat(W)},\quad\mathbf y=${col(y)}`]
      : s === 1
        ? [
            R`\underbrace{\mathbf z}_{3\times1}=\underbrace{V}_{3\times2}\underbrace{\mathbf x}_{2\times1}=\begin{bmatrix}${V.map((rw) => `${n(rw[0])}\\cdot${par(x[0])}+${par(rw[1])}\\cdot${par(x[1])}`).join('\\\\')}\end{bmatrix}=${col(r.z)}`,
          ]
        : s === 2
          ? [R`\mathbf a=\operatorname{ReLU}(\mathbf z)=\begin{bmatrix}${r.z.map((v) => `\\max(0,${n(v)})`).join('\\\\')}\end{bmatrix}=${col(r.a)}\qquad(\text{cache }\mathbf z\text{ for the backward pass})`]
          : s === 3
            ? [
                R`\underbrace{\hat{\mathbf y}}_{2\times1}=\underbrace{W}_{2\times3}\underbrace{\mathbf a}_{3\times1}=\begin{bmatrix}${W.map((rw) => rw.map((v, h) => `${par(v)}\\cdot${par(r.a[h])}`).join('+')).join('\\\\')}\end{bmatrix}=${col(r.yh)}`,
              ]
            : s === 4
              ? [R`L=\tfrac12\lVert\hat{\mathbf y}-\mathbf y\rVert^2=\tfrac12\Big[${r.yh.map((v, c) => `(${n(v)}-${par(y[c])})^2`).join('+')}\Big]=${n(r.L)}`]
              : s === 5
                ? [R`\frac{\partial L}{\partial L}=1,\qquad\underbrace{\mathbf g_{\hat{\mathbf y}}}_{2\times1}=\frac{\partial L}{\partial\hat{\mathbf y}}=\hat{\mathbf y}-\mathbf y=${col(r.yh)}-${col(y)}=${col(r.gy)}`]
                : s === 6
                  ? [
                      R`\underbrace{\nabla_WL}_{2\times3}=\underbrace{\mathbf g_{\hat{\mathbf y}}}_{2\times1}\underbrace{\mathbf a^\top}_{1\times3}=${col(r.gy)}${row(r.a)}=${mat(r.gW)}`,
                      R`\underbrace{\mathbf g_{\mathbf a}}_{3\times1}=\underbrace{W^\top}_{3\times2}\underbrace{\mathbf g_{\hat{\mathbf y}}}_{2\times1}=${mat(tr(W))}${col(r.gy)}=${col(r.ga)}`,
                    ]
                  : s === 7
                    ? [R`\mathbf g_{\mathbf z}=\mathbf g_{\mathbf a}\odot\mathbb 1[\mathbf z>0]=${col(r.ga)}\odot${col(r.z.map((v) => (v > 0 ? 1 : 0)))}=${col(r.gz)}`]
                    : s === 8
                      ? [
                          R`\underbrace{\nabla_VL}_{3\times2}=\underbrace{\mathbf g_{\mathbf z}}_{3\times1}\underbrace{\mathbf x^\top}_{1\times2}=${col(r.gz)}${row(x)}=${mat(r.gV)}`,
                          R`\underbrace{\mathbf g_{\mathbf x}}_{2\times1}=\underbrace{V^\top}_{2\times3}\underbrace{\mathbf g_{\mathbf z}}_{3\times1}=${mat(tr(V))}${col(r.gz)}=${col(r.gx)}\quad(\text{optional})`,
                        ]
                      : [
                          R`V\leftarrow V-\eta\nabla_VL=${mat(nV)},\qquad W\leftarrow W-\eta\nabla_WL=${mat(nW)}\qquad(\eta=${num(eta, 3)})`,
                          R`\text{new forward pass: }L=${n(r.L)}\ \longrightarrow\ ${n(after.L)}`,
                        ];

  const box = (v: number[] | null, cx: number, top: boolean, color: string) => {
    if (!v) return null;
    const h = 15;
    const y0 = top ? 78 - v.length * h : 112;
    return (
      <g>
        <rect x={cx - 22} y={y0 - 2} width={44} height={v.length * h + 4} fill="none" stroke={color} strokeOpacity={0.6} rx={3} />
        {v.map((vv, i) => (
          <text key={i} x={cx} y={y0 + 11 + i * h} textAnchor="middle" style={{ fill: color, font: '11px var(--f-mono)' }}>
            {num(vv, 2)}
          </text>
        ))}
      </g>
    );
  };

  return (
    <div className="w-box">
      <p className="w-title">Backpropagation, one block at a time</p>
      <svg className="w-plot" viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label="Computation graph with forward values and backward gradients">
        <line x1={10} y1={95} x2={GW - 6} y2={95} stroke="var(--rule)" />
        {BLOCKS.map((b) => {
          const active = s === b.step || s === b.back;
          return (
            <g key={b.label}>
              <rect x={b.x - 30} y={84} width={60} height={22} rx={3} fill="var(--ground)" stroke={active ? 'var(--pink)' : 'var(--rule)'} strokeWidth={active ? 2 : 1} />
              <text x={b.x} y={99} textAnchor="middle" style={{ fill: active ? 'var(--pink)' : 'var(--ink-2)', font: '11px var(--f-mono)' }}>
                {b.label}
              </text>
            </g>
          );
        })}
        {NODES.map((nd) => (
          <g key={nd.key}>
            <text x={nd.x} y={GH - 22} textAnchor="middle" style={{ fill: 'var(--ink)', font: 'italic 14px var(--f-tex)' }}>
              {nd.label}
            </text>
            <text x={nd.x} y={GH - 8} textAnchor="middle" className="tick">
              {nd.shape}
            </text>
            {box(vals[nd.key].fwd, nd.x, true, 'var(--green)')}
            {box(vals[nd.key].bwd, nd.x, false, 'var(--red)')}
          </g>
        ))}
        <text x={8} y={14} className="tick" style={{ fill: 'var(--green)' }}>
          forward values (above) →
        </text>
        <text x={GW - 8} y={14} className="tick" textAnchor="end" style={{ fill: 'var(--red)' }}>
          ← gradients g = ∂L/∂(·) (below)
        </text>
      </svg>
      <div className="w-row">
        <button type="button" onClick={() => setS((v) => Math.max(0, v - 1))} disabled={s === 0}>
          ◀ back
        </button>
        <button type="button" onClick={() => setS((v) => Math.min(STEPS.length - 1, v + 1))} disabled={s === STEPS.length - 1}>
          next ▶
        </button>
        <span style={{ color: 'var(--purple)' }}>
          step {s} of {STEPS.length - 1}: {STEPS[s]}
        </span>
      </div>
      <div className="w-readout">
        {stepTex.map((t, i) => (
          <Tex key={i} display>
            {t}
          </Tex>
        ))}
      </div>
      <div className="w-row">
        <label>
          <Tex>{R`x_1=${num(x[0], 2)}`}</Tex> <input type="range" min={-2} max={2} step={0.1} value={x[0]} onChange={(e) => setX([Number(e.target.value), x[1]])} />
        </label>
        <label>
          <Tex>{R`x_2=${num(x[1], 2)}`}</Tex> <input type="range" min={-2} max={2} step={0.1} value={x[1]} onChange={(e) => setX([x[0], Number(e.target.value)])} />
        </label>
        <label>
          <Tex>{R`y_1=${num(y[0], 2)}`}</Tex> <input type="range" min={-2} max={3} step={0.1} value={y[0]} onChange={(e) => setY([Number(e.target.value), y[1]])} />
        </label>
        <label>
          <Tex>{R`y_2=${num(y[1], 2)}`}</Tex> <input type="range" min={-2} max={3} step={0.1} value={y[1]} onChange={(e) => setY([y[0], Number(e.target.value)])} />
        </label>
      </div>
      <div className="w-row">
        <label>
          <Tex>{R`\eta=${num(eta, 3)}`}</Tex> <input type="range" min={0.01} max={0.5} step={0.01} value={eta} onChange={(e) => setEta(Number(e.target.value))} />
        </label>
        <button
          type="button"
          onClick={() => {
            setV(nV);
            setW(nW);
            setS(0);
          }}
        >
          apply the update (L {num(r.L, 3)} → {num(after.L, 3)})
        </button>
        <button
          type="button"
          onClick={() => {
            setV(V0);
            setW(W0);
            setX([1, 2]);
            setY([0, 2]);
            setS(0);
          }}
        >
          reset to the worked example
        </button>
      </div>
      <div className="w-row">
        <label>
          check one weight{' '}
          <select value={param} onChange={(e) => setParam(e.target.value)}>
            {V.flatMap((rw, h) => rw.map((_, i) => <option key={`V-${h}-${i}`} value={`V-${h}-${i}`}>{`V${h + 1}${i + 1}`}</option>))}
            {W.flatMap((rw, c) => rw.map((_, h) => <option key={`W-${c}-${h}`} value={`W-${c}-${h}`}>{`W${c + 1}${h + 1}`}</option>))}
          </select>
        </label>
      </div>
      <div className="w-readout">
        <Tex display>
          {R`\frac{L(\theta+\epsilon)-L(\theta-\epsilon)}{2\epsilon}\Big|_{\theta=${which}_{${ii + 1}${jj + 1}},\ \epsilon=10^{-4}}=${num(fd, 4)}\qquad\text{backprop: }\big(\nabla_{${which}}L\big)_{${ii + 1}${jj + 1}}=${num(bp, 4)}`}
        </Tex>
      </div>
      <p className={nearKink ? 'w-hint w-warn' : 'w-hint'}>
        <P>
          {nearKink
            ? R`A hidden score is (almost) exactly 0, at the ReLU kink: the two sides of the finite difference see different slopes, so the check can disagree with backprop there. Move $\mathbf x$ a little.`
            : s >= 5 && s <= 8
              ? R`The backward pass runs right to left. Each block multiplies the gradient arriving from its right by its local derivative: transposed weights for a linear block, the 0/1 mask $\mathbb 1[\mathbf z>0]$ for ReLU. Weight gradients are outer products: (gradient at the output) $\times$ (input)$^\top$.`
              : R`Green boxes: forward values, cached for the backward pass. Red boxes: column gradients $\mathbf g=\partial L/\partial(\cdot)$, each with the same shape as its value. The check below compares any one entry of $\nabla_VL$ or $\nabla_WL$ with a central finite difference.`}
        </P>
      </p>
    </div>
  );
}

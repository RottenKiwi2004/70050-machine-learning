// A kernel SVM trained live on 2D data (slides L3 30 to 36 and the appendix slides 117 to 124).
// Pick a data set, a kernel and the penalty C: the widget solves the dual problem, circles the support vectors
// (alpha_i > 0), and draws the decision boundary f(x) = 0 with the margin lines f(x) = +1 and f(x) = -1.
import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { P, R, Tex } from 'principia';
import { gauss, num, rng } from './linalg';
import { contour, linearK, polyK, rbfK, trainSVM, type Vec } from './svm';
import './widgets.css';

type DataKind = 'blobs' | 'ring' | 'xor';
type KName = 'linear' | 'poly' | 'rbf';
const N = 50;
const G = 48; // grid resolution for the shading and the contours
const S = 320;
const PAD = 16;
const sx = (v: number) => PAD + ((v + 1) / 2) * (S - 2 * PAD);
const sy = (v: number) => S - PAD - ((v + 1) / 2) * (S - 2 * PAD);
const gx = (c: number) => -1 + (2 * c) / G; // grid vertex -> data coordinate

function makeData(kind: DataKind, seed: number): { X: Vec[]; y: number[] } {
  const u = rng(seed);
  const X: Vec[] = [];
  const y: number[] = [];
  for (let i = 0; i < N; i++) {
    let p: Vec;
    let lab: number;
    if (kind === 'blobs') {
      lab = i % 2 ? 1 : -1;
      p = [lab * 0.38 + 0.32 * gauss(u), lab * 0.25 + 0.32 * gauss(u)];
    } else {
      p = [2 * u() - 1, 2 * u() - 1];
      lab = kind === 'ring' ? (Math.hypot(p[0], p[1]) < 0.58 ? 1 : -1) : p[0] * p[1] > 0 ? 1 : -1;
      if (u() < 0.06) lab = -lab; // a few points on the wrong side
    }
    X.push([Math.max(-0.98, Math.min(0.98, p[0])), Math.max(-0.98, Math.min(0.98, p[1]))]);
    y.push(lab);
  }
  return { X, y };
}

export default function KernelSVM() {
  const [kind, setKind] = useState<DataKind>('blobs');
  const [kname, setKname] = useState<KName>('linear');
  const [p, setP] = useState(2);
  const [logSigma, setLogSigma] = useState(Math.log10(0.4));
  const [logC, setLogC] = useState(1);
  const [q, setQ] = useState<Vec>([0.2, 0.3]);
  const svg = useRef<SVGSVGElement>(null);

  const sigma = 10 ** logSigma;
  const C = 10 ** logC;
  const { X, y } = useMemo(() => makeData(kind, kind === 'blobs' ? 3 : kind === 'ring' ? 5 : 9), [kind]);
  const model = useMemo(() => {
    const k = kname === 'linear' ? linearK : kname === 'poly' ? polyK(p) : rbfK(sigma);
    return trainSVM(X, y, k, C);
  }, [X, y, kname, p, sigma, C]);

  const grid = useMemo(() => Array.from({ length: G + 1 }, (_, r) => Array.from({ length: G + 1 }, (_, c) => model.f([gx(c), gx(r)]))), [model]);
  const flat = grid.flat();
  const degenerate = Math.max(...flat) - Math.min(...flat) < 1e-3; // f is (numerically) constant: no boundary to draw
  const lines = useMemo(
    () => (degenerate ? { zero: [], plus: [], minus: [] } : { zero: contour(grid, 0), plus: contour(grid, 1), minus: contour(grid, -1) }),
    [grid, degenerate],
  );

  const acc = X.filter((x, i) => Math.sign(model.f(x)) === y[i]).length / N;
  const atC = model.sv.filter((t) => model.alpha[t] >= C - 1e-6).length;
  const w = X.reduce((s, x, i) => [s[0] + model.alpha[i] * y[i] * x[0], s[1] + model.alpha[i] * y[i] * x[1]], [0, 0]);
  const fq = model.f(q);

  const toPx = (gc: number) => sx(gx(gc));
  const toPy = (gr: number) => sy(gx(gr));
  const segPath = (segs: [number, number, number, number][]) =>
    segs.map(([a, b, c, d]) => `M${toPx(a).toFixed(1)},${toPy(b).toFixed(1)}L${toPx(c).toFixed(1)},${toPy(d).toFixed(1)}`).join('');

  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const vx = ((((e.clientX - box.left) / box.width) * S - PAD) / (S - 2 * PAD)) * 2 - 1;
    const vy = (((S - PAD - ((e.clientY - box.top) / box.height) * S) / (S - 2 * PAD)) * 2) - 1;
    setQ([Number(Math.max(-1, Math.min(1, vx)).toFixed(2)), Number(Math.max(-1, Math.min(1, vy)).toFixed(2))]);
  };

  const kTex =
    kname === 'linear'
      ? R`k(\mathbf x,\mathbf z)=\mathbf x^\top\mathbf z`
      : kname === 'poly'
        ? R`k(\mathbf x,\mathbf z)=(\mathbf x^\top\mathbf z+1)^{${p}}`
        : R`k(\mathbf x,\mathbf z)=\exp\!\Big[-\frac{\lVert\mathbf x-\mathbf z\rVert^2}{2\cdot${num(sigma, 2)}^2}\Big]`;

  const hint =
    kname === 'linear' && kind !== 'blobs'
      ? R`A linear kernel can only draw a straight line, and no line separates these classes: the best the SVM can do is a nearly flat $f$, with many points inside the margin or on the wrong side, and many support vectors. Try the polynomial or Gaussian kernel.`
      : kname === 'rbf' && sigma < 0.15
        ? R`A very small $\sigma$ makes each kernel a narrow bump around its own training point: the boundary wraps tightly around single points (overfitting) and nearly every point is a support vector.`
        : kname === 'rbf' && sigma > 1.5 && kind !== 'blobs'
          ? R`A very large $\sigma$ makes every bump so wide that $k$ is almost constant: the classifier becomes nearly linear again and cannot follow the classes.`
          : C >= 300
            ? R`Large $C$ makes every violation expensive: the margin narrows to fit the training points, which can overfit. Small $C$ allows violations and keeps a wide margin.`
            : C <= 0.35
              ? R`Small $C$: violations are cheap, so the margin is wide and many points lie inside it (all with $\alpha_i=C$). The boundary is smooth but may underfit.`
              : kname === 'poly' && kind === 'ring' && p === 2
                ? R`$(\mathbf x^\top\mathbf z+1)^2$ contains the squares $x_1^2,x_2^2$ among its features, so a line in feature space is an ellipse in the plane: just right for a ring.`
                : R`Only the circled support vectors ($\alpha_i>0$) enter $f(\mathbf x)$. Deleting any other training point would not change the boundary at all: it is decided by the points closest to it.`;

  return (
    <div className="w-box">
      <p className="w-title">Kernel SVM: support vectors and margins</p>
      <div className="w-grid">
        <svg ref={svg} className="w-plot" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="SVM decision function, boundary and margins" onPointerDown={onPointer}>
          {grid.slice(0, G).map((row, r) =>
            row.slice(0, G).map((_, c) => {
              const v = model.f([gx(c + 0.5), gx(r + 0.5)]);
              return (
                <rect
                  key={`${r}-${c}`}
                  x={toPx(c)}
                  y={toPy(r + 1)}
                  width={toPx(c + 1) - toPx(c)}
                  height={toPy(r) - toPy(r + 1)}
                  fill={v >= 0 ? 'var(--teal)' : 'var(--orange)'}
                  fillOpacity={0.05 + 0.3 * Math.min(1, Math.abs(v) / 2)}
                  shapeRendering="crispEdges"
                />
              );
            }),
          )}
          <path d={segPath(lines.plus)} stroke="var(--teal)" strokeWidth={1.4} strokeDasharray="5 4" fill="none" />
          <path d={segPath(lines.minus)} stroke="var(--orange)" strokeWidth={1.4} strokeDasharray="5 4" fill="none" />
          <path d={segPath(lines.zero)} stroke="var(--ink)" strokeWidth={2} fill="none" />
          {X.map((x, i) => (
            <g key={i}>
              {model.alpha[i] > 1e-8 && (
                <circle cx={sx(x[0])} cy={sy(x[1])} r={7.5} fill="none" stroke={model.alpha[i] >= C - 1e-6 ? 'var(--red)' : 'var(--pink)'} strokeWidth={1.6} />
              )}
              <circle
                cx={sx(x[0])}
                cy={sy(x[1])}
                r={3.6}
                fill={y[i] > 0 ? 'var(--teal)' : 'none'}
                stroke={y[i] > 0 ? 'var(--teal)' : 'var(--orange)'}
                strokeWidth={1.6}
              />
            </g>
          ))}
          <path d={`M${sx(q[0]) - 7},${sy(q[1])}h14M${sx(q[0])},${sy(q[1]) - 7}v14`} stroke="var(--purple)" strokeWidth={2.4} />
          <rect x={PAD} y={PAD} width={S - 2 * PAD} height={S - 2 * PAD} fill="none" stroke="var(--rule)" />
        </svg>
        <div>
          <div className="w-row">
            <label>
              data{' '}
              <select value={kind} onChange={(e) => setKind(e.target.value as DataKind)}>
                <option value="blobs">two overlapping blobs</option>
                <option value="ring">ring (inside / outside)</option>
                <option value="xor">XOR quadrants</option>
              </select>
            </label>
            <label>
              kernel{' '}
              <select value={kname} onChange={(e) => setKname(e.target.value as KName)}>
                <option value="linear">linear</option>
                <option value="poly">polynomial</option>
                <option value="rbf">Gaussian (RBF)</option>
              </select>
            </label>
          </div>
          <div className="w-row">
            {kname === 'poly' && (
              <label>
                degree <Tex>{R`p=${p}`}</Tex>{' '}
                <input type="range" min={1} max={6} step={1} value={p} onChange={(e) => setP(Number(e.target.value))} />
              </label>
            )}
            {kname === 'rbf' && (
              <label>
                <Tex>{R`\sigma=${num(sigma, 2)}`}</Tex>{' '}
                <input type="range" min={-1.3} max={0.5} step={0.01} value={logSigma} onChange={(e) => setLogSigma(Number(e.target.value))} />
              </label>
            )}
            <label>
              <Tex>{R`C=${num(C, 2)}`}</Tex>{' '}
              <input type="range" min={-1} max={3} step={0.05} value={logC} onChange={(e) => setLogC(Number(e.target.value))} />
            </label>
          </div>
          <p className="w-hint">
            <P>{R`Solid line: $f(\mathbf x)=0$. Dashed: the margins $f(\mathbf x)=\pm1$. Ringed points are support vectors: pink with $0<\alpha_i<C$ (exactly on a margin), red with $\alpha_i=C$ (inside the margin or misclassified). Click to move the purple query point.`}</P>
          </p>
        </div>
      </div>
      <div className="w-readout">
        <Tex display>{R`${kTex},\qquad f(\mathbf x)=\sum_{i\in\text{SV}}\alpha_iy_i\,k(\mathbf x_i,\mathbf x)+b,\quad b=${num(model.b)}`}</Tex>
        <Tex display>
          {R`|\text{SV}|=${model.sv.length}\text{ of }${N}\ (${atC}\text{ with }\alpha_i=C),\quad\text{training accuracy}=${num(acc)},\quad\text{dual objective}=${num(model.dual)}`}
        </Tex>
        {kname === 'linear' && (
          <Tex display>
            {Math.hypot(w[0], w[1]) < 1e-3
              ? R`\mathbf w=\sum_i\alpha_iy_i\mathbf x_i\approx\mathbf 0:\ \text{no line helps, so the SVM predicts one class everywhere}\ (f\approx b)`
              : R`\mathbf w=\sum_i\alpha_iy_i\mathbf x_i=(${num(w[0])},\,${num(w[1])}),\qquad\text{geometric margin }\frac{1}{\lVert\mathbf w\rVert}=${num(1 / Math.hypot(w[0], w[1]))}`}
          </Tex>
        )}
        <Tex display>
          {R`f(\mathbf x_q)=f(${num(q[0], 2)},\,${num(q[1], 2)})=${num(fq)}\ \Rightarrow\ \text{class }${fq >= 0 ? '\\text{teal}\\ (+1)' : '\\text{orange}\\ (-1)'}`}
        </Tex>
      </div>
      <p className="w-hint">
        <P>{hint}</P>
      </p>
    </div>
  );
}

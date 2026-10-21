// Bagging and random forests on the same noisy wave data as DecisionTreeExplorer (slides L3 20 to 29).
// Each tree is grown to purity on a bootstrap sample. Bagging considers both features at every split (m = d = 2);
// the random forest draws one feature at random per split (m = 1 < d). The forest averages the leaf values
// c_k(x) of K trees; the out-of-bag (OOB) estimate uses, for each training point, only the trees that never saw it.
import { useMemo, useState } from 'react';
import { P, R, Tex } from 'principia';
import { num, rng } from './linalg';
import { boundary, bootstrap, grow, makeData, route, type Pt } from './trees';
import './widgets.css';

const N_TRAIN = 200;
const N_TEST = 1000;
const K_MAX = 50;
const G = 40; // grid cells per side for the probability map
const S = 300;
const PAD = 22;
const px = (v: number) => PAD + v * (S - 2 * PAD);
const py = (v: number) => S - PAD - v * (S - 2 * PAD);
const CW = 300;
const CH = 236;

type Mode = 'bag' | 'rf';

// Expected test error (noisy labels) of the average of the first K trees, K = 1..50, averaged over 20 independent
// training samples of N = 200 points with 10% label noise. Computed once with this file's own tree code.
const BAG_AVG = [0.238, 0.227, 0.203, 0.198, 0.190, 0.188, 0.184, 0.183, 0.180, 0.181, 0.179, 0.179, 0.176, 0.176, 0.175, 0.175, 0.174, 0.175, 0.173, 0.174, 0.172, 0.172, 0.170, 0.172, 0.170, 0.171, 0.170, 0.171, 0.170, 0.171, 0.170, 0.171, 0.170, 0.170, 0.169, 0.170, 0.169, 0.170, 0.170, 0.170, 0.169, 0.169, 0.169, 0.169, 0.169, 0.168, 0.168, 0.168, 0.168, 0.168];
const RF_AVG = [0.240, 0.239, 0.198, 0.197, 0.183, 0.183, 0.178, 0.178, 0.176, 0.176, 0.172, 0.172, 0.170, 0.170, 0.170, 0.171, 0.168, 0.168, 0.167, 0.167, 0.165, 0.165, 0.164, 0.164, 0.165, 0.165, 0.164, 0.164, 0.163, 0.163, 0.162, 0.163, 0.163, 0.163, 0.162, 0.162, 0.163, 0.162, 0.162, 0.162, 0.162, 0.161, 0.161, 0.161, 0.161, 0.161, 0.161, 0.161, 0.161, 0.161];

function forest(train: Pt[], test: Pt[], mode: Mode, seed: number) {
  // a separate random stream from the one that generated the data (same seed would correlate the draws with the points)
  const u = rng((seed * 2654435761 + (mode === 'rf' ? 0x5bd1e995 : 0x27d4eb2f)) >>> 0);
  const grid: number[][] = []; // grid[k][cell]
  const onTest: number[][] = [];
  const onTrain: number[][] = [];
  const oob: Uint8Array[] = [];
  for (let k = 0; k < K_MAX; k++) {
    const { idx, oob: out } = bootstrap(train.length, u);
    const t = grow(
      idx.map((i) => train[i]),
      { maxDepth: 20, features: mode === 'rf' ? () => [u() < 0.5 ? 0 : 1] : undefined },
    );
    const f = (x: number, y: number) => route(t, x, y).leaf.c;
    const g: number[] = [];
    for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) g.push(f((c + 0.5) / G, (r + 0.5) / G));
    grid.push(g);
    onTest.push(test.map((p) => f(p.x, p.y)));
    onTrain.push(train.map((p) => f(p.x, p.y)));
    const m = new Uint8Array(train.length);
    out.forEach((i) => (m[i] = 1));
    oob.push(m);
  }
  // test error and OOB error of the average of the first K trees, for K = 1..K_MAX
  const testErr: number[] = [];
  const oobErr: number[] = [];
  const sumT = new Array<number>(test.length).fill(0);
  const sumO = new Array<number>(train.length).fill(0);
  const cntO = new Array<number>(train.length).fill(0);
  for (let k = 0; k < K_MAX; k++) {
    let wrong = 0;
    test.forEach((p, i) => {
      sumT[i] += onTest[k][i];
      if ((sumT[i] / (k + 1) >= 0.5 ? 1 : 0) !== p.a) wrong++;
    });
    testErr.push(wrong / test.length);
    let w = 0;
    let n = 0;
    train.forEach((p, i) => {
      if (oob[k][i]) {
        sumO[i] += onTrain[k][i];
        cntO[i]++;
      }
      if (cntO[i] > 0) {
        n++;
        if ((sumO[i] / cntO[i] >= 0.5 ? 1 : 0) !== p.a) w++;
      }
    });
    oobErr.push(n ? w / n : NaN);
  }
  return { grid, testErr, oobErr, oob };
}

export default function ForestAverager() {
  const [K, setK] = useState(1);
  const [mode, setMode] = useState<Mode>('rf');
  const [seed, setSeed] = useState(8);

  const { train, bag, rf } = useMemo(() => {
    const train = makeData(N_TRAIN, seed);
    const test = makeData(N_TEST, seed * 7919 + 3);
    return { train, bag: forest(train, test, 'bag', seed), rf: forest(train, test, 'rf', seed) };
  }, [seed]);
  const F = mode === 'rf' ? rf : bag;

  const avg = useMemo(() => {
    const a = new Array<number>(G * G).fill(0);
    for (let k = 0; k < K; k++) F.grid[k].forEach((v, i) => (a[i] += v / K));
    return a;
  }, [F, K]);

  const cx = (k: number) => 34 + ((k - 1) / (K_MAX - 1)) * (CW - 48);
  const ymin = 0.08;
  const ymax = 0.34;
  const cy = (e: number) => CH - 40 - ((Math.min(ymax, Math.max(ymin, e)) - ymin) / (ymax - ymin)) * (CH - 60);
  const line = (arr: number[]) =>
    arr
      .map((e, i) => (Number.isNaN(e) ? null : `${cx(i + 1).toFixed(1)},${cy(e).toFixed(1)}`))
      .filter(Boolean)
      .join(' ');
  const oobCount = F.oob[0].reduce((s, v) => s + v, 0);
  const avgK = R`\text{average over 20 samples: bagging }${num(BAG_AVG[K - 1])},\ \text{random forest }${num(RF_AVG[K - 1])}`;

  const hint =
    K === 1
      ? R`One fully grown tree: a blocky map with small islands around single noisy points (high variance). Raise $K$ to average more bootstrapped trees.`
      : K < 10
        ? R`The average of ${K} trees is already smoother: islands that only some trees grow are voted down, and the error falls quickly at first.`
        : mode === 'rf'
          ? R`Each split of a random-forest tree may only use one randomly drawn feature, so the trees differ more (lower $\rho$). Averaging removes the $\frac{1-\rho}{K}$ part of the variance, so a smaller $\rho$ leaves a lower floor.`
          : R`Bagged trees all pick the best split among both features, so they stay similar (larger $\rho$). After about 10 trees the error hardly changes: $\operatorname{Var}[\bar f]=\sigma^2\big[\rho+\frac{1-\rho}{K}\big]\to\rho\,\sigma^2$.`;

  return (
    <div className="w-box">
      <p className="w-title">Average a forest of trees</p>
      <div className="w-grid">
        <svg className="w-plot" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Forest probability map">
          {avg.map((p, i) => {
            const c = i % G;
            const r = Math.floor(i / G);
            return (
              <rect
                key={i}
                x={px(c / G)}
                y={py((r + 1) / G)}
                width={(S - 2 * PAD) / G}
                height={(S - 2 * PAD) / G}
                shapeRendering="crispEdges"
                fill={p >= 0.5 ? 'var(--teal)' : 'var(--orange)'}
                fillOpacity={0.06 + 0.42 * Math.abs(p - 0.5) * 2}
              />
            );
          })}
          <polyline
            points={Array.from({ length: 61 }, (_, i) => `${px(i / 60).toFixed(1)},${py(boundary(i / 60)).toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--ink-2)"
            strokeDasharray="5 4"
          />
          {train.map((p, i) => (
            <circle key={i} cx={px(p.x)} cy={py(p.y)} r={2.4} fill={p.a ? 'var(--teal)' : 'none'} stroke={p.a ? 'var(--teal)' : 'var(--orange)'} strokeWidth={1.4} />
          ))}
          <rect x={px(0)} y={py(1)} width={S - 2 * PAD} height={S - 2 * PAD} fill="none" stroke="var(--rule)" />
          <text className="tick" x={S - PAD} y={S - 6} textAnchor="end">
            x₁
          </text>
          <text className="tick" x={4} y={PAD - 6}>
            x₂
          </text>
        </svg>
        <svg className="w-plot" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label="Test and out-of-bag error against the number of trees">
          <line className="axis" x1={cx(1)} y1={cy(ymin)} x2={cx(K_MAX)} y2={cy(ymin)} />
          <line className="axis" x1={cx(1)} y1={cy(ymin)} x2={cx(1)} y2={cy(ymax)} />
          {[0.1, 0.15, 0.2, 0.25, 0.3].map((v) => (
              <text key={v} className="tick" x={cx(1) - 6} y={cy(v) + 4} textAnchor="end">
                {num(v, 2)}
              </text>
            ))}
          {[1, 10, 20, 30, 40, 50].map((k) => (
            <text key={k} className="tick" x={cx(k)} y={CH - 24} textAnchor="middle">
              {k}
            </text>
          ))}
          <line x1={cx(K)} y1={cy(ymin)} x2={cx(K)} y2={cy(ymax)} stroke="var(--pink)" strokeDasharray="3 3" />
          <line x1={cx(1)} y1={cy(0.1)} x2={cx(K_MAX)} y2={cy(0.1)} stroke="var(--ink-2)" strokeDasharray="2 4" />
          <text className="tick" x={cx(K_MAX)} y={cy(0.1) - 5} textAnchor="end">
            label noise 0.1
          </text>
          <polyline points={line(F.testErr)} fill="none" stroke={mode === 'rf' ? 'var(--teal)' : 'var(--orange)'} strokeWidth={1} strokeOpacity={0.55} />
          <polyline points={line(F.oobErr)} fill="none" stroke="var(--purple)" strokeWidth={1.4} strokeDasharray="4 3" />
          <polyline points={line(BAG_AVG)} fill="none" stroke="var(--orange)" strokeWidth={2.4} />
          <polyline points={line(RF_AVG)} fill="none" stroke="var(--teal)" strokeWidth={2.4} />
          <text className="tick" x={CW - 8} y={22} textAnchor="end" style={{ fill: 'var(--orange)' }}>
            bagging (average of 20 samples)
          </text>
          <text className="tick" x={CW - 8} y={36} textAnchor="end" style={{ fill: 'var(--teal)' }}>
            random forest (average of 20 samples)
          </text>
          <text className="tick" x={CW - 8} y={50} textAnchor="end" style={{ fill: 'var(--purple)' }}>
            this sample: test (thin), OOB (dashed)
          </text>
          <text className="tick" x={(cx(1) + cx(K_MAX)) / 2} y={CH - 4} textAnchor="middle">
            number of trees K
          </text>
        </svg>
      </div>
      <div className="w-row">
        <label>
          <Tex>{R`K`}</Tex>{' '}
          <input type="range" min={1} max={K_MAX} step={1} value={K} onChange={(e) => setK(Number(e.target.value))} />
        </label>
        <label>
          split features{' '}
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="bag">bagging: both features (m = d = 2)</option>
            <option value="rf">random forest: one at random (m = 1)</option>
          </select>
        </label>
        <button type="button" onClick={() => setSeed((s) => Math.floor(rng(s)() * 1e6))}>
          new training sample
        </button>
      </div>
      <div className="w-readout">
        <Tex display>
          {R`p_A(\mathbf x)=\frac1K\sum_{k=1}^{K}c_k(\mathbf x),\quad K=${K}:\quad\text{this sample: }E_{\text{test}}^{\text{bag}}=${num(bag.testErr[K - 1])},\ E_{\text{test}}^{\text{RF}}=${num(rf.testErr[K - 1])},\ E_{\text{OOB}}=${Number.isNaN(F.oobErr[K - 1]) ? '\\text{n/a}' : num(F.oobErr[K - 1])}`}
        </Tex>
        <Tex display>
          {avgK}
        </Tex>
        <Tex display>
          {R`\text{tree }1:\ ${oobCount}\text{ of }${N_TRAIN}\text{ points out of bag}\ \big(\approx0.368N=${num(0.368 * N_TRAIN, 1)}\big),\qquad\operatorname{Var}[\bar f]=\sigma^2\Big[\rho+\frac{1-\rho}{${K}}\Big]`}
        </Tex>
      </div>
      <p className="w-hint">
        <P>{hint}</P>
      </p>
      <p className="w-hint">
        <P>{R`Shading: the forest's probability of class A (teal) or B (orange); the colour switches where $p_A=0.5$. Dashed grey: the true boundary. The dashed purple OOB curve needs no test set: each training point is judged only by the trees whose bootstrap sample left it out (about 37% of them). It is computed from just 200 points, so it wobbles around the test error from sample to sample.`}</P>
      </p>
    </div>
  );
}

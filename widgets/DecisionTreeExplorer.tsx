// Grow a classification tree one level at a time on 60 noisy training points and watch the partition, the
// path feature of a chosen point, and the training / validation error against depth (slides L3 7 to 12).
// Splits maximise information gain; each leaf stores c = fraction of class A, and predicts A when c >= 0.5.
import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { P, R, Tex } from 'principia';
import { num, rng } from './linalg';
import { boundary, cells, err, grow, leaves, makeData, route, type Node } from './trees';
import './widgets.css';

const N_TRAIN = 60;
const N_VAL = 400;
const MAX_D = 10;
const S = 300; // plot size in px
const PAD = 22;
const px = (v: number) => PAD + v * (S - 2 * PAD);
const py = (v: number) => S - PAD - v * (S - 2 * PAD);
const CW = 300;
const CH = 236;

export default function DecisionTreeExplorer() {
  const [depth, setDepth] = useState(2);
  const [seed, setSeed] = useState(7);
  const [q, setQ] = useState({ x: 0.3, y: 0.62 });
  const [truth, setTruth] = useState(true);
  const svg = useRef<SVGSVGElement>(null);

  const { train, val, trees, curve } = useMemo(() => {
    const train = makeData(N_TRAIN, seed);
    const val = makeData(N_VAL, seed * 7919 + 1);
    const trees: Node[] = Array.from({ length: MAX_D + 1 }, (_, d) => grow(train, { maxDepth: d }));
    const curve = trees.map((t) => ({
      tr: err((x, y) => route(t, x, y).leaf.c, train),
      va: err((x, y) => route(t, x, y).leaf.c, val),
      L: leaves(t).length,
    }));
    return { train, val, trees, curve };
  }, [seed]);

  const tree = trees[depth];
  const cur = curve[depth];
  const best = curve.reduce((b, c, d) => (c.va < curve[b].va ? d : b), 0);
  const { leaf, tests } = route(tree, q.x, q.y);

  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const vx = (((e.clientX - box.left) / box.width) * S - PAD) / (S - 2 * PAD);
    const vy = (S - PAD - ((e.clientY - box.top) / box.height) * S) / (S - 2 * PAD);
    setQ({ x: Math.min(1, Math.max(0, Number(vx.toFixed(2)))), y: Math.min(1, Math.max(0, Number(vy.toFixed(2)))) });
  };

  // the path feature written out as a product of indicators
  const ind = tests.map((t) => R`\mathbb 1[x_{${t.j + 1}}${t.lt ? '<' : '\\ge'}${num(t.theta, 2)}]`);
  const phiTex = tests.length
    ? R`\phi_\ell(\mathbf x)=${ind.join('\\,')}=1`
    : R`\phi_\ell(\mathbf x)=1\ \ (\text{depth }0:\ \text{one leaf, no tests})`;
  const label = leaf.c >= 0.5 ? 'A' : 'B';

  // error-curve chart
  const cx = (d: number) => 34 + (d / MAX_D) * (CW - 48);
  const ymax = Math.max(0.5, ...curve.map((c) => c.va));
  const cy = (e: number) => CH - 40 - (e / ymax) * (CH - 60);
  const line = (k: 'tr' | 'va') => curve.map((c, d) => `${cx(d).toFixed(1)},${cy(c[k]).toFixed(1)}`).join(' ');

  const hint =
    depth === 0
      ? R`Depth 0 predicts the majority class everywhere: both errors are large (underfitting).`
      : depth > 0 && cur.L === curve[depth - 1].L
        ? R`Nothing changed from depth ${depth - 1}: every leaf is pure (all A or all B), so there is no split with positive information gain left. $E_{\text{train}}=${num(cur.tr)}$, $E_{\text{val}}=${num(cur.va)}$; the best validation depth was ${best}.`
      : cur.tr === 0
        ? R`Every training point is now classified correctly ($E_{\text{train}}=0$), but the extra leaves isolate single noisy points. Validation error is above its best value (depth ${best}): this tree has overfitted, and pruning would merge those leaves back.`
        : depth < best
          ? R`Each extra level lowers $E_{\text{train}}$, and here $E_{\text{val}}$ still falls too: the tree is still learning the shape of the wave.`
          : depth === best
            ? R`This depth has the lowest validation error: the sweet spot between underfitting and overfitting.`
            : R`Training error keeps falling with depth, validation error has started to rise: the gap $E_{\text{val}}-E_{\text{train}}$ grows.`;

  return (
    <div className="w-box">
      <p className="w-title">Grow a decision tree</p>
      <div className="w-grid">
        <svg ref={svg} className="w-plot" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Tree partition of the input plane" onPointerDown={onPointer}>
          {cells(tree).map(({ box, leaf: lf }, i) => (
            <rect
              key={i}
              x={px(box.x0)}
              y={py(box.y1)}
              width={px(box.x1) - px(box.x0)}
              height={py(box.y0) - py(box.y1)}
              fill={lf.c >= 0.5 ? 'var(--teal)' : 'var(--orange)'}
              fillOpacity={0.08 + 0.3 * Math.abs(lf.c - 0.5) * 2}
              stroke={lf === leaf ? 'var(--pink)' : 'var(--rule)'}
              strokeWidth={lf === leaf ? 2 : 1}
            />
          ))}
          {truth && (
            <polyline
              points={Array.from({ length: 61 }, (_, i) => `${px(i / 60).toFixed(1)},${py(boundary(i / 60)).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="var(--ink-2)"
              strokeDasharray="5 4"
            />
          )}
          {train.map((p, i) => (
            <circle
              key={i}
              cx={px(p.x)}
              cy={py(p.y)}
              r={3.6}
              fill={p.a ? 'var(--teal)' : 'none'}
              stroke={p.a ? 'var(--teal)' : 'var(--orange)'}
              strokeWidth={1.6}
            />
          ))}
          <path d={`M${px(q.x) - 7},${py(q.y)}h14M${px(q.x)},${py(q.y) - 7}v14`} stroke="var(--pink)" strokeWidth={2.4} />
          <text className="tick" x={S - PAD} y={S - 6} textAnchor="end">
            x₁
          </text>
          <text className="tick" x={4} y={PAD - 6}>
            x₂
          </text>
        </svg>
        <svg className="w-plot" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label="Training and validation error against depth">
          <line className="axis" x1={cx(0)} y1={cy(0)} x2={cx(MAX_D)} y2={cy(0)} />
          <line className="axis" x1={cx(0)} y1={cy(0)} x2={cx(0)} y2={cy(ymax)} />
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5].filter((v) => v <= ymax).map((v) => (
            <text key={v} className="tick" x={cx(0) - 6} y={cy(v) + 4} textAnchor="end">
              {v}
            </text>
          ))}
          {Array.from({ length: MAX_D + 1 }, (_, d) => (
            <text key={d} className="tick" x={cx(d)} y={CH - 24} textAnchor="middle">
              {d}
            </text>
          ))}
          <line x1={cx(depth)} y1={cy(0)} x2={cx(depth)} y2={cy(ymax)} stroke="var(--pink)" strokeDasharray="3 3" />
          <polyline points={line('tr')} fill="none" stroke="var(--teal)" strokeWidth={2} />
          <polyline points={line('va')} fill="none" stroke="var(--red)" strokeWidth={2} />
          <circle cx={cx(best)} cy={cy(curve[best].va)} r={4} fill="var(--red)" />
          <text className="tick" x={CW - 8} y={cy(curve[MAX_D].tr) - 6} textAnchor="end" style={{ fill: 'var(--teal)' }}>
            training
          </text>
          <text className="tick" x={CW - 8} y={cy(curve[MAX_D].va) - 6} textAnchor="end" style={{ fill: 'var(--red)' }}>
            validation
          </text>
          <text className="tick" x={(cx(0) + cx(MAX_D)) / 2} y={CH - 4} textAnchor="middle">
            depth
          </text>
        </svg>
      </div>
      <div className="w-row">
        <label>
          depth{' '}
          <input type="range" min={0} max={MAX_D} step={1} value={depth} onChange={(e) => setDepth(Number(e.target.value))} />
        </label>
        <label>
          <input type="checkbox" checked={truth} onChange={(e) => setTruth(e.target.checked)} /> true boundary
        </label>
        <button type="button" onClick={() => setSeed((s) => Math.floor(rng(s)() * 1e6))}>
          new training sample
        </button>
      </div>
      <div className="w-readout">
        <Tex display>
          {R`\text{depth}=${depth},\quad L=${cur.L}\ \text{leaves},\quad E_{\text{train}}=${num(cur.tr)}\ (N=${N_TRAIN}),\quad E_{\text{val}}=${num(cur.va)}\ (N=${N_VAL})`}
        </Tex>
        <Tex display>{R`\mathbf x=(${num(q.x, 2)},\,${num(q.y, 2)}):\quad ${phiTex}`}</Tex>
        <Tex display>
          {R`f(\mathbf x)=\mathbf c^\top\boldsymbol\phi(\mathbf x)=c_\ell=\tfrac{${leaf.nA}}{${leaf.n}}=${num(leaf.c)}\ \Rightarrow\ \text{predict ${label}}`}
        </Tex>
      </div>
      <p className="w-hint">
        <P>{hint}</P>
      </p>
      <p className="w-hint">
        <P>{R`Filled teal: class A, open orange: class B (10% of labels are flipped at random). Shading: the leaf value $c_\ell$, the fraction of A among the leaf's training points. Click the plot to move the query point (pink cross); its leaf is outlined, and exactly one $\phi_\ell$ is 1.`}</P>
      </p>
    </div>
  );
}

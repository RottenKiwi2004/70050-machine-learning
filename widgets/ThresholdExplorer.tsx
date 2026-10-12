// Sweep the decision threshold tau on twelve scored held-out examples and watch the confusion matrix,
// precision, recall and F1 change, together with the operating point on the ROC curve (slides L2 121 to 138).
import { useState } from 'react';
import { P, R, Tex } from 'principia';
import { num } from './linalg';
import './widgets.css';

// predicted class-1 probabilities with their true labels (1 = positive)
const DATA: { p: number; y: 0 | 1 }[] = [
  { p: 0.97, y: 1 },
  { p: 0.91, y: 1 },
  { p: 0.84, y: 0 },
  { p: 0.78, y: 1 },
  { p: 0.66, y: 1 },
  { p: 0.58, y: 0 },
  { p: 0.52, y: 1 },
  { p: 0.41, y: 0 },
  { p: 0.33, y: 1 },
  { p: 0.24, y: 0 },
  { p: 0.15, y: 0 },
  { p: 0.06, y: 0 },
];
const NPOS = DATA.filter((d) => d.y === 1).length;
const NNEG = DATA.length - NPOS;

function counts(tau: number) {
  let tp = 0;
  let fp = 0;
  for (const d of DATA) {
    if (d.p >= tau) {
      if (d.y === 1) tp++;
      else fp++;
    }
  }
  return { tp, fp, fn: NPOS - tp, tn: NNEG - fp };
}

// ROC: one point per distinct threshold, from "flag nothing" to "flag everything"
const thresholds = [1.01, ...DATA.map((d) => d.p), 0];
const ROC = thresholds.map((t) => {
  const c = counts(t);
  return { fpr: c.fp / NNEG, tpr: c.tp / NPOS };
});
// AUC as the fraction of positive-negative pairs ranked correctly (no ties in DATA)
const AUC =
  DATA.filter((a) => a.y === 1).reduce((s, a) => s + DATA.filter((b) => b.y === 0 && a.p > b.p).length, 0) / (NPOS * NNEG);

const S = 220;
const PAD = 26;
const rx = (v: number) => PAD + v * (S - 2 * PAD);
const ry = (v: number) => S - PAD - v * (S - 2 * PAD);

export default function ThresholdExplorer() {
  const [tau, setTau] = useState(0.5);
  const c = counts(tau);
  const prec = c.tp + c.fp > 0 ? c.tp / (c.tp + c.fp) : NaN;
  const rec = c.tp / NPOS;
  const f1 = (2 * c.tp) / (2 * c.tp + c.fp + c.fn);
  const fpr = c.fp / NNEG;
  const acc = (c.tp + c.tn) / DATA.length;

  const hint =
    tau > 0.9
      ? R`A very high $\tau$ flags almost nothing: few false alarms, but most positives are missed (low recall).`
      : tau < 0.12
        ? R`A very low $\tau$ flags almost everything: recall is high, precision falls towards the share of positives ($0.5$).`
        : R`Moving $\tau$ trades false positives against false negatives. If a missed positive costs 10 times a false alarm, the cost rule gives $\tau=1/11\approx0.09$.`;

  return (
    <div className="w-box">
      <p className="w-title">Sweep the threshold</p>
      <div className="w-grid">
        <svg className="w-plot" viewBox={`0 0 360 ${S}`} role="img" aria-label="Scored examples and the threshold">
          <line className="axis" x1={20} y1={S / 2} x2={340} y2={S / 2} />
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text key={v} className="tick" x={20 + v * 320} y={S / 2 + 34} textAnchor="middle">
              {v}
            </text>
          ))}
          <line x1={20 + tau * 320} y1={30} x2={20 + tau * 320} y2={S - 40} stroke="var(--red)" strokeWidth={2} />
          <text className="tick" x={20 + tau * 320 + 4} y={28}>
            τ
          </text>
          {DATA.map((d, i) => (
            <circle
              key={i}
              cx={20 + d.p * 320}
              cy={S / 2 + (d.y === 1 ? -14 : 14)}
              r={6}
              fill={d.y === 1 ? 'var(--teal)' : 'none'}
              stroke={d.y === 1 ? 'var(--teal)' : 'var(--orange)'}
              strokeWidth={2}
            />
          ))}
          <text className="tick" x={20} y={20}>
            filled: actual 1 · open: actual 0 · right of τ: predicted 1
          </text>
        </svg>
        <svg className="w-plot" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="ROC curve with the current operating point">
          <line className="axis" x1={rx(0)} y1={ry(0)} x2={rx(1)} y2={ry(0)} />
          <line className="axis" x1={rx(0)} y1={ry(0)} x2={rx(0)} y2={ry(1)} />
          <line x1={rx(0)} y1={ry(0)} x2={rx(1)} y2={ry(1)} stroke="var(--rule)" strokeDasharray="4 4" />
          <polyline points={ROC.map((p) => `${rx(p.fpr)},${ry(p.tpr)}`).join(' ')} fill="none" stroke="var(--purple)" strokeWidth={2} />
          <circle cx={rx(fpr)} cy={ry(rec)} r={5} fill="var(--red)" />
          <text className="tick" x={rx(0.5)} y={S - 6} textAnchor="middle">
            FPR
          </text>
          <text className="tick" x={6} y={ry(0.5)}>
            TPR
          </text>
        </svg>
      </div>
      <div className="w-row">
        <label>
          <Tex>{R`\tau`}</Tex>{' '}
          <input type="range" min={0} max={1} step={0.01} value={tau} onChange={(e) => setTau(Number(e.target.value))} />
        </label>
      </div>
      <div className="w-readout">
        <Tex display>
          {R`\tau=${num(tau, 2)}:\quad TP=${c.tp},\ FN=${c.fn},\ FP=${c.fp},\ TN=${c.tn};\qquad \text{Acc}=${num(acc)},\ \text{Prec}=${Number.isNaN(prec) ? '\\text{undefined}' : num(prec)},\ \text{Rec}=TPR=${num(rec)},\ FPR=${num(fpr)},\ F_1=${num(f1)}`}
        </Tex>
        <Tex display>{R`\text{AUC}=P(s_+>s_-)=${num(AUC)}\ \ (\text{the same for every }\tau)`}</Tex>
      </div>
      <p className="w-hint">
        <P>{hint}</P>
      </p>
    </div>
  );
}

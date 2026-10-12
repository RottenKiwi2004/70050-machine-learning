// Gradient descent on the slide-40 bowl L(w) = 1/2 (w1^2 + k w2^2), with a dial for the learning rate.
// k = 2 is the lecture's example; k = 10 is a narrow valley (slides L2 49 to 50). Click the plot to move the start.
// Each coordinate is multiplied by its own factor per step: (1 - eta) for w1 and (1 - k eta) for w2.
import { useRef, useState, type PointerEvent } from 'react';
import { P, R, Tex } from 'principia';
import { num } from './linalg';
import './widgets.css';

const W = 420;
const H = 300;
const SPAN_X = 2.6;
const SPAN_Y = (SPAN_X * H) / W;
const sx = (x: number) => W / 2 + (x / SPAN_X) * (W / 2);
const sy = (y: number) => H / 2 - (y / SPAN_Y) * (H / 2);
const ux = (px: number) => ((px - W / 2) / (W / 2)) * SPAN_X;
const uy = (py: number) => -((py - H / 2) / (H / 2)) * SPAN_Y;
const clip = (v: number, m: number) => Math.max(-m, Math.min(m, v));

export default function GradientDescent() {
  const [eta, setEta] = useState(0.3);
  const [k, setK] = useState(2);
  const [steps, setSteps] = useState(10);
  const [start, setStart] = useState({ x: -2, y: 1.8 });
  const svg = useRef<SVGSVGElement>(null);

  const loss = (x: number, y: number) => 0.5 * (x * x + k * y * y);
  const path = [start];
  for (let t = 0; t < steps; t++) {
    const p = path[path.length - 1];
    path.push({ x: (1 - eta) * p.x, y: (1 - k * eta) * p.y });
  }
  const last = path[path.length - 1];
  const r1 = 1 - eta;
  const r2 = 1 - k * eta;
  const diverges = Math.abs(r2) > 1 || Math.abs(r1) > 1;

  // contour ellipses: L = c  <=>  w1^2/(2c) + w2^2/(2c/k) = 1
  const levels = [0.25, 0.75, 1.5, 2.5, 4, 6];

  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * W;
    const py = ((e.clientY - box.top) / box.height) * H;
    setStart({ x: Number(ux(px).toFixed(2)), y: Number(uy(py).toFixed(2)) });
  };

  const hint = diverges
    ? R`A factor has size above 1: the iterates grow every step. Here $\eta>2/k$, so the steep $w_2$ direction diverges.`
    : r2 < 0
      ? R`$1-k\eta<0$: $w_2$ flips sign every step (zig-zag across the valley) while $w_1$ creeps along it.`
      : eta * k > 0.9 && eta * k <= 1.1 && k > 2
        ? R`$\eta\approx1/k$: $w_2$ is fixed almost at once, but $w_1$ shrinks only by $1-\eta$ per step. One rate cannot suit both directions.`
        : R`Both factors are between 0 and 1: smooth, monotone descent towards the minimum.`;

  return (
    <div className="w-box">
      <p className="w-title">Gradient descent on a bowl</p>
      <svg
        ref={svg}
        className="w-plot"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Contours of the loss and the gradient-descent path"
        onPointerDown={onPointer}
      >
        <line className="axis" x1={0} y1={sy(0)} x2={W} y2={sy(0)} />
        <line className="axis" x1={sx(0)} y1={0} x2={sx(0)} y2={H} />
        {levels.map((c) => (
          <ellipse
            key={c}
            cx={sx(0)}
            cy={sy(0)}
            rx={(Math.sqrt(2 * c) / SPAN_X) * (W / 2)}
            ry={(Math.sqrt((2 * c) / k) / SPAN_Y) * (H / 2)}
            fill="none"
            stroke="var(--rule)"
          />
        ))}
        <polyline
          points={path.map((p) => `${sx(clip(p.x, 9)).toFixed(1)},${sy(clip(p.y, 9)).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="var(--orange)"
          strokeWidth={2}
        />
        {path.map((p, i) => (
          <circle key={i} cx={sx(clip(p.x, 9))} cy={sy(clip(p.y, 9))} r={i === 0 ? 5 : 3} fill={i === 0 ? 'var(--green)' : 'var(--orange)'} />
        ))}
        <circle cx={sx(0)} cy={sy(0)} r={4.5} fill="var(--red)" />
        <text className="tick" x={W - 22} y={sy(0) - 6}>
          w₁
        </text>
        <text className="tick" x={sx(0) + 6} y={12}>
          w₂
        </text>
      </svg>

      <div className="w-row">
        <label>
          <Tex>{R`\eta`}</Tex>{' '}
          <input type="range" min={0.02} max={1.2} step={0.01} value={eta} onChange={(e) => setEta(Number(e.target.value))} />
        </label>
        <label>
          steps{' '}
          <input type="range" min={1} max={40} step={1} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
        </label>
        <label>
          <Tex>{R`k`}</Tex>{' '}
          <select value={k} onChange={(e) => setK(Number(e.target.value))}>
            <option value={2}>2 (slide 40)</option>
            <option value={10}>10 (narrow valley)</option>
          </select>
        </label>
      </div>
      <div className="w-readout">
        <Tex display>
          {R`L=\tfrac12(w_1^2+${k}w_2^2),\quad 1-\eta=${num(r1)},\quad 1-${k}\eta=${num(r2)},\quad \mathbf w_{${steps}}=(${num(last.x)},\,${num(last.y)}),\quad L=${num(loss(last.x, last.y))}`}
        </Tex>
      </div>
      <p className={diverges ? 'w-hint w-warn' : 'w-hint'}>
        <P>{hint}</P>
      </p>
      <p className="w-hint">
        <P>{R`Click the plot to move the start (green). A Newton step would land on the red minimum in one move, because $H=\operatorname{diag}(1,k)$ rescales each direction.`}</P>
      </p>
    </div>
  );
}

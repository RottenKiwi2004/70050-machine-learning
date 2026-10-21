// Classification trees for the Lecture 3 widgets (DecisionTreeExplorer, ForestAverager). Plain TypeScript.
// Splits are axis-aligned tests x_j < theta chosen by information gain (entropy), as in Lecture 2 file 25 and
// Lecture 3 file 34. A leaf stores c = the fraction of class A among its training cases.
import { rng } from './linalg';

export type Pt = { x: number; y: number; a: 0 | 1 }; // a = 1: class A, a = 0: class B
export type Test = { j: 0 | 1; theta: number; lt: boolean }; // x_j < theta (lt) or x_j >= theta
export type Node =
  | { leaf: true; c: number; n: number; nA: number; id: number }
  | { leaf: false; j: 0 | 1; theta: number; left: Node; right: Node; n: number; nA: number; gain: number };

/** The true boundary: class A above a wave. Points are drawn uniformly, then a fraction `noise` of labels flip. */
export const boundary = (x: number) => 0.5 + 0.22 * Math.sin(2 * Math.PI * (x - 0.1));

export function makeData(n: number, seed: number, noise = 0.1): Pt[] {
  const u = rng(seed);
  return Array.from({ length: n }, () => {
    const x = u();
    const y = u();
    let a: 0 | 1 = y > boundary(x) ? 1 : 0;
    if (u() < noise) a = (1 - a) as 0 | 1;
    return { x, y, a };
  });
}

/** Binary entropy in bits, with 0 log 0 = 0 (identity I80). */
export const H2 = (p: number) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));

const coord = (p: Pt, j: 0 | 1) => (j === 0 ? p.x : p.y);

export type GrowOpts = { maxDepth: number; minLeaf?: number; features?: (depth: number) => (0 | 1)[] };

/** Greedy top-down growth. `features` returns the candidate features at a node (random forests pass one at random). */
export function grow(pts: Pt[], opts: GrowOpts, depth = 0, counter = { id: 0 }): Node {
  const n = pts.length;
  const nA = pts.reduce((s, p) => s + p.a, 0);
  const c = n ? nA / n : 0.5;
  const minLeaf = opts.minLeaf ?? 1;
  if (depth >= opts.maxDepth || nA === 0 || nA === n || n < 2 * minLeaf) return { leaf: true, c, n, nA, id: counter.id++ };
  const parentH = H2(c);
  let best: { j: 0 | 1; theta: number; gain: number } | null = null;
  for (const j of opts.features ? opts.features(depth) : ([0, 1] as (0 | 1)[])) {
    const s = [...pts].sort((p, q) => coord(p, j) - coord(q, j));
    let leftA = 0;
    for (let i = 1; i < n; i++) {
      leftA += s[i - 1].a;
      const v0 = coord(s[i - 1], j);
      const v1 = coord(s[i], j);
      if (v1 - v0 < 1e-12 || i < minLeaf || n - i < minLeaf) continue;
      const gain = parentH - (i / n) * H2(leftA / i) - ((n - i) / n) * H2((nA - leftA) / (n - i));
      if (!best || gain > best.gain + 1e-12) best = { j, theta: (v0 + v1) / 2, gain };
    }
  }
  if (!best || best.gain <= 1e-12) return { leaf: true, c, n, nA, id: counter.id++ };
  const L = pts.filter((p) => coord(p, best!.j) < best!.theta);
  const Rr = pts.filter((p) => coord(p, best!.j) >= best!.theta);
  return {
    leaf: false,
    j: best.j,
    theta: best.theta,
    gain: best.gain,
    n,
    nA,
    left: grow(L, opts, depth + 1, counter),
    right: grow(Rr, opts, depth + 1, counter),
  };
}

/** The leaf reached by (x, y), with the tests passed on the way (the path feature phi_leaf = product of indicators). */
export function route(t: Node, x: number, y: number) {
  const tests: Test[] = [];
  let node = t;
  while (!node.leaf) {
    const v = node.j === 0 ? x : y;
    const lt = v < node.theta;
    tests.push({ j: node.j, theta: node.theta, lt });
    node = lt ? node.left : node.right;
  }
  return { leaf: node, tests };
}

export const prob = (t: Node, x: number, y: number) => route(t, x, y).leaf.c;

export function leaves(t: Node): Extract<Node, { leaf: true }>[] {
  return t.leaf ? [t] : [...leaves(t.left), ...leaves(t.right)];
}

/** Axis-aligned cells of the partition, for drawing: one rectangle per leaf. */
export function cells(t: Node, box = { x0: 0, x1: 1, y0: 0, y1: 1 }): { box: typeof box; leaf: Extract<Node, { leaf: true }> }[] {
  if (t.leaf) return [{ box, leaf: t }];
  const a = { ...box };
  const b = { ...box };
  if (t.j === 0) {
    a.x1 = t.theta;
    b.x0 = t.theta;
  } else {
    a.y1 = t.theta;
    b.y0 = t.theta;
  }
  return [...cells(t.left, a), ...cells(t.right, b)];
}

/** 0/1 error of the rule "predict A when p >= 0.5". */
export const err = (f: (x: number, y: number) => number, pts: Pt[]) =>
  pts.reduce((s, p) => s + ((f(p.x, p.y) >= 0.5 ? 1 : 0) !== p.a ? 1 : 0), 0) / pts.length;

/** A bootstrap sample: N draws with replacement, and the indices never drawn (out of bag). */
export function bootstrap(n: number, u: () => number) {
  const idx = Array.from({ length: n }, () => Math.floor(u() * n));
  const seen = new Uint8Array(n);
  idx.forEach((i) => (seen[i] = 1));
  const oob: number[] = [];
  for (let i = 0; i < n; i++) if (!seen[i]) oob.push(i);
  return { idx, oob };
}

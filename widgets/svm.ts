// A small kernel SVM solver for the Lecture 3 widgets. Plain TypeScript.
// It solves the dual of slide L3 122,  max sum(a) - 1/2 sum_ij a_i a_j y_i y_j k(x_i, x_j)  s.t. 0 <= a_i <= C, sum a_i y_i = 0,
// by SMO with the "maximal violating pair" choice (as in LIBSVM), and returns f(x) = sum_i a_i y_i k(x_i, x) + b.

export type Vec = [number, number];
export type Kernel = (u: Vec, v: Vec) => number;

export const linearK: Kernel = (u, v) => u[0] * v[0] + u[1] * v[1];
export const polyK = (p: number): Kernel => (u, v) => (u[0] * v[0] + u[1] * v[1] + 1) ** p;
export const rbfK = (sigma: number): Kernel => (u, v) => Math.exp(-((u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2) / (2 * sigma * sigma));

export function trainSVM(X: Vec[], y: number[], k: Kernel, C: number, eps = 1e-3, maxIter = 20000) {
  const n = X.length;
  const K = X.map((u) => X.map((v) => k(u, v)));
  const a = new Array<number>(n).fill(0);
  const G = new Array<number>(n).fill(-1); // gradient of 1/2 a'Qa - 1'a, Q_ij = y_i y_j K_ij
  let iter = 0;
  for (; iter < maxIter; iter++) {
    let i = -1;
    let j = -1;
    let gmax = -Infinity;
    let gmin = Infinity;
    for (let t = 0; t < n; t++) {
      const v = -y[t] * G[t];
      const up = (y[t] > 0 && a[t] < C) || (y[t] < 0 && a[t] > 0);
      const low = (y[t] < 0 && a[t] < C) || (y[t] > 0 && a[t] > 0);
      if (up && v > gmax) {
        gmax = v;
        i = t;
      }
      if (low && v < gmin) {
        gmin = v;
        j = t;
      }
    }
    if (i < 0 || j < 0 || gmax - gmin < eps) break;
    const ai = a[i];
    const aj = a[j];
    const Qij = y[i] * y[j] * K[i][j];
    if (y[i] !== y[j]) {
      let quad = K[i][i] + K[j][j] + 2 * Qij;
      if (quad <= 0) quad = 1e-12;
      const delta = (-G[i] - G[j]) / quad;
      const diff = a[i] - a[j];
      a[i] += delta;
      a[j] += delta;
      if (diff > 0) {
        if (a[j] < 0) {
          a[j] = 0;
          a[i] = diff;
        }
      } else if (a[i] < 0) {
        a[i] = 0;
        a[j] = -diff;
      }
      if (diff > 0) {
        if (a[i] > C) {
          a[i] = C;
          a[j] = C - diff;
        }
      } else if (a[j] > C) {
        a[j] = C;
        a[i] = C + diff;
      }
    } else {
      let quad = K[i][i] + K[j][j] - 2 * Qij;
      if (quad <= 0) quad = 1e-12;
      const delta = (G[i] - G[j]) / quad;
      const sum = a[i] + a[j];
      a[i] -= delta;
      a[j] += delta;
      if (sum > C) {
        if (a[i] > C) {
          a[i] = C;
          a[j] = sum - C;
        }
      } else if (a[j] < 0) {
        a[j] = 0;
        a[i] = sum;
      }
      if (sum > C) {
        if (a[j] > C) {
          a[j] = C;
          a[i] = sum - C;
        }
      } else if (a[i] < 0) {
        a[i] = 0;
        a[j] = sum;
      }
    }
    const di = a[i] - ai;
    const dj = a[j] - aj;
    for (let t = 0; t < n; t++) G[t] += y[t] * (y[i] * K[t][i] * di + y[j] * K[t][j] * dj);
  }
  // offset b = -rho, as in LIBSVM: the average of y_t G_t over the free coefficients
  let ub = Infinity;
  let lb = -Infinity;
  let sum = 0;
  let nFree = 0;
  for (let t = 0; t < n; t++) {
    const yG = y[t] * G[t];
    if (a[t] >= C - 1e-12) {
      if (y[t] < 0) ub = Math.min(ub, yG);
      else lb = Math.max(lb, yG);
    } else if (a[t] <= 1e-12) {
      if (y[t] > 0) ub = Math.min(ub, yG);
      else lb = Math.max(lb, yG);
    } else {
      sum += yG;
      nFree++;
    }
  }
  const b = -(nFree > 0 ? sum / nFree : (ub + lb) / 2);
  const sv = a.map((v, t) => (v > 1e-8 ? t : -1)).filter((t) => t >= 0);
  const f = (x: Vec) => sv.reduce((s, t) => s + a[t] * y[t] * k(X[t], x), 0) + b;
  let dual = 0;
  for (let s = 0; s < n; s++) {
    dual += a[s];
    for (let t = 0; t < n; t++) dual -= 0.5 * a[s] * a[t] * y[s] * y[t] * K[s][t];
  }
  return { alpha: a, b, sv, f, dual, iter };
}

/** Marching squares: line segments where the sampled field crosses `level`. vals[r][c] at grid vertex (c, r). */
export function contour(vals: number[][], level: number) {
  const segs: [number, number, number, number][] = [];
  const R = vals.length - 1;
  const Cn = vals[0].length - 1;
  const lerp = (a: number, b: number) => (level - a) / (b - a);
  for (let r = 0; r < R; r++)
    for (let c = 0; c < Cn; c++) {
      const v = [vals[r][c], vals[r][c + 1], vals[r + 1][c + 1], vals[r + 1][c]]; // corners: bl, br, tr, tl
      const pts: [number, number][] = [];
      const corner: [number, number][] = [
        [c, r],
        [c + 1, r],
        [c + 1, r + 1],
        [c, r + 1],
      ];
      for (let e = 0; e < 4; e++) {
        const a = v[e];
        const b = v[(e + 1) % 4];
        if ((a < level) !== (b < level)) {
          const t = lerp(a, b);
          const p = corner[e];
          const q = corner[(e + 1) % 4];
          pts.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
        }
      }
      if (pts.length === 2) segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
      if (pts.length === 4) {
        segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
        segs.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1]]);
      }
    }
  return segs;
}

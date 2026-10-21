import { R, con, ex, lab, shape, slide, tag, term, warn } from 'principia';
import type { Section, Topic } from 'principia';

const matrixEq = R`
\underbrace{\begin{bmatrix} y_1\\ y_2\\ \vdots\\ y_N \end{bmatrix}}_{\htmlClass{c-green}{N\times 1}}
=
\underbrace{\begin{bmatrix}
\htmlClass{c-red}{1} & x_{11} & \cdots & x_{1D}\\
\htmlClass{c-red}{1} & x_{21} & \cdots & x_{2D}\\
\vdots & \vdots & \ddots & \vdots\\
\htmlClass{c-red}{1} & x_{N1} & \cdots & x_{ND}
\end{bmatrix}}_{\htmlClass{c-green}{N\times (D+1)}}
\underbrace{\begin{bmatrix} \htmlClass{c-red}{w_0}\\ w_1\\ \vdots\\ w_D \end{bmatrix}}_{\htmlClass{c-green}{(D+1)\times 1}}
+
\underbrace{\begin{bmatrix} \varepsilon_1\\ \varepsilon_2\\ \vdots\\ \varepsilon_N \end{bmatrix}}_{\htmlClass{c-green}{N\times 1}}`;

const sections: Section[] = [
  {
    id: 'setup',
    title: 'Setup and shapes',
    why: R`Fitting a line to $N$ data points means $N$ separate equations, one per point. Stacking them gives the single equation $\mathbf y=X\mathbf w+\boldsymbol\varepsilon$, so every later step is matrix algebra whose shapes we can check.`,
    slides: [slide('I', 40, 'Linear regression in 2D (or ND)'), slide('I', 41, 'Linear regression: the matrix model')],
    display: matrixEq,
    pre: [
      lab(R`$N$ samples are the rows. $D$ features are the columns after the column of 1s.`),
      lab(R`Slide 40 is a figure only: with $D=2$ features the fitted model is a plane, and each residual is the vertical gap from a point to that plane.`),
      warn(R`The column of 1s multiplies $w_0$, so the intercept lives inside $X\mathbf w$.`),
    ],
    manim: 'MatrixShapes', // animations/regression.py: the shapes of y = Xw + e and of X^T X, as blocks
    rows: [
      {
        eq: R`\mathbf y = X\mathbf w + \boldsymbol\varepsilon`,
        notes: [
          lab('same equation, written compactly'),
          shape(R`N\times1=\big[N\times(D+1)\big]\cdot\big[(D+1)\times1\big]+N\times1`),
          shape(R`\text{inner sizes match: }D+1`),
        ],
      },
    ],
  },
  {
    id: 'loss',
    circ: 1,
    title: 'Loss in vector form',
    why: R`To choose the best $\mathbf w$ we need one number that says how badly a given $\mathbf w$ fits the data. The sum of squared errors is that number, and writing it as $\lVert\boldsymbol\varepsilon\rVert_2^2$ gives a compact formula in $\mathbf w$ that we can differentiate in one go.`,
    slides: [slide('I', 42, 'Squared error as a vector norm'), slide('I', 43, 'Least squares solution, in vector form')],
    slideNote: R`Row 1 is slide 42. Row 2 and the row ending in $-2\,\mathbf y^\top X\mathbf w$ are slide 43. The other rows, the transposes, the four-term expansion and the scalar-transpose step, are added to show I2 and I3.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\varepsilon_i^2=\boldsymbol\varepsilon^\top\boldsymbol\varepsilon=\lVert\boldsymbol\varepsilon\rVert_2^2`,
        notes: [
          tag(['I1'], 'a sum of squares is the vector dotted with itself'),
          shape(R`\boldsymbol\varepsilon:\ N\times1,\qquad \boldsymbol\varepsilon^\top\boldsymbol\varepsilon:\ (1\times N)(N\times1)=1\times1\ \text{(scalar)}`),
        ],
      },
      {
        eq: R`=(\mathbf y-X\mathbf w)^\top(\mathbf y-X\mathbf w)`,
        notes: [
          tag(['I1'], R`substitute $\boldsymbol\varepsilon=\mathbf y-X\mathbf w$`),
          shape(R`\mathbf y-X\mathbf w:\ N\times1`),
        ],
      },
      {
        eq: R`=(\mathbf y^\top-\mathbf w^\top X^\top)(\mathbf y-X\mathbf w)`,
        notes: [
          tag(['I2'], R`transpose of a difference is the difference of the transposes, and $(X\mathbf w)^\top=\mathbf w^\top X^\top$ (the order reverses)`),
          shape(R`\mathbf y^\top-\mathbf w^\top X^\top:\ 1\times N,\qquad \mathbf y-X\mathbf w:\ N\times1`),
        ],
      },
      {
        eq: R`=\mathbf y^\top\mathbf y-\mathbf y^\top X\mathbf w-\mathbf w^\top X^\top\mathbf y+\mathbf w^\top X^\top X\mathbf w`,
        notes: [
          ex(R`multiply out, first factor times second, term by term: $\mathbf y^\top\cdot\mathbf y$, $\mathbf y^\top\cdot(-X\mathbf w)$, $(-\mathbf w^\top X^\top)\cdot\mathbf y$, $(-\mathbf w^\top X^\top)\cdot(-X\mathbf w)$; the last minus signs cancel to a plus`),
          shape(R`\text{each of the four terms: }1\times1`),
        ],
      },
      {
        eq: R`=\htmlClass{c-orange}{\mathbf y^\top\mathbf y}-2\,\mathbf y^\top X\mathbf w+\mathbf w^\top X^\top X\mathbf w`,
        notes: [
          tag(['I3'], R`$\mathbf w^\top X^\top\mathbf y$ is a scalar, so it equals its own transpose $\mathbf y^\top X\mathbf w$ (shown in the last row of this section); then $-\mathbf y^\top X\mathbf w-\mathbf y^\top X\mathbf w=-2\,\mathbf y^\top X\mathbf w$`),
          con(R`$\mathbf y^\top\mathbf y$ has no $\mathbf w$ in it: constant`),
          shape(R`\mathbf w^\top X^\top\mathbf y:\ \big(1\times(D+1)\big)\big((D+1)\times N\big)(N\times1)=1\times1`),
        ],
      },
      {
        eq: R`\big(\mathbf w^\top X^\top\mathbf y\big)^\top=\mathbf y^\top (X^\top)^\top (\mathbf w^\top)^\top=\mathbf y^\top X\mathbf w`,
        notes: [
          tag(['I2'], R`transpose of a product reverses the order, and a double transpose cancels`),
          shape(R`\mathbf w^\top X^\top\mathbf y:\ \big(1\times(D+1)\big)\big((D+1)\times N\big)(N\times1)=1\times1`),
        ],
      },
    ],
  },
  {
    id: 'gradient',
    circ: 2,
    title: 'Gradient, term by term',
    why: R`The best $\mathbf w$ sits at the lowest point of the loss, where the slope in every direction (the gradient) is zero. So before we can solve for it we need the gradient, and we find it one term at a time with the identities in the index.`,
    slides: [slide('I', 43, 'Least squares solution, in vector form')],
    slideNote: 'Slide 43 goes straight from the condition to the result. The term-by-term steps here, including entry-by-entry proofs of the two gradient identities, are added so each step is visible.',
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\nabla_{\mathbf w}L=\nabla_{\mathbf w}(\mathbf y^\top\mathbf y)-2\,\nabla_{\mathbf w}(\mathbf y^\top X\mathbf w)+\nabla_{\mathbf w}(\mathbf w^\top X^\top X\mathbf w)`,
        notes: [
          tag(['I8', 'C1'], 'differentiate each term on its own'),
          shape(R`\nabla_{\mathbf w}L:\ (D+1)\times1,\ \text{same shape as }\mathbf w`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}(\htmlClass{c-orange}{\mathbf y^\top\mathbf y})=\mathbf 0`,
        notes: [con(R`constant: no $\mathbf w$, so the gradient is zero`), shape(R`\mathbf 0:\ (D+1)\times1`)],
      },
      {
        eq: R`\mathbf y^\top X\mathbf w=(X^\top\mathbf y)^\top\mathbf w=\mathbf a^\top\mathbf w,\qquad \mathbf a:=X^\top\mathbf y`,
        notes: [
          tag(['I2'], R`$(X^\top\mathbf y)^\top=\mathbf y^\top (X^\top)^\top=\mathbf y^\top X$, so $\mathbf y^\top X=\mathbf a^\top$`),
          shape(R`\mathbf a:\ \big[(D+1)\times N\big]\cdot\big[N\times1\big]=(D+1)\times1`),
        ],
      },
      {
        eq: R`\frac{\partial}{\partial w_j}\,\mathbf a^\top\mathbf w=\frac{\partial}{\partial w_j}\sum_{k=1}^{D+1}a_kw_k=a_j\ \ \Rightarrow\ \ \nabla_{\mathbf w}(\mathbf a^\top\mathbf w)=\mathbf a`,
        notes: [
          ex(R`in the sum only the term $k=j$ contains $w_j$; every other term is a constant and differentiates to 0`),
          tag(['I4'], R`gradient of a dot product with a constant vector is that vector; stacking $a_j$ over $j$ gives $\mathbf a$`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}(\mathbf y^\top X\mathbf w)=\mathbf a=X^\top\mathbf y`,
        notes: [
          shape(R`X^\top\mathbf y:\ \big[(D+1)\times N\big]\cdot\big[N\times1\big]=(D+1)\times1`),
        ],
      },
      {
        eq: R`\mathbf w^\top A\mathbf w=\sum_{k}\sum_{l}w_kA_{kl}w_l,\qquad A:=X^\top X`,
        notes: [
          lab(R`write the scalar out entry by entry: $k$ and $l$ both run over $1,\dots,D+1$`),
          shape(R`A:\ (D+1)\times(D+1)`),
        ],
      },
      {
        eq: R`\frac{\partial}{\partial w_j}\sum_{k}\sum_{l}w_kA_{kl}w_l=\sum_{l}A_{jl}w_l+\sum_{k}w_kA_{kj}`,
        notes: [
          ex(R`product rule on each term $w_kA_{kl}w_l$. The factor $w_k$ depends on $w_j$ only when $k=j$ (leaving $A_{jl}w_l$); the factor $w_l$ only when $l=j$ (leaving $w_kA_{kj}$)`),
        ],
      },
      {
        eq: R`=(A\mathbf w)_j+(A^\top\mathbf w)_j=2(A\mathbf w)_j`,
        notes: [
          ex(R`$\sum_lA_{jl}w_l$ is row $j$ of $A$ times $\mathbf w$, i.e. $(A\mathbf w)_j$; $\sum_kw_kA_{kj}=\sum_kA_{kj}w_k$ is column $j$ of $A$ times $\mathbf w$, i.e. $(A^\top\mathbf w)_j$`),
          tag(['I2'], R`$A=X^\top X$ is symmetric: $A^\top=(X^\top X)^\top=X^\top (X^\top)^\top=X^\top X=A$`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}(\mathbf w^\top X^\top X\mathbf w)=2X^\top X\mathbf w`,
        notes: [
          tag(['I5'], R`stack the entries $2(A\mathbf w)_j$ over $j$ to get $2A\mathbf w$ with $A=X^\top X$`),
          shape(R`X^\top X:\ (D+1)\times(D+1),\qquad X^\top X\mathbf w:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}L=-2X^\top\mathbf y+2X^\top X\mathbf w`,
        notes: [lab('collect the three results'), shape(R`\text{both terms: }(D+1)\times1`)],
      },
    ],
  },
  {
    id: 'solve',
    circ: 3,
    title: R`Solve for $\hat{\mathbf w}$`,
    why: R`Setting the gradient to zero gives the Normal Equation, a linear equation in $\hat{\mathbf w}$. Solving it gives the best weights as a closed-form formula, so we get them directly instead of searching step by step.`,
    slides: [slide('I', 39, 'Matrix form of the normal equations'), slide('I', 43, 'Least squares solution, in vector form')],
    derive: true, // the rows as an animated derivation, drawn in the page
    manim: 'NormalEquationsAsProjection', // animations/regression.py: Xw-hat is the projection of y onto the columns of X
    rows: [
      {
        eq: R`\nabla_{\mathbf w}L(\hat{\mathbf w})=-2X^\top\mathbf y+2X^\top X\hat{\mathbf w}=\mathbf 0`,
        notes: [
          lab(R`condition for a minimum: the gradient is zero at the fitted $\hat{\mathbf w}$`),
          shape(R`\mathbf 0:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`2X^\top X\,\hat{\mathbf w}=2X^\top\mathbf y`,
        notes: [ex(R`add $2X^\top\mathbf y$ to both sides`)],
      },
      {
        eq: R`X^\top X\,\hat{\mathbf w}=X^\top\mathbf y`,
        notes: [ex('divide both sides by 2'), term('Normal Equation'), shape(R`\big[(D+1)\times(D+1)\big]\cdot\big[(D+1)\times1\big]=(D+1)\times1`)],
      },
      {
        eq: R`(X^\top X)^{-1}X^\top X\,\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y\ \Rightarrow\ I\,\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y`,
        notes: [
          ex(R`multiply both sides on the left by $(X^\top X)^{-1}$; the left side collapses because $A^{-1}A=I$`),
          shape(R`I:\ (D+1)\times(D+1)`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y`,
        notes: [
          tag(['I6'], R`multiply both sides on the LEFT by $(X^\top X)^{-1}$: matrix order matters`),
          lab('slide 39 boxes this closed form and labels it the Normal Equation'),
          warn(R`needs full column rank, otherwise $X^\top X$ has no inverse`),
          shape(R`\big[(D+1)\times(D+1)\big]\cdot\big[(D+1)\times N\big]\cdot\big[N\times1\big]=(D+1)\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Hidden step: why is a zero gradient a minimum?',
        flag: 'I7',
        text: R`The matrix $X^\top X$ is positive semi-definite, so $L$ is a convex bowl shape and its only flat point is the lowest point.`,
        eq: R`\mathbf v^\top X^\top X\mathbf v=(X\mathbf v)^\top(X\mathbf v)=\lVert X\mathbf v\rVert_2^2=\sum_{i=1}^{N}(X\mathbf v)_i^2\ge 0`,
      },
    ],
  },
];

export const leastSquaresMatrix: Topic = {
  id: 'least-squares-matrix',
  title: 'Least squares in matrix form',
  short: 'LS matrix',
  summary: R`The same least-squares fit as the 1D case, written once for $N$ examples and $D$ inputs. One matrix equation gives the loss, its gradient and the closed-form solution $\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y$.`,
  sections,
};

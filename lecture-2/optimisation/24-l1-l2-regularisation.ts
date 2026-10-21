import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'l2-shrink',
    circ: 1,
    title: 'L2 shrinkage weakens near zero',
    why: R`The L2 penalty pulls each coefficient towards zero in proportion to its size. That pull fades as the coefficient gets small, so L2 makes coefficients small but almost never exactly zero. If we want a model that ignores some features altogether, we need a different penalty.`,
    slides: [slide('L2', 69, 'L1 and L2 regularisation (section divider)'), slide('L2', 70, 'L2 shrinkage weakens near zero')],
    slideNote: R`Slide 69 is the divider (figure: the L1 diamond and the L2 circle; reading Murphy §§11.4.1–11.4.2, L1 regularisation and sparsity). Row 3 and the numbers are added.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\Omega_2(\mathbf w)=\frac\lambda2\sum_{j=1}^{D}w_j^2,\qquad\frac{\partial\Omega_2}{\partial w_j}=\frac\lambda2\cdot2w_j=\lambda w_j`,
        notes: [
          term('Squared L2 penalty'),
          lab('excluding the intercept (the sum starts at j = 1)'),
          tag(['I51', 'I52'], R`$\Omega_2=\tfrac\lambda2\lVert\mathbf w_{1:D}\rVert_2^2$`),
          lab('full-batch and SGD updates include this penalty gradient; its magnitude decreases as the coefficient becomes smaller'),
        ],
      },
      {
        eq: R`w_{t+1,j}=w_{t,j}-\eta\,\lambda w_{t,j}=(1-\eta\lambda)\,w_{t,j},\qquad0<\eta\lambda<1`,
        notes: [lab('considering the penalty alone'), ex(R`take the gradient step with the penalty gradient $\lambda w_j$ only, then factor out $w_{t,j}$`)],
      },
      {
        eq: R`w_{1,j}=(1-\eta\lambda)w_{0,j},\ \ w_{2,j}=(1-\eta\lambda)^2w_{0,j},\ \dots\ \Rightarrow\ w_{t,j}=(1-\eta\lambda)^t\,w_{0,j}\ \ne0\ \ \text{for every }t\ \ (w_{0,j}\ne0)`,
        notes: [
          tag(['I73'], 'a geometric sequence with 0 < r < 1 shrinks but never reaches 0'),
          lab('L2 typically shrinks coefficients without setting them to zero'),
        ],
      },
      {
        eq: R`\eta\lambda=0.1,\ w_0=1:\quad 1-0.1=0.9,\ \ 0.9^2=0.81,\ \ 0.9^3=0.729,\ \dots,\ w_{20}=0.9^{20}=0.12,\ w_{50}=0.9^{50}=0.005`,
        notes: [ex('smaller and smaller steps, never exactly 0')],
      },
      {
        eq: R`\text{Can we fit well using only a subset of the features?}`,
        notes: [lab('the question that leads to L1')],
      },
    ],
  },
  {
    id: 'lasso',
    circ: 2,
    title: 'L1 regularisation and LASSO',
    why: R`Replace the squared size of each coefficient by its absolute value. The new penalty can push coefficients all the way to zero, which removes those features from the model: fitting and feature selection in one step.`,
    slides: [slide('L2', 71, 'L1 regularisation and LASSO'), slide('L2', 72, 'LASSO: an L1 coefficient penalty')],
    slideNote: R`Slide 71 figure: the LASSO regularisation path; each coloured curve is one coefficient, and towards the right (stronger penalty) the curves reach 0 one after another and stay there. Tibshirani (1996), JRSS B.`,
    rows: [
      {
        eq: R`J_{\text{lasso}}(\mathbf w)=\lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w_{1:D}\rVert_1`,
        notes: [
          term('LASSO: least absolute shrinkage and selection operator'),
          lab('fit the data while penalising the sum of absolute coefficient values'),
          lab(R`$\mathbf w_{1:D}$ excludes the intercept $w_0$: the intercept is not penalised`),
          con(R`$\lambda\ge0$`),
          shape(R`\mathbf y-X\mathbf w:\ N\times1,\quad\mathbf w_{1:D}:\ D\times1,\quad J_{\text{lasso}}:\ 1\times1`),
        ],
      },
      {
        eq: R`\lVert\mathbf w_{1:D}\rVert_1=\sum_{j=1}^{D}|w_j|`,
        notes: [term('L1 norm'), tag(['I50'], 'add the sizes of the coordinates, ignoring signs')],
      },
      {
        eq: R`\mathbf w_{1:D}=(0.5,\,-2,\,0)^\top:\quad\lVert\cdot\rVert_1=|0.5|+|-2|+|0|=2.5,\qquad\lVert\cdot\rVert_2^2=0.5^2+(-2)^2+0^2=0.25+4+0=4.25`,
        notes: [ex('the L1 penalty grows linearly with each coefficient, the squared L2 penalty quadratically')],
      },
      {
        eq: R`\text{some }\hat w_j=0\ \text{exactly}`,
        notes: [lab('some coefficients can become exactly zero: LASSO selects a subset of the features')],
      },
    ],
  },
  {
    id: 'l1-gradient',
    circ: 3,
    title: 'L1 shrinkage and feature selection',
    why: R`The derivative explains the difference. The L1 pull has the same size however small the coefficient is, so it can finish the job and reach zero; the corner of $|w|$ at zero is where the optimum then sits.`,
    slides: [slide('L2', 73, 'L1 shrinkage and feature selection')],
    slideNote: R`Rows 2 and 3 (penalty-only steps) and the numbers are added for comparison with the L2 section.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`|w_j|=\begin{cases}w_j & w_j>0\\ -w_j & w_j<0\end{cases}\ \Rightarrow\ \frac{\mathrm d}{\mathrm dw_j}\big[\lambda|w_j|\big]=\begin{cases}\lambda\cdot(+1) & w_j>0\\ \lambda\cdot(-1) & w_j<0\end{cases}=\lambda\,\operatorname{sign}(w_j),\qquad w_j\ne0`,
        notes: [
          tag(['I52'], 'the slope of |w| is ±1 however small w is'),
          lab('the L1 penalty has a gradient of constant magnitude away from zero'),
          lab('the pull does not weaken as a coefficient approaches zero'),
          warn(R`at $w_j=0$ there is no derivative: the corner allows an optimum with exact zeros`),
        ],
      },
      {
        eq: R`w_{t+1,j}=w_{t,j}-\eta\lambda\,\operatorname{sign}(w_{t,j})`,
        notes: [lab('considering the penalty alone: a fixed-size step towards 0')],
      },
      {
        eq: R`\eta\lambda=0.1,\ w_0=1:\quad1-0.1=0.9,\ 0.9-0.1=0.8,\ \dots,\ 0.1,\ 0\quad(\text{10 steps})`,
        notes: [
          ex(R`compare L2 with the same $\eta\lambda$: $0.9^{10}=0.349$, so still about $0.35$ after 10 steps, never 0`),
          lab('practical LASSO solvers stop the coefficient at 0 instead of stepping past it'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Selecting features for prediction',
        flag: 'I52',
        text: R`Zero coefficients remove features from the fitted predictor. Selection concerns predictive value given the other features: a dropped feature may still be related to $y$ if another feature carries the same information. Choose $\lambda$ using validation. Put features on comparable scales (the penalty treats every coefficient the same). The same L1 penalty can also be used with logistic loss.`,
        eq: R`\hat y=\hat w_0+\sum_{j:\ \hat w_j\ne0}\hat w_jx_j`,
      },
    ],
  },
  {
    id: 'penalty-constraint',
    circ: 4,
    title: 'Regularisation penalties and constraints',
    why: R`A penalty can be rewritten as a budget: minimise the error while keeping the norm of $\mathbf w$ below a radius $r$. The budget form is what makes the geometry pictures (balls and corners) possible.`,
    slides: [slide('L2', 74, 'Regularisation penalties and constraints')],
    rows: [
      {
        eq: R`\min_{\mathbf w}\ \lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w_{1:D}\rVert_1`,
        notes: [term('Penalty formulation'), lab('LASSO penalises L1; ridge penalises L2 squared')],
      },
      {
        eq: R`\min_{\mathbf w}\ \lVert\mathbf y-X\mathbf w\rVert_2^2\quad\text{s.t.}\quad\lVert\mathbf w_{1:D}\rVert_1\le r`,
        notes: [
          term('Constraint formulation'),
          lab(R`$r\ge0$ is the constraint radius; s.t. means "subject to"`),
          tag(['I53'], R`for each penalty strength $\lambda$ there is a corresponding radius $r$ with the same solution`),
          lab(R`larger $\lambda$ matches a smaller $r$`),
        ],
      },
    ],
  },
  {
    id: 'unit-balls',
    title: 'Unit balls: L1 and L2 norms',
    why: R`The set of coefficient vectors with norm at most 1 is a diamond for L1 and a circle for L2. The diamond's corners lie on the axes, where some coordinates are zero, which is the geometric reason L1 produces sparse solutions.`,
    slides: [slide('L2', 75, 'Unit balls: L1 and L2 norms')],
    slideNote: R`Figure: left, a diamond with corners at $\pm1$ on both axes and an L-shaped orange path from 0 to $\mathbf w$; right, a circle of radius 1 with a straight orange segment from 0 to $\mathbf w$. The numbers are added.`,
    pre: [text(R`The geometry concerns the non-intercept coefficients $\mathbf w_{1:D}$.`)],
    rows: [
      {
        eq: R`\lVert\mathbf w_{1:D}\rVert_1=\sum_{j=1}^{D}|w_j|`,
        notes: [term('L1: Manhattan distance'), lab('horizontal + vertical distance = 1 on the boundary'), tag(['I50'], 'L1 norm')],
      },
      {
        eq: R`\lVert\mathbf w_{1:D}\rVert_2=\Big(\sum_{j=1}^{D}w_j^2\Big)^{1/2}`,
        notes: [term('L2: Euclidean distance'), lab('straight-line distance = 1 on the boundary'), tag(['I51'], 'L2 norm')],
      },
      {
        eq: R`\text{boundary: norm}=1,\qquad\text{unit ball: norm}\le1`,
        notes: [],
      },
      {
        eq: R`\mathbf w=(0.6,0.4):\ \lVert\mathbf w\rVert_1=0.6+0.4=1,\ \lVert\mathbf w\rVert_2=\sqrt{0.36+0.16}=\sqrt{0.52}=0.72;\qquad\mathbf w=(0.71,0.71):\ \lVert\mathbf w\rVert_2=\sqrt{0.5041+0.5041}\approx1,\ \lVert\mathbf w\rVert_1=0.71+0.71=1.42`,
        notes: [ex('the first is on the diamond (inside the circle); the second on the circle (outside the diamond)')],
      },
    ],
  },
  {
    id: 'projections',
    title: 'L2 and L1 geometry: projections',
    why: R`Take a point outside the ball and find the nearest point of the ball. For the circle, the answer usually keeps every coordinate nonzero. For the diamond, a whole wedge of points lands on the same corner, where a coordinate is zero. This is sparsity seen as geometry.`,
    slides: [slide('L2', 76, 'L2 geometry: projection onto a ball'), slide('L2', 77, 'L1 geometry: projection onto corners')],
    slideNote: R`Slide 76 figure: a grey disk $\lVert\mathbf w_{1:2}\rVert_2\le r$; a red vertical line projects to the top point, a blue diagonal line to a point on the circle at 45°, a green horizontal line to the right point. Slide 77 figure: a grey diamond $\lVert\mathbf w_{1:2}\rVert_1\le r$; the whole red-shaded wedge above the top corner projects onto that corner ($w_1=0$); the whole green-shaded wedge to the right projects onto the right corner ($w_2=0$); only points along lines like the blue one land on an edge with both coordinates nonzero.`,
    pre: [
      lab('Euclidean projection illustrations: "projection" = nearest point of the ball.'),
      text(R`L2: the $\ell_2$-norm is isotropic (the same in every direction). The nearest point usually has several nonzero coordinates.`),
      text('L1: many coefficient vectors project onto a corner, where one coordinate is zero.'),
    ],
    manim: 'L1VsL2Geometry', // animations/regularisation.py: loss contours meeting the L2 disc and the L1 diamond
    rows: [
      {
        eq: R`\Pi_{\lVert\cdot\rVert_2\le r}(\mathbf v)=r\,\frac{\mathbf v}{\lVert\mathbf v\rVert_2}\quad(\lVert\mathbf v\rVert_2>r)`,
        notes: [
          tag(['I54'], 'scale the point back along the line to the centre: every nonzero coordinate stays nonzero'),
          ex(R`$r=1$, $\mathbf v=(3,4)$: $\lVert\mathbf v\rVert_2=\sqrt{9+16}=5$, so $\Pi=1\cdot\frac{1}{5}(3,4)=(0.6,0.8)$, both nonzero`),
        ],
      },
      {
        eq: R`r=1,\ \mathbf v=(0.2,\,3):\quad\Pi_{\lVert\cdot\rVert_1\le1}(\mathbf v)=(0,\,1)`,
        notes: [
          ex('a point in the red wedge lands on the top corner: the first coordinate becomes exactly 0'),
          ex(R`why: moving $\mathbf v$ straight onto the edge $w_1+w_2=1$ subtracts $\frac{0.2+3-1}{2}=1.1$ from each coordinate, giving $(-0.9,\,1.9)$, whose first coordinate is negative, so that point is off the diamond edge; the nearest point of the diamond is the corner $(0,1)$`),
          lab(R`in contrast, the L2 projection of the same point is $\frac{(0.2,3)}{\sqrt{0.04+9}}=\frac{(0.2,3)}{3.007}=(0.067,\,0.998)$: small, but not 0`),
        ],
      },
    ],
  },
  {
    id: 'sparsity',
    title: 'L1 sparsity and interpretability',
    why: R`A model that uses few features (or few active units) is easier to read: you can list what it relies on. The same L1 idea appears in modern work on interpreting neural networks.`,
    slides: [slide('L2', 78, 'L1 sparsity and interpretability')],
    slideNote: R`Left: the LASSO path from slide 71 (Tibshirani 1996). Right: a sparse autoencoder diagram: input $\to$ encoder $\to$ a wide layer of "SAE activations" with only a few active (shaded) $\to$ decoder $\to$ output. Cunningham et al. (2023), arxiv.org/abs/2309.08600.`,
    pre: [
      text('LASSO selects coefficients.'),
      term('Sparse autoencoder (SAE)'),
      text('A sparse autoencoder learns a representation with few active units.'),
      lab('"sparse": most entries exactly zero, as with LASSO coefficients'),
    ],
    rows: [],
  },
];

export const l1l2Regularisation: Topic = {
  id: 'l1-l2-regularisation',
  title: 'L1 and L2 regularisation in optimisation',
  short: 'L1 / L2',
  summary: R`The L2 penalty's pull $\lambda w_j$ fades near zero, so it shrinks without zeroing. The L1 penalty (LASSO) pulls with constant size $\lambda\,\mathrm{sign}(w_j)$ and its corner at 0 gives exact zeros. Penalty $\leftrightarrow$ constraint; diamond versus circle; projections onto corners.`,
  sections,
};

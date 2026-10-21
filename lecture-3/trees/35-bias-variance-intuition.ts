import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'forest-divider',
    title: 'Bagging and random forests (2001)',
    why: R`Trees overfit when grown deep. Bagging and random forests (Breiman, 2001) keep the flexibility of deep trees but average away their instability. To see why that works we need the language of bias and variance first.`,
    slides: [slide('L3', 13, 'Bagging and random forests (section divider)')],
    slideNote: R`Divider. Side panel: 2001 Random forests, Breiman. Reading: Murphy (2022) §§18.3–18.4, bagging and random forests.`,
    pre: [lab('Order of this part: bias and variance (this file) → averaging a committee (file 36) → bagging and forests (file 37)')],
    rows: [],
  },
  {
    id: 'complexity-curve',
    circ: 1,
    title: 'Model complexity and generalisation error',
    why: R`Every model family has a complexity knob (polynomial degree, tree depth, $\lambda$, $k$ in kNN). Plotting error against that knob gives the U-shaped curve that all of model selection is about: too simple underfits, too complex overfits, and the best model sits at the "sweet spot" in between.`,
    slides: [slide('L3', 14, 'Model complexity and generalization error')],
    slideNote: R`Figure: prediction error (vertical) against model complexity, low to high (horizontal). The Training Sample curve (cyan) keeps falling; the Test Sample curve (red) is U-shaped. A blue vertical line marks the "Sweet spot" at the minimum of the test curve. Same picture as Lecture 2 slide 91`,
    rows: [
      {
        eq: R`E_{\text{train}}(\text{complexity})\ \downarrow,\qquad E_{\text{gen}}(\text{complexity})\ \text{U-shaped with minimum at the sweet spot}`,
        notes: [
          lab('left of the sweet spot: underfit (model too simple). Right of it: overfit (model fits noise)'),
          lab('we cannot find the sweet spot from the training curve: it needs held-out data (validation, out-of-bag)'),
        ],
      },
    ],
  },
  {
    id: 'bias-variance-intuition',
    circ: 2,
    title: 'Bias and variance: intuition',
    why: R`The two ways a learned predictor can be wrong are different, and have different cures. Bias is a failure of the model family; variance is a failure of the estimation from one finite, noisy training set. Averaging many models (the rest of this part) cures variance but not bias.`,
    slides: [slide('L3', 15, 'Bias and variance - intuition')],
    slideNote: R`Figure: a 2 × 2 grid of dartboards (Scott Fortmann-Roe, scott.fortmann-roe.com/docs/BiasVariance.html). Columns: low variance, high variance. Rows: low bias, high bias. Low bias and low variance: tight cluster on the bullseye. Low bias, high variance: scattered around the bullseye. High bias, low variance: tight cluster off-centre. High bias and high variance: scattered and off-centre`,
    pre: [
      term('Bias'),
      lab('can your model represent the underlying function?'),
      term('Variance'),
      lab('will your learned solution depend on the particular training set? (e.g. influence of noise)'),
    ],
    rows: [
      {
        eq: R`\text{bias}(\mathbf x)=m(\mathbf x)-f^*(\mathbf x),\qquad\text{variance}(\mathbf x)=\mathbb E_{\mathcal D}\big[(\hat f_{\mathcal D}(\mathbf x)-m(\mathbf x))^2\big]`,
        notes: [
          lab(R`$f^*$: true function; $\hat f_{\mathcal D}$: the fit on training set $\mathcal D$; $m(\mathbf x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(\mathbf x)]$: the average fit over training sets`),
          tag(['C8', 'C9'], R`the hat marks a fit; the subscript $\mathcal D$ is what is averaged over`),
          shape(R`\hat f_{\mathcal D}(\mathbf x),\ m(\mathbf x),\ f^*(\mathbf x):\ 1\times1`),
          lab('full decomposition: file 13 and, as on slides 108–111, file 50'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Which one is which',
        text: R`High bias: the average fit $m(\mathbf x)$ is far from $f^*(\mathbf x)$ (e.g. a straight line for a curved truth). High variance: individual fits $\hat f_{\mathcal D}(\mathbf x)$ scatter widely around $m(\mathbf x)$ (e.g. a deep tree that changes with every sample). A model can have both.`,
      },
    ],
  },
  {
    id: 'decomposition-schematic',
    circ: 3,
    title: 'The bias–variance decomposition (schematic)',
    why: R`The two failure modes add up, together with noise that no model can remove, to the expected error. Seeing the three curves against complexity explains why the validation curve is U-shaped: bias$^2$ falls and variance rises as the model grows.`,
    slides: [slide('L3', 16, 'Bias-variance decomposition (non-examinable)')],
    slideNote: R`Non-examinable. Figure: three curves against model complexity. Bias$^2$ (dark red) falls; variance (teal) rises; the sum, "Total Error" (black), is U-shaped with an "Optimum model complexity" marked by a dotted vertical line. A label points to the "Validation sample". Caption: "Schematic; noise is not shown." The equation is on the slide; Lecture 3 appendix slides 108–111 derive it (file 50).`,
    rows: [
      {
        eq: R`\mathbb E_{\mathcal D}\big[R(\hat f_{\mathcal D})\big]=\mathbb E_{\mathbf X}\Big[\text{bias}^2(\mathbf X)+\text{variance}(\mathbf X)+\text{noise}(\mathbf X)\Big]`,
        notes: [
          term('Bias–variance decomposition'),
          lab(R`expected risk of the fit, averaged over training sets, equals bias$^2$ + variance + noise, averaged over inputs $\mathbf X$`),
          tag(['C9'], R`$\mathbb E_{\mathcal D}$: average over training sets; $\mathbb E_{\mathbf X}$: average over inputs`),
          shape(R`\text{every term:}\ 1\times1\ (\text{non-negative})`),
          warn('noise is a floor: even the best model cannot go below it'),
        ],
      },
    ],
  },
  {
    id: 'regression-examples',
    circ: 4,
    title: 'Bias and variance: regression examples',
    why: R`Every complexity knob you have met has a "high bias" end and a "high variance" end. Recognising them lets you read a validation curve whatever the model.`,
    slides: [slide('L3', 17, 'Bias and variance: regression examples')],
    slideNote: R`A 2 × 3 grid of fits. Columns: high bias, good trade-off, high variance. Row 1: kernel regression, bandwidth $h=0.6,\ 0.12,\ 0.008$. Row 2: ridge regression, penalty strength $\lambda=100,\ 0.2,\ 10^{-10}$. Dots: training data; dashed: true model; blue: fitted predictor. The $h$ and $\lambda$ values are read off the plots`,
    pre: [
      lab(R`Kernel regression, bandwidth $h$ · Ridge regression, penalty strength $\lambda$`),
      text('Dots: training data. Dashed: true model. Blue: fitted predictor.'),
    ],
    rows: [
      {
        eq: R`\text{Kernel regression:}\quad h=0.6\Rightarrow\text{high bias (over-smoothed)};\quad h=0.12\Rightarrow\text{good};\quad h=0.008\Rightarrow\text{high variance (follows the noise)}`,
        notes: [lab(R`the bandwidth $h$ sets how many neighbours get a large weight (file 03)`)],
      },
      {
        eq: R`\text{Ridge regression:}\quad \lambda=100\Rightarrow\text{high bias (almost flat)};\quad \lambda=0.2\Rightarrow\text{good};\quad \lambda=10^{-10}\Rightarrow\text{high variance}`,
        notes: [lab(R`the penalty $\lambda\lVert\mathbf w\rVert_2^2$ limits flexibility without changing the number of features (file 07)`)],
      },
    ],
  },
  {
    id: 'classification-examples',
    circ: 5,
    title: 'Bias and variance: classification examples',
    why: R`The same trade-off appears in classification, now as a decision boundary: a too-simple boundary misses the structure, a too-complex one bends around individual labelled points.`,
    slides: [slide('L3', 18, 'Bias and variance: classification examples'), slide('L3', 19, 'Bias and variance: kNN classification')],
    slideNote: R`Slide 18: a 2 × 3 grid (high bias, good trade-off, high variance) on a circular two-class problem. Row "Lecture 2, logistic regression, feature degree $q$": $q=1$ (a straight line, misses the circle), $q=2$ (a smooth ellipse, good), $q=12$ (a wiggly boundary with a hole). Row "Lecture 3, decision trees, maximum depth": depth 1 (one cut), depth 4 (a box around the circle), full depth (many thin boxes around individual points). Colour: predicted class; dots: training labels; dashed: true boundary. Caption: "Illustrative fits · Increasing complexity can fit training noise". Slide 19: the same training data with three neighbourhood sizes $k$ (large $k$ = high bias, small $k$ = high variance); "Choose $k$ using validation data."`,
    pre: [
      lab(R`Logistic regression with polynomial features of degree $q$ (Lecture 2) · Decision trees with maximum depth (Lecture 3) · kNN with neighbourhood size $k$`),
      text('A large k smooths the boundary. A small k can fit individual labels.'),
      text('Choose k using validation data.'),
    ],
    rows: [
      {
        eq: R`\text{Logistic regression, degree }q:\ q=1\Rightarrow\text{high bias};\ \ q=2\Rightarrow\text{good};\ \ q=12\Rightarrow\text{high variance}`,
        notes: [lab('more polynomial features give a more wiggly boundary (file 19)')],
      },
      {
        eq: R`\text{Decision tree, maximum depth:}\ 1\Rightarrow\text{high bias};\ \ 4\Rightarrow\text{good};\ \ \text{full depth}\Rightarrow\text{high variance}`,
        notes: [lab('deep trees carve small boxes around individual training points (file 34)')],
      },
      {
        eq: R`\text{kNN, neighbourhood size }k:\ k\text{ large}\Rightarrow\text{high bias};\ \ k\text{ small}\Rightarrow\text{high variance}`,
        notes: [
          ex(R`$k=1$: the prediction is the label of the single nearest training point, so one noisy label changes the boundary; $k=N$: always the majority class, the same everywhere`),
          warn(R`the direction is opposite to the tree: for kNN, small $k$ = complex model`),
        ],
      },
    ],
  },
];

export const biasVarianceIntuition: Topic = {
  id: 'bias-variance-intuition',
  title: 'Bias and variance: intuition and complexity knobs',
  short: 'Bias and variance',
  summary: R`Bias: the model family cannot represent $f^*$. Variance: the fit changes with the training set. Expected error $=$ bias$^2$ + variance + noise. Kernel bandwidth $h$, ridge $\lambda$, polynomial degree $q$, tree depth and kNN's $k$ are all complexity knobs with a high-bias end and a high-variance end.`,
  identities: [],
  sections,
};

import { R, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const models = [slide('L2', 168, 'Notation: models and optimisation')];
const treesDecisions = [slide('L2', 169, 'Notation: trees and decisions')];

const sections: Section[] = [
  {
    id: 'reading',
    title: 'Reading alongside Lecture 2',
    why: 'The reading list maps each block of the lecture to book sections, so you can read exactly the parts that match the slides.',
    slides: [slide('L2', 167, 'Reading alongside Lecture 2')],
    pre: [
      term('Murphy, Probabilistic Machine Learning: An Introduction (book1.pdf)'),
      text('Classification: §§10.2.1–10.2.3, 10.3.1–10.3.2.'),
      text('Optimisation: §§8.2.1–8.2.4, 8.3.1, 8.4.1–8.4.3; §§11.4.1–11.4.2 (L1).'),
      text('Trees and ensembles: §§18.1, 18.3–18.4.'),
      text('Decisions and evaluation: §§5.1.1–5.1.4.'),
      term('Vision Book: Foundations of Computer Vision (Torralba, Isola and Freeman), visionbook.mit.edu'),
      text('Classification and cross-entropy: §§9.6, 9.7.3.'),
      text('Gradient descent, momentum and SGD: §§10.3–10.5, 10.7.'),
    ],
    rows: [],
  },
  {
    id: 'data-model',
    title: 'Data and model',
    why: R`Most mistakes in this lecture come from mixing up shapes: $N$ examples, $D+1$ raw coordinates or $M$ features, $C$ classes. Each symbol below has its shape, so any product can be checked by rows and columns.`,
    slides: models,
    slideNote: 'The shapes are added, taken from the topic files.',
    rows: [
      { eq: R`N,\ D,\ M`, notes: [text('Examples; raw / mapped size.'), shape(R`\text{counts};\ \mathbf x_i:\ (D+1)\times1,\ \ \boldsymbol\phi(\mathbf x_i):\ M\times1`)] },
      {
        eq: R`\mathbf x_i,\ y_i`,
        notes: [
          text(R`Example $i$: input and observed label.`),
          shape(R`\mathbf x_i:\ (D+1)\times1\ (x_{i0}=1),\quad y_i\in\{0,1\}\ \text{or}\ \{1,\dots,C\}`),
        ],
      },
      { eq: R`X,\ \mathbf y`, notes: [text('Design matrix (rows are inputs) and label vector.'), shape(R`X:\ N\times(D+1),\quad\mathbf y:\ N\times1`)] },
      {
        eq: R`\boldsymbol\phi(\mathbf x),\ \mathbf w`,
        notes: [text('Features and coefficients.'), shape(R`\mathbf w:\ (D+1)\times1\ (\text{or }M\times1);\quad W:\ (D+1)\times C\ (\text{or }M\times C)`)],
      },
      { eq: R`z_i,\ g`, notes: [text('Score and logistic sigmoid.'), tag(['I64'], R`$z_i=\mathbf w^\top\mathbf x_i$ ($1\times1$); $g(a)=1/(1+e^{-a})$`)] },
      {
        eq: R`p_i,\ p_c(\mathbf x)`,
        notes: [text('Class-1 and class-c probabilities.'), shape(R`1\times1;\ \ \mathbf p=(p_1,\dots,p_N)^\top:\ N\times1`)],
      },
      { eq: R`y_\pm,\ m=y_\pm z`, notes: [text('Signed label (±1) and margin.'), tag(['C11'], R`$y_\pm=2y-1$`)] },
      { eq: R`\mathbf t_i`, notes: [text('One-hot target vector.'), shape(R`C\times1`)] },
    ],
  },
  {
    id: 'fitting',
    title: 'Fitting and optimisation',
    why: 'The optimisation symbols, with the shape of every vector and matrix in an update step.',
    slides: models,
    slideNote: 'The shapes are added.',
    rows: [
      { eq: R`\ell_i,\ L,\ J`, notes: [text('Example loss; total loss; objective.'), shape(R`1\times1;\ \ J=\tfrac1NL+\tfrac\lambda2\textstyle\sum_{j\ge1}w_j^2`)] },
      { eq: R`\lambda,\ \mathbf r(\mathbf w)`, notes: [text('Penalty strength; penalty gradient.'), shape(R`\lambda:\ 1\times1,\quad\mathbf r=(0,w_1,\dots,w_D)^\top:\ (D+1)\times1`)] },
      { eq: R`\nabla_{\mathbf w}J,\ H`, notes: [text('Gradient and Hessian.'), shape(R`\nabla J:\ (D+1)\times1,\quad H:\ (D+1)\times(D+1)`)] },
      { eq: R`t,\ \eta_t,\ \alpha_t`, notes: [text('Iteration; learning rate; step scale.'), shape(R`\text{scalars}`)] },
      { eq: R`\mathcal B_t,\ B`, notes: [text('Mini-batch indices and size.'), lab(R`$\mathcal B_t$ is a list of $B$ indices (repeats allowed)`)] },
      {
        eq: R`\mathbf g_t,\ \mathbf v_t,\ \beta`,
        notes: [
          text('Gradient estimate; momentum; decay.'),
          shape(R`\mathbf g_t,\mathbf v_t:\ (D+1)\times1,\quad\beta:\ 1\times1`),
          warn(R`momentum ($\mathbf v_t$, $\beta$) is listed here but has no slide of its own in this deck`),
        ],
      },
      { eq: R`R=\operatorname{diag}[p_i(1-p_i)],\ \mathbf u`, notes: [text('IRLS weights and working response (appendix).'), shape(R`R:\ N\times N,\quad\mathbf u:\ N\times1`)] },
    ],
  },
  {
    id: 'trees-ensembles',
    title: 'Trees and ensembles',
    why: 'The tree and ensemble symbols in one place.',
    slides: treesDecisions,
    rows: [
      { eq: R`C,\ K`, notes: [text('Classes; learners (trees).')] },
      { eq: R`f_k,\ \omega_k`, notes: [text('Learner and its ensemble weight.'), lab(R`random forest: $\omega_k=1/K$`)] },
      { eq: R`\mathcal R_j,\ p_c(\mathbf x)`, notes: [text('Leaf region and class probability.')] },
      { eq: R`\theta_n,\ H,\ IG`, notes: [text('Split threshold; entropy; split gain.'), tag(['I80'], 'entropy')] },
      { eq: R`I_n,\ I_{\mathrm L},\ I_{\mathrm R}`, notes: [text(R`Example indices at node $n$ and its children.`), tag(['C12'], 'set notation')] },
      { eq: R`f^*,\ \epsilon_k`, notes: [text('Target function; learner error.'), lab(R`$f_k=f^*+\epsilon_k$`)] },
      { eq: R`R(f),\ \hat R_{\text{train}}`, notes: [text('Population risk; training risk.'), tag(['C8'], 'the hat marks a sample estimate')] },
    ],
  },
  {
    id: 'decisions-evaluation',
    title: 'Decisions and evaluation',
    why: 'The decision and evaluation symbols in one place.',
    slides: treesDecisions,
    rows: [
      { eq: R`\tau,\ \kappa`, notes: [text('Decision and acceptance thresholds.'), lab(R`$\tau$ on $p_1(\mathbf x)$; $\kappa\in(\tfrac12,1]$ for the reject option`)] },
      { eq: R`\Lambda_{kj},\ R(j\mid\mathbf x)`, notes: [text(R`Cost (truth $k$, action $j$); risk.`), tag(['I83'], 'expected loss of an action')] },
      { eq: R`TP,\ FP,\ TN,\ FN`, notes: [text('True/false positives and negatives.')] },
      { eq: R`\text{Prec},\ \text{Rec},\ F_b`, notes: [text('Precision, recall, weighted F-score.')] },
      { eq: R`TPR,\ FPR,\ \text{AUC}`, notes: [text('Positive rates; area under ROC.'), tag(['C13'], 'TPR = recall')] },
      { eq: R`e,\ N_{\text{test}}`, notes: [text('Test error fraction; test-set size.'), tag(['I86'], R`$\hat e$ is the observed value`)] },
    ],
  },
];

export const lecture2Glossary: Topic = {
  id: 'lecture-2-glossary',
  title: 'Lecture 2 symbol glossary',
  short: 'Glossary L2',
  summary: R`The reading list and the notation slides for Lecture 2, with the shape of every vector and matrix: data and model, fitting and optimisation, trees and ensembles, decisions and evaluation.`,
  sections,
};

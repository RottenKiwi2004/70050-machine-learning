import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I83',
    area: 'Probability',
    tex: R`R(j\mid\mathbf x)=\mathbb E_{k\sim p(\cdot\mid\mathbf x)}\big[\Lambda_{kj}\big]=\sum_{k}\Lambda_{kj}\,p_k(\mathbf x),\qquad\hat j=\arg\min_jR(j\mid\mathbf x)`,
    note: R`Expected loss (risk) of action $j$: average the loss of $j$ over the possible true classes $k$, weighted by their probabilities (I56, discrete form). Choosing the action with the smallest expected loss is the Bayes decision rule. Each $R(j\mid\mathbf x)$ is $1\times1$.`,
  },
  {
    id: 'I84',
    area: 'Probability',
    tex: R`\Lambda_{00}=\Lambda_{11}=0:\quad\text{choose class 1}\iff p_1(\mathbf x)\ge\frac{\Lambda_{01}}{\Lambda_{01}+\Lambda_{10}}`,
    note: R`Binary threshold from costs. $R(1\mid\mathbf x)=\Lambda_{01}(1-p)$ and $R(0\mid\mathbf x)=\Lambda_{10}\,p$ with $p=p_1(\mathbf x)$; choose 1 when $\Lambda_{01}(1-p)\le\Lambda_{10}p$, then solve for $p$. $\Lambda_{01}$: cost of a false positive (truth 0, decide 1); $\Lambda_{10}$: cost of a false negative. Equal costs give $\tfrac12$.`,
  },
];

const sections: Section[] = [
  {
    id: 'fit-evaluate',
    title: 'Fitting a classifier and evaluating it',
    why: R`A fitted model gives probabilities, not decisions, and a low training loss says nothing about new data. This block covers the two remaining steps: turning probabilities into actions, and measuring how well those actions work on held-out data.`,
    slides: [slide('L2', 119, 'Decision costs (section divider)'), slide('L2', 120, 'Fitting a classifier and evaluating it')],
    slideNote: R`Slide 119 is the divider (figure: the loss matrix of slide 124; reading Murphy §§5.1.1–5.1.2, decision theory and classification).`,
    pre: [
      text('Fit the classifier on training data.'),
      text('Use validation data to choose settings and a decision threshold.'),
      text('Report held-out classification performance after fitting.'),
      warn('A low training loss is not evidence of reliable unseen predictions.'),
    ],
    rows: [],
  },
  {
    id: 'threshold',
    circ: 1,
    title: 'Classification thresholds',
    why: R`After fitting probabilities we must choose how they become decisions. The simplest rule compares the class-1 probability with a threshold $\tau$; $\tau=\tfrac12$ is only right when both kinds of mistake cost the same.`,
    slides: [slide('L2', 121, 'Classification thresholds')],
    slideNote: R`Figure: the class-1 probability against the model score (a sigmoid), with the threshold $\tau=0.5$ crossing at score 0. Rows 2 and 3 (the same rule on the score) are added.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\hat y=\begin{cases}1 & p_{\mathbf w}(\mathbf x)\ge\tau\\ 0 & p_{\mathbf w}(\mathbf x)<\tau\end{cases}`,
        notes: [
          term('Probability threshold'),
          lab(R`$\tau$ is the probability threshold; equal error costs suggest $\tau=\tfrac12$`),
          lab('choose other thresholds using validation data and the cost of mistakes'),
          shape(R`p_{\mathbf w}(\mathbf x),\ \tau:\ 1\times1`),
        ],
      },
      {
        eq: R`p_{\mathbf w}(\mathbf x)\ge\tau\iff\mathbf w^\top\mathbf x\ge\log\frac{\tau}{1-\tau}`,
        notes: [tag(['I64'], 'the sigmoid is increasing and its inverse is the log-odds')],
      },
      {
        eq: R`\tau=\tfrac12:\ \mathbf w^\top\mathbf x\ge0,\qquad\tau=0.8:\ \mathbf w^\top\mathbf x\ge\log4=1.39`,
        notes: [ex(R`$\tau=\tfrac12$ is the score-sign rule $\mathbb 1[z\ge0]$ from the scores topic; a higher $\tau$ demands a larger score`)],
      },
    ],
  },
  {
    id: 'classes-decisions',
    title: 'Classes and decisions',
    why: R`What is true about an input and what we do about it are different things, and mistakes in different directions can have very different consequences. A loss function puts numbers on those consequences.`,
    slides: [slide('L2', 122, 'Classes and decisions'), slide('L2', 123, 'Asymmetric decision costs')],
    pre: [
      text('The true class describes the input. A decision specifies an action.'),
      ex('medical example: true class: sick or healthy. Decision: treat, discharge, or request another examination.'),
      text('An extra examination is an action even though it is not a third true class. Use a loss function to express the consequence of each action.'),
      term('Asymmetric decision costs'),
      text('A false negative and a false positive can have very different consequences.'),
    ],
    rows: [
      {
        eq: R`\begin{array}{c|c|c}\text{True condition} & \text{Decision} & \text{Consequence}\\ \hline\text{Sick} & \text{Healthy} & \text{Missed illness (false negative)}\\ \text{Healthy} & \text{Sick} & \text{Unnecessary treatment (false positive)}\end{array}`,
        notes: [
          lab('in this example, missing an illness carries a larger loss'),
          lab('the preferred decision depends on both probabilities and error costs'),
        ],
      },
    ],
  },
  {
    id: 'loss-matrix',
    circ: 2,
    title: 'A loss matrix for decisions',
    why: R`A table of costs, one entry per (truth, action) pair, plus the class probabilities is all we need: average each action's cost over the possible truths and pick the cheapest. Equal costs give back the threshold $\tfrac12$.`,
    slides: [slide('L2', 124, 'A loss matrix for decisions')],
    slideNote: 'Rows 4 and 5 (the general binary threshold) are added.',
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\Lambda_{kj}=\text{loss for decision }j\text{ when the true class is }k`,
        notes: [lab(R`$k$ indexes the true class and $j$ the decision`)],
      },
      {
        eq: R`\begin{array}{c|cc}\text{Truth / decision} & \text{Class 0} & \text{Class 1}\\ \hline\text{Class 0} & \Lambda_{00} & \Lambda_{01}\\ \text{Class 1} & \Lambda_{10} & \Lambda_{11}\end{array}`,
        notes: [lab('rows describe truth; columns describe actions'), shape(R`\Lambda:\ 2\times2`)],
      },
      {
        eq: R`R(j\mid\mathbf x)=\sum_{k=0}^{1}\Lambda_{kj}\,p_k(\mathbf x),\qquad\hat j=\arg\min_jR(j\mid\mathbf x)`,
        notes: [
          term('Expected loss (risk) of an action'),
          tag(['I83'], R`average column $j$ of $\Lambda$ with the class probabilities as weights`),
        ],
      },
      {
        eq: R`R(1\mid\mathbf x)\le R(0\mid\mathbf x)\iff\Lambda_{01}(1-p)+\Lambda_{11}p\le\Lambda_{00}(1-p)+\Lambda_{10}p`,
        notes: [lab(R`$p=p_1(\mathbf x)$, $p_0(\mathbf x)=1-p$`)],
      },
      {
        eq: R`\Lambda_{00}=\Lambda_{11}=0:\quad\text{choose 1}\iff p\ge\frac{\Lambda_{01}}{\Lambda_{01}+\Lambda_{10}}`,
        notes: [
          tag(['I84'], 'correct decisions cost nothing'),
          ex(R`equal costs $\Lambda_{01}=\Lambda_{10}$: $\tau=\tfrac12$`),
        ],
      },
    ],
  },
  {
    id: 'diagnosis',
    circ: 3,
    title: 'Decision costs: the diagnosis example',
    why: R`When missing a cancer is a thousand times worse than a false alarm, the right threshold is not $\tfrac12$ but about $0.001$: flag the patient even if cancer is very unlikely.`,
    slides: [slide('L2', 125, 'Decision costs: the diagnosis example')],
    slideNote: R`The $\Lambda$ entries (row 2) and the intermediate steps are added.`,
    pre: [text('An illustrative loss matrix from the course example.')],
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\begin{array}{c|cc}\text{Truth / decision} & \text{Cancer (1)} & \text{Normal (0)}\\ \hline\text{Cancer (1)} & 0 & 1000\\ \text{Normal (0)} & 1 & 0\end{array}`,
        notes: [warn('the columns here are in the order 1, 0, not 0, 1 as on the previous slide')],
      },
      {
        eq: R`\Lambda_{11}=0,\quad\Lambda_{10}=1000,\quad\Lambda_{01}=1,\quad\Lambda_{00}=0`,
        notes: [lab(R`$\Lambda_{10}$: truth cancer, decide normal (missed cancer); $\Lambda_{01}$: truth normal, decide cancer (false alarm)`)],
      },
      {
        eq: R`p=p_1(\mathbf x)=P(Y=1\mid\mathbf x)`,
        notes: [lab('probability of cancer given the input')],
      },
      {
        eq: R`R(1\mid\mathbf x)=\Lambda_{01}(1-p)+\Lambda_{11}p=1-p,\qquad R(0\mid\mathbf x)=\Lambda_{00}(1-p)+\Lambda_{10}p=1000p`,
        notes: [tag(['I83'], 'expected loss of each action')],
      },
      {
        eq: R`\text{choose class 1 when }1-p\le1000p\iff p\ge\frac{1}{1001}\approx0.001`,
        notes: [
          tag(['I84'], R`$\Lambda_{01}/(\Lambda_{01}+\Lambda_{10})=1/1001$`),
          ex(R`$p=0.01$: $R(1)=0.99$, $R(0)=10$, so decide cancer even at a 1% probability`),
        ],
      },
    ],
  },
  {
    id: 'reject',
    circ: 4,
    title: 'A reject option',
    why: R`When the model is unsure, the best action may be "don't decide": send the case for further testing or to a human. A reject option adds this third action whenever neither class is probable enough.`,
    slides: [slide('L2', 126, 'A reject option')],
    slideNote: R`Figure: $p_1(\mathbf x)$ (red, rising) and $p_0(\mathbf x)$ (grey, falling) against the model score, crossing at 0.5; a green horizontal acceptance threshold near 0.8. Inputs with scores in the middle band, where both curves are below the line, are rejected. The numbers are added.`,
    rows: [
      {
        eq: R`\text{Accept a class if }\max\{p_0(\mathbf x),p_1(\mathbf x)\}\ge\kappa`,
        notes: [
          term('Reject option'),
          lab('two classes, three actions: class 0, class 1, or reject'),
          lab(R`choose the most probable class if its probability is at least $\kappa$, with $\tfrac12<\kappa\le1$`),
          lab('otherwise reject, for further testing or a human decision'),
          con(R`$\kappa$: the acceptance threshold`),
        ],
      },
      {
        eq: R`\kappa=0.8:\quad p_1=0.9\Rightarrow1,\qquad p_1=0.15\ (p_0=0.85)\Rightarrow0,\qquad p_1=0.7\ (p_0=0.3)\Rightarrow\text{reject}`,
        notes: [
          ex('three inputs'),
          warn(R`with $\kappa\le\tfrac12$ nothing is ever rejected, because the larger of $p_0,p_1$ is always at least $\tfrac12$`),
        ],
      },
    ],
  },
];

export const decisionCosts: Topic = {
  id: 'decision-costs',
  title: 'Decisions, thresholds and costs',
  short: 'Decisions',
  summary: R`Turn probabilities into actions: threshold $\tau$ on $p_{\mathbf w}(\mathbf x)$; a loss matrix $\Lambda_{kj}$ and expected loss $R(j\mid\mathbf x)=\sum_k\Lambda_{kj}p_k(\mathbf x)$; with zero cost for correct decisions choose 1 when $p\ge\Lambda_{01}/(\Lambda_{01}+\Lambda_{10})$ (diagnosis: $1/1001$); a reject option with threshold $\kappa$.`,
  identities,
  sections,
};

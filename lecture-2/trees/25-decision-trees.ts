import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I80',
    area: 'Probability',
    tex: R`H(Y)=-\sum_{c=1}^{C}p_c\log p_c=\mathbb E\Big[\log\frac{1}{P(Y)}\Big],\qquad 0\le H(Y)\le\log C,\qquad 0\log0:=0`,
    note: R`Entropy: the expected surprise $\log(1/P)$ (I56, discrete form). It is 0 when one class has probability 1, and largest, $\log C$, when all $C$ classes are equally likely. The convention $0\log0=0$ (the limit of $p\log p$ as $p\to0$) lets empty classes drop out. With $\log_2$ the unit is bits; with natural $\log$ it is nats; $\log_2a=\ln a/\ln2$.`,
  },
  {
    id: 'C12',
    area: 'Conventions',
    tex: R`I_{\mathrm R}=I_n\setminus I_{\mathrm L},\qquad|I|=\text{number of elements of }I`,
    note: R`Set notation for node splits. $I_n$ is the set of example indices at node $n$; "$\setminus$" (set minus) keeps the elements of $I_n$ that are not in $I_{\mathrm L}$. The bars count elements, so $|I_{\mathrm L}|+|I_{\mathrm R}|=|I_n|$.`,
  },
];

const sections: Section[] = [
  {
    id: 'feature-questions',
    title: 'A tree asks feature questions',
    why: R`Linear models need numbers in and draw straight boundaries. A decision tree instead asks a sequence of simple questions about the features ("Colour?", "Size < 10?"), so it works with categories as well as numbers and carves the input space into boxes.`,
    slides: [slide('L2', 79, 'Decision trees (section divider)'), slide('L2', 80, 'A tree asks feature questions')],
    slideNote: R`Slide 79 is the divider (figure: the colour/shape/size tree of slide 81; reading Murphy §18.1, classification and regression trees). Slide 80 figure: coloured shapes sorted into a "yes" box and a "no" box, and three new shapes marked "?".`,
    pre: [
      text('Features: colour, shape, size.'),
      text('Machine learning can work also for discrete inputs, strings, trees, graphs, …'),
    ],
    rows: [],
  },
  {
    id: 'leaves',
    title: 'A tree predicts from its leaves',
    why: R`Each input follows one path from the root to a leaf. The leaf stores how many training examples of each label reached it, and that is the prediction: a class probability or the majority label.`,
    slides: [slide('L2', 81, 'A tree predicts from its leaves')],
    slideNote: 'The leaf probabilities (rows 2 and 3) are added.',
    pre: [text('Inputs have colour, shape and size. A test sends each input to a child.')],
    rows: [
      {
        eq: R`\text{Colour?}\ \begin{cases}\text{Blue} & \to(4,0)\\ \text{Red: shape?} & \begin{cases}\text{Ellipse}\to(1,1)\\ \text{Other}\to(0,2)\end{cases}\\ \text{Other: size}<10? & \begin{cases}\text{Yes}\to(4,0)\\ \text{No}\to(0,5)\end{cases}\end{cases}`,
        notes: [lab('each pair is (yes-label count, no-label count) at a leaf')],
      },
      {
        eq: R`\hat P(\text{yes}\mid\text{leaf})=\frac{n_{\text{yes}}}{n_{\text{yes}}+n_{\text{no}}}:\qquad\text{Blue }1,\quad\text{Red ellipse }0.5,\quad\text{Red other }0,\quad\text{size}<10\ 1,\quad\text{size}\ge10\ 0`,
        notes: [lab("predict by the leaf's class frequencies, or choose the majority label")],
      },
      {
        eq: R`\text{blue crescent}\ \to\ \text{Blue leaf}\ \to\ \text{yes};\qquad\text{red ellipse}\ \to\ (1,1)\ \to\ \text{tie}`,
        notes: [ex('a tie leaf needs a tie rule, as in k-NN'), lab('the leaves hold 4 + 2 + 2 + 4 + 5 = 17 training examples in total')],
      },
    ],
  },
  {
    id: 'depth',
    title: 'Depth counts tests along a path',
    why: R`Depth is the main measure of a tree's complexity: how many questions can be asked before answering. A depth-2 tree on two features already gives an L-shaped boundary that no single line can make.`,
    slides: [slide('L2', 82, 'Depth counts tests along a path')],
    slideNote: R`Figure: savings against income; red (high risk) points on the left and bottom, blue (low risk) in the top-right corner cut out by a vertical line at $\theta_1$ and a horizontal line at $\theta_2$.`,
    pre: [text('Income and savings define a simple risk classification example. Red: high risk. Blue: low risk.')],
    rows: [
      {
        eq: R`\hat y=\begin{cases}\text{high risk} & \text{income}<\theta_1\\ \text{high risk} & \text{income}\ge\theta_1,\ \text{savings}<\theta_2\\ \text{low risk} & \text{income}\ge\theta_1,\ \text{savings}\ge\theta_2\end{cases}`,
        notes: [
          lab(R`$\theta_1$ and $\theta_2$ are feature thresholds; the plotted points are schematic`),
          lab('maximum depth: 2 tests; a leaf can occur after only 1 test'),
        ],
      },
    ],
  },
  {
    id: 'leaf-models',
    circ: 1,
    title: 'Decision-tree leaf models and objective',
    why: R`A tree is a probability model too: each leaf region gets its own simple distribution. That gives a likelihood, and adding a cost for the tree's size gives an objective that balances fit against complexity, as regularisation did.`,
    slides: [slide('L2', 83, 'Decision-tree leaf models and objective')],
    slideNote: R`Figure: the $(x_1,x_2)$ plane cut into five boxes A to E by thresholds $\theta_1,\dots,\theta_4$, and the tree that makes them (root $x_1>\theta_1$). The region inequalities (row 1) are read from the figure; the leaf estimates (row 4) are added.`,
    rows: [
      {
        eq: R`\begin{array}{ll}A:\ x_1\le\theta_1,\ x_2<\theta_2 & B:\ x_1\le\theta_1,\ x_2\ge\theta_2\\ C:\ x_1>\theta_1,\ x_2\le\theta_3,\ x_1<\theta_4 & D:\ x_1>\theta_1,\ x_2\le\theta_3,\ x_1\ge\theta_4\\ E:\ x_1>\theta_1,\ x_2>\theta_3\end{array}`,
        notes: [term('Leaf region'), lab(R`each leaf $j$ owns one box $\mathcal R_j$; together they cover the plane without overlap`)],
      },
      {
        eq: R`\text{Regression: }\ p(y_i\mid\mathbf x_i\in\mathcal R_j)=\mathcal N(y_i\mid\mu_j,\sigma_j^2)`,
        notes: [lab(R`$\mu_j$ and $\sigma_j^2$: the mean and variance in leaf $j$`), tag(['I32'], 'a Gaussian per leaf')],
      },
      {
        eq: R`\text{Binary classification: }\ p(y_i\mid\mathbf x_i\in\mathcal R_j)=\text{Bernoulli}(y_i\mid\mu_j)`,
        notes: [lab(R`$\mu_j$: the probability of class 1 in that leaf`), tag(['I65'], R`$\mu_j^{y_i}(1-\mu_j)^{1-y_i}$`)],
      },
      {
        eq: R`\hat\mu_j=\frac{\#\{i:\mathbf x_i\in\mathcal R_j,\ y_i=1\}}{\#\{i:\mathbf x_i\in\mathcal R_j\}}`,
        notes: [lab('for a fixed tree the best leaf probability is the class-1 fraction in the leaf (the maximum-likelihood estimate)'), ex(R`leaf with counts $(4,1)$: $\hat\mu_j=0.8$`)],
      },
      {
        eq: R`J(T)=\lambda\,C(T)-\sum_{i=1}^{N}\log p(y_i\mid\mathbf x_i;T)`,
        notes: [
          lab(R`$C(T)$ measures tree complexity, such as the number of nodes`),
          con(R`$\lambda\ge0$`),
          lab('negative log-likelihood (fit) plus a complexity penalty'),
          shape(R`J(T):\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'greedy',
    title: 'Greedy decision-tree learning',
    why: R`There are far too many possible trees to try them all. So trees are grown greedily: pick the best single split now, never revisit it, and repeat in each child. This needs a score for "best split", which is where entropy comes in.`,
    slides: [slide('L2', 84, 'Greedy decision-tree learning')],
    pre: [
      text('Start with a leaf → choose a split → grow the children.'),
      text('There are many possible tree structures and split thresholds.'),
      text('For a fixed structure, estimating leaf distributions is straightforward. Searching all structures is difficult.'),
      text('A greedy method chooses the best local split and keeps that choice. Repeat at each child, with stopping rules that control complexity.'),
      text('Use validation data to choose depth and other settings.'),
      term('CART'),
      text('Classification and Regression Trees. C4.5 and ID3 are related methods.'),
      warn('Which objective should choose the next split?'),
    ],
    rows: [],
  },
  {
    id: 'information',
    circ: 2,
    title: 'Information and entropy',
    why: R`A good split leaves each child with a "pure", predictable label mix. Entropy measures how unpredictable a label distribution is, so we can score a split by how much it lowers entropy.`,
    slides: [slide('L2', 85, 'Information and entropy')],
    slideNote: 'The numeric examples are added.',
    rows: [
      {
        eq: R`I(x)=\log_2\frac{1}{P(x)}`,
        notes: [
          term('Information content of an outcome'),
          lab('a measure of surprise: predictable events do not provide information'),
          ex(R`$P=\tfrac12$: 1 bit; $P=\tfrac18$: 3 bits; $P=1$: 0 bits`),
        ],
      },
      {
        eq: R`\text{"The French live to eat and the British eat to }\ldots\text{"}`,
        notes: [lab('"live": low information content (a cliché); "die": high information content (funny)')],
      },
      {
        eq: R`H(X)=\sum_{x\in A_X}P(x)\log_2\frac{1}{P(x)}`,
        notes: [
          term('Entropy'),
          lab('expected information content of a random variable: should we expect to be surprised?'),
          lab(R`$A_X$: the possible outcomes of $X$; entropy is in bits here`),
          tag(['I80'], 'entropy is the average surprise'),
        ],
      },
    ],
  },
  {
    id: 'binary-entropy',
    title: 'Binary entropy',
    why: 'With two outcomes the entropy is a single curve in the probability p. Its shape shows the two extremes a split is trying to reach (p near 0 or 1) and the worst case it is moving away from (p = 1/2).',
    slides: [slide('L2', 86, 'Binary entropy')],
    slideNote: 'Figure: an arch from 0 at p = 0, up to 1 at p = 1/2, back to 0 at p = 1. The numbers are added.',
    rows: [
      {
        eq: R`P(X=1)=p,\quad P(X=0)=1-p:\qquad H=p\log_2\frac1p+(1-p)\log_2\frac{1}{1-p}`,
        notes: [shape(R`H:\ 1\times1,\ \ 0\le H\le1\ \text{bit}`)],
      },
      {
        eq: R`p=0.5:\ H=1,\qquad p=0.1:\ H=0.469,\qquad p=0\text{ or }1:\ H=0`,
        notes: [
          lab('p = 0.5: as unpredictable as it gets'),
          lab('p = 0 or p = 1: no information gained by observing'),
          tag(['I80'], R`$0\log0=0$ at the ends`),
        ],
      },
    ],
  },
  {
    id: 'entropy-classes',
    circ: 3,
    title: 'Entropy measures uncertainty',
    why: R`For $C$ classes the same formula measures how spread out a class histogram is: a peaked histogram has low entropy, a flat one high entropy. At a tree node this histogram is the labels of the examples that reached it.`,
    slides: [slide('L2', 87, 'Entropy measures uncertainty')],
    slideNote: R`Figure: histograms of two distributions over 30 bins; a narrow peak with $H=1.77$ and a broad hump with $H=3.09$. The bits/nats conversion in row 3 is added.`,
    pre: [
      text(R`For class labels $Y$: $p_c=P(Y=c)$. There are $C$ classes. Uniform: $H=\log C$.`),
      text(R`The largest entropy arises from a uniform distribution: $H=-\ln(1/30)=3.40$ for 30 bins.`),
    ],
    rows: [
      {
        eq: R`H(Y)=-\sum_{c=1}^{C}p_c\log p_c`,
        notes: [term('Discrete entropy'), tag(['I80'], R`$-\log p=\log\frac1p$, so this is the same formula as before`)],
      },
      {
        eq: R`p_c=\tfrac1C:\quad H=-\sum_{c=1}^{C}\tfrac1C\log\tfrac1C=\log C`,
        notes: [ex(R`$C=30$: $\ln30=3.40$ nats, above both histograms (1.77 and 3.09)`)],
      },
      {
        eq: R`H_{\text{bits}}=\frac{H_{\text{nats}}}{\ln2}`,
        notes: [
          lab('here natural logs give entropy in nats'),
          warn('use the same log base for every term of an information-gain comparison'),
        ],
      },
    ],
  },
  {
    id: 'split-score',
    circ: 4,
    title: 'A split score ranks candidate tests',
    why: R`To choose a split, compare the label entropy before the split with the average entropy of the two children, each weighted by its share of the examples. The drop is the information gain; the best split has the largest one.`,
    slides: [slide('L2', 88, 'A split score ranks candidate tests'), slide('L2', 164, 'Splitting the examples at a node (appendix)')],
    slideNote: R`Slide 164 (appendix) adds the histogram $P_n(c)$ (row 1). The worked example (rows 5 and 6) is added.`,
    pre: [
      text(R`Choose a feature test $h$ from the feature pool and a threshold $\theta$.`),
      text(R`$I_n$ indexes examples at the parent node; $I_{\mathrm L}$ and $I_{\mathrm R}$ are its children.`),
    ],
    rows: [
      {
        eq: R`P_n(c)=\frac{1}{|I_n|}\sum_{i\in I_n}\mathbb I[y_i=c]`,
        notes: [
          lab(R`the histogram of the labels at node $n$: the fraction belonging to class $c$`),
          tag(['C10', 'C12'], 'count the examples with label c, divide by the number at the node'),
          lab(R`$H(I)$ is the entropy of this class-label histogram for the examples in $I$`),
        ],
      },
      {
        eq: R`I_{\mathrm L}=\{i\in I_n:h_n(\mathbf x_i)<\theta_n\},\qquad I_{\mathrm R}=I_n\setminus I_{\mathrm L}`,
        notes: [
          tag(['C12'], 'the right child gets the rest'),
          lab(R`$h(\mathbf x_i)$ tests a feature of example $i$; each example follows one branch; recursively split the child sets`),
        ],
      },
      {
        eq: R`\theta_n\in\Big(\min_{i\in I_n}h_n(\mathbf x_i),\ \max_{i\in I_n}h_n(\mathbf x_i)\Big)`,
        notes: [lab('a threshold outside this range would send every example to the same side')],
      },
      {
        eq: R`IG=H(I_n)-\frac{|I_{\mathrm L}|}{|I_n|}H(I_{\mathrm L})-\frac{|I_{\mathrm R}|}{|I_n|}H(I_{\mathrm R})`,
        notes: [
          term('Information gain'),
          con(R`for a fixed parent $H(I_n)$ is a constant, so maximising IG minimises weighted child entropy`),
          lab(R`choose $h$ and $\theta$ to maximise this information gain`),
        ],
      },
      {
        eq: R`\text{parent }(4,4):\ H=1;\qquad\text{L }(4,1):\ H=0.722,\quad\text{R }(0,3):\ H=0`,
        notes: [ex('8 examples, 4 of each class; the split sends 5 left and 3 right (counts are (class 1, class 0)), entropy in bits')],
      },
      {
        eq: R`IG=1-\tfrac58(0.722)-\tfrac38(0)=0.549\ \text{bits}`,
        notes: [ex('a split that sent (2,2) to each side would score IG = 1 − 1 = 0: no information')],
      },
    ],
  },
  {
    id: 'complexity',
    title: 'Fitting, depth and overfitting',
    why: R`Trees are fast and flexible, but a deep enough tree can isolate every training point. Depth is therefore a complexity dial like $\lambda$ in ridge, and validation picks the sweet spot.`,
    slides: [
      slide('L2', 89, 'Decision trees: fitting and complexity'),
      slide('L2', 90, 'Tree depth and overfitting'),
      slide('L2', 91, 'Model complexity and held-out error'),
      slide('L2', 92, 'Generalisation: a Lecture 1 reminder'),
    ],
    slideNote: R`Slide 90 figure: the five-box partition of slide 83 and its tree drawn with green nodes. Slide 91 figure: prediction error against model complexity; the training-sample curve keeps falling, the validation-sample curve is U-shaped, and a vertical line marks the "sweet spot" at its minimum.`,
    pre: [
      term('Fitting and complexity'),
      text('Fast greedy training algorithms. They work with a heterogeneous pool of features (e.g. shape, size, colour, …).'),
      text('Fast testing algorithm.'),
      text('Needs careful choice of hyper-parameters: maximum depth; number of features and thresholds to try.'),
      warn('Prone to over-fitting.'),
      text('Deeper trees make more complex classifiers. Beyond a useful depth, fitting training detail can hurt unseen performance.'),
      lab(R`Larger ridge $\lambda$ means lower complexity. The held-out curve is schematic.`),
      term('Generalisation: a Lecture 1 reminder'),
      text('Lower training loss does not guarantee better predictions. Validation chooses model complexity and penalty strength.'),
      text('A flexible model can change substantially when its training set changes. Averaging learners can reduce this variation when their errors differ.'),
      text('Next: why ensembles help, and how random forests create diversity. The Lecture 1 risk and bias–variance details remain in the appendix.'),
    ],
    rows: [],
  },
];

export const decisionTrees: Topic = {
  id: 'decision-trees',
  title: 'Decision trees',
  short: 'Trees',
  summary: R`A tree asks feature questions and predicts from leaf label counts. Leaves are Bernoulli (or Gaussian) models; $J(T)=\lambda C(T)-\sum_i\log p(y_i\mid\mathbf x_i;T)$. Grown greedily, choosing each split by information gain $H(I_n)-\sum\frac{|I_\cdot|}{|I_n|}H(I_\cdot)$. Depth controls overfitting.`,
  identities,
  sections,
};

import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';
import DecisionTreeExplorer from '../../widgets/DecisionTreeExplorer';

const sections: Section[] = [
  {
    id: 'trees-intro',
    title: 'Decision trees (1984 CART)',
    why: R`Trees are the first of the "good features" methods: instead of fixing the feature map in advance, the tree builds its features from the data, one test at a time. Lecture 2 (file 25) derived how a split is chosen; this file shows what a tree computes and how to stop it overfitting.`,
    slides: [slide('L3', 7, 'Decision trees (section divider)')],
    slideNote: R`Divider. The agenda lists the six parts of the lecture: decision trees; bagging and random forests; kernels and SVMs; neural networks; expressiveness and representations; backpropagation. The side panel names the 1984 CART trees (Breiman, Friedman, Olshen and Stone). Reading: Murphy (2022) §18.1, classification and regression trees.`,
    pre: [
      text('Agenda: decision trees · bagging and random forests · kernels and SVMs · neural networks · expressiveness and representations · backpropagation.'),
      lab('the trees here are the ones of Lecture 2 (file 25: node splits, entropy, information gain); we do not repeat the splitting criterion'),
    ],
    rows: [],
  },
  {
    id: 'path-feature',
    circ: 1,
    title: 'A path acts as a learned feature',
    why: R`A tree looks like a flowchart, but it can be read as a feature extractor: every leaf is one indicator feature that switches on exactly when an input satisfies all the tests on the way down. A tree prediction is then a linear model on these learned features.`,
    slides: [slide('L3', 8, 'A path acts as a learned feature')],
    slideNote: R`Figure (taken from the AlgoMaster decision-tree animation): the $(x,y)$ plane cut by $x<0.50$, then $y<0.75$ on the left and $y<0.35$ on the right, and the matching tree. Root: 8 A / 8 B. Left child $y<0.75$: 6 A / 2 B, leaves "A, 6 A" and "B, 2 B". Right child $y<0.35$: 2 A / 6 B, leaves "A, 2 A" and "B, 6 B". The slide gives $\phi_{a,b}$ and $\phi_{0.5,0.75}$; the rest (leaves partition the plane, the model as a sum, the numbers) is added.`,
    derive: true,
    rows: [
      {
        eq: R`\phi_{a,b}(x,y)=\mathbb 1\big[x<a,\ y<b\big]`,
        notes: [
          term('Path feature'),
          tag(['C10'], R`$\mathbb 1[\cdot]$ is 1 when every test inside holds and 0 otherwise`),
          lab(R`one feature for one path: here the path "$x<a$, then $y<b$"`),
          shape(R`\phi_{a,b}(x,y):\ 1\times1\ \text{(a single 0/1 number per input)}`),
        ],
      },
      {
        eq: R`\phi_{0.5,\,0.75}(x,y)=\mathbb 1\big[x<0.5,\ y<0.75\big]`,
        notes: [
          ex(R`the thresholds $a=0.5$ and $b=0.75$ of the figure: the path to the top-left leaf "A, 6 A"`),
          lab('a path feature is 1 exactly when every test on that path is satisfied'),
        ],
      },
      {
        eq: R`\phi_{\ell}(\mathbf x)=\prod_{t\in\text{path}(\ell)}\mathbb 1\big[\text{test }t\text{ holds at }\mathbf x\big]`,
        notes: [
          lab(R`a product of 0/1 numbers is 1 only if every factor is 1, which is the "and" of all the tests; $\ell$ labels a leaf`),
          warn('if any single test fails, the whole feature is 0'),
        ],
      },
      {
        eq: R`\sum_{\ell\in\text{leaves}}\phi_\ell(\mathbf x)=1\quad\text{for every }\mathbf x`,
        notes: [
          lab('the leaves partition the input space, so exactly one path feature is on'),
          shape(R`\boldsymbol\phi(\mathbf x)=[\phi_1,\dots,\phi_L]^\top:\ L\times1\ \text{one-hot},\quad L=\text{number of leaves}`),
        ],
      },
      {
        eq: R`f(\mathbf x)=\sum_{\ell=1}^{L}c_\ell\,\phi_\ell(\mathbf x)=\mathbf c^\top\boldsymbol\phi(\mathbf x)`,
        notes: [
          tag(['I12'], R`a weighted sum over leaves is a dot product $\mathbf c^\top\boldsymbol\phi$`),
          lab(R`$c_\ell$ is the value stored at leaf $\ell$: the majority class, the class probabilities, or the mean target (regression)`),
          shape(R`\mathbf c,\ \boldsymbol\phi(\mathbf x):\ L\times1;\quad f(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbf x=(0.3,\ 0.4):\quad \phi_{0.5,0.75}=\mathbb 1[0.3<0.5]\,\mathbb 1[0.4<0.75]=1\cdot1=1`,
        notes: [ex(R`lands in the top-left leaf ("A", 6 A): all other path features are 0 and $f=c_{\text{A}}$`)],
      },
    ],
    callouts: [
      {
        heading: 'Trees are linear models on learned features',
        text: R`The structure of the tree (which tests, in which order) is the part that is learned. Once it is fixed, the model is exactly the linear form $f=\mathbf c^\top\boldsymbol\phi(\mathbf x)$ of Week 1. This is the first example of the lecture's theme: the feature map $\boldsymbol\phi$ is fitted from data, not hand-chosen.`,
      },
    ],
  },
  {
    id: 'depth-overfit',
    circ: 2,
    title: 'Tree depth and overfitting',
    why: R`Each extra split adds a feature and lowers the training error, always. But beyond some depth the splits fit noise in the training set, and error on unseen data goes up. Depth is therefore a complexity knob to be chosen on validation data.`,
    slides: [slide('L3', 9, 'Tree depth and overfitting')],
    slideNote: R`Figure: a decision tree of maximum depth 12 with 36 leaves on a three-ring dataset (inner ring red, middle ring green, outer ring blue). Its decision boundary wraps jaggedly around individual points, and the printed training error is 0.0%. Caption: "Beyond a useful depth, fitting training detail can hurt unseen performance." Same message as Lecture 2 slide 91: training error always falls with depth, validation error is U-shaped. The widget below is added: it grow a tree on noisy data one level at a time and watch the training and validation errors, and the path feature of any point.`,
    pre: [text('Beyond a useful depth, fitting training detail can hurt unseen performance.')],
    rows: [
      {
        eq: R`\text{depth}\uparrow\ \Rightarrow\ \text{leaves}\ L\uparrow\ \Rightarrow\ E_{\text{train}}\downarrow\quad\text{but}\quad E_{\text{val}}\ \text{falls, then rises}`,
        notes: [
          lab('deeper tree = more path features = more flexible model'),
          tag(['C9'], R`$E_{\text{train}}$ is measured on the data used to fit; $E_{\text{val}}$ on held-out data (file 08)`),
          warn('a tree that grows until every leaf is pure has zero training error but poor generalisation'),
        ],
      },
    ],
    extra: <DecisionTreeExplorer />,
  },
  {
    id: 'pruning',
    circ: 3,
    title: 'Pruning a decision tree',
    why: R`Instead of guessing the right depth in advance, grow a large tree and cut it back. A split is kept only if removing it makes validation performance worse. This uses the validation set to undo the greedy tree's overfitting.`,
    slides: [slide('L3', 10, 'Pruning a decision tree')],
    slideNote: R`The slide shows a tree before and after pruning. Before: root test $x_j<\theta$, children "Class A, 8 A 1 B" and "Class B, 1 A 2 B"; validation errors 4/20. After: one leaf "Class A, 9 A 3 B"; validation errors 3/20. The four-step algorithm is on the slide; the arithmetic (rows 2 to 4) is added.`,
    derive: true,
    pre: [
      text('Grow the tree, then remove splits that do not help on validation data.'),
      text('1. Visit a node whose children are leaves.'),
      text('2. Replace its split with a leaf fitted on its training cases.'),
      text('3. Keep the change if validation performance improves.'),
      text('4. Work upwards and repeat.'),
    ],
    rows: [
      {
        eq: R`\text{left leaf: }8\text{ A},\ 1\text{ B}\qquad\text{right leaf: }1\text{ A},\ 2\text{ B}\qquad\text{(training cases)}`,
        notes: [lab('before pruning: the node has two leaves, labelled A and B by the majority of their own training cases')],
      },
      {
        eq: R`\text{merged leaf: }(8+1)\text{ A},\ (1+2)\text{ B}=9\text{ A},\ 3\text{ B}\ \Rightarrow\ \hat p(\text{A})=\frac{9}{12}=0.75,\quad\text{label A}`,
        notes: [
          lab('step 2: replace the split by one leaf fitted on all the training cases that reached the node (add the counts)'),
          shape(R`\hat p(\text{A}):\ 1\times1`),
        ],
      },
      {
        eq: R`E_{\text{train}}:\ \frac{1+1}{12}=\frac{2}{12}\ \longrightarrow\ \frac{3}{12}\qquad\quad E_{\text{val}}:\ \frac{4}{20}\ \longrightarrow\ \frac{3}{20}`,
        notes: [
          lab('training error rises: the merged leaf is labelled A, so it gets all 3 of its B cases wrong (before: 1 B in the left leaf and 1 A in the right leaf, 2 mistakes in 12)'),
          lab('validation error falls from 4 mistakes in 20 to 3 in 20'),
        ],
      },
      {
        eq: R`\frac{3}{20}<\frac{4}{20}\ \Rightarrow\ \text{keep the pruned tree; continue with the parent node}`,
        notes: [lab('step 3: the change is kept because validation performance improved; step 4: repeat upwards until no prune helps')],
      },
    ],
    callouts: [
      {
        heading: 'Pruning lowers training accuracy on purpose',
        text: R`A simpler tree fits the training set worse and may still generalise better. Compare with ridge (file 07): a penalty trades some training fit for stability on new data.`,
      },
    ],
  },
  {
    id: 'train-val-table',
    circ: 4,
    title: 'Training error and validation error',
    why: R`The same task, three ways of controlling tree size. Reading training and validation error together tells you whether a model underfits (both high), overfits (training low, validation much higher) or generalises.`,
    slides: [slide('L3', 11, 'Training error and validation error')],
    slideNote: R`The table of slide 11 has the columns tree construction, training, validation and diagnosis. The "gap" column is added.`,
    derive: true,
    rows: [
      {
        eq: R`\text{Early stopping:}\quad E_{\text{train}}=0.2975,\ \ E_{\text{val}}=0.4588\ \Rightarrow\ \text{underfit}`,
        notes: [lab('stopped too soon: both errors are high, so the tree is too simple (high bias)')],
      },
      {
        eq: R`\text{Exhaustive growth:}\quad E_{\text{train}}=0.0142,\ \ E_{\text{val}}=0.3763\ \Rightarrow\ \text{overfit}`,
        notes: [lab('fits the training set almost perfectly but is far worse on validation data (high variance)')],
      },
      {
        eq: R`\text{Pruning:}\quad E_{\text{train}}=0.1025,\ \ E_{\text{val}}=0.1997\ \Rightarrow\ \text{best of these}`,
        notes: [lab('the lowest validation error of the three, even though its training error is not the lowest')],
      },
      {
        eq: R`\text{gap}=E_{\text{val}}-E_{\text{train}}:\quad 0.4588-0.2975=0.1613,\quad 0.3763-0.0142=0.3621,\quad 0.1997-0.1025=0.0972`,
        notes: [
          ex('overfitting has the largest gap (0.3621); pruning has the smallest (0.0972)'),
          warn('choose the model by validation error, never by training error: exhaustive growth would win on training error (0.0142)'),
        ],
      },
    ],
  },
  {
    id: 'strengths-limits',
    circ: 5,
    title: 'Decision trees: strengths and limits',
    why: R`A short summary of when a tree is a good choice and how to keep it under control. It also sets up the next topic: a single tree is unstable, which is what bagging and forests fix.`,
    slides: [slide('L3', 12, 'Decision trees: strengths and limits')],
    slideNote: R`Two panels: "What makes trees useful" and "How we control complexity". No equations.`,
    pre: [
      lab('What makes trees useful'),
      text('Greedy training is fast. Prediction follows a short path of tests.'),
      text('Tests can use different feature types, such as colour, size or shape.'),
      lab('How we control complexity'),
      text('Choose depth, minimum leaf size and pruning using validation data.'),
      text('Compare held-out performance with the training error.'),
    ],
    rows: [
      {
        eq: R`\text{prediction cost}\approx\text{depth of the tree}=\text{number of comparisons along one root-to-leaf path}`,
        notes: [
          lab('prediction is cheap: no kernel evaluations, no matrix products'),
          warn('greedy training: each split is the best for now, with no joint retuning of earlier tests (slide 29)'),
        ],
      },
    ],
  },
];

export const treesPathFeatures: Topic = {
  id: 'trees-path-features',
  title: 'Decision trees: path features and pruning',
  short: 'Trees and pruning',
  summary: R`A decision tree is a linear model $f=\mathbf c^\top\boldsymbol\phi(\mathbf x)$ on learned path features: one indicator per leaf, exactly one on. Deeper trees fit training data better but can overfit; grow then prune on validation data to choose the size.`,
  identities: [],
  sections,
};

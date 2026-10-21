import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I82',
    area: 'Probability',
    tex: R`P(\text{example }i\text{ not drawn in }N\text{ draws with replacement})=\Big(1-\frac1N\Big)^{N}\xrightarrow{N\to\infty}e^{-1}\approx0.368`,
    note: R`Each draw misses example $i$ with probability $1-1/N$, and the $N$ draws are independent, so the probabilities multiply (I33). So about 37% of the examples are out-of-bag for each tree, and about 63% appear in its bootstrap sample (some several times).`,
  },
];

const sections: Section[] = [
  {
    id: 'forest',
    circ: 1,
    title: 'A forest combines trees',
    why: R`A random forest is an ensemble whose base learners are decision trees. Each tree sends the input to one leaf and reads off a class histogram; the forest averages these histograms, which is the plain-average ensemble from the previous topic applied to probabilities.`,
    slides: [slide('L2', 98, 'Random forests (section divider)'), slide('L2', 99, 'A forest combines trees')],
    slideNote: R`Slide 98 is the divider (reading Murphy §18.4, random forests). Slide 99 figure: trees $T_1,\dots,T_K$ with split nodes (blue) and leaf nodes (green); the input $\mathbf x$ follows a red path to one leaf in each tree, which holds a class histogram $p_{c,1},\dots,p_{c,K}$. References: Amit & Geman 97, Breiman 01, Lepetit et al. 06. Row 2 and the numbers are added.`,
    pre: [text('A forest is an ensemble of decision trees.')],
    rows: [
      {
        eq: R`p_c(\mathbf x)=\frac1K\sum_{k=1}^{K}p_{c,k}(\mathbf x)`,
        notes: [
          lab(R`$K$ counts trees; $p_{c,k}(\mathbf x)$ is tree $k$'s probability for class $c$ (from the leaf $\mathbf x$ reaches)`),
          lab(R`classification is by category $c$`),
          shape(R`p_{c,k}(\mathbf x),\ p_c(\mathbf x):\ 1\times1;\ \ \text{over all classes: }C\times1\ \text{vectors}`),
        ],
      },
      {
        eq: R`\hat y(\mathbf x)=\arg\max_c\,p_c(\mathbf x)`,
        notes: [lab('predict the class with the largest averaged probability'), lab(R`an average of distributions is still a distribution: $\sum_cp_c=1$`)],
      },
      {
        eq: R`K=3,\ \ p_{c,k}(\mathbf x)=0.6,\ 0.9,\ 0.3:\quad p_c(\mathbf x)=\tfrac13(0.6+0.9+0.3)=\tfrac13(1.8)=0.6`,
        notes: [ex('one class, three trees: add the three probabilities (0.6 + 0.9 = 1.5, then 1.5 + 0.3 = 1.8), then divide by K = 3')],
      },
    ],
  },
  {
    id: 'bagging',
    title: 'Bagging uses bootstrap samples',
    why: R`To get learners whose errors differ, train each on a different random version of the training set. Bagging (bootstrap aggregating) draws each version by sampling the original examples with replacement.`,
    slides: [slide('L2', 100, 'Bagging uses bootstrap samples')],
    slideNote: 'Diagram: training examples → training resamples 1, 2, 3 → the same learning algorithm → classifiers 1, 2, 3 → average or vote (on a new input) → prediction.',
    pre: [
      text('Draw N training examples with replacement for each resample.'),
      text('Fit one base learner per resample, then combine votes or probabilities.'),
      term('Bagging'),
      lab('"bootstrap aggregating": bootstrap = resampling with replacement; aggregating = averaging or voting'),
    ],
    rows: [],
  },
  {
    id: 'training',
    title: 'Training a random forest',
    why: R`Random forests add a second source of randomness to bagging: each split only looks at a random subset of features. Both make the trees less alike, which is what lets their errors cancel.`,
    slides: [slide('L2', 101, 'Training a random forest'), slide('L2', 165, 'Learning a forest (appendix)')],
    slideNote: 'Slide 165 (appendix) repeats these steps.',
    pre: [
      text('Draw N examples with replacement for each tree (a bootstrap sample).'),
      text('At each node, search a random subset of measured features.'),
      text("Fit each tree independently, then combine predictions (the trees' votes or class probabilities)."),
      text('Resampling and feature variation make trees less similar: randomisation reduces correlation between trees.'),
      term('Out-of-bag (OOB) predictions'),
      text('Use validation or out-of-bag predictions (from trees that omitted each example) to choose complexity.'),
    ],
    rows: [],
  },
  {
    id: 'bootstrap',
    circ: 2,
    title: 'A bootstrap sample',
    why: R`A concrete bootstrap sample shows the two facts that matter: some examples appear more than once, and some not at all. The ones left out give each tree a free validation set.`,
    slides: [slide('L2', 102, 'A bootstrap sample')],
    slideNote: R`Rows 3 to 7 (how many are left out on average, derived step by step) are added.`,
    rows: [
      {
        eq: R`\text{original indices: }1\ 2\ 3\ 4\ 5\ 6\qquad\longrightarrow\qquad\text{one bootstrap sample: }1\ 1\ 2\ 4\ 4\ 6`,
        notes: [
          lab('six draws with replacement; repeated indices repeat observations'),
          warn('bootstrap samples overlap; they are not disjoint partitions'),
        ],
      },
      {
        eq: R`\text{out-of-bag for this tree: }3,\ 5`,
        notes: [lab('evaluate them using only trees that omitted them during fitting'), lab('at each node, also sample candidate features')],
      },
      {
        eq: R`P(i\text{ missed by one draw})=\frac{N-1}{N}=1-\frac1N`,
        notes: [lab(R`one draw picks one of the $N$ examples uniformly, so it avoids example $i$ in $N-1$ of the $N$ equally likely cases`)],
      },
      {
        eq: R`P(i\text{ missed by all }N\text{ draws})=\underbrace{\Big(1-\frac1N\Big)\Big(1-\frac1N\Big)\cdots\Big(1-\frac1N\Big)}_{N\text{ factors}}=\Big(1-\frac1N\Big)^{N}`,
        notes: [tag(['I82'], 'the draws are independent, so the probabilities multiply')],
      },
      {
        eq: R`N=6:\quad\Big(1-\tfrac16\Big)^{6}=\Big(\tfrac56\Big)^{6}=\frac{5^6}{6^6}=\frac{15625}{46656}=0.335`,
        notes: [
          tag(['I82'], 'chance that a given example is left out of one bootstrap sample'),
          ex(R`expected number left out: $6\times0.335=2.01$. Here 2 of 6 were left out, close to the expected 2.0`),
        ],
      },
      {
        eq: R`\ln\Big(1-\frac1N\Big)^{N}=N\ln\Big(1-\frac1N\Big)=N\Big(-\frac1N-\frac1{2N^2}-\cdots\Big)=-1-\frac1{2N}-\cdots\ \longrightarrow\ -1`,
        notes: [
          lab(R`take the log, then use the series $\ln(1-x)=-x-\tfrac{x^2}2-\cdots$ with $x=1/N$ (a standard series, quoted not proved)`),
          lab(R`every term after $-1$ has a factor of $1/N$ or smaller, so it vanishes as $N\to\infty$`),
        ],
      },
      {
        eq: R`N\to\infty:\quad\Big(1-\tfrac1N\Big)^{N}=e^{\ln(\cdots)}\to e^{-1}=0.368`,
        notes: [tag(['I82'], 'about a third of the data is out-of-bag for each tree, so about 63% appear in its bootstrap sample')],
      },
    ],
  },
  {
    id: 'node-split',
    circ: 3,
    title: 'Randomised learning at a node',
    why: R`Each node of each tree is grown with the same split rule as before, but only a random handful of candidate tests and thresholds is tried. This is cheaper than an exhaustive search and makes different trees choose different splits.`,
    slides: [
      slide('L2', 103, 'Randomized learning'),
      slide('L2', 104, 'Randomising candidate features'),
      slide('L2', 166, 'More randomized learning (appendix)'),
    ],
    slideNote: R`Slide 104 writes the threshold range with a closed left end, $[\min,\max)$; slide 166 writes the open interval $(\min,\max)$. Both mean "inside the observed range".`,
    pre: [
      text(R`Recursively split examples at node $n$. $I_n$ indexes labelled training examples $(\mathbf x_i,y_i)$.`),
      text(R`Choose a random subset of candidate tests from the feature pool $F$ (candidate feature tests $h_n$ at random).`),
      text(R`For each candidate $h$, search thresholds in its observed feature range.`),
    ],
    rows: [
      {
        eq: R`\underbrace{I_{\mathrm L}}_{\text{left split}}=\{i\in I_n\mid\underbrace{h_n(\mathbf x_i)}_{\text{function of example }i\text{'s feature vector}}<\underbrace{\theta_n}_{\text{threshold}}\},\qquad\underbrace{I_{\mathrm R}}_{\text{right split}}=I_n\setminus I_{\mathrm L}`,
        notes: [
          lab(R`$h_n$ is the feature test at node $n$; $\theta_n$ is its split threshold`),
          tag(['C12'], 'the right child gets the rest'),
        ],
      },
      {
        eq: R`\theta\in\Big[\min_{i\in I_n}h(\mathbf x_i),\ \max_{i\in I_n}h(\mathbf x_i)\Big)`,
        notes: [lab('thresholds are chosen within the observed feature-test range')],
      },
      {
        eq: R`(h_n,\theta_n)=\arg\max_{h\in\text{random subset of }F,\ \theta}\ IG(h,\theta)`,
        notes: [
          lab('choose h and θ to maximise the quality of the child nodes'),
          lab('for entropy, use the information-gain criterion introduced earlier (decision-trees topic)'),
          lab('keep the test and threshold giving the greatest information gain'),
          warn('random feature subsets make the trees less correlated'),
        ],
      },
    ],
  },
  {
    id: 'random-tests',
    title: 'Why do random tests work?',
    why: R`It seems wasteful to try only random splits. With few classes, trying several and keeping the best is enough; with many classes, almost any line through the data separates some classes from others, so even random tests are useful.`,
    slides: [slide('L2', 105, 'Why do random tests work?'), slide('L2', 106, 'Why do random tests work? (many classes)')],
    slideNote: 'Figures: five colour clusters with several random lines through them, and the one kept; then about a dozen colour clusters, where every random line separates some groups.',
    pre: [
      text('For a small number of classes: we can try several tests, and retain the best one according to some criterion.'),
      text('In this many-class example, many candidate tests give useful splits.'),
    ],
    rows: [],
  },
  {
    id: 'toy',
    title: 'Toy learning example',
    why: R`A worked growth of one tree with oblique (slanted) tests shows the whole loop: propose random lines, keep the one with the best information gain, split, and repeat inside each child.`,
    slides: [
      slide('L2', 107, 'Toy learning example: candidate lines'),
      slide('L2', 108, 'Toy learning example: first split'),
      slide('L2', 109, 'Toy learning example: left child'),
      slide('L2', 110, 'Toy learning example: right child'),
    ],
    slideNote: R`Slide 107: four clusters (purple top left, blue top middle, red bottom left, green right) and many dashed random lines. Slide 108: the kept root line (solid) separates purple and red from blue and green; new candidates inside the left part. Slide 109: a second solid line separates purple from red; candidates in the right part. Slide 110: a third line separates blue from green; a yellow circle marks a few green points left on the blue side.`,
    pre: [
      text('Try several lines, chosen at random. Keep the line that best separates the data (information gain). Recurse.'),
      lab(R`the circled green points: a greedy tree of limited depth still makes some training errors`),
    ],
    rows: [
      {
        eq: R`\mathbf x=(x_1,x_2)^\top,\qquad h_n(\mathbf x)=w_{n1}x_1+w_{n2}x_2\ \ \text{tested against}\ \ \theta_n`,
        notes: [
          ex(R`with $\mathbf w_n=(1,2)^\top$, $\theta_n=3$ and $\mathbf x=(2,0.4)^\top$: $h_n(\mathbf x)=1\cdot2+2\cdot0.4=2.8<3$, so $\mathbf x$ goes to the left child`),
          lab('four classes: purple, blue, red, green'),
          lab(R`$h_n(\mathbf x)<\theta_n$ is one side of a slanted line; random $(w_{n1},w_{n2})$ give random directions`),
          shape(R`\mathbf x:\ 2\times1,\quad h_n(\mathbf x),\theta_n:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'partitions',
    title: 'Different trees, combined probability maps',
    why: R`Each tree cuts the input space into different pieces and gives each piece a class probability. Averaging many such piecewise maps gives a much smoother probability map than any single tree.`,
    slides: [
      slide('L2', 111, 'Different trees partition the input space'),
      slide('L2', 112, 'Each leaf carries a class probability'),
      slide('L2', 113, 'Combining tree probability maps'),
      slide('L2', 114, 'A combined class probability map'),
      slide('L2', 115, 'The combined map without split lines'),
      slide('L2', 116, 'A probability map for each class'),
    ],
    slideNote: 'Figures only: three rectangles cut by different sets of lines (trees 1 to 3); the same pieces shaded green by class probability (darker means higher); the three overlaid and averaged; the average without the split lines; and one map per class (green, blue, red).',
    pre: [
      text('Different trees give different partitions. One class probability in each leaf.'),
      text('Combining tree outputs: the combined map for one class is the average of the three shaded maps.'),
      lab('without the split lines the combined map looks like a smooth gradient: many small, overlapping pieces'),
      text('Class probability maps: green, blue and red show different classes.'),
    ],
    rows: [
      {
        eq: R`p_c(\mathbf x)=\tfrac13\big(p_{c,1}(\mathbf x)+p_{c,2}(\mathbf x)+p_{c,3}(\mathbf x)\big)`,
        notes: [lab('the forest average, with K = 3 trees, at each point of the plane'), lab('one such map per class c')],
      },
    ],
  },
  {
    id: 'applications',
    title: 'Randomised forests in vision',
    why: 'Random forests are fast at test time (a few comparisons per tree) and handle many classes, which made them a standard tool in computer vision before deep learning, including in a widely shipped product.',
    slides: [slide('L2', 117, 'Randomized forests in vision'), slide('L2', 118, "Kinect's pipeline")],
    slideNote: 'Slide 117: six example applications. Slide 118: a person, the Kinect sensor, a depth image, and body-part labels with 3D joint proposals.',
    pre: [
      term('Selected applications'),
      text('Amit & Geman (97): digit recognition. Lepetit et al. (06): keypoint recognition. Moosmann et al. (06): visual word clustering.'),
      text('Shotton et al. (08): object segmentation. Rogez et al. (08): pose estimation. Criminisi et al. (09): organ detection.'),
      term("Kinect's pipeline"),
      text('A single depth image supplies a classification problem at each pixel.'),
      text('A random forest predicts body-part labels. The body-part distributions support 3D joint estimates.'),
      lab('Shotton et al., CVPR 2011: Real-Time Human Pose Recognition in Parts from a Single Depth Image.'),
      ex('depth image → per-pixel body-part labels → 3D joint proposals'),
    ],
    rows: [],
  },
];

export const randomForests: Topic = {
  id: 'random-forests',
  title: 'Bagging and random forests',
  short: 'Forests',
  summary: R`A forest averages tree class histograms, $p_c(\mathbf x)=\frac1K\sum_kp_{c,k}(\mathbf x)$. Each tree is fitted on a bootstrap sample (about 37% of examples out-of-bag) with random candidate tests at each node, chosen by information gain. Randomisation decorrelates the trees.`,
  identities,
  sections,
};

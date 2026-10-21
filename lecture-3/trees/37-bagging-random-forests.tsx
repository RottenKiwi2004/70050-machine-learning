import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';
import ForestAverager from '../../widgets/ForestAverager';

const sections: Section[] = [
  {
    id: 'bagging',
    title: 'Bagging uses bootstrap samples',
    why: R`The committee argument (file 36) needs learners whose errors differ. We only have one training set, so we manufacture many by resampling it. Bagging (bootstrap aggregating) fits one learner per resample and averages them.`,
    slides: [slide('L3', 23, 'Bagging uses bootstrap samples')],
    slideNote: R`Diagram: a cloud of coloured dots (original data) is bootstrapped into several resamples, each feeds its own classifier, and the classifiers are aggregated into one ensemble classifier (the whole scheme is labelled bagging). Same as Lecture 2 slide 100 (file 27).`,
    pre: [
      text('Draw N training examples with replacement for each resample.'),
      text('Fit one base learner per resample, then combine votes or probabilities.'),
    ],
    rows: [
      {
        eq: R`\mathcal D^{(k)}=\big\{(\mathbf x_{i_1},y_{i_1}),\dots,(\mathbf x_{i_N},y_{i_N})\big\},\quad i_n\sim\text{Uniform}\{1,\dots,N\},\ k=1,\dots,K`,
        notes: [
          term('Bootstrap sample'),
          lab(R`$N$ independent draws, each picking one of the $N$ original examples uniformly, with replacement; $K$ resamples, one per learner`),
          shape(R`|\mathcal D^{(k)}|=N\ \text{(the same size as }\mathcal D)`),
        ],
      },
      {
        eq: R`\hat f_{\text{bag}}(\mathbf x)=\frac1K\sum_{k=1}^{K}\hat f_k(\mathbf x),\qquad \hat f_k=\text{learner fitted on }\mathcal D^{(k)}`,
        notes: [
          lab('regression: average the predictions. Classification: average the class probabilities or take a majority vote'),
          tag(['I12'], R`the average is a weighted sum with every weight $1/K$ (file 36)`),
        ],
      },
    ],
  },
  {
    id: 'bootstrap-example',
    circ: 1,
    title: 'A bootstrap sample and out-of-bag examples',
    why: R`A bootstrap sample repeats some examples and omits others. The omitted ones are a free validation set for that learner, so we can estimate generalisation error without a separate validation split.`,
    slides: [slide('L3', 24, 'A bootstrap sample')],
    slideNote: R`The slide shows six training examples, 1 to 6, and one sample of six draws with replacement: 1 1 2 4 4 6. Examples 1 and 4 repeat; 3 and 5 are omitted (out-of-bag, OOB). Two captions: resamples share observations so their model errors can be correlated; random forests also vary the candidate features to reduce correlation. The probability calculation is added from Lecture 2 (file 27); the OOB formula is added.`,
    derive: true,
    pre: [
      text('Six training examples: 1 2 3 4 5 6.'),
      text('Six draws with replacement: 1 1 2 4 4 6. 1 and 4 repeat; 3 and 5 are omitted.'),
      text('Out-of-bag examples: 3 and 5. Evaluate each using only models that omitted it during fitting.'),
      text('Resamples share observations, so their model errors can be correlated.'),
      text('Random forests also vary the candidate features to reduce correlation.'),
    ],
    rows: [
      {
        eq: R`P(\text{example }i\text{ not chosen in one draw})=1-\frac1N,\qquad P(\text{not chosen in any of }N\text{ draws})=\Big(1-\frac1N\Big)^{N}`,
        notes: [
          tag(['I82'], R`the $N$ draws are independent, so the probabilities multiply`),
          lab(R`$\big(1-\frac1N\big)^N\to e^{-1}\approx0.368$ as $N$ grows (the limit is derived in file 27)`),
        ],
      },
      {
        eq: R`N=6:\ \Big(\frac56\Big)^6=0.335,\ \ \text{expected omitted}=6\cdot0.335\approx2\qquad N\to\infty:\ \approx0.368N\ \text{omitted},\ \ 0.632N\ \text{distinct examples in}\ \mathcal D^{(k)}`,
        notes: [ex(R`the slide's sample omitted exactly 2 of 6 (examples 3 and 5), close to the expected 2`)],
      },
      {
        eq: R`\hat f_{\text{OOB}}(\mathbf x_i)=\frac{1}{|\mathcal K_i|}\sum_{k\in\mathcal K_i}\hat f_k(\mathbf x_i),\qquad E_{\text{OOB}}=\frac1N\sum_{i=1}^{N}\ell\big(y_i,\hat f_{\text{OOB}}(\mathbf x_i)\big)`,
        notes: [
          term('Out-of-bag error'),
          lab(R`$\mathcal K_i$ is the set of trees whose bootstrap sample omitted example $i$; $|\mathcal K_i|$ counts them`),
          lab('every example is predicted only by learners that never saw it, so this is an honest estimate of generalisation error'),
          shape(R`\hat f_{\text{OOB}}(\mathbf x_i),\ \ell:\ 1\times1`),
          warn(R`resamples overlap, so tree errors are positively correlated: this is why bagging alone cannot reach $\sigma^2/K$ (file 36)`),
        ],
      },
    ],
  },
  {
    id: 'forest',
    circ: 2,
    title: 'A forest combines trees',
    why: R`A random forest is bagging with decision trees plus one more source of randomness. Each tree is deep (low bias, high variance), and the average of many different trees keeps the low bias and has a much lower variance.`,
    slides: [slide('L3', 25, 'A forest combines trees')],
    slideNote: R`Figure: trees $T_1,\dots,T_K$ with split nodes and leaf nodes; the input $\mathbf x$ follows a path in each and reaches a leaf holding class probabilities for category $c$. For classification the leaf probabilities are averaged (Amit & Geman 1997; Breiman 2001; Lepetit et al. 2006).`,
    pre: [
      text('A forest is an ensemble of decision trees.'),
      text('Classification is by category c: the leaf probabilities are averaged over the trees.'),
    ],
    rows: [
      {
        eq: R`p_c(\mathbf x)=\frac1K\sum_{k=1}^{K}p_{c,k}(\mathbf x),\qquad\hat y(\mathbf x)=\arg\max_c\,p_c(\mathbf x)`,
        notes: [
          lab(R`$p_{c,k}(\mathbf x)$: the probability that tree $k$ gives to class $c$ (the class share in the leaf that $\mathbf x$ reaches)`),
          shape(R`\mathbf p(\mathbf x)=[p_1,\dots,p_C]^\top:\ C\times1,\ \ \textstyle\sum_cp_c=1`),
          lab('an average of probability vectors is again a probability vector'),
        ],
      },
    ],
  },
  {
    id: 'training',
    circ: 3,
    title: 'Training a random forest',
    why: R`The recipe has two sources of randomness, each aimed at making trees less alike: resampled data and a random subset of candidate features at every node. Less alike means a lower correlation $\rho$, which means more of the variance cancels.`,
    slides: [slide('L3', 26, 'Training a random forest')],
    slideNote: R`Recipe in bullets. Two equations on the slide: the feature set $\mathcal F=\{h_j(\mathbf x)=x_j:j=1,\dots,d\}$ with a random subset $\mathcal F_n\subset\mathcal F$, $|\mathcal F_n|=m<d$, and the split $(h_n^*,\theta_n^*)=\arg\max_{h\in\mathcal F_n,\theta}\text{IG}(I_n;h,\theta)$ (information gain $\text{IG}$ of file 25, $I_n$ the examples at node $n$). Rows 2 and 3 are added. The widget below is added: it average up to 50 bootstrapped trees, with or without random feature choice, and compare test and out-of-bag errors.`,
    derive: true,
    pre: [
      text('Draw a bootstrap sample to train each tree.'),
      text('Train each tree: at each node, search a random subset of measured features; choose the best split within that subset, then recurse.'),
      text('Feature variation reduces correlation between tree predictions.'),
      text('Combine probabilities or votes.'),
      text('Choose complexity using validation or out-of-bag predictions.'),
    ],
    rows: [
      {
        eq: R`\mathcal F=\{h_j(\mathbf x)=x_j:\ j=1,\dots,d\},\qquad \mathcal F_n\subset\mathcal F,\quad |\mathcal F_n|=m<d`,
        notes: [
          lab(R`each candidate "feature" $h_j$ just reads coordinate $j$ of the input; at node $n$ only a random subset $\mathcal F_n$ of $m$ of the $d$ features is allowed`),
          lab(R`a fresh subset is drawn at every node; $m=d$ would recover plain bagging, and $m$ is chosen by validation or OOB`),
          shape(R`d:\ \text{number of input features};\quad m:\ 1\times1\ \text{integer},\ m<d`),
        ],
      },
      {
        eq: R`(h_n^*,\theta_n^*)=\arg\max_{h\in\mathcal F_n,\ \theta}\ \text{IG}(I_n;h,\theta)`,
        notes: [
          tag(['C12'], R`$I_n$ is the set of example indices at node $n$`),
          lab('choose the best split (feature and threshold) within the random subset only, then recurse into the children (information gain: file 25)'),
          shape(R`h_n^*:\ \text{one feature};\ \theta_n^*:\ 1\times1`),
        ],
      },
      {
        eq: R`\operatorname{Var}[\bar f]=\sigma^2\Big[\rho+\frac{1-\rho}{K}\Big]\quad\Longrightarrow\quad\text{lower }\rho\ \text{(random features)}\ \Rightarrow\ \text{lower variance}`,
        notes: [
          tag(['I87'], R`the variance of the average of $K$ trees with correlation $\rho$ (file 36)`),
          lab(R`feature randomisation makes the trees disagree more, which is exactly what pushes $\rho$ down`),
        ],
      },
      {
        eq: R`\text{error estimate}=E_{\text{OOB}}\ \ (\text{no separate validation set})\qquad\text{complexity knobs: }K,\ m,\ \text{depth},\ \text{min leaf size}`,
        notes: [lab('files 27 and 34 give the exact OOB formula and the tree controls')],
      },
    ],
    extra: <ForestAverager />,
  },
  {
    id: 'five-trees',
    circ: 4,
    title: 'A forest composed of five trees',
    why: R`A tiny forest shows the mechanism end to end: each tree is a different, rough partition of the plane, and the average of their class probabilities is a smoother boundary than any one tree gives.`,
    slides: [slide('L3', 27, 'A forest composed of five trees'), slide('L3', 28, 'A forest composed of 5 trees')],
    slideNote: R`Figures only. Slide 27: "Random forest, maximum depth 4, 5/5 trees, training error 7.8%" on the three-ring data (inner red, middle green, outer blue): the forest decision boundary on the left, the five tree structures on the right (12, 12, 11, 12 and 8 leaves). Slide 28: the five trees' own decision regions (tree 0 to tree 4, jagged axis-aligned boxes) and the forest's averaged boundary, which is visibly smoother. The numeric example is added.`,
    pre: [text('Five trees, maximum depth 4. Average their class probabilities.')],
    rows: [
      {
        eq: R`K=5,\ \ p_{c,k}(\mathbf x)=0.9,\ 0.7,\ 0.2,\ 0.8,\ 0.4:\quad p_c(\mathbf x)=\frac{0.9+0.7+0.2+0.8+0.4}{5}=\frac{3.0}{5}=0.6`,
        notes: [
          ex(R`class $c$ at one input $\mathbf x$: two trees (0.2, 0.4) vote against it, three for it; the average is 0.6, so with two classes the prediction is $c$`),
          tag(['I12'], 'the plain average is the dot product with a vector of 1/K weights'),
        ],
      },
    ],
  },
  {
    id: 'greedy-limits',
    circ: 5,
    title: 'Limits of greedy feature selection',
    why: R`Forests are powerful and cheap, but they build their features greedily, one test at a time. The slide ends the tree part by naming the weakness and pointing at the next idea: instead of selecting features, work in a vast fixed feature space through a kernel.`,
    slides: [slide('L3', 29, 'Limits of greedy feature selection')],
    slideNote: R`Two bullets of strengths ("extremely flexible classifiers (power of composition)", "low-cost: simple comparisons, no kernel evaluations"), the weakness ("but: learned greedily; later splits do not jointly retune the earlier tests") and the pointer "An alternative: use a vast feature space through a kernel."`,
    pre: [
      text('Extremely flexible classifiers (power of composition).'),
      text('Low-cost (simple comparisons, no kernel evaluations).'),
      text('But: learned greedily. Later splits do not jointly retune the earlier tests.'),
      text('An alternative: use a vast feature space through a kernel.'),
    ],
    rows: [
      {
        eq: R`\text{greedy:}\ \ \text{choose split }1\ \text{alone, then split }2\ \text{given split }1,\dots\ \ \neq\ \ \text{jointly choose all splits to minimise the final loss}`,
        notes: [
          warn('a split that looks best now can be a poor first step for the whole tree'),
          lab('this is the contrast with neural networks, which fit all layers together with backpropagation (files 46–49)'),
        ],
      },
    ],
  },
];

export const baggingRandomForests: Topic = {
  id: 'bagging-random-forests',
  title: 'Bagging and random forests',
  short: 'Bagging and forests',
  summary: R`Bagging fits $K$ learners on bootstrap samples (each leaves out about 36.8% of the data, the out-of-bag examples) and averages them. A random forest also searches only a random feature subset at each node to lower the correlation $\rho$ between trees. Greedy tree growth remains the main limit.`,
  identities: [],
  sections,
};

import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'C10',
    area: 'Conventions',
    tex: R`\mathbb 1[\text{condition}]=\begin{cases}1 & \text{condition true}\\ 0 & \text{condition false}\end{cases}`,
    note: R`Indicator function. It turns a yes/no test into a number, so a count is a sum of indicators: $\sum_i\mathbb 1[y_i=c]$ counts the examples with label $c$. The slides also write it $\mathbf 1[\cdot]$ (slide L2 13) and $\mathbb I[\cdot]$ (slide L2 164).`,
  },
];

const sections: Section[] = [
  {
    id: 'outline',
    title: 'Lecture 2 outline',
    why: R`Lecture 1 gave the recipe "predictor, objective, fitted parameters" for real-valued targets. Lecture 2 reuses that recipe when the target is a category, and adds the tools needed when there is no closed-form answer. Seeing the four blocks first shows which topic file holds each one.`,
    slides: [
      slide('L2', 1, 'Machine Learning, Lecture 2: Classification & optimisation'),
      slide('L2', 2, 'Building on Week 1'),
      slide('L2', 3, 'Week 2: Classification & optimisation'),
    ],
    slideNote: R`Slide 1 is the title slide. The mapping to topic files and the slide-number warning are added.`,
    pre: [
      term('Last week'),
      text('A predictor, an objective and fitted parameters. Likelihood, regularisation and independent evaluation.'),
      term('This lecture'),
      text('Class probabilities and decision boundaries. Numerical optimisation.'),
      term('Four blocks'),
      text('Classification: problem and classifiers, scores and logistic loss, multiclass probabilities, nonlinear features.'),
      text('Optimisation: gradient descent, Newton–Raphson, SGD, L1 and L2 regularisation.'),
      text('Trees and ensembles: decision trees, ensembles and bagging, random forests.'),
      text('Decisions and evaluation: decision costs, evaluation metrics, thresholds and reliability.'),
      lab('In these notes: one folder per block, plus an appendix folder for the reference slides at the end of the deck.'),
      lab('Reading: Murphy, Probabilistic Machine Learning: An Introduction, §1.2.1 (classification).'),
      warn(R`Slide badges use the PDF page number. The number printed in the slide corner is the same up to page 47, then 2 higher (pages 48 to 68), 4 higher (pages 69 to 166) and 5 higher (pages 167 to 169). Example: PDF page 49 is printed "51".`),
    ],
    rows: [
      {
        eq: R`\underbrace{f_{\mathbf w}(\mathbf x)}_{\text{predictor}}\quad\longrightarrow\quad\underbrace{L(\mathbf w)}_{\text{objective}}\quad\longrightarrow\quad\underbrace{\hat{\mathbf w}}_{\text{fitted parameters}}`,
        notes: [
          lab('the Week 1 recipe, reused with a classification loss'),
          tag(['C3'], R`fitting means $\hat{\mathbf w}\in\arg\min_{\mathbf w}L(\mathbf w)$`),
        ],
      },
    ],
  },
  {
    id: 'problem',
    title: 'Classification predicts a category',
    why: R`Regression predicted a number. Many tasks instead ask "which kind is this?": face or background, spam or legitimate. The target is now a label from a fixed list, so the model must output a class (or a probability for each class), and its errors are counted differently.`,
    slides: [slide('L2', 4, 'Classification predicts a category'), slide('L2', 5, 'Test time: deploy the learned function')],
    slideNote: R`Slide 4: image patches, background (red) on the left and faces (green) on the right, separated by a curved decision boundary. Slide 5: a window scanned over a photo; each window goes into the classifier, which answers face or non-face.`,
    pre: [
      text('Input: an observed example, such as an image or a message.'),
      text('Target: a category, such as face / background or spam / legitimate.'),
      term('Decision boundary'),
      lab('the surface in input space where the predicted class changes'),
      term('Test time'),
      text('Scan a window over the image, at multiple scales and multiple orientations.'),
      text('Classify each window as either face or non-face.'),
    ],
    rows: [
      {
        eq: R`\text{Window}\ \longrightarrow\ \text{Classifier}\ \longrightarrow\ \{\text{Face},\ \text{Non-face}\}`,
        notes: [
          lab('slide 5 diagram: one classifier decision per window'),
          ex('a photo scanned at several scales gives thousands of windows, so the classifier must be fast at test time'),
        ],
      },
    ],
  },
  {
    id: 'data',
    circ: 1,
    title: 'Binary training data and label convention',
    why: R`Before any model we fix the notation: what one training example looks like, which values a label can take, and why a 1 is put in front of every input. Every shape later in the lecture is checked against these.`,
    slides: [slide('L2', 6, 'Binary training data and label convention')],
    slideNote: 'The shapes and the design-matrix row are added, following Lecture 1.',
    pre: [
      text(R`$N$ is the number of training examples; $i$ indexes an example.`),
      text(R`The input has $D$ measured coordinates. $y_i$ is its observed label.`),
      text(R`We include the intercept coordinate $x_{i0}=1$ in the input vector. Coordinate $j$ runs from $0$ to $D$. Bold symbols denote vectors.`),
    ],
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N},\qquad y_i\in\{0,1\}`,
        notes: [
          term('Binary labels'),
          lab(R`$y_i=1$: the class of interest (face, spam); $y_i=0$: the other class`),
          shape(R`y_i:\ 1\times1\ \text{(a number, 0 or 1)}`),
        ],
      },
      {
        eq: R`\mathbf x_i=(\htmlClass{c-red}{1},x_{i1},\dots,x_{iD})^\top\in\mathbb R^{D+1}`,
        notes: [
          lab(R`the leading 1 is $x_{i0}$; it multiplies the intercept $w_0$`),
          shape(R`\mathbf x_i:\ (D+1)\times1\ \text{(a column; the }{}^\top\text{ turns the written row into a column)}`),
        ],
      },
      {
        eq: R`X=\begin{bmatrix}\mathbf x_1^\top\\ \vdots\\ \mathbf x_N^\top\end{bmatrix},\qquad \mathbf y=\begin{bmatrix}y_1\\ \vdots\\ y_N\end{bmatrix}`,
        notes: [
          tag(['C6'], R`row $i$ of $X$ is example $i$ written as a row`),
          shape(R`X:\ N\times(D+1),\qquad \mathbf y:\ N\times1`),
          lab('same design matrix as least squares; slide L2 21 uses it for the log-likelihood'),
        ],
      },
    ],
  },
  {
    id: 'knn',
    circ: 2,
    title: 'k-nearest-neighbour classification',
    why: R`The simplest classifier needs no parameters at all: look at the labelled examples closest to the query and let them vote. It is the classification version of the local averaging from Lecture 1, and its weaknesses motivate the parametric models that follow.`,
    slides: [slide('L2', 7, 'k-nearest-neighbour classification')],
    slideNote: R`Figure: a query $\times$ among "$-$" and "$+$" examples, with circles holding the 1, 2 and 3 nearest neighbours. The vote rule (row 2) and the three worked predictions are added, read from the figure.`,
    pre: [
      text(R`$k$ is the number of neighbours; use Euclidean distance here.`),
      text(R`Take a majority vote among the $k$ nearest labelled inputs.`),
      text(R`$\times$ marks a query. Resolve ties using the nearest tied-class neighbour.`),
    ],
    rows: [
      {
        eq: R`d(\mathbf x,\mathbf x_i)=\lVert\mathbf x-\mathbf x_i\rVert_2=\Big(\sum_{j=1}^{D}(x_j-x_{ij})^2\Big)^{1/2}`,
        notes: [
          term('Euclidean distance'),
          tag(['I51'], 'the L2 norm of the difference vector'),
          lab(R`the intercept coordinate is left out: it is 1 for every input, so it adds nothing to a distance`),
          shape(R`\mathbf x-\mathbf x_i:\ D\times1,\qquad d:\ 1\times1`),
        ],
      },
      {
        eq: R`\hat y(\mathbf x)=\arg\max_{c}\sum_{i\in\mathcal N_k(\mathbf x)}\mathbb 1[y_i=c]`,
        notes: [
          term('Majority vote'),
          lab(R`$\mathcal N_k(\mathbf x)$: indices of the $k$ training inputs closest to $\mathbf x$`),
          tag(['C10'], R`the sum counts the neighbours with label $c$`),
        ],
      },
      {
        eq: R`k=1:\ \{-\}\Rightarrow -,\qquad k=2:\ \{-,+\}\ \text{tie}\Rightarrow -,\qquad k=3:\ \{-,+,+\}\Rightarrow +`,
        notes: [
          ex(R`the slide's three panels: the nearest point is a "$-$"; at $k=2$ the tie goes to the class of the nearest tied neighbour, "$-$"; at $k=3$ two "$+$" outvote one "$-$"`),
          warn(R`the prediction for the same query changes with $k$: $k$ is a setting to choose with validation`),
        ],
      },
    ],
  },
  {
    id: 'regions',
    title: 'Nearest-neighbour decision regions',
    why: R`Colouring every point of the plane by its predicted class shows what the vote rule does as a whole. Comparing $k=1$ with $k=3$ shows how a larger $k$ smooths the regions.`,
    slides: [
      slide('L2', 8, 'Labelled observations'),
      slide('L2', 9, 'Nearest-neighbour decision regions: one neighbour'),
      slide('L2', 10, 'Nearest-neighbour decision regions: three neighbours'),
    ],
    slideNote: 'Figures only. The descriptions are read from the plots.',
    pre: [
      text('This nearest-neighbour example has three classes (red, green, blue). Each point is a training input. Colour denotes its class.'),
      text('Background colour shows the predicted class. White denotes tied votes.'),
      lab(R`$k=1$: ragged regions with small islands around single stray points: every training point claims the area nearest to it.`),
      lab(R`$k=3$: the islands around isolated points mostly disappear; white patches appear where the three neighbours belong to three different classes.`),
      text('More neighbours average over a larger local region.'),
      warn(R`$k=1$ fits every training point perfectly (each point is its own nearest neighbour), so its training error is 0: a sign of overfitting, not of a good classifier.`),
    ],
    rows: [],
  },
  {
    id: 'knn-challenges',
    circ: 3,
    title: 'Challenges of k-nearest-neighbour classification',
    why: R`k-NN looks free, but its cost is moved to test time, and in many dimensions "nearest" stops meaning "similar". These problems are why we prefer a model with a fixed set of parameters.`,
    slides: [slide('L2', 11, 'Challenges of k-nearest neighbor classification')],
    slideNote: R`The general formula in row 2 is added; the slide gives the three cases.`,
    pre: [
      term('Memory'),
      text('Storing the training pairs grows linearly with sample count for a fixed input dimension.'),
      term('Prediction'),
      text('Access the stored examples. A straightforward full scan grows linearly with sample count. An index may be faster.'),
      term('Locality'),
      text('The curse of dimensionality: neighbourhoods become sparse.'),
    ],
    rows: [
      {
        eq: R`\text{storage}\propto N\,(D+1),\qquad \text{one prediction by full scan}\propto N\,D`,
        notes: [
          lab(R`"$\propto$": grows in proportion to. Each stored pair has $D$ inputs and one label.`),
          lab(R`one distance costs about $D$ operations, and a full scan computes $N$ of them`),
        ],
      },
      {
        eq: R`\text{cells}=10^{D},\qquad\text{points per cell}=\frac{N}{10^{D}}`,
        notes: [
          term('Curse of dimensionality'),
          lab(R`10 bins per coordinate, so the number of cells multiplies by 10 with each extra dimension`),
        ],
      },
      {
        eq: R`N=30:\quad D=1:\ \tfrac{30}{10}=3,\qquad D=2:\ \tfrac{30}{100}=0.3,\qquad D=3:\ \tfrac{30}{1000}=0.03`,
        notes: [
          ex('the slide: 30 observations, 10 bins per coordinate'),
          warn('with 3 coordinates most cells are empty, so the "nearest" neighbours are far away and no longer local'),
        ],
      },
    ],
  },
];

export const classificationProblem: Topic = {
  id: 'classification-problem',
  title: 'The classification problem',
  short: 'Classification',
  summary: R`Lecture 2 outline, binary labels $y_i\in\{0,1\}$ with $\mathbf x_i\in\mathbb R^{D+1}$, the k-nearest-neighbour vote, its decision regions, and why its memory, test-time cost and the curse of dimensionality push us towards parametric classifiers.`,
  identities,
  sections,
};

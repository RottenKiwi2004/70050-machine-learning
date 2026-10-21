import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'svm-intro',
    title: 'Kernels and SVMs (1995)',
    why: R`Trees build features greedily. Support vector machines take the opposite route: pick a very rich feature space in advance, then fit a simple linear classifier in it with a clear criterion (the biggest margin). The whole part is marked non-examinable, so read it for the idea, not for derivations.`,
    slides: [slide('L3', 30, 'Kernels and SVMs (section divider, non-examinable)')],
    slideNote: R`Non-examinable divider. Side panel: 1995 Support vector machines, Cortes and Vapnik. Reading: Murphy (2022) §§17.1, 17.3, kernels and support vector machines. Slides 30 to 36 are in the main part of the lecture; the margin and kernel mathematics are in the appendix (slides 117–124, file 52).`,
    pre: [lab('Non-examinable: the idea matters, the optimisation problem is not derived in this course (slide 32).')],
    rows: [],
  },
  {
    id: 'hyperplane',
    circ: 1,
    title: 'Choosing a separating hyperplane',
    why: R`Many lines separate two classes that can be separated at all, and they generalise differently. The SVM picks the one with the most room on both sides: the largest clearance (margin) to the nearest training points.`,
    slides: [slide('L3', 31, 'Choosing a separating hyperplane (non-examinable)')],
    slideNote: R`Figure: four panels, each with the same two classes (blue dots left, red triangles right) and a different separating line. Three lines separate the data but pass close to one class; the bottom-right line sits in the middle of the gap. Text: "Which boundary has greatest clearance from the training data? A support vector machine (SVM) chooses a large-margin separator. First use the input space; then introduce a kernel."`,
    pre: [
      text('Which boundary has greatest clearance from the training data?'),
      text('A support vector machine (SVM) chooses a large-margin separator.'),
      text('First use the input space; then introduce a kernel.'),
    ],
    rows: [
      {
        eq: R`\hat y=\operatorname{sign}\big(\mathbf w^\top\mathbf x+b\big),\qquad y_i\in\{-1,+1\}`,
        notes: [
          tag(['C11'], R`signed labels $y_\pm\in\{-1,+1\}$ (file 16); the margin of example $i$ is $y_i(\mathbf w^\top\mathbf x_i+b)$, positive when classified correctly`),
          lab(R`the decision boundary is the hyperplane $\mathbf w^\top\mathbf x+b=0$`),
          shape(R`\mathbf w,\ \mathbf x:\ D\times1;\quad b,\ \mathbf w^\top\mathbf x:\ 1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Margin in one line',
        text: R`The margin is the distance from the boundary to the closest training point. A larger margin means a small change in the data or in the boundary does not flip any training label, which is the intuition for better generalisation. The exact formula, $\gamma_i=y_i(\mathbf w^\top\mathbf x_i+b)/\lVert\mathbf w\rVert$, is on appendix slide 120 (file 52).`,
      },
    ],
  },
  {
    id: 'support-vectors',
    circ: 2,
    title: 'Support vectors determine the classifier',
    why: R`The learned weight vector is not an arbitrary combination of all training points: only the points that touch the margin (the support vectors) have a nonzero coefficient. So the classifier is described by a handful of training examples.`,
    slides: [slide('L3', 32, 'Support vectors determine the classifier (non-examinable)')],
    slideNote: R`Figure: the separating line $\mathbf w^\top\mathbf x+b=0$, two parallel dashed lines through the nearest blue and red points (the support vectors, circled), the weight vector $\mathbf w$ perpendicular to the line and the offset $b/\lVert\mathbf w\rVert$ from the origin; the formula $f(x)=\sum_i\alpha_iy_i(\mathbf x_i^\top\mathbf x)+b$ with an arrow to the support vectors. The numeric example in rows 3 and 4 is added.`,
    derive: true,
    pre: [
      text('α_i ≥ 0 is learned. Only α_i > 0 contribute: the support vectors.'),
      text('Optimisation chooses the signed coefficients α_i y_i and the bias b.'),
      text('We will not derive the optimisation problem in this course.'),
    ],
    rows: [
      {
        eq: R`\mathbf w=\sum_{i=1}^{N}\alpha_iy_i\,\mathbf x_i,\qquad y_i\in\{-1,+1\},\quad\alpha_i\ge0`,
        notes: [
          term('Support vector expansion'),
          lab(R`$\alpha_i\ge0$ is learned; $\alpha_i y_i$ is a signed coefficient; $\mathbf w$ is a weighted sum of the training inputs`),
          tag(['I71'], R`a weighted sum of example vectors is $X^\top$ times the weight vector: $\mathbf w=X^\top(\boldsymbol\alpha\odot\mathbf y)$`),
          shape(R`\mathbf w,\ \mathbf x_i:\ D\times1;\quad\alpha_i,\ y_i:\ 1\times1`),
        ],
      },
      {
        eq: R`\alpha_i>0\ \Leftrightarrow\ \mathbf x_i\ \text{is a support vector}\ \Rightarrow\ \mathbf w=\sum_{i\in\text{SV}}\alpha_iy_i\,\mathbf x_i`,
        notes: [
          lab('every training point with alpha = 0 drops out of the sum; they could be deleted without changing the classifier'),
          lab('support vectors lie on the margin (the dashed lines in the figure)'),
        ],
      },
      {
        eq: R`f(\mathbf x)=\mathbf w^\top\mathbf x+b=\Big(\sum_{i\in\text{SV}}\alpha_iy_i\mathbf x_i\Big)^\top\mathbf x+b=\sum_{i\in\text{SV}}\alpha_iy_i\,(\mathbf x_i^\top\mathbf x)+b`,
        notes: [
          tag(['I2', 'I8'], R`transpose of a sum is the sum of transposes; the inner product is linear, so $\mathbf w^\top\mathbf x$ splits term by term`),
          lab(R`the classifier only needs inner products $\mathbf x_i^\top\mathbf x$ between the new point and the support vectors`),
          shape(R`\mathbf x_i^\top\mathbf x:\ 1\times1;\quad f(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`\text{SV}_1:\ \mathbf x_1=\begin{bmatrix}1\\1\end{bmatrix},\ y_1=+1,\ \alpha_1=0.5;\quad \text{SV}_2:\ \mathbf x_2=\begin{bmatrix}-1\\-1\end{bmatrix},\ y_2=-1,\ \alpha_2=0.5;\quad b=0`,
        notes: [ex(R`a toy classifier with two support vectors (invented numbers, not from the slide)`)],
      },
      {
        eq: R`\mathbf w=0.5(+1)\begin{bmatrix}1\\1\end{bmatrix}+0.5(-1)\begin{bmatrix}-1\\-1\end{bmatrix}=\begin{bmatrix}0.5\\0.5\end{bmatrix}+\begin{bmatrix}0.5\\0.5\end{bmatrix}=\begin{bmatrix}1\\1\end{bmatrix}`,
        notes: [shape(R`\mathbf w:\ 2\times1`), lab('two vectors of the same shape added entry by entry')],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}2\\0\end{bmatrix}:\quad f=\mathbf w^\top\mathbf x+b=2+0=2\ \Rightarrow\ \hat y=\operatorname{sign}(2)=+1`,
        notes: [
          ex(R`same answer through support vectors: $0.5(+1)(\mathbf x_1^\top\mathbf x)+0.5(-1)(\mathbf x_2^\top\mathbf x)=0.5(2)-0.5(-2)=2$, since $\mathbf x_1^\top\mathbf x=2$ and $\mathbf x_2^\top\mathbf x=-2$`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Why this form matters',
        text: R`The prediction depends on $\mathbf x$ only through the inner products $\mathbf x_i^\top\mathbf x$. If we replace the input by features $\boldsymbol\phi(\mathbf x)$, those become $\boldsymbol\phi(\mathbf x_i)^\top\boldsymbol\phi(\mathbf x)$, and we never need $\boldsymbol\phi$ itself, only that inner product: the kernel (next file).`,
      },
    ],
  },
  {
    id: 'nonlinear',
    circ: 3,
    title: 'Nonlinear separation through features',
    why: R`A straight line in the input may be too weak. The fix is the one from Week 1: apply a feature map first. A linear boundary in feature space is a curved boundary back in the input.`,
    slides: [slide('L3', 33, 'Nonlinear separation through features (non-examinable)')],
    slideNote: R`Figure (top): one-dimensional data on a line, red points on the outside and blue points in the middle, so no single threshold separates them. Middle: the map $\mathbf x\mapsto\boldsymbol\phi(\mathbf x)$. Bottom: the same points plotted in the $(x,x^2)$ plane, where one straight line (with the circled support vectors) separates blue from red. Text: "A linear boundary in the original input may be insufficient. A linear classifier in the feature space can be nonlinear in the original input."`,
    pre: [
      text('A linear boundary in the original input may be insufficient.'),
      text('A linear classifier in the feature space can be nonlinear in the original input.'),
    ],
    rows: [
      {
        eq: R`x\ \mapsto\ \boldsymbol\phi(x)=\begin{bmatrix}x\\x^2\end{bmatrix}:\quad\text{blue: }|x|<1,\ \text{red: }|x|>1\ \Rightarrow\ \text{the line }x^2=1\ \text{separates them}`,
        notes: [
          ex(R`the slide's 1D picture (the thresholds are my own illustration): no threshold on $x$ separates inner from outer points, but a threshold on the second feature $x^2$ does`),
          shape(R`x:\ 1\times1;\quad\boldsymbol\phi(x):\ 2\times1`),
        ],
      },
      {
        eq: R`\mathbf x\ \mapsto\ \boldsymbol\phi(\mathbf x),\qquad f(\mathbf x)=\mathbf w^\top\boldsymbol\phi(\mathbf x)+b`,
        notes: [
          lab(R`same classifier form as slide 32, with $\mathbf x$ replaced by the feature vector $\boldsymbol\phi(\mathbf x)$`),
          shape(R`\mathbf x:\ D\times1;\quad\boldsymbol\phi(\mathbf x),\ \mathbf w:\ M\times1`),
          warn(R`$M$ can be huge, or infinite (Gaussian kernel): we cannot always compute $\boldsymbol\phi(\mathbf x)$`),
        ],
      },
    ],
  },
  {
    id: 'kernel-expansion',
    circ: 4,
    title: 'A classifier as a kernel expansion',
    why: R`The support-vector form lets us avoid computing the (possibly infinite) feature vectors: define the kernel as their inner product, compute it directly, and the prediction needs only kernel evaluations at the support vectors.`,
    slides: [slide('L3', 34, 'A classifier as a kernel expansion (non-examinable)')],
    slideNote: R`The slide gives all three lines of the derivation; the stand-alone kernel definition $k(\mathbf x,\mathbf z)=\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)$ is on slide 122 (appendix). Caption: "SV: support vectors. Labels $y_i=\pm1$. Coefficients $\alpha_i\ge0$ are learned. Prediction only needs kernel evaluations at the support vectors."`,
    derive: true,
    pre: [
      text('The learned weight vector is a combination of support-vector features.'),
      text('SV: support vectors. Labels y_i = ±1. Coefficients α_i ≥ 0 are learned.'),
      text('Prediction only needs kernel evaluations at the support vectors.'),
    ],
    rows: [
      {
        eq: R`\mathbf w=\sum_{i\in\text{SV}}\alpha_iy_i\,\boldsymbol\phi(\mathbf x_i)`,
        notes: [lab('the weight vector is a combination of support-vector features'), shape(R`\mathbf w,\ \boldsymbol\phi(\mathbf x_i):\ M\times1`)],
      },
      {
        eq: R`f(\mathbf x;\mathbf w)=\mathbf w^\top\boldsymbol\phi(\mathbf x)+b=\sum_{i\in\text{SV}}\alpha_iy_i\,\boldsymbol\phi(\mathbf x_i)^\top\boldsymbol\phi(\mathbf x)+b`,
        notes: [tag(['I2', 'I8'], R`transpose the sum and take the inner product term by term, as on slide 32`)],
      },
      {
        eq: R`\boldsymbol\phi(\mathbf x_i)^\top\boldsymbol\phi(\mathbf x)=k(\mathbf x_i,\mathbf x)\ \Rightarrow\ f(\mathbf x)=\sum_{i\in\text{SV}}\alpha_iy_i\,k(\mathbf x_i,\mathbf x)+b`,
        notes: [
          term('Kernel'),
          lab(R`$k(\mathbf x_i,\mathbf x)$ is the inner product of the two feature vectors, computed without forming them`),
          shape(R`k(\mathbf x_i,\mathbf x):\ 1\times1\ (\text{a similarity score})`),
          lab('prediction cost: one kernel evaluation per support vector'),
        ],
      },
    ],
  },
];

export const svmSupportVectors: Topic = {
  id: 'svm-support-vectors',
  title: 'SVMs and support vectors',
  short: 'SVMs',
  summary: R`A (non-examinable) SVM picks the large-margin separator. Its weight vector is $\mathbf w=\sum_{i\in\text{SV}}\alpha_iy_i\boldsymbol\phi(\mathbf x_i)$ over the support vectors ($\alpha_i>0$), so $f(\mathbf x)=\sum_{i\in\text{SV}}\alpha_iy_ik(\mathbf x_i,\mathbf x)+b$: only kernel evaluations are needed.`,
  identities: [],
  sections,
};

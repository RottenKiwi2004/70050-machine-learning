import { R, ex, lab, shape, slide, tag, term, text } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I96',
    area: 'Linear algebra',
    tex: R`f(\mathbf x)=\mathbf w^\top\mathbf x+b:\quad\text{signed distance from }\mathbf x\text{ to }\{f=0\}\ =\ \frac{f(\mathbf x)}{\lVert\mathbf w\rVert},\qquad\mathbf w\perp\{f=0\}`,
    note: R`The vector $\mathbf w$ ($D\times1$) is perpendicular to the hyperplane $\mathbf w^\top\mathbf x+b=0$ (two points $\mathbf u,\mathbf v$ on it satisfy $\mathbf w^\top(\mathbf u-\mathbf v)=0$). Write any point as $\mathbf x=\mathbf x_\perp+r\,\frac{\mathbf w}{\lVert\mathbf w\rVert}$ with $\mathbf x_\perp$ on the hyperplane, so $r$ is the signed distance along the unit normal. Then $f(\mathbf x)=\underbrace{f(\mathbf x_\perp)}_{0}+r\frac{\mathbf w^\top\mathbf w}{\lVert\mathbf w\rVert}=r\lVert\mathbf w\rVert$, hence $r=f(\mathbf x)/\lVert\mathbf w\rVert$ (using $\mathbf w^\top\mathbf w=\lVert\mathbf w\rVert^2$, I51). $r>0$ on the side $\mathbf w$ points to. Check: $\mathbf w=(3,4)^\top$, $b=-5$, $\mathbf x=(3,4)^\top$: $f=25-5=20$, $\lVert\mathbf w\rVert=5$, $r=4$.`,
  },
  {
    id: 'I97',
    area: 'Algebra & calculus',
    tex: R`e^{u}=\sum_{r=0}^{\infty}\frac{u^{r}}{r!},\qquad e^{a+b}=e^{a}e^{b},\qquad(u\,v)^r=u^rv^r`,
    note: R`The exponential series (it converges for every real $u$), the rule for the exponential of a sum, and the power of a product. $r!=1\cdot2\cdots r$, $0!=1$. Check $u=1$: $1+1+\tfrac12+\tfrac16+\tfrac1{24}+\cdots=2.718\ldots=e$. This series is what turns one exponential into an infinite list of polynomial terms in the Gaussian kernel expansion.`,
  },
];

const sections: Section[] = [
  {
    id: 'svm-mattered',
    title: 'Appendix: kernels and margins; why SVMs mattered',
    why: R`Support vector machines (file 38) were the main competitor of neural networks in the 1990s. Seeing what they were and why they were attractive explains why the field switched back to deep learning only once data and compute allowed it (file 40). Everything in this appendix is marked non-examinable; it fills in the maths behind the SVM slides of the main lecture.`,
    slides: [
      slide('L3', 117, 'Appendix: kernels and margins (divider)'),
      slide('L3', 118, 'Why support vector machines mattered'),
    ],
    slideNote: R`Slide 117 is the divider with sub-topics "Large margins", "Kernel evaluations", "Gaussian feature expansion"; Reading: K. Murphy (2022), §§17.1, 17.3. Slide 118 ("Non-examinable"): heading "1990s: SVMs challenge multilayer perceptrons (MLPs)". "SVMs became a leading alternative to MLPs, with convex training, margin-based theory and flexible kernels." "Handwritten digit recognition was an important comparison between kernel methods and neural networks." In blue: "The strongest method depended on the benchmark, preprocessing and training data." Sources: Cortes & Vapnik (1995); LeCun et al. (1998).`,
    pre: [
      text('1990s: SVMs challenge multilayer perceptrons (MLPs).'),
      text('SVMs became a leading alternative to MLPs, with convex training, margin-based theory and flexible kernels.'),
      text('Handwritten digit recognition was an important comparison between kernel methods and neural networks.'),
      text('The strongest method depended on the benchmark, preprocessing and training data.'),
    ],
    rows: [
      {
        eq: R`\underbrace{\tfrac12\lVert\mathbf w\rVert^2}_{\text{convex}}+C\sum_i\underbrace{\max(0,1-y_if(\mathbf x_i))}_{\text{convex in }(\mathbf w,b)}\ \Rightarrow\ \text{one global minimum, no local minima}`,
        notes: [
          term('Convex training'),
          lab(R`each term is convex in $(\mathbf w,b)$ (a squared norm; a maximum of two affine functions), and a sum of convex functions is convex. A neural network's loss, by contrast, is not convex in its weights (it can have local minima). This is the attractive property the slide refers to (not derived on the slide)`),
          lab('margin-based theory: the generalisation bounds depend on the margin (next slides). Kernels: nonlinear classifiers from the same linear machinery (file 39)'),
        ],
      },
    ],
  },
  {
    id: 'large-margins',
    circ: 1,
    title: 'Large margins and imperfect separation',
    why: R`There are many lines that classify the training set perfectly. The SVM picks the one that stays as far as possible from the closest points, because such a separator is least likely to be disturbed by a new point near the boundary. When the classes overlap, we must allow some mistakes, and the price of a mistake becomes a setting to choose.`,
    slides: [slide('L3', 119, 'Large margins and imperfect separation')],
    slideNote: R`Two scatter plots of blue dots (left cluster) and red triangles (right cluster) with one blue dot lying near the red cluster. Left plot: a tilted line that separates all points but passes very close to that outlier and to the red points; caption "All points on the correct side!". Right plot: a vertical line in the gap between the clusters that leaves the one blue dot on the red side (a single misclassified point) but is far from all the others; caption "But this looks better overall!". Text: "Prefer a separator with the largest minimum geometric margin." "Allow some violations when they improve the overall tradeoff. Choose the tradeoff using validation data."`,
    derive: true,
    pre: [
      text('Prefer a separator with the largest minimum geometric margin.'),
      text('Allow some violations when they improve the overall tradeoff.'),
      text('Choose the tradeoff using validation data.'),
    ],
    rows: [
      {
        eq: R`\max_{\mathbf w,b}\ \min_{i=1,\dots,N}\ \gamma_i\qquad\text{(largest minimum geometric margin)}`,
        notes: [
          lab(R`for each candidate line, find the point closest to it (the smallest margin $\gamma_i$, defined on the next slide); choose the line for which that smallest margin is largest`),
          lab('imperfect separation (right plot): allow a few points on the wrong side if that buys a much wider margin for all the others; how many to allow is the tradeoff, and is set by validation (the constant C of slide 121)'),
          shape(R`\gamma_i:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'geometric-margin',
    circ: 2,
    title: 'Geometric margin',
    why: R`"Margin" has to be a distance we can compare between examples and between lines. The raw score $f(\mathbf x)$ is not such a distance, because scaling $\mathbf w$ and $b$ by 2 doubles the score without moving the line. Dividing by $\lVert\mathbf w\rVert$ removes that arbitrary scale.`,
    slides: [slide('L3', 120, 'Geometric margin')],
    slideNote: R`Left: a 2D diagram with axes $x_1$ (horizontal), $x_2$ (vertical). A red line is the decision boundary ($y=0$; $y>0$ on one side, $y<0$ on the other; regions $\mathcal R_1$ and $\mathcal R_2$). A green arrow $\mathbf w$ from the origin is perpendicular to the line. A blue arrow from the origin to a point $\mathbf x$, a dashed blue segment from $\mathbf x$ down to the line meeting it at $\mathbf x_\perp$, and an orange arrow along that segment (the signed distance). Right text: "The signed distance to the decision boundary measures how clearly an example is classified." $\gamma_i=\dfrac{y_i(\mathbf w^T\mathbf x_i+b)}{\lVert\mathbf w\rVert}$. "Labels $y_i\in\{-1,+1\}$. A positive margin means correct classification. Positive rescaling of $\mathbf w$ and $b$ leaves the geometric margin unchanged."`,
    derive: true,
    pre: [
      text('The signed distance to the decision boundary measures how clearly an example is classified.'),
      text('Labels yᵢ ∈ {−1, +1}. A positive margin means correct classification.'),
      text('Positive rescaling of w and b leaves the geometric margin unchanged.'),
    ],
    rows: [
      {
        eq: R`\mathbf x=\mathbf x_\perp+r\,\frac{\mathbf w}{\lVert\mathbf w\rVert},\qquad f(\mathbf x_\perp)=0\ \ (\mathbf x_\perp\text{ on the boundary})`,
        notes: [
          lab(R`decompose $\mathbf x$ into its foot point on the boundary plus a displacement $r$ along the unit normal $\mathbf w/\lVert\mathbf w\rVert$. This is the picture: $\mathbf x$ (blue), $\mathbf x_\perp$, and the orange arrow`),
          shape(R`\mathbf x,\ \mathbf x_\perp,\ \mathbf w:\ D\times1;\ r:\ 1\times1`),
        ],
      },
      {
        eq: R`f(\mathbf x)=\mathbf w^\top\mathbf x_\perp+b+r\,\frac{\mathbf w^\top\mathbf w}{\lVert\mathbf w\rVert}=0+r\,\lVert\mathbf w\rVert\qquad\Rightarrow\qquad r=\frac{f(\mathbf x)}{\lVert\mathbf w\rVert}`,
        notes: [
          tag(['I96', 'I51'], R`substitute the decomposition into $f$; the first two terms are $f(\mathbf x_\perp)=0$; $\mathbf w^\top\mathbf w=\lVert\mathbf w\rVert^2$, so one factor $\lVert\mathbf w\rVert$ cancels`),
          shape(R`(1\times D)(D\times1)=1\times1`),
        ],
      },
      {
        eq: R`\gamma_i=\frac{y_i\big(\mathbf w^\top\mathbf x_i+b\big)}{\lVert\mathbf w\rVert},\qquad y_i\in\{-1,+1\}`,
        notes: [
          term('Geometric margin'),
          lab(R`$y_i=+1$ and $f>0$, or $y_i=-1$ and $f<0$: the product $y_if$ is positive, so $\gamma_i>0$ means correct, $\gamma_i<0$ a mistake, and $|\gamma_i|$ is the distance to the boundary`),
          lab(R`multiplying by $y_i=\pm1$ flips the sign of the distance for negative examples, which makes "correct" always positive`),
        ],
      },
      {
        eq: R`\mathbf w\to c\,\mathbf w,\ \ b\to c\,b\ \ (c>0):\qquad\gamma_i\to\frac{y_i\big(c\,\mathbf w^\top\mathbf x_i+c\,b\big)}{\lVert c\,\mathbf w\rVert}=\frac{c\,y_i(\mathbf w^\top\mathbf x_i+b)}{c\,\lVert\mathbf w\rVert}=\gamma_i`,
        notes: [
          lab(R`scaling both the numerator and the denominator by $c$: the margin is a property of the line, not of how $(\mathbf w,b)$ is scaled. The factor $c$ comes out of the norm because $c>0$ ($\lVert c\mathbf w\rVert=c\lVert\mathbf w\rVert$)`),
        ],
      },
      {
        eq: R`\mathbf w=\begin{bmatrix}3\\4\end{bmatrix},\ b=-5,\ \mathbf x=\begin{bmatrix}3\\4\end{bmatrix},\ y=+1:\ \ \gamma=\frac{3\cdot3+4\cdot4-5}{\sqrt{9+16}}=\frac{20}{5}=4;\quad\text{with }(6,8)^\top,-10:\ \frac{40}{10}=4`,
        notes: [
          ex(R`check of the picture: $\mathbf x_\perp=\mathbf x-4\frac{\mathbf w}{5}=(3,4)-4(0.6,0.8)=(0.6,0.8)$ and $f(\mathbf x_\perp)=1.8+3.2-5=0$, so it is on the boundary. Doubling $(\mathbf w,b)$ doubles $f$ (to 40) and $\lVert\mathbf w\rVert$ (to 10), leaving $\gamma=4$`),
          ex(R`a misclassified point: $y=-1$ at the same $\mathbf x$ gives $\gamma=-4$`),
          shape(R`\text{all scalars}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'hinge-loss',
    circ: 3,
    title: 'Hinge loss and regularisation',
    why: R`Large margin and few mistakes pull in different directions. The SVM objective puts them in one formula: a penalty on $\lVert\mathbf w\rVert$ (which means a wide margin) plus a loss for every example that is not safely on the correct side. The constant $C$ says how much each mistake costs.`,
    slides: [slide('L3', 121, 'Hinge loss and regularization')],
    slideNote: R`Display: $\displaystyle\min_{\mathbf w,b}\ \tfrac12\lVert\mathbf w\rVert^2+C\sum_{i=1}^N\max\big(0,1-y_if(\mathbf x_i)\big)$. Left text: "$f(\mathbf x)=\mathbf w^T\mathbf x+b$. Labels $y=\pm1$; margin $y\,f(\mathbf x)$." "The weight penalty favours a wide margin." "Hinge loss penalises margins below 1." Right: a plot of the loss $\ell(y,f(x))$ (vertical, 0 to 3) against $y\,f(x)$ (horizontal, $-2$ to 2): the black 0/1 loss is 1 for $yf<0$ and 0 for $yf>0$; the blue hinge loss is the straight line $1-yf$ falling from 3 at $yf=-2$ to 0 at $yf=1$ and then flat at 0. A yellow dashed vertical line at $yf=1$ with an arrow pointing left labelled "Support Vectors". Bottom: "Larger $C$ puts more weight on fitting the training examples."`,
    derive: true,
    pre: [
      text('f(x) = wᵀx + b. Labels y = ±1; margin y f(x).'),
      text('The weight penalty favours a wide margin.'),
      text('Hinge loss penalises margins below 1.'),
      text('Larger C puts more weight on fitting the training examples.'),
    ],
    rows: [
      {
        eq: R`\min_{\mathbf w,b}\ \underbrace{\tfrac12\lVert\mathbf w\rVert^2}_{\text{wide margin}}+C\sum_{i=1}^{N}\underbrace{\max\big(0,\,1-y_if(\mathbf x_i)\big)}_{\text{hinge loss}}`,
        notes: [
          term('SVM objective (soft margin)'),
          shape(R`\mathbf w:\ D\times1;\ b,C,y_i,f(\mathbf x_i):\ 1\times1`),
          lab(R`the same two-part shape as ridge regression: data-fit loss plus a squared-norm penalty on $\mathbf w$ (Lecture 1). Here $C$ multiplies the loss, so large $C$ is like small $\lambda$`),
        ],
      },
      {
        eq: R`\text{if all margins are at least 1:}\ \ \gamma_i=\frac{y_if(\mathbf x_i)}{\lVert\mathbf w\rVert}\ge\frac{1}{\lVert\mathbf w\rVert}\quad\Rightarrow\quad\text{smaller }\lVert\mathbf w\rVert\ \Leftrightarrow\ \text{wider margin}`,
        notes: [
          lab(R`why the penalty favours a wide margin: when every $y_if(\mathbf x_i)\ge1$ the hinge terms are all 0, the closest points have $\gamma=1/\lVert\mathbf w\rVert$, and minimising $\tfrac12\lVert\mathbf w\rVert^2$ maximises this distance (a standard step, not written on the slide)`),
        ],
      },
      {
        eq: R`\ell_{\text{hinge}}(y,f)=\max(0,\,1-yf)=\begin{cases}1-yf&yf<1\\0&yf\ge1\end{cases},\qquad\ell_{0/1}=\mathbb 1[yf<0]\le\ell_{\text{hinge}}`,
        notes: [
          lab(R`zero loss only for examples on the correct side with margin at least 1; a correct but too-close point ($0<yf<1$) is still penalised; a wrong point ($yf<0$) is penalised linearly more as it gets further on the wrong side`),
          lab(R`the hinge loss sits above the 0/1 loss and is convex, which is why it can be minimised reliably (the 0/1 loss has zero gradient almost everywhere)`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`yf\in\{-2,\,-1,\,0,\,0.5,\,1,\,2\}\ \Rightarrow\ \ell_{\text{hinge}}\in\{3,\,2,\,1,\,0.5,\,0,\,0\}`,
        notes: [
          ex(R`read off the blue line of the plot: $1-(-2)=3$, $1-(-1)=2$, $1-0=1$, $1-0.5=0.5$, then 0 from $yf=1$ onwards`),
          lab(R`the support vectors are the examples with $yf\le1$ (on or inside the margin, or misclassified): only they have a nonzero loss or sit exactly on the margin and influence $\mathbf w$ (file 38)`),
        ],
      },
      {
        eq: R`C\ \text{large}\ \Rightarrow\ \text{fit the training data (narrow margin, few violations, risk overfitting)};\qquad C\ \text{small}\ \Rightarrow\ \text{wide margin, more violations allowed}`,
        notes: [
          lab('C is a hyperparameter: choose it by validation, as on slide 119'),
        ],
      },
    ],
  },
  {
    id: 'kernel-training-problem',
    circ: 4,
    title: 'The kernel training problem',
    why: R`Training the SVM can be rewritten so that the data enters only through inner products $\mathbf x_i^\top\mathbf x_j$. Replacing each inner product by a kernel $k(\mathbf x_i,\mathbf x_j)$ then gives a nonlinear classifier at the same cost, without ever constructing the (possibly enormous) feature vector.`,
    slides: [slide('L3', 122, 'The kernel training problem')],
    slideNote: R`Header: "Binary labels $y_i=\pm1$; $\alpha_i$ are learned nonnegative coefficients." Definition: $k(\mathbf x,\mathbf z)=\boldsymbol\phi(\mathbf x)^T\boldsymbol\phi(\mathbf z)$. Problem: $\displaystyle\max_{\boldsymbol\alpha}\ \sum_i\alpha_i-\frac12\sum_{i,j}\alpha_i\alpha_jy_iy_jk(\mathbf x_i,\mathbf x_j)$ subject to $0\le\alpha_i\le C$ and $\sum_i\alpha_iy_i=0$. Footer: "Only inner products are needed. A kernel computes them directly, without constructing the feature vector explicitly."`,
    derive: true,
    pre: [
      text('Binary labels yᵢ = ±1; αᵢ are learned nonnegative coefficients.'),
      text('Only inner products are needed. A kernel computes them directly, without constructing the feature vector explicitly.'),
    ],
    rows: [
      {
        eq: R`k(\mathbf x,\mathbf z)=\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)`,
        notes: [
          term('Kernel'),
          lab(R`the inner product of the feature vectors of two inputs, computed by a formula in $\mathbf x$ and $\mathbf z$ directly (examples on slide 123)`),
          shape(R`\boldsymbol\phi(\mathbf x),\ \boldsymbol\phi(\mathbf z):\ M\times1\ (M\text{ may be huge or infinite});\ k:\ 1\times1`),
        ],
      },
      {
        eq: R`\max_{\boldsymbol\alpha}\ \sum_{i=1}^{N}\alpha_i-\frac12\sum_{i=1}^{N}\sum_{j=1}^{N}\alpha_i\alpha_j\,y_iy_j\,k(\mathbf x_i,\mathbf x_j)\qquad\text{s.t.}\quad0\le\alpha_i\le C,\ \ \sum_{i=1}^{N}\alpha_iy_i=0`,
        notes: [
          term('SVM dual problem'),
          lab(R`one learned coefficient $\alpha_i\ge0$ per training example; the ones that end up positive belong to the support vectors, and $\mathbf w=\sum_i\alpha_iy_i\boldsymbol\phi(\mathbf x_i)$ (file 38)`),
          lab(R`$C$ appears as the upper bound on every $\alpha_i$: it caps how much any single example can influence the solution`),
          lab('this is a concave function of alpha maximised over a box and one linear constraint: a convex problem'),
        ],
      },
      {
        eq: R`\max_{\boldsymbol\alpha}\ \mathbf 1^\top\boldsymbol\alpha-\tfrac12\,\boldsymbol\alpha^\top\big(\mathbf y\mathbf y^\top\odot K\big)\boldsymbol\alpha\qquad\text{s.t.}\quad\mathbf 0\le\boldsymbol\alpha\le C\mathbf 1,\ \ \mathbf y^\top\boldsymbol\alpha=0`,
        notes: [
          lab(R`matrix form: $K_{ij}=k(\mathbf x_i,\mathbf x_j)$ is the $N\times N$ Gram matrix; $\mathbf y\mathbf y^\top$ has entries $y_iy_j$ (outer product, I92); $\odot$ multiplies entry by entry, so entry $(i,j)$ of the matrix in brackets is $y_iy_jK_{ij}$ and $\boldsymbol\alpha^\top(\cdot)\boldsymbol\alpha=\sum_{i,j}\alpha_i\alpha_jy_iy_jK_{ij}$. This is the double sum`),
          shape(R`\boldsymbol\alpha,\ \mathbf y,\ \mathbf 1:\ N\times1;\ K,\ \mathbf y\mathbf y^\top\odot K:\ N\times N;\ \boldsymbol\alpha^\top(\cdot)\boldsymbol\alpha:\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbf x_1=\begin{bmatrix}1\\1\end{bmatrix},y_1=+1;\ \mathbf x_2=\begin{bmatrix}-1\\-1\end{bmatrix},y_2=-1;\ K=\begin{bmatrix}2&-2\\-2&2\end{bmatrix}\ \ (k=\mathbf x^\top\mathbf z):\quad\alpha_1=\alpha_2=a,\ \ g(a)=2a-4a^2`,
        notes: [
          ex(R`linear kernel. The constraint $\alpha_1y_1+\alpha_2y_2=\alpha_1-\alpha_2=0$ forces $\alpha_1=\alpha_2=a$. The double sum is $a^2(2)+a^2(2)+2\cdot a^2(-1)(-2)=8a^2$, so the objective is $2a-\tfrac12\cdot8a^2=2a-4a^2$`),
          shape(R`K:\ 2\times2;\ \alpha_i,\ g:\ 1\times1`),
        ],
      },
      {
        eq: R`g'(a)=2-8a=0\ \Rightarrow\ a=\tfrac14\quad(\le C),\qquad\mathbf w=\sum_i\alpha_iy_i\mathbf x_i=\tfrac14\begin{bmatrix}1\\1\end{bmatrix}-\tfrac14\begin{bmatrix}-1\\-1\end{bmatrix}=\begin{bmatrix}0.5\\0.5\end{bmatrix}`,
        notes: [
          ex(R`both points are support vectors. With $b=0$: $f(\mathbf x_1)=0.5+0.5=1$ and $f(\mathbf x_2)=-1$, so both margins $y_if=1$ exactly, as the SVM requires. The geometric margin is $1/\lVert\mathbf w\rVert=1/\sqrt{0.5}=\sqrt2$, which is the distance of each point from the origin`),
          ex(R`check of the optimum: the dual value $g(\tfrac14)=0.5-0.25=0.25$ equals the primal value $\tfrac12\lVert\mathbf w\rVert^2=\tfrac12(0.5)=0.25$ (the hinge terms are 0)`),
          shape(R`\mathbf w:\ 2\times1`),
        ],
      },
    ],
  },
  {
    id: 'kernel-examples',
    circ: 5,
    title: 'Kernel examples',
    why: R`A kernel has to be a function we can evaluate cheaply that secretly equals an inner product of features. Three standard choices cover most uses: no change of features, all polynomials up to a degree, and a smooth bump around each training point.`,
    slides: [slide('L3', 123, 'Kernel examples')],
    slideNote: R`Three kernels, each with its formula: "Linear kernel" $k(\mathbf x,\mathbf z)=\mathbf x^T\mathbf z$; "Polynomial kernel" $k(\mathbf x,\mathbf z)=(\mathbf x^T\mathbf z+1)^p$; "Radial basis function (Gaussian) kernel" $k(\mathbf x,\mathbf z)=\exp\Big[-\dfrac{\lVert\mathbf x-\mathbf z\rVert^2}{2\sigma^2}\Big]$, $\sigma>0$. Bold line: "Underlying feature dimension for the Gaussian kernel: infinite". (The main-lecture version of the polynomial and Gaussian kernels is in file 39.)`,
    derive: true,
    pre: [text('Underlying feature dimension for the Gaussian kernel: infinite.')],
    rows: [
      {
        eq: R`\textbf{Linear:}\ \ k(\mathbf x,\mathbf z)=\mathbf x^\top\mathbf z\qquad\textbf{Polynomial:}\ \ k(\mathbf x,\mathbf z)=\big(\mathbf x^\top\mathbf z+1\big)^{p}\qquad\textbf{RBF:}\ \ k(\mathbf x,\mathbf z)=\exp\!\Big[-\frac{\lVert\mathbf x-\mathbf z\rVert^2}{2\sigma^2}\Big],\ \sigma>0`,
        notes: [
          lab(R`linear: $\boldsymbol\phi(\mathbf x)=\mathbf x$. Polynomial: $\boldsymbol\phi$ lists all monomials of degree up to $p$ (weighted); for $d=100$, $p=3$ that is a feature vector with 171,700 coordinates (file 39, I88) but the kernel costs one inner product. RBF: depends only on the distance between $\mathbf x$ and $\mathbf z$`),
          shape(R`\mathbf x,\ \mathbf z:\ D\times1;\ \mathbf x^\top\mathbf z,\ k:\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}1\\2\end{bmatrix},\ \mathbf z=\begin{bmatrix}2\\0\end{bmatrix}:\quad\mathbf x^\top\mathbf z=2,\ \ (2+1)^2=9\ \ (p=2),\ \ \lVert\mathbf x-\mathbf z\rVert^2=(-1)^2+2^2=5,\ \ e^{-5/2}\approx0.082\ \ (\sigma=1)`,
        notes: [
          ex(R`the three kernels on one pair of points: linear 2, polynomial 9, RBF 0.082. The RBF value is always in $(0,1]$, with $k(\mathbf x,\mathbf x)=e^0=1$, and decays towards 0 as the points move apart`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\text{RBF feature dimension}=\infty\qquad(\text{shown on the next slide})`,
        notes: [
          lab(R`so we could never build $\boldsymbol\phi(\mathbf x)$ on a computer, yet $k(\mathbf x,\mathbf z)$ is one line. This is the point of the "kernel trick"`),
        ],
      },
    ],
  },
  {
    id: 'gaussian-expansion',
    circ: 6,
    title: 'The Gaussian feature expansion',
    why: R`This is the proof of the claim "infinite feature dimension". It shows that the Gaussian kernel really is an inner product of feature vectors, one coordinate for each power $x^r$, so it is a legitimate kernel and not just a similarity score. We do it for one input dimension, where each step is visible.`,
    slides: [slide('L3', 124, 'The Gaussian feature expansion')],
    slideNote: R`Setup: $\gamma=\frac1{2\sigma^2}>0$, $x,z\in\mathbb R$. A five-line chain: $k(x,z)=e^{-\gamma(x-z)^2}=e^{-\gamma x^2}e^{-\gamma z^2}e^{2\gamma xz}=e^{-\gamma x^2}e^{-\gamma z^2}\sum_{r=0}^\infty\frac{(2\gamma xz)^r}{r!}=\sum_{r=0}^\infty\Big[e^{-\gamma x^2}\sqrt{\tfrac{(2\gamma)^r}{r!}}x^r\Big]\Big[e^{-\gamma z^2}\sqrt{\tfrac{(2\gamma)^r}{r!}}z^r\Big]=\boldsymbol\phi(x)^T\boldsymbol\phi(z)$. Text: "The feature vector contains one coordinate for every non-negative integer:" $\boldsymbol\phi(x)=e^{-\gamma x^2}\Big(1,\sqrt{2\gamma}\,x,\sqrt{\tfrac{(2\gamma)^2}{2!}}x^2,\sqrt{\tfrac{(2\gamma)^3}{3!}}x^3,\dots\Big)^T$.`,
    derive: true,
    pre: [text('The feature vector contains one coordinate for every non-negative integer.')],
    rows: [
      {
        eq: R`\gamma=\frac1{2\sigma^2}>0,\qquad k(x,z)=\exp\!\Big[-\frac{(x-z)^2}{2\sigma^2}\Big]=e^{-\gamma(x-z)^2},\qquad x,z\in\mathbb R`,
        notes: [lab(R`one-dimensional input; $\gamma$ is a rewriting of $\sigma$ that shortens the algebra`), shape(R`x,z,\gamma:\ 1\times1`)],
      },
      {
        eq: R`e^{-\gamma(x-z)^2}=e^{-\gamma(x^2-2xz+z^2)}=e^{-\gamma x^2}\,e^{-\gamma z^2}\,e^{2\gamma xz}`,
        notes: [
          tag(['I97'], R`expand $(x-z)^2=x^2-2xz+z^2$, distribute $-\gamma$, then split the exponential of a sum into a product. The cross term is the only one that mixes $x$ and $z$`),
        ],
      },
      {
        eq: R`e^{-\gamma x^2}\,e^{-\gamma z^2}\,e^{2\gamma xz}=e^{-\gamma x^2}\,e^{-\gamma z^2}\sum_{r=0}^{\infty}\frac{(2\gamma xz)^r}{r!}`,
        notes: [tag(['I97'], R`the exponential series with $u=2\gamma xz$: this is where the infinite sum (and the infinite dimension) comes from`)],
      },
      {
        eq: R`\frac{(2\gamma xz)^r}{r!}=\sqrt{\frac{(2\gamma)^r}{r!}}\,x^r\cdot\sqrt{\frac{(2\gamma)^r}{r!}}\,z^r`,
        notes: [
          tag(['I97'], R`split $(2\gamma)^r(xz)^r=(2\gamma)^r x^rz^r$, then write $\frac{(2\gamma)^r}{r!}$ as the product of its square root with itself, one root for the $x$-factor and one for the $z$-factor`),
          lab(R`this is the step that turns a single term into a product of a function of $x$ and a function of $z$, the shape of an inner product`),
        ],
      },
      {
        eq: R`k(x,z)=\sum_{r=0}^{\infty}\Big[e^{-\gamma x^2}\sqrt{\tfrac{(2\gamma)^r}{r!}}\,x^r\Big]\Big[e^{-\gamma z^2}\sqrt{\tfrac{(2\gamma)^r}{r!}}\,z^r\Big]=\boldsymbol\phi(x)^\top\boldsymbol\phi(z)`,
        notes: [
          lab(R`the factors $e^{-\gamma x^2}$ and $e^{-\gamma z^2}$ do not depend on $r$, so they are attached to the $x$ and $z$ brackets. The sum over $r$ is the sum $\sum_r\phi_r(x)\phi_r(z)$ of products of coordinates: an inner product (of infinite vectors)`),
          shape(R`\boldsymbol\phi(x),\ \boldsymbol\phi(z):\ \infty\times1;\ k:\ 1\times1`),
        ],
      },
      {
        eq: R`\boldsymbol\phi(x)=e^{-\gamma x^2}\Big(1,\ \sqrt{2\gamma}\,x,\ \sqrt{\tfrac{(2\gamma)^2}{2!}}\,x^2,\ \sqrt{\tfrac{(2\gamma)^3}{3!}}\,x^3,\ \dots\Big)^\top`,
        notes: [
          lab(R`one coordinate for every non-negative integer $r=0,1,2,\dots$: the coordinate $r$ is $e^{-\gamma x^2}\sqrt{(2\gamma)^r/r!}\;x^r$. A linear classifier in these features is a smooth function that can combine polynomials of every degree`),
          lab(R`for $d$-dimensional inputs the same construction works (not shown on the slide), with the squared distance $\lVert\mathbf x-\mathbf z\rVert^2$ expanding into $d$ one-dimensional factors`),
        ],
      },
      {
        eq: R`\gamma=\tfrac12\ (\sigma=1),\ x=z=1:\quad k=e^{0}=1,\qquad\boldsymbol\phi(1)^\top\boldsymbol\phi(1)=e^{-1}\sum_{r=0}^{\infty}\frac1{r!}=e^{-1}\cdot e=1`,
        notes: [
          ex(R`with $2\gamma=1$ the coordinates of $\boldsymbol\phi(1)$ are $e^{-1/2}\sqrt{1/r!}$; their squares sum to $e^{-1}\sum_r1/r!=e^{-1}e=1$ ✓`),
          ex(R`truncating at $r\le4$: $e^{-1}(1+1+0.5+0.1667+0.0417)=0.3679\cdot2.7083=0.9963\approx1$: a few coordinates already give an accurate approximation`),
          ex(R`a pair with $x\ne z$: $x=1,z=0.5$: $k=e^{-0.5(0.25)}=e^{-0.125}=0.8825$, and $\boldsymbol\phi(x)^\top\boldsymbol\phi(z)=e^{-0.5}e^{-0.125}\sum_r\frac{0.5^r}{r!}=e^{-0.625}e^{0.5}=e^{-0.125}$ ✓`),
          shape(R`1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Why this matters',
        text: R`The SVM with an RBF kernel is a linear classifier in an infinite-dimensional feature space, but its dual problem (slide 122) only ever uses the $N\times N$ matrix of kernel values $K_{ij}=k(\mathbf x_i,\mathbf x_j)$. The cost depends on the number of training examples, not on the (infinite) feature dimension.`,
      },
    ],
  },
];

export const kernelsMargins: Topic = {
  id: 'kernels-margins',
  title: 'Appendix: margins, hinge loss and kernels',
  short: 'Margins & kernels (appendix)',
  summary: R`Geometric margin $\gamma_i=y_i(\mathbf w^\top\mathbf x_i+b)/\lVert\mathbf w\rVert$. SVM: $\min\tfrac12\lVert\mathbf w\rVert^2+C\sum\max(0,1-y_if(\mathbf x_i))$. Dual: $\max\sum\alpha_i-\tfrac12\sum\alpha_i\alpha_jy_iy_jk(\mathbf x_i,\mathbf x_j)$ with $0\le\alpha_i\le C$, $\sum\alpha_iy_i=0$. Kernels: linear, $(\mathbf x^\top\mathbf z+1)^p$, Gaussian (infinite features, $\phi_r(x)=e^{-\gamma x^2}\sqrt{(2\gamma)^r/r!}\,x^r$).`,
  identities,
  sections,
};

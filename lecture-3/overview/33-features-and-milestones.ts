import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'recap',
    title: 'Where Weeks 1 and 2 left us',
    why: R`Lecture 3 builds on three ideas from Weeks 1 and 2: a loss to minimise, a penalty to stop overfitting, and an optimiser. Seeing them side by side tells us what is still missing: how to choose the features $\boldsymbol\phi(\mathbf x)$ that the linear model sits on.`,
    slides: [slide('L3', 3, 'Week 1-2: ML foundations')],
    slideNote: R`The slide is three short text blocks (loss functions, regularisation, minimisers) and a footer, "ML fundamentals: rooted in probability, statistics and optimisation", with a historical-context strip 1763–1970 (Hastie, Tibshirani & Friedman 2009). The three equations are added from the Lecture 1 and 2 notes (files 04, 07, 17, 20, 21).`,
    pre: [
      lab(R`Loss functions: squared $L_2$ loss for regression, cross-entropy for classification.`),
      lab(R`Regularisation: $L_2$ shrinks coefficients; $L_1$ encourages sparsity; there is a probabilistic interpretation.`),
      text('Minimizers: closed form, second-order methods, gradient descent and SGD.'),
      text('ML fundamentals: rooted in probability, statistics and optimisation.'),
    ],
    rows: [
      {
        eq: R`L_{\text{sq}}(\mathbf w)=\sum_{i=1}^{N}\big(y_i-\mathbf w^\top\mathbf x_i\big)^2\qquad\qquad L_{\text{CE}}(\mathbf w)=-\sum_{i=1}^{N}\big\{y_i\log p_i+(1-y_i)\log(1-p_i)\big\}`,
        notes: [
          term('Loss functions'),
          lab(R`squared loss for a real target $y_i$ (regression); cross-entropy for a label $y_i\in\{0,1\}$ with $p_i=\sigma(\mathbf w^\top\mathbf x_i)$ (classification)`),
          shape(R`y_i,\ p_i,\ \mathbf w^\top\mathbf x_i:\ 1\times1;\quad \mathbf w,\mathbf x_i:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`L(\mathbf w)+\lambda\lVert\mathbf w\rVert_2^2\ \ (\text{ridge, }L_2),\qquad L(\mathbf w)+\lambda\lVert\mathbf w\rVert_1\ \ (\text{LASSO, }L_1)`,
        notes: [
          term('Regularisation'),
          lab(R`$\lambda\ge0$ sets the strength of the penalty; $L_2$ shrinks every coefficient, $L_1$ sets some exactly to 0`),
          lab('Gaussian prior on w gives ridge (MAP); a Laplace prior gives L1'),
        ],
      },
      {
        eq: R`\hat{\mathbf w}=(X^\top X+\lambda I)^{-1}X^\top\mathbf y\ \ (\text{closed form}),\qquad \mathbf w_{t+1}=\mathbf w_t-\eta\,\nabla L(\mathbf w_t)\ \ (\text{gradient descent})`,
        notes: [
          term('Minimizers'),
          lab('closed form exists for ridge; Newton–Raphson uses the Hessian; GD and SGD need only the gradient and are the ones that carry over to neural networks'),
          shape(R`X:\ N\times(D+1);\quad \hat{\mathbf w},\ \nabla L:\ (D+1)\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'What is missing',
        text: R`All of this assumed a fixed input representation $\mathbf x$ (or a hand-chosen $\boldsymbol\phi(\mathbf x)$). Lecture 3 asks where good features come from: trees select them, kernels imply them, and neural networks learn them.`,
      },
    ],
  },
  {
    id: 'beyond-linear',
    circ: 1,
    title: 'Beyond linear boundaries: more features',
    why: R`A straight line cannot separate every dataset. Weeks 1–2 fixed this by moving to a feature space $\boldsymbol\phi(\mathbf x)$ where a straight line (hyperplane) does work. This is the same idea that drives the whole lecture, so it is worth fixing the notation first.`,
    slides: [slide('L3', 4, 'Beyond linear boundaries')],
    slideNote: R`The slide has the title, the bullet "Weeks 1-2: 'More features' & regularization" and the map $\Phi:\mathbf x\to\boldsymbol\phi(\mathbf x)$ (with a picture of data that is not linearly separable in the input plane). Rows 2 and 3 are an added worked example, using the XOR data of slide 46 that comes back later.`,
    pre: [
      text('Weeks 1-2: "More features" & regularization.'),
      lab(R`$\Phi:\mathbf x\to\boldsymbol\phi(\mathbf x)$ maps each input to a feature vector`),
    ],
    rows: [
      {
        eq: R`\boldsymbol\phi:\mathbb R^{D}\to\mathbb R^{M},\qquad f(\mathbf x)=\mathbf w^\top\boldsymbol\phi(\mathbf x)`,
        notes: [
          lab(R`still linear in the parameters $\mathbf w$, but nonlinear in the input $\mathbf x$`),
          shape(R`\mathbf x:\ D\times1;\quad \boldsymbol\phi(\mathbf x),\ \mathbf w:\ M\times1;\quad f(\mathbf x):\ 1\times1`),
          tag(['I13'], R`$\mathbf w^\top\boldsymbol\phi=\langle\mathbf w,\boldsymbol\phi\rangle$ is an inner product of two $M\times1$ vectors`),
        ],
      },
      {
        eq: R`\boldsymbol\phi(\mathbf x)=\begin{bmatrix}x_1\\x_2\\x_1x_2\end{bmatrix}\ \Rightarrow\ f(\mathbf x)=w_1x_1+w_2x_2+w_3x_1x_2`,
        notes: [
          ex(R`add the product feature $x_1x_2$ to the two inputs`),
          shape(R`\boldsymbol\phi(\mathbf x):\ 3\times1\ (M=3,\ D=2)`),
        ],
      },
      {
        eq: R`w_1=1,\ w_2=1,\ w_3=-2:\quad f=x_1+x_2-2x_1x_2\ \Rightarrow\ f(0,0)=0,\ f(0,1)=1,\ f(1,0)=1,\ f(1,1)=0`,
        notes: [
          ex(R`this is exactly XOR: a function no line in $(x_1,x_2)$ can produce becomes linear in $(x_1,x_2,x_1x_2)$`),
          lab('the choice of features did all the work; a network will learn them (slides 46–50)'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Three ways to get a feature space',
        text: R`(1) Choose $\boldsymbol\phi$ by hand (Week 1 polynomials). (2) Let a method select it from data: trees and forests. (3) Let a method imply it: kernels. (4) Learn it end-to-end: neural networks. The next slides place these on a timeline.`,
      },
    ],
  },
  {
    id: 'milestones',
    circ: 2,
    title: 'ML milestones: good, smart, fast features',
    why: R`The lecture follows eight landmark methods. The timeline organises them by how they get features: the 1984–2001 methods find a good feature space cleverly or cheaply; the neural-network line (1958 onwards) learns it, and takes over after 2012.`,
    slides: [slide('L3', 5, 'ML milestones'), slide('L3', 6, 'ML milestones: good/smart/fast features'), slide('L3', 38, 'Selected milestones in machine learning')],
    slideNote: R`Slide 5 is the plain timeline. Slide 6 highlights the three methods of 1984, 1995 and 2001 under the heading "good/smart/fast features". Slide 38 repeats it, bracketing 1986 onwards as "Deep Learning". Each year carries the paper of the reference list on slide 142.`,
    pre: [
      text('1958 Perceptron (Rosenblatt) · 1984 CART trees (Breiman et al.) · 1986 Multilayer perceptrons (Rumelhart, Hinton, Williams)'),
      text('1995 Support vector machines (Cortes, Vapnik) · 1998 Convolutional networks (LeCun et al.) · 2001 Random forests (Breiman)'),
      text('2012 AlexNet (Krizhevsky, Sutskever, Hinton) · 2017 Transformer (Vaswani et al.)'),
    ],
    rows: [
      {
        eq: R`\underbrace{1984\ \text{CART}\ \to\ 1995\ \text{SVM}\ \to\ 2001\ \text{Random forest}}_{\text{good / smart / fast features}}`,
        notes: [
          lab('CART: select feature tests greedily. SVM: a huge implicit feature space through a kernel. Random forest: many randomised trees averaged'),
          lab('files 34–39 of these notes'),
        ],
      },
      {
        eq: R`\underbrace{1958\ \text{Perceptron}\ \to\ 1986\ \text{MLP}\ \to\ 1998\ \text{CNN}\ \to\ 2012\ \text{AlexNet}\ \to\ 2017\ \text{Transformer}}_{\text{deep learning: learn the features}}`,
        notes: [
          lab('the perceptron is one neuron; the MLP stacks them and is trained with backpropagation; CNNs and transformers are specialised layers (Lectures 4 and 5)'),
          lab('files 40–49 of these notes'),
        ],
      },
    ],
  },
  {
    id: 'three-routes',
    circ: 3,
    title: 'Learning the features and the predictor',
    why: R`The three families differ in what is fixed and what is fitted. Knowing this up front makes each method later in the lecture easier to place: it tells you what its parameters are.`,
    slides: [slide('L3', 37, 'Learning the features and the predictor')],
    slideNote: R`Slide 37 lists the three families under the heading "A rich feature space can make a simple final decision powerful". The table is the same content, with a row for what is trained.`,
    pre: [
      text('A rich feature space can make a simple final decision powerful.'),
      text('Trees and forests: select paths of tests from many possible combinations. Choose splits greedily, without jointly retuning earlier tests.'),
      text('Fixed-kernel methods: use implicit features through kernel evaluations. Fit classifier coefficients while the chosen feature map stays fixed.'),
      text('Neural networks: optimise intermediate features and the final predictor together, using the final prediction loss.'),
    ],
    rows: [
      {
        eq: R`\text{Trees, forests:}\quad f(\mathbf x)=\sum_{\text{leaves }\ell}c_\ell\,\mathbb 1[\mathbf x\text{ reaches }\ell]`,
        notes: [
          lab('features = path indicators (slide 8); chosen greedily, one split at a time'),
          warn('later splits do not jointly retune the earlier tests (slide 29)'),
        ],
      },
      {
        eq: R`\text{Kernel machines:}\quad f(\mathbf x)=\sum_{i\in\text{SV}}\alpha_iy_i\,k(\mathbf x_i,\mathbf x)+b`,
        notes: [
          lab(R`$k(\mathbf x,\mathbf z)=\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)$ fixes the features; only $\alpha_i$ and $b$ are fitted`),
          lab('non-examinable (slides 30–36)'),
        ],
      },
      {
        eq: R`\text{Neural networks:}\quad f(\mathbf x)=W\,g\big(V\mathbf x\big)\ \ (\text{features }g(V\mathbf x)\text{ and predictor }W\text{ both fitted})`,
        notes: [
          lab(R`the hidden layer $\mathbf a=g(V\mathbf x)$ is a feature vector; $V$ and $W$ are trained together to reduce the final loss`),
          con(R`biases omitted here, as on the slides of the worked example (slide 86)`),
        ],
      },
    ],
  },
];

export const featuresAndMilestones: Topic = {
  id: 'features-milestones',
  title: 'From features to learned features',
  short: 'Features and milestones',
  summary: R`Weeks 1–2 gave losses, regularisers and optimisers on a fixed feature map $\boldsymbol\phi(\mathbf x)$. Lecture 3 asks where features come from: trees select them (1984), kernels imply them (1995), forests average them (2001), neural networks learn them (1958, 1986, 2012).`,
  identities: [],
  sections,
};

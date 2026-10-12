import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I64',
    area: 'Algebra & calculus',
    tex: R`g(a)=\frac{1}{1+e^{-a}}\in(0,1),\qquad 1-g(a)=\frac{e^{-a}}{1+e^{-a}}=g(-a),\qquad \log\frac{g(a)}{1-g(a)}=a`,
    note: R`Logistic sigmoid. $e^{-a}>0$ (I10), so the denominator is above 1 and $g(a)$ lies strictly between 0 and 1, with $g(0)=\tfrac12$. The middle identity: multiply top and bottom of $g(-a)=1/(1+e^{a})$ by $e^{-a}$. The last one: $g/(1-g)=1/e^{-a}=e^{a}$, then take the log (I36). So $g$ undoes the log-odds (logit).`,
  },
  {
    id: 'I65',
    area: 'Probability',
    tex: R`Y\in\{0,1\},\ P(Y=1)=p\ \Rightarrow\ P(Y=y)=p^{y}(1-p)^{1-y}`,
    note: R`Bernoulli distribution written as one formula. For $y=1$ it gives $p^1(1-p)^0=p$; for $y=0$ it gives $p^0(1-p)^1=1-p$. The exponent "switches on" the right factor. Its log is $y\log p+(1-y)\log(1-p)$ (I34, I36).`,
  },
  {
    id: 'I66',
    area: 'Algebra & calculus',
    tex: R`\prod_{i=1}^{N}e^{a_i}=e^{\sum_{i=1}^{N}a_i},\qquad \prod_{i=1}^{N}c=c^{N}`,
    note: R`A product of exponentials is the exponential of the sum, because $e^{a}e^{b}=e^{a+b}$. A constant factor repeated $N$ times is its $N$-th power, so $\prod_i(2\pi\sigma^2)^{-1/2}=(2\pi\sigma^2)^{-N/2}$.`,
  },
];

const sections: Section[] = [
  {
    id: 'likelihood-regression',
    circ: 1,
    title: 'Reminder: likelihood for regression',
    why: R`In Lecture 1 the squared loss came from a probability model: Gaussian noise around $\mathbf w^\top\mathbf x$. To get a better classification loss we repeat that route, so first recall each step and see which piece must change.`,
    slides: [slide('L2', 18, 'Reminder: likelihood for regression')],
    slideNote: R`The red box on the slide marks the two pieces that change for classification: the target set ($y_i\in\mathbb R$) and the Gaussian factor.`,
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N},\qquad y_i\in\mathbb R`,
        notes: [lab('regression: a real-valued target')],
      },
      {
        eq: R`p(y_1,\dots,y_N\mid\mathbf x_1,\dots,\mathbf x_N;\mathbf w)=\prod_{i=1}^{N}p(y_i\mid\mathbf x_i;\mathbf w)`,
        notes: [
          term('Conditional independence'),
          tag(['I33'], 'targets are independent given the inputs and the parameters, so the joint is a product'),
        ],
      },
      {
        eq: R`=\prod_{i=1}^{N}\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big[-\frac{(y_i-\mathbf w^\top\mathbf x_i)^2}{2\sigma^2}\Big]`,
        notes: [
          tag(['I32'], R`each factor is a Gaussian density with mean $\mathbf w^\top\mathbf x_i$ and variance $\sigma^2$`),
          con(R`$\sigma^2$ is fixed`),
        ],
      },
      {
        eq: R`=(2\pi\sigma^2)^{-N/2}\exp\!\Big[-\frac{1}{2\sigma^2}\sum_{i=1}^{N}(y_i-\mathbf w^\top\mathbf x_i)^2\Big]`,
        notes: [
          tag(['I66'], 'the constant factors multiply to a power; the exponentials combine into one'),
          lab('maximising this over w means minimising the sum of squares: least squares'),
        ],
      },
    ],
  },
  {
    id: 'likelihood-classification',
    title: 'Likelihood for classification?',
    why: R`The first two lines of the recipe still hold for labels, but a Gaussian makes no sense for a target that can only be 0 or 1. We need a probability model whose outputs are valid probabilities for two outcomes.`,
    slides: [slide('L2', 19, 'Likelihood for classification?')],
    slideNote: R`The slide leaves the last line as a "?" in a red box; the next slides fill it.`,
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N},\qquad y_i\in\{0,1\}`,
        notes: [lab('the target set changes')],
      },
      {
        eq: R`p(y_1,\dots,y_N\mid\mathbf x_1,\dots,\mathbf x_N;\mathbf w)=\prod_{i=1}^{N}p(y_i\mid\mathbf x_i;\mathbf w)=\ ?`,
        notes: [
          tag(['I33'], 'conditional independence still gives a product'),
          warn(R`we need $p(y_i\mid\mathbf x_i;\mathbf w)$ for $y_i\in\{0,1\}$: a number in $[0,1]$, and the two values must add to 1`),
        ],
      },
    ],
  },
  {
    id: 'logistic-model',
    circ: 2,
    title: 'The logistic model',
    why: R`The score $\mathbf w^\top\mathbf x$ can be any real number, but a probability must lie between 0 and 1. The sigmoid squashes the score into $(0,1)$, which gives a probability for class 1 and, through the Bernoulli formula, the missing likelihood factor.`,
    slides: [slide('L2', 20, 'The logistic model')],
    slideNote: R`Rows 2 and 3 show the steps behind the log-odds identity. The numeric example is added.`,
    rows: [
      {
        eq: R`g(a)=\frac{1}{1+\exp(-a)}`,
        notes: [
          term('Sigmoid function'),
          lab(R`a real-valued input $a$ is mapped to a value between 0 and 1 (S-shaped curve on the slide)`),
          tag(['I64'], R`$g(0)=\tfrac12$; $g(a)\to1$ as $a\to\infty$; $g(a)\to0$ as $a\to-\infty$`),
          shape(R`a,\ g(a):\ 1\times1`),
        ],
      },
      {
        eq: R`1-g(a)=\frac{1+e^{-a}-1}{1+e^{-a}}=\frac{e^{-a}}{1+e^{-a}}`,
        notes: [lab('write 1 with the same denominator')],
      },
      {
        eq: R`\frac{g(a)}{1-g(a)}=\frac{1}{e^{-a}}=e^{a}\quad\Longrightarrow\quad\log\frac{g(a)}{1-g(a)}=a`,
        notes: [
          tag(['I36'], R`$\log e^{a}=a$`),
          term('Log-odds (logit)'),
          lab(R`odds $=$ probability of class 1 divided by probability of class 0`),
        ],
      },
      {
        eq: R`f_{\mathbf w}(\mathbf x)=\mathbf w^\top\mathbf x,\qquad p_{\mathbf w}(\mathbf x)=g\big(f_{\mathbf w}(\mathbf x)\big)`,
        notes: [
          term('Logistic regression'),
          lab('a linear model for the log-odds: the score is the logit of the class-1 probability'),
          shape(R`\mathbf w,\ \mathbf x:\ (D+1)\times1,\qquad f_{\mathbf w}(\mathbf x),\ p_{\mathbf w}(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`P(Y=1\mid\mathbf x;\mathbf w)=p_{\mathbf w}(\mathbf x),\qquad P(Y=0\mid\mathbf x;\mathbf w)=1-p_{\mathbf w}(\mathbf x)`,
        notes: [lab('likelihood expression: the two outcomes add to 1')],
      },
      {
        eq: R`P(Y=y\mid\mathbf x;\mathbf w)=p_{\mathbf w}(\mathbf x)^{y}\,\big[1-p_{\mathbf w}(\mathbf x)\big]^{1-y}`,
        notes: [
          term('Bernoulli likelihood'),
          tag(['I65'], R`one formula for both labels: $y=1$ picks $p_{\mathbf w}$, $y=0$ picks $1-p_{\mathbf w}$`),
        ],
      },
      {
        eq: R`z=\mathbf w^\top\mathbf x=2:\quad p=\frac{1}{1+e^{-2}}=0.881,\qquad z=0:\ p=0.5,\qquad z=-2:\ p=0.119`,
        notes: [ex(R`the boundary $z=0$ is exactly where the model says 50/50`)],
      },
    ],
  },
  {
    id: 'likelihood-binary',
    circ: 3,
    title: 'Likelihood for binary classification',
    why: R`With one Bernoulli factor per example we can now write the likelihood of the whole training set, and take its log to turn the product into a sum that is easy to differentiate.`,
    slides: [slide('L2', 21, 'Likelihood for binary classification')],
    rows: [
      {
        eq: R`p(y_1,\dots,y_N\mid\mathbf x_1,\dots,\mathbf x_N;\mathbf w)=\prod_{i=1}^{N}p(y_i\mid\mathbf x_i;\mathbf w)`,
        notes: [tag(['I33'], 'labels are independent given inputs and w')],
      },
      {
        eq: R`=\prod_{i=1}^{N}p_i^{y_i}(1-p_i)^{1-y_i},\qquad p_i=g(\mathbf w^\top\mathbf x_i)`,
        notes: [
          tag(['I65'], 'Bernoulli factor for each example'),
          shape(R`p_i:\ 1\times1\ \text{(the model's class-1 probability for example }i)`),
        ],
      },
      {
        eq: R`\log p(\mathbf y\mid X;\mathbf w)=\sum_{i=1}^{N}\log\big[p_i^{y_i}(1-p_i)^{1-y_i}\big]`,
        notes: [
          tag(['I34'], 'the log of a product is the sum of the logs'),
          lab(R`$X$ stacks the input rows $\mathbf x_i^\top$; $\mathbf y$ stacks the labels $y_i$`),
          shape(R`X:\ N\times(D+1),\quad\mathbf y:\ N\times1,\quad\log p(\mathbf y\mid X;\mathbf w):\ 1\times1`),
        ],
      },
      {
        eq: R`=\sum_{i=1}^{N}\big\{y_i\log p_i+(1-y_i)\log(1-p_i)\big\}`,
        notes: [tag(['I34', 'I36'], R`$\log(a^{y}b^{1-y})=y\log a+(1-y)\log b$`)],
      },
    ],
  },
  {
    id: 'bce',
    circ: 4,
    title: 'Binary cross-entropy: the training objective',
    why: R`Maximising the log-likelihood is the same as minimising its negative. Splitting the negative into one term per example gives the loss we will optimise for the rest of the lecture: the log-loss, or binary cross-entropy.`,
    slides: [slide('L2', 22, 'Binary cross-entropy: the training objective'), slide('L2', 162, 'Binary objective recap (appendix)')],
    slideNote: R`Slide 162 (appendix) restates rows 1 and 2 as $L(\mathbf w)=-\log p(\mathbf y\mid X;\mathbf w)$ with the Bernoulli model. The answer to the slide's question (row 3) and the numbers are added.`,
    rows: [
      {
        eq: R`\ell(y_i,p_i)=-y_i\log p_i-(1-y_i)\log(1-p_i)`,
        notes: [
          term('Log-loss (binary cross-entropy)'),
          lab('the Bernoulli negative log-likelihood of one example'),
          shape(R`\ell:\ 1\times1,\ \ \ell\ge0\ \text{since}\ 0<p_i<1`),
        ],
      },
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\ell(y_i,p_i)=-\log p(\mathbf y\mid X;\mathbf w),\qquad \hat{\mathbf w}=\arg\min_{\mathbf w}L(\mathbf w)`,
        notes: [
          lab(R`$L$: total training loss; $\ell$: loss for one example; the model supplies $p_i=g(z_i)$`),
          tag(['I35'], 'maximising the log-likelihood = minimising its negative'),
          tag(['C3'], 'the fitted parameters minimise the loss'),
        ],
      },
      {
        eq: R`\ell(y_i,p_i)=\begin{cases}-\log p_i, & y_i=1\\ -\log(1-p_i), & y_i=0\end{cases}`,
        notes: [
          lab('Q on the slide: what does this expression mean?'),
          lab('A: only one term is active. It is minus the log of the probability the model gave to the label that actually occurred.'),
          lab('near 0 if that probability is near 1; very large if it is near 0'),
        ],
      },
      {
        eq: R`y_i=1:\quad p_i=0.9\Rightarrow\ell=0.105,\qquad p_i=0.5\Rightarrow\ell=0.693,\qquad p_i=0.1\Rightarrow\ell=2.303`,
        notes: [ex('confident and right costs little; confident and wrong costs a lot')],
      },
    ],
  },
  {
    id: 'margin-form',
    circ: 5,
    title: 'Log loss as a function of the margin',
    why: R`To compare with the squared loss we write the log-loss in terms of the margin $m$. The result $\log(1+e^{-m})$ always decreases as the margin grows, so confident correct predictions are never punished.`,
    slides: [
      slide('L2', 23, 'Log loss as a function of the margin'),
      slide('L2', 24, 'Log loss'),
      slide('L2', 146, 'Signed-label probabilities (appendix)'),
    ],
    slideNote: R`Rows 1 to 4 are the appendix derivation (slide 146) behind slide 23's first line. Slide 24 plots row 6 against the 0–1 loss. The numeric row is added.`,
    pre: [text(R`Use the margin defined earlier, with signed labels $y_\pm\in\{-1,+1\}$.`)],
    rows: [
      {
        eq: R`P(Y_\pm=+1\mid\mathbf x;\mathbf w)=\frac{1}{1+\exp[-f_{\mathbf w}(\mathbf x)]}`,
        notes: [tag(['C11'], R`$y_\pm=+1$ is $y=1$, so this is $p_{\mathbf w}(\mathbf x)$`)],
      },
      {
        eq: R`P(Y_\pm=-1\mid\mathbf x;\mathbf w)=1-\frac{1}{1+\exp[-f_{\mathbf w}(\mathbf x)]}=\frac{\exp[-f_{\mathbf w}(\mathbf x)]}{1+\exp[-f_{\mathbf w}(\mathbf x)]}`,
        notes: [lab('the two probabilities add to 1')],
      },
      {
        eq: R`=\frac{1}{1+\exp[f_{\mathbf w}(\mathbf x)]}`,
        notes: [tag(['I64'], R`divide top and bottom by $\exp[-f]$: $1-g(f)=g(-f)$`)],
      },
      {
        eq: R`P(Y_\pm=y_\pm\mid\mathbf x;\mathbf w)=g(y_\pm f_{\mathbf w}(\mathbf x))=g(m)=\frac{1}{1+e^{-m}}`,
        notes: [
          lab(R`rows 1 and 3 are $g(+f)$ and $g(-f)$: both are $g(y_\pm f)$`),
          term('Probability of the observed label'),
        ],
      },
      {
        eq: R`\ell_{\log}(m)=-\log g(m)=\log(1+e^{-m})`,
        notes: [tag(['I36'], R`$-\log\frac{1}{a}=\log a$`)],
      },
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\log(1+e^{-m_i}),\qquad m_i=y_{i\pm}\mathbf w^\top\mathbf x_i`,
        notes: [
          lab('the same total loss as the cross-entropy, written with margins'),
          lab('increasing the margin always reduces logistic loss'),
          shape(R`m_i:\ 1\times1,\qquad L:\ 1\times1`),
        ],
      },
      {
        eq: R`m=-2:\ 2.127,\qquad m=0:\ \log2=0.693,\qquad m=2:\ 0.127,\qquad m=3:\ 0.049`,
        notes: [
          ex('the slide 24 curve: decreasing everywhere, roughly linear for large negative m, never exactly 0'),
          lab(R`for $m\ll0$, $\log(1+e^{-m})\approx-m$: errors cost in proportion to their size, not its square`),
        ],
      },
    ],
  },
  {
    id: 'compare',
    title: 'Log loss and squared loss',
    why: R`Side by side the two surrogates behave the same for errors near the boundary but disagree far from it. This is what makes logistic regression robust to points that are already classified correctly.`,
    slides: [slide('L2', 25, 'Log loss and squared loss'), slide('L2', 26, 'A distant group changes the fit')],
    slideNote: R`Slide 26 figure: two classes (red crosses, blue circles) in two input features. Left: linear regression (purple) and logistic regression (green) give almost the same boundary. Right: a far group of blue points is added at the bottom right; the purple boundary tilts and now cuts through the blue class, while the green one barely moves. The table is added.`,
    rows: [
      {
        eq: R`\ell_{\text{sq}}=(1-m)^2,\qquad \ell_{\log}=\log(1+\exp(-m))`,
        notes: [lab('log loss keeps decreasing; squared loss penalises confident correct scores beyond margin 1')],
      },
      {
        eq: R`\begin{array}{c|cccccc} m & -2 & -1 & 0 & 1 & 2 & 3\\ \hline \ell_{01} & 1 & 1 & \text{tie} & 0 & 0 & 0\\ \ell_{\text{sq}} & 9 & 4 & 1 & 0 & 1 & 4\\ \ell_{\log} & 2.13 & 1.31 & 0.69 & 0.31 & 0.13 & 0.05\end{array}`,
        notes: [ex(R`read across: at $m=3$ the squared loss is back up to 4; the log loss is almost 0`)],
      },
    ],
    callouts: [
      {
        heading: 'Why the distant group moves least squares',
        flag: 'C11',
        text: R`The added blue points have large margins (they are far on the correct side). Squared loss charges them $(1-m)^2$, which is large, so the fit tilts towards them and moves the boundary into the blue class. Log loss charges them almost nothing, so they barely affect the fit.`,
        eq: R`m\gg1:\quad \ell_{\text{sq}}=(1-m)^2\ \text{large},\qquad \ell_{\log}\approx e^{-m}\approx0`,
      },
    ],
  },
];

export const logisticRegression: Topic = {
  id: 'logistic-regression',
  title: 'Logistic regression and the log-loss',
  short: 'Logistic',
  summary: R`From the regression likelihood to a Bernoulli likelihood with $p_i=g(\mathbf w^\top\mathbf x_i)$; the binary cross-entropy $\ell=-y\log p-(1-y)\log(1-p)$; the same loss as $\log(1+e^{-m})$ in the margin, and why it beats the squared loss.`,
  identities,
  sections,
};

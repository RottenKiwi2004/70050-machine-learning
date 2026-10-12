import { R, con, ex, lab, shape, slide, tag, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I69',
    area: 'Algebra & calculus',
    tex: R`g'(a)=g(a)\,\big[1-g(a)\big]`,
    note: R`Derivative of the sigmoid. $g(a)=(1+e^{-a})^{-1}$; by the chain rule (I15) and I37, $g'(a)=-(1+e^{-a})^{-2}\cdot(-e^{-a})=\frac{1}{1+e^{-a}}\cdot\frac{e^{-a}}{1+e^{-a}}=g(a)[1-g(a)]$ (I64). It is largest, $\tfrac14$, at $a=0$, and near 0 when $g$ is near 0 or 1.`,
  },
  {
    id: 'I70',
    area: 'Vector calculus',
    tex: R`z_i=\mathbf w^\top\mathbf x_i=\sum_{j=0}^{D}w_jx_{ij}\ \Rightarrow\ \frac{\partial z_i}{\partial w_j}=x_{ij},\quad\nabla_{\mathbf w}z_i=\mathbf x_i`,
    note: R`Differentiating a linear score with respect to one coefficient keeps only that coefficient's input; stacked over $j$ this is I4 with $\mathbf a=\mathbf x_i$. Combined with the scalar chain rule (I15): $\nabla_{\mathbf w}\,h(z_i)=h'(z_i)\,\mathbf x_i$, shape $(D+1)\times1$.`,
  },
  {
    id: 'I71',
    area: 'Linear algebra',
    tex: R`\sum_{i=1}^{N}a_i\,\mathbf x_i=X^\top\mathbf a,\qquad X=\begin{bmatrix}\mathbf x_1^\top\\ \vdots\\ \mathbf x_N^\top\end{bmatrix},\ \ \mathbf a=\begin{bmatrix}a_1\\ \vdots\\ a_N\end{bmatrix}`,
    note: R`A weighted sum of the example vectors is $X^\top$ times the weight vector: the columns of $X^\top$ are the $\mathbf x_i$. Shapes: $\big((D+1)\times N\big)(N\times1)=(D+1)\times1$. Entry $j$ is $\sum_i x_{ij}a_i$, as in I17.`,
  },
];

const sections: Section[] = [
  {
    id: 'why-optimise',
    title: 'From a loss to an optimiser',
    why: R`For least squares we set the gradient to zero and solved for $\mathbf w$ in one go. For logistic regression we will find that this equation has no closed-form solution, so we need a numerical method that improves $\mathbf w$ step by step. This block of the lecture builds those methods.`,
    slides: [slide('L2', 36, 'Optimisation: gradient descent (section divider)')],
    slideNote: R`Divider. Figure: a bowl-shaped loss $L$ over $(w_1,w_2)$, green dot for the current parameters, red dot at the minimum. Reading: Murphy §§8.2.1–8.2.3 (descent direction, step size and convergence).`,
    pre: [
      text('Optimisation: gradient descent, Newton–Raphson, SGD, L1 and L2 regularisation.'),
      lab('first: the gradient of the cross-entropy, which every method below needs'),
    ],
    rows: [],
  },
  {
    id: 'derivative',
    circ: 1,
    title: 'Differentiating cross-entropy',
    why: R`Every optimiser needs the gradient of the loss. Working one coefficient $w_j$ at a time with the chain rule turns the cross-entropy into a remarkably short result: (prediction minus label) times input, summed over examples.`,
    slides: [slide('L2', 37, 'Differentiating cross-entropy')],
    slideNote: R`Row 3 (where $\partial p_i/\partial w_j$ comes from) and row 5 (the expansion before cancelling) are added to show each step.`,
    rows: [
      {
        eq: R`L(\mathbf w)=-\sum_{i=1}^{N}\big\{y_i\log p_i+(1-y_i)\log(1-p_i)\big\},\qquad p_i=g(\mathbf w^\top\mathbf x_i)`,
        notes: [
          lab(R`$j$ indexes a coefficient and its input coordinate`),
          con(R`$y_i$ and $\mathbf x_i$ are data: constants when differentiating w.r.t. $w_j$`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial w_j}=-\sum_{i=1}^{N}\Big[\frac{y_i}{p_i}-\frac{1-y_i}{1-p_i}\Big]\frac{\partial p_i}{\partial w_j}`,
        notes: [
          tag(['I8', 'I37', 'I15'], R`differentiate term by term; $\frac{d}{dp}\log p=\frac1p$ and $\frac{d}{dp}\log(1-p)=-\frac{1}{1-p}$ (chain rule, inner derivative $-1$)`),
          shape(R`\partial L/\partial w_j:\ 1\times1\ \text{(one entry of the gradient)}`),
        ],
      },
      {
        eq: R`\frac{\partial p_i}{\partial w_j}=g'(z_i)\,\frac{\partial z_i}{\partial w_j}=p_i(1-p_i)\,x_{ij}`,
        notes: [
          tag(['I69', 'I70', 'I15'], R`chain rule through the score $z_i=\mathbf w^\top\mathbf x_i$`),
          lab(R`$g'(a)=g(a)[1-g(a)]$ evaluated at $a=z_i$ is $p_i(1-p_i)$`),
        ],
      },
      {
        eq: R`=-\sum_{i=1}^{N}\Big[\frac{y_i}{p_i}-\frac{1-y_i}{1-p_i}\Big]p_i(1-p_i)\,x_{ij}`,
        notes: [lab('substitute row 3 into row 2')],
      },
      {
        eq: R`=-\sum_{i=1}^{N}\big[y_i(1-p_i)-(1-y_i)p_i\big]x_{ij}=-\sum_{i=1}^{N}\big[y_i-\cancel{y_ip_i}-p_i+\cancel{y_ip_i}\big]x_{ij}`,
        notes: [lab(R`the $p_i$ and $1-p_i$ cancel against the denominators; then multiply out`)],
      },
      {
        eq: R`\frac{\partial L}{\partial w_j}=\sum_{i=1}^{N}(p_i-y_i)\,x_{ij}`,
        notes: [
          lab('prediction minus label, times the input coordinate, summed'),
          shape(R`p_i-y_i:\ 1\times1,\quad x_{ij}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'vector-form',
    circ: 2,
    title: 'The logistic gradient has a simple form',
    why: R`Collecting all coordinates gives the gradient as one vector, and as $X^\top(\mathbf p-\mathbf y)$ in matrix form. Setting it to zero gives equations that $\mathbf w$ appears inside nonlinearly, which is exactly why we must fit iteratively.`,
    slides: [slide('L2', 38, 'The logistic gradient has a simple form')],
    slideNote: R`Row 4 (matrix form) is added, taken from appendix slide 149. The comparison with least squares in the callout is added.`,
    rows: [
      {
        eq: R`p_i=g(\mathbf w^\top\mathbf x_i),\qquad z_i=\mathbf w^\top\mathbf x_i,\qquad \ell_i=-y_i\log p_i-(1-y_i)\log(1-p_i)`,
        notes: [lab(R`$p_i$: predicted probability; $y_i$: observed label; $z_i$: the score; $\ell_i$: its loss`)],
      },
      {
        eq: R`\frac{\partial\ell_i}{\partial z_i}=p_i-y_i,\qquad \nabla_{\mathbf w}\ell_i=(p_i-y_i)\,\mathbf x_i`,
        notes: [
          tag(['I70'], R`$\nabla_{\mathbf w}\ell_i=\frac{\partial\ell_i}{\partial z_i}\nabla_{\mathbf w}z_i$ and $\nabla_{\mathbf w}z_i=\mathbf x_i$`),
          tag(['C1'], 'the gradient has the shape of w'),
          shape(R`(1\times1)\cdot\big((D+1)\times1\big)=(D+1)\times1`),
        ],
      },
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\ell_i,\qquad \nabla L(\mathbf w)=\sum_{i=1}^{N}(p_i-y_i)\,\mathbf x_i`,
        notes: [tag(['I8'], 'the gradient of a sum is the sum of the gradients')],
      },
      {
        eq: R`\nabla L(\mathbf w)=X^\top(\mathbf p-\mathbf y)`,
        notes: [
          tag(['I71'], 'a weighted sum of the rows of X is X transposed times the weights'),
          shape(R`X^\top:\ (D+1)\times N,\quad\mathbf p-\mathbf y:\ N\times1,\quad\nabla L:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`\nabla L(\hat{\mathbf w})=\mathbf 0`,
        notes: [
          tag(['I14'], 'condition at the minimum'),
          warn(R`a nonlinear system of equations in $\mathbf w$ ($\mathbf w$ sits inside $p_i=g(\mathbf w^\top\mathbf x_i)$): no closed form, so fit iteratively`),
        ],
      },
      {
        eq: R`\mathbf x_i=(1,2)^\top,\ y_i=1,\ \mathbf w=(0,0)^\top:\quad p_i=g(0)=0.5,\quad\nabla\ell_i=(0.5-1)(1,2)^\top=(-0.5,-1)^\top`,
        notes: [ex('the gradient points away from the label; stepping against it raises the score of this positive example')],
      },
    ],
    callouts: [
      {
        heading: 'Same shape as least squares',
        flag: 'I71',
        text: R`The least-squares gradient (Lecture 1) is also "prediction minus target, times input". The difference is that the logistic prediction $g(\mathbf w^\top\mathbf x_i)$ is nonlinear in $\mathbf w$, so setting the gradient to zero cannot be solved by one matrix inversion.`,
        eq: R`\text{LS: }\nabla L=2X^\top(X\mathbf w-\mathbf y),\qquad\text{logistic: }\nabla L=X^\top\big(g(X\mathbf w)-\mathbf y\big)`,
      },
    ],
  },
];

export const logisticGradient: Topic = {
  id: 'logistic-gradient',
  title: 'The gradient of the cross-entropy',
  short: 'Gradient',
  summary: R`Chain rule through $p_i=g(\mathbf w^\top\mathbf x_i)$ with $g'=g(1-g)$ gives $\partial L/\partial w_j=\sum_i(p_i-y_i)x_{ij}$, i.e. $\nabla L=X^\top(\mathbf p-\mathbf y)$, shape $(D+1)\times1$. Setting it to zero has no closed form: fit iteratively.`,
  identities,
  sections,
};

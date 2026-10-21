import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I74',
    area: 'Algebra & calculus',
    tex: R`L(w)\simeq L(a)+(w-a)L'(a)+\tfrac12(w-a)^2L''(a),\qquad L(\mathbf w)\simeq L(\mathbf w_t)+\mathbf d^\top\nabla L(\mathbf w_t)+\tfrac12\mathbf d^\top H_t\mathbf d`,
    note: R`Second-order Taylor approximation around the current point ($a$, or $\mathbf w_t$ with step $\mathbf d=\mathbf w-\mathbf w_t$). Dropping the last term gives the first-order (linear) approximation. In several dimensions $\nabla L$ is $(D+1)\times1$, $H_t$ is $(D+1)\times(D+1)$, and every term is $1\times1$. Accurate when the step is small.`,
  },
  {
    id: 'I75',
    area: 'Vector calculus',
    tex: R`(H)_{jk}=\frac{\partial^2L}{\partial w_j\,\partial w_k}=(H)_{kj},\qquad \nabla_{\mathbf d}\big(\mathbf d^\top\mathbf g+\tfrac12\mathbf d^\top H\mathbf d\big)=\mathbf g+H\mathbf d`,
    note: R`The Hessian holds all second derivatives; for a smooth $L$ the order of differentiation does not matter, so $H$ is symmetric. The gradient of the quadratic model uses I4 ($\nabla(\mathbf g^\top\mathbf d)=\mathbf g$) and I5 with symmetric $H$ ($\nabla\tfrac12\mathbf d^\top H\mathbf d=H\mathbf d$). Shapes: $\mathbf g,\mathbf d$ are $(D+1)\times1$.`,
  },
  {
    id: 'I76',
    area: 'Linear algebra',
    tex: R`H\succ0\ :\iff\ \mathbf v^\top H\mathbf v>0\ \ \forall\mathbf v\ne\mathbf 0\ \ \Rightarrow\ \ H^{-1}\ \text{exists},\quad \mathbf g^\top\big(-H^{-1}\mathbf g\big)<0\ \ (\mathbf g\ne\mathbf 0)`,
    note: R`Positive definite. Then $H$ is invertible and so is $H^{-1}$, which is also positive definite. So the Newton step $\mathbf d=-H^{-1}\mathbf g$ has $\mathbf g^\top\mathbf d<0$: by I72 it is a descent direction. If $H$ is indefinite (some $\mathbf v^\top H\mathbf v<0$) or singular, this fails.`,
  },
  {
    id: 'I77',
    area: 'Linear algebra',
    tex: R`R=\operatorname{diag}(r_1,\dots,r_N)\ \Rightarrow\ X^\top RX=\sum_{i=1}^{N}r_i\,\mathbf x_i\mathbf x_i^\top,\quad (X^\top RX)_{kj}=\sum_{i=1}^{N}x_{ik}\,r_i\,x_{ij}`,
    note: R`A diagonal matrix in the middle weights each example. $X$ is $N\times(D+1)$, $R$ is $N\times N$, the result is $(D+1)\times(D+1)$ and symmetric. If every $r_i\ge0$ it is positive semi-definite, since $\mathbf v^\top X^\top RX\mathbf v=\sum_ir_i(\mathbf x_i^\top\mathbf v)^2\ge0$.`,
  },
  {
    id: 'I78',
    area: 'Optimisation',
    tex: R`\arg\min_{\mathbf w}\tfrac12(\mathbf u-X\mathbf w)^\top R\,(\mathbf u-X\mathbf w)\ \ \text{solves}\ \ X^\top RX\,\mathbf w=X^\top R\,\mathbf u`,
    note: R`Weighted least squares: residual $i$ counts with weight $r_i$. Same derivation as the Normal Equation (I2, I3, I4, I5, I14) with $R$ symmetric in the middle; $R=I$ gives back $X^\top X\mathbf w=X^\top\mathbf u$.`,
  },
];

const sections: Section[] = [
  {
    id: 'narrow-valley',
    title: 'Learning rate and narrow valleys',
    why: R`Gradient descent uses one step size for every direction. When the loss is steep in one direction and flat in another (a narrow valley), any single rate is either too large for the steep direction or too small for the flat one. Newton's method fixes this by using curvature.`,
    slides: [slide('L2', 48, 'Newton–Raphson (section divider)'), slide('L2', 49, 'Learning rate and narrow valleys')],
    slideNote: R`Slide 48 is the divider (figure: contour lines with iterates $x_0,\dots,x_4$; reading Murphy §8.3.1). Slide 49 figure: a path that zig-zags across a long elliptical valley in $(w_1,w_2)$. Rows 2 and 3 are added, using the bowl from the gradient-descent topic.`,
    pre: [
      text('A narrow valley has very different curvature in different parameter directions. One rate can make progress slow or oscillatory.'),
    ],
    manim: 'GDvsNewton', // animations/optimisation.py: gradient descent zig-zags; Newton jumps
    rows: [
      {
        eq: R`\text{Initialize: }\mathbf w_0,\qquad\text{Update: }\mathbf w_{t+1}=\mathbf w_t-\htmlClass{c-red}{\eta_t}\nabla L(\mathbf w_t)`,
        notes: [lab('step-size selection: how large a step?')],
      },
      {
        eq: R`L=\tfrac12(w_1^2+k\,w_2^2):\qquad w_{1,t+1}=w_{1,t}-\eta\,w_{1,t}=(1-\eta)w_{1,t},\qquad w_{2,t+1}=w_{2,t}-\eta\,k\,w_{2,t}=(1-k\eta)w_{2,t}`,
        notes: [
          lab(R`$k$ is the curvature ratio; a narrow valley has large $k$`),
          ex(R`the gradient is $(w_1,\,k\,w_2)^\top$, so each coordinate of $\mathbf w_t-\eta\nabla L$ is the old value minus $\eta$ times its own gradient entry`),
          tag(['I73'], R`stable only if $|1-k\eta|<1$, i.e. $\eta<2/k$`),
        ],
      },
      {
        eq: R`|1-k\eta|<1\iff-1<1-k\eta<1\iff0<k\eta<2\iff0<\eta<\frac2k`,
        notes: [
          ex(R`subtract 1 from all three parts: $-2<-k\eta<0$; multiply by $-1$ (which flips both inequalities): $0<k\eta<2$; divide by $k>0$`),
        ],
      },
      {
        eq: R`k=10,\ \eta=0.15:\quad 1-k\eta=1-10(0.15)=1-1.5=-0.5,\qquad 1-\eta=1-0.15=0.85,\qquad \frac2k=0.2`,
        notes: [
          ex(R`$w_2$ flips sign every step (the zig-zag) while $w_1$ keeps $85\%$ of itself per step (slow)`),
          warn(R`raising $\eta$ to speed up $w_1$ makes $w_2$ diverge once $\eta>0.2$`),
        ],
      },
    ],
  },
  {
    id: 'ls-curvature',
    circ: 1,
    title: 'Curvature in least squares',
    why: R`Least squares is the cleanest example: gradient descent can need many zig-zag steps, yet the loss is exactly quadratic, so a method that uses its curvature lands on the answer in one step. We recall the solution to check this.`,
    slides: [slide('L2', 50, 'Curvature in least squares'), slide('L2', 51, 'Recall: the least-squares solution')],
    slideNote: R`Slide 50 figure: gradient descent zig-zagging on least-squares contours. The rows deriving the gradient and Hessian, and the one-step Newton check, are added.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`L(\mathbf w)=(\mathbf y-X\mathbf w)^\top(\mathbf y-X\mathbf w)=\boldsymbol\epsilon^\top\boldsymbol\epsilon,\qquad\boldsymbol\epsilon=\mathbf y-X\mathbf w`,
        notes: [
          lab(R`sum of squared errors; $\boldsymbol\epsilon$ is the residual vector`),
          shape(R`X:\ N\times(D+1),\quad\mathbf w:\ (D+1)\times1,\quad\mathbf y,\boldsymbol\epsilon:\ N\times1`),
        ],
      },
      {
        eq: R`\text{Gradient descent: }\mathbf w_{t+1}=\mathbf w_t-\eta_t\nabla L(\mathbf w_t)`,
        notes: [warn('may require many steps!')],
      },
      {
        eq: R`L(\mathbf w)=\htmlClass{c-orange}{\mathbf y^\top\mathbf y}-2\mathbf y^\top X\mathbf w+\mathbf w^\top X^\top X\mathbf w`,
        notes: [tag(['I2', 'I3'], 'multiply out (Lecture 1)'), con(R`$\mathbf y^\top\mathbf y$: no $\mathbf w$`)],
      },
      {
        eq: R`\mathbf w^*=(X^\top X)^{-1}X^\top\mathbf y`,
        notes: [tag(['I6'], 'the displayed inverse assumes X has full column rank')],
      },
      {
        eq: R`\nabla L=\nabla(\mathbf y^\top\mathbf y)-2\nabla(\mathbf y^\top X\mathbf w)+\nabla(\mathbf w^\top X^\top X\mathbf w)=\mathbf 0-2X^\top\mathbf y+2X^\top X\mathbf w`,
        notes: [
          tag(['I4', 'I5'], R`$\nabla_{\mathbf w}(\mathbf y^\top X\mathbf w)=X^\top\mathbf y$ and $\nabla_{\mathbf w}(\mathbf w^\top A\mathbf w)=2A\mathbf w$ for symmetric $A=X^\top X$ (derived in the matrix least-squares topic)`),
        ],
      },
      {
        eq: R`H_{jk}=\frac{\partial}{\partial w_k}(\nabla L)_j=\frac{\partial}{\partial w_k}\Big[2(X^\top X\mathbf w)_j-2(X^\top\mathbf y)_j\Big]=2(X^\top X)_{jk}`,
        notes: [
          ex(R`$(X^\top X\mathbf w)_j=\sum_k(X^\top X)_{jk}w_k$ has derivative $(X^\top X)_{jk}$ with respect to $w_k$; $(X^\top\mathbf y)_j$ has no $\mathbf w$`),
        ],
      },
      {
        eq: R`\nabla L=2X^\top X\mathbf w-2X^\top\mathbf y,\qquad H=\nabla^2L=2X^\top X`,
        notes: [
          tag(['I4', 'I5', 'I75'], R`differentiate the gradient once more: the Hessian is constant (no $\mathbf w$)`),
          shape(R`H:\ (D+1)\times(D+1)`),
        ],
      },
      {
        eq: R`\mathbf w_1=\mathbf w_0-(2X^\top X)^{-1}\big(2X^\top X\mathbf w_0-2X^\top\mathbf y\big)=\mathbf w_0-\tfrac12(X^\top X)^{-1}\cdot2\big(X^\top X\mathbf w_0-X^\top\mathbf y\big)`,
        notes: [
          lab('a full Newton step (next sections) from any start lands on the least-squares solution'),
          tag(['I47'], R`$(cA)^{-1}=\tfrac1cA^{-1}$ with $c=2$, and factor the 2 out of the bracket; then $\tfrac12\cdot2=1$`),
        ],
      },
      {
        eq: R`=\mathbf w_0-(X^\top X)^{-1}X^\top X\,\mathbf w_0+(X^\top X)^{-1}X^\top\mathbf y=\mathbf w_0-I\mathbf w_0+(X^\top X)^{-1}X^\top\mathbf y=\mathbf w^*`,
        notes: [
          tag(['I21'], R`distribute $(X^\top X)^{-1}$ over the bracket, so each of the two terms is multiplied by it`),
          ex(R`$(X^\top X)^{-1}X^\top X=I$, so $\mathbf w_0-\mathbf w_0=\mathbf 0$ and only $(X^\top X)^{-1}X^\top\mathbf y$ is left`),
        ],
      },
    ],
  },
  {
    id: 'taylor-1d',
    circ: 2,
    title: 'Linear and quadratic approximations',
    why: R`Gradient descent trusts a straight-line (first-order) picture of the loss, which says nothing about where the bottom is. A second-order picture is a parabola, and a parabola has a minimum we can jump to. That jump is Newton's method.`,
    slides: [slide('L2', 52, 'Linear and quadratic approximations')],
    slideNote: R`Figure: blue $L(w)$, green tangent line $l(w)$ and red parabola $q(w)$ at the black line $a\approx1.7$. The derivatives and numbers in rows 4 and 5 are added.`,
    rows: [
      {
        eq: R`L(w)\simeq L(a)+(w-a)L'(a)`,
        notes: [term('First-order Taylor approximation'), tag(['I74'], 'the tangent line at a')],
      },
      {
        eq: R`L(w)\simeq L(a)+(w-a)L'(a)+\tfrac12(w-a)^2L''(a)`,
        notes: [term('Second-order Taylor approximation'), tag(['I74'], 'adds the curvature term')],
      },
      {
        eq: R`l(w)=L(a)+(w-a)L'(a),\qquad q(w)=l(w)+\tfrac12(w-a)^2L''(a)`,
        notes: [lab(R`$a$ is the current parameter; $l$ and $q$ are local linear and quadratic models`)],
      },
      {
        eq: R`L(w)=w^2-\log w+e^{w/20},\quad L'(w)=2w-\frac1w+\frac{e^{w/20}}{20},\quad L''(w)=2+\frac1{w^2}+\frac{e^{w/20}}{400}`,
        notes: [
          lab('the blue curve on the slide (for w > 0)'),
          tag(['I37', 'I15'], R`$\frac{d}{dw}\log w=\frac1w$; $\frac{d}{dw}e^{w/20}=\frac1{20}e^{w/20}$`),
        ],
      },
      {
        eq: R`a=1.7:\quad L=1.7^2-\log1.7+e^{0.085}=2.89-0.531+1.089=3.448`,
        notes: [ex(R`$\log1.7=0.5306$ and $e^{1.7/20}=e^{0.085}=1.0887$`)],
      },
      {
        eq: R`L'(1.7)=3.4-\frac{1}{1.7}+\frac{1.0887}{20}=3.4-0.588+0.054=2.866,\qquad L''(1.7)=2+\frac{1}{1.7^2}+\frac{1.0887}{400}=2+0.346+0.003=2.349`,
        notes: [ex(R`$1/1.7=0.5882$ and $1.7^2=2.89$, so $1/2.89=0.3460$`)],
      },
      {
        eq: R`a=1.7:\quad L=3.448,\quad L'=2.866,\quad L''=2.349`,
        notes: [ex(R`the black line on the figure; $L''>0$, so the parabola opens upwards`)],
      },
    ],
  },
  {
    id: 'newton-1d',
    circ: 3,
    title: "Newton's method in one dimension",
    why: R`Fit the parabola at the current point, jump to its minimum, repeat. Setting the parabola's derivative to zero gives the update $w-L'/L''$: the slope divided by the curvature, so steep-but-curved directions get small steps and flat ones large steps.`,
    slides: [
      slide('L2', 53, "Newton's quadratic approximation"),
      slide('L2', 54, "Newton's quadratic approximation"),
      slide('L2', 55, 'Newton: a later iteration'),
      slide('L2', 56, "Newton's quadratic approximation"),
      slide('L2', 57, "Newton's method in one dimension"),
    ],
    slideNote: R`Slides 53 to 56 are figures: blue loss, red quadratic model, black the current iterate, magenta the model's minimum. Read off: $1.7\to0.48$, then $0.48\to0.65$, then $0.65\to0.70$, then black and magenta coincide. The iterate table (row 5) is added and reproduces these.`,
    derive: true, // the rows as an animated derivation, drawn in the page
    manim: 'Newton1D', // animations/optimisation.py: each Newton step jumps to the minimum of a parabola
    rows: [
      {
        eq: R`\text{Initial parameter: }w_0`,
        notes: [],
      },
      {
        eq: R`q_t(w)=L(w_t)+(w-w_t)L'(w_t)+\tfrac12(w-w_t)^2L''(w_t)`,
        notes: [lab('at any point, form the quadratic approximation'), con(R`$L(w_t),L'(w_t),L''(w_t)$ are numbers: constants in $w$`)],
      },
      {
        eq: R`q_t'(w)=0+L'(w_t)+\tfrac12\cdot2(w-w_t)L''(w_t)=L'(w_t)+(w-w_t)L''(w_t)=0`,
        notes: [
          lab('stationary condition for the quadratic model'),
          tag(['I14'], 'derivative zero at the minimum'),
          tag(['I15'], R`chain rule: $\frac{d}{dw}(w-w_t)^2=2(w-w_t)$; the constants $L(w_t),L'(w_t),L''(w_t)$ differentiate as constants`),
        ],
      },
      {
        eq: R`(w-w_t)\,L''(w_t)=-L'(w_t)\ \Rightarrow\ w-w_t=-\frac{L'(w_t)}{L''(w_t)}\ \Rightarrow\ w=w_t-\frac{L'(w_t)}{L''(w_t)}`,
        notes: [ex(R`move $L'(w_t)$ to the right, divide by $L''(w_t)$ (needs $L''\ne0$), then add $w_t$`)],
      },
      {
        eq: R`w_{t+1}=w_t-\frac{L'(w_t)}{L''(w_t)}`,
        notes: [
          term('Newton step'),
          lab('take the stationary point of this quadratic model'),
          warn(R`it is a minimum only if $L''(w_t)>0$; check convergence and whether the loss decreases`),
        ],
      },
      {
        eq: R`w_1=1.7-\frac{2.866}{2.349}=1.7-1.220=0.480,\qquad w_2=0.480-\frac{-1.074}{6.349}=0.480+0.169=0.649`,
        notes: [ex(R`apply the Newton step twice with the derivative values in the table below; subtracting a negative slope over a positive curvature moves $w$ to the right`)],
      },
      {
        eq: R`\begin{array}{c|cccc} t & w_t & L'(w_t) & L''(w_t) & w_{t+1}\\ \hline 0 & 1.700 & 2.866 & 2.349 & 0.480\\ 1 & 0.480 & -1.074 & 6.349 & 0.649\\ 2 & 0.649 & -0.192 & 4.378 & 0.693\\ 3 & 0.693 & -0.007 & 4.087 & 0.694\end{array}`,
        notes: [
          ex('the slide example: the first step overshoots to the left, then the steps shrink very fast'),
          lab(R`near the minimum the error roughly squares each step ($0.21\to0.045\to0.0016$)`),
        ],
      },
    ],
  },
  {
    id: 'taylor-nd',
    circ: 4,
    title: 'A quadratic model in several dimensions',
    why: R`With many parameters the slope becomes the gradient vector and the curvature becomes a matrix of second derivatives, the Hessian. With these the Taylor parabola becomes a bowl-shaped quadratic in the step $\mathbf d$.`,
    slides: [slide('L2', 58, 'A quadratic model in several dimensions')],
    slideNote: 'The shape line of row 2 is added.',
    rows: [
      {
        eq: R`L(\mathbf w)\simeq L(\mathbf w_t)+(\mathbf w-\mathbf w_t)^\top\nabla L(\mathbf w_t)`,
        notes: [term('First-order Taylor approximation'), tag(['I74'], 'the tangent plane')],
      },
      {
        eq: R`q_t(\mathbf w)=L(\mathbf w_t)+\mathbf d^\top\nabla L(\mathbf w_t)+\tfrac12\mathbf d^\top H_t\mathbf d,\qquad\mathbf d=\mathbf w-\mathbf w_t`,
        notes: [
          term('Second-order Taylor approximation'),
          tag(['I74'], 'the quadratic model around the current parameters'),
          shape(R`\mathbf d^\top\nabla L:\ (1\times(D+1))((D+1)\times1)=1\times1,\qquad\mathbf d^\top H_t\mathbf d:\ 1\times1`),
        ],
      },
      {
        eq: R`(H_t)_{jk}=\frac{\partial^2L}{\partial w_j\,\partial w_k}\bigg|_{\mathbf w_t}`,
        notes: [
          term('Hessian'),
          lab('it contains second derivatives: it describes local curvature'),
          tag(['I75'], 'symmetric'),
          shape(R`H_t:\ (D+1)\times(D+1);\ \ j,k\ \text{index rows and columns}`),
        ],
      },
    ],
  },
  {
    id: 'newton-nd',
    circ: 5,
    title: "Newton's method in several dimensions",
    why: R`Exactly as in one dimension: set the gradient of the quadratic model to zero and solve for the step. Dividing by the curvature becomes solving a linear system with the Hessian, which rescales every direction at once and removes the narrow-valley problem.`,
    slides: [slide('L2', 59, "Newton's method in several dimensions")],
    slideNote: R`Row 3's intermediate step and the bowl example (row 5) are added.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\text{Initial parameter: }\mathbf w_0,\qquad q_t(\mathbf w)=L(\mathbf w_t)+\mathbf d^\top\nabla L(\mathbf w_t)+\tfrac12\mathbf d^\top H_t\mathbf d`,
        notes: [lab('at any point, form the quadratic approximation')],
      },
      {
        eq: R`\nabla_{\mathbf d}q_t=\mathbf 0+\nabla L(\mathbf w_t)+\tfrac12\cdot2H_t\mathbf d=\nabla L(\mathbf w_t)+H_t\mathbf d`,
        notes: [
          tag(['I4'], R`$\nabla_{\mathbf d}(\mathbf d^\top\mathbf g)=\mathbf g$ with $\mathbf g=\nabla L(\mathbf w_t)$ (a constant vector)`),
          tag(['I5'], R`$\nabla_{\mathbf d}(\tfrac12\mathbf d^\top H_t\mathbf d)=H_t\mathbf d$ for the symmetric Hessian; $L(\mathbf w_t)$ is a constant`),
          shape(R`(D+1)\times1`),
        ],
      },
      {
        eq: R`\nabla q_t(\mathbf w)=\mathbf 0\ \Longrightarrow\ H_t\mathbf d=-\nabla L(\mathbf w_t)`,
        notes: [
          lab('stationary condition for the quadratic model'),
          tag(['I75'], R`$\nabla_{\mathbf d}q_t=\nabla L(\mathbf w_t)+H_t\mathbf d$`),
          shape(R`\big((D+1)\times(D+1)\big)\big((D+1)\times1\big)=(D+1)\times1`),
        ],
      },
      {
        eq: R`H_t^{-1}H_t\mathbf d=-H_t^{-1}\nabla L(\mathbf w_t)\ \Rightarrow\ \mathbf d=-H_t^{-1}\nabla L(\mathbf w_t)\ \Rightarrow\ \mathbf w_{t+1}=\mathbf w_t+\mathbf d`,
        notes: [ex(R`multiply both sides on the LEFT by $H_t^{-1}$ (needs $H_t$ invertible); the step $\mathbf d=\mathbf w-\mathbf w_t$ is added to the current point`)],
      },
      {
        eq: R`\mathbf w_{t+1}=\mathbf w_t-H_t^{-1}\nabla L(\mathbf w_t)`,
        notes: [
          term('Newton–Raphson update'),
          lab(R`take the stationary point: $\mathbf d=-H_t^{-1}\nabla L$, multiply on the LEFT by the inverse`),
          lab('check convergence and whether the loss decreases'),
        ],
      },
      {
        eq: R`\text{GD: }\ \mathbf w_{t+1}=\mathbf w_t-\eta\,\nabla L\qquad\text{vs}\qquad\text{Newton: }\ \mathbf w_{t+1}=\mathbf w_t-H_t^{-1}\nabla L`,
        notes: [lab(R`the Hessian inverse replaces the single number $\eta$ by a matrix: a different step size for every direction`)],
      },
      {
        eq: R`L=\tfrac12(w_1^2+2w_2^2):\quad H=\begin{bmatrix}\partial_{11}L&\partial_{12}L\\\partial_{21}L&\partial_{22}L\end{bmatrix}=\begin{bmatrix}1&0\\0&2\end{bmatrix},\quad H^{-1}\nabla L=\begin{bmatrix}1&0\\0&\tfrac12\end{bmatrix}\begin{bmatrix}w_1\\2w_2\end{bmatrix}=\begin{bmatrix}1\cdot w_1+0\cdot2w_2\\0\cdot w_1+\tfrac12\cdot2w_2\end{bmatrix}=\begin{bmatrix}w_1\\w_2\end{bmatrix}`,
        notes: [
          tag(['I41'], 'the inverse of a diagonal matrix inverts each diagonal entry'),
          ex(R`so $\mathbf w_1=\mathbf w_0-\mathbf w_0=\mathbf 0$: one step to the minimum, from anywhere`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'For logistic regression',
        flag: 'I77',
        text: R`Newton gives iteratively reweighted least squares (IRLS). The derivation is in the appendix section at the end of this topic.`,
        eq: R`H=X^\top RX,\qquad R_{ii}=p_i(1-p_i)`,
      },
    ],
  },
  {
    id: 'safeguards',
    circ: 6,
    title: "When Newton's method needs safeguards",
    why: R`The quadratic model can be wrong far from the minimum or where the loss curves downwards. A step length that is shrunk until the loss drops, and a check that the Hessian is positive definite, keep Newton from going uphill. Its cost per step is also why it is rarely used for very large models.`,
    slides: [slide('L2', 60, "When Newton's method needs safeguards")],
    slideNote: R`Row 3 (why positive definite means descent) and the cost estimate in row 4 are added.`,
    rows: [
      {
        eq: R`H_t\mathbf d_t=-\nabla L(\mathbf w_t),\qquad\mathbf w_{t+1}=\mathbf w_t+\alpha_t\mathbf d_t`,
        notes: [
          lab(R`$H_t$: the Hessian at the current parameters; $\mathbf d_t$: the step direction`),
          lab(R`$\alpha_t$: a step length, often reduced until the loss decreases ("backtracking")`),
          shape(R`\mathbf d_t:\ (D+1)\times1,\quad\alpha_t:\ 1\times1`),
        ],
      },
      {
        eq: R`\alpha_t=1,\tfrac12,\tfrac14,\dots\ \text{until}\ L(\mathbf w_t+\alpha_t\mathbf d_t)<L(\mathbf w_t)`,
        notes: [ex('one simple rule: halve the step until the loss goes down')],
      },
      {
        eq: R`H_t\succ0\ \Rightarrow\ \nabla L^\top\mathbf d_t=-\nabla L^\top H_t^{-1}\nabla L<0`,
        notes: [
          tag(['I76', 'I72'], 'a positive-definite Hessian gives a descent direction'),
          warn('an indefinite or singular Hessian requires a modification'),
        ],
      },
      {
        eq: R`\text{memory}\propto(D+1)^2,\qquad\text{solving }H_t\mathbf d_t=-\nabla L\ \propto(D+1)^3`,
        notes: [
          lab('solving a linear system avoids forming an explicit inverse'),
          warn(R`for many parameters, storing and solving with the Hessian is costly: $D=10^6$ means $10^{12}$ entries`),
        ],
      },
    ],
  },
  {
    id: 'irls',
    circ: 7,
    title: 'Appendix: Newton–Raphson for logistic regression (IRLS)',
    why: R`Applying Newton to the cross-entropy needs its Hessian. It turns out to be $X^\top RX$ with example weights $p_i(1-p_i)$, and each Newton step is a weighted least-squares problem, hence the name iteratively reweighted least squares.`,
    slides: [
      slide('L2', 145, 'Appendix (section divider)'),
      slide('L2', 147, 'Newton–Raphson for logistic regression'),
      slide('L2', 148, 'Summation- and matrix-based expressions'),
      slide('L2', 149, 'Newton for logistic regression gives IRLS'),
    ],
    slideNote: R`Slide 145 lists the appendix (reading: Murphy §10.2.6, iteratively reweighted least squares). The rows after the Newton step spell out, step by step, the algebra between the two lines of slide 149.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\frac{\partial L}{\partial w_k}=\sum_{i=1}^{N}(p_i-y_i)\,x_{ik}`,
        notes: [lab('gradient, from the logistic-gradient topic'), lab(R`$i$ indexes examples; $j$ and $k$ index coefficients`)],
      },
      {
        eq: R`\frac{\partial^2L}{\partial w_k\,\partial w_j}=\frac{\partial}{\partial w_j}\Big[\sum_{i=1}^{N}(p_i-y_i)\,x_{ik}\Big]=\sum_{i=1}^{N}x_{ik}\,\frac{\partial p_i}{\partial w_j}`,
        notes: [con(R`$y_i$ and $x_{ik}$ do not depend on $\mathbf w$`), tag(['I8'], 'differentiate term by term')],
      },
      {
        eq: R`=\sum_{i=1}^{N}x_{ik}\,p_i(1-p_i)\,x_{ij}`,
        notes: [tag(['I69', 'I70'], R`$\partial p_i/\partial w_j=p_i(1-p_i)x_{ij}$, as in the gradient`)],
      },
      {
        eq: R`H_{kj}=\sum_{i=1}^{N}x_{ik}\,p_i(1-p_i)\,x_{ij}\qquad\Longleftrightarrow\qquad H(\mathbf w)=X^\top RX,\quad R_{ii}=p_i(1-p_i)`,
        notes: [
          tag(['I77'], 'a diagonal weight matrix between X transposed and X'),
          lab(R`$R$ is an $N\times N$ diagonal matrix; $p_i$ is the predicted probability of label 1`),
          shape(R`X^\top:\ (D+1)\times N,\quad R:\ N\times N,\quad X:\ N\times(D+1),\quad H:\ (D+1)\times(D+1)`),
        ],
      },
      {
        eq: R`(X^\top RX)_{kj}=\sum_{i=1}^{N}\sum_{l=1}^{N}X_{ik}R_{il}X_{lj}=\sum_{i=1}^{N}X_{ik}R_{ii}X_{ij}=\sum_{i=1}^{N}x_{ik}\,p_i(1-p_i)\,x_{ij}`,
        notes: [
          tag(['I77'], R`$R$ is diagonal, so $R_{il}=0$ unless $l=i$ and the double sum collapses to one sum`),
          ex(R`this matches the entry-wise Hessian above, so $H=X^\top RX$`),
        ],
      },
      {
        eq: R`p_i(1-p_i)=\tfrac14-\big(p_i-\tfrac12\big)^2\le\tfrac14,\qquad \mathbf v^\top X^\top RX\mathbf v=(X\mathbf v)^\top R(X\mathbf v)=\sum_{i=1}^{N}R_{ii}(\mathbf x_i^\top\mathbf v)^2`,
        notes: [
          ex(R`expand $\tfrac14-(p-\tfrac12)^2=\tfrac14-p^2+p-\tfrac14=p-p^2$; the largest value $\tfrac14$ is at $p=\tfrac12$`),
          ex(R`$(X\mathbf v)_i=\mathbf x_i^\top\mathbf v$, and $\mathbf a^\top R\mathbf a=\sum_iR_{ii}a_i^2$ for a diagonal $R$`),
        ],
      },
      {
        eq: R`0<R_{ii}=p_i(1-p_i)\le\tfrac14\ \Rightarrow\ \mathbf v^\top H\mathbf v=\sum_iR_{ii}(\mathbf x_i^\top\mathbf v)^2\ge0`,
        notes: [
          tag(['I77', 'I69'], 'the Hessian is positive semi-definite everywhere'),
          lab('so the cross-entropy is convex: a zero-gradient point is a global minimum'),
        ],
      },
      {
        eq: R`\mathbf p=g(X\mathbf w_t),\qquad R=\operatorname{diag}\big[p_i(1-p_i)\big]`,
        notes: [lab(R`at iteration $t$, evaluate probabilities and curvature weights; $g$ acts on each entry`), shape(R`\mathbf p:\ N\times1`)],
      },
      {
        eq: R`\mathbf w_{t+1}=\mathbf w_t-(X^\top RX)^{-1}X^\top(\mathbf p-\mathbf y)`,
        notes: [lab(R`substitute $\nabla L=X^\top(\mathbf p-\mathbf y)$ and $H=X^\top RX$ into the Newton step`)],
      },
      {
        eq: R`(X^\top RX)\,\mathbf w_{t+1}=(X^\top RX)\,\mathbf w_t-(X^\top RX)(X^\top RX)^{-1}X^\top(\mathbf p-\mathbf y)=X^\top RX\,\mathbf w_t+X^\top(\mathbf y-\mathbf p)`,
        notes: [
          lab(R`multiply both sides on the left by $X^\top RX$; on the last term $(X^\top RX)(X^\top RX)^{-1}=I$, and the minus sign flips $\mathbf p-\mathbf y$ into $\mathbf y-\mathbf p$`),
        ],
      },
      {
        eq: R`X^\top(\mathbf y-\mathbf p)=X^\top R\,R^{-1}(\mathbf y-\mathbf p)`,
        notes: [
          tag(['I41'], R`insert $RR^{-1}=I$ (the inverse of a diagonal matrix inverts each diagonal entry)`),
          warn(R`needs every $R_{ii}>0$, true because $0<p_i<1$`),
        ],
      },
      {
        eq: R`(X^\top RX)\,\mathbf w_{t+1}=X^\top RX\,\mathbf w_t+X^\top R\,R^{-1}(\mathbf y-\mathbf p)=X^\top R\big[X\mathbf w_t+R^{-1}(\mathbf y-\mathbf p)\big]`,
        notes: [
          tag(['I21'], R`factor $X^\top R$ out on the LEFT of both terms`),
        ],
      },
      {
        eq: R`\mathbf u=X\mathbf w_t+R^{-1}(\mathbf y-\mathbf p)\qquad\Rightarrow\qquad(X^\top RX)\,\mathbf w_{t+1}=X^\top R\,\mathbf u`,
        notes: [term('Working response'), shape(R`\mathbf u:\ N\times1;\quad u_i=z_i+\frac{y_i-p_i}{p_i(1-p_i)}`)],
      },
      {
        eq: R`\tfrac12(\mathbf u-X\mathbf w)^\top R(\mathbf u-X\mathbf w)=\tfrac12\mathbf u^\top R\mathbf u-\mathbf u^\top RX\mathbf w+\tfrac12\mathbf w^\top X^\top RX\mathbf w`,
        notes: [
          ex(R`multiply out as for ordinary least squares, with $R$ kept in the middle; the two cross terms are equal scalars because $R$ is symmetric, so they combine to $-\mathbf u^\top RX\mathbf w$`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}=\mathbf 0-X^\top R\mathbf u+X^\top RX\mathbf w=\mathbf 0\ \Rightarrow\ X^\top RX\,\mathbf w=X^\top R\,\mathbf u`,
        notes: [
          tag(['I4', 'I5'], R`$\nabla_{\mathbf w}(\mathbf a^\top\mathbf w)=\mathbf a$ with $\mathbf a=(\mathbf u^\top RX)^\top=X^\top R\mathbf u$; and $\nabla_{\mathbf w}(\tfrac12\mathbf w^\top A\mathbf w)=A\mathbf w$ with the symmetric $A=X^\top RX$`),
          lab(R`this is exactly the update equation above, so $\mathbf w_{t+1}$ is the minimiser`),
        ],
      },
      {
        eq: R`\mathbf w_{t+1}=\arg\min_{\mathbf w}\tfrac12(\mathbf u-X\mathbf w)^\top R\,(\mathbf u-X\mathbf w)`,
        notes: [
          term('Iteratively reweighted least squares (IRLS)'),
          tag(['I78'], 'the same update solves weighted least squares'),
          lab(R`"reweighted": $R$ and $\mathbf u$ are recomputed from $\mathbf w_t$ at every iteration`),
        ],
      },
    ],
  },
];

export const newtonRaphson: Topic = {
  id: 'newton-raphson',
  title: "Newton–Raphson and curvature",
  short: 'Newton',
  summary: R`Narrow valleys defeat a single learning rate. A second-order Taylor model gives Newton's step $w-L'/L''$, or $H_t\mathbf d=-\nabla L$ in many dimensions; it solves least squares in one step. Safeguards: step length, positive-definite $H$. For logistic regression $H=X^\top RX$ and Newton is IRLS.`,
  identities,
  sections,
};

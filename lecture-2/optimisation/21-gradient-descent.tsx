import { R, con, ex, lab, shape, slide, tag, term, text } from 'principia';
import type { Identity, Section, Topic } from 'principia';
import GradientDescent from '../../widgets/GradientDescent';

const identities: Identity[] = [
  {
    id: 'I72',
    area: 'Vector calculus',
    tex: R`L(\mathbf w+\epsilon\mathbf u)\approx L(\mathbf w)+\epsilon\,\mathbf u^\top\nabla L(\mathbf w),\qquad \max_{\lVert\mathbf u\rVert_2=1}\mathbf u^\top\nabla L=\lVert\nabla L\rVert_2\ \text{at}\ \mathbf u=\frac{\nabla L}{\lVert\nabla L\rVert_2}`,
    note: R`For a small step $\epsilon$ in unit direction $\mathbf u$, the loss changes by about $\epsilon\,\mathbf u^\top\nabla L$ (first-order Taylor, slide L2 58). By the Cauchy–Schwarz inequality $|\mathbf u^\top\mathbf g|\le\lVert\mathbf u\rVert\lVert\mathbf g\rVert$, this is largest along $\nabla L$ (steepest increase) and most negative along $-\nabla L$ (steepest decrease). The gradient is also perpendicular to the contour lines of $L$.`,
  },
  {
    id: 'I73',
    area: 'Algebra & calculus',
    tex: R`w_{t+1}=r\,w_t\ \Rightarrow\ w_t=r^{t}w_0,\qquad r^{t}\to0\iff|r|<1`,
    note: R`Geometric sequence. Each step multiplies by the same factor $r$. If $|r|<1$ the iterates shrink to 0; if $r<0$ they alternate in sign; $|r|=1$ never shrinks; $|r|>1$ blows up. If $0<r<1$ they shrink but never reach 0 exactly.`,
  },
];

const sections: Section[] = [
  {
    id: 'update',
    circ: 1,
    title: 'Numerical optimisation changes parameters',
    why: R`When we cannot solve $\nabla L=\mathbf 0$ directly, we start somewhere and repeatedly move the parameters a little in a direction that lowers the loss. Gradient descent uses the most obvious direction: straight downhill.`,
    slides: [slide('L2', 39, 'Numerical optimisation changes parameters')],
    pre: [text(R`Classification supplies a loss $L(\mathbf w)$. An optimiser searches for parameter values that reduce it.`)],
    rows: [
      {
        eq: R`\mathbf w_{t+1}=\mathbf w_t-\eta_t\nabla L(\mathbf w_t)`,
        notes: [
          term('Gradient descent update'),
          lab(R`$t$ counts updates; $\eta_t>0$ is the learning rate (step size)`),
          tag(['C4'], 'the gradient contains one partial derivative per parameter'),
          shape(R`\mathbf w_t,\ \nabla L(\mathbf w_t),\ \mathbf w_{t+1}:\ (D+1)\times1;\qquad \eta_t:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'example',
    circ: 2,
    title: 'Gradient descent in parameter space',
    why: R`A two-parameter bowl lets us see what the update does: the gradient arrow points uphill, we step the other way, and the iterates slide towards the minimum. Working the numbers by hand is the kind of thing the exam asks for.`,
    slides: [
      slide('L2', 40, 'Gradient descent in parameter space'),
      slide('L2', 41, 'Gradient descent in parameter space: step opposite the gradient'),
      slide('L2', 42, 'Gradient descent in parameter space, t = 0'),
      slide('L2', 43, 'Gradient descent in parameter space, t = 1'),
      slide('L2', 44, 'Gradient descent in parameter space, t = 2'),
      slide('L2', 45, 'Gradient descent in parameter space, t = 3'),
    ],
    slideNote: R`Each slide shows the bowl in 3D, its gradient field from above (green: current parameters, red: the minimum) and $\nabla L$. Slide 41 draws the gradient arrow (uphill); slide 42 draws the step (downhill) and gives the update. The worked numbers are added: a start of about $(-2,1.8)$ with $\eta=0.3$ reproduces the plotted path.`,
    pre: [
      text('Green: current parameters. Red: minimum.'),
      text('The gradient gives the steepest local increase. Take a small step in the opposite direction.'),
    ],
    rows: [
      {
        eq: R`L(\mathbf w)=\tfrac12\big(w_1^2+2w_2^2\big)`,
        notes: [lab(R`minimum at $\mathbf w=\mathbf 0$; steeper in the $w_2$ direction`), shape(R`\mathbf w:\ 2\times1`)],
      },
      {
        eq: R`\nabla L(\mathbf w)=\begin{pmatrix}\partial L/\partial w_1\\ \partial L/\partial w_2\end{pmatrix}=\begin{pmatrix}w_1\\ 2w_2\end{pmatrix}`,
        notes: [
          tag(['C4'], R`$\frac{\partial}{\partial w_1}\tfrac12w_1^2=w_1$; $\frac{\partial}{\partial w_2}\tfrac12\cdot2w_2^2=2w_2$`),
          tag(['I72'], 'it points in the direction of steepest increase'),
          shape(R`2\times1`),
        ],
      },
      {
        eq: R`\text{Initialize: }\mathbf w_0,\qquad\text{Update: }\mathbf w_{t+1}=\mathbf w_t-\eta_t\nabla L(\mathbf w_t)`,
        notes: [lab('slide 42: t = 0')],
      },
      {
        eq: R`w_{1,t+1}=(1-\eta)\,w_{1,t},\qquad w_{2,t+1}=(1-2\eta)\,w_{2,t}`,
        notes: [lab('the update, coordinate by coordinate, for a constant rate'), tag(['I73'], 'each coordinate shrinks by its own factor')],
      },
      {
        eq: R`\eta=0.3:\quad(-2,\,1.8)\to(-1.4,\,0.72)\to(-0.98,\,0.29)\to(-0.69,\,0.12)`,
        notes: [
          ex(R`$t=0,1,2,3$ as on slides 42 to 45; the loss goes $5.24\to1.50\to0.56\to0.25$`),
          lab(R`$w_2$ shrinks by $0.4$ per step, $w_1$ only by $0.7$: the path bends towards the flatter $w_1$ axis first`),
        ],
      },
    ],
  },
  {
    id: 'slopes',
    title: 'Following local slopes',
    why: 'In one dimension the gradient is just the slope of the tangent. Its sign says which way is uphill, so stepping against it always moves towards the bottom, and the steps naturally shrink as the slope flattens.',
    slides: [slide('L2', 46, 'Following local slopes')],
    slideNote: 'Figure only: four copies of a parabola with a ball and its tangent line. Panels 1 to 3: steep negative slope (move right), positive slope (move left), gentle slope (small move); panel 4: flat tangent at the bottom (no move).',
    rows: [
      {
        eq: R`w_{t+1}=w_t-\eta\,L'(w_t)`,
        notes: [
          lab(R`$L'(w_t)<0$: move right; $L'(w_t)>0$: move left; $L'(w_t)=0$: stop`),
          lab('the step size is proportional to the slope, so the steps shrink near the minimum'),
        ],
      },
    ],
  },
  {
    id: 'learning-rate',
    circ: 3,
    title: 'Learning rate and stopping',
    why: R`The learning rate is the one dial gradient descent has. A one-parameter example shows exactly when it converges, oscillates or diverges, and why "the updates got small" is not a reliable stopping rule on its own.`,
    slides: [slide('L2', 47, 'Learning rate and stopping')],
    slideNote: R`Row 2 (the closed form) and the numbers are added. The widget below is added: it runs the slide 40 bowl with your choice of $\eta$.`,
    rows: [
      {
        eq: R`L(w)=\tfrac12w^2,\qquad L'(w)=w,\qquad w_{t+1}=(1-\eta)\,w_t`,
        notes: [lab(R`one scalar parameter $w$; the minimum is at $w=0$`), con(R`$\eta$ is fixed here`)],
      },
      {
        eq: R`w_t=(1-\eta)^{t}\,w_0`,
        notes: [tag(['I73'], R`a geometric sequence with ratio $r=1-\eta$`)],
      },
      {
        eq: R`\begin{array}{l|l|l}\eta & r=1-\eta & \text{behaviour}\\ \hline 0<\eta<1 & 0<r<1 & \text{approaches 0 without changing sign}\\ \eta=1 & r=0 & \text{reaches the minimum in one step}\\ 1<\eta<2 & -1<r<0 & \text{alternates signs but still approaches 0}\\ \eta=2 & r=-1 & \text{oscillates }(\pm w_0\text{ forever})\\ \eta>2 & r<-1 & \text{diverges (unless already at 0)}\end{array}`,
        notes: [lab('the five cases on the slide')],
      },
      {
        eq: R`w_0=2:\quad\eta=0.5:\ 1,\,0.5,\,0.25;\qquad\eta=1.5:\ -1,\,0.5,\,-0.25;\qquad\eta=2.5:\ -3,\,4.5,\,-6.75`,
        notes: [ex('three steps each')],
      },
    ],
    callouts: [
      {
        heading: 'For general objectives',
        text: R`Monitor the loss and the gradient size, and impose an update budget (a maximum number of steps). A small update alone can mean that the learning rate is too small, not that you have reached the minimum.`,
        eq: R`\text{stop when }\lVert\nabla L(\mathbf w_t)\rVert_2<\varepsilon\ \text{ or }\ t=t_{\max}`,
      },
    ],
    extra: <GradientDescent />,
  },
];

export const gradientDescent: Topic = {
  id: 'gradient-descent',
  title: 'Gradient descent',
  short: 'Grad descent',
  summary: R`The update $\mathbf w_{t+1}=\mathbf w_t-\eta_t\nabla L(\mathbf w_t)$ steps against the direction of steepest increase. Worked on $L=\tfrac12(w_1^2+2w_2^2)$, and on $L=\tfrac12w^2$ where $w_t=(1-\eta)^tw_0$ shows when it converges, oscillates or diverges.`,
  identities,
  sections,
};

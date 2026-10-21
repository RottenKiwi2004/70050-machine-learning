import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';
import ExpressivenessExplorer from '../../widgets/ExpressivenessExplorer';

const sections: Section[] = [
  {
    id: 'expressiveness-intro',
    title: 'Neural networks: expressiveness',
    why: R`We know a network can solve XOR. The next question is how much more: which functions can a network represent at all, and does it matter whether we make it wide or deep? This part gives the answer in three steps: neurons build ridges and bumps, enough bumps approximate anything, and depth can need far fewer units than width.`,
    slides: [slide('L3', 59, 'Neural networks: expressiveness and representations (section divider)')],
    slideNote: R`Divider. Side panel "Selected publication milestones": 1998 Convolutional networks, 2012 AlexNet, 2017 Transformer ("Later lectures"). Reading: Murphy (2022) §§13.2.4–13.2.5, example models and the importance of depth.`,
    pre: [lab('Order: ridges and bumps (slide 60) → universal approximation (61) → width and depth (62) → representations through layers (files 45)')],
    rows: [],
  },
  {
    id: 'ridges-bumps',
    circ: 1,
    title: 'Expressiveness of perceptrons: soft thresholds, ridges, bumps',
    why: R`A single neuron is a soft step. Two opposite steps make a ridge, two crossing ridges make a bump, and bumps can be placed anywhere. This is the intuition behind the approximation theorem on the next slide: a sum of enough bumps can imitate any smooth surface.`,
    slides: [slide('L3', 60, 'Expressiveness of perceptrons')],
    slideNote: R`Three 3D surface plots over the $(x_1,x_2)$ plane. "Single sigmoid neuron: 'soft threshold' function": a smooth step along one direction, flat on both sides. "Two opposite 'soft threshold' functions: a ridge": a wall of height 1 along one direction, constant along the other. "Two ridges: a bump": a single peak where two ridges cross. The formulas in the rows are added.`,
    derive: true,
    pre: [
      lab("Single sigmoid neuron: 'soft threshold' function"),
      lab("Two opposite 'soft threshold' functions: a ridge"),
      lab('Two ridges: a bump'),
    ],
    rows: [
      {
        eq: R`s(\mathbf x)=\sigma\big(\mathbf w^\top\mathbf x+b\big)`,
        notes: [
          term('Soft threshold'),
          lab(R`close to 0 on one side of the line $\mathbf w^\top\mathbf x+b=0$, close to 1 on the other, with a smooth transition whose steepness grows with $\lVert\mathbf w\rVert$`),
          shape(R`\mathbf w,\ \mathbf x:\ 2\times1;\quad s(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`r(\mathbf x)=\sigma\big(\mathbf w^\top\mathbf x-t_1\big)-\sigma\big(\mathbf w^\top\mathbf x-t_2\big),\qquad t_1<t_2`,
        notes: [
          term('Ridge'),
          lab(R`two opposite steps along the same direction $\mathbf w$: with $u=\mathbf w^\top\mathbf x$, for $u\ll t_1$ it is $0-0=0$; for $t_1\ll u\ll t_2$ it is $1-0=1$; for $u\gg t_2$ it is $1-1=0$`),
          lab(R`it depends on $\mathbf x$ only through $u$, so it is constant along every line perpendicular to $\mathbf w$: a wall`),
        ],
      },
      {
        eq: R`B(\mathbf x)=\sigma\Big(\kappa\,\big[r_1(\mathbf x)+r_2(\mathbf x)-1.5\big]\Big),\qquad r_1,r_2\ \text{ridges along perpendicular directions},\ \kappa=10`,
        notes: [
          term('Bump'),
          ex(R`where both ridges are on: $r_1+r_2=2$, $B=\sigma(10\cdot0.5)=\sigma(5)=0.993$. Where only one is on: $r_1+r_2=1$, $B=\sigma(-5)=0.007$. Where none: $\sigma(-15)\approx0$`),
          lab('a third layer-of-neurons on top of two ridges selects the crossing region only'),
        ],
      },
    ],
  },
  {
    id: 'universal',
    circ: 2,
    title: 'Universal function approximation',
    why: R`This is the theorem that justifies using neural networks as general function approximators: one hidden layer is enough, if it is wide enough. It says nothing about how to find the weights or whether the result generalises, which is where the rest of the course lives.`,
    slides: [slide('L3', 61, 'Universal function approximation')],
    slideNote: R`Statement on the slide: for every continuous $f$ on a compact set $K$ and every $\epsilon>0$, one sufficiently wide hidden layer can achieve $\hat f(\mathbf x)=b_0+\sum_{j=1}^m\alpha_j\sigma(\mathbf w_j^\top\mathbf x+b_j)$ with $\max_{\mathbf x\in K}|f(\mathbf x)-\hat f(\mathbf x)|<\epsilon$. "Use biases, a linear output and a continuous non-polynomial activation, such as sigmoid or ReLU. $m$ is the number of hidden neurons: the width. This does not guarantee successful learning or generalization!" Credit: Cybenko (1989); Leshno, Lin, Pinkus and Schocken (1993). The matrix form and the parameter count are added.`,
    derive: true,
    pre: [
      text('For every continuous f on compact K and every ε > 0, one sufficiently wide hidden layer can achieve the bound.'),
      text('Use biases, a linear output and a continuous non-polynomial activation, such as sigmoid or ReLU.'),
      text('m is the number of hidden neurons: the width.'),
      text('This does not guarantee successful learning or generalization!'),
    ],
    rows: [
      {
        eq: R`\hat f(\mathbf x)=b_0+\sum_{j=1}^{m}\alpha_j\,\sigma\big(\mathbf w_j^\top\mathbf x+b_j\big)`,
        notes: [
          lab(R`$m$ hidden neurons ($m$ is the width); neuron $j$ has weights $\mathbf w_j$, bias $b_j$ and output weight $\alpha_j$; $b_0$ is the output bias; the output is linear`),
          shape(R`\mathbf w_j,\ \mathbf x:\ d\times1;\quad b_j,\ \alpha_j,\ b_0,\ \hat f(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`\hat f(\mathbf x)=b_0+\boldsymbol\alpha^\top\sigma\big(V\mathbf x+\mathbf b\big),\qquad V=\begin{bmatrix}\mathbf w_1^\top\\\vdots\\\mathbf w_m^\top\end{bmatrix}`,
        notes: [
          lab('the same function in layer form: row j of V is the weight vector of neuron j'),
          shape(R`V:\ m\times d;\ \mathbf b,\ \boldsymbol\alpha:\ m\times1;\ \sigma(V\mathbf x+\mathbf b):\ m\times1;\ \boldsymbol\alpha^\top\sigma(\cdot):\ 1\times1`),
          lab(R`number of parameters: $md$ (in $V$) $+\,m$ (in $\mathbf b$) $+\,m$ (in $\boldsymbol\alpha$) $+\,1=m(d+2)+1$; e.g. $d=1$, $m=32$: $97$`),
        ],
      },
      {
        eq: R`\forall\ \text{continuous }f\ \text{on compact }K,\ \forall\,\epsilon>0\ \ \exists\,m,\ \{\mathbf w_j,b_j,\alpha_j,b_0\}:\quad\max_{\mathbf x\in K}\big|f(\mathbf x)-\hat f(\mathbf x)\big|<\epsilon`,
        notes: [
          term('Universal approximation theorem'),
          lab('"compact" = closed and bounded, e.g. a box [0,1]^d; the worst-case error over the whole set can be made as small as we like, by taking m large enough'),
          warn('it says such weights exist. It does not say gradient descent finds them, how large m must be, or that the fit generalises to new data'),
        ],
      },
    ],
  },
  {
    id: 'width-depth',
    circ: 3,
    title: 'Width builds a learned feature space; depth can be cheaper',
    why: R`A wide hidden layer is a feature vector of $m$ numbers that a linear output reads. That is the feature-map picture of Week 1, with features that are learned. But some functions need exponentially many features in one layer and only a few units spread over many layers.`,
    slides: [slide('L3', 62, 'Width builds a learned feature space')],
    slideNote: R`Left plot: "Width: 32 hidden neurons, MSE = 0.00001": a smooth target curve (a cubic-like curve on $[-2,1.5]$) and a ReLU network that overlays it, with $\hat f(x)=b+\sum_{j=1}^m a_j\text{ReLU}(x-t_j)$ below. Right plot: "Fixed ReLU features": 32 hinge functions $\text{ReLU}(x-t_j)$ with kinks at evenly spaced $t_j$, "fixed hinges; fitted output weights". Below: $\boldsymbol\phi(x)=(h_1(x),\dots,h_m(x))^\top\in\mathbb R^m$. Caption: "For some functions, depth uses far fewer units than width alone." Credit: B. Fortuner (2017), "Can neural networks solve any problem?"; M. Telgarsky (2016), "Benefits of depth in neural networks". The three-ReLU tent and the sawtooth count (rows 2 to 5) are added. The widget below is added: it build a one-layer ReLU approximation with $m$ units, and stack tent layers to see $2^k$ pieces from $3k$ units.`,
    derive: true,
    pre: [
      text('For some functions, depth uses far fewer units than width alone.'),
    ],
    rows: [
      {
        eq: R`\hat f(x)=b+\sum_{j=1}^{m}a_j\,\text{ReLU}(x-t_j)=b+\mathbf a^\top\boldsymbol\phi(x),\qquad\boldsymbol\phi(x)=\begin{bmatrix}h_1(x)\\\vdots\\h_m(x)\end{bmatrix}\in\mathbb R^m,\ h_j=\text{ReLU}(x-t_j)`,
        notes: [
          lab('fixed hinges at the kinks t_j and fitted output weights a_j: a linear model on an m-dimensional feature vector, exactly the setting of Week 1 (file 06)'),
          tag(['I12'], R`$\sum_ja_jh_j=\mathbf a^\top\boldsymbol\phi$ is a dot product`),
          shape(R`\boldsymbol\phi(x),\ \mathbf a:\ m\times1;\quad\hat f(x):\ 1\times1`),
          lab('when the hidden weights are also learned, the network chooses its own features: this is "width builds a learned feature space"'),
        ],
      },
      {
        eq: R`f(x)=\text{ReLU}(x)-2\,\text{ReLU}(x-1)+\text{ReLU}(x-2):\quad f(0)=0,\ f(1)=1,\ f(2)=0,\ f(3)=0`,
        notes: [
          ex(R`three hinges with $t=0,1,2$ and $\mathbf a=(1,-2,1)$ make a tent: rising with slope 1 on $[0,1]$, falling with slope $1-2=-1$ on $[1,2]$, flat (slope $-1+1=0$) beyond (an invented example)`),
          lab(R`check $x=3$: $3-2\cdot2+1=0$ ✓; each kink changes the slope by the output weight $a_j$`),
        ],
      },
      {
        eq: R`\text{one hidden layer, }m\text{ ReLU units in 1D}\ \Rightarrow\ \le m\ \text{kinks}\ \Rightarrow\ \le m+1\ \text{linear pieces}`,
        notes: [lab('each ReLU(x - t_j) contributes a single kink at t_j, so width alone buys at most one new linear piece per unit')],
      },
      {
        eq: R`T(x)=2\,\text{ReLU}(x)-4\,\text{ReLU}\big(x-\tfrac12\big)+2\,\text{ReLU}(x-1)\ \ (x\in[0,1]):\quad T\ \text{is a tent: }0\to1\to0`,
        notes: [
          lab(R`the tent map as one layer of 3 ReLUs (a copy of row 2 scaled): $T(0)=0$, $T(\tfrac12)=1$, $T(1)=2-4\cdot\tfrac12+0=0$`),
          lab(R`stacking: $T\circ T$ has 2 tents (4 pieces), $T^{\circ k}$ has $2^{k-1}$ tents ($2^k$ linear pieces), using only $k$ layers of a few units each`),
        ],
      },
      {
        eq: R`\text{depth }k:\ \sim3k\ \text{units}\ \to\ 2^k\ \text{pieces};\qquad\text{width only: need}\ \ge2^k-1\ \text{units}\qquad(k=10:\ 30\ \text{vs}\ \ge1023)`,
        notes: [
          lab('this is the point of the Telgarsky reference: for functions with many oscillations, depth is exponentially cheaper than width'),
          warn('this counts units for exact representation; it is not a statement that deeper networks are always easier to train'),
        ],
      },
    ],
    extra: <ExpressivenessExplorer />,
  },
];

export const universalApproximation: Topic = {
  id: 'universal-approximation',
  title: 'Expressiveness: universal approximation, width and depth',
  short: 'Expressiveness',
  summary: R`Two opposite sigmoids make a ridge; two ridges make a bump. A one-hidden-layer net $\hat f=b_0+\sum_{j=1}^m\alpha_j\sigma(\mathbf w_j^\top\mathbf x+b_j)$ can approximate any continuous function on a compact set to any $\epsilon$ (it does not promise learning or generalisation). Depth can need exponentially fewer units than width.`,
  identities: [],
  sections,
};

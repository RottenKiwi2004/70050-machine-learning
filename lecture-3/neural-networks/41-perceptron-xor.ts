import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'nn-intro',
    title: 'Neural networks (1958 perceptron, 1986 MLP)',
    why: R`Kernels fix the feature map; trees choose it greedily. A neural network learns it. The route there starts with the simplest unit, the perceptron, and the simplest problem it cannot solve, XOR.`,
    slides: [slide('L3', 44, 'Neural networks (section divider)')],
    slideNote: R`Divider. Side panel: 1958 Perceptron (Rosenblatt); 1986 Multilayer perceptrons (Rumelhart, Hinton and Williams); a picture of the learned feature hierarchy (Ranzato and LeCun; Zeiler and Fergus 2013). Reading: Murphy (2022) §§10.2.5, 13.2, multilayer perceptrons.`,
    pre: [lab('Order: perceptron → XOR → hand-built network → neuron and activations → training and representations')],
    rows: [],
  },
  {
    id: 'perceptron',
    circ: 1,
    title: 'The perceptron: a hard decision',
    why: R`The perceptron is logistic regression with the smooth sigmoid replaced by a hard step. It is the building block of every neural network, so its shapes and its decision rule are worth fixing before stacking anything.`,
    slides: [slide('L3', 45, 'The perceptron: a hard decision')],
    slideNote: R`The slide has the logistic model from Lecture 2, the perceptron $\hat y=H(\mathbf w^\top\mathbf x+b)$ with a plot of the Heaviside unit $H(a)$ (0 for $a<0$, jumping to 1 at $a=0$ with a filled dot at $(0,1)$), and the equivalence $\sigma(\mathbf w^\top\mathbf x+b)\ge0.5\iff\mathbf w^\top\mathbf x+b\ge0$. Caption: "The perceptron is a deterministic classifier. Its learning rule differs from logistic regression (not covered)." Row 3 is added.`,
    derive: true,
    pre: [
      text('Lecture 2: logistic regression outputs a probability.'),
      text('A perceptron uses a hard threshold (Heaviside unit).'),
      text('For the same weights, threshold the probability at 0.5.'),
      text('The perceptron is a deterministic classifier. Its learning rule differs from logistic regression (not covered).'),
    ],
    rows: [
      {
        eq: R`p(y=1\mid\mathbf x)=\sigma(\mathbf w^\top\mathbf x+b)`,
        notes: [
          tag(['I64'], 'logistic sigmoid: a number strictly between 0 and 1'),
          shape(R`\mathbf w,\ \mathbf x:\ d\times1;\quad b,\ \mathbf w^\top\mathbf x:\ 1\times1;\quad p:\ 1\times1`),
        ],
      },
      {
        eq: R`\hat y=H(\mathbf w^\top\mathbf x+b),\qquad H(a)=\begin{cases}0&a<0\\1&a\ge0\end{cases}`,
        notes: [
          term('Perceptron / Heaviside unit'),
          lab('output is exactly 0 or 1: a deterministic decision, no probability'),
        ],
      },
      {
        eq: R`\sigma(a)\ge0.5\iff a\ge0\qquad\Rightarrow\qquad\sigma(\mathbf w^\top\mathbf x+b)\ge0.5\iff\mathbf w^\top\mathbf x+b\ge0`,
        notes: [
          tag(['I64'], R`$\sigma(0)=\tfrac{1}{1+e^0}=0.5$ and $\sigma$ is increasing, so $\sigma(a)\ge0.5$ exactly when $a\ge0$`),
          lab('so thresholding the logistic probability at 0.5 gives the same classes as the perceptron with the same weights'),
        ],
      },
    ],
  },
  {
    id: 'xor-problem',
    circ: 2,
    title: 'The XOR problem',
    why: R`XOR is the smallest dataset that a single linear boundary cannot separate. It is the standard argument for why we need hidden units, and it is small enough to solve completely by hand in the next two sections.`,
    slides: [slide('L3', 46, 'The XOR problem')],
    slideNote: R`The slide has the truth table, the model $\hat y=H(b+w_1x_1+w_2x_2)$, and the four corners of the unit square in the $(x_1,x_2)$ plane: green for $y=1$ at $(0,1)$ and $(1,0)$, red for $y=0$ at $(0,0)$ and $(1,1)$, with a line crossing the square and a red cross marking the failure. Caption: "No straight line separates the two classes. A single perceptron cannot represent XOR." The impossibility argument (rows 2 to 5) is added.`,
    derive: true,
    pre: [
      text('XOR is 1 when the two binary inputs differ, and 0 otherwise.'),
      text('No straight line separates the two classes.'),
      text('A single perceptron cannot represent XOR.'),
    ],
    rows: [
      {
        eq: R`(x_1,x_2)\mapsto y:\qquad(0,0)\mapsto0,\quad(0,1)\mapsto1,\quad(1,0)\mapsto1,\quad(1,1)\mapsto0`,
        notes: [term('XOR'), lab('true when exactly one of the inputs is 1')],
      },
      {
        eq: R`\hat y=H(b+w_1x_1+w_2x_2)\ \text{correct on all four}\ \Rightarrow\ \begin{cases}b<0&(0,0)\\ b+w_2\ge0&(0,1)\\ b+w_1\ge0&(1,0)\\ b+w_1+w_2<0&(1,1)\end{cases}`,
        notes: [
          lab(R`$H(a)=1$ exactly when $a\ge0$, so each row of the table becomes an inequality on $b,w_1,w_2$`),
          shape(R`b,\ w_1,\ w_2:\ 1\times1\ \text{each}`),
        ],
      },
      {
        eq: R`(b+w_1)+(b+w_2)\ge0\ \Rightarrow\ w_1+w_2\ge-2b`,
        notes: [lab(R`add the second and third inequalities (both are $\ge0$)`)],
      },
      {
        eq: R`b<0\ \Rightarrow\ -2b>0\ \Rightarrow\ w_1+w_2>0\ \Rightarrow\ b+w_1+w_2\ge b-2b=-b>0`,
        notes: [lab(R`combine with the first inequality: $-2b$ is positive, so $w_1+w_2$ is positive and $b+w_1+w_2\ge-b>0$`)],
      },
      {
        eq: R`b+w_1+w_2>0\quad\text{contradicts}\quad b+w_1+w_2<0\ \ (1,1)`,
        notes: [
          warn('no choice of b, w1, w2 works: a single perceptron cannot represent XOR (in the plane, no line puts (0,1) and (1,0) on one side and (0,0) and (1,1) on the other)'),
        ],
      },
    ],
  },
  {
    id: 'xor-features',
    circ: 3,
    title: 'XOR: two useful features',
    why: R`XOR is hard in $(x_1,x_2)$ but easy in the right features: "at least one is on" (OR) and "both are on" (AND). In $(z_1,z_2)=(\text{OR},\text{AND})$ one line separates XOR. Finding such features automatically is what hidden units do.`,
    slides: [slide('L3', 47, 'XOR: two useful features')],
    slideNote: R`Three truth tables with a plane plot under each. "OR feature": $z_1$ is 0 at $(0,0)$ and 1 elsewhere, with a separating line in $(x_1,x_2)$. "AND feature": $z_2$ is 1 only at $(1,1)$, with its own line. "OR, but not AND": the table in $(z_1,z_2)\mapsto y$ and a plot in the $(z_1,z_2)$ plane where one line now separates the classes. Caption: "The two positive XOR inputs both become $(z_1,z_2)=(1,0)$."`,
    derive: true,
    pre: [text('Compute two useful features: OR and AND.')],
    rows: [
      {
        eq: R`z_1=\text{OR}(x_1,x_2):\ (0,0)\mapsto0,\ (0,1)\mapsto1,\ (1,0)\mapsto1,\ (1,1)\mapsto1\qquad z_2=\text{AND}(x_1,x_2):\ 0,0,0,1`,
        notes: [lab('each feature is itself linearly separable in the inputs, so one perceptron computes each (next slide)')],
      },
      {
        eq: R`(x_1,x_2)\mapsto(z_1,z_2):\quad(0,0)\mapsto(0,0),\ \ (0,1)\mapsto(1,0),\ \ (1,0)\mapsto(1,0),\ \ (1,1)\mapsto(1,1)`,
        notes: [
          lab('stack the two features into a new input vector'),
          shape(R`(z_1,z_2):\ 2\times1`),
        ],
      },
      {
        eq: R`y=1\iff z_1=1\ \text{and}\ z_2=0\qquad\text{("OR, but not AND")}`,
        notes: [
          lab(R`the two positive XOR inputs both land on $(z_1,z_2)=(1,0)$; the negative ones land on $(0,0)$ and $(1,1)$, so a line between them separates the classes`),
          lab('XOR became linearly separable in the new features'),
        ],
      },
    ],
  },
  {
    id: 'handcrafted',
    circ: 4,
    title: 'A hand-crafted network for XOR',
    why: R`Each feature (OR, AND) and the final decision is one perceptron. Choosing the three sets of weights by hand and checking all four inputs shows exactly how a two-layer network computes a function no single perceptron can.`,
    slides: [slide('L3', 48, 'A hand-crafted network for XOR'), slide('L3', 49, 'XOR: the composition is a network')],
    slideNote: R`Slide 48 (after Murphy 2022, Fig. 13.1b): the three formulas $z_1=H(x_1+x_2-0.5)$, $z_2=H(x_1+x_2-1.5)$, $y=H(z_1-z_2-0.5)$; three small plots (a line for OR, a line for AND, a line in $(z_1,z_2)$); and a network: inputs $x_1,x_2$ and constant 1; hidden $h_1=z_1$ (OR) and $h_2=z_2$ (AND); output $y$; weights $+1,+1$ into each hidden unit, biases $-0.5$ and $-1.5$, and $+1,-1$ with bias $-0.5$ into $y$. Slide 49: the same picture with weights named $\mathbf w^1,\mathbf w^2,\mathbf w^3$ and the composition $y=f(g_1(x_1,x_2),g_2(x_1,x_2))$: "The hidden functions $g_1$ and $g_2$ compute OR and AND. One output unit combines these two hidden activations." Rows 3 to 6 (the check of all four inputs) are added.`,
    derive: true,
    pre: [
      lab('K. Murphy (2022), Fig. 13.1(b): h_1 = z_1 (OR), h_2 = z_2 (AND)'),
      text('The hidden functions g_1 and g_2 compute OR and AND.'),
      text('One output unit combines these two hidden activations.'),
    ],
    rows: [
      {
        eq: R`z_1=H(x_1+x_2-0.5),\qquad z_2=H(x_1+x_2-1.5),\qquad y=H(z_1-z_2-0.5)`,
        notes: [
          lab(R`$h_1=z_1$ is OR, $h_2=z_2$ is AND; every unit is a perceptron $H(\text{weighted sum}+\text{bias})$`),
          shape(R`x_1,x_2,z_1,z_2,y:\ 1\times1`),
        ],
      },
      {
        eq: R`y=f\big(g_1(x_1,x_2),\,g_2(x_1,x_2)\big),\qquad g_1=\text{OR},\ g_2=\text{AND}`,
        notes: [term('Composition'), lab('the network is a function of two inner functions: the hidden units compute features, the output unit combines them')],
      },
      {
        eq: R`(0,0):\ z_1=H(-0.5)=0,\ z_2=H(-1.5)=0,\ y=H(0-0-0.5)=H(-0.5)=0\ \checkmark`,
        notes: [lab(R`$H(a)=0$ for $a<0$`)],
      },
      {
        eq: R`(0,1):\ z_1=H(0.5)=1,\ z_2=H(-0.5)=0,\ y=H(1-0-0.5)=H(0.5)=1\ \checkmark`,
        notes: [lab('the input (1,0) is identical by symmetry, since both inputs enter with weight 1')],
      },
      {
        eq: R`(1,1):\ z_1=H(1.5)=1,\ z_2=H(0.5)=1,\ y=H(1-1-0.5)=H(-0.5)=0\ \checkmark`,
        notes: [lab('both features on: the output unit subtracts AND from OR, giving 0')],
      },
      {
        eq: R`\text{all four rows match XOR: }0,\,1,\,1,\,0`,
        notes: [lab('three perceptrons arranged in two layers solve what one perceptron cannot')],
      },
    ],
  },
  {
    id: 'two-layer-matrix',
    circ: 5,
    title: 'A two-layer network for XOR in matrix form',
    why: R`Writing the same network with matrices is the notation used for the rest of the lecture: one layer is an affine map followed by an activation. It lets us write a network with a thousand units in the same one line.`,
    slides: [slide('L3', 50, 'A two-layer network for XOR')],
    slideNote: R`Block diagram: $\mathbf x=(x_1,x_2)^\top$ ($2\times1$) → box $V$ ($2\times2$) → add $\mathbf b^{[1]}$ → activation $H$ → hidden neurons $\mathbf a=(a_1,a_2)^\top$ → box $W$ ($1\times2$) → add $b^{[2]}$ → $H$ → output $\hat y$. Equations $a_1=H(V_{11}x_1+V_{12}x_2+b^{[1]}_1)$, $a_2=H(V_{21}x_1+V_{22}x_2+b^{[1]}_2)$, $\hat y=H(W_{11}a_1+W_{12}a_2+b^{[2]})$, the matrices $V$, $\mathbf b^{[1]}$, $W$, $b^{[2]}\in\mathbb R$, and the compact form. "With the XOR weights: $a_1$ = OR, $a_2$ = AND, and $\hat y$ = XOR." The substitution of the XOR weights (rows 3 to 5) is added.`,
    derive: true,
    pre: [text('For compact notation, an affine map and activation form one layer.')],
    rows: [
      {
        eq: R`\mathbf a=H(V\mathbf x+\mathbf b^{[1]}),\qquad\hat y=H(W\mathbf a+b^{[2]})`,
        notes: [
          lab(R`$H$ acts on every entry of its argument; the superscript $[1],[2]$ numbers the layer`),
          shape(R`\mathbf x:\ 2\times1;\ V:\ 2\times2;\ \mathbf b^{[1]},\ \mathbf a:\ 2\times1;\ W:\ 1\times2;\ b^{[2]},\ \hat y:\ 1\times1`),
        ],
      },
      {
        eq: R`V=\begin{bmatrix}V_{11}&V_{12}\\V_{21}&V_{22}\end{bmatrix},\quad\mathbf b^{[1]}=\begin{bmatrix}b^{[1]}_1\\b^{[1]}_2\end{bmatrix},\quad W=\begin{bmatrix}W_{11}&W_{12}\end{bmatrix},\quad b^{[2]}\in\mathbb R`,
        notes: [
          lab(R`row $j$ of $V$ holds the weights of hidden neuron $j$; $V_{jk}$ is the weight from input $k$ to hidden neuron $j$`),
          shape(R`(V\mathbf x)_j=V_{j1}x_1+V_{j2}x_2:\ 1\times1`),
        ],
      },
      {
        eq: R`V=\begin{bmatrix}1&1\\1&1\end{bmatrix},\quad\mathbf b^{[1]}=\begin{bmatrix}-0.5\\-1.5\end{bmatrix},\quad W=\begin{bmatrix}1&-1\end{bmatrix},\quad b^{[2]}=-0.5`,
        notes: [lab('the weights of slide 48 in matrix form: each row of V is (1, 1); the biases are -0.5 (OR) and -1.5 (AND)')],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}1\\1\end{bmatrix}:\quad V\mathbf x+\mathbf b^{[1]}=\begin{bmatrix}2\\2\end{bmatrix}+\begin{bmatrix}-0.5\\-1.5\end{bmatrix}=\begin{bmatrix}1.5\\0.5\end{bmatrix}\ \Rightarrow\ \mathbf a=H\Big(\begin{bmatrix}1.5\\0.5\end{bmatrix}\Big)=\begin{bmatrix}1\\1\end{bmatrix}`,
        notes: [shape(R`(2\times2)(2\times1)=2\times1`), lab('both hidden units on: OR = 1 and AND = 1')],
      },
      {
        eq: R`\hat y=H\Big(\begin{bmatrix}1&-1\end{bmatrix}\begin{bmatrix}1\\1\end{bmatrix}-0.5\Big)=H(0-0.5)=H(-0.5)=0`,
        notes: [shape(R`(1\times2)(2\times1)=1\times1`), ex(R`XOR$(1,1)=0$: correct`)],
      },
    ],
    callouts: [
      {
        heading: 'Convention clash with Lecture 2',
        text: R`Here weight matrices have shape (outputs) $\times$ (inputs): $V$ is $2\times2$, $W$ is $1\times2$, and a layer is $V\mathbf x$. In Lecture 2 the weights were $W:(D+1)\times C$ with the bias folded into the input, and the score was $\mathbf W^\top\tilde{\mathbf x}$. The two are transposes of each other; always read the shape given on the slide.`,
      },
    ],
  },
];

export const perceptronXor: Topic = {
  id: 'perceptron-xor',
  title: 'Perceptron and the XOR problem',
  short: 'Perceptron, XOR',
  summary: R`The perceptron $\hat y=H(\mathbf w^\top\mathbf x+b)$ is a hard-threshold logistic regression. It cannot represent XOR (inequalities contradict), but two layers can: $z_1=\text{OR}$, $z_2=\text{AND}$, $y=H(z_1-z_2-0.5)$, i.e. $\mathbf a=H(V\mathbf x+\mathbf b^{[1]})$, $\hat y=H(W\mathbf a+b^{[2]})$.`,
  identities: [],
  sections,
};

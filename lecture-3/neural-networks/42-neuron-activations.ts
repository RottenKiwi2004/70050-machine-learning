import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I89',
    area: 'Linear algebra',
    tex: R`W(V\mathbf x+\mathbf b)=(WV)\mathbf x+W\mathbf b`,
    note: R`Matrix products are associative and distribute over sums (I21): $W(V\mathbf x)=(WV)\mathbf x$, and $W(V\mathbf x+\mathbf b)=WV\mathbf x+W\mathbf b$. Shapes: $W$ is $C\times H$, $V$ is $H\times D$, $\mathbf x$ is $D\times1$, $\mathbf b$ is $H\times1$; so $WV$ is $C\times D$ and $W\mathbf b$ is $C\times1$. The order of the matrices must not change.`,
  },
];

const sections: Section[] = [
  {
    id: 'neuron',
    title: 'The basic computation unit: a neuron',
    why: R`Every neural network is built from one repeated unit: a weighted sum of its inputs plus a bias, passed through a scalar nonlinearity. Learn this unit with its shapes and the rest of the lecture is bookkeeping.`,
    slides: [slide('L3', 51, 'The basic computation unit: a neuron')],
    slideNote: R`Block diagram: inputs $\mathbf x$ and $\mathbf w$ enter a box "Inner product and bias" (with $b$ entering from below), which outputs $z$; this goes into a box "Activation $g$", which outputs $a$. Caption: "A neuron takes a weighted sum of its inputs, adds a bias, then applies a scalar nonlinearity." The example (row 3) is added.`,
    derive: true,
    pre: [text('A neuron takes a weighted sum of its inputs, adds a bias, then applies a scalar nonlinearity.')],
    rows: [
      {
        eq: R`\mathbf x,\mathbf w\in\mathbb R^{d},\qquad b\in\mathbb R`,
        notes: [
          lab(R`$\mathbf x$: input; $\mathbf w$: weights; $b$: bias; $d$: number of inputs`),
          shape(R`\mathbf x,\ \mathbf w:\ d\times1;\quad b:\ 1\times1`),
        ],
      },
      {
        eq: R`z=\mathbf w^\top\mathbf x+b\in\mathbb R,\qquad a=g(z)`,
        notes: [
          term('Neuron'),
          tag(['I13'], R`$\mathbf w^\top\mathbf x$ is the inner product of two $d\times1$ vectors`),
          lab(R`$z$: pre-activation (the score); $g$: activation function (slide 52); $a$: activation (the neuron's output)`),
          shape(R`(1\times d)(d\times1)=1\times1;\quad z,\ a:\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}2\\-1\end{bmatrix},\ \mathbf w=\begin{bmatrix}0.5\\1\end{bmatrix},\ b=0.5:\quad z=0.5\cdot2+1\cdot(-1)+0.5=0.5,\quad a=\text{ReLU}(0.5)=0.5`,
        notes: [ex(R`$z=1-1+0.5=0.5$ (invented numbers); with $b=-0.5$ the score would be $-0.5$ and the ReLU output 0`)],
      },
    ],
    callouts: [
      {
        heading: 'Same neuron, different names',
        text: R`With $g=\sigma$ it is logistic regression (file 17); with $g=H$ it is the perceptron (file 41). A layer is many neurons side by side, which is the matrix form $\mathbf a=g(V\mathbf x+\mathbf b)$ of file 41.`,
      },
    ],
  },
  {
    id: 'activations',
    circ: 1,
    title: 'Activation functions',
    why: R`The activation function is where the nonlinearity enters. The choice matters for two things: the range of the output, and whether the derivative is useful, since training needs the derivative of every unit.`,
    slides: [slide('L3', 52, 'Activation functions')],
    slideNote: R`Four rows with a plot of $g(z)$ against $z$ on $[-4,4]$ each. Header: $z=\mathbf w^\top\mathbf x+b$, $a=g(z)$. Step (perceptron): 0 for $z<0$, 1 for $z\ge0$. Sigmoid: $1/(1+\exp(-z))$. Tanh: $(\exp(z)-\exp(-z))/(\exp(z)+\exp(-z))$. ReLU: $\max(0,z)$. The derivatives and the numeric table are added (the sigmoid and ReLU derivatives are used on slides 79, 96 and 97).`,
    derive: true,
    pre: [text('Step (perceptron) · Sigmoid · Tanh · ReLU')],
    rows: [
      {
        eq: R`\text{Step: }g(z)=\begin{cases}0&z<0\\1&z\ge0\end{cases}\qquad\text{Sigmoid: }g(z)=\frac1{1+\exp(-z)}`,
        notes: [
          tag(['I64'], 'sigmoid squashes any real number into (0, 1)'),
          lab('step: output exactly 0 or 1'),
        ],
      },
      {
        eq: R`\text{Tanh: }g(z)=\frac{\exp(z)-\exp(-z)}{\exp(z)+\exp(-z)}\qquad\text{ReLU: }g(z)=\max(0,z)`,
        notes: [
          lab('tanh squashes into (-1, 1) and is zero-centred; ReLU is 0 for negative z and the identity for positive z, range [0, infinity)'),
          term('ReLU (rectified linear unit)'),
        ],
      },
      {
        eq: R`g'_{\text{sigmoid}}(z)=g(z)\,[1-g(z)],\qquad g'_{\text{tanh}}(z)=1-g(z)^2,\qquad g'_{\text{ReLU}}(z)=\mathbb 1[z>0],\qquad g'_{\text{step}}(z)=0\ (z\ne0)`,
        notes: [
          tag(['I69'], 'sigmoid derivative (file 20)'),
          lab('ReLU: slope 1 for positive z, 0 for negative z; the value at z = 0 is set to 0 by convention (slides 96–97)'),
          warn('the step has zero slope everywhere it is differentiable, so a gradient cannot tell a hard-threshold unit which way to move: this is why networks are trained with smooth or piecewise-linear activations, not the step'),
        ],
      },
      {
        eq: R`g'_{\text{tanh}}=\frac{(e^z+e^{-z})^2-(e^z-e^{-z})^2}{(e^z+e^{-z})^2}=\frac{4}{(e^z+e^{-z})^2}=1-\Big(\frac{e^z-e^{-z}}{e^z+e^{-z}}\Big)^2=1-g^2`,
        notes: [
          lab(R`quotient rule on $\frac{u}{v}$ with $u=e^z-e^{-z}$, $u'=e^z+e^{-z}=v$ and $v'=e^z-e^{-z}=u$: $g'=\frac{u'v-uv'}{v^2}=\frac{v^2-u^2}{v^2}=1-g^2$`),
          lab(R`$(e^z+e^{-z})^2-(e^z-e^{-z})^2=4e^ze^{-z}=4$ (added derivation, not on the slide)`),
        ],
      },
      {
        eq: R`\begin{array}{c|ccc}z&\sigma(z)&\tanh(z)&\text{ReLU}(z)\\\hline-1&0.269&-0.762&0\\0&0.5&0&0\\2&0.881&0.964&2\end{array}`,
        notes: [
          ex(R`e.g. $\sigma(2)=\frac{1}{1+e^{-2}}=\frac{1}{1.1353}=0.881$ and $\tanh(2)=\frac{7.389-0.135}{7.389+0.135}=0.964$`),
          lab('compare the four shapes with the plots: all are monotone increasing in z'),
        ],
      },
    ],
  },
  {
    id: 'nonlinearity',
    circ: 2,
    title: 'Why the nonlinearity matters',
    why: R`Without an activation function, any depth of layers is just one layer in disguise: stacking linear maps gives a linear map. The nonlinearity between layers is what lets depth add expressive power, and it is the reason a network can solve XOR.`,
    slides: [slide('L3', 53, 'Why the nonlinearity matters')],
    slideNote: R`The slide shows the two collapsed lines $W(V\mathbf x+\mathbf b^{[1]})+\mathbf b^{[2]}=(WV)\mathbf x+(W\mathbf b^{[1]}+\mathbf b^{[2]})$ and the caption "Here $V$ and $W$ are weights. The two bias terms are shown explicitly; $\mathbf x$ is the input. Nonlinear activations make composition more expressive." The shapes and the numeric check (rows 2 and 3) are added.`,
    derive: true,
    pre: [
      text('Two affine layers collapse into one affine map.'),
      text('Nonlinear activations make composition more expressive.'),
    ],
    rows: [
      {
        eq: R`W\big(V\mathbf x+\mathbf b^{[1]}\big)+\mathbf b^{[2]}=(WV)\mathbf x+W\mathbf b^{[1]}+\mathbf b^{[2]}=\underbrace{(WV)}_{W'}\mathbf x+\underbrace{(W\mathbf b^{[1]}+\mathbf b^{[2]})}_{\mathbf b'}`,
        notes: [
          tag(['I89', 'I21'], R`multiply out the bracket, then group the matrices: $W(V\mathbf x)=(WV)\mathbf x$`),
          lab(R`two layers with no activation between them equal one affine layer with weights W' = WV and bias b'`),
          shape(R`W:\ C\times H,\ V:\ H\times D,\ \Rightarrow W'=WV:\ C\times D;\quad\mathbf b^{[1]}:\ H\times1,\ \mathbf b^{[2]}:\ C\times1\Rightarrow\mathbf b':\ C\times1`),
        ],
      },
      {
        eq: R`V=\begin{bmatrix}1&2\\0&1\end{bmatrix},\ \mathbf b^{[1]}=\begin{bmatrix}0\\1\end{bmatrix},\ W=\begin{bmatrix}1&-1\end{bmatrix},\ b^{[2]}=0.5\ \Rightarrow\ W'=WV=\begin{bmatrix}1&1\end{bmatrix},\ b'=W\mathbf b^{[1]}+b^{[2]}=-1+0.5=-0.5`,
        notes: [
          ex(R`$WV=\begin{bmatrix}1\cdot1+(-1)\cdot0&1\cdot2+(-1)\cdot1\end{bmatrix}=\begin{bmatrix}1&1\end{bmatrix}$ (invented numbers); $W\mathbf b^{[1]}=1\cdot0+(-1)\cdot1=-1$`),
          shape(R`(1\times2)(2\times2)=1\times2`),
        ],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}1\\1\end{bmatrix}:\ \ \text{two layers: }V\mathbf x+\mathbf b^{[1]}=\begin{bmatrix}3\\1\end{bmatrix}+\begin{bmatrix}0\\1\end{bmatrix}=\begin{bmatrix}3\\2\end{bmatrix},\ \ W(\cdot)+b^{[2]}=3-2+0.5=1.5;\qquad\text{one layer: }1+1-0.5=1.5`,
        notes: [lab('same answer: the two layers are a single affine map')],
      },
      {
        eq: R`\mathbf a=g\big(V\mathbf x+\mathbf b^{[1]}\big)\ \Rightarrow\ \hat{\mathbf y}=W\,g\big(V\mathbf x+\mathbf b^{[1]}\big)+\mathbf b^{[2]}\ \ \text{does not simplify (unless }g\text{ is linear)}`,
        notes: [
          warn('W cannot be pulled through g, because g(Vx) is not linear in x. This is what the hand-built XOR network of slide 48 relies on: without H between the layers it would reduce to one line'),
        ],
      },
    ],
  },
  {
    id: 'gradients-intro',
    circ: 3,
    title: 'Gradients throughout the network',
    why: R`A network has thousands to billions of weights and biases. To train them with gradient descent we need the derivative of one scalar loss with respect to every one of them. The next part of the lecture (files 46–49) is how that is computed efficiently.`,
    slides: [slide('L3', 54, 'Gradients throughout the network')],
    slideNote: R`Diagram (adapted from G. Hinton): input → hidden layers → output $\hat y$ compared with the target $y$ to give the scalar loss $L$; a red arrow labelled "Backpropagation: derivatives for every weight and bias" runs from the output back to the input. Text: "Learn every weight and bias by differentiating the scalar loss $L$." The update rule is added from Lecture 2.`,
    pre: [text('Learn every weight and bias by differentiating the scalar loss L.')],
    rows: [
      {
        eq: R`\boldsymbol\theta=\{V,\ \mathbf b^{[1]},\ W,\ \mathbf b^{[2]}\},\qquad L=L(\hat{\mathbf y},\mathbf y),\quad\hat{\mathbf y}=f(\mathbf x;\boldsymbol\theta)`,
        notes: [
          lab(R`$\boldsymbol\theta$ collects all parameters; $L$ is a scalar that compares the prediction $\hat{\mathbf y}$ with the target $\mathbf y$`),
          shape(R`L:\ 1\times1`),
        ],
      },
      {
        eq: R`\boldsymbol\theta\leftarrow\boldsymbol\theta-\eta\,\nabla_{\boldsymbol\theta}L\qquad\text{(gradient descent, file 21)}`,
        notes: [
          tag(['C1'], R`each gradient block, e.g. $\nabla_VL$, has the same shape as the parameter it belongs to`),
          lab(R`$\eta>0$ is the step size; backpropagation is the way to compute $\nabla_{\boldsymbol\theta}L$`),
        ],
      },
    ],
  },
];

export const neuronActivations: Topic = {
  id: 'neuron-activations',
  title: 'The neuron and activation functions',
  short: 'Neuron, activations',
  summary: R`A neuron computes $z=\mathbf w^\top\mathbf x+b$, $a=g(z)$. Activations: step, sigmoid, tanh, ReLU. Without a nonlinearity, $W(V\mathbf x+\mathbf b^{[1]})+\mathbf b^{[2]}=(WV)\mathbf x+(W\mathbf b^{[1]}+\mathbf b^{[2]})$ collapses to one affine map. Training needs the gradient of the loss with respect to every parameter.`,
  identities,
  sections,
};

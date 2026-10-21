import { R, ex, lab, shape, slide, tag, term, text } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'worked-intro',
    title: 'Backpropagation: worked MLP',
    why: R`The next three files take one very small network and push one gradient at a time backwards through it, with every shape and every number written out. Once this example is clear, the general algorithm (file 49) is the same steps with $M$ layers instead of two.`,
    slides: [slide('L3', 85, 'Backpropagation: worked MLP (Lecture 3 · Part I divider)')],
    slideNote: R`Divider (printed "Lecture 3 · Part I"; the deck's printed slide numbers run one ahead of the PDF page from here to PDF page 111). Three bullets: "A two-layer regression network", "Follow one gradient at a time", "Then generalise to deeper graphs". Reading: Murphy (2022) §§13.3.2–13.3.4.`,
    pre: [
      text('A two-layer regression network.'),
      text('Follow one gradient at a time.'),
      text('Then generalise to deeper graphs.'),
    ],
    rows: [],
  },
  {
    id: 'worked-network',
    circ: 1,
    title: 'The worked regression MLP',
    why: R`Two linear layers with a ReLU between them, and a squared-error loss: the smallest network that is genuinely nonlinear. Fix its shapes first; every gradient in the next slides has one of these shapes.`,
    slides: [slide('L3', 86, 'The worked regression MLP')],
    slideNote: R`Left: the forward graph $\mathbf x\to$ Linear ($V$: $H\times D$) $\to$ ReLU $\to$ Linear ($W$: $C\times H$) $\to$ Loss. Right: the same graph drawn vertically (Loss, Linear, ReLU, Linear), which is the strip that appears on every following slide with the layer currently being differentiated highlighted. Text: "$D$ inputs, $H$ hidden units, $C$ outputs. Biases are omitted." The numeric instance $D=2$, $H=3$, $C=2$ used in the rows below (and in files 48–49) is added.`,
    derive: true,
    pre: [text('D inputs, H hidden units, C outputs. Biases are omitted.')],
    rows: [
      {
        eq: R`V\in\mathbb R^{H\times D},\qquad W\in\mathbb R^{C\times H},\qquad\mathbf x\in\mathbb R^{D\times1},\qquad\mathbf y\in\mathbb R^{C\times1}`,
        notes: [
          lab(R`$D$ inputs, $H$ hidden units, $C$ outputs; $V$ maps the input to the hidden scores, $W$ maps the hidden activations to the outputs`),
          tag(['C15'], R`(outputs) $\times$ (inputs): $V$ is $H\times D$, $W$ is $C\times H$`),
          shape(R`V:\ H\times D;\ W:\ C\times H;\ \mathbf x:\ D\times1;\ \mathbf y:\ C\times1`),
        ],
      },
      {
        eq: R`D=2,\ H=3,\ C=2:\quad V=\begin{bmatrix}1&-1\\2&0\\-1&1\end{bmatrix},\ \ W=\begin{bmatrix}1&0&1\\0&1&-1\end{bmatrix},\ \ \mathbf x=\begin{bmatrix}1\\2\end{bmatrix},\ \ \mathbf y=\begin{bmatrix}0\\2\end{bmatrix}`,
        notes: [
          ex(R`the numbers used in the rest of this part (invented for this note; the slides stay symbolic). $V$ is $3\times2$ ($H\times D$), $W$ is $2\times3$ ($C\times H$)`),
          shape(R`V:\ 3\times2;\ W:\ 2\times3;\ \mathbf x:\ 2\times1;\ \mathbf y:\ 2\times1`),
        ],
      },
      {
        eq: R`\#\text{parameters}=HD+CH=6+6=12`,
        notes: [lab('the 12 entries of V and W are what gradient descent will change; the backward pass must produce 12 numbers: a 3 x 2 and a 2 x 3 array')],
      },
    ],
  },
  {
    id: 'forward-pass',
    circ: 2,
    title: 'Forward pass through a ReLU MLP',
    why: R`The backward pass needs the numbers computed on the way forward: the derivative of each block depends on its input. So the forward pass evaluates each block and keeps (caches) $\mathbf x$, $\mathbf z$ and $\mathbf a$.`,
    slides: [slide('L3', 87, 'Forward pass through a ReLU MLP')],
    slideNote: R`Four coloured boxes in a row, "Linear $V$", "ReLU", "Linear $W$", "Loss", with the values $\mathbf x$, $\mathbf z$, $\mathbf a$, $\hat{\mathbf y}$, $L$ between them and small pictures under each: a blue $H\times D$ grid times a green $D$-vector equals a green $H$-vector ($\mathbf z=V\mathbf x$); a green vector mapped to a green vector ($\mathbf a=\text{ReLU}(\mathbf z)$); a blue grid times a vector ($\hat{\mathbf y}=W\mathbf a$); and "$L=\frac12\lVert\hat{\mathbf y}-\mathbf y\rVert_2^2$: one scalar". Caption: "Cache $\mathbf x$, $\mathbf z$ and $\mathbf a$; the prediction is $\hat{\mathbf y}=W\mathbf a$. The same cached values will be reused in the backward pass."`,
    derive: true,
    pre: [
      text('The same cached values will be reused in the backward pass.'),
      text('Cache x, z and a; the prediction is ŷ = Wa.'),
    ],
    rows: [
      {
        eq: R`\mathbf z=V\mathbf x,\qquad\mathbf a=\operatorname{ReLU}(\mathbf z),\qquad\hat{\mathbf y}=W\mathbf a,\qquad L=\tfrac12\lVert\hat{\mathbf y}-\mathbf y\rVert_2^2`,
        notes: [
          lab(R`$\mathbf z$: hidden scores; $\mathbf a$: hidden activations; $\hat{\mathbf y}$: prediction; $L$: scalar loss. ReLU acts entry by entry`),
          shape(R`\mathbf z,\ \mathbf a:\ H\times1;\ \hat{\mathbf y}:\ C\times1;\ L:\ 1\times1`),
          tag(['I1'], R`$\lVert\mathbf v\rVert_2^2=\mathbf v^\top\mathbf v$, a scalar`),
        ],
      },
      {
        eq: R`\mathbf z=\begin{bmatrix}1&-1\\2&0\\-1&1\end{bmatrix}\begin{bmatrix}1\\2\end{bmatrix}=\begin{bmatrix}1\cdot1+(-1)\cdot2\\2\cdot1+0\cdot2\\(-1)\cdot1+1\cdot2\end{bmatrix}=\begin{bmatrix}-1\\2\\1\end{bmatrix}`,
        notes: [shape(R`(3\times2)(2\times1)=3\times1`), lab('each entry of z is a row of V dotted with x')],
      },
      {
        eq: R`\mathbf a=\max(0,\mathbf z)=\begin{bmatrix}\max(0,-1)\\\max(0,2)\\\max(0,1)\end{bmatrix}=\begin{bmatrix}0\\2\\1\end{bmatrix}`,
        notes: [lab('the negative score is clipped to 0: hidden unit 1 is "off" for this input'), shape(R`3\times1`)],
      },
      {
        eq: R`\hat{\mathbf y}=\begin{bmatrix}1&0&1\\0&1&-1\end{bmatrix}\begin{bmatrix}0\\2\\1\end{bmatrix}=\begin{bmatrix}0+0+1\\0+2-1\end{bmatrix}=\begin{bmatrix}1\\1\end{bmatrix}`,
        notes: [shape(R`(2\times3)(3\times1)=2\times1`)],
      },
      {
        eq: R`L=\tfrac12\Big[(1-0)^2+(1-2)^2\Big]=\tfrac12(1+1)=1`,
        notes: [shape(R`1\times1`), lab('cache x = (1, 2), z = (-1, 2, 1) and a = (0, 2, 1) for the backward pass')],
      },
    ],
  },
  {
    id: 'loss-backward',
    circ: 3,
    title: 'The loss starts the backward pass',
    why: R`The backward pass begins at the loss, with the trivial fact $\partial L/\partial L=1$, and its first real step is the derivative of the loss with respect to the prediction. The factor $\tfrac12$ in the loss is there so that this derivative comes out as just the residual.`,
    slides: [slide('L3', 88, 'The loss starts the backward pass'), slide('L3', 89, 'The local squared-loss derivative')],
    slideNote: R`Slide 88: a box with $L=\frac12\lVert\hat{\mathbf y}-\mathbf y\rVert_2^2$ and $\mathbf g_{\hat{\mathbf y}}=\hat{\mathbf y}-\mathbf y$, forward arrows ($\hat{\mathbf y},\mathbf y\to L$, green) and backward arrows ($\mathbf g_{\hat{\mathbf y}}\leftarrow\partial L/\partial L=1$, red); a vertical strip Loss, $\hat{\mathbf y}$ highlighted. Caption: "Our loss includes $\frac12$, so its derivative is the residual. The $C$ residual entries form the incoming column gradient." Slide 89: the same derivative written out for one training point with $C$ real-valued output coordinates: "Loss", "One coordinate", "Column gradient" with $\mathbf g_{\hat{\mathbf y}}:=\nabla_{\hat{\mathbf y}}L=\hat{\mathbf y}-\mathbf y$ ($C\times1$). Caption: "The residual is the incoming column gradient for the output linear map."`,
    derive: true,
    pre: [
      text('Our loss includes 1/2, so its derivative is the residual.'),
      text('The C residual entries form the incoming column gradient.'),
      text('One training point with C real-valued output coordinates.'),
    ],
    rows: [
      {
        eq: R`\frac{\partial L}{\partial L}=1`,
        notes: [lab('the backward pass starts here: the gradient of a quantity with respect to itself is 1'), shape(R`1\times1`)],
      },
      {
        eq: R`L=\frac12\sum_{c=1}^{C}(\hat y_c-y_c)^2`,
        notes: [
          tag(['I1'], R`$\frac12\lVert\hat{\mathbf y}-\mathbf y\rVert_2^2$ written as a sum over the $C$ output coordinates`),
          lab('local loss for one training point; each coordinate contributes one squared residual'),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial\hat y_c}=\frac12\cdot2(\hat y_c-y_c)\cdot1=\hat y_c-y_c`,
        notes: [
          tag(['I15'], R`chain rule: power rule $\frac{d}{dv}v^2=2v$ with inner function $v=\hat y_c-y_c$, whose derivative with respect to $\hat y_c$ is 1`),
          lab(R`only the term with index $c$ contains $\hat y_c$; the other terms are constants, so their derivative is 0`),
          lab(R`the $\frac12$ cancels the 2: this is why the loss is written with $\frac12$`),
          shape(R`1\times1\ \text{(one entry)}`),
        ],
      },
      {
        eq: R`\mathbf g_{\hat{\mathbf y}}:=\nabla_{\hat{\mathbf y}}L=\begin{bmatrix}\hat y_1-y_1\\\vdots\\\hat y_C-y_C\end{bmatrix}=\hat{\mathbf y}-\mathbf y`,
        notes: [
          term('Column gradient (residual)'),
          tag(['C14'], R`stack the $C$ partial derivatives into a column of the shape of $\hat{\mathbf y}$`),
          shape(R`\mathbf g_{\hat{\mathbf y}},\ \hat{\mathbf y},\ \mathbf y:\ C\times1`),
          lab('this residual is the incoming gradient for the output linear layer (next file)'),
        ],
      },
      {
        eq: R`\hat{\mathbf y}=\begin{bmatrix}1\\1\end{bmatrix},\ \mathbf y=\begin{bmatrix}0\\2\end{bmatrix}:\qquad\mathbf g_{\hat{\mathbf y}}=\begin{bmatrix}1-0\\1-2\end{bmatrix}=\begin{bmatrix}1\\-1\end{bmatrix}`,
        notes: [
          ex(R`first output is too high by 1 (so lower it), second too low by 1 (so raise it): the sign of each entry says which way $L$ grows`),
          shape(R`2\times1`),
        ],
      },
    ],
  },
];

export const workedMlpForwardLoss: Topic = {
  id: 'worked-mlp-forward-loss',
  title: 'Worked MLP: forward pass and loss gradient',
  short: 'Worked MLP (forward)',
  summary: R`The worked network is $\mathbf z=V\mathbf x$, $\mathbf a=\text{ReLU}(\mathbf z)$, $\hat{\mathbf y}=W\mathbf a$, $L=\frac12\lVert\hat{\mathbf y}-\mathbf y\rVert_2^2$ with $V:H\times D$, $W:C\times H$. Cache $\mathbf x,\mathbf z,\mathbf a$ on the forward pass. The backward pass starts with $\partial L/\partial L=1$ and $\mathbf g_{\hat{\mathbf y}}=\hat{\mathbf y}-\mathbf y$ ($C\times1$).`,
  identities: [],
  sections,
};

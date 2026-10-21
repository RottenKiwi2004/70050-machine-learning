import { R, ex, lab, shape, slide, tag, term, text } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I90',
    area: 'Vector calculus',
    tex: R`L=L(y_1,y_2),\ y_k=f_k(x)\ \Rightarrow\ \frac{dL}{dx}=\sum_{k}\frac{\partial L}{\partial y_k}\frac{dy_k}{dx}`,
    note: R`Chain rule with several paths: if $x$ reaches $L$ through two (or more) intermediate values, add the contribution of each path. In vector form $\frac{dL}{dx}=(\frac{\partial L}{\partial\mathbf y})^\top\frac{d\mathbf y}{dx}$: $(1\times2)(2\times1)=1\times1$. This is why gradients add when a value feeds several branches (slide 105).`,
  },
  {
    id: 'I91',
    area: 'Vector calculus',
    tex: R`\mathbf v=f(\mathbf u),\quad J_f=\frac{\partial\mathbf v}{\partial\mathbf u}\in\mathbb R^{m\times n}\ \Rightarrow\ \mathbf g_{\mathbf u}=J_f^\top\mathbf g_{\mathbf v}`,
    note: R`Backward chain rule. $\mathbf u$ is $n\times1$, $\mathbf v$ is $m\times1$, $J_f$ is $m\times n$ with $(J_f)_{ij}=\partial v_i/\partial u_j$ (output components in rows, input components in columns). Then $\frac{\partial L}{\partial u_j}=\sum_{i=1}^{m}\frac{\partial L}{\partial v_i}\frac{\partial v_i}{\partial u_j}=\big(J_f^\top\mathbf g_{\mathbf v}\big)_j$ by I90, so $\mathbf g_{\mathbf u}$ is $n\times1$: the incoming column gradient $\mathbf g_{\mathbf v}$ ($m\times1$) is multiplied by the transpose of the Jacobian ($n\times m$).`,
  },
  {
    id: 'I92',
    area: 'Linear algebra',
    tex: R`(\mathbf u\mathbf v^\top)_{ij}=u_iv_j,\qquad\mathbf u\in\mathbb R^{m\times1},\ \mathbf v\in\mathbb R^{n\times1}\ \Rightarrow\ \mathbf u\mathbf v^\top\in\mathbb R^{m\times n}`,
    note: R`Outer product: a column times a row is a matrix whose entry $(i,j)$ is $u_iv_j$. Every row is a multiple of $\mathbf v^\top$ and every column a multiple of $\mathbf u$ (rank 1). Compare the inner product $\mathbf u^\top\mathbf v$, which is a scalar.`,
  },
  {
    id: 'I93',
    area: 'Linear algebra',
    tex: R`\big(W^\top\mathbf g\big)_h=\sum_{c=1}^{C}W_{ch}\,g_c,\qquad W\in\mathbb R^{C\times H},\ \mathbf g\in\mathbb R^{C\times1}\ \Rightarrow\ W^\top\mathbf g\in\mathbb R^{H\times1}`,
    note: R`Multiplying by the transpose sums down a column of $W$: entry $h$ of $W^\top\mathbf g$ is column $h$ of $W$ dotted with $\mathbf g$. By contrast $(W\mathbf a)_c=\sum_hW_{ch}a_h$ sums along a row. Shapes: $(H\times C)(C\times1)=H\times1$.`,
  },
  {
    id: 'C14',
    area: 'Conventions',
    tex: R`\mathbf g_{\mathbf u}\equiv\frac{\partial L}{\partial\mathbf u}=\nabla_{\mathbf u}L\in\mathbb R^{n\times1},\qquad\nabla_QL\in\mathbb R^{r\times c}\ \ (Q\in\mathbb R^{r\times c}),\qquad J_f:\ \text{rows}=\text{outputs},\ \text{columns}=\text{inputs}`,
    note: R`Lecture 3 conventions. $L$ is always a scalar. The gradient with respect to a variable has the shape of that variable (extends C1): a column for a vector, a matrix of the same shape for a matrix. $\mathbf g_{\mathbf u}$ is the name for it ("the column loss gradient at $\mathbf u$"). A Jacobian has the output index on the rows, which is why the backward rule uses its transpose (I91).`,
  },
  {
    id: 'C15',
    area: 'Conventions',
    tex: R`\text{Lecture 3: }W\in\mathbb R^{C\times D},\ \mathbf z=W\mathbf x\qquad\text{Lecture 2: }W\in\mathbb R^{(D+1)\times C},\ \mathbf z=W^\top\tilde{\mathbf x}`,
    note: R`The two lectures put the weight matrix the other way round. In Lecture 3 a layer maps $D\to C$ by a $C\times D$ matrix acting on a column; the bias is kept as a separate vector $\mathbf b$ (or omitted on the slides). Lecture 2's $W$ is the transpose of Lecture 3's, with the bias folded into $\tilde{\mathbf x}$. Always read the shape on the slide before multiplying.`,
  },
];

const sections: Section[] = [
  {
    id: 'backprop-intro',
    title: 'Backpropagation',
    why: R`Training a network means computing the derivative of the loss with respect to every weight and bias. Backpropagation is a way to do that for all of them together, at about the cost of a single forward pass, by reusing shared factors. This file sets up the notation and the one rule (the chain rule) that everything else is built on.`,
    slides: [slide('L3', 73, 'Backpropagation (section divider)')],
    slideNote: R`Divider (the agenda with "Backpropagation" highlighted). Reading: Murphy (2022) §§13.3.2–13.3.4, backpropagation and local backward rules.`,
    pre: [lab('Files 46–49 cover slides 73–106; computation graphs and the softmax example are in the appendix (files 53 and 54).')],
    rows: [],
  },
  {
    id: 'learning-parameters',
    circ: 1,
    title: "Learning the network's parameters",
    why: R`There is one scalar loss and many parameters spread over many layers. The goal is to get the gradient of the loss with respect to the parameters of every layer; then one gradient-descent step updates them all.`,
    slides: [slide('L3', 74, "Learning the network's parameters")],
    slideNote: R`Same style of diagram as slide 54: a fully connected network (3 inputs, two hidden layers, 2 outputs) feeding $\hat y$ into a box $L$ with the target $y$ entering from above; a red arrow labelled "Backpropagation" runs right to left, with "Derivatives for every weight and bias $\partial L/\partial\theta_1,\dots,\partial L/\partial\theta_M$". Caption: "$\boldsymbol\theta_l$ collects all weights and biases in layer $l$. $M$ is the final layer."`,
    pre: [text('θ_l collects all weights and biases in layer l. M is the final layer.')],
    rows: [
      {
        eq: R`\boldsymbol\theta_l=\{W^{[l]},\,\mathbf b^{[l]}\},\quad l=1,\dots,M,\qquad L=L(\boldsymbol\theta_1,\dots,\boldsymbol\theta_M;\ \mathbf x,\mathbf y)`,
        notes: [
          lab(R`$\boldsymbol\theta_l$: all parameters of layer $l$; $M$: the final layer; $L$: scalar loss on one example $(\mathbf x,\mathbf y)$`),
          shape(R`L:\ 1\times1`),
        ],
      },
      {
        eq: R`\boldsymbol\theta_l\leftarrow\boldsymbol\theta_l-\eta\,\nabla_{\boldsymbol\theta_l}L\qquad\text{for every layer }l=1,\dots,M`,
        notes: [
          tag(['C14'], R`each gradient block has the shape of the parameter it updates`),
          lab('gradient descent needs ALL of these gradients at the current parameters'),
        ],
      },
    ],
  },
  {
    id: 'shared-computation',
    circ: 2,
    title: 'Shared computation in a multilayer network',
    why: R`The gradient for an early layer passes through all the later layers; the gradient for a later layer passes through fewer. The later layers' factors therefore appear again and again. Computing each factor once, from the end backwards, saves all the repeats.`,
    slides: [slide('L3', 75, 'Shared computation in a multilayer network'), slide('L3', 76, 'Backpropagation reuses derivative computation')],
    slideNote: R`Slide 75: a chain of boxes "Layer 1, ..., Layer $M-1$, Layer $M$" and a red "Loss" box giving $L$, input $\mathbf x$ on the left, blue boxes $\theta_1,\dots,\theta_{M-1},\theta_M$ feeding each layer from below, "layer output" labelled between layers and "prediction" before the loss; caption "Gradients for earlier layers pass through the same later layers. Calculating every parameter derivative separately would repeat this work." Slide 76: the chain $x_0\xrightarrow{f_1(\cdot,\theta_1)}x_1\xrightarrow{f_2(\cdot,\theta_2)}x_2\xrightarrow{f_3(\cdot,\theta_3)}x_3\to L$ ("Three scalar layer outputs. $\theta_l$ contains layer $l$'s parameters") and the three derivatives $\partial L/\partial\theta_3,\partial L/\partial\theta_2,\partial L/\partial\theta_1$ written as products of partials, with the shared factors coloured (red $\partial L/\partial x_3$, blue $\partial x_3/\partial x_2$); "Compute shared factors once, then reuse them for earlier layers." The names $\mathbf g_{x_l}$ and the numeric example (rows 3 to 5) are added.`,
    derive: true,
    pre: [
      text('Gradients for earlier layers pass through the same later layers.'),
      text('Calculating every parameter derivative separately would repeat this work.'),
      text('Compute shared factors once, then reuse them for earlier layers.'),
    ],
    rows: [
      {
        eq: R`x_1=f_1(x_0,\theta_1),\quad x_2=f_2(x_1,\theta_2),\quad x_3=f_3(x_2,\theta_3),\quad L=\ell(x_3)`,
        notes: [lab('a chain of three layers with one scalar output each; every layer has its own parameter'), shape(R`\text{all quantities: }1\times1`)],
      },
      {
        eq: R`\frac{\partial L}{\partial\theta_3}=\ell'\,\frac{\partial x_3}{\partial\theta_3},\qquad\frac{\partial L}{\partial\theta_2}=\ell'\,\frac{\partial x_3}{\partial x_2}\,\frac{\partial x_2}{\partial\theta_2},\qquad\frac{\partial L}{\partial\theta_1}=\ell'\,\frac{\partial x_3}{\partial x_2}\,\frac{\partial x_2}{\partial x_1}\,\frac{\partial x_1}{\partial\theta_1}`,
        notes: [
          tag(['I15'], 'scalar chain rule: multiply the local derivatives along the path from the parameter to the loss'),
          lab(R`the factors $\ell'$ and $\ell'\frac{\partial x_3}{\partial x_2}$ appear in more than one of the three lines`),
        ],
      },
      {
        eq: R`g_{x_3}=\ell'=\frac{\partial L}{\partial x_3},\qquad g_{x_2}=g_{x_3}\frac{\partial x_3}{\partial x_2},\qquad g_{x_1}=g_{x_2}\frac{\partial x_2}{\partial x_1}`,
        notes: [
          lab('compute these once, from the loss backwards: each gradient is the previous one times one local derivative'),
          lab(R`then $\frac{\partial L}{\partial\theta_3}=g_{x_3}\frac{\partial x_3}{\partial\theta_3}$, $\frac{\partial L}{\partial\theta_2}=g_{x_2}\frac{\partial x_2}{\partial\theta_2}$, $\frac{\partial L}{\partial\theta_1}=g_{x_1}\frac{\partial x_1}{\partial\theta_1}$: each parameter gradient costs one more multiplication`),
        ],
      },
      {
        eq: R`x_1=\theta_1x_0,\ x_2=\theta_2x_1,\ x_3=\theta_3x_2,\ L=\tfrac12(x_3-y)^2;\quad x_0=1,\ y=1,\ \boldsymbol\theta=(2,3,0.5)\ \Rightarrow\ x_1=2,\ x_2=6,\ x_3=3,\ L=\tfrac12(3-1)^2=2`,
        notes: [ex(R`a toy chain with invented numbers; forward pass first, and keep the values $x_1,x_2,x_3$ for the backward pass`)],
      },
      {
        eq: R`g_{x_3}=x_3-y=2\ \Rightarrow\ \frac{\partial L}{\partial\theta_3}=g_{x_3}x_2=12;\quad g_{x_2}=g_{x_3}\theta_3=1\ \Rightarrow\ \frac{\partial L}{\partial\theta_2}=g_{x_2}x_1=2;\quad g_{x_1}=g_{x_2}\theta_2=3\ \Rightarrow\ \frac{\partial L}{\partial\theta_1}=g_{x_1}x_0=3`,
        notes: [
          lab(R`check by differentiating $L=\frac12(\theta_3\theta_2\theta_1x_0-y)^2$ directly: $\partial L/\partial\theta_1=(x_3-y)\theta_3\theta_2x_0=2\cdot0.5\cdot3\cdot1=3$ ✓, $\partial L/\partial\theta_2=2\cdot0.5\cdot2=2$ ✓, $\partial L/\partial\theta_3=2\cdot3\cdot2=12$ ✓`),
          lab('three parameter gradients from one backward sweep; computing each from scratch would repeat the factors'),
        ],
      },
    ],
  },
  {
    id: 'notation',
    circ: 3,
    title: 'Mathematical notation',
    why: R`The next slides are all matrix and vector calculus, and the bookkeeping of shapes is where most mistakes happen. This slide fixes the symbols once, so every later formula can be checked by shape alone.`,
    slides: [slide('L3', 77, 'Mathematical notation')],
    slideNote: R`Three groups on the slide: "Vectors, matrices and scalar entries", "Transpose, norms and elementwise products", "Derivatives of a scalar loss $L$". Caption: "Jacobian: output components in rows, input components in columns."`,
    rows: [
      {
        eq: R`\mathbf x\in\mathbb R^{D},\quad x_j\in\mathbb R,\quad W\in\mathbb R^{C\times H}`,
        notes: [
          lab('a bold lower-case letter is a column vector (D x 1); x_j is its entry j; a capital letter is a matrix with C rows and H columns'),
          shape(R`\mathbf x:\ D\times1;\quad W:\ C\times H`),
        ],
      },
      {
        eq: R`\mathbf u^\top\mathbf v=\sum_ju_jv_j,\qquad\lVert\mathbf x\rVert_2^2=\sum_jx_j^2,\qquad\lVert W\rVert_F^2=\sum_{j,k}W_{jk}^2,\qquad\mathbf u\odot\mathbf v=(u_jv_j)_j`,
        notes: [
          tag(['I13', 'I1'], R`inner product, and squared L2 norm $=\mathbf x^\top\mathbf x$`),
          term('Frobenius norm and elementwise (Hadamard) product'),
          lab(R`$\lVert W\rVert_F^2$: sum of the squares of all entries; $\odot$: multiply matching entries (same shape in, same shape out)`),
          shape(R`\mathbf u,\mathbf v:\ n\times1\Rightarrow\mathbf u^\top\mathbf v:\ 1\times1,\ \ \mathbf u\odot\mathbf v:\ n\times1`),
        ],
      },
      {
        eq: R`\mathbf g_{\mathbf u}\equiv\frac{\partial L}{\partial\mathbf u}\in\mathbb R^{n\times1},\qquad\Big[\frac{\partial L}{\partial W}\Big]_{jk}=\frac{\partial L}{\partial W_{jk}}`,
        notes: [
          tag(['C14'], R`$L$ is a scalar; the gradient has the shape of the variable`),
          lab(R`$\mathbf g_{\mathbf u}$: "the column loss gradient at $\mathbf u$" ($\mathbf u$ is $n\times1$)`),
          shape(R`\mathbf g_{\mathbf u}:\ n\times1;\quad\partial L/\partial W:\ \text{same shape as }W`),
        ],
      },
      {
        eq: R`J_f=\frac{\partial\mathbf v}{\partial\mathbf u}\in\mathbb R^{m\times n},\qquad\mathbf g_{\mathbf u}=J_f^\top\mathbf g_{\mathbf v}`,
        notes: [
          tag(['I91'], R`$\mathbf v=f(\mathbf u)$ with $\mathbf u:\ n\times1$, $\mathbf v:\ m\times1$; $(J_f)_{ij}=\partial v_i/\partial u_j$ (output components in rows, input components in columns)`),
          shape(R`J_f^\top:\ n\times m;\quad\mathbf g_{\mathbf v}:\ m\times1;\quad\mathbf g_{\mathbf u}:\ n\times1`),
        ],
      },
      {
        eq: R`\mathbf u=\begin{bmatrix}2\\3\end{bmatrix},\ \mathbf v=\begin{bmatrix}u_1u_2\\u_1+u_2\end{bmatrix}\Rightarrow J_f=\begin{bmatrix}u_2&u_1\\1&1\end{bmatrix}=\begin{bmatrix}3&2\\1&1\end{bmatrix};\quad\mathbf g_{\mathbf v}=\begin{bmatrix}1\\-1\end{bmatrix}\Rightarrow\mathbf g_{\mathbf u}=J_f^\top\mathbf g_{\mathbf v}=\begin{bmatrix}3&1\\2&1\end{bmatrix}\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}2\\1\end{bmatrix}`,
        notes: [
          ex(R`invented function. Check: $L=v_1-v_2=u_1u_2-u_1-u_2$ gives $\partial L/\partial u_1=u_2-1=2$ and $\partial L/\partial u_2=u_1-1=1$ ✓`),
          shape(R`J_f:\ 2\times2;\quad J_f^\top\mathbf g_{\mathbf v}:\ (2\times2)(2\times1)=2\times1`),
        ],
      },
    ],
  },
  {
    id: 'chain-rule-vectors',
    circ: 4,
    title: 'Chain rule: from scalars to vectors',
    why: R`Every backward step of a network is one chain rule. Starting from the scalar version with two paths, the vector version follows by collecting the pieces into columns, and the shape check (1×1 = 1×2 times 2×1) tells you which things to transpose.`,
    slides: [slide('L3', 78, 'Chain rule: from scalars to vectors')],
    slideNote: R`Diagram: $x$ feeds $y_1=f_1(x)$ and $y_2=f_2(x)$, both feed $L(y_1,y_2)$. Note on the slide: "$L$: partial derivatives. $y_1(x),y_2(x)$: ordinary derivatives." Then $\mathbf y=(y_1,y_2)^\top$, $\partial L/\partial\mathbf y:=[\partial L/\partial y_1;\ \partial L/\partial y_2]$, $d\mathbf y/dx:=[dy_1/dx;\ dy_2/dx]$, and $\frac{dL}{dx}=(\frac{\partial L}{\partial\mathbf y})^\top\frac{d\mathbf y}{dx}$ with the shapes $1\times1$, $1\times2$, $2\times1$ under the braces. A numeric check (row 4) is added.`,
    derive: true,
    pre: [text('L: partial derivatives. y_1(x), y_2(x): ordinary derivatives. Collect the derivatives into column vectors.')],
    rows: [
      {
        eq: R`\frac{dL}{dx}=\frac{\partial L}{\partial y_1}\frac{dy_1}{dx}+\frac{\partial L}{\partial y_2}\frac{dy_2}{dx}`,
        notes: [
          tag(['I90'], R`$x$ reaches $L$ along two paths (via $y_1$ and via $y_2$): add the two path contributions`),
          lab(R`$\partial$ for $L$ (a function of two variables), $d$ for $y_k$ (functions of one variable $x$)`),
          shape(R`\text{every factor:}\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial\mathbf y}:=\begin{bmatrix}\partial L/\partial y_1\\\partial L/\partial y_2\end{bmatrix},\qquad\frac{d\mathbf y}{dx}:=\begin{bmatrix}dy_1/dx\\dy_2/dx\end{bmatrix}`,
        notes: [lab('collect the two derivatives into column vectors'), shape(R`\frac{\partial L}{\partial\mathbf y},\ \frac{d\mathbf y}{dx}:\ 2\times1`)],
      },
      {
        eq: R`\underbrace{\frac{dL}{dx}}_{1\times1}=\underbrace{\Big(\frac{\partial L}{\partial\mathbf y}\Big)^{\!\top}}_{1\times2}\ \underbrace{\frac{d\mathbf y}{dx}}_{2\times1}`,
        notes: [
          tag(['I12'], R`a sum of products $\sum_ka_kb_k$ is the inner product $\mathbf a^\top\mathbf b$; the column of partials is transposed into a row`),
          shape(R`(1\times2)(2\times1)=1\times1`),
        ],
      },
      {
        eq: R`y_1=x^2,\ y_2=3x,\ L=y_1y_2\ \ (x=2):\quad\frac{\partial L}{\partial\mathbf y}=\begin{bmatrix}y_2\\y_1\end{bmatrix}=\begin{bmatrix}6\\4\end{bmatrix},\ \ \frac{d\mathbf y}{dx}=\begin{bmatrix}2x\\3\end{bmatrix}=\begin{bmatrix}4\\3\end{bmatrix},\ \ \frac{dL}{dx}=6\cdot4+4\cdot3=36`,
        notes: [ex(R`check directly: $L=3x^3$, $dL/dx=9x^2=36$ at $x=2$ ✓ (invented functions)`)],
      },
    ],
    callouts: [
      {
        heading: 'From one input to a vector of inputs',
        flag: 'I91',
        text: R`With a vector $\mathbf u$ in place of $x$ and a vector $\mathbf v$ in place of $\mathbf y$, the same sum over paths gives $\mathbf g_{\mathbf u}=J_f^\top\mathbf g_{\mathbf v}$: the transpose of the Jacobian carries a column gradient backwards.`,
      },
    ],
  },
  {
    id: 'logistic-backprop',
    circ: 5,
    title: 'Logistic regression: local derivatives and the chain rule',
    why: R`Logistic regression is the smallest network: inner product, sigmoid, loss. Deriving its gradient block by block, with one local derivative per block, is exactly the pattern used for every network in the rest of the lecture. It also gives the same $(p-y)\mathbf x$ that Lecture 2 found the long way (file 20).`,
    slides: [slide('L3', 79, 'Logistic regression: local derivatives'), slide('L3', 80, 'Logistic regression: applying the chain rule')],
    slideNote: R`Slides 79 and 80 draw the same graph: inputs $\mathbf w$ and $\mathbf x_i$ enter "Inner product" giving $z_i$, then "Sigmoid" giving $p_i$, then "BCE loss" (with the label $y_i$ entering from above) giving $L$. Slide 79 lists each block's local derivatives; slide 80 draws red backward arrows under the blocks ("Use the local derivatives from the previous slide") and multiplies them: "Score" $\partial L/\partial z_i$, "Weights" $\nabla_{\mathbf w}L$. The numeric check (row 7) and the input gradient (row 8) are added.`,
    derive: true,
    pre: [
      text('w, x_i ∈ R^d, y_i ∈ {0, 1}.'),
      text('Each block supplies a local derivative for the backward pass.'),
    ],
    rows: [
      {
        eq: R`z_i=\mathbf w^\top\mathbf x_i,\qquad p_i=\sigma(z_i)=\frac1{1+e^{-z_i}},\qquad L=-y_i\log p_i-(1-y_i)\log(1-p_i)`,
        notes: [
          lab('forward pass: three blocks in a row (inner product, sigmoid, binary cross-entropy)'),
          tag(['I64'], 'the sigmoid'),
          shape(R`\mathbf w,\ \mathbf x_i:\ d\times1;\quad z_i,\ p_i,\ y_i,\ L:\ 1\times1`),
        ],
      },
      {
        eq: R`\textbf{Inner product:}\quad\nabla_{\mathbf w}z_i=\mathbf x_i,\qquad\nabla_{\mathbf x_i}z_i=\mathbf w`,
        notes: [
          tag(['I70', 'I4'], R`$z_i=\sum_jw_jx_{ij}$: $\partial z_i/\partial w_j=x_{ij}$ and $\partial z_i/\partial x_{ij}=w_j$`),
          shape(R`\nabla_{\mathbf w}z_i,\ \nabla_{\mathbf x_i}z_i:\ d\times1`),
        ],
      },
      {
        eq: R`\textbf{Sigmoid:}\quad\frac{dp_i}{dz_i}=p_i(1-p_i)`,
        notes: [tag(['I69'], 'sigmoid derivative (file 20)'), shape(R`1\times1`)],
      },
      {
        eq: R`\textbf{BCE loss:}\quad\frac{\partial L}{\partial p_i}=-\frac{y_i}{p_i}+\frac{1-y_i}{1-p_i}`,
        notes: [tag(['I37', 'I15'], R`$\frac{d}{dp}\log p=\frac1p$; for $\log(1-p)$ the inner derivative is $-1$`), shape(R`1\times1`)],
      },
      {
        eq: R`\frac{\partial L}{\partial z_i}=\frac{\partial L}{\partial p_i}\frac{dp_i}{dz_i}=\Big(-\frac{y_i}{p_i}+\frac{1-y_i}{1-p_i}\Big)p_i(1-p_i)=-y_i(1-p_i)+(1-y_i)p_i=p_i-y_i`,
        notes: [
          term('Score gradient'),
          lab(R`multiply the local derivative of the loss block by that of the sigmoid block: the $p_i$ cancels the $\frac1{p_i}$ and $(1-p_i)$ cancels $\frac1{1-p_i}$; then $-y_i+y_ip_i+p_i-y_ip_i=p_i-y_i$`),
          lab('prediction minus label'),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}L=\frac{\partial L}{\partial z_i}\,\nabla_{\mathbf w}z_i=(p_i-y_i)\,\mathbf x_i`,
        notes: [
          term('Weight gradient'),
          tag(['I91'], R`scalar $z_i$ depends on $\mathbf w$ only: $J=\mathbf x_i^\top$, so $\mathbf g_{\mathbf w}=\mathbf x_i\,\frac{\partial L}{\partial z_i}$`),
          shape(R`(1\times1)(d\times1)=d\times1`),
          lab('the same result as the sum over examples in file 20, for one example'),
        ],
      },
      {
        eq: R`\mathbf x_i=\begin{bmatrix}1\\2\end{bmatrix},\ \mathbf w=\begin{bmatrix}0.5\\-0.25\end{bmatrix},\ y_i=1:\ z=0.5-0.5=0,\ p=0.5,\ L=-\log0.5=0.693,\ \frac{\partial L}{\partial z}=0.5-1=-0.5`,
        notes: [ex(R`invented numbers: with $z=0$ the model is unsure ($p=0.5$) and the label is 1, so the loss is pushed to raise $z$ (negative gradient)`)],
      },
      {
        eq: R`\nabla_{\mathbf w}L=-0.5\begin{bmatrix}1\\2\end{bmatrix}=\begin{bmatrix}-0.5\\-1\end{bmatrix},\qquad\nabla_{\mathbf x_i}L=\frac{\partial L}{\partial z_i}\mathbf w=-0.5\begin{bmatrix}0.5\\-0.25\end{bmatrix}=\begin{bmatrix}-0.25\\0.125\end{bmatrix}`,
        notes: [
          lab(R`a gradient-descent step $\mathbf w\leftarrow\mathbf w-\eta\nabla_{\mathbf w}L$ adds $\eta(0.5,1)$: the weights move towards the example`),
          lab('the input gradient is not needed to train the weights (slide 99) but is what is passed to an earlier layer if there is one'),
        ],
      },
    ],
  },
  {
    id: 'gradient-shapes',
    circ: 6,
    title: "Gradients have the parameter's shape",
    why: R`This slide is the rule that lets you check every gradient formula by shape alone: whatever you differentiate with respect to, the gradient is an array of exactly that shape, with one partial derivative per entry.`,
    slides: [slide('L3', 81, "Gradients have the parameter's shape")],
    slideNote: R`Three rows (Scalar, Vector, Matrix), each with the definition. Right-hand note: "Vectors and their gradients are columns. Matrix gradients have the parameter's shape." Below, $\mathbf g_q:=\partial L/\partial\mathbf q=\nabla_{\mathbf q}L$ (in red on the slide). The matrix-shaped numeric example is added.`,
    derive: true,
    pre: [text('The loss L is scalar. Differentiate with respect to each parameter entry.')],
    rows: [
      {
        eq: R`q\in\mathbb R:\quad\nabla_qL=\frac{\partial L}{\partial q}\in\mathbb R`,
        notes: [term('Scalar parameter'), shape(R`1\times1`)],
      },
      {
        eq: R`\mathbf q\in\mathbb R^{d\times1}:\quad\nabla_{\mathbf q}L=\begin{bmatrix}\partial L/\partial q_1\\\vdots\\\partial L/\partial q_d\end{bmatrix}\in\mathbb R^{d\times1}`,
        notes: [term('Vector parameter'), tag(['C1', 'C14'], R`the gradient of a scalar has the shape of the variable: a column`), shape(R`d\times1`)],
      },
      {
        eq: R`Q\in\mathbb R^{r\times c}:\quad(\nabla_QL)_{ij}=\frac{\partial L}{\partial Q_{ij}},\qquad\nabla_QL\in\mathbb R^{r\times c}`,
        notes: [term('Matrix parameter'), lab('one partial derivative per entry, laid out exactly like Q'), shape(R`r\times c`)],
      },
      {
        eq: R`\mathbf g_q:=\frac{\partial L}{\partial\mathbf q}=\nabla_{\mathbf q}L`,
        notes: [lab(R`the shorthand $\mathbf g$ with the variable as subscript, used from here on (also for matrices: the "gradient at $Q$")`)],
      },
      {
        eq: R`Q=\begin{bmatrix}1&2&3\\4&5&6\end{bmatrix},\ L=\sum_{ij}Q_{ij}^2\ \Rightarrow\ \nabla_QL=2Q=\begin{bmatrix}2&4&6\\8&10&12\end{bmatrix}\in\mathbb R^{2\times3}`,
        notes: [ex(R`invented loss: $\partial L/\partial Q_{ij}=2Q_{ij}$ for each of the 6 entries, laid out as a $2\times3$ matrix like $Q$`)],
      },
    ],
  },
  {
    id: 'network-notation',
    circ: 7,
    title: 'Network notation, computation graph, parameters and activations',
    why: R`The two-layer worked example (next file) and the general deeper network use slightly different notations. This section lists both together with the picture of the network as a computation graph, and it separates the two kinds of quantity you will keep meeting: parameters (learned, shared) and activations (computed, per example).`,
    slides: [slide('L3', 82, 'Network notation'), slide('L3', 83, 'An MLP as a computation graph'), slide('L3', 84, 'Parameters and activations')],
    slideNote: R`Slide 82: "Two-layer worked MLP" and "Deeper network" formulas plus a symbol key ($\mathbf x$ input, $\mathbf z$ hidden scores, $\mathbf a$ hidden activations, $\hat{\mathbf y}$ prediction, $\mathbf y$ target, $L$ scalar loss; $D$ inputs, $H$ hidden units, $C$ outputs or classes; $\boldsymbol\theta_l$, $[l]$, $M$, $\mathbf g_{\mathbf u}$, $\oslash$ elementwise division; $\ell$ loss for one example, used in the risk appendix). Slide 83: a drawing of a small network (two input nodes $\mathbf x$, two hidden $\mathbf z$, two hidden $\mathbf a$, two outputs $\hat{\mathbf y}$, with weights $V$ and $W$ on the edges) equated with a computation graph "$\mathbf x\to$ Linear $\to\mathbf z\to$ ReLU $\to\mathbf a\to$ Linear $\to\hat{\mathbf y}$" with $V$ and $W$ entering the two Linear boxes. Slide 84: four lines of text. The shape rows and the parameter count are added.`,
    derive: true,
    pre: [
      text('Parameters are the weights and biases shared across examples.'),
      text('Activations are the intermediate values computed for one example.'),
      text('Learning changes the parameters using a training dataset.'),
      text('Inference holds those parameters fixed and computes new activations.'),
    ],
    rows: [
      {
        eq: R`\mathbf z=V\mathbf x,\qquad\mathbf a=\operatorname{ReLU}(\mathbf z),\qquad\hat{\mathbf y}=W\mathbf a`,
        notes: [
          term('Two-layer worked MLP'),
          lab('no biases; ReLU is applied entry by entry'),
          shape(R`V:\ H\times D;\ W:\ C\times H;\ \mathbf x:\ D\times1;\ \mathbf z,\ \mathbf a:\ H\times1;\ \hat{\mathbf y}:\ C\times1`),
          tag(['C15'], R`weights are (outputs) $\times$ (inputs): not the same as Lecture 2's $W$`),
        ],
      },
      {
        eq: R`\mathbf a^{[0]}=\mathbf x,\qquad\mathbf z^{[l]}=W^{[l]}\mathbf a^{[l-1]}+\mathbf b^{[l]},\qquad\mathbf a^{[l]}=f_l\big(\mathbf z^{[l]}\big)`,
        notes: [
          term('Deeper network'),
          lab(R`$[l]$ is the layer index, $l=1,\dots,M$; $f_l$ is the activation of layer $l$ (ReLU for hidden layers, the identity or softmax for the last)`),
          shape(R`W^{[l]}:\ n_l\times n_{l-1};\ \mathbf z^{[l]},\ \mathbf a^{[l]},\ \mathbf b^{[l]}:\ n_l\times1`),
        ],
      },
      {
        eq: R`\mathbf x\ \xrightarrow{\ \text{Linear }(V)\ }\ \mathbf z\ \xrightarrow{\ \text{ReLU}\ }\ \mathbf a\ \xrightarrow{\ \text{Linear }(W)\ }\ \hat{\mathbf y}\ \xrightarrow{\ \text{Loss}\ }\ L`,
        notes: [
          term('Computation graph'),
          lab('each box is one operation; the parameters V and W enter their boxes from the side; the forward pass walks left to right and the backward pass walks right to left'),
        ],
      },
      {
        eq: R`\#\text{parameters}=HD+CH\qquad\big(D=2,\ H=2,\ C=2:\ 4+4=8\big)`,
        notes: [
          lab('parameters: the entries of V and W (learned, the same for every example). Activations x, z, a, y-hat: recomputed for every example'),
          ex(R`the small network of slide 83 has $V$: $2\times2$ and $W$: $2\times2$, so 8 weights`),
          lab('training: change the parameters using the training set. Inference: keep the parameters fixed and compute new activations'),
        ],
      },
    ],
  },
];

export const gradientsNotationChainRule: Topic = {
  id: 'gradients-notation-chain-rule',
  title: 'Backpropagation: notation and the chain rule',
  short: 'Backprop notation',
  summary: R`Backpropagation computes $\nabla L$ for all parameters by one backward sweep that reuses shared factors. Notation: $\mathbf g_{\mathbf u}=\partial L/\partial\mathbf u$ has the shape of $\mathbf u$; the Jacobian has outputs in rows, so the backward rule is $\mathbf g_{\mathbf u}=J_f^\top\mathbf g_{\mathbf v}$. Logistic regression: $\partial L/\partial z=p-y$, $\nabla_{\mathbf w}L=(p-y)\mathbf x$.`,
  identities,
  sections,
};

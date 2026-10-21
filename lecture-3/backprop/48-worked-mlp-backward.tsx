import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';
import BackpropStepper from '../../widgets/BackpropStepper';

const identities: Identity[] = [
  {
    id: 'I94',
    area: 'Algebra & calculus',
    tex: R`\operatorname{ReLU}(z)=\max(0,z)\ \Rightarrow\ \frac{d}{dz}\operatorname{ReLU}(z)=\mathbb 1[z>0],\qquad\mathbf g_{\mathbf z}=\mathbf g_{\mathbf a}\odot\mathbb 1[\mathbf z>0]`,
    note: R`For $z>0$ the function is $z$ (slope 1), for $z<0$ it is $0$ (slope 0). At the kink $z=0$ the slope is not defined; the convention here is 0 (so the indicator uses $>$, not $\ge$). Applied entry by entry to a vector, the incoming gradient $\mathbf g_{\mathbf a}$ is multiplied elementwise ($\odot$) by a 0/1 mask. All three vectors are $H\times1$. Compare the sigmoid, where the multiplier $g(1-g)$ is a smooth number between 0 and $\tfrac14$ (I69).`,
  },
];

const sections: Section[] = [
  {
    id: 'output-activation-gradient',
    title: 'Backward through the output linear map: the activation gradient',
    why: R`Each hidden activation influences every output, so the loss gradient at a hidden activation collects one contribution from every output. Working one hidden unit at a time shows where the matrix product $W^\top\mathbf g_{\hat{\mathbf y}}$ comes from.`,
    slides: [slide('L3', 90, 'Backward through the output linear map'), slide('L3', 91, 'Backward through the output linear map (hidden activations and output gradients)')],
    slideNote: R`Slide 90: the equations $\hat y_c=\sum_{j=1}^HW_{cj}a_j$, $\partial\hat y_c/\partial a_h=W_{ch}$ and $g_{a,h}=\frac{\partial L}{\partial a_h}=\sum_{c=1}^C\frac{\partial L}{\partial\hat y_c}W_{ch}=\sum_cW_{ch}g_{\hat y,c}$, then $\mathbf g_a=W^\top\mathbf g_{\hat y}$ with the shapes $H\times1$, $H\times C$, $C\times1$; the vertical strip Loss, Linear, ReLU, Linear with $\mathbf a$ highlighted. Slide 91 adds a picture: a column of hidden-activation dots on the left joined by grey lines (weights $W_{ch}$) to a column of output dots on the right; red arrows $g_{\hat y,c}$ enter each output and one red arrow $g_{a,h}$ leaves the chosen hidden dot. Caption: "Each hidden activation influences every output coordinate. One hidden activation receives contributions from every output. The transpose collects the same weighted sums into one matrix product." The numeric row is added.`,
    derive: true,
    pre: [
      text('Each hidden activation influences every output coordinate.'),
      text('One hidden activation receives contributions from every output.'),
      text('The transpose collects the same weighted sums into one matrix product.'),
    ],
    rows: [
      {
        eq: R`\hat y_c=\sum_{j=1}^{H}W_{cj}\,a_j\qquad\Rightarrow\qquad\frac{\partial\hat y_c}{\partial a_h}=W_{ch}`,
        notes: [
          lab(R`output $c$ is row $c$ of $W$ dotted with $\mathbf a$; only the term $j=h$ contains $a_h$, so the derivative is its coefficient $W_{ch}$`),
          shape(R`\hat y_c,\ a_h,\ W_{ch}:\ 1\times1`),
        ],
      },
      {
        eq: R`g_{a,h}=\frac{\partial L}{\partial a_h}=\sum_{c=1}^{C}\frac{\partial L}{\partial\hat y_c}\frac{\partial\hat y_c}{\partial a_h}=\sum_{c=1}^{C}g_{\hat y,c}\,W_{ch}`,
        notes: [
          tag(['I90'], R`$a_h$ reaches $L$ through all $C$ outputs $\hat y_1,\dots,\hat y_C$: add the $C$ path contributions`),
          lab(R`$g_{\hat y,c}=\partial L/\partial\hat y_c$ is the residual from file 47; each output sends back "its gradient times the weight that connects it to $a_h$"`),
          shape(R`g_{a,h}:\ 1\times1`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_a}_{H\times1}=\underbrace{W^\top}_{H\times C}\underbrace{\mathbf g_{\hat{\mathbf y}}}_{C\times1}`,
        notes: [
          tag(['I93', 'I91'], R`entry $h$ of $W^\top\mathbf g_{\hat{\mathbf y}}$ is column $h$ of $W$ dotted with $\mathbf g_{\hat{\mathbf y}}$, which is exactly the sum above; this is the vector rule $\mathbf g_{\mathbf u}=J^\top\mathbf g_{\mathbf v}$ with $J=W$ because $\hat{\mathbf y}=W\mathbf a$ is linear`),
          shape(R`(H\times C)(C\times1)=H\times1`),
        ],
      },
      {
        eq: R`W=\begin{bmatrix}1&0&1\\0&1&-1\end{bmatrix},\ \mathbf g_{\hat{\mathbf y}}=\begin{bmatrix}1\\-1\end{bmatrix}:\quad\mathbf g_a=\begin{bmatrix}1&0\\0&1\\1&-1\end{bmatrix}\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}1\\-1\\1-(-1)\end{bmatrix}=\begin{bmatrix}1\\-1\\2\end{bmatrix}`,
        notes: [
          ex(R`numbers of file 47. Entry 3, e.g.: $g_{a,3}=W_{13}g_{\hat y,1}+W_{23}g_{\hat y,2}=1\cdot1+(-1)(-1)=2$`),
          shape(R`(3\times2)(2\times1)=3\times1`),
        ],
      },
    ],
  },
  {
    id: 'output-weight-gradient',
    circ: 1,
    title: 'The gradient of one output weight, and of all of them',
    why: R`A weight $W_{ch}$ connects exactly one hidden activation to exactly one output, so it affects the loss through a single path. Its gradient is just "the gradient arriving at that output, times the activation that went in", and stacking all of them gives an outer product.`,
    slides: [slide('L3', 92, 'The gradient of one output weight'), slide('L3', 93, 'The gradient of one output weight (one selected connection)')],
    slideNote: R`Slide 92: labelled lines "Local derivative" ($\partial\hat y_c/\partial W_{ch}=a_h$), "Chain rule", "Substitution", "Gradient" ($\frac{\partial L}{\partial W_{ch}}=g_{\hat y,c}\,a_h$) and, at the bottom, $\nabla_WL=\mathbf g_{\hat y}\mathbf a^\top$ with $C\times H$, $C\times1$, $1\times H$ under the braces; caption "Only one output depends directly on this coefficient." Slide 93: a picture of one selected connection from hidden dot $a_h$ to output dot with arrows $W_{ch}$ and $g_{\hat y,c}$; caption "Each weight uses its input activation and its output's loss gradient. The same two factors give every entry of the weight-gradient matrix." The numeric row is added.`,
    derive: true,
    pre: [
      text('Each output weight connects hidden activation h to output c.'),
      text('Only one output depends directly on this coefficient.'),
      text(R`Each weight uses its input activation and its output's loss gradient.`),
      text('The same two factors give every entry of the weight-gradient matrix.'),
    ],
    rows: [
      {
        eq: R`\frac{\partial\hat y_c}{\partial W_{ch}}=a_h`,
        notes: [
          term('Local derivative'),
          lab(R`in $\hat y_c=\sum_jW_{cj}a_j$ the coefficient of $W_{ch}$ is $a_h$; no other output $\hat y_{c'}$ ($c'\ne c$) contains $W_{ch}$`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial W_{ch}}=\frac{\partial L}{\partial\hat y_c}\,\frac{\partial\hat y_c}{\partial W_{ch}}=g_{\hat y,c}\;a_h`,
        notes: [
          tag(['I15'], 'chain rule through the single output that this weight feeds'),
          lab('the gradient of one weight = (loss gradient at its output) x (activation at its input)'),
          shape(R`\text{every factor}:\ 1\times1`),
        ],
      },
      {
        eq: R`\nabla_WL=\begin{bmatrix}g_{\hat y,1}a_1&\cdots&g_{\hat y,1}a_H\\\vdots&&\vdots\\g_{\hat y,C}a_1&\cdots&g_{\hat y,C}a_H\end{bmatrix}=\underbrace{\mathbf g_{\hat{\mathbf y}}}_{C\times1}\underbrace{\mathbf a^\top}_{1\times H}`,
        notes: [
          tag(['I92', 'C14'], R`entry $(c,h)$ is $g_{\hat y,c}\,a_h$: an outer product, with the shape of $W$`),
          shape(R`(C\times1)(1\times H)=C\times H`),
          lab('every entry of the weight gradient uses the same two factors'),
        ],
      },
      {
        eq: R`\nabla_WL=\begin{bmatrix}1\\-1\end{bmatrix}\begin{bmatrix}0&2&1\end{bmatrix}=\begin{bmatrix}1\cdot0&1\cdot2&1\cdot1\\-1\cdot0&-1\cdot2&-1\cdot1\end{bmatrix}=\begin{bmatrix}0&2&1\\0&-2&-1\end{bmatrix}`,
        notes: [
          ex(R`$\mathbf g_{\hat{\mathbf y}}=(1,-1)^\top$, $\mathbf a=(0,2,1)^\top$ from file 47`),
          shape(R`(2\times1)(1\times3)=2\times3`),
          lab('first column is all 0: hidden unit 1 had activation 0, so its output weights have no effect on this example and get no gradient'),
        ],
      },
    ],
  },
  {
    id: 'output-block',
    circ: 2,
    title: 'Output linear layer: the backward block',
    why: R`Putting the two results side by side gives a reusable "backward block" for any linear layer: one incoming column gradient in, two gradients out. The same block will be used again, unchanged, for the first layer and for every layer of a deeper network.`,
    slides: [slide('L3', 94, 'Output linear layer: the backward block'), slide('L3', 95, 'Linear layers send gradients backward')],
    slideNote: R`Slide 94: a yellow box with $\hat{\mathbf y}=W\mathbf a$ (forward, green arrows, with $\mathbf a$: $H\times1$ in and $\hat{\mathbf y}$: $C\times1$ out) and $\mathbf g_a=W^\top\mathbf g_{\hat{\mathbf y}}$ (backward, red arrows, $\mathbf g_a$: $H\times1$ out, $\mathbf g_{\hat y}$: $C\times1$ in), and under it $\nabla_WL=\mathbf g_{\hat y}\mathbf a^\top$ with $C\times H$, $C\times1$, $1\times H$. Text: "Return the activation gradient; store the weight gradient for the update." Footnote: "Column-gradient convention: $W$ is $C\times H$, so its gradient is also $C\times H$. Cache the input activation $\mathbf a$." Slide 95: the same two formulas drawn with colour-coded grids (a red column $H\times1$ = a blue $H\times C$ grid times a red column $C\times1$; a yellow $C\times H$ grid = a red column $C\times1$ times a green row $1\times H$). Caption: "A column gradient is multiplied by the transpose of the weight matrix."`,
    derive: true,
    pre: [
      text('One incoming column gradient produces both required gradients.'),
      text('Return the activation gradient; store the weight gradient for the update.'),
      text('Column-gradient convention: W is C × H, so its gradient is also C × H. Cache the input activation a.'),
    ],
    rows: [
      {
        eq: R`\textbf{Forward:}\ \ \hat{\mathbf y}=W\mathbf a\qquad\textbf{Backward:}\ \ \mathbf g_a=W^\top\mathbf g_{\hat{\mathbf y}},\quad\nabla_WL=\mathbf g_{\hat{\mathbf y}}\,\mathbf a^\top`,
        notes: [
          term('Linear layer backward block'),
          lab('given the gradient at the output of the block, return the gradient at its input (to pass on) and the gradient of its weights (to store)'),
          shape(R`\mathbf g_a:\ H\times1;\quad\nabla_WL:\ C\times H;\quad\mathbf g_{\hat{\mathbf y}}:\ C\times1;\quad\mathbf a:\ H\times1`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_a}_{H\times1}=\underbrace{W^\top}_{H\times C}\underbrace{\mathbf g_{\hat{\mathbf y}}}_{C\times1},\qquad\underbrace{\nabla_WL}_{C\times H}=\underbrace{\mathbf g_{\hat{\mathbf y}}}_{C\times1}\underbrace{\mathbf a^\top}_{1\times H}`,
        notes: [
          lab('the shapes decide the formulas: the only way to build a C x H array from a C x 1 column and an H x 1 column is column times row; the only way to turn C x 1 into H x 1 using W (C x H) is W transposed'),
          lab('the forward pass needs a cached to compute the weight gradient: this is why the forward values are stored'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Why not "W g"?',
        text: R`$W$ is $C\times H$ and $\mathbf g_{\hat{\mathbf y}}$ is $C\times1$: the product $W\mathbf g_{\hat{\mathbf y}}$ is not defined ($H\ne C$ in general). Transposing is not a trick: entry $h$ must sum over the outputs $c$, i.e. down column $h$ of $W$ (I93).`,
      },
    ],
  },
  {
    id: 'relu-backward',
    circ: 3,
    title: 'Backward through ReLU',
    why: R`ReLU has no parameters, so its backward block only passes the gradient on. It passes it unchanged where the unit was on during the forward pass, and blocks it where the unit was off. This is the one place in the backward pass where the cached scores $\mathbf z$ decide what happens.`,
    slides: [slide('L3', 96, 'Backward through ReLU'), slide('L3', 97, 'Pointwise activation derivatives')],
    slideNote: R`Slide 96: two cases drawn as arrows. For $z_h>0$: a box "$\times1$" with the incoming gradient $g_{a,h}$ (right) and the returned gradient $g_{z,h}=g_{a,h}$ (left). For $z_h\le0$: a box "$\times0$", returned gradient $g_{z,h}=0$. Below: $\mathbf g_z=\mathbf g_a\odot\mathbb I(\mathbf z>0)\in\mathbb R^{H\times1}$. Caption: "The cached score decides whether each gradient passes through. $\odot$ means elementwise multiplication. Use derivative 0 at a score of 0." Slide 97: a yellow box "$\mathbf a=\text{ReLU}(\mathbf z)$ / $\mathbf g_z=\mathbf g_a\odot\mathbb I(\mathbf z>0)$" with forward and backward arrows, and "$g_{z,h}=g_{a,h}\mathbb I(z_h>0)$". Caption: "ReLU sends each incoming gradient through its cached activation gate. Positive score: multiply by 1. Negative score: multiply by 0. Use derivative 0 at the kink $z_h=0$." The numeric row is added.`,
    derive: true,
    pre: [
      text('The cached score decides whether each gradient passes through.'),
      text('Positive score: multiply by 1. Negative score: multiply by 0.'),
      text('Use derivative 0 at the kink z_h = 0.'),
    ],
    rows: [
      {
        eq: R`a_h=\operatorname{ReLU}(z_h)=\max(0,z_h)\quad\Rightarrow\quad\frac{\partial a_h}{\partial z_h}=\mathbb 1[z_h>0]`,
        notes: [
          tag(['I94'], R`slope 1 when the unit is on ($z_h>0$), slope 0 when it is off`),
          lab('only a_h depends on z_h (activation is applied entry by entry), so the Jacobian is diagonal'),
        ],
      },
      {
        eq: R`g_{z,h}=\frac{\partial L}{\partial z_h}=\frac{\partial L}{\partial a_h}\frac{\partial a_h}{\partial z_h}=g_{a,h}\,\mathbb 1[z_h>0]\ \ =\ \begin{cases}g_{a,h}&z_h>0\\0&z_h\le0\end{cases}`,
        notes: [
          tag(['I15'], 'scalar chain rule, one hidden unit at a time'),
          lab(R`at the kink $z_h=0$ the derivative is not defined; the convention is 0 (so the case split is $>0$ versus $\le0$)`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_z}_{H\times1}=\underbrace{\mathbf g_a}_{H\times1}\odot\underbrace{\mathbb 1[\mathbf z>0]}_{H\times1}`,
        notes: [
          tag(['I94'], R`elementwise product with a 0/1 mask: the gate is the cached $\mathbb 1[\mathbf z>0]$`),
          shape(R`\text{all three}:\ H\times1\ (\odot\ \text{needs equal shapes})`),
          warn('an elementwise product, not a matrix product: do not write a transpose or a matrix here'),
        ],
      },
      {
        eq: R`\mathbf z=\begin{bmatrix}-1\\2\\1\end{bmatrix}\Rightarrow\mathbb 1[\mathbf z>0]=\begin{bmatrix}0\\1\\1\end{bmatrix};\quad\mathbf g_a=\begin{bmatrix}1\\-1\\2\end{bmatrix}\Rightarrow\mathbf g_z=\begin{bmatrix}1\cdot0\\-1\cdot1\\2\cdot1\end{bmatrix}=\begin{bmatrix}0\\-1\\2\end{bmatrix}`,
        notes: [
          ex(R`$\mathbf z$ from the forward pass (file 47), $\mathbf g_a$ from the output layer. Unit 1 was off ($z_1=-1$), so its gradient (1) is blocked`),
          shape(R`H\times1=3\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Dead units',
        text: R`A hidden unit that is off ($z_h\le0$) for an example receives zero gradient from that example, so its incoming weights are not changed by it. If a unit is off for every example it never learns ("dead ReLU").`,
      },
    ],
  },
  {
    id: 'first-layer',
    circ: 4,
    title: 'The first layer uses the same backward rule',
    why: R`The first linear layer has exactly the structure of the output linear layer, with $\mathbf z$ playing the role of the output and $\mathbf x$ that of the input. So no new calculation is needed: reuse the block.`,
    slides: [slide('L3', 98, 'The first layer uses the same backward rule')],
    slideNote: R`The slide shows $\mathbf z=V\mathbf x$, $V\in\mathbb R^{H\times D}$; the element rule $\frac{\partial L}{\partial V_{hi}}=g_{z,h}\,x_i$; $\nabla_VL=\mathbf g_z\mathbf x^\top$ with shapes $H\times D$, $H\times1$, $1\times D$; "If a bias is added: $\nabla_{\mathbf b}L=\mathbf g_z$"; "Optional input gradient: $\mathbf g_x=V^\top\mathbf g_z$"; the strip with $V$ and $\mathbf x$ highlighted. Caption: "Reuse the affine-layer rule with the hidden-score gradient and the input." The numeric row is added.`,
    derive: true,
    pre: [text('Reuse the affine-layer rule with the hidden-score gradient and the input.')],
    rows: [
      {
        eq: R`\mathbf z=V\mathbf x,\quad V\in\mathbb R^{H\times D}\qquad\Rightarrow\qquad\frac{\partial L}{\partial V_{hi}}=g_{z,h}\,x_i`,
        notes: [
          lab(R`$z_h=\sum_iV_{hi}x_i$, so $\partial z_h/\partial V_{hi}=x_i$ and only $z_h$ depends on $V_{hi}$: same argument as for $W$ (file 48, slide 92)`),
          shape(R`g_{z,h},\ x_i:\ 1\times1`),
        ],
      },
      {
        eq: R`\nabla_VL=\underbrace{\mathbf g_z}_{H\times1}\ \underbrace{\mathbf x^\top}_{1\times D}\ \in\mathbb R^{H\times D}`,
        notes: [
          tag(['I92', 'C14'], R`outer product: entry $(h,i)$ is $g_{z,h}x_i$; the gradient has the shape of $V$`),
          shape(R`(H\times1)(1\times D)=H\times D`),
        ],
      },
      {
        eq: R`\text{if a bias is added:}\ \ \mathbf z=V\mathbf x+\mathbf b\ \Rightarrow\ \nabla_{\mathbf b}L=\mathbf g_z,\qquad\text{optional input gradient:}\ \ \mathbf g_x=V^\top\mathbf g_z`,
        notes: [
          lab(R`$\partial z_h/\partial b_h=1$, so the bias gradient is the score gradient itself`),
          lab('the input gradient is only needed if something sits before the input (an earlier layer); to learn V and W it is not needed (slide 99)'),
          shape(R`\nabla_{\mathbf b}L:\ H\times1;\quad\mathbf g_x:\ D\times1`),
        ],
      },
      {
        eq: R`\nabla_VL=\begin{bmatrix}0\\-1\\2\end{bmatrix}\begin{bmatrix}1&2\end{bmatrix}=\begin{bmatrix}0&0\\-1&-2\\2&4\end{bmatrix},\qquad\mathbf g_x=V^\top\mathbf g_z=\begin{bmatrix}1&2&-1\\-1&0&1\end{bmatrix}\begin{bmatrix}0\\-1\\2\end{bmatrix}=\begin{bmatrix}-4\\2\end{bmatrix}`,
        notes: [
          ex(R`$\mathbf g_z=(0,-1,2)^\top$ from the ReLU step and $\mathbf x=(1,2)^\top$; $V^\top$ is the $2\times3$ transpose of $V$ of file 47`),
          shape(R`(3\times1)(1\times2)=3\times2;\quad(2\times3)(3\times1)=2\times1`),
          lab('row 1 of the weight gradient is zero: the unit was off, so V row 1 gets no update'),
        ],
      },
    ],
  },
  {
    id: 'completed-backward',
    circ: 5,
    title: 'The completed backward pass',
    why: R`This is the whole algorithm for the worked network: one line per block, working from the loss to the input. After it we have the gradient of the loss with respect to both weight matrices, and one gradient-descent step can change them.`,
    slides: [slide('L3', 99, 'The completed backward pass')],
    slideNote: R`Top strip: $\mathbf x\to$ Linear $V\to\mathbf z\to$ ReLU $\to\mathbf a\to$ Linear $W\to\hat{\mathbf y}\to$ Loss $\to L$. A four-line summary table: "Output" $\mathbf g_{\hat y}=\hat{\mathbf y}-\mathbf y$; "Output linear" $\nabla_WL=\mathbf g_{\hat y}\mathbf a^\top$, $\mathbf g_a=W^\top\mathbf g_{\hat y}$; "ReLU" $\mathbf g_z=\mathbf g_a\odot\mathbb I(\mathbf z>0)$; "First linear" $\nabla_VL=\mathbf g_z\mathbf x^\top$. Caption: "Cache $\mathbf x$, $\mathbf z$ and $\mathbf a$. Compute all gradients before updating the weights. The data gradient is optional for learning the network parameters." The numeric update and the check (rows 2 to 4) are added. The widget below is added: it steps through this exact network block by block, lets you change $\mathbf x$ and $\mathbf y$, apply the update, and check any weight by finite differences.`,
    derive: true,
    pre: [
      text('Cache x, z and a. Compute all gradients before updating the weights.'),
      text('The data gradient is optional for learning the network parameters.'),
    ],
    rows: [
      {
        eq: R`\begin{aligned}\text{Output:}&\quad\mathbf g_{\hat{\mathbf y}}=\hat{\mathbf y}-\mathbf y\\\text{Output linear:}&\quad\nabla_WL=\mathbf g_{\hat{\mathbf y}}\mathbf a^\top,\quad\mathbf g_a=W^\top\mathbf g_{\hat{\mathbf y}}\\\text{ReLU:}&\quad\mathbf g_z=\mathbf g_a\odot\mathbb 1[\mathbf z>0]\\\text{First linear:}&\quad\nabla_VL=\mathbf g_z\mathbf x^\top\end{aligned}`,
        notes: [
          lab('four blocks, in reverse order of the forward pass; each block uses the gradient just computed and one cached forward value (a, z, x)'),
          shape(R`\mathbf g_{\hat{\mathbf y}}:\ C\times1;\ \nabla_WL:\ C\times H;\ \mathbf g_a,\mathbf g_z:\ H\times1;\ \nabla_VL:\ H\times D`),
        ],
      },
      {
        eq: R`\nabla_VL=\begin{bmatrix}0&0\\-1&-2\\2&4\end{bmatrix},\qquad\nabla_WL=\begin{bmatrix}0&2&1\\0&-2&-1\end{bmatrix}`,
        notes: [ex(R`the two weight gradients of the numeric example, from files 47 and 48 (with $L=1$)`)],
      },
      {
        eq: R`\eta=0.05:\quad V\leftarrow V-\eta\nabla_VL=\begin{bmatrix}1&-1\\2.05&0.1\\-1.1&0.8\end{bmatrix},\qquad W\leftarrow W-\eta\nabla_WL=\begin{bmatrix}1&-0.1&0.95\\0&1.1&-0.95\end{bmatrix}`,
        notes: [
          tag(['C14'], 'each update has the shape of the matrix it changes'),
          lab('compute ALL gradients first, then update: the gradient of V used W (before the update), so updating W early would corrupt it'),
        ],
      },
      {
        eq: R`\mathbf z=\begin{bmatrix}-1\\2.25\\0.5\end{bmatrix},\ \mathbf a=\begin{bmatrix}0\\2.25\\0.5\end{bmatrix},\ \hat{\mathbf y}=\begin{bmatrix}0.25\\2\end{bmatrix},\ L=\tfrac12\big(0.25^2+0^2\big)=0.031\ \ <\ \ 1`,
        notes: [
          ex(R`recompute the forward pass with the new weights: the loss fell from 1 to 0.031, as a gradient step should (a large step size on a tiny problem, which is why it falls so far)`),
          warn(R`a step this size is not safe in general: too large an $\eta$ overshoots and the loss can go up (see the gradient descent notes, Lecture 2 file 21)`),
        ],
      },
    ],
    extra: <BackpropStepper />,
  },
  {
    id: 'reuse-work',
    circ: 6,
    title: 'Why the backward pass reuses work',
    why: R`This is the efficiency argument. A hidden unit's score gradient $g_{z,h}$ is needed for every weight that feeds that unit. Computing it once and reusing it is what makes the backward pass cost about as much as the forward pass, however many weights there are.`,
    slides: [slide('L3', 100, 'Why the backward pass reuses work')],
    slideNote: R`The slide shows $g_{z,h}=\mathbb I(z_h>0)\sum_{c=1}^CW_{ch}g_{\hat y,c}$ with the brace "compute once", then $\frac{\partial L}{\partial V_{h1}}=g_{z,h}x_1$, $\frac{\partial L}{\partial V_{h2}}=g_{z,h}x_2,\ \dots$ Captions: "Every weight feeding this hidden unit uses the same hidden-score derivative. One scalar loss needs one backward traversal for all parameter gradients." The counting rows are added.`,
    derive: true,
    pre: [
      text('Compute a downstream gradient once, then reuse it for all earlier derivatives.'),
      text('Every weight feeding this hidden unit uses the same hidden-score derivative.'),
      text('One scalar loss needs one backward traversal for all parameter gradients.'),
    ],
    rows: [
      {
        eq: R`g_{z,h}=\mathbb 1[z_h>0]\sum_{c=1}^{C}W_{ch}\,g_{\hat y,c}\qquad\text{(compute once per hidden unit)}`,
        notes: [lab(R`the ReLU gate (slide 96) times the sum over outputs (slide 90): $C$ multiplications for each of the $H$ hidden units`)],
      },
      {
        eq: R`\frac{\partial L}{\partial V_{h1}}=g_{z,h}\,x_1,\qquad\frac{\partial L}{\partial V_{h2}}=g_{z,h}\,x_2,\ \ \dots,\ \ \frac{\partial L}{\partial V_{hD}}=g_{z,h}\,x_D`,
        notes: [lab(R`all $D$ weights of hidden unit $h$ share the same factor $g_{z,h}$: one extra multiplication each`)],
      },
      {
        eq: R`\text{backward cost}\approx\underbrace{CH}_{\mathbf g_a}+\underbrace{H}_{\text{gate}}+\underbrace{CH}_{\nabla_WL}+\underbrace{HD}_{\nabla_VL}\ \ \text{multiplications}\ \approx\ \text{the forward cost}\ (HD+CH)`,
        notes: [
          ex(R`$D=2$, $H=3$, $C=2$: backward $6+3+6+6=21$; forward $HD+CH=12$ (plus a few cheap operations); the same order of magnitude`),
          lab('the cost is proportional to the number of weights, not to (number of weights)^2: one sweep gives all the gradients'),
        ],
      },
    ],
  },
];

export const workedMlpBackward: Topic = {
  id: 'worked-mlp-backward',
  title: 'Worked MLP: the backward pass',
  short: 'Worked MLP (backward)',
  summary: R`Backward through the worked MLP: $\mathbf g_{\hat y}=\hat{\mathbf y}-\mathbf y$; $\nabla_WL=\mathbf g_{\hat y}\mathbf a^\top$, $\mathbf g_a=W^\top\mathbf g_{\hat y}$; $\mathbf g_z=\mathbf g_a\odot\mathbb 1[\mathbf z>0]$; $\nabla_VL=\mathbf g_z\mathbf x^\top$. Cache $\mathbf x,\mathbf z,\mathbf a$; compute all gradients, then update. One sweep gives every gradient.`,
  identities,
  sections,
};

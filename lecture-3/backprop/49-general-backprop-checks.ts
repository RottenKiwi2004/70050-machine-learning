import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I95',
    area: 'Calculus',
    tex: R`\frac{L(\boldsymbol\theta+\epsilon\mathbf e_j)-L(\boldsymbol\theta-\epsilon\mathbf e_j)}{2\epsilon}=\Big[\nabla_{\boldsymbol\theta}L\Big]_j+O(\epsilon^2)`,
    note: R`Central finite difference. $\mathbf e_j$ is the $j$-th standard basis vector (a 1 in position $j$, 0 elsewhere), so $\boldsymbol\theta\pm\epsilon\mathbf e_j$ changes only coefficient $j$. Taylor expansion: $L(\theta_j\pm\epsilon)=L\pm\epsilon L'+\tfrac12\epsilon^2L''\pm\tfrac16\epsilon^3L'''+\cdots$. Subtracting, the even terms (including $L$ itself and $\epsilon^2L''$) cancel and what remains is $2\epsilon L'+O(\epsilon^3)$, so the quotient is $L'+O(\epsilon^2)$. The one-sided quotient $(L(\theta+\epsilon)-L(\theta))/\epsilon$ is only $L'+O(\epsilon)$. $\boldsymbol\theta$ and $\mathbf e_j$ are $P\times1$ for $P$ parameters; the quotient is $1\times1$.`,
  },
];

const sections: Section[] = [
  {
    id: 'block-local-backward',
    title: 'A block\'s local backward operation',
    why: R`A real network has many kinds of blocks (linear, ReLU, convolution, and so on). The recipe for backpropagation must work for any of them. The recipe: each block only needs to know its own two Jacobians, and turns the gradient arriving at its output into the gradient at its input and the gradient of its own parameters.`,
    slides: [slide('L3', 101, 'A block\'s local backward operation')],
    slideNote: R`Two boxes. Forward: a block $f(\mathbf x_{\text{in}},\boldsymbol\theta)$ takes the input $\mathbf x_{\text{in}}$ and the parameters $\boldsymbol\theta$ and produces $\mathbf x_{\text{out}}$. Backward: a block "Local backward" takes the output gradient $\mathbf g_{\text{out}}$ and returns $\mathbf g_{\text{in}}$ and $\nabla_{\boldsymbol\theta}L$. The slide says: "Given the loss gradient at a block's output, return both required gradients." "$\boldsymbol\theta$ stacks the block's parameters. Matrix parameter gradients keep their stored shape." "Implement the products directly. Full Jacobian matrices are unnecessary."`,
    derive: true,
    pre: [
      text(R`Given the loss gradient at a block's output, return both required gradients.`),
      text(R`θ stacks the block's parameters. Matrix parameter gradients keep their stored shape.`),
      text('Implement the products directly. Full Jacobian matrices are unnecessary.'),
    ],
    rows: [
      {
        eq: R`\text{Forward:}\ \ \mathbf x_{\text{out}}=f(\mathbf x_{\text{in}},\boldsymbol\theta),\qquad J_{\text{in}}=\frac{\partial\mathbf x_{\text{out}}}{\partial\mathbf x_{\text{in}}},\quad J_{\theta}=\frac{\partial\mathbf x_{\text{out}}}{\partial\boldsymbol\theta}`,
        notes: [
          lab(R`the two local Jacobians of one block: how the output changes with the input and with the block's own parameters`),
          shape(R`\mathbf x_{\text{in}}:\ n\times1;\ \boldsymbol\theta:\ p\times1;\ \mathbf x_{\text{out}}:\ m\times1;\ J_{\text{in}}:\ m\times n;\ J_\theta:\ m\times p`),
          tag(['C14'], 'Jacobian rows = outputs, columns = inputs'),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_{\text{in}}}_{n\times1}=\underbrace{J_{\text{in}}^\top}_{n\times m}\underbrace{\mathbf g_{\text{out}}}_{m\times1},\qquad\underbrace{\nabla_{\boldsymbol\theta}L}_{p\times1}=\underbrace{J_\theta^\top}_{p\times m}\underbrace{\mathbf g_{\text{out}}}_{m\times1}`,
        notes: [
          tag(['I91'], R`the backward chain rule applied twice to the same block: once with respect to its input (to hand on), once with respect to its parameters (to store)`),
          lab(R`for a matrix parameter $Q$ the $p\times1$ vector is the entries of $Q$ listed in a column; "keep their stored shape" means the answer is reshaped back to the shape of $Q$ (C14)`),
        ],
      },
      {
        eq: R`\text{e.g. linear block }\mathbf x_{\text{out}}=W\mathbf x_{\text{in}}:\quad\mathbf g_{\text{in}}=W^\top\mathbf g_{\text{out}},\qquad\nabla_WL=\mathbf g_{\text{out}}\,\mathbf x_{\text{in}}^\top`,
        notes: [
          lab(R`here $J_{\text{in}}=W$. The parameter Jacobian $J_\theta$ has $mn$ columns and is mostly zeros, but $J_\theta^\top\mathbf g_{\text{out}}$ simplifies to the outer product (I92): "implement the products directly" means writing this outer product, never building $J_\theta$`),
          shape(R`W:\ m\times n;\ \mathbf g_{\text{in}}:\ n\times1;\ \nabla_WL:\ m\times n`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Why not build the Jacobian?',
        text: R`For a linear layer with $m=n=1000$, $J_\theta$ would have $m\times mn=10^9$ entries. The outer product $\mathbf g_{\text{out}}\mathbf x_{\text{in}}^\top$ has $10^6$ entries, and is computed with $10^6$ multiplications. The result is the same numbers.`,
      },
    ],
  },
  {
    id: 'full-forward-backward',
    circ: 1,
    title: 'The full forward and backward passes',
    why: R`This slide is the algorithm in one picture: a forward sweep from the input to the loss that stores values, then a backward sweep from the loss to the input that uses them. Everything else in the lecture (worked example, deeper networks, branching) is a special case of this loop.`,
    slides: [slide('L3', 102, 'The full forward and backward passes')],
    slideNote: R`Two chains of blocks. Forward (top): Layer 1, "Layers 2 to $M-2$ omitted", Layer $M-1$, Layer $M$, then $L$; text "Forward: evaluate each layer and cache its values." Backward (bottom): the same blocks right to left, labelled Back 1, ..., Back $M-1$, Back $M$, Loss, with the number $1$ entering at the right end (this is $\partial L/\partial L$); text "Backward: reuse downstream column gradients." Footer: "Each backward block also stores its own parameter gradients. Update the parameters after the complete backward pass."`,
    derive: true,
    pre: [
      text('Forward: evaluate each layer and cache its values.'),
      text('Backward: reuse downstream column gradients.'),
      text('Each backward block also stores its own parameter gradients.'),
      text('Update the parameters after the complete backward pass.'),
    ],
    rows: [
      {
        eq: R`\textbf{Forward (}l=1,\dots,M\textbf{):}\quad\mathbf x^{[l]}=f_l\big(\mathbf x^{[l-1]},\boldsymbol\theta^{[l]}\big)\ \ (\text{cache }\mathbf x^{[l-1]},\mathbf z^{[l]}),\qquad L=\ell\big(\mathbf x^{[M]},\mathbf y\big)`,
        notes: [
          lab('go from the input to the loss, storing every value the backward blocks will need'),
          lab(R`$\mathbf x^{[0]}$ is the input; the superscript $[l]$ is the layer index (not a power)`),
        ],
      },
      {
        eq: R`\textbf{Backward (}l=M,\dots,1\textbf{):}\quad\mathbf g^{[l]}_{\text{in}}=\big(J^{[l]}_{\text{in}}\big)^\top\mathbf g^{[l]}_{\text{out}},\quad\nabla_{\boldsymbol\theta^{[l]}}L=\big(J^{[l]}_\theta\big)^\top\mathbf g^{[l]}_{\text{out}},\quad\mathbf g^{[l-1]}_{\text{out}}=\mathbf g^{[l]}_{\text{in}}`,
        notes: [
          tag(['I91'], R`each block applies its local backward operation (slide 101); the gradient it returns at its input is the gradient at the previous block's output`),
          lab(R`the backward sweep starts from $\partial L/\partial L=1$ and the loss block turns this into $\mathbf g_{\hat y}$ (e.g. $\hat{\mathbf y}-\mathbf y$ for half squared loss)`),
          shape(R`\mathbf g_{\text{out}}^{[l]},\ \mathbf g_{\text{in}}^{[l]}:\ \text{same shape as the activations at the output / input of block }l`),
        ],
      },
      {
        eq: R`\boldsymbol\theta^{[l]}\leftarrow\boldsymbol\theta^{[l]}-\eta\,\nabla_{\boldsymbol\theta^{[l]}}L\quad\text{for all }l,\ \text{only after the whole backward pass}`,
        notes: [
          warn('updating a layer before the backward pass reaches the earlier layers would change the weights that those earlier gradients depend on (the worked example, file 48, computed the V gradient with the old W)'),
          tag(['C14'], 'each update step has the shape of the parameter it changes'),
        ],
      },
    ],
  },
  {
    id: 'deeper-mlp',
    circ: 2,
    title: 'Backpropagation in a deeper MLP',
    why: R`The two-layer example now becomes a rule for any depth $M$. Only one line is new: the recursion that passes the score gradient from layer $l+1$ down to layer $l$.`,
    slides: [slide('L3', 103, 'Backpropagation in a deeper MLP')],
    slideNote: R`Header: "M network layers. Half squared regression loss. Hidden ReLUs and a linear output." Forward: $\mathbf z^{[l]}=\mathbf W^{[l]}\mathbf a^{[l-1]}+\mathbf b^{[l]}$ and $\mathbf a^{[l]}=\text{ReLU}(\mathbf z^{[l]})$ for $l<M$; $\hat{\mathbf y}=\mathbf z^{[M]}$. Backward: $\mathbf g_z^{[M]}=\hat{\mathbf y}-\mathbf y$; $\mathbf g_z^{[l]}=\big((\mathbf W^{[l+1]})^T\mathbf g_z^{[l+1]}\big)\odot\mathbb I(\mathbf z^{[l]}>0)$ for $l=M-1,\dots,1$; $\nabla_{\mathbf W^{[l]}}L=\mathbf g_z^{[l]}(\mathbf a^{[l-1]})^T$ and $\nabla_{\mathbf b^{[l]}}L=\mathbf g_z^{[l]}$. Last line: "$\mathbf a^{[0]}=\mathbf x$, $\mathbf V=\mathbf W^{[1]}$, $\mathbf W=\mathbf W^{[2]}$ in the worked example."`,
    derive: true,
    pre: [
      text('M network layers. Half squared regression loss. Hidden ReLUs and a linear output.'),
      text('a[0] = x, V = W[1], W = W[2] in the worked example.'),
    ],
    rows: [
      {
        eq: R`\underbrace{\mathbf z^{[l]}}_{n_l\times1}=\underbrace{\mathbf W^{[l]}}_{n_l\times n_{l-1}}\underbrace{\mathbf a^{[l-1]}}_{n_{l-1}\times1}+\underbrace{\mathbf b^{[l]}}_{n_l\times1},\qquad\mathbf a^{[l]}=\operatorname{ReLU}(\mathbf z^{[l]})\ \ (l<M),\qquad\hat{\mathbf y}=\mathbf z^{[M]},\quad\mathbf a^{[0]}=\mathbf x`,
        notes: [
          lab(R`$n_l$ is the number of units (width) of layer $l$; $n_0=D$ (input), $n_M=C$ (output)`),
          lab('the last layer is linear (no ReLU): the regression output can be any real number'),
        ],
      },
      {
        eq: R`\mathbf g_z^{[M]}=\hat{\mathbf y}-\mathbf y`,
        notes: [
          lab(R`half squared loss $L=\tfrac12\lVert\hat{\mathbf y}-\mathbf y\rVert^2$ differentiates to the residual $\hat{\mathbf y}-\mathbf y$ (derived in file 47)`),
          shape(R`n_M\times1=C\times1`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_z^{[l]}}_{n_l\times1}=\Big(\underbrace{\big(\mathbf W^{[l+1]}\big)^{\top}}_{n_l\times n_{l+1}}\underbrace{\mathbf g_z^{[l+1]}}_{n_{l+1}\times1}\Big)\odot\underbrace{\mathbb 1[\mathbf z^{[l]}>0]}_{n_l\times1},\qquad l=M-1,\dots,1`,
        notes: [
          tag(['I93', 'I94'], R`pass the gradient down through layer $l+1$'s weights (transpose, file 48 slide 94) and then through the ReLU of layer $l$ (mask, slide 96)`),
          lab('this is the only recursion: each score gradient is built from the one above it'),
          shape(R`(n_l\times n_{l+1})(n_{l+1}\times1)=n_l\times1;\ \odot\ \text{keeps}\ n_l\times1`),
        ],
      },
      {
        eq: R`\underbrace{\nabla_{\mathbf W^{[l]}}L}_{n_l\times n_{l-1}}=\underbrace{\mathbf g_z^{[l]}}_{n_l\times1}\underbrace{\big(\mathbf a^{[l-1]}\big)^{\top}}_{1\times n_{l-1}},\qquad\underbrace{\nabla_{\mathbf b^{[l]}}L}_{n_l\times1}=\mathbf g_z^{[l]}`,
        notes: [
          tag(['I92', 'C14'], R`outer product of the score gradient of layer $l$ with the activation entering layer $l$; the result has the shape of $\mathbf W^{[l]}$`),
        ],
      },
      {
        eq: R`M=2:\quad\mathbf g_z^{[2]}=\begin{bmatrix}1\\-1\end{bmatrix},\ \ \mathbf g_z^{[1]}=\Big(\mathbf W^{[2]\top}\mathbf g_z^{[2]}\Big)\odot\mathbb 1[\mathbf z^{[1]}>0]=\begin{bmatrix}1\\-1\\2\end{bmatrix}\odot\begin{bmatrix}0\\1\\1\end{bmatrix}=\begin{bmatrix}0\\-1\\2\end{bmatrix}`,
        notes: [
          ex(R`recovers the worked example of files 47 and 48 ($\mathbf V=\mathbf W^{[1]}$, $\mathbf W=\mathbf W^{[2]}$): the same $\mathbf g_z=(0,-1,2)^\top$ and $\nabla_{\mathbf W^{[1]}}L=\mathbf g_z^{[1]}\mathbf x^\top$`),
          shape(R`3\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Two indices, two meanings',
        text: R`The bracket superscript $[l]$ counts layers. In $\mathbf W^{[l]}$ the first dimension is the number of units of layer $l$ (rows), the second the number of units of layer $l-1$ (columns). So $\mathbf W^{[l]}$ maps layer $l-1$ to layer $l$, and its transpose maps a gradient back from layer $l$ to layer $l-1$.`,
      },
    ],
  },
  {
    id: 'gradient-check',
    circ: 3,
    title: 'Checking one parameter gradient',
    why: R`Backpropagation is easy to get subtly wrong (a missing transpose, a wrong sign, a forgotten cached value) and the network still runs, just learning badly. Perturbing one weight and watching the loss gives an independent number to compare against, using only the forward pass.`,
    slides: [slide('L3', 104, 'Checking one parameter gradient')],
    slideNote: R`Display: $\dfrac{L(\boldsymbol\theta+\epsilon\mathbf e_j)-L(\boldsymbol\theta-\epsilon\mathbf e_j)}{2\epsilon}\approx[\nabla_{\boldsymbol\theta}L]_j$. "$\theta$ stacks the parameters. $\mathbf e_j$ selects coefficient $j$. $\epsilon>0$ is a small perturbation." "Use a fixed small batch, disable randomness, and try several $\epsilon$ values away from activation kinks."`,
    derive: true,
    pre: [
      text('Perturb one coefficient and compare the loss change with backpropagation.'),
      text('Use a fixed small batch, disable randomness, and try several ε values away from activation kinks.'),
    ],
    rows: [
      {
        eq: R`\frac{L(\boldsymbol\theta+\epsilon\mathbf e_j)-L(\boldsymbol\theta-\epsilon\mathbf e_j)}{2\epsilon}\ \approx\ \big[\nabla_{\boldsymbol\theta}L\big]_j`,
        notes: [
          tag(['I95'], 'central difference: nudge coefficient j up and down by epsilon, divide the loss change by the width 2 epsilon'),
          shape(R`\boldsymbol\theta,\ \mathbf e_j:\ P\times1;\ \text{both sides}:\ 1\times1`),
          lab('two extra forward passes per checked coefficient: far too slow for training, fine for checking a few coefficients'),
        ],
      },
      {
        eq: R`L(\theta_j\pm\epsilon)=L\pm\epsilon L'+\tfrac12\epsilon^2L''\pm\cdots\ \Rightarrow\ \frac{L(\theta_j+\epsilon)-L(\theta_j-\epsilon)}{2\epsilon}=L'+\tfrac16\epsilon^2L'''+\cdots`,
        notes: [
          lab(R`derivation of I95: the difference keeps the odd terms and doubles them; dividing by $2\epsilon$ leaves $L'$ plus an error of order $\epsilon^2$. A one-sided difference would leave an error of order $\epsilon$ (the $\tfrac12\epsilon L''$ term)`),
          lab('so a smaller epsilon is better until rounding error in computing L takes over (typically epsilon between 1e-5 and 1e-3 in double precision)'),
        ],
      },
      {
        eq: R`V_{32}:\ \ L(\epsilon)=(1+2\epsilon)^2\ \Rightarrow\ \frac{L(\epsilon)-L(-\epsilon)}{2\epsilon}=\frac{(1+2\epsilon)^2-(1-2\epsilon)^2}{2\epsilon}=\frac{8\epsilon}{2\epsilon}=4=\big[\nabla_VL\big]_{32}`,
        notes: [
          ex(R`worked example: set $V_{32}=1+\epsilon$. Then $z_3=1+2\epsilon$, $a_3=1+2\epsilon$, $\hat{\mathbf y}=(1+2\epsilon,\ 1-2\epsilon)^\top$, so $L=\tfrac12[(1+2\epsilon)^2+(-1-2\epsilon)^2]=(1+2\epsilon)^2$. It equals the backprop entry $(\nabla_VL)_{32}=g_{z,3}\,x_2=2\cdot2=4$ (file 48)`),
          lab(R`for this quadratic loss the central difference is exact for every $\epsilon$; the one-sided quotient would give $(L(\epsilon)-L(0))/\epsilon=4+4\epsilon$, e.g. 4.4 for $\epsilon=0.1$`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\text{relative error}=\frac{\big|\text{numerical}-\text{backprop}\big|}{\max\big(|\text{numerical}|,|\text{backprop}|\big)}\ \ \text{should be tiny (e.g. below }10^{-6}\text{)}`,
        notes: [
          lab('a common way to turn "approximately equal" into a test (this exact formula is a standard choice, not from the slide)'),
          warn(R`near a ReLU kink ($z_h\approx0$) the loss is not smooth on the scale of $\epsilon$, so the numerical slope disagrees with the one-sided derivative that backprop used. That is why the slide says "away from activation kinks". Dropout or random augmentation would change $L$ between the two evaluations, which is why randomness is disabled`),
        ],
      },
    ],
  },
  {
    id: 'branch-merge',
    circ: 4,
    title: 'Branching and merging',
    why: R`Real networks are not always a single chain: a value can be used by two later blocks (a branch) or two values can be joined (a merge). The two rules below, copy forward means add backward, and concatenate forward means split backward, are all you need to extend backpropagation to such graphs.`,
    slides: [slide('L3', 105, 'Branching and merging')],
    slideNote: R`Top: a "merge" block with two arrows entering from the left and one leaving; a "branch" block with one arrow entering and two leaving. Bottom left, "Merge: concatenate columns": forward $\mathbf x_{\text{out}}=\begin{bmatrix}\mathbf x^a_{\text{in}}\\\mathbf x^b_{\text{in}}\end{bmatrix}$ (green); backward $\mathbf g_{\text{out}}=\begin{bmatrix}\mathbf g^a_{\text{in}}\\\mathbf g^b_{\text{in}}\end{bmatrix}$ (red; the slide's label says the stacked $\mathbf g_{\text{out}}$ is cut into its two parts). Bottom right, "Branch: copy a column": forward $\mathbf x^a_{\text{out}}=\mathbf x_{\text{in}}$, $\mathbf x^b_{\text{out}}=\mathbf x_{\text{in}}$; backward $\mathbf g_{\text{in}}=\mathbf g^a_{\text{out}}+\mathbf g^b_{\text{out}}$.`,
    derive: true,
    pre: [
      text('Merge: concatenate columns. Branch: copy a column.'),
    ],
    rows: [
      {
        eq: R`\textbf{Merge, forward:}\ \ \underbrace{\mathbf x_{\text{out}}}_{(n_a+n_b)\times1}=\begin{bmatrix}\mathbf x^a_{\text{in}}\\\mathbf x^b_{\text{in}}\end{bmatrix},\ \ \mathbf x^a_{\text{in}}:\ n_a\times1,\ \mathbf x^b_{\text{in}}:\ n_b\times1`,
        notes: [lab('stack the two input columns into one longer column')],
      },
      {
        eq: R`\textbf{Merge, backward:}\ \ \mathbf g_{\text{out}}=\begin{bmatrix}\mathbf g^a_{\text{in}}\\\mathbf g^b_{\text{in}}\end{bmatrix}\quad\text{i.e. split }\mathbf g_{\text{out}}\text{ into its first }n_a\text{ and last }n_b\text{ entries}`,
        notes: [
          lab(R`each entry of $\mathbf x_{\text{out}}$ is exactly one entry of $\mathbf x^a_{\text{in}}$ or $\mathbf x^b_{\text{in}}$, so the Jacobian is the identity (stacked): $J^\top\mathbf g=\mathbf g$ just cut in two (I91)`),
          shape(R`(n_a+n_b)\times1\ \to\ n_a\times1\ \text{and}\ n_b\times1`),
        ],
      },
      {
        eq: R`\textbf{Branch, forward:}\ \ \mathbf x^a_{\text{out}}=\mathbf x_{\text{in}},\quad\mathbf x^b_{\text{out}}=\mathbf x_{\text{in}}\qquad\textbf{Branch, backward:}\ \ \mathbf g_{\text{in}}=\mathbf g^a_{\text{out}}+\mathbf g^b_{\text{out}}`,
        notes: [
          tag(['I90'], R`$\mathbf x_{\text{in}}$ reaches $L$ along two paths, so the contributions add (multi-path chain rule)`),
          shape(R`\text{all vectors}:\ n\times1`),
        ],
      },
      {
        eq: R`\text{merge: }\ \mathbf x^a=\begin{bmatrix}1\\2\end{bmatrix},\ \mathbf x^b=\begin{bmatrix}3\end{bmatrix}\Rightarrow\mathbf x_{\text{out}}=\begin{bmatrix}1\\2\\3\end{bmatrix};\ \ \mathbf g_{\text{out}}=\begin{bmatrix}0.5\\-1\\2\end{bmatrix}\Rightarrow\mathbf g^a=\begin{bmatrix}0.5\\-1\end{bmatrix},\ \mathbf g^b=\begin{bmatrix}2\end{bmatrix}`,
        notes: [ex('forward stacks, backward cuts at the same position'), shape(R`2\times1,\ 1\times1\ \to\ 3\times1`)],
      },
      {
        eq: R`\text{branch: }\ x_{\text{in}}=3,\ \ L=2x^a_{\text{out}}+5x^b_{\text{out}}\Rightarrow g^a=2,\ g^b=5,\ \ g_{\text{in}}=2+5=7=\frac{d}{dx}(2x+5x)`,
        notes: [
          ex(R`check: using $x$ twice gives $L=7x$, so the gradient must be 7, not 2 and not 5`),
          shape(R`1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Mirror images',
        text: R`Copying a column forward is the dual of adding gradients backward; concatenating forward is the dual of splitting backward. The backward operation is always the transpose of the forward linear operation (I91): copying is multiplication by $\begin{bmatrix}I\\I\end{bmatrix}$, whose transpose $\begin{bmatrix}I&I\end{bmatrix}$ adds.`,
      },
    ],
  },
  {
    id: 'branched-graphs',
    circ: 5,
    title: 'Branched graphs and shared parameters',
    why: R`The same "add the paths" rule covers two situations that look different: a value feeding several blocks, and one parameter being used in several places. The second is why a parameter shared across positions (as in convolutional networks, later in the course) gets a gradient that is a sum.`,
    slides: [slide('L3', 106, 'Branched graphs and shared parameters')],
    slideNote: R`Left: a graph of seven blocks (boxes) with arrows going up: two blocks at the bottom (one feeding a single block above it; the other feeding two blocks above it), three blocks in the middle row, merging into one block at the top, and a second arrow from the right-hand middle block going past it to the output. It is a picture of a branched and merged network, with no formulas. Right: a parameter $\theta$ (blue square) goes into a "branch" block whose two outputs $\theta^a$ and $\theta^b$ enter two different blocks; "$\cdots$" marks their other inputs. Text: "When a value or parameter feeds several paths, add the gradient contributions from those paths."`,
    derive: true,
    pre: [
      text('When a value or parameter feeds several paths, add the gradient contributions from those paths.'),
    ],
    rows: [
      {
        eq: R`\boldsymbol\theta^a=\boldsymbol\theta^b=\boldsymbol\theta\quad\Rightarrow\quad\nabla_{\boldsymbol\theta}L=\nabla_{\boldsymbol\theta^a}L+\nabla_{\boldsymbol\theta^b}L`,
        notes: [
          tag(['I90'], R`a parameter used by two blocks is a branch: copy forward, add backward (slide 105)`),
          lab(R`$\nabla_{\boldsymbol\theta^a}L$ is the gradient that the first block computes for its own copy (its local backward operation, slide 101), and likewise for $b$`),
          shape(R`\boldsymbol\theta,\ \boldsymbol\theta^a,\ \boldsymbol\theta^b,\ \nabla L:\ p\times1\ (\text{all same shape})`),
        ],
      },
      {
        eq: R`\text{shared }w:\ \ L=(w\,u-1)^2+(w\,v-3)^2\ \Rightarrow\ \frac{\partial L}{\partial w}=2(wu-1)\,u+2(wv-3)\,v`,
        notes: [
          ex(R`two blocks both multiply by the same weight $w$. Each contributes its own path term; the gradient is their sum. For $w=1,u=2,v=1$: $2(2-1)2+2(1-3)1=4-4=0$`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\text{summing over all paths:}\quad\nabla L=\sum_{\text{paths }p\text{ that use the value}}\nabla^{(p)}L`,
        notes: [
          lab('this single sentence is what makes backprop work on any directed acyclic graph (computation graph): process the blocks in reverse order of the forward pass, and accumulate (+=) into every value that has several consumers'),
        ],
      },
    ],
  },
];

export const generalBackpropChecks: Topic = {
  id: 'general-backprop-checks',
  title: 'General backpropagation, gradient checks, branching',
  short: 'General backprop & checks',
  summary: R`Each block turns $\mathbf g_{\text{out}}$ into $\mathbf g_{\text{in}}=J_{\text{in}}^\top\mathbf g_{\text{out}}$ and $\nabla_\theta L=J_\theta^\top\mathbf g_{\text{out}}$. Deep MLP: $\mathbf g_z^{[l]}=(\mathbf W^{[l+1]\top}\mathbf g_z^{[l+1]})\odot\mathbb 1[\mathbf z^{[l]}>0]$, $\nabla_{\mathbf W^{[l]}}L=\mathbf g_z^{[l]}\mathbf a^{[l-1]\top}$. Check by central difference $(L(\theta+\epsilon e_j)-L(\theta-\epsilon e_j))/2\epsilon$. Copy forward = add backward; concatenate forward = split backward; a shared parameter's gradient is the sum over its uses.`,
  identities,
  sections,
};

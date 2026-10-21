import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I98',
    area: 'Vector calculus',
    tex: R`\hat y_c=\frac{e^{z_c}}{\sum_{j}e^{z_j}}\ \Rightarrow\ \frac{\partial\hat y_c}{\partial z_k}=\hat y_c\big([c=k]-\hat y_k\big),\qquad\frac{\partial\hat{\mathbf y}}{\partial\mathbf z}=\operatorname{diag}(\hat{\mathbf y})-\hat{\mathbf y}\hat{\mathbf y}^\top`,
    note: R`Softmax Jacobian. $[c=k]$ is the Iverson bracket: 1 if $c=k$ and 0 otherwise. Derivation (quotient rule, $S=\sum_je^{z_j}$): $\frac{\partial e^{z_c}}{\partial z_k}=[c=k]\,e^{z_c}$ and $\frac{\partial S}{\partial z_k}=e^{z_k}$, so $\frac{\partial\hat y_c}{\partial z_k}=\frac{[c=k]e^{z_c}S-e^{z_c}e^{z_k}}{S^2}=\hat y_c[c=k]-\hat y_c\hat y_k$. As a matrix (rows $c$, columns $k$): the first term is the diagonal matrix $\operatorname{diag}(\hat{\mathbf y})$, the second is the outer product $\hat{\mathbf y}\hat{\mathbf y}^\top$ (I92). Shapes: $\hat{\mathbf y},\mathbf z:\ C\times1$; the Jacobian: $C\times C$ and symmetric. Each row sums to 0 (since $\sum_c\hat y_c=1$ does not change when $\mathbf z$ changes). Check: $C=2$ gives $\partial\hat y_1/\partial z_1=\hat y_1(1-\hat y_1)$, the sigmoid derivative of I69.`,
  },
];

const sections: Section[] = [
  {
    id: 'multiclass-forward',
    title: 'Appendix: multiclass example, forward pass',
    why: R`In Lecture 2 you met softmax and cross-entropy for classification (files 18 and 20). The appendix pushes them through the block-by-block recipe of this lecture: three small blocks (linear scores, softmax, cross-entropy), each with its own forward and backward rule. The final result is the same simple formula as before, $\hat{\mathbf y}-\mathbf y$, but now it is derived by the general machinery.`,
    slides: [
      slide('L3', 125, 'Appendix: multiclass backpropagation (divider)'),
      slide('L3', 126, 'Multiclass example: forward pass'),
    ],
    slideNote: R`Slide 125 is the divider; sub-topics "Linear scores", "Softmax probabilities", "Cross-entropy loss"; Reading: K. Murphy (2022), §§10.3, 13.3. Slide 126: "One example. The target $\mathbf y$ is one-hot over $C$ classes. Biases are omitted." Three labelled rows. "Linear scores $\mathbf z$": $\mathbf z=\mathbf W\mathbf x$, $\mathbf W\in\mathbb R^{C\times D}$, $\mathbf z\in\mathbb R^{C\times1}$. "Softmax $\hat{\mathbf y}$": $\hat y_c=\frac{\exp(z_c)}{\sum_{k=1}^C\exp(z_k)}$, $c=1,\dots,C$. "Cross-entropy $L$": $L=-\sum_{c=1}^Cy_c\log\hat y_c=-\log\hat y_{c_*}$. Footer: "Cache $\mathbf x$, $\mathbf z$ and $\hat{\mathbf y}$. The correct class is $c_*$."`,
    derive: true,
    pre: [
      text('One example. The target y is one-hot over C classes. Biases are omitted.'),
      text('Cache x, z and ŷ. The correct class is c*.'),
    ],
    rows: [
      {
        eq: R`\underbrace{\mathbf z}_{C\times1}=\underbrace{\mathbf W}_{C\times D}\underbrace{\mathbf x}_{D\times1}`,
        notes: [
          term('Linear scores'),
          tag(['C15'], R`Lecture 3 layout: $\mathbf W$ is outputs $\times$ inputs ($C\times D$). Lecture 2 wrote the transpose, $D\times C$ (with the bias folded into the input)`),
          shape(R`(C\times D)(D\times1)=C\times1`),
        ],
      },
      {
        eq: R`\hat y_c=\frac{\exp(z_c)}{\sum_{k=1}^{C}\exp(z_k)},\qquad c=1,\dots,C`,
        notes: [
          term('Softmax'),
          tag(['I67'], R`turns the $C$ scores into $C$ positive numbers that sum to 1: a probability for each class`),
          shape(R`\hat{\mathbf y}:\ C\times1`),
        ],
      },
      {
        eq: R`L=-\sum_{c=1}^{C}y_c\log\hat y_c=-\log\hat y_{c_*}`,
        notes: [
          term('Cross-entropy'),
          tag(['I68'], R`$\mathbf y$ is one-hot: $y_{c_*}=1$ for the correct class $c_*$ and $y_c=0$ for all others, so only one term survives`),
          shape(R`\mathbf y:\ C\times1;\ L:\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbf W=\begin{bmatrix}1&1\\2&-1\\-1&1\end{bmatrix},\ \mathbf x=\begin{bmatrix}1\\1\end{bmatrix}\Rightarrow\mathbf z=\begin{bmatrix}2\\1\\0\end{bmatrix},\ \ \hat{\mathbf y}=\frac{1}{e^2+e+1}\begin{bmatrix}e^2\\e\\1\end{bmatrix}\approx\begin{bmatrix}0.665\\0.245\\0.090\end{bmatrix},\ \ c_*=2:\ L=-\log0.245\approx1.408`,
        notes: [
          ex(R`$C=3$, $D=2$. $e^2=7.389$, $e=2.718$, $1$; the sum is $11.107$. The entries add up to $1$. The true class is 2, so $\mathbf y=(0,1,0)^\top$. This example is used for all of the backward slides (files below)`),
          shape(R`\mathbf W:\ 3\times2;\ \mathbf x:\ 2\times1;\ \mathbf z,\hat{\mathbf y},\mathbf y:\ 3\times1`),
          warn(R`for large scores $e^{z}$ overflows; in practice one subtracts $\max_kz_k$ from all scores first, which does not change the softmax (the numerator and denominator are multiplied by the same constant). Not on the slide`),
        ],
      },
    ],
  },
  {
    id: 'softmax-forward-mode',
    circ: 1,
    title: 'Softmax in forward mode: all for one',
    why: R`In the forward direction every output probability depends on all the scores, not only on its own score. That fan-in is what makes the softmax block different from a pointwise activation like ReLU, where output $c$ depends on input $c$ only.`,
    slides: [slide('L3', 127, 'Softmax in forward mode: all for one')],
    slideNote: R`Marked "Optional appendix material". The formula $\hat y_c=\dfrac{\exp(z_c)}{\sum_{c'=1}^C\exp(z_{c'})}$ above a picture: a column of five red dots (the scores $z_1,\dots,z_5$) on the left and a column of five blue dots (the outputs) next to it. Five grey arrows run from all the red dots into the single middle blue dot, labelled $\hat y_c$.`,
    derive: true,
    pre: [text('Optional appendix material.')],
    rows: [
      {
        eq: R`\hat y_c=\frac{\exp(z_c)}{\sum_{c'=1}^{C}\exp(z_{c'})}=f_c(z_1,\dots,z_C)`,
        notes: [
          lab(R`"all for one": the single output $\hat y_c$ (right, blue) receives an arrow from every score $z_1,\dots,z_C$ (left, red). The numerator uses $z_c$; the denominator uses all of them`),
          lab(R`so the Jacobian of softmax is a full $C\times C$ matrix (all pairs), not a diagonal one`),
          shape(R`\mathbf z\in\mathbb R^{C\times1}\ \to\ \hat{\mathbf y}\in\mathbb R^{C\times1}`),
        ],
      },
    ],
  },
  {
    id: 'ce-layer',
    circ: 2,
    title: 'Cross-entropy as a computation layer',
    why: R`The loss is also a block of the graph. It has one forward rule and one backward rule, which means the backward pass can begin from the number $\partial L/\partial L=1$ and produce the first gradient, $\mathbf g_{\hat y}$, with no special treatment.`,
    slides: [slide('L3', 128, 'Cross-entropy as a computation layer')],
    slideNote: R`A yellow block labelled "Cross-entropy"; the input $\hat{\mathbf y}$ enters from the left (blue arrow, forward) and the output $L$ leaves on the right; the target $\mathbf y$ is written above the block. Backward (red arrows, right to left): $\partial L/\partial L=1$ enters on the right, and $\mathbf g_{\hat{\mathbf y}}$ leaves on the left. Text: "Forward: one-hot $\mathbf y$ selects the correct class, $c_*$." with $L=-\sum_{c=1}^Cy_c\log\hat y_c=-\log\hat y_{c_*}$. "Backward: the loss block sends a gradient into softmax." with $\dfrac{\partial L}{\partial\hat y_c}=-\dfrac{y_c}{\hat y_c}$ and $\mathbf g_{\hat{\mathbf y}}=-\mathbf y\oslash\hat{\mathbf y}$. "Pass this column gradient to the softmax backward rule."`,
    derive: true,
    pre: [
      text('Forward: one-hot y selects the correct class, c*.'),
      text('Backward: the loss block sends a gradient into softmax.'),
      text('Pass this column gradient to the softmax backward rule.'),
    ],
    rows: [
      {
        eq: R`\frac{\partial L}{\partial\hat y_c}=\frac{\partial}{\partial\hat y_c}\Big[-\sum_{j=1}^{C}y_j\log\hat y_j\Big]=-\frac{y_c}{\hat y_c}`,
        notes: [
          tag(['I37'], R`only the term $j=c$ contains $\hat y_c$, and $\frac{d}{dv}\log v=\frac1v$`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_{\hat{\mathbf y}}}_{C\times1}=-\,\mathbf y\oslash\hat{\mathbf y}=-\begin{bmatrix}y_1/\hat y_1\\\vdots\\y_C/\hat y_C\end{bmatrix}`,
        notes: [
          lab(R`$\oslash$ is entry-by-entry division of two vectors of the same shape (the counterpart of $\odot$)`),
          lab(R`for a one-hot $\mathbf y$ this is a vector that is 0 everywhere except at the correct class $c_*$, where it is $-1/\hat y_{c_*}$`),
          warn(R`if the correct class gets a tiny probability ($\hat y_{c_*}\to0$) this gradient becomes huge: wrong and confident predictions are punished very strongly`),
          shape(R`C\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf y}=\begin{bmatrix}0.665\\0.245\\0.090\end{bmatrix},\ \mathbf y=\begin{bmatrix}0\\1\\0\end{bmatrix}\quad\Rightarrow\quad\mathbf g_{\hat{\mathbf y}}=-\begin{bmatrix}0/0.665\\1/0.245\\0/0.090\end{bmatrix}\approx\begin{bmatrix}0\\-4.086\\0\end{bmatrix}`,
        notes: [ex('numbers of the example of slide 126'), shape(R`3\times1`)],
      },
    ],
  },
  {
    id: 'softmax-backward-mode',
    circ: 3,
    title: 'Softmax in backward mode: one from all',
    why: R`The mirror image of "all for one". The gradient reaching one score $z_k$ must collect a contribution from every output, because every output depends on $z_k$. Writing this as a sum over outputs is the multi-path chain rule (I90) once again.`,
    slides: [slide('L3', 129, 'Softmax in backward mode: one from all')],
    slideNote: R`Marked "Optional appendix material". The softmax formula again, and a picture: five blue dots (outputs, middle column) each with a blue arrow pointing in from the right labelled $\partial L/\partial\hat y_c=-y_c/\hat y_c$; grey arrows from all five blue dots converge on one red dot (the score $z_k$, left column) from which a thick red arrow leaves to the left. Below: $\dfrac{\partial L}{\partial z_k}=\sum_c\dfrac{\partial L}{\partial\hat y_c}\dfrac{\partial\hat y_c}{\partial z_k}$.`,
    derive: true,
    pre: [text('Optional appendix material.')],
    rows: [
      {
        eq: R`\frac{\partial L}{\partial z_k}=\sum_{c=1}^{C}\frac{\partial L}{\partial\hat y_c}\,\frac{\partial\hat y_c}{\partial z_k}`,
        notes: [
          tag(['I90'], R`"one from all": the score $z_k$ affects the loss through all $C$ outputs, so there are $C$ paths and their contributions add`),
          lab(R`first factor: the gradient arriving at output $c$ (blue arrows, slide 128). Second factor: the local softmax derivative, derived on the next slide`),
          shape(R`\text{all factors}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'softmax-ce-chain',
    circ: 4,
    title: 'Softmax and cross-entropy: the chain rule',
    why: R`This is the calculation that justifies the formula $\hat{\mathbf y}-\mathbf y$ for the gradient of the cross-entropy at the scores, which you have used since Lecture 2. Two things cancel, the $1/\hat y_c$ from the loss and the $\hat y_c$ from the softmax, and the result is remarkably simple.`,
    slides: [slide('L3', 130, 'Softmax and cross-entropy: the chain rule')],
    slideNote: R`Three blocks. "Softmax local derivative": $\dfrac{\partial\hat y_c}{\partial z_k}=\hat y_c\big([c=k]-\hat y_k\big)$, with the side note "$[c=k]$ equals 1 when $c=k$, and 0 otherwise." "Chain with the loss gradient": $\dfrac{\partial L}{\partial z_k}=\sum_{c=1}^C\dfrac{\partial L}{\partial\hat y_c}\dfrac{\partial\hat y_c}{\partial z_k}=\sum_{c=1}^C\Big(-\dfrac{y_c}{\hat y_c}\Big)\hat y_c\big([c=k]-\hat y_k\big)$. "Use the one-hot target: its entries sum to one." $=-y_k+\hat y_k\sum_{c=1}^Cy_c=\hat y_k-y_k$.`,
    derive: true,
    pre: [
      text('[c = k] equals 1 when c = k, and 0 otherwise.'),
      text('Use the one-hot target: its entries sum to one.'),
    ],
    rows: [
      {
        eq: R`\frac{\partial\hat y_c}{\partial z_k}=\frac{[c=k]\,e^{z_c}\,S-e^{z_c}\,e^{z_k}}{S^2}=\hat y_c\,[c=k]-\hat y_c\,\hat y_k=\hat y_c\big([c=k]-\hat y_k\big),\qquad S=\sum_{j=1}^{C}e^{z_j}`,
        notes: [
          tag(['I98'], R`quotient rule on $\hat y_c=e^{z_c}/S$. The numerator derivative is $[c=k]e^{z_c}$ (it only moves when $k=c$); the denominator derivative is $\partial S/\partial z_k=e^{z_k}$. Then split the fraction: $\frac{e^{z_c}}{S}=\hat y_c$ and $\frac{e^{z_k}}{S}=\hat y_k$`),
          lab(R`two cases: $c=k$ gives $\hat y_c(1-\hat y_c)$ (the sigmoid-like derivative, I69); $c\ne k$ gives $-\hat y_c\hat y_k$ (raising one score lowers the probability of every other class)`),
          shape(R`C\times C\ \text{Jacobian, entry}\ (c,k)`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial z_k}=\sum_{c=1}^{C}\Big(-\frac{y_c}{\hat y_c}\Big)\hat y_c\big([c=k]-\hat y_k\big)=-\sum_{c=1}^{C}y_c\big([c=k]-\hat y_k\big)`,
        notes: [lab(R`substitute $\partial L/\partial\hat y_c=-y_c/\hat y_c$ (slide 128); the factors $\hat y_c$ cancel`)],
      },
      {
        eq: R`-\sum_{c=1}^{C}y_c[c=k]+\hat y_k\sum_{c=1}^{C}y_c=-y_k+\hat y_k\cdot1=\hat y_k-y_k`,
        notes: [
          lab(R`first sum: the bracket $[c=k]$ keeps only the term $c=k$, which is $y_k$. Second: $\hat y_k$ does not depend on $c$ so it comes out of the sum`),
          tag(['I68'], R`$\sum_cy_c=1$ for a one-hot (or any probability) target`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_{\mathbf z}}_{C\times1}=\underbrace{\Big(\operatorname{diag}(\hat{\mathbf y})-\hat{\mathbf y}\hat{\mathbf y}^\top\Big)}_{C\times C}\underbrace{\big(-\mathbf y\oslash\hat{\mathbf y}\big)}_{C\times1}=-\mathbf y+\hat{\mathbf y}\,(\mathbf 1^\top\mathbf y)=\hat{\mathbf y}-\mathbf y`,
        notes: [
          tag(['I98', 'I91'], R`the same calculation in matrix form: $\mathbf g_{\mathbf z}=J^\top\mathbf g_{\hat y}$ with $J=\operatorname{diag}(\hat{\mathbf y})-\hat{\mathbf y}\hat{\mathbf y}^\top$ (symmetric, so $J^\top=J$). The diagonal part times $-\mathbf y\oslash\hat{\mathbf y}$ gives $-\mathbf y$; the outer-product part gives $+\hat{\mathbf y}(\hat{\mathbf y}^\top(\mathbf y\oslash\hat{\mathbf y}))=\hat{\mathbf y}\,(\sum_cy_c)=\hat{\mathbf y}$`),
          shape(R`(C\times C)(C\times1)=C\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf y}-\mathbf y=\begin{bmatrix}0.665\\0.245\\0.090\end{bmatrix}-\begin{bmatrix}0\\1\\0\end{bmatrix}=\begin{bmatrix}0.665\\-0.755\\0.090\end{bmatrix},\qquad\sum_kg_{z,k}=0.665-0.755+0.090=0`,
        notes: [
          ex(R`check by the long route for $k=1$: $g_{\hat y,2}\cdot\hat y_2(0-\hat y_1)=(-4.086)(0.245)(-0.665)=0.665$ ✓; for $k=2$: $(-4.086)(0.245)(1-0.245)=-0.755$ ✓`),
          lab(R`the entries of $\hat{\mathbf y}-\mathbf y$ always add up to 0 ($\sum\hat y_k=\sum y_k=1$): adding the same number to all the scores does not change the softmax, so the loss cannot change in that direction`),
          shape(R`3\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Binary case',
        text: R`With $C=2$ this is the logistic-regression gradient $p-y$ of Lecture 2 (file 20; also file 46): the same formula, now for $C$ classes. The softmax and cross-entropy are cleanly paired: the awkward $1/\hat y_c$ of the loss exactly cancels the $\hat y_c$ in the softmax derivative.`,
      },
    ],
  },
  {
    id: 'multiclass-backprop',
    circ: 5,
    title: 'Multiclass example: backpropagation',
    why: R`Combining the score gradient with the linear-layer rules of file 48 gives the gradient with respect to the weights, which is what we need to update, and the gradient with respect to the input, which we need if another layer sits below.`,
    slides: [slide('L3', 131, 'Multiclass example: backpropagation')],
    slideNote: R`"The cross-entropy and softmax layers give the score gradient." Three labelled rows. "Score gradient": $\mathbf g_{\mathbf z}=\dfrac{\partial L}{\partial\mathbf z}=\hat{\mathbf y}-\mathbf y\in\mathbb R^{C\times1}$. "Weight gradient": $\dfrac{\partial L}{\partial\mathbf W}=\mathbf g_{\mathbf z}\mathbf x^T\in\mathbb R^{C\times D}$. "Input gradient": $\mathbf g_{\mathbf x}=\mathbf W^T\mathbf g_{\mathbf z}\in\mathbb R^{D\times1}$. Footer: "For a mean data loss, average these per-example gradients."`,
    derive: true,
    pre: [
      text('The cross-entropy and softmax layers give the score gradient.'),
      text('For a mean data loss, average these per-example gradients.'),
    ],
    rows: [
      {
        eq: R`\underbrace{\mathbf g_{\mathbf z}}_{C\times1}=\hat{\mathbf y}-\mathbf y`,
        notes: [lab('the result of the previous slide: loss block, then softmax block, backwards'), shape(R`C\times1`)],
      },
      {
        eq: R`\underbrace{\nabla_{\mathbf W}L}_{C\times D}=\underbrace{\mathbf g_{\mathbf z}}_{C\times1}\underbrace{\mathbf x^\top}_{1\times D}`,
        notes: [
          tag(['I92', 'C14'], R`the linear-layer rule of file 48: score gradient times the input, an outer product with the shape of $\mathbf W$`),
          shape(R`(C\times1)(1\times D)=C\times D`),
        ],
      },
      {
        eq: R`\underbrace{\mathbf g_{\mathbf x}}_{D\times1}=\underbrace{\mathbf W^\top}_{D\times C}\underbrace{\mathbf g_{\mathbf z}}_{C\times1}`,
        notes: [
          tag(['I93'], R`transpose collects the sum over the $C$ scores (file 48); needed only if something sits below the input`),
          shape(R`(D\times C)(C\times1)=D\times1`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf W}L=\begin{bmatrix}0.665\\-0.755\\0.090\end{bmatrix}\begin{bmatrix}1&1\end{bmatrix}=\begin{bmatrix}0.665&0.665\\-0.755&-0.755\\0.090&0.090\end{bmatrix},\qquad\mathbf g_{\mathbf x}=\begin{bmatrix}1&2&-1\\1&-1&1\end{bmatrix}\begin{bmatrix}0.665\\-0.755\\0.090\end{bmatrix}\approx\begin{bmatrix}-0.935\\1.511\end{bmatrix}`,
        notes: [
          ex(R`$\mathbf W$, $\mathbf x$ from slide 126. $g_{x,1}=0.665-1.510-0.090=-0.935$; $g_{x,2}=0.665+0.755+0.090=1.511$`),
          ex(R`finite-difference check of one entry, $W_{21}$ (so $z_2\to z_2+\epsilon$ as $x_1=1$): $L(\epsilon)=-(1+\epsilon)+\log(e^2+e^{1+\epsilon}+1)$, so $dL/d\epsilon=-1+\hat y_2=-0.755$, equal to the entry $(2,1)$ above ✓`),
          shape(R`\nabla_{\mathbf W}L:\ 3\times2;\ \mathbf g_{\mathbf x}:\ 2\times1`),
        ],
      },
      {
        eq: R`L_{\text{mean}}=\frac1N\sum_{n=1}^{N}L^{(n)}\ \Rightarrow\ \nabla_{\mathbf W}L_{\text{mean}}=\frac1N\sum_{n=1}^{N}\mathbf g_{\mathbf z}^{(n)}\mathbf x^{(n)\top}`,
        notes: [
          tag(['I25'], R`expectation (here an average over examples) of a sum is the sum of the expectations: the constant $\tfrac1N$ and the sum come out of the gradient`),
          lab(R`the gradient of an average is the average of the gradients (linearity); each example is pushed through the same forward and backward passes. A mini-batch version is the same with $N\to B$ (SGD, Lecture 2)`),
          shape(R`C\times D`),
        ],
      },
    ],
  },
];

export const softmaxCeBackprop: Topic = {
  id: 'softmax-ce-backprop',
  title: 'Appendix: softmax and cross-entropy backpropagation',
  short: 'Softmax + CE backprop',
  summary: R`Forward: $\mathbf z=W\mathbf x$, $\hat y_c=e^{z_c}/\sum_ke^{z_k}$, $L=-\log\hat y_{c_*}$. Backward: $\mathbf g_{\hat y}=-\mathbf y\oslash\hat{\mathbf y}$; softmax Jacobian $\operatorname{diag}(\hat{\mathbf y})-\hat{\mathbf y}\hat{\mathbf y}^\top$; so $\mathbf g_{\mathbf z}=\hat{\mathbf y}-\mathbf y$, $\nabla_WL=\mathbf g_{\mathbf z}\mathbf x^\top$, $\mathbf g_{\mathbf x}=W^\top\mathbf g_{\mathbf z}$.`,
  identities,
  sections,
};

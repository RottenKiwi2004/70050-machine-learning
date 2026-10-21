import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I67',
    area: 'Probability',
    tex: R`p_c=\frac{e^{z_c}}{\sum_{k=1}^{C}e^{z_k}}\ \Rightarrow\ 0<p_c<1,\quad\sum_{c=1}^{C}p_c=1;\qquad C=2:\ p_1=g(z_1-z_2)`,
    note: R`Softmax turns any $C$ real scores into a probability distribution: each $e^{z_c}>0$ (I10), and the shared denominator makes them add to 1. Adding the same number to every score changes nothing (it cancels top and bottom). With two classes, divide top and bottom by $e^{z_1}$: $p_1=1/(1+e^{-(z_1-z_2)})$, the sigmoid (I64) of the score difference.`,
  },
  {
    id: 'I68',
    area: 'Algebra & calculus',
    tex: R`\mathbf t\ \text{one-hot at }y:\quad\prod_{c=1}^{C}p_c^{\,t_c}=p_y,\qquad\sum_{c=1}^{C}t_c\log p_c=\log p_y`,
    note: R`A one-hot vector has a single 1 (at position $y$) and 0 elsewhere. Any number to the power 0 is 1 and to the power 1 is itself, so the product keeps only $p_y$; likewise the sum keeps only $\log p_y$. The binary Bernoulli formula (I65) is the case $C=2$.`,
  },
];

const sections: Section[] = [
  {
    id: 'multiclass',
    title: 'Multiclass classification',
    why: R`Many problems have more than two classes (digits, objects, words). The binary model gave one probability; now we need a probability for each of $C$ classes, and they must add to 1.`,
    slides: [slide('L2', 27, 'Multiclass probabilities (section divider)'), slide('L2', 28, 'Multiclass classification')],
    slideNote: R`Slide 27 is the divider (figure: softmax class probabilities over two inputs; reading Murphy §§10.3.1–10.3.2). Slide 28 figure: left, two classes split by one line; right, four classes (crosses, circles, triangles, squares) split by three lines meeting in the middle.`,
    pre: [term('Binary labels'), text('Two possible classes.')],
    rows: [
      {
        eq: R`g(a)=\frac{1}{1+\exp(-a)},\qquad p_i=g(\mathbf w^\top\mathbf x_i)`,
        notes: [
          tag(['I64'], 'binary recap: the sigmoid gives the class-1 probability'),
          warn(R`the slide writes $\mathbf x^{i}$; it means $\mathbf x_i$, example $i$`),
        ],
      },
      {
        eq: R`\ell(y_i,p_i)=-y_i\log p_i-(1-y_i)\log(1-p_i)`,
        notes: [lab('binary recap: the log-loss')],
      },
      {
        eq: R`y_i\in\{1,\dots,C\}`,
        notes: [term('Multiclass labels'), lab(R`one of $C$ categories; the labels are names, their order means nothing`)],
      },
    ],
  },
  {
    id: 'softmax',
    circ: 1,
    title: 'Softmax class probabilities',
    why: R`Give each class its own linear score, then turn the $C$ scores into probabilities with the softmax: exponentiate (so every value is positive) and divide by the total (so they add to 1). The largest score gets the largest probability, a "soft" version of picking the maximum.`,
    slides: [slide('L2', 29, 'Softmax class probabilities')],
    slideNote: R`Figure: left, "Discriminants (inputs)": three planes $\mathbf w_c^\top\mathbf x$ over two inputs; right, "Softmax (outputs)": the class probabilities, each near 1 where its plane is highest. The name $z_c$ (row 2), the vector form (row 3) and the numbers are added; the slide writes $\mathbf w_c^\top\mathbf x$ inside the exponential without naming it.`,
    manim: 'SoftmaxBars', // animations/classification.py: scores, exponentials, probabilities
    rows: [
      {
        eq: R`p_c(\mathbf x)=\frac{\exp(\mathbf w_c^\top\mathbf x)}{\sum_{k=1}^{C}\exp(\mathbf w_k^\top\mathbf x)},\qquad W=[\mathbf w_1,\dots,\mathbf w_C]`,
        notes: [
          term('Softmax (soft maximum) of competing classes'),
          lab(R`$c$ indexes the $C$ classes; $\mathbf w_c$ is class $c$'s parameter vector, column $c$ of $W$`),
          lab(R`$k$ indexes classes in the denominator; each output is one class probability`),
          tag(['I67'], 'every output is in (0, 1) and they add to 1'),
          shape(R`\mathbf w_c:\ (D+1)\times1,\qquad W:\ (D+1)\times C,\qquad p_c(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`z_c=\mathbf w_c^\top\mathbf x`,
        notes: [term('Discriminant (class score)'), shape(R`(1\times(D+1))\,((D+1)\times1)=1\times1`)],
      },
      {
        eq: R`\mathbf z=W^\top\mathbf x=\begin{bmatrix}\mathbf w_1^\top\mathbf x\\ \vdots\\ \mathbf w_C^\top\mathbf x\end{bmatrix}`,
        notes: [
          lab('all C scores at once: row c of the transposed matrix is the transposed column c'),
          shape(R`W^\top:\ C\times(D+1),\quad\mathbf x:\ (D+1)\times1,\quad\mathbf z:\ C\times1`),
        ],
      },
      {
        eq: R`\mathbf z=(2,1,0)^\top:\quad e^{\mathbf z}=(e^2,e^1,e^0)=(7.39,\,2.72,\,1),\quad\textstyle\sum=7.39+2.72+1=11.11`,
        notes: [ex('exponentiate each score: all three numbers are positive'), shape(R`\mathbf z,\ e^{\mathbf z}:\ 3\times1`)],
      },
      {
        eq: R`\mathbf p=\Big(\frac{7.39}{11.11},\,\frac{2.72}{11.11},\,\frac{1}{11.11}\Big)^\top=(0.665,\,0.245,\,0.090)^\top`,
        notes: [
          ex('divide each exponential by the total'),
          lab(R`check: $0.665+0.245+0.090=1.000$, and the order of the probabilities matches the order of the scores`),
        ],
      },
      {
        eq: R`\sum_{c=1}^{C}p_c=\sum_{c=1}^{C}\frac{e^{z_c}}{\sum_{k=1}^{C}e^{z_k}}=\frac{1}{\sum_{k=1}^{C}e^{z_k}}\sum_{c=1}^{C}e^{z_c}=\frac{\sum_{c}e^{z_c}}{\sum_{k}e^{z_k}}=1`,
        notes: [
          tag(['I67'], R`the denominator does not depend on $c$, so it is a constant factor for the sum over $c$; top and bottom are the same sum with the index renamed`),
        ],
      },
      {
        eq: R`\frac{e^{z_c+a}}{\sum_{k}e^{z_k+a}}=\frac{e^{a}\,e^{z_c}}{e^{a}\sum_{k}e^{z_k}}=\frac{e^{z_c}}{\sum_{k}e^{z_k}}=p_c`,
        notes: [
          tag(['I67'], R`adding the same $a$ to every score changes nothing: $e^{z+a}=e^{a}e^{z}$ and the common factor $e^{a}$ cancels`),
          warn(R`so only differences between scores matter, which is why the binary case depends on $z_1-z_2$`),
        ],
      },
      {
        eq: R`C=2:\quad p_1(\mathbf x)=\frac{e^{z_1}}{e^{z_1}+e^{z_2}}=\frac{e^{z_1}/e^{z_1}}{(e^{z_1}+e^{z_2})/e^{z_1}}=\frac{1}{1+e^{z_2-z_1}}=\frac{1}{1+\exp\!\big(-(\mathbf w_1-\mathbf w_2)^\top\mathbf x\big)}`,
        notes: [
          tag(['I67'], 'two-class softmax is the logistic model with w = w1 − w2'),
          ex(R`divide top and bottom by $e^{z_1}$; then $e^{z_2}/e^{z_1}=e^{z_2-z_1}$ and $z_1-z_2=\mathbf w_1^\top\mathbf x-\mathbf w_2^\top\mathbf x=(\mathbf w_1-\mathbf w_2)^\top\mathbf x$`),
          lab('so binary logistic regression is a special case'),
        ],
      },
    ],
  },
  {
    id: 'cross-entropy',
    circ: 2,
    title: 'Multiclass cross-entropy',
    why: R`As in the binary case, the training loss is the negative log-likelihood. A one-hot target vector lets us write the probability of the observed class as one product, and its negative log is the cross-entropy we minimise to fit $W$.`,
    slides: [slide('L2', 30, 'Multiclass cross-entropy'), slide('L2', 150, 'Training objective, multiclass case (appendix)')],
    slideNote: R`Slide 150 (appendix) repeats slide 30 and adds "fit $W$ by minimising this summed cross-entropy objective". Row 4 (the simplified form) and the numbers are added.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`(\mathbf x_i,y_i),\quad y_i=3,\qquad \mathbf t_i=(0,0,1,0)^\top`,
        notes: [
          term('One-hot target vector'),
          lab(R`$C=4$, $y_i=3$: $t_{ic}=1$ for $c=y_i$ and 0 otherwise`),
          shape(R`\mathbf t_i:\ C\times1`),
        ],
      },
      {
        eq: R`P(Y=y_i\mid\mathbf x_i;W)=\prod_{c=1}^{C}p_c(\mathbf x_i)^{t_{ic}}=p_1^{0}\,p_2^{0}\,p_3^{1}\,p_4^{0}=1\cdot1\cdot p_3\cdot1=p_3(\mathbf x_i)`,
        notes: [
          lab('likelihood of one training sample'),
          tag(['I68'], R`only the factor for the true class survives: $=p_{y_i}(\mathbf x_i)$`),
        ],
      },
      {
        eq: R`L(W)=-\sum_{i=1}^{N}\sum_{c=1}^{C}t_{ic}\log p_c(\mathbf x_i)`,
        notes: [
          term('Optimisation criterion (multiclass cross-entropy)'),
          tag(['I33', 'I34'], 'independent examples: the log of the product is a sum over i'),
          lab(R`$p_c(\mathbf x_i)$: predicted probability of class $c$ for example $i$; the logs are natural`),
          shape(R`L:\ 1\times1;\ \ \text{the }t_{ic}\text{ form an }N\times C\text{ matrix}`),
        ],
      },
      {
        eq: R`=-\sum_{i=1}^{N}\big[0\cdot\log p_1+0\cdot\log p_2+1\cdot\log p_3+0\cdot\log p_4\big]=-\sum_{i=1}^{N}\log p_{y_i}(\mathbf x_i)`,
        notes: [tag(['I68'], 'for each example only the true-class term remains'), lab(R`written for the $C=4$, $y_i=3$ example; in general the single surviving term is $t_{iy_i}\log p_{y_i}=\log p_{y_i}$`)],
      },
      {
        eq: R`\mathbf p(\mathbf x_i)=(0.1,\,0.2,\,0.6,\,0.1)^\top,\ y_i=3:\quad \ell_i=-\sum_ct_{ic}\log p_c=-\log0.6=0.511`,
        notes: [
          ex('only the probability of the true class enters the loss'),
          lab(R`with $C=2$ this is exactly the binary log-loss`),
        ],
      },
    ],
  },
  {
    id: 'compare',
    title: 'Multiclass logistic and linear regression',
    why: R`The multiclass version of the "squared loss versus log-loss" comparison: least squares can squeeze a class out, while softmax with cross-entropy gives each class a sensible region.`,
    slides: [slide('L2', 31, 'Multiclass logistic and linear regression')],
    slideNote: R`Figure: three classes along a diagonal (red top left, green in the middle, blue bottom right). Left, linear regression on one-hot targets: the green region is a thin wedge and most green points are labelled red or blue. Right, logistic (softmax) regression: a band for green that contains its points.`,
    pre: [
      text('Here, squared loss gives the middle class too narrow a region; logistic regression separates it more effectively.'),
      lab('the same reason as in the binary case: squared loss reacts to points that are already correct and far from the boundary'),
    ],
    rows: [],
  },
];

export const softmaxMulticlass: Topic = {
  id: 'softmax-multiclass',
  title: 'Multiclass classification and softmax',
  short: 'Softmax',
  summary: R`One score $\mathbf w_c^\top\mathbf x$ per class; softmax turns them into probabilities that add to 1, with $W$ of shape $(D+1)\times C$. One-hot targets give the cross-entropy $L(W)=-\sum_i\sum_c t_{ic}\log p_c(\mathbf x_i)=-\sum_i\log p_{y_i}(\mathbf x_i)$.`,
  identities,
  sections,
};

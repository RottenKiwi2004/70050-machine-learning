import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'C11',
    area: 'Conventions',
    tex: R`y_\pm=2y-1,\qquad y\in\{0,1\}\ \Rightarrow\ y_\pm\in\{-1,+1\}`,
    note: R`Signed label. The same class written two ways: $y=1\leftrightarrow y_\pm=+1$ and $y=0\leftrightarrow y_\pm=-1$. The $\{0,1\}$ form suits probabilities (the Bernoulli formula); the $\pm1$ form suits margins.`,
  },
  {
    id: 'I63',
    area: 'Algebra & calculus',
    tex: R`y_\pm\in\{-1,+1\}\ \Rightarrow\ y_\pm^2=1,\qquad \frac1{y_\pm}=y_\pm`,
    note: R`$(-1)^2=(+1)^2=1$, and $1/(-1)=-1$, $1/(+1)=+1$. So multiplying or dividing by $y_\pm$ only flips a sign, and $y_\pm^2$ can be dropped from any product.`,
  },
];

const sections: Section[] = [
  {
    id: 'score',
    circ: 1,
    title: 'A linear score and a decision boundary',
    why: R`The simplest parametric classifier reuses the linear model from regression: compute one number (a score) from the input, then decide by its sign. This gives a straight decision boundary and a fixed set of $D+1$ parameters, unlike k-NN.`,
    slides: [slide('L2', 12, 'Scores and logistic loss (section divider)'), slide('L2', 13, 'A linear score and a decision boundary')],
    slideNote: R`Slide 12 is the section divider (figure: the logistic sigmoid; reading Murphy §§10.2.1–10.2.3). Rows 3 and 4 (the boundary as a line in 2D) are added.`,
    rows: [
      {
        eq: R`z=f_{\mathbf w}(\mathbf x)=\mathbf w^\top\mathbf x=w_0+\sum_{j=1}^{D}w_jx_j`,
        notes: [
          term('Score (logit)'),
          lab(R`$\mathbf w$: the parameter vector; $w_0$: the intercept (it meets the $x_0=1$ coordinate)`),
          tag(['I13', 'I12'], 'an inner product is a sum of coordinate products'),
          shape(R`\mathbf w^\top:\ 1\times(D+1),\quad \mathbf x:\ (D+1)\times1,\quad z:\ 1\times1`),
        ],
      },
      {
        eq: R`\hat y=\mathbb 1[z\ge0],\qquad \mathbf w^\top\mathbf x=0\ \ \text{on the boundary}`,
        notes: [
          tag(['C10'], R`$\hat y=1$ when the score is non-negative, else $0$`),
          term('Decision boundary'),
          lab(R`the inputs whose score is exactly $0$`),
        ],
      },
      {
        eq: R`D=2:\quad w_0+w_1x_1+w_2x_2=0\ \iff\ x_2=-\frac{w_0+w_1x_1}{w_2}\quad(w_2\ne0)`,
        notes: [
          lab('in two measured dimensions the boundary is a line'),
          lab(R`in $D$ dimensions it is a flat surface (a hyperplane) with normal vector $(w_1,\dots,w_D)$`),
        ],
      },
      {
        eq: R`\mathbf w=(-1,\,1,\,1)^\top:\quad z=-1+x_1+x_2,\qquad \mathbf x=(1,\,0.2,\,0.3)^\top\Rightarrow z=-0.5,\ \hat y=0`,
        notes: [ex(R`the boundary is the line $x_1+x_2=1$; a point below it gets class 0`)],
      },
    ],
  },
  {
    id: 'margin',
    circ: 2,
    title: 'The margin and classification error',
    why: R`To measure mistakes we need to know whether the score has the right sign for the true label. Rewriting the label as $\pm1$ makes this one product, the margin. The natural error count (the 0–1 loss) then turns out to be useless for gradient-based fitting, which is why we need a different loss.`,
    slides: [slide('L2', 14, 'The margin and classification error')],
    slideNote: 'The table of cases (row 3) is added.',
    rows: [
      {
        eq: R`y_\pm=2y-1,\qquad y\in\{0,1\},\quad y_\pm\in\{-1,+1\}`,
        notes: [term('Signed label'), tag(['C11'], R`$y=0\mapsto-1$, $y=1\mapsto+1$`)],
      },
      {
        eq: R`m=y_\pm z,\qquad z=f_{\mathbf w}(\mathbf x)=\mathbf w^\top\mathbf x`,
        notes: [
          term('Margin'),
          lab('positive margin: the score has the correct sign'),
          lab('negative margin: the classifier makes an error'),
          lab('at zero, the input is on the decision boundary; choose a tie rule'),
          shape(R`y_\pm,\ z,\ m:\ 1\times1`),
        ],
      },
      {
        eq: R`\begin{array}{c|cc} & z>0 & z<0\\ \hline y_\pm=+1 & m>0\ \text{correct} & m<0\ \text{error}\\ y_\pm=-1 & m<0\ \text{error} & m>0\ \text{correct}\end{array}`,
        notes: [lab('the sign of the margin is "same sign or not", whatever the class')],
      },
      {
        eq: R`\ell_{01}(m)=\begin{cases}0, & m>0,\\ 1, & m<0.\end{cases}`,
        notes: [
          term('0–1 loss (misclassification loss)'),
          lab('counts one per mistake: summed over the data it is the number of errors'),
          warn('flat away from its jump at zero: its derivative is 0 almost everywhere, so it gives no useful gradient direction'),
          text('So we use smooth surrogate losses instead.'),
        ],
      },
    ],
  },
  {
    id: 'quadratic',
    title: 'Inappropriateness of quadratic loss',
    why: R`The obvious first try is to treat the labels as numbers and run least squares, since it has a closed form. This picture shows that a good squared-error fit can still put the boundary in the wrong place.`,
    slides: [slide('L2', 15, 'Inappropriateness of quadratic loss')],
    slideNote: R`Figure: 1D inputs on the $x$ axis; three points with label $-1$ on the left and four with label $+1$ on the right, one of them far to the right. The green line is the least-squares fit; its zero crossing (red) is the computed boundary, to the right of the desired boundary (blue) between the two groups.`,
    pre: [
      text('We chose the quadratic cost function for convenience: a global minimum and a closed-form solution.'),
      tag(['I6', 'I7'], R`the closed form is the Normal Equation; convexity makes its flat point the global minimum`),
      text('But does it indicate classification performance?'),
      warn(R`the far-right $+1$ point is classified correctly with a large score, yet least squares tilts the line to bring it closer to $+1$, which drags the zero crossing to the right`),
    ],
    rows: [],
  },
  {
    id: 'quadratic-margin',
    circ: 3,
    title: 'Rewriting the quadratic loss in terms of the margin',
    why: R`Writing the squared loss as a function of the margin explains the picture: the loss is smallest at margin 1 and grows again for larger margins, so very confident correct predictions are punished like errors.`,
    slides: [slide('L2', 16, 'Rewriting the quadratic loss'), slide('L2', 17, 'Quadratic loss and classification margins')],
    slideNote: 'Row 2 shows the factoring step that the slide states in words. The numeric examples are added.',
    pre: [text('Use the signed labels and margin defined earlier.')],
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\ell_{\text{sq}}=(y_\pm-z)^2`,
        notes: [lab(R`squared error between the target $\pm1$ and the score`), shape(R`1\times1`)],
      },
      {
        eq: R`=\big(y_\pm(1-y_\pm z)\big)^2`,
        notes: [
          tag(['I63'], R`factor out $y_\pm$: $y_\pm(1-y_\pm z)=y_\pm-y_\pm^2z=y_\pm-z$`),
        ],
      },
      {
        eq: R`=y_\pm^2(1-y_\pm z)^2`,
        notes: [lab(R`$(ab)^2=a^2b^2$`)],
      },
      {
        eq: R`=(1-m)^2`,
        notes: [
          tag(['I63'], R`$y_\pm^2=1$, and $y_\pm z=m$`),
          lab(R`the loss depends only on the margin $m=y_\pm z$`),
        ],
      },
      {
        eq: R`\ell_{\text{sq}}=\big(1-y_\pm f_{\mathbf w}(\mathbf x)\big)^2`,
        notes: [
          lab('slide 17 plot: a parabola in the signed margin with its minimum at m = 1, against the 0–1 step (dashed)'),
          warn('squared loss is smallest at margin 1; it penalises very confident correct predictions as well as errors'),
          lab('large errors can dominate the objective'),
        ],
      },
      {
        eq: R`m=-1:\ \ell_{\text{sq}}=4,\qquad m=1:\ \ell_{\text{sq}}=0,\qquad m=3:\ \ell_{\text{sq}}=4`,
        notes: [
          ex(R`a correct prediction with margin 3 costs as much as a wrong one with margin $-1$`),
        ],
      },
    ],
  },
];

export const scoresAndMargins: Topic = {
  id: 'scores-and-margins',
  title: 'Linear scores, margins and the squared loss',
  short: 'Margins',
  summary: R`A linear score $z=\mathbf w^\top\mathbf x$ and the decision $\hat y=\mathbb 1[z\ge0]$; signed labels $y_\pm=2y-1$ and the margin $m=y_\pm z$; why the 0–1 loss gives no gradient, and why the squared loss $(1-m)^2$ wrongly punishes confident correct scores.`,
  identities,
  sections,
};

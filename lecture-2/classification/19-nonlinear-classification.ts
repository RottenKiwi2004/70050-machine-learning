import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'boundaries',
    circ: 1,
    title: 'Nonlinear decision boundaries',
    why: R`A linear score can only draw a straight boundary. When one class sits between two groups of the other, no straight boundary works. Adding new coordinates such as $x^2$ makes the same linear method draw a curved boundary in the original input.`,
    slides: [slide('L2', 32, 'Nonlinear features (section divider)'), slide('L2', 33, 'Nonlinear decision boundaries')],
    slideNote: R`Slide 32 is the divider (figure: the feature map of slide 34; reading Murphy §10.2.2). Slide 33 figures: top, a 1D dataset that one threshold separates; middle, red–blue–red along $x$, which no single threshold separates; bottom, the same points plotted at $(x,x^2)$, where a straight line separates them. Rows 2 to 4 are added.`,
    pre: [
      text('Datasets that are linearly separable (with some noise) work out great.'),
      text('But what are we going to do if the dataset is not separable?'),
      text('Solution: map data to a higher-dimensional space.'),
    ],
    rows: [
      {
        eq: R`x\ \longmapsto\ \boldsymbol\phi(x)=(1,\ x,\ x^2)^\top`,
        notes: [
          term('Feature map'),
          lab('each input becomes a point in a plane with axes x and x squared (plus the constant 1 for the intercept)'),
          shape(R`x:\ 1\times1\ \longmapsto\ \boldsymbol\phi(x):\ 3\times1`),
        ],
      },
      {
        eq: R`z=w_0+w_1x+w_2x^2`,
        notes: [
          lab('still linear in the coefficients w, so all the fitting machinery is unchanged'),
          lab(R`a straight line $z=0$ in the $(x,x^2)$ plane`),
        ],
      },
      {
        eq: R`z=0\ \iff\ x=\frac{-w_1\pm\sqrt{w_1^2-4w_2w_0}}{2w_2}`,
        notes: [
          lab('back on the x axis the boundary is two thresholds: the class in the middle is between them'),
          ex(R`$w_0=-1,\ w_1=0,\ w_2=1$: $z=x^2-1$, so $\hat y=1$ for $|x|\ge1$ and $\hat y=0$ for $|x|<1$`),
        ],
      },
    ],
  },
  {
    id: 'feature-map',
    circ: 2,
    title: 'A feature map changes the geometry',
    why: R`The same idea in two dimensions: one class inside a circle and the other outside. A third coordinate equal to the squared distance from the origin lifts the outer points higher, so a flat plane separates them; seen from the original plane, that cut is a circle.`,
    slides: [slide('L2', 34, 'A feature map changes the geometry')],
    slideNote: R`Figure: left, red points inside a dotted circle and blue points outside; right, the same points in 3D after the map, with a plane between the low red points and the high blue points. Rows 2 and 3 are added.`,
    rows: [
      {
        eq: R`\boldsymbol\phi:\ (x_1,x_2)\ \longmapsto\ (x_1,\ x_2,\ x_1^2+x_2^2)`,
        notes: [
          lab('map (x1, x2) to (x1, x2, x1 squared + x2 squared): the new coordinate is the squared distance from the origin'),
          shape(R`\mathbb R^2\to\mathbb R^3\quad(\text{plus a leading 1 for the intercept: }4\times1)`),
        ],
      },
      {
        eq: R`w_0+w_1x_1+w_2x_2+w_3(x_1^2+x_2^2)=0`,
        notes: [lab('a separating plane in feature space')],
      },
      {
        eq: R`w_1=w_2=0,\ w_3=1,\ w_0=-r^2:\quad x_1^2+x_2^2=r^2`,
        notes: [
          lab('gives a curved boundary in input space: a circle of radius r'),
          ex(R`$r=1$: $\hat y=1$ (outside) when $x_1^2+x_2^2\ge1$`),
        ],
      },
    ],
  },
  {
    id: 'nonlinear-softmax',
    circ: 3,
    title: 'Classification with nonlinear features',
    why: R`Nothing in softmax or cross-entropy cares what the input vector is. Replacing $\mathbf x_i$ by $\boldsymbol\phi(\mathbf x_i)$ keeps every formula, and only changes the length of each class vector from $D+1$ to $M$.`,
    slides: [slide('L2', 35, 'Classification with nonlinear features')],
    slideNote: 'Rows 3 and 4 (the score vector and the design matrix) are added.',
    rows: [
      {
        eq: R`\text{Linear: }\ L(W)=-\sum_{i=1}^{N}\sum_{c=1}^{C}t_{ic}\log p_c(\mathbf x_i;W)`,
        notes: [shape(R`W:\ (D+1)\times C`)],
      },
      {
        eq: R`\text{Nonlinear: }\ L(W)=-\sum_{i=1}^{N}\sum_{c=1}^{C}t_{ic}\log p_c(\boldsymbol\phi(\mathbf x_i);W)`,
        notes: [
          lab(R`each class score is linear in its coefficients; $\phi_0(\mathbf x)=1$ has coefficient $w_{0c}$`),
          lab(R`$\boldsymbol\phi=(\phi_0,\dots,\phi_{M-1})^\top$; each class vector has $M$ coefficients`),
          shape(R`\boldsymbol\phi(\mathbf x):\ M\times1,\qquad W:\ M\times C`),
        ],
      },
      {
        eq: R`\mathbf z=W^\top\boldsymbol\phi(\mathbf x),\qquad p_c=\frac{e^{z_c}}{\sum_k e^{z_k}}`,
        notes: [
          tag(['I67'], 'the same softmax, applied to the new scores'),
          shape(R`(C\times M)(M\times1)=C\times1`),
        ],
      },
      {
        eq: R`\Phi=\begin{bmatrix}\boldsymbol\phi(\mathbf x_1)^\top\\ \vdots\\ \boldsymbol\phi(\mathbf x_N)^\top\end{bmatrix}`,
        notes: [
          tag(['C6'], R`the feature design matrix: row $i$ is the features of example $i$`),
          shape(R`\Phi:\ N\times M\quad(\text{replaces }X:\ N\times(D+1))`),
          warn(R`more features means more coefficients ($M\times C$) and a greater risk of overfitting: regularise and validate`),
        ],
      },
    ],
  },
];

export const nonlinearClassification: Topic = {
  id: 'nonlinear-classification',
  title: 'Nonlinear features for classification',
  short: 'NL features',
  summary: R`A feature map $\boldsymbol\phi$ (such as $x\mapsto(1,x,x^2)$ or $(x_1,x_2)\mapsto(x_1,x_2,x_1^2+x_2^2)$) lets a linear score draw curved boundaries. Softmax and cross-entropy are unchanged; $W$ becomes $M\times C$.`,
  sections,
};

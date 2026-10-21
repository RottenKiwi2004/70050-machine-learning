import { R, ex, lab, shape, slide, tag, text } from 'principia';
import type { Section, Topic } from 'principia';
import XorNetwork from '../../widgets/XorNetwork';

const sections: Section[] = [
  {
    id: 'xor-network',
    title: 'Learning XOR: representations during training',
    why: R`The hand-built XOR network (file 41) had its weights chosen for us. Here the same architecture, with smooth sigmoid units, finds good weights by itself from the data. Watching the hidden layer during training shows what a "learned representation" is: a new coordinate system in which the classes can be separated by a line.`,
    slides: [slide('L3', 55, 'Learning XOR: representations during training')],
    slideNote: R`Animated 3D diagram. Three planes in a row: Input $(x_1,x_2)$, Hidden activations $(h_1,h_2)$, and the output $P(y=1\mid x)$ drawn as a vertical axis from 0 to 1. Thin lines follow every data point between planes (labelled "Affine + sigmoid" between each pair of planes). Class 0 blue circles, class 1 orange triangles. Counter: 3,000 / 3,000 updates, training error 0.0%. Caption: "Two sigmoid hidden units feed a single sigmoid output."`,
    derive: true,
    pre: [text('Two sigmoid hidden units feed a single sigmoid output.')],
    rows: [
      {
        eq: R`\mathbf h=\sigma\big(V\mathbf x+\mathbf b^{[1]}\big),\qquad P(y=1\mid\mathbf x)=\sigma\big(W\mathbf h+b^{[2]}\big)`,
        notes: [
          lab(R`the two-layer network of slide 50 with $\sigma$ in place of the step $H$, so every unit has a usable derivative and the network can be trained by gradient descent`),
          shape(R`\mathbf x:\ 2\times1;\ V:\ 2\times2;\ \mathbf h,\ \mathbf b^{[1]}:\ 2\times1;\ W:\ 1\times2;\ P,\ b^{[2]}:\ 1\times1`),
          tag(['I64'], 'sigmoid applied to every entry'),
        ],
      },
      {
        eq: R`L(\boldsymbol\theta)=-\sum_{i=1}^{N}\big\{y_i\log p_i+(1-y_i)\log(1-p_i)\big\},\qquad p_i=P(y=1\mid\mathbf x_i)`,
        notes: [
          lab('the binary cross-entropy of Lecture 2 (file 17): the y-axis of the curve on slide 56 is this loss, which falls from about 1 to about 0.01 over the 3,000 updates'),
          lab(R`$\boldsymbol\theta=\{V,\mathbf b^{[1]},W,b^{[2]}\}$ are all trained together by gradient descent; the gradients are computed by backpropagation (files 46–49)`),
        ],
      },
    ],
  },
  {
    id: 'dense-evaluation',
    circ: 1,
    title: 'Hidden activations and output probability',
    why: R`Each hidden unit is a function of the input. Drawing it as a heat map over the whole input plane shows exactly what feature it has learned, and shows that the output is a function of the two features.`,
    slides: [slide('L3', 56, 'Hidden activations and output probability')],
    slideNote: R`Three heat maps over the input square $x_1,x_2\in[-0.2,1.2]$ with the four data clusters overlaid: "Hidden unit 1: $h_1(x)$", "Hidden unit 2: $h_2(x)$" and "$P(y=1\mid x)$". Each hidden unit is a smooth ramp across the plane with a white dashed line where it equals 0.5. The output panel is dark (low probability) in a diagonal band that contains the two class-0 clusters at $(0,0)$ and $(1,1)$ and yellow (high) on both sides of it, where the class-1 clusters at $(0,1)$ and $(1,0)$ sit. Below: a line plot of binary cross-entropy (log scale, 1 to 0.01) against training updates (0 to 3,000). Caption: "The same network evaluated densely over the original input space."`,
    pre: [text('The same network evaluated densely over the original input space.')],
    rows: [
      {
        eq: R`h_j(\mathbf x)=\sigma\big(V_{j1}x_1+V_{j2}x_2+b^{[1]}_j\big),\quad j=1,2\qquad\text{level set }h_j=0.5:\ V_{j1}x_1+V_{j2}x_2+b^{[1]}_j=0`,
        notes: [
          lab('a hidden unit is a "soft half-plane": it varies smoothly from 0 to 1 across a straight line, the same shape as a logistic regression (file 17)'),
          tag(['I64'], 'sigma(0) = 0.5, so the 0.5 contour is where the score is 0'),
          shape(R`h_j(\mathbf x):\ 1\times1\ \text{per input point}`),
        ],
      },
      {
        eq: R`P(y=1\mid\mathbf x)=\sigma\big(W_{11}h_1(\mathbf x)+W_{12}h_2(\mathbf x)+b^{[2]}\big)`,
        notes: [lab(R`the output is a logistic regression on the two hidden activations $(h_1,h_2)$; for instance with the weights of the next section, class 1 means "$h_1$ high and $h_2$ low" (OR but not AND), so class 0 is a diagonal band between the two ramps`)],
      },
    ],
  },
  {
    id: 'space-deformation',
    circ: 2,
    title: 'How a trained network deforms space',
    why: R`A layer is an affine map followed by a squashing nonlinearity, so it bends the space the data lives in. Looking at a grid of input points before and after the first layer shows the bending directly: the classes end up where a straight line separates them.`,
    slides: [slide('L3', 57, 'How a trained network deforms space'), slide('L3', 58, 'Learning the deformation and separating line')],
    slideNote: R`Two plots side by side with an arrow between. Left, "Input space": the $(x_1,x_2)$ plane with a fine grid, the four clusters (class 0 blue circles at $(0,0)$ and $(1,1)$, class 1 orange triangles at $(0,1)$ and $(1,0)$), and two black dashed lines where $P(y=1\mid\mathbf x)=0.5$ that bound the diagonal band holding class 0 (shaded light blue, class 1 shaded light orange). Right, "Hidden space": the same grid and points after $\mathbf h=\sigma(V\mathbf x+\mathbf b^{[1]})$, plotted in $(h_1,h_2)\in[0,1]^2$; the grid is squashed towards the edges and the dashed decision boundary is now a single straight line. Slide 57 uses the trained weights ("Fixed weights transform the grid through an affine map and sigmoid."); slide 58 is the animation of the same figure over 3,000 updates ("The hidden grid and decision boundary evolve over 3,000 updates"; training error 0.0%). The widget below is added: it train a one-hidden-layer network on XOR by gradient descent and watch the input space and the hidden space change.`,
    derive: true,
    pre: [
      text('Fixed weights transform the grid through an affine map and sigmoid.'),
      text('The hidden grid and decision boundary evolve over 3,000 updates.'),
    ],
    rows: [
      {
        eq: R`\mathbf x\ \xmapsto{\ \text{affine}\ }\ \mathbf s=V\mathbf x+\mathbf b^{[1]}\ \xmapsto{\ \text{sigmoid}\ }\ \mathbf h=\sigma(\mathbf s)\in(0,1)^2`,
        notes: [
          lab('step 1: stretch, rotate, shear and shift the plane (a straight grid stays a straight grid); step 2: squash each coordinate into (0, 1), which bends the grid'),
          shape(R`\mathbf x,\ \mathbf s,\ \mathbf h:\ 2\times1`),
          tag(['I64'], 'sigmoid maps every real number into (0, 1)'),
        ],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}0\\0\end{bmatrix},\ V=\begin{bmatrix}4&4\\4&4\end{bmatrix},\ \mathbf b^{[1]}=\begin{bmatrix}-2\\-6\end{bmatrix}:\quad\mathbf s=\begin{bmatrix}-2\\-6\end{bmatrix},\ \mathbf h=\begin{bmatrix}\sigma(-2)\\\sigma(-6)\end{bmatrix}=\begin{bmatrix}0.12\\0.002\end{bmatrix}`,
        notes: [
          ex(R`illustrative weights, not the trained ones (the slide does not print them); $\sigma(-2)=\frac{1}{1+e^2}=0.119$ and $\sigma(-6)=0.0025$`),
          lab(R`the other three XOR inputs give $\mathbf s=(2,-2),(2,-2),(6,2)$ and so $\mathbf h\approx(0.88,0.12),(0.88,0.12),(0.998,0.88)$: the two class-1 inputs $(0,1),(1,0)$ land on the same point; class 0 lands at $(0.12,0.002)$ and $(0.998,0.88)$`),
          lab(R`a line now separates the classes: $h_1-h_2$ is $0.76$ for class 1 and $0.12$ for class 0, so the rule $h_1-h_2\ge0.4$ gets all four right`),
        ],
      },
      {
        eq: R`\hat y=1\iff\sigma(\mathbf w^\top\mathbf h+b^{[2]})\ge0.5\iff\mathbf w^\top\mathbf h+b^{[2]}\ge0`,
        notes: [
          tag(['I64'], 'threshold the output probability at 0.5 (slide 45)'),
          lab(R`in $(h_1,h_2)$ this is a straight line; pulled back through the bent map it becomes the two curved-looking dashed lines of the input plot`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Learning means moving the grid',
        text: R`During training the weights $V,\mathbf b^{[1]}$ change, so the deformed grid (and with it the representation of every data point) moves; $W,b^{[2]}$ move the final line. All of them are driven by the same loss, which is the point of learning the representation and the classifier together.`,
      },
    ],
    extra: <XorNetwork />,
  },
];

export const learningXorRepresentations: Topic = {
  id: 'learning-xor-representations',
  title: 'Learning XOR: representations during training',
  short: 'Learning XOR',
  summary: R`With sigmoid hidden units, $\mathbf h=\sigma(V\mathbf x+\mathbf b^{[1]})$ and $P=\sigma(W\mathbf h+b^{[2]})$ learn XOR from data. The hidden layer is an affine map plus a squash that bends the input plane so the classes sit on opposite sides of one straight line.`,
  identities: [],
  sections,
};

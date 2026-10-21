import { R, ex, lab, shape, slide, tag, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'layers-transform',
    title: 'Layers transform a cloud of data',
    why: R`The cleanest way to understand a network is as a chain of functions, each turning one cloud of points into another. With 2D input and output we can draw the clouds as planes and see what each building block does to them: linear layers stretch, ReLU folds, normalisation projects onto a circle.`,
    slides: [slide('L3', 63, 'Layers transform a cloud of data')],
    slideNote: R`Three diagrams, each a lower plane (input cloud, $\mathbf x_{\text{in}}$) joined by thin red lines to an upper plane (output cloud, $\mathbf x_{\text{out}}$). "linear": the cloud is stretched and shifted. "relu": points in the lower-left collapse onto the axes and origin; the output cloud has a sharp corner at the origin. "L2-norm": every point lands on a circle. Formulas under each (equations below). Captions: "Both input and output are 2D, so we can visualise each as a plane. Lower plane: input. Upper plane: transformed output." The numeric examples are added.`,
    derive: true,
    pre: [
      text('Both input and output are 2D, so we can visualise each as a plane.'),
      text('Lower plane: input. Upper plane: transformed output.'),
    ],
    rows: [
      {
        eq: R`\textbf{linear:}\quad\mathbf x_{\text{out}}=W\mathbf x_{\text{in}}+\mathbf b\qquad\text{(stretch and shift; }W:\ 2\times2,\ \mathbf b:\ 2\text{ entries)}`,
        notes: [
          shape(R`\mathbf x_{\text{in}},\ \mathbf x_{\text{out}}:\ 2\times1;\quad W:\ 2\times2;\quad\mathbf b:\ 2\times1`),
          ex(R`$W=\begin{bmatrix}2&0\\0&0.5\end{bmatrix}$, $\mathbf b=\begin{bmatrix}1\\0\end{bmatrix}$, $\mathbf x_{\text{in}}=\begin{bmatrix}1\\2\end{bmatrix}$: $\mathbf x_{\text{out}}=\begin{bmatrix}2+1\\1+0\end{bmatrix}=\begin{bmatrix}3\\1\end{bmatrix}$ (invented numbers: the cloud is stretched 2$\times$ along $x_1$, squeezed by half along $x_2$, then shifted)`),
          lab('a straight line stays a straight line; the whole plane is transformed by the same rule'),
        ],
      },
      {
        eq: R`\textbf{ReLU:}\quad x_{\text{out},j}=\max\big(0,\,x_{\text{in},j}\big),\qquad j=1,2\quad\text{(set negatives to zero)}`,
        notes: [
          lab('applied to each coordinate separately'),
          ex(R`$(-1,\,2)\mapsto(0,\,2)$ and $(-1,-3)\mapsto(0,\,0)$: every point with a negative coordinate is flattened onto an axis, and the whole negative quadrant collapses to the origin`),
          warn('ReLU is not invertible: different inputs can give the same output, so the layer discards information. The plane is folded, not just bent'),
        ],
      },
      {
        eq: R`\textbf{L2-norm:}\quad\mathbf x_{\text{out}}=\frac{\mathbf x_{\text{in}}}{\lVert\mathbf x_{\text{in}}\rVert_2},\qquad\lVert\mathbf x\rVert_2=\sqrt{x_1^2+x_2^2}\quad\text{(nonzero input}\to\text{unit circle)}`,
        notes: [
          tag(['I51'], R`$\lVert\mathbf x\rVert_2$: Euclidean length; the squared version is $\mathbf x^\top\mathbf x$ (I1)`),
          ex(R`$\mathbf x_{\text{in}}=(3,4)$: $\lVert\mathbf x_{\text{in}}\rVert_2=\sqrt{9+16}=5$, $\mathbf x_{\text{out}}=(0.6,\,0.8)$, and $\lVert\mathbf x_{\text{out}}\rVert_2=\sqrt{0.36+0.64}=1$`),
          warn('undefined at the origin (division by 0); all points on the same ray from the origin map to the same point on the circle'),
        ],
      },
    ],
  },
  {
    id: 'learning-transformation',
    circ: 1,
    title: 'Learning changes the whole transformation',
    why: R`Training does not just fit a final classifier: it changes every layer's transformation so that, layer by layer, the two classes are pulled apart until the last layer can separate them by a simple rule.`,
    slides: [slide('L3', 64, 'Learning changes the whole transformation'), slide('L3', 65, 'Learning a nonlinear classifier')],
    slideNote: R`Slide 64: a tall stack of planes for a network with layers (bottom to top) linear, relu, linear, relu, linear, softmax; four columns are training checkpoints (left to right: early to late); red and blue points are the two classes. Early: all points in one clump. Late: the classes separate, and the top plane shows two points at opposite ends. Caption: "Upwards: layers. Across: training checkpoints. Colours: two classes. Training pulls each output towards its own class target." Slide 65: after 6,000 updates (training error 0.0%) a smaller network is drawn plane by plane: Input $\to$ Affine $\to$ ReLU $\to$ Output scores $\to$ Softmax output, with the blue "outer arc" (class 0) and red "central cloud" (class 1) separated at the end, and a dashed box "Full square after affine map". The softmax step and shapes in the rows are added.`,
    derive: true,
    pre: [
      lab('Upwards: layers. Across: training checkpoints. Colours: two classes.'),
      text('Training pulls each output towards its own class target.'),
    ],
    rows: [
      {
        eq: R`\mathbf x\ \to\ \underbrace{W^1\mathbf x+\mathbf b^1}_{\text{affine}}\ \to\ \text{ReLU}\ \to\ \underbrace{W^2\mathbf h+\mathbf b^2}_{\text{output scores }\mathbf z}\ \to\ \text{softmax}\ \to\ \hat{\mathbf y}`,
        notes: [
          lab('the chain of slide 65: each arrow is one of the layer types of slide 63'),
          shape(R`\mathbf x:\ 2\times1;\ \mathbf h:\ H\times1;\ \mathbf z:\ 2\times1\ (\text{two classes});\ \hat{\mathbf y}:\ 2\times1`),
        ],
      },
      {
        eq: R`\hat y_c=\frac{e^{z_c}}{\sum_{k=1}^{C}e^{z_k}},\qquad\hat y_1+\hat y_2=1\ \ (C=2)`,
        notes: [
          tag(['I67'], 'softmax turns scores into probabilities that sum to 1'),
          lab('for two classes the final points lie on the line segment from (1, 0) to (0, 1): the two "class targets"'),
        ],
      },
      {
        eq: R`L=-\sum_{c=1}^{C}y_c\log\hat y_c=-\log\hat y_{c^*},\qquad\mathbf y=\text{one-hot},\ c^*=\text{true class}`,
        notes: [
          tag(['I68'], 'one-hot target: only the true class survives the sum'),
          lab(R`$L\to0$ only as $\hat y_{c^*}\to1$, i.e. as the output reaches the one-hot target of its class: this is the "pull towards its class target"`),
        ],
      },
    ],
  },
  {
    id: 'three-d',
    circ: 2,
    title: 'Learning a three-dimensional representation',
    why: R`With three hidden units the representation is a point in 3D. The classifier on top is linear in those three numbers, so if the classes are separated by planes in 3D hidden space, a linear softmax can read them off. The input rings are not linearly separable, but their learned 3D features are.`,
    slides: [slide('L3', 66, 'Learning a three-dimensional representation'), slide('L3', 67, 'Following points across representations')],
    slideNote: R`Three panels (3,000 updates, training error 0.6%). "Input space": three concentric rings (inner red, middle green, outer blue) with a dashed decision boundary between them. "3D hidden space": the same points in $(h_1,h_2,h_3)$, now in three groups with flat (planar) boundaries. "Softmax probabilities": points on the triangle (simplex) with corners $p_1=1$, $p_2=1$, $p_3=1$; each class sits at its own corner. Slide 66 caption: "Three hidden activations give 3D features with linear class boundaries." Slide 67 repeats the figure with thin lines linking every point across the three panels; caption "Links track each point. Softmax probabilities sum to one."`,
    derive: true,
    pre: [
      text('Three hidden activations give 3D features with linear class boundaries.'),
      text('Links track each point. Softmax probabilities sum to one.'),
    ],
    rows: [
      {
        eq: R`\mathbf h=g\big(V\mathbf x+\mathbf b\big)\in\mathbb R^{3},\qquad\mathbf z=W\mathbf h+\mathbf c\in\mathbb R^{3},\qquad\mathbf p=\operatorname{softmax}(\mathbf z)`,
        notes: [
          lab(R`three hidden units give a 3D feature $\mathbf h$; three class scores $\mathbf z$; three class probabilities $\mathbf p$`),
          shape(R`\mathbf x:\ 2\times1;\ V:\ 3\times2;\ \mathbf h,\ \mathbf b:\ 3\times1;\ W:\ 3\times3;\ \mathbf z,\ \mathbf c,\ \mathbf p:\ 3\times1`),
        ],
      },
      {
        eq: R`p_1+p_2+p_3=1,\qquad p_c\ge0\quad\Rightarrow\quad\mathbf p\ \text{lies on a triangle (the 2D simplex) in 3D}`,
        notes: [
          tag(['I67'], 'softmax output is a probability vector'),
          lab('one number is redundant (p3 = 1 - p1 - p2), so the three-class output has only 2 degrees of freedom: a triangle'),
        ],
      },
      {
        eq: R`\hat y=\arg\max_c\,z_c\ \Rightarrow\ \text{boundary between classes }c,c':\ (\mathbf w_c-\mathbf w_{c'})^\top\mathbf h+(c_c-c_{c'})=0`,
        notes: [
          lab(R`$\mathbf w_c^\top$ is row $c$ of $W$; setting two scores equal gives a plane in $\mathbf h$-space: linear boundaries in 3D, curved ones back in the input (the dashed rings)`),
          tag(['I8'], 'the difference of two linear scores is linear in h'),
        ],
      },
    ],
  },
  {
    id: 'deep-networks',
    circ: 3,
    title: 'Deep networks: the general form, LeNet-5 and AlexNet',
    why: R`Depth is just repetition of the same step: an affine map followed by a ReLU. The two historic networks on the next slides are this pattern with some layers specialised for images (convolutions), which Lecture 4 explains. For now they show what real depth and real shapes look like.`,
    slides: [slide('L3', 68, 'Deep networks'), slide('L3', 69, 'Deep networks: LeNet-5'), slide('L3', 70, 'Deep networks: AlexNet')],
    slideNote: R`Slide 68: a long row of boxes from $\mathbf x$ to $f$ (a wide first box tapering to narrow ones) and the formula $f=W_i\max(0,W_{i-1}\max(0,\cdots W_0\mathbf x))$. Slide 69, LeNet-5 (LeCun, Bottou, Bengio, Haffner 1998, Fig. 2): INPUT $32\times32$ $\to$ C1 feature maps 6@28$\times$28 $\to$ S2 6@14$\times$14 $\to$ C3 16@10$\times$10 $\to$ S4 16@5$\times$5 $\to$ C5 layer 120 $\to$ F6 layer 84 $\to$ OUTPUT 10 (convolutions, subsampling, full connection, Gaussian connections); "LeNet-5 recognises handwritten digits. Convolutional networks in more detail: Week 4." Slide 70, AlexNet (Krizhevsky, Sutskever, Hinton 2012, Fig. 2): $224\times224\times3$ input, an $11\times11$ convolution with stride 4 giving $55\times55$ maps, max pooling to $27\times27$ (128 maps), then $13\times13$ maps (192, 192, 128), then two dense layers of 2048 and a 1000-way output. The size arithmetic is added.`,
    derive: true,
    pre: [
      text('LeNet-5 recognises handwritten digits.'),
      text('Convolutional networks in more detail: Week 4.'),
    ],
    rows: [
      {
        eq: R`f(\mathbf x)=W_i\,\max\!\Big(0,\,W_{i-1}\max\big(0,\,\cdots\,W_0\,\mathbf x\big)\Big)`,
        notes: [
          lab(R`a deep ReLU network: $i$ affine maps $W_0,\dots,W_i$ (biases omitted) with a ReLU between each pair; this is $\mathbf a^{[l]}=\max(0,W^{[l]}\mathbf a^{[l-1]})$ repeated`),
          shape(R`W_l:\ n_{l+1}\times n_l;\quad\text{the inner dimensions must match: }(n_{l+1}\times n_l)(n_l\times1)=n_{l+1}\times1`),
        ],
      },
      {
        eq: R`\text{LeNet-5:}\quad32\times32\ \xrightarrow{\text{conv}}\ 28\times28\ \xrightarrow{\text{subsample}}\ 14\times14\ \xrightarrow{\text{conv}}\ 10\times10\ \xrightarrow{\text{subsample}}\ 5\times5\ \xrightarrow{16\cdot5\cdot5=400}\ 120\to84\to10`,
        notes: [
          lab(R`a convolution with a $5\times5$ window shrinks each side by $5-1=4$ ($32\to28$, $14\to10$); subsampling halves each side; the last maps are flattened and fed to fully connected layers (the window size is from the original paper, not printed on the slide)`),
          ex(R`input a digit image of 1024 numbers, output 10 class scores`),
        ],
      },
      {
        eq: R`\text{AlexNet:}\quad224\times224\times3\ \xrightarrow{\text{conv }11\times11,\ \text{stride }4}\ 55\times55\ \to\ 27\times27\ \to\ 13\times13\ \to\ \text{dense }2048,\,2048\ \to\ 1000`,
        notes: [
          lab(R`stride 4 means the window moves 4 pixels at a time, so a 224-pixel side gives about $224/4=56$ positions: 55 in the figure`),
          lab('the 1000 outputs are the 1000 ImageNet classes (softmax); the 2012 result of slide 42 is for this network'),
        ],
      },
    ],
  },
];

export const representationsDeepNetworks: Topic = {
  id: 'representations-deep-networks',
  title: 'Representations across layers and deep networks',
  short: 'Representations',
  summary: R`Layers transform clouds of points: linear stretches and shifts, ReLU folds, L2-norm projects onto a circle. Training moves every layer so that classes separate by the last softmax layer. Deep nets repeat affine + ReLU: $f=W_i\max(0,W_{i-1}\cdots\max(0,W_0\mathbf x))$; LeNet-5 and AlexNet are specialised examples.`,
  identities: [],
  sections,
};

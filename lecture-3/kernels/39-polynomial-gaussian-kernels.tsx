import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';
import KernelSVM from '../../widgets/KernelSVM';

const identities: Identity[] = [
  {
    id: 'I88',
    area: 'Algebra & calculus',
    tex: R`(a+b)^3=a^3+3a^2b+3ab^2+b^3,\qquad \#\{\text{monomials of degree }p\text{ in }d\text{ variables}\}=\binom{d+p-1}{p}`,
    note: R`Binomial expansion, and the count of terms of a degree-$p$ polynomial in $d$ variables. For $d=2$, $p=3$: $\binom{4}{3}=4$ (the terms $x_1^3,x_1^2x_2,x_1x_2^2,x_2^3$). For $d=100$: $\binom{102}{3}=\frac{102\cdot101\cdot100}{3\cdot2\cdot1}=171{,}700$. $\binom{n}{r}=\frac{n!}{r!(n-r)!}$ is a scalar.`,
  },
];

const sections: Section[] = [
  {
    id: 'polynomial-kernel',
    title: 'Polynomial kernels and explicit features',
    why: R`A kernel is a shortcut: it returns the inner product of two feature vectors without ever building them. The cubic kernel shows the saving exactly, because here we can also write the features out and check that both routes give the same number.`,
    slides: [slide('L3', 35, 'Polynomial kernels and explicit features (non-examinable)')],
    slideNote: R`The slide gives $k(\mathbf x,\mathbf z)=(\mathbf x^\top\mathbf z)^3$; for $\mathbf x\in\mathbb R^2$ the four-term feature map $\boldsymbol\phi(\mathbf x)=(x_1^3,\sqrt3x_1^2x_2,\sqrt3x_1x_2^2,x_2^3)^\top$ and $\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)=(x_1z_1+x_2z_2)^3$; and for $\mathbf x\in\mathbb R^d$, $\dim\boldsymbol\phi(\mathbf x)=\binom{d+2}{3}$ ($d=100$: 171,700). Bottom line: "Explicit features: evaluate each input's monomials, then take their inner product. Kernel: take one $d$-term inner product and cube the result." The expansion (rows 2 to 3) and the numeric check (rows 4 to 5) are added.`,
    derive: true,
    pre: [
      text('For two input coordinates, a cubic feature map has four terms.'),
      text('In d dimensions, the number of cubic monomials grows rapidly.'),
      text(R`Explicit features: evaluate each input's monomials, then take their inner product.`),
      text('Kernel: take one d-term inner product and cube the result.'),
    ],
    rows: [
      {
        eq: R`k(\mathbf x,\mathbf z)=(\mathbf x^\top\mathbf z)^3,\qquad \mathbf x,\mathbf z\in\mathbb R^{d}`,
        notes: [
          term('Polynomial kernel (degree 3)'),
          lab('one inner product of the two original inputs, then cube the number'),
          shape(R`\mathbf x^\top\mathbf z:\ 1\times1;\quad k(\mathbf x,\mathbf z):\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbf x\in\mathbb R^2:\quad\boldsymbol\phi(\mathbf x)=\begin{bmatrix}x_1^3\\\sqrt3\,x_1^2x_2\\\sqrt3\,x_1x_2^2\\x_2^3\end{bmatrix}`,
        notes: [
          lab(R`the explicit feature map: all four cubic monomials, with the cross-terms scaled by $\sqrt3$`),
          shape(R`\boldsymbol\phi(\mathbf x):\ 4\times1\ (\text{from }\mathbf x:\ 2\times1)`),
        ],
      },
      {
        eq: R`\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)=x_1^3z_1^3+(\sqrt3)^2x_1^2x_2\,z_1^2z_2+(\sqrt3)^2x_1x_2^2\,z_1z_2^2+x_2^3z_2^3`,
        notes: [
          tag(['I13'], R`inner product: multiply matching entries and add`),
          lab(R`$\sqrt3\cdot\sqrt3=3$`),
          shape(R`(1\times4)(4\times1)=1\times1`),
        ],
      },
      {
        eq: R`=a^3+3a^2b+3ab^2+b^3=(a+b)^3\quad\text{with}\ a=x_1z_1,\ b=x_2z_2,\qquad a+b=\mathbf x^\top\mathbf z`,
        notes: [
          tag(['I88'], R`binomial expansion read backwards: the four terms are $a^3,\ 3a^2b,\ 3ab^2,\ b^3$ with $a=x_1z_1$ and $b=x_2z_2$`),
          lab(R`so $\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)=(x_1z_1+x_2z_2)^3=(\mathbf x^\top\mathbf z)^3=k(\mathbf x,\mathbf z)$: the kernel is the feature inner product`),
        ],
      },
      {
        eq: R`\mathbf x=\begin{bmatrix}1\\2\end{bmatrix},\ \mathbf z=\begin{bmatrix}3\\1\end{bmatrix}:\quad k=(1\cdot3+2\cdot1)^3=5^3=125`,
        notes: [ex(R`kernel route: one inner product ($=5$), then cube it (invented numbers)`)],
      },
      {
        eq: R`\boldsymbol\phi(\mathbf x)=\begin{bmatrix}1\\2\sqrt3\\4\sqrt3\\8\end{bmatrix},\ \boldsymbol\phi(\mathbf z)=\begin{bmatrix}27\\9\sqrt3\\3\sqrt3\\1\end{bmatrix}:\ \ \boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)=27+54+36+8=125`,
        notes: [
          ex(R`explicit route, same answer: $2\sqrt3\cdot9\sqrt3=2\cdot9\cdot3=54$ and $4\sqrt3\cdot3\sqrt3=4\cdot3\cdot3=36$`),
          lab(R`e.g. $\boldsymbol\phi(\mathbf x)_2=\sqrt3x_1^2x_2=\sqrt3\cdot1\cdot2=2\sqrt3$; $\boldsymbol\phi(\mathbf z)_2=\sqrt3\cdot9\cdot1=9\sqrt3$`),
        ],
      },
      {
        eq: R`\dim\boldsymbol\phi(\mathbf x)=\binom{d+2}{3}:\qquad d=2:\ \binom43=4,\qquad d=100:\ \binom{102}{3}=\frac{102\cdot101\cdot100}{6}=171{,}700`,
        notes: [
          tag(['I88'], R`number of cubic monomials in $d$ variables`),
          warn('explicit features would need 171,700 numbers per input at d = 100; the kernel needs 100 multiplications, one addition chain and a cube'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'The kernel trick',
        text: R`If a method only ever uses inner products $\boldsymbol\phi(\mathbf x_i)^\top\boldsymbol\phi(\mathbf x)$ (as the SVM prediction of slide 34 does), replace each by $k(\mathbf x_i,\mathbf x)$. The cost then depends on $d$ and the number of support vectors, not on the huge feature dimension $M$.`,
      },
    ],
  },
  {
    id: 'gaussian-kernel',
    circ: 1,
    title: 'Gaussian kernels and flexible boundaries',
    why: R`The Gaussian kernel is a similarity that is 1 for identical points and falls to 0 with distance. An SVM built on it is a sum of bumps, one at each support vector, which can bend the boundary around very complicated shapes such as a spiral.`,
    slides: [slide('L3', 36, 'Gaussian kernels and flexible boundaries (non-examinable)')],
    slideNote: R`The slide gives $k(\mathbf x,\mathbf z)=\exp[-\lVert\mathbf x-\mathbf z\rVert^2/(2\sigma^2)]$, $\sigma>0$. Text: "As in kernel regression, a Gaussian gives nearby inputs more influence. The SVM combines Gaussians centred on its support vectors. The feature space is infinite-dimensional (see appendix), but each kernel evaluation is finite." Figure: a two-class spiral (red and blue arms) with a decision boundary that follows the spiral, labelled "This is a hyperplane! (in some space)"; "A linear decision in feature space can produce a complicated boundary in input space." Rows 2 to 4 are added. The widget below is added: it train an SVM with a linear, polynomial or Gaussian kernel and see the support vectors, the margins and the effect of $C$ and $\sigma$.`,
    derive: true,
    pre: [
      text('As in kernel regression, a Gaussian gives nearby inputs more influence.'),
      text('The SVM combines Gaussians centred on its support vectors.'),
      text('The feature space is infinite-dimensional (see appendix), but each kernel evaluation is finite.'),
      text('A linear decision in feature space can produce a complicated boundary in input space.'),
    ],
    rows: [
      {
        eq: R`k(\mathbf x,\mathbf z)=\exp\Big[-\frac{\lVert\mathbf x-\mathbf z\rVert^2}{2\sigma^2}\Big],\qquad\sigma>0`,
        notes: [
          term('Gaussian (RBF) kernel'),
          tag(['I51', 'I10'], R`$\lVert\mathbf x-\mathbf z\rVert^2\ge0$ is the squared Euclidean distance, so the exponent is $\le0$ and $0<k\le1$`),
          lab(R`$\sigma$ is the length scale: how far apart two points can be and still count as similar (the same role as the bandwidth $h$ of file 03)`),
          shape(R`\mathbf x,\mathbf z:\ d\times1;\quad k:\ 1\times1`),
        ],
      },
      {
        eq: R`k(\mathbf x,\mathbf x)=\exp(0)=1,\qquad \mathbf x=\mathbf 0,\ \mathbf z=\begin{bmatrix}1\\1\end{bmatrix}:\ \ \sigma=1:\ e^{-2/2}=0.368,\quad \sigma=0.5:\ e^{-2/0.5}=e^{-4}=0.018`,
        notes: [
          ex(R`here $\lVert\mathbf x-\mathbf z\rVert^2=1+1=2$ (invented numbers)`),
          lab('smaller sigma: similarity dies off faster, so each support vector only influences points very close to it'),
        ],
      },
      {
        eq: R`f(\mathbf x)=\sum_{i\in\text{SV}}\alpha_iy_i\exp\Big[-\frac{\lVert\mathbf x_i-\mathbf x\rVert^2}{2\sigma^2}\Big]+b`,
        notes: [
          lab(R`the kernel expansion of file 38 with the Gaussian kernel: one bump centred on each support vector $\mathbf x_i$, positive if $y_i=+1$, negative if $y_i=-1$`),
          shape(R`f(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`\hat y=\operatorname{sign}\big(f(\mathbf x)\big)\ \Rightarrow\ \text{boundary: }f(\mathbf x)=0,\ \text{a level curve of a sum of bumps}`,
        notes: [
          lab(R`linear in the (infinite-dimensional) feature space, curved in the input: the spiral of the slide`),
          warn('flexibility is controlled by sigma and the SVM penalty C (slide 121); choose them on validation data'),
        ],
      },
    ],
    extra: <KernelSVM />,
  },
];

export const polynomialGaussianKernels: Topic = {
  id: 'polynomial-gaussian-kernels',
  title: 'Polynomial and Gaussian kernels',
  short: 'Kernels',
  summary: R`A kernel $k(\mathbf x,\mathbf z)=\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)$ gives the feature inner product directly. The cubic kernel $(\mathbf x^\top\mathbf z)^3$ matches a $\binom{d+2}{3}$-dimensional feature map; the Gaussian kernel $\exp(-\lVert\mathbf x-\mathbf z\rVert^2/2\sigma^2)$ has infinitely many features yet a finite evaluation. Non-examinable.`,
  identities,
  sections,
};

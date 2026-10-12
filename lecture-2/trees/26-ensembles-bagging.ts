import { R, con, ex, lab, shape, slide, tag, term, text } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I81',
    area: 'Algebra & calculus',
    tex: R`\Big(\sum_{k=1}^{K}a_k\Big)^2=\sum_{k=1}^{K}a_k^2+\sum_{k=1}^{K}\sum_{k'\ne k}a_ka_{k'}`,
    note: R`Square of a sum: every term times every term. The $K$ "diagonal" products are the squares; the other $K(K-1)$ are cross-terms (each pair appears twice). I60 is the case $K=3$.`,
  },
];

const sections: Section[] = [
  {
    id: 'ensembles',
    title: 'Ensembles combine predictions',
    why: R`A single flexible learner such as a deep tree changes a lot when its training data change. If we train several learners whose mistakes differ and combine them, the mistakes partly cancel. This is the idea behind bagging and random forests.`,
    slides: [
      slide('L2', 93, 'Ensembles and bagging (section divider)'),
      slide('L2', 94, 'Ensembles combine predictions'),
      slide('L2', 95, 'Base learners and their combination'),
    ],
    slideNote: R`Slide 93 is the divider (figure: a forest of trees, slide 99; reading Murphy §18.3, bagging). Slide 95 diagram: the input $x$ feeds $f_1,\dots,f_K$; their outputs, weighted by $\omega_1,\dots,\omega_K$, are added at the top node to give $\bar f(x)$.`,
    pre: [
      text('1) Train several base learners whose prediction errors differ.'),
      text('2) Obtain an aggregate decision by combining their results.'),
      text('Two main methods are bagging and boosting. Here we study bagging and random forests.'),
      text('Combine several base learners; the improvement depends on error dependence.'),
    ],
    rows: [
      {
        eq: R`\bar f(\mathbf x)=\sum_{k=1}^{K}\omega_k\,f_k(\mathbf x)`,
        notes: [
          term('Ensemble (committee)'),
          lab(R`$f_k$ is base learner $k$; $\omega_k$ is its combination weight; $K$ is the number of learners`),
          lab('the top node combines the outputs'),
          shape(R`f_k(\mathbf x),\ \omega_k,\ \bar f(\mathbf x):\ 1\times1`),
        ],
      },
      {
        eq: R`\omega_k=\frac1K\ \Rightarrow\ \bar f(\mathbf x)=\frac1K\sum_{k=1}^{K}f_k(\mathbf x)`,
        notes: [lab('equal weights: a plain average, used on the next slides and in random forests')],
      },
    ],
  },
  {
    id: 'average-error',
    circ: 1,
    title: 'Error of an average predictor',
    why: R`To see when averaging helps we compare two numbers: the average error of the individual learners, and the error of their average. Writing each learner as "truth plus its own error" makes the comparison a calculation.`,
    slides: [slide('L2', 96, 'Error of an average predictor')],
    slideNote: 'The step in row 4 is added.',
    rows: [
      {
        eq: R`\bar f(\mathbf x)=\frac1K\sum_{k=1}^{K}f_k(\mathbf x),\qquad f_k(\mathbf x)=f^*(\mathbf x)+\epsilon_k(\mathbf x)`,
        notes: [
          lab(R`$K$ predictors $f_k(\mathbf x)$ form a committee`),
          lab(R`$f^*(\mathbf x)$ is the true function and $\epsilon_k(\mathbf x)$ the error of predictor $k$`),
        ],
      },
      {
        eq: R`E_k=\mathbb E_{\mathbf x}\big[\epsilon_k(\mathbf x)^2\big],\qquad E_{\text{AV}}=\frac1K\sum_{k=1}^{K}E_k`,
        notes: [
          lab(R`$E_k$: expected squared error of learner $k$; $E_{\text{AV}}$: its average over the $K$ predictors`),
          tag(['C9'], R`the subscript $\mathbf x$: average over inputs`),
        ],
      },
      {
        eq: R`E_{\text{COM}}=\mathbb E_{\mathbf x}\big[(\bar f(\mathbf x)-f^*(\mathbf x))^2\big]`,
        notes: [term('Committee error'), lab('expected squared error of the averaged predictor')],
      },
      {
        eq: R`\bar f-f^*=\frac1K\sum_{k=1}^{K}(f^*+\epsilon_k)-f^*=\frac1K\sum_{k=1}^{K}\epsilon_k`,
        notes: [tag(['I16'], R`$\frac1K\sum_k f^*=f^*$, a constant summed $K$ times`)],
      },
      {
        eq: R`E_{\text{COM}}=\mathbb E_{\mathbf x}\Big[\Big(\frac1K\sum_{k=1}^{K}\epsilon_k(\mathbf x)\Big)^2\Big]`,
        notes: [lab('the error of the average is the average of the errors, squared')],
      },
    ],
  },
  {
    id: 'uncorrelated',
    circ: 2,
    title: 'Uncorrelated errors can average out',
    why: R`If the learners' errors are unrelated, squaring their average kills all the cross-terms, and the committee error falls to $1/K$ of the average individual error. If the errors are shared, nothing cancels. This is why random forests work so hard to make trees different.`,
    slides: [slide('L2', 97, 'Uncorrelated errors can average out')],
    slideNote: R`Rows 2 and 4 show the expansion and the linearity step that the slide combines. The numbers and the "identical errors" callout are added.`,
    pre: [text('Assume zero-mean errors, uncorrelated across different predictors.')],
    rows: [
      {
        eq: R`\mathbb E_{\mathbf x}\big[\epsilon_k(\mathbf x)\,\epsilon_{k'}(\mathbf x)\big]=0\quad\text{for }k\ne k'`,
        notes: [term('Uncorrelated errors'), lab('on average, one learner being too high says nothing about another')],
      },
      {
        eq: R`\Big(\frac1K\sum_k\epsilon_k\Big)^2=\frac1{K^2}\Big(\sum_k\epsilon_k^2+\sum_k\sum_{k'\ne k}\epsilon_k\epsilon_{k'}\Big)`,
        notes: [tag(['I81'], 'expand the square'), con(R`$\frac1{K^2}$ comes out of the square`)],
      },
      {
        eq: R`E_{\text{COM}}=\frac{1}{K^2}\Big(\sum_k\mathbb E_{\mathbf x}[\epsilon_k^2]+\sum_k\sum_{k'\ne k}\mathbb E_{\mathbf x}[\epsilon_k\epsilon_{k'}]\Big)`,
        notes: [tag(['I25'], 'expectation is linear: take it term by term')],
      },
      {
        eq: R`=\frac{1}{K^2}\sum_kE_k=\frac1K\,E_{\text{AV}}`,
        notes: [
          lab(R`cross terms vanish for $k\ne k'$; then $\sum_kE_k=K\,E_{\text{AV}}$`),
          lab('averaging reduces independent variation'),
        ],
      },
      {
        eq: R`K=10,\ E_{\text{AV}}=0.2:\quad E_{\text{COM}}=0.02`,
        notes: [ex('ten learners with unrelated errors: ten times smaller error')],
      },
    ],
    callouts: [
      {
        heading: 'Shared bias remains',
        flag: 'I81',
        text: R`If every learner made the same error, $\epsilon_k=\epsilon$ for all $k$, then the average error is $\epsilon$ again and averaging gains nothing. In practice errors are partly (positively) correlated, so $E_{\text{COM}}$ usually lies between $\tfrac1KE_{\text{AV}}$ and $E_{\text{AV}}$; it never exceeds $E_{\text{AV}}$. A bias shared by all learners (a nonzero mean error) never averages out.`,
        eq: R`\epsilon_k=\epsilon\ \forall k:\quad E_{\text{COM}}=\mathbb E_{\mathbf x}[\epsilon^2]=E_{\text{AV}}`,
      },
    ],
  },
];

export const ensemblesBagging: Topic = {
  id: 'ensembles-bagging',
  title: 'Ensembles and error averaging',
  short: 'Ensembles',
  summary: R`An ensemble averages $K$ base learners, $\bar f=\frac1K\sum_kf_k$. With zero-mean, uncorrelated errors the cross-terms vanish and $E_{\text{COM}}=\frac1KE_{\text{AV}}$; shared errors and bias do not average out.`,
  identities,
  sections,
};

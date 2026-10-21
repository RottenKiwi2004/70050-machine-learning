import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I87',
    area: 'Probability',
    tex: R`\operatorname{Var}\Big[\sum_{k=1}^{K}X_k\Big]=\sum_{k=1}^{K}\operatorname{Var}[X_k]+\sum_{k=1}^{K}\sum_{k'\ne k}\operatorname{Cov}(X_k,X_{k'})`,
    note: R`Variance of a sum: the variances plus every pair's covariance (each pair appears twice). Scalars $X_k$; the result is $1\times1$. If the $X_k$ are uncorrelated, $\operatorname{Cov}=0$ and only the first sum is left, which is I49. Together with I26 ($\operatorname{Var}[aZ]=a^2\operatorname{Var}[Z]$) it gives the variance of an average.`,
  },
];

const sections: Section[] = [
  {
    id: 'committee-variance',
    title: 'A committee can reduce variance',
    why: R`If one learner changes a lot with the training set, ask $K$ learners and average. Their shared part stays; their individual fluctuations partly cancel. This is the whole idea behind bagging and random forests, and the slide shows exactly how much cancels.`,
    slides: [slide('L3', 20, 'A committee can reduce variance')],
    slideNote: R`Diagram: the input $x$ feeds learners $f_1,\dots,f_K$; each output is weighted by $1/K$ and summed at the top node to give $\bar f(x)$. The two equations are on the slide. Rows 2, 3 and 5 (the working, the effect of correlation $\rho$ and the numbers) are added.`,
    derive: true,
    pre: [
      text(R`At input x, average K learners. f_k(x) is learner k's prediction.`),
      text('Averaging models with the same expected prediction leaves their bias unchanged.'),
      text('For uncorrelated fluctuations with equal variance: Var[f̄(x)] = Var[f_k(x)] / K.'),
      text('Positive correlation reduces the gain. We need diverse learners.'),
    ],
    rows: [
      {
        eq: R`\bar f(x)=\frac1K\sum_{k=1}^{K}f_k(x)`,
        notes: [
          term('Committee average'),
          lab(R`$f_k(x)$ is the prediction of learner $k$ at the input $x$; $K$ learners, each with weight $1/K$`),
          shape(R`f_k(x),\ \bar f(x):\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbb E\big[\bar f(x)\big]=\frac1K\sum_{k=1}^{K}\mathbb E\big[f_k(x)\big]=\frac1K\cdot K\,\mu(x)=\mu(x)`,
        notes: [
          tag(['I25'], R`expectation is linear, so the average comes outside`),
          lab(R`each learner has the same expected prediction $\mu(x)$, so the average has it too: bias is unchanged`),
          tag(['I16'], R`$\sum_{k=1}^K\mu(x)=K\mu(x)$, a constant summed $K$ times`),
        ],
      },
      {
        eq: R`\operatorname{Var}\big[\bar f(x)\big]=\operatorname{Var}\Big[\frac1K\sum_{k}f_k\Big]=\frac1{K^2}\operatorname{Var}\Big[\sum_{k}f_k\Big]`,
        notes: [tag(['I26'], R`$\operatorname{Var}[aZ]=a^2\operatorname{Var}[Z]$ with $a=\frac1K$, so the factor comes out squared`)],
      },
      {
        eq: R`=\frac1{K^2}\sum_{k=1}^{K}\operatorname{Var}[f_k]+0=\frac1{K^2}\cdot K\operatorname{Var}[f_k]=\frac{\operatorname{Var}[f_k(x)]}{K}`,
        notes: [
          tag(['I49', 'I87'], R`uncorrelated fluctuations: the covariances are 0, so the variances just add`),
          lab('equal variance: all K terms are the same number'),
        ],
      },
      {
        eq: R`\operatorname{Cov}(f_k,f_{k'})=\rho\,\sigma^2\ (k\ne k')\ \Rightarrow\ \operatorname{Var}[\bar f]=\frac{1}{K^2}\Big[K\sigma^2+K(K-1)\rho\sigma^2\Big]=\sigma^2\Big[\rho+\frac{1-\rho}{K}\Big]`,
        notes: [
          tag(['I87'], R`now every one of the $K(K-1)$ ordered pairs contributes $\rho\sigma^2$; $\sigma^2=\operatorname{Var}[f_k]$ and $\rho$ is the correlation between two learners`),
          lab(R`algebra: $\frac{K\sigma^2+K(K-1)\rho\sigma^2}{K^2}=\frac{\sigma^2}{K}+\frac{(K-1)\rho\sigma^2}{K}=\sigma^2\big(\rho+\frac{1-\rho}{K}\big)$`),
          warn(R`as $K\to\infty$ the variance falls only to $\rho\sigma^2$, not to 0: positive correlation caps the gain`),
        ],
      },
      {
        eq: R`K=10,\ \sigma^2=0.5:\quad\rho=0:\ \frac{0.5}{10}=0.05;\qquad\rho=0.5:\ 0.5\Big[0.5+\frac{0.5}{10}\Big]=0.275`,
        notes: [ex(R`ten uncorrelated learners cut the variance tenfold; at $\rho=0.5$ the same ten learners only halve it (0.5 → 0.275)`)],
      },
    ],
    callouts: [
      {
        heading: 'Why forests randomise',
        flag: 'I87',
        text: R`The variance floor $\rho\sigma^2$ is why bagging is not enough: trees trained on overlapping bootstrap samples are positively correlated. Random forests also randomise the features each split may use, to push $\rho$ down (slides 24 and 26).`,
      },
    ],
  },
  {
    id: 'error-of-average',
    circ: 1,
    title: 'Error of an average predictor',
    why: R`The same fact seen through errors instead of variances: write every learner as "truth plus its own error", then compare the average error of the individuals with the error of their average.`,
    slides: [slide('L3', 21, 'Error of an average predictor (non-examinable)')],
    slideNote: R`Non-examinable. Identical to Lecture 2 slide 96, derived in file 26 (rows 1 to 5 there). The slide defines $f_k=f^*+\epsilon_k$, $E_k=\mathbb E_{\mathbf x}[\epsilon_k^2]$, $E_{\text{AV}}=\frac1K\sum_kE_k$ and $E_{\text{COM}}=\mathbb E_{\mathbf x}[(\bar f-f^*)^2]$, then reduces $E_{\text{COM}}$ to $\mathbb E_{\mathbf x}[(\frac1K\sum_k\epsilon_k)^2]$.`,
    derive: true,
    rows: [
      {
        eq: R`f_k(\mathbf x)=f^*(\mathbf x)+\epsilon_k(\mathbf x),\qquad E_k=\mathbb E_{\mathbf x}\big[\epsilon_k(\mathbf x)^2\big],\qquad E_{\text{AV}}=\frac1K\sum_{k=1}^{K}E_k`,
        notes: [
          lab(R`$f^*$ true function; $\epsilon_k$ the error of predictor $k$; $E_k$ its expected squared error; $E_{\text{AV}}$ the average of those over the $K$ predictors`),
          tag(['C9'], R`$\mathbb E_{\mathbf x}$ averages over inputs`),
        ],
      },
      {
        eq: R`\bar f-f^*=\frac1K\sum_{k=1}^{K}(f^*+\epsilon_k)-f^*=\frac1K\sum_{k=1}^{K}\epsilon_k`,
        notes: [tag(['I16'], R`$\frac1K\sum_kf^*=f^*$`), lab('the error of the average is the average of the errors')],
      },
      {
        eq: R`E_{\text{COM}}=\mathbb E_{\mathbf x}\big[(\bar f(\mathbf x)-f^*(\mathbf x))^2\big]=\mathbb E_{\mathbf x}\Big[\Big(\frac1K\sum_{k=1}^{K}\epsilon_k(\mathbf x)\Big)^2\Big]`,
        notes: [term('Committee error'), lab(R`the quantity to compare with $E_{\text{AV}}$`)],
      },
    ],
  },
  {
    id: 'uncorrelated-errors',
    circ: 2,
    title: 'Uncorrelated errors can average out',
    why: R`Squaring a sum of errors produces squares and cross-terms. If errors are uncorrelated and zero-mean, every cross-term averages to zero and the committee error is $E_{\text{AV}}/K$. Shared errors do not cancel.`,
    slides: [slide('L3', 22, 'Uncorrelated errors can average out (non-examinable)')],
    slideNote: R`Non-examinable. Identical to Lecture 2 slide 97, with the full working in file 26. The slide gives $\mathbb E_{\mathbf x}[\epsilon_k\epsilon_{k'}]=0$ for $k\ne k'$, expands the square and ends with $E_{\text{COM}}=\frac1{K^2}\sum_kE_k=\frac1KE_{\text{AV}}$. Caption: "Averaging reduces independent variation. Shared bias remains."`,
    derive: true,
    pre: [text('Assume zero-mean errors, uncorrelated across different predictors.')],
    rows: [
      {
        eq: R`\mathbb E_{\mathbf x}\big[\epsilon_k(\mathbf x)\epsilon_{k'}(\mathbf x)\big]=0\quad(k\ne k')`,
        notes: [lab('uncorrelated, zero-mean errors: one learner being too high says nothing about another')],
      },
      {
        eq: R`\Big(\frac1K\sum_k\epsilon_k\Big)^2=\frac1{K^2}\Big(\sum_k\epsilon_k^2+\sum_k\sum_{k'\ne k}\epsilon_k\epsilon_{k'}\Big)`,
        notes: [tag(['I81'], 'expand the square of a sum: squares plus cross-terms')],
      },
      {
        eq: R`E_{\text{COM}}=\frac1{K^2}\Big(\sum_k\mathbb E_{\mathbf x}[\epsilon_k^2]+\sum_k\sum_{k'\ne k}\mathbb E_{\mathbf x}[\epsilon_k\epsilon_{k'}]\Big)=\frac1{K^2}\Big(\sum_kE_k+0\Big)`,
        notes: [tag(['I25'], 'expectation is linear: apply it term by term'), lab('the cross-terms vanish by the assumption in row 1')],
      },
      {
        eq: R`=\frac1{K^2}\cdot K\,E_{\text{AV}}=\frac1K\,E_{\text{AV}}`,
        notes: [lab(R`$\sum_kE_k=K\,E_{\text{AV}}$ by the definition of $E_{\text{AV}}$`), ex(R`$K=10$, $E_{\text{AV}}=0.2$ gives $E_{\text{COM}}=0.02$`)],
      },
    ],
    callouts: [
      {
        heading: 'Shared bias remains',
        text: R`If every learner makes the same error, $\epsilon_k=\epsilon$ for all $k$, then $E_{\text{COM}}=E_{\text{AV}}$ and averaging gains nothing. A nonzero mean error (bias) is common to all learners and never averages out, which is why this part of the lecture is about reducing variance, not bias.`,
      },
    ],
  },
];

export const committeeAveraging: Topic = {
  id: 'committee-averaging',
  title: 'A committee of learners: averaging reduces variance',
  short: 'Committees',
  summary: R`The average of $K$ learners keeps the bias and, for uncorrelated learners, divides the variance by $K$: $\operatorname{Var}[\bar f]=\sigma^2[\rho+(1-\rho)/K]$ with correlation $\rho$. Equivalently $E_{\text{COM}}=E_{\text{AV}}/K$ for uncorrelated errors. Diverse learners are needed.`,
  identities,
  sections,
};

import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'appendix-bv-curve',
    title: 'Appendix: bias and variance, the complexity curve',
    why: R`The main lecture explained bias and variance in words and pictures (file 35). The appendix makes the picture exact: the expected squared error at one input splits into three non-negative pieces, and this is what the U-shaped curve is plotting. These appendix slides are optional; the decomposition and risk slides are marked "Non-examinable".`,
    slides: [
      slide('L3', 107, 'Appendix: bias and variance (divider)'),
      slide('L3', 108, 'Bias-variance decomposition'),
    ],
    slideNote: R`Slide 107 is the appendix divider. It lists the appendix topics (Bias and variance; Forest applications; Historical context; Kernels and margins; Softmax and cross-entropy; Computation graphs) and, for this part, "Risk and generalisation", "Averaging over training datasets" and "Bias–variance decomposition". Reading: K. Murphy (2022), §§4.3, 4.7.6, "Empirical risk and the bias–variance tradeoff". Slide 108: a schematic plot, error (vertical) against model complexity (horizontal). The red Bias$^2$ curve falls from high to low as complexity grows. The cyan Variance curve starts near zero and rises steeply on the right. The black Total Error curve is U-shaped, and a dotted vertical line marks the "Optimum Model Complexity" at its minimum, where the other two curves cross. Caption: "Schematic; noise is not shown."`,
    derive: true,
    pre: [
      text('Optional appendix material.'),
      text('Schematic; noise is not shown.'),
    ],
    rows: [
      {
        eq: R`\text{Total error}\ \ \approx\ \ \text{bias}^2+\text{variance}\qquad(+\ \text{noise, a constant not shown on the plot})`,
        notes: [
          lab(R`as complexity grows, $\text{bias}^2$ decreases (more flexible model family) and variance increases (more sensitivity to which training set we got). The sum is U-shaped`),
          lab('the optimum model complexity is where the total is smallest, not where either term alone is smallest'),
          lab('exact version: slide 110, in the decomposition section below'),
          shape(R`\text{all terms}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'empirical-population-risk',
    circ: 1,
    title: 'Empirical risk versus population risk',
    why: R`We train on a finite sample but care about performance on future data. Two different averages therefore appear: one over the training set we have (computable) and one over the data distribution (what we actually want, not computable). Learning is the attempt to make the first a good stand-in for the second.`,
    slides: [slide('L3', 109, 'Empirical risk vs population risk')],
    slideNote: R`Marked "Non-examinable". Setup: the training set $\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^N$ and the squared loss $\ell(y,\hat y)=(y-\hat y)^2$. "Training risk: mean squared error on the training set": $\hat R_{\text{train}}(f)=\frac1N\sum_{i=1}^N\ell(y_i,f(\mathbf x_i))$. "Empirical risk minimization": $\hat f_{\mathcal D}\in\arg\min_{f\in\mathcal F}\hat R_{\text{train}}(f)$. "Population risk": $R(f)=\mathbb E_{(\mathbf X,Y)\sim P}[\ell(Y,f(\mathbf X))]=\iint\ell(y,f(\mathbf x))\,p(\mathbf x,y)\,dy\,d\mathbf x$. Notes: "$\mathcal F$: candidate function class. Subscript $\mathcal D$: the training set used for this fit. $p(\mathbf x,y)$: joint density for continuous inputs and targets."`,
    derive: true,
    pre: [
      text('F: candidate function class.'),
      text('Subscript D: the training set used for this fit.'),
      text('p(x, y): joint density for continuous inputs and targets.'),
    ],
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N},\qquad\ell(y,\hat y)=(y-\hat y)^2`,
        notes: [
          lab('N training pairs; the loss is the squared error of a single prediction'),
          shape(R`\mathbf x_i:\ D\times1;\ y_i,\hat y,\ell:\ 1\times1`),
        ],
      },
      {
        eq: R`\hat R_{\text{train}}(f)=\frac1N\sum_{i=1}^{N}\ell\big(y_i,f(\mathbf x_i)\big)`,
        notes: [
          term('Training risk (empirical risk)'),
          lab('the mean squared error of f on the N training examples; computable'),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\hat f_{\mathcal D}\in\operatorname*{arg\,min}_{f\in\mathcal F}\hat R_{\text{train}}(f)`,
        notes: [
          term('Empirical risk minimisation (ERM)'),
          lab(R`$\mathcal F$ is the function class (e.g. linear functions of features, or trees of bounded depth). $\hat f_{\mathcal D}$ is a function that depends on the training set: a different $\mathcal D$ gives a different $\hat f_{\mathcal D}$, which is why it has a variance (slide 110)`),
          lab(R`the symbol $\in$ (not $=$): the minimiser may be non-unique`),
        ],
      },
      {
        eq: R`R(f)=\mathbb E_{(\mathbf X,Y)\sim P}\big[\ell(Y,f(\mathbf X))\big]=\iint\ell\big(y,f(\mathbf x)\big)\,p(\mathbf x,y)\,\mathrm dy\,\mathrm d\mathbf x`,
        notes: [
          term('Population risk'),
          tag(['I56'], R`expectation of a function of the pair $(\mathbf X,Y)$ is the integral of the function against the joint density`),
          lab('the expected loss on a fresh pair drawn from the same source. Not computable, because P is unknown'),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\hat R_{\text{train}}(f)=\frac1N\sum_{i=1}^N\ell\big(y_i,f(\mathbf x_i)\big)\ \xrightarrow{\ \text{fixed }f,\ \mathcal D\sim P^N\ }\ \mathbb E\big[\hat R_{\text{train}}(f)\big]=R(f)`,
        notes: [
          tag(['I57'], R`for a fixed $f$ the training risk is an average of $N$ identically distributed terms, so its mean is the population risk`),
          warn(R`this holds only for an $f$ chosen before seeing $\mathcal D$. $\hat f_{\mathcal D}$ was chosen to make $\hat R_{\text{train}}$ small, so $\hat R_{\text{train}}(\hat f_{\mathcal D})$ is typically below $R(\hat f_{\mathcal D})$ (optimistic). This is why we validate on held-out data (Lecture 1)`),
        ],
      },
      {
        eq: R`N=3,\ y=(1,2,3),\ f(\mathbf x_i)=(1.5,\,2,\,2.5):\ \ \hat R_{\text{train}}=\tfrac13\big[(-0.5)^2+0^2+0.5^2\big]=\tfrac13(0.5)\approx0.167`,
        notes: [ex('a tiny numeric training risk'), shape(R`1\times1`)],
      },
    ],
  },
  {
    id: 'bv-decomposition',
    circ: 2,
    title: 'Bias–variance decomposition at one input',
    why: R`This is the exact statement behind the intuition: for a fixed input $x$, the expected squared error of a fitted model, averaged over training sets and over noise, equals bias$^2$ plus variance plus noise. Seeing why the cross-terms vanish tells you precisely which assumptions the decomposition needs.`,
    slides: [slide('L3', 110, 'Bias-variance decomposition at one input')],
    slideNote: R`Marked "Non-examinable". Model: $Y=f^*(x)+\epsilon$, $\mathbb E[\epsilon\mid x]=0$, $\mathbb E[\epsilon^2\mid x]=\sigma^2(x)$; "$m(x)$: mean fitted prediction over training datasets". "Add and subtract the true mean and the mean fit": $Y-\hat f_{\mathcal D}(x)=\underbrace{f^*(x)-m(x)}_{\text{mean error}}+\underbrace{m(x)-\hat f_{\mathcal D}(x)}_{\text{fit fluctuation}}+\epsilon$. "Cross-terms vanish: the fluctuations have mean zero, noise is independent of the fitted predictor": $\mathbb E_{\mathcal D}[m(x)-\hat f_{\mathcal D}(x)]=0$, $\mathbb E[\epsilon\mid x]=0$. Result: $\mathbb E_{\mathcal D,Y}[(Y-\hat f_{\mathcal D}(x))^2\mid X=x]=\underbrace{(m(x)-f^*(x))^2}_{\text{bias}^2}+\underbrace{\mathbb E_{\mathcal D}[(\hat f_{\mathcal D}(x)-m(x))^2]}_{\text{variance}}+\underbrace{\sigma^2(x)}_{\text{noise}}$. Footnote: "Target noise $\epsilon$ is independent of the training data. $\sigma^2(x)$ is noise variance at $x$." The same derivation was done for Lecture 1 in file 13; here the pieces are named.`,
    derive: true,
    pre: [
      text('m(x): mean fitted prediction over training datasets.'),
      text('Cross-terms vanish: the fluctuations have mean zero, noise is independent of the fitted predictor.'),
      text('Target noise ε is independent of the training data. σ²(x) is noise variance at x.'),
    ],
    rows: [
      {
        eq: R`Y=f^*(x)+\epsilon,\qquad\mathbb E[\epsilon\mid x]=0,\qquad\mathbb E[\epsilon^2\mid x]=\sigma^2(x)`,
        notes: [
          lab(R`the target at input $x$ is a true mean $f^*(x)=\mathbb E[Y\mid X=x]$ plus zero-mean noise of variance $\sigma^2(x)$; the noise is irreducible`),
          shape(R`Y,\ f^*(x),\ \epsilon,\ \sigma^2(x):\ 1\times1`),
        ],
      },
      {
        eq: R`m(x)=\mathbb E_{\mathcal D}\big[\hat f_{\mathcal D}(x)\big]`,
        notes: [
          term('Mean fit'),
          lab(R`the prediction at $x$ averaged over all training sets of size $N$ (what "averaging over datasets" means, slide 111)`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`Y-\hat f_{\mathcal D}(x)=\underbrace{\big(f^*(x)-m(x)\big)}_{a:\ \text{mean error (a fixed number)}}+\underbrace{\big(m(x)-\hat f_{\mathcal D}(x)\big)}_{b:\ \text{fit fluctuation (random through }\mathcal D)}+\underbrace{\epsilon}_{\text{noise}}`,
        notes: [
          lab(R`add and subtract $f^*(x)$ and $m(x)$: the three terms telescope back to $Y-\hat f_{\mathcal D}$ (check: $f^*-m+m-\hat f+\epsilon=f^*-\hat f+\epsilon=Y-\hat f$)`),
          lab(R`$a$ is not random (it involves only $f^*$ and $m$); $b$ changes with the training set; $\epsilon$ is the noise of the target`),
        ],
      },
      {
        eq: R`\big(Y-\hat f_{\mathcal D}(x)\big)^2=a^2+b^2+\epsilon^2+2ab+2a\epsilon+2b\epsilon`,
        notes: [tag(['I60'], R`square of a three-term sum`), shape(R`\text{all}:\ 1\times1`)],
      },
      {
        eq: R`\mathbb E_{\mathcal D,Y}\Big[\big(Y-\hat f_{\mathcal D}(x)\big)^2\Big]=a^2+\mathbb E[b^2]+\mathbb E[\epsilon^2]+2a\,\mathbb E[b]+2a\,\mathbb E[\epsilon]+2\,\mathbb E[b\epsilon]`,
        notes: [
          tag(['I25', 'I58'], R`take the expectation term by term; $a$ is a constant, so it comes out of the expectations ($\mathbb E[a^2]=a^2$, $\mathbb E[2ab]=2a\mathbb E[b]$)`),
        ],
      },
      {
        eq: R`\mathbb E_{\mathcal D}[b]=\mathbb E_{\mathcal D}\big[m(x)-\hat f_{\mathcal D}(x)\big]=m(x)-m(x)=0,\qquad\mathbb E[\epsilon\mid x]=0,\qquad\mathbb E[b\epsilon]=\mathbb E[b]\,\mathbb E[\epsilon]=0`,
        notes: [
          tag(['I25', 'I58', 'I61'], R`the fluctuation has mean zero by the definition of $m$; the noise has mean zero by assumption; and $b$ (a function of the training data) is independent of $\epsilon$ (the target noise), so the mean of the product is the product of the means`),
          warn(R`independence of the noise and the training data is a real assumption here, and so is "same noise variance on the test point". If the test noise depended on $\mathcal D$ the cross-term $2b\epsilon$ would not vanish`),
        ],
      },
      {
        eq: R`\mathbb E_{\mathcal D,Y}\Big[\big(Y-\hat f_{\mathcal D}(x)\big)^2\ \Big|\ X=x\Big]=\underbrace{\big(m(x)-f^*(x)\big)^2}_{\text{bias}^2}+\underbrace{\mathbb E_{\mathcal D}\Big[\big(\hat f_{\mathcal D}(x)-m(x)\big)^2\Big]}_{\text{variance}}+\underbrace{\sigma^2(x)}_{\text{noise}}`,
        notes: [
          tag(['I59'], R`$\mathbb E[b^2]=\mathbb E[(m-\hat f)^2]$ is the variance of $\hat f_{\mathcal D}(x)$ over training sets, since $m$ is its mean; $a^2=(f^*-m)^2=(m-f^*)^2$; $\mathbb E[\epsilon^2]=\sigma^2$`),
          lab(R`bias$^2$: the mean fit is off from the truth, even with infinitely many datasets. Variance: single fits scatter around the mean fit. Noise: nothing can remove it`),
          shape(R`\text{every term}:\ 1\times1,\ \ge0`),
        ],
      },
      {
        eq: R`f^*=1,\ \ \hat f_{\mathcal D}\in\{0.4,0.5,0.7,0.8\},\ \ \sigma^2=0.09:\quad m=0.6,\ \text{bias}^2=0.16,\ \text{variance}=0.025,\ \text{total}=0.16+0.025+0.09=0.275`,
        notes: [
          ex(R`four equally likely training sets. $m=\tfrac14(0.4+0.5+0.7+0.8)=0.6$. Variance $=\tfrac14\big[(-0.2)^2+(-0.1)^2+0.1^2+0.2^2\big]=\tfrac14(0.10)=0.025$`),
          ex(R`direct check: for each fit, $\mathbb E_\epsilon[(Y-\hat f)^2]=(1-\hat f)^2+0.09$, so the average is $\tfrac14(0.36+0.25+0.09+0.04)+0.09=0.185+0.09=0.275$. ✓`),
          shape(R`\text{scalars}:\ 1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Two expectations, two kinds of randomness',
        text: R`$\mathbb E_{\mathcal D}$ averages over which training set we happened to collect (this creates variance). The expectation over $\epsilon$ averages over the noise in the new target (this creates the noise term). Bias has no randomness at all: it compares two fixed functions, $m$ and $f^*$, at the same $x$.`,
      },
    ],
  },
  {
    id: 'averaging-over-datasets',
    circ: 3,
    title: 'What does "averaging over datasets" mean?',
    why: R`The decomposition above averages over training sets, which we never actually do in practice (we have one). This slide shows the thought experiment concretely: collect many datasets, fit each, and look at the cloud of fitted curves and its average.`,
    slides: [slide('L3', 111, 'What does "averaging over datasets" mean?')],
    slideNote: R`Marked "Non-examinable". Text: "Repeat collecting $N$ examples from the same source and refitting. Keep the function class and ridge strength $\lambda$ fixed within each plot." Two plots of $y$ against $x\in[-1,1]$. Left, "Weak ridge: $\lambda=0.0001$": many grey fitted curves wiggle widely, especially near the ends, around a red mean-fit curve that follows the green true curve $f^*$ (a sine-like wave) closely. Right, "Strong ridge: $\lambda=10$": the grey fits are nearly identical, flat, and close to the red mean curve, which is much smaller in amplitude than the green true curve, so the red curve is far from the green one. Caption: "At scalar input $x$: grey fits, red mean fit $m(x)$, green true mean $f^*(x)$." Formulas: $m(x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(x)]$, $f^*(x)=\mathbb E[Y\mid X=x]$. "E with subscript D averages training sets. Here: fixed inputs, fresh noisy targets. With random inputs, resample those too."`,
    derive: true,
    pre: [
      text('Repeat collecting N examples from the same source and refitting.'),
      text('Keep the function class and ridge strength λ fixed within each plot.'),
      text('Here: fixed inputs, fresh noisy targets. With random inputs, resample those too.'),
    ],
    rows: [
      {
        eq: R`m(x)=\mathbb E_{\mathcal D}\big[\hat f_{\mathcal D}(x)\big],\qquad f^*(x)=\mathbb E[Y\mid X=x]`,
        notes: [
          lab(R`$m$: the red curve, the pointwise average of the grey fitted curves; $f^*$: the green curve, the true conditional mean`),
          lab(R`in a plot, bias at $x$ is the vertical gap between red and green; variance at $x$ is the vertical spread of the grey curves around the red one`),
          shape(R`m(x),\ f^*(x):\ 1\times1\ (\text{scalar input }x)`),
        ],
      },
      {
        eq: R`\underbrace{\lambda=10^{-4}}_{\text{weak ridge}}:\ \text{low bias, high variance}\qquad\qquad\underbrace{\lambda=10}_{\text{strong ridge}}:\ \text{high bias, low variance}`,
        notes: [
          lab(R`ridge shrinks the weights toward 0 (Lecture 1): a larger $\lambda$ makes the fit stiffer and less dependent on the sample, but also pulls it away from the truth`),
          lab(R`so $\lambda$ is the complexity knob of slide 108, running the other way: small $\lambda$ = high complexity`),
        ],
      },
    ],
  },
];

export const biasVarianceRisk: Topic = {
  id: 'bias-variance-risk',
  title: 'Appendix: bias, variance and risk',
  short: 'Bias–variance & risk',
  summary: R`Population risk $R(f)=\mathbb E[\ell(Y,f(X))]$ versus training risk $\hat R_{\text{train}}(f)=\frac1N\sum\ell(y_i,f(x_i))$. At one input: $\mathbb E[(Y-\hat f_{\mathcal D})^2]=(m-f^*)^2+\mathbb E[(\hat f_{\mathcal D}-m)^2]+\sigma^2$, with $m=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}]$. Weak ridge: low bias, high variance; strong ridge: the reverse.`,
  identities: [],
  sections,
};

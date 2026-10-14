import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'appendix-map',
    title: 'What the appendix contains',
    why: R`The last part of the deck mixes derivations for this lecture with eleven slides repeated from Lecture 1. Knowing where each one is written up saves re-reading the same material twice.`,
    slides: [slide('L2', 145, 'Appendix (section divider)')],
    slideNote: 'The divider lists the appendix contents. The mapping to topic files is added.',
    pre: [
      term('Further derivations and Lecture 1 reference material'),
      text('Signed-label probabilities: slide 146, in "Logistic regression and the log-loss".'),
      text('Newton–Raphson for logistic regression, summation and matrix expressions, IRLS: slides 147 to 149, in "Newton–Raphson and curvature".'),
      text('Multiclass objective: slide 150, in "Multiclass classification and softmax".'),
      text('Lecture 1 reference: slides 151 to 161, below. They repeat deck II slides 40 to 50 and are worked in full in the Lecture 1 topic "Generalisation: risk and bias–variance".'),
      text('Recaps: slide 162 (binary objective) in the logistic topic, 163 (mean objective) in SGD, 164 (node splits) in decision trees, 165 and 166 (forests) in random forests.'),
      text('Reading list and notation: slides 167 to 169, in "Lecture 2 symbol glossary".'),
    ],
    rows: [],
  },
  {
    id: 'expectation',
    title: 'Expectation and a sample average',
    why: R`Every risk is an average of a loss: the true average uses the unknown distribution, a sample average uses data. This distinction is behind training, validation and test error.`,
    slides: [slide('L2', 151, 'Expectation and a sample average'), slide('II', 40, 'Expectation and a sample average')],
    pre: [text(R`$Z$ has density $p(z)$. $\psi(z)$ is a quantity computed from a value $z$.`)],
    rows: [
      {
        eq: R`\mathbb E[\psi(Z)]=\int\psi(z)\,p(z)\,dz`,
        notes: [lab('distribution: average over possible values'), tag(['I56'], 'expectation of a function of a random variable')],
      },
      {
        eq: R`\widehat{\mathbb E}[\psi(Z)]=\frac1N\sum_{i=1}^{N}\psi(z_i)`,
        notes: [
          lab(R`sample: estimate from $N$ independent observations $z_i$ of $Z$`),
          tag(['I57', 'C8'], 'the hat marks an estimate; it is right on average'),
          ex(R`with $\psi(z)=z$ this is the sample mean`),
        ],
      },
    ],
  },
  {
    id: 'erm',
    title: 'Recall: empirical risk in regression',
    why: R`Fitting is choosing the function with the smallest average training loss. Classification uses the same recipe with the log-loss in place of the squared loss.`,
    slides: [slide('L2', 152, 'Recall: empirical risk in regression'), slide('II', 41, 'Empirical risk minimisation')],
    pre: [
      text(R`Training set $\mathcal D$: $N$ pairs with input $\mathbf x_i$ and target $y_i$, indexed by $i$.`),
      text(R`$f$ predicts a target; $\hat y$ is a prediction. $\ell$ is the squared loss.`),
    ],
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N},\qquad\ell(y,\hat y)=(y-\hat y)^2`,
        notes: [shape(R`\mathbf x_i:\ D\times1\ \text{(or }(D+1)\times1\text{ with the 1)},\quad y_i,\hat y:\ 1\times1`)],
      },
      {
        eq: R`\hat R_{\text{train}}(f)=\frac1N\sum_{i=1}^{N}\ell(y_i,f(\mathbf x_i))`,
        notes: [term('Training risk'), lab('mean squared error on the training set')],
      },
      {
        eq: R`\hat f_{\mathcal D}\in\arg\min_{f\in\mathcal F}\hat R_{\text{train}}(f)`,
        notes: [
          term('ERM: empirical risk minimisation'),
          lab(R`$\mathcal F$: candidate function class; arg min selects a minimiser; subscript $\mathcal D$: the training set used for this fit`),
          tag(['C3'], 'arg min is a set, hence "∈"'),
        ],
      },
    ],
  },
  {
    id: 'population-risk',
    title: 'Population risk: the quantity we care about',
    why: R`What we really want is low loss on new cases from the real world, not on the training set. That is the population risk, which we cannot compute because the real-world distribution is unknown.`,
    slides: [slide('L2', 153, 'Population risk: the quantity we care about'), slide('II', 42, 'Population risk: the quantity we care about')],
    pre: [
      text(R`$P$: real-world distribution. $(\mathbf X,Y)$: a fresh pair, independent of training. Hold the fitted function fixed. $R(f)$ is its population risk.`),
      warn('The population distribution is unknown. Validation data will estimate unseen performance.'),
    ],
    rows: [
      {
        eq: R`R(f)=\mathbb E_{(\mathbf X,Y)\sim P}\big[\ell(Y,f(\mathbf X))\big]=\iint\ell(y,f(\mathbf x))\,p(\mathbf x,y)\,\mathrm dy\,\mathrm d\mathbf x`,
        notes: [
          term('Population risk'),
          lab(R`$p(\mathbf x,y)$: joint density for continuous inputs and targets; the integral averages loss over real-world cases`),
          tag(['I56', 'C9'], 'expectation over a fresh pair'),
        ],
      },
    ],
  },
  {
    id: 'validation',
    title: 'Validation estimates unseen performance',
    why: R`Fresh labelled data that the model never saw gives an honest, unbiased estimate of the population risk of the fitted model. That is why thresholds and settings are chosen on validation data.`,
    slides: [slide('L2', 154, 'Validation estimates unseen performance'), slide('II', 43, 'Validation estimates unseen performance')],
    pre: [
      text(R`Reserve fresh validation pairs from the same population. $\mathcal V$: validation sample; $N_{\text{val}}$: its size; superscript val marks its values.`),
      text('Use validation to choose complexity. Keep test data for final assessment.'),
    ],
    rows: [
      {
        eq: R`\mathcal V=\{(\mathbf x_i^{\text{val}},y_i^{\text{val}})\}_{i=1}^{N_{\text{val}}}`,
        notes: [],
      },
      {
        eq: R`\hat R_{\text{val}}(\hat f_{\mathcal D})=\frac{1}{N_{\text{val}}}\sum_{i=1}^{N_{\text{val}}}\ell\big(y_i^{\text{val}},\hat f_{\mathcal D}(\mathbf x_i^{\text{val}})\big)`,
        notes: [lab('evaluate the trained predictor without refitting it')],
      },
      {
        eq: R`\mathbb E_{\mathcal V}\big[\hat R_{\text{val}}(\hat f_{\mathcal D})\mid\mathcal D\big]=R(\hat f_{\mathcal D})`,
        notes: [
          lab('hold the training set and the fitted model fixed'),
          tag(['I57', 'C9'], R`$\mathbb E_{\mathcal V}$ averages validation samples, before model selection`),
          warn('once validation is used to choose among models, its score for the chosen model is optimistic: keep a separate test set'),
        ],
      },
    ],
  },
  {
    id: 'degree',
    title: 'Training fit and unseen predictions',
    why: 'The classic picture of overfitting in numbers: the most flexible polynomial has the smallest training error and the largest validation error.',
    slides: [slide('L2', 155, 'Training fit and unseen predictions'), slide('II', 44, 'Training fit and unseen predictions')],
    slideNote: 'Figure: polynomial fits of degree 1, 3 and 14 to the same data. Grey points: training data. Blue: fitted predictor. Green: true mean.',
    rows: [
      {
        eq: R`\begin{array}{c|ccc}\text{Degree} & 1 & 3 & 14\\ \hline\text{Train MSE} & 0.305 & 0.029 & 0.002\\ \text{Validation MSE} & 0.245 & 0.057 & 0.485\end{array}`,
        notes: [
          lab('same training set and 200 independent validation pairs for every model'),
          warn('the most flexible model wins on training error, but loses on validation'),
          ex('degree 3 has the lowest validation MSE: the one to choose'),
        ],
      },
    ],
  },
  {
    id: 'datasets',
    title: 'What does "averaging over datasets" mean?',
    why: R`Bias and variance describe what happens if we could repeat the whole experiment many times: collect a new training set, refit, compare. The average fit shows the bias; the spread of the fits shows the variance.`,
    slides: [slide('L2', 156, 'What does “averaging over datasets” mean?'), slide('II', 45, 'What does “averaging over datasets” mean?')],
    slideNote: R`Figure: weak ridge ($\lambda=0.0001$): grey fits wiggle a lot but their red mean follows the green truth; strong ridge ($\lambda=10$): grey fits are almost identical and flat, and their mean misses the truth.`,
    pre: [
      text('Repeat collecting N examples from the same source and refitting. Keep the function class and ridge strength λ fixed within each plot.'),
      text('Here: fixed inputs, fresh noisy targets. With random inputs, resample those too.'),
    ],
    rows: [
      {
        eq: R`m(x)=\mathbb E_{\mathcal D}\big[\hat f_{\mathcal D}(x)\big],\qquad f^*(x)=\mathbb E[Y\mid X=x]`,
        notes: [
          lab(R`at scalar input $x$: grey fits, red mean fit $m(x)$, green true mean $f^*(x)$`),
          tag(['C9'], R`$\mathbb E_{\mathcal D}$ averages training sets`),
          lab('weak ridge: low bias, high variance; strong ridge: low variance, high bias'),
        ],
      },
    ],
  },
  {
    id: 'bias-variance',
    title: 'Bias–variance decomposition',
    why: R`The expected squared error of a learning method splits into three parts we can reason about separately: how wrong it is on average (bias), how much it changes with the data (variance), and the noise no method can remove.`,
    slides: [
      slide('L2', 157, 'Bias–variance decomposition at one input'),
      slide('L2', 158, 'Bias–variance explains population risk'),
      slide('II', 46, 'Bias–variance decomposition at one input'),
      slide('II', 47, 'Bias–variance explains population risk'),
    ],
    nonExaminable: true,
    slideNote: 'Labelled non-examinable on the slides. The full derivation, with every identity, is in the Lecture 1 generalisation topic.',
    pre: [text(R`Fix $x$. Fresh target noise $\epsilon$ is independent of the training data. $\sigma^2(x)$ is the noise variance at $x$. Keep the training method fixed.`)],
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`Y=f^*(x)+\epsilon,\qquad\mathbb E[\epsilon\mid x]=0,\qquad\mathbb E[\epsilon^2\mid x]=\sigma^2(x)`,
        notes: [],
      },
      {
        eq: R`Y-\hat f_{\mathcal D}(x)=\underbrace{f^*(x)-m(x)}_{\text{mean error}}+\underbrace{m(x)-\hat f_{\mathcal D}(x)}_{\text{fit fluctuation}}+\epsilon`,
        notes: [lab('add and subtract the true mean and the mean fit')],
      },
      {
        eq: R`\mathbb E_{\mathcal D}\big[m(x)-\hat f_{\mathcal D}(x)\big]=0,\qquad\mathbb E[\epsilon\mid x]=0`,
        notes: [
          lab('square and average; cross-terms vanish: the fluctuations have mean zero, and fresh noise is independent of the fitted predictor'),
          tag(['I60', 'I25', 'I61'], 'expand the square of three terms, take expectations term by term'),
        ],
      },
      {
        eq: R`\mathbb E_{\mathcal D,Y}\big[(Y-\hat f_{\mathcal D}(x))^2\mid X=x\big]=\underbrace{(m(x)-f^*(x))^2}_{\text{bias}^2}+\underbrace{\mathbb E_{\mathcal D}\big[(\hat f_{\mathcal D}(x)-m(x))^2\big]}_{\text{variance}}+\underbrace{\sigma^2(x)}_{\text{noise}}`,
        notes: [term('Bias–variance decomposition')],
      },
      {
        eq: R`\mathbb E_{\mathcal D}\big[R(\hat f_{\mathcal D})\big]=\mathbb E_{\mathbf X}\big[\text{bias}^2(\mathbf X)+\text{variance}(\mathbf X)+\text{noise}(\mathbf X)\big]`,
        notes: [
          lab('average these terms over real-world inputs X; this connects the fixed-input decomposition to population risk'),
          tag(['I62'], 'tower rule: average at each input, then over inputs'),
          warn('bias–variance describes average risk as the training sample changes; validation estimates risk for the fitted model obtained from one sample'),
        ],
      },
    ],
  },
  {
    id: 'ridge-experiment',
    title: 'A controlled ridge experiment',
    why: R`With simulated data the true function is known, so bias, variance and noise can be measured for every ridge strength. The curves show the trade-off and how more noise moves the best $\lambda$.`,
    slides: [
      slide('L2', 159, 'A controlled ridge experiment'),
      slide('L2', 160, 'Ridge strength and expected error'),
      slide('L2', 161, 'More noise changes the ridge trade-off'),
      slide('II', 48, 'A controlled ridge experiment'),
      slide('II', 49, 'Ridge strength and expected error'),
      slide('II', 50, 'More noise changes the ridge trade-off'),
    ],
    nonExaminable: true,
    slideNote: R`Labelled non-examinable. Figures: bias² (red), variance (blue), noise (grey) and expected MSE (green) against $\log_{10}\lambda$ from $-4$ to $2$. At $\sigma=0.25$ everything is near zero until $\lambda$ passes 1, where bias² rises; at $\sigma=1$ the variance starts near 0.55 and falls, the noise line sits at 1, and bias² rises from $\lambda\approx1$.`,
    pre: [
      text(R`18 fixed inputs across $[-1,1]$. True mean: $\sin(\pi x)$. Redraw independent Gaussian noise $\epsilon_i$ and refit on each new dataset. Compare $\sigma=0.25$ with $\sigma=1$.`),
      text('Curves average repeated datasets and fresh noise at 121 fixed inputs.'),
    ],
    rows: [
      {
        eq: R`y_i=\sin(\pi x_i)+\epsilon_i,\qquad\epsilon_i\sim\mathcal N(0,\sigma^2)`,
        notes: [lab(R`$\sigma$ is the noise standard deviation`)],
      },
      {
        eq: R`J(\mathbf w)=\lVert\mathbf y-\Phi\mathbf w\rVert_2^2+\lambda\sum_{j=1}^{9}w_j^2`,
        notes: [
          lab('degree-9 polynomial model, same fitting objective'),
          lab(R`$J$: fitting cost; $\Phi$: polynomial design matrix; $\mathbf y$: target vector; $\mathbf w$: coefficients; $\lambda$: shrinkage strength; the intercept $w_0$ is unpenalised`),
          shape(R`\Phi:\ 18\times10,\quad\mathbf w:\ 10\times1,\quad\mathbf y:\ 18\times1`),
        ],
      },
      {
        eq: R`\sigma=0.25:\ \lambda^\star\approx0.32,\ \text{MSE}\approx0.091;\qquad\sigma=1:\ \lambda^\star\approx2.51,\ \text{MSE}\approx1.237`,
        notes: [
          lab('minimum on each grid'),
          lab('stronger shrinkage reduces variance but eventually adds too much bias; an optimum need not lie in the interior for every problem'),
          lab('more noise raises the variance and the noise floor, and moves the best λ up'),
          warn('in practice, choose λ using validation: these curves use known simulated truth'),
        ],
      },
    ],
  },
];

export const lecture1Reference: Topic = {
  id: 'lecture-1-reference',
  title: 'Appendix: Lecture 1 reference material',
  short: 'L1 recap',
  summary: R`Where each appendix slide is written up, then the Lecture 1 reference slides: expectation versus sample average, ERM, population risk, validation, the degree-1/3/14 example, averaging over datasets, and the (non-examinable) bias–variance decomposition and ridge experiment.`,
  sections,
};

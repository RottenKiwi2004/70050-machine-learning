import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I79',
    area: 'Probability',
    tex: R`i\sim\text{Uniform}\{1,\dots,N\}\ \Rightarrow\ \mathbb E[\mathbf a_i]=\frac1N\sum_{i=1}^{N}\mathbf a_i,\qquad \mathbb E\Big[\frac1B\sum_{b=1}^{B}\mathbf a_{i_b}\Big]=\frac1N\sum_{i=1}^{N}\mathbf a_i`,
    note: R`Each index has probability $1/N$, so the expected value of a randomly picked term is the plain average (I56, discrete form). The mini-batch average of $B$ such draws has the same expectation by linearity (I25), with or without repeats. "Unbiased" means right on average; any single draw can be far off.`,
  },
];

const sections: Section[] = [
  {
    id: 'objective',
    circ: 1,
    title: 'Summed, mean and penalised losses',
    why: R`Before speeding up gradient descent we fix the exact objective: the average example loss plus an L2 penalty. Writing it as an average over examples is what makes a random subset of examples a fair estimate of it.`,
    slides: [
      slide('L2', 61, 'SGD (section divider)'),
      slide('L2', 62, 'Summed, mean and penalised losses'),
      slide('L2', 163, 'A mean objective for stochastic updates (appendix)'),
    ],
    slideNote: R`Slide 61 is the divider (figure: contours with iterates; reading Murphy §8.2.4 and §§8.4.1–8.4.3, momentum and SGD). Slide 163 (appendix) restates row 4 as $J=\tfrac1NL+\tfrac\lambda2\sum_jw_j^2$ and explains the factor $\tfrac12$ (row 5).`,
    rows: [
      {
        eq: R`p(y_i\mid\mathbf x_i;\mathbf w)`,
        notes: [lab('probability of the observed label (Bernoulli or softmax)')],
      },
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\ell_i(\mathbf w),\qquad \ell_i(\mathbf w)=-\log p(y_i\mid\mathbf x_i;\mathbf w)`,
        notes: [term('Cost function (summed loss)'), shape(R`\ell_i,\ L:\ 1\times1`)],
      },
      {
        eq: R`\bar L(\mathbf w)=\frac1N\sum_{i=1}^{N}\ell_i(\mathbf w)`,
        notes: [
          lab('normalise: the mean loss does not grow with N'),
          tag(['I35'], 'dividing by N does not move the minimiser'),
        ],
      },
      {
        eq: R`J(\mathbf w)=\bar L(\mathbf w)+\frac\lambda2\sum_{j=1}^{D}w_j^2`,
        notes: [
          lab('add regularisation'),
          con(R`$\lambda\ge0$ sets penalty strength`),
          warn(R`the sum starts at $j=1$: the intercept coefficient $w_0$ is unpenalised`),
          shape(R`J:\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial}{\partial w_j}\,\frac\lambda2w_j^2=\lambda w_j`,
        notes: [tag(['I52'], R`the factor $\tfrac12$ cancels the 2 from $\frac{d}{dw}w^2=2w$`)],
      },
    ],
  },
  {
    id: 'full-gradient',
    circ: 2,
    title: 'A full gradient uses every example',
    why: R`The exact gradient of $J$ needs the gradient of every example's loss. That is fine for a thousand examples, but with a million each single update must touch all million, which is the cost SGD removes.`,
    slides: [slide('L2', 63, 'A full gradient uses every example')],
    slideNote: 'The shape lines are added.',
    rows: [
      {
        eq: R`J(\mathbf w)=\frac1N\sum_{i=1}^{N}\ell_i(\mathbf w)+\frac\lambda2\sum_{j=1}^{D}w_j^2,\qquad \mathbf w_{t+1}=\mathbf w_t-\eta_t\nabla J(\mathbf w_t)`,
        notes: [lab('gradient descent on the penalised mean loss')],
      },
      {
        eq: R`\nabla J(\mathbf w)=\nabla\Big[\frac1N\sum_{i=1}^{N}\ell_i(\mathbf w)\Big]+\nabla\Big[\frac\lambda2\sum_{j=1}^{D}w_j^2\Big]=\frac1N\sum_{i=1}^{N}\nabla\ell_i(\mathbf w)+\lambda\,\mathbf r(\mathbf w)`,
        notes: [
          lab('average the example gradients, then add the penalty gradient'),
          tag(['I8'], 'the gradient of a sum is the sum of gradients'),
          lab(R`$\nabla\ell_i$ is an individual example's gradient, e.g. $(p_i-y_i)\mathbf x_i$ for logistic regression`),
          shape(R`\nabla\ell_i,\ \mathbf r,\ \nabla J:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`\frac{\partial}{\partial w_j}\Big[\frac\lambda2\sum_{k=1}^{D}w_k^2\Big]=\frac\lambda2\cdot2w_j=\lambda w_j\ (j\ge1),\qquad \frac{\partial}{\partial w_0}\Big[\frac\lambda2\sum_{k=1}^{D}w_k^2\Big]=0`,
        notes: [
          ex(R`only the term $k=j$ contains $w_j$; $\frac{d}{dw}w^2=2w$. The sum has no $w_0$ in it, so the intercept entry is $0$`),
        ],
      },
      {
        eq: R`\mathbf r(\mathbf w)=(0,w_1,\dots,w_D)^\top`,
        notes: [
          term('Penalty gradient'),
          lab(R`$\mathbf r(\mathbf w)$ excludes the intercept: its first entry is 0`),
          shape(R`(D+1)\times1`),
        ],
      },
      {
        eq: R`N=1{,}000{,}000:\ \ 10^6\ \text{example gradients per update}`,
        notes: [warn('every full update uses a million examples')],
      },
    ],
  },
  {
    id: 'minibatch',
    circ: 3,
    title: 'Stochastic gradient descent',
    why: R`Instead of the exact average over all $N$ examples, average over a small random batch of $B$. Each estimate is noisy, but correct on average, and it costs $B$ instead of $N$ example gradients, so we can afford many more updates.`,
    slides: [slide('L2', 64, 'Stochastic gradient descent')],
    slideNote: R`The expectation in row 3 is added; it is the slide's "gives the full gradient on average" written out.`,
    rows: [
      {
        eq: R`\nabla J(\mathbf w_t)=\frac1N\sum_{i=1}^{N}\nabla\ell_i(\mathbf w_t)+\lambda\mathbf r(\mathbf w_t)`,
        notes: [lab('gradient: full batch, N examples')],
      },
      {
        eq: R`\mathbf g_t=\frac1B\sum_{i\in\mathcal B_t}\nabla\ell_i(\mathbf w_t)+\lambda\mathbf r(\mathbf w_t),\qquad\mathbf w_{t+1}=\mathbf w_t-\eta_t\mathbf g_t`,
        notes: [
          term('Estimated gradient (mini-batch: B examples)'),
          lab(R`$\mathcal B_t$ lists $B$ uniform draws with replacement; repeated indices are allowed`),
          lab(R`$B=1$ is single-example SGD`),
          shape(R`\mathbf g_t:\ (D+1)\times1,\quad B:\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbb E[\mathbf g_t\mid\mathbf w_t]=\frac1B\sum_{b=1}^{B}\mathbb E\big[\nabla\ell_{i_b}(\mathbf w_t)\big]+\lambda\mathbf r(\mathbf w_t)=\frac1B\cdot B\cdot\frac1N\sum_{i=1}^{N}\nabla\ell_i(\mathbf w_t)+\lambda\mathbf r(\mathbf w_t)`,
        notes: [
          tag(['I25'], R`expectation of a sum is the sum of expectations, and the constant factor $\frac1B$ comes out; $\lambda\mathbf r(\mathbf w_t)$ is not random`),
          tag(['I79'], R`each drawn index is uniform, so $\mathbb E[\nabla\ell_{i_b}]=\frac1N\sum_i\nabla\ell_i$ for every one of the $B$ draws`),
        ],
      },
      {
        eq: R`\mathbb E[\mathbf g_t\mid\mathbf w_t]=\frac1N\sum_{i=1}^{N}\nabla\ell_i(\mathbf w_t)+\lambda\mathbf r(\mathbf w_t)=\nabla J(\mathbf w_t)`,
        notes: [
          tag(['I79', 'I25'], 'uniform sampling gives the full gradient on average'),
          warn('each update is noisy'),
        ],
      },
    ],
  },
  {
    id: 'shrinkage',
    circ: 4,
    title: 'SGD and coefficient shrinkage',
    why: R`Writing the SGD update one coordinate at a time shows what the L2 penalty does: before each data step it multiplies every non-intercept coefficient by a number slightly below 1. This is the "weight decay" view of ridge.`,
    slides: [slide('L2', 65, 'SGD and coefficient shrinkage')],
    slideNote: R`The middle rows show the steps from $\mathbf g_t$ to the slide's last line. The intercept row is added.`,
    derive: true, // the rows as an animated derivation, drawn in the page: each line is built out of the one before
    rows: [
      {
        eq: R`\mathbf g_t=\underbrace{\frac1B\sum_{i\in\mathcal B_t}\nabla\ell_i(\mathbf w_t)}_{\text{mean data gradient}}+\underbrace{\lambda\mathbf r(\mathbf w_t)}_{\text{penalty gradient}}`,
        notes: [],
      },
      {
        eq: R`w_{t+1,j}=w_{t,j}-\eta_t\Big[\frac1B\sum_{i\in\mathcal B_t}\frac{\partial\ell_i}{\partial w_j}(\mathbf w_t)+\lambda w_{t,j}\Big]`,
        notes: [lab(R`entry $j$ of the update, $j\ge1$ (entry $j$ of $\mathbf r$ is $w_j$)`), shape(R`\text{all terms }1\times1`)],
      },
      {
        eq: R`w_{t+1,j}=w_{t,j}-\eta_t\lambda\,w_{t,j}-\eta_t\frac1B\sum_{i\in\mathcal B_t}\frac{\partial\ell_i}{\partial w_j}(\mathbf w_t)=(1-\eta_t\lambda)\,w_{t,j}-\eta_t\frac1B\sum_{i\in\mathcal B_t}\frac{\partial\ell_i}{\partial w_j}(\mathbf w_t),\qquad j\ge1`,
        notes: [
          lab(R`collect the two $w_{t,j}$ terms`),
          term('Shrinkage (weight decay)'),
          lab(R`$\eta_t\lambda<1$: shrink non-intercept coefficients, then take the data step`),
        ],
      },
      {
        eq: R`w_{t+1,0}=w_{t,0}-\eta_t\frac1B\sum_{i\in\mathcal B_t}\frac{\partial\ell_i}{\partial w_0}(\mathbf w_t)`,
        notes: [lab(R`the intercept has no penalty, so no shrink factor`)],
      },
      {
        eq: R`\eta_t=0.1,\ \lambda=0.01:\quad 1-\eta_t\lambda=1-0.1\times0.01=1-0.001=0.999`,
        notes: [ex('each step keeps 99.9% of every non-intercept coefficient before the data step')],
      },
    ],
  },
  {
    id: 'cost-per-update',
    title: 'Mini-batches change the cost per update',
    why: 'Counting updates is misleading: a stochastic update is much cheaper than a full one. What matters is how quickly, in real time, we reach a useful objective value.',
    slides: [slide('L2', 66, 'Mini-batches change the cost per update')],
    slideNote: R`Schematic: log(excess cost) against time. Green "stochastic": drops fast at first, then flattens. Blue "deterministic": a staircase, each step one expensive full-gradient update, eventually going lower. The numbers in row 2 are added.`,
    pre: [
      text('Schematic: excess cost is J minus its minimum value.'),
      text('Compare time to a useful objective value, not just update counts.'),
    ],
    rows: [
      {
        eq: R`\text{excess cost}=J(\mathbf w_t)-\min_{\mathbf w}J(\mathbf w)`,
        notes: [lab('how far above the best possible value we are')],
      },
      {
        eq: R`\frac{N}{B}\ \text{updates}\ \approx\ \text{one epoch-equivalent}`,
        notes: [
          lab(R`with replacement, $N/B$ updates process $N$ sampled examples`),
          ex(R`$N=10^6$, $B=100$: $N/B=\frac{10^6}{10^2}=10^4$ cheap updates for the cost of one full-gradient update`),
          warn('more updates do not imply the same factor of speedup'),
        ],
      },
    ],
  },
  {
    id: 'learning-rate',
    title: 'Choosing the learning rate',
    why: R`With noisy gradients the learning rate also decides how much the noise moves the parameters. These schematic curves are what you look for in practice when choosing $\eta$.`,
    slides: [slide('L2', 67, 'Choosing the learning rate')],
    slideNote: 'Schematic SGD training curves, loss against epoch.',
    pre: [
      lab('very high learning rate (yellow): the loss shoots up: divergence'),
      lab('low learning rate (blue): slow, steady decrease'),
      lab('high learning rate (green): fast at first, then stuck on a plateau above the others'),
      lab('good learning rate (red): fast and ends lowest'),
      warn('a fixed rate can leave a noise floor: the noisy steps keep jumping around the minimum'),
    ],
    rows: [
      {
        eq: R`\mathbf w_{t+1}=\mathbf w_t-\htmlClass{c-red}{\eta_t}\,\mathbf g_t`,
        notes: [lab(R`the boxed $\eta_t$ on the slide: the dial being chosen`)],
      },
    ],
  },
  {
    id: 'decay',
    circ: 5,
    title: 'Decreasing the learning rate',
    why: R`A large rate moves fast but cannot settle; a small rate settles but crawls. Starting large and decreasing the rate gets both: big moves early, small careful moves later, which in SGD also averages away the gradient noise.`,
    slides: [slide('L2', 68, 'Decreasing the learning rate')],
    slideNote: R`Three panels on $J(w)=w^2/2$ from $w=2$, 14 updates each: small constant rate, large constant rate, decreasing rate. The iterate values are added (computed exactly; the slide's example uses the exact gradient to show the effect of the rate alone).`,
    rows: [
      {
        eq: R`J(w)=\tfrac12w^2,\quad w_0=2,\quad w_{t+1}=(1-\eta_t)\,w_t`,
        notes: [tag(['I73'], 'the same one-parameter example as in the gradient-descent topic')],
      },
      {
        eq: R`\eta=0.1:\quad w_t=(1-0.1)^t\,2=2(0.9)^t,\qquad w_{14}=2(0.9)^{14}=2(0.229)=0.458`,
        notes: [lab('small constant rate: creeps down one side of the bowl, still far from 0')],
      },
      {
        eq: R`\eta=1.8:\quad w_t=2(1-1.8)^t=2(-0.8)^t:\ 2,\ 2(-0.8)=-1.6,\ -1.6(-0.8)=1.28,\ 1.28(-0.8)=-1.02,\dots,\ w_{14}=2(0.8)^{14}=2(0.044)=0.088`,
        notes: [lab('large constant rate: bounces from side to side')],
      },
      {
        eq: R`\eta_t=\frac{1.8}{1+t/4}:\quad\eta_0=1.8,\ \eta_1=\frac{1.8}{1.25}=1.44,\ \eta_2=\frac{1.8}{1.5}=1.2,\ \eta_3=\frac{1.8}{1.75}=1.029`,
        notes: [ex(R`evaluate the schedule at $t=0,1,2,3$`)],
      },
      {
        eq: R`w_1=(1-1.8)(2)=-1.6,\quad w_2=(1-1.44)(-1.6)=0.704,\quad w_3=(1-1.2)(0.704)=-0.141,\quad w_4=(1-1.029)(-0.141)=0.004`,
        notes: [lab('decreasing rate: one big bounce, then lands almost at once')],
      },
      {
        eq: R`\eta_t=\frac{\eta_0}{1+t/t_0}`,
        notes: [
          term('Example schedule'),
          con(R`$\eta_0>0$ is the initial rate; $t_0>0$ controls the decay timescale`),
          lab(R`in the example $\eta_0=1.8$, $t_0=4$: the rate halves by $t=4$`),
          lab('in SGD, decreasing the rate reduces the effect of gradient noise'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Momentum: named but not derived',
        text: R`The divider's reading (Murphy §8.2.4) and the notation slide (L2 168) list a momentum term $\mathbf v_t$ with decay $\beta$, but no slide in this deck gives its update. Check the reading or the lecture recording if it is examinable.`,
        eq: R`\mathbf g_t,\ \mathbf v_t,\ \beta:\ \text{gradient estimate; momentum; decay}`,
      },
    ],
  },
];

export const sgd: Topic = {
  id: 'sgd',
  title: 'Stochastic gradient descent',
  short: 'SGD',
  summary: R`The penalised mean objective $J=\bar L+\tfrac\lambda2\sum_{j\ge1}w_j^2$; the full gradient needs all $N$ examples, a mini-batch of $B$ gives an unbiased noisy estimate $\mathbf g_t$. Per coordinate: shrink by $1-\eta_t\lambda$, then step. Decreasing $\eta_t=\eta_0/(1+t/t_0)$ settles the noise.`,
  identities,
  sections,
};

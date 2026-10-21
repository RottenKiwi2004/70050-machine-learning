---
title: About this notebook
---

# 70050 Machine Learning: lecture notes

Notes for *70050 Machine Learning* (Imperial College London), written for **Principia**, the notes app they are
built to be read in. Every result is derived line by line, with the shape of every matrix and vector written
beside it, and every identity that a step uses is tagged so you can look it up.

## How to open the notes

1. Install Principia from its repository (the app is a separate project from this notebook; follow the
   install and run instructions in the Principia repository's own README).
2. Clone or download this repository, `RottenKiwi2004/70050-machine-learning`:
   `git clone https://github.com/RottenKiwi2004/70050-machine-learning.git`
3. Start Principia and use its **Open folder** command on the cloned folder (the one that contains
   `principia.config.ts`). The sidebar then shows the lectures and topics in order.
4. Pick a topic. Each section shows the lecture slide it comes from, the equation rows, and notes beside each row.
   Click an identity tag (such as `I17`) to open the rule it uses. The identity index lists them all.
5. Edit any `.ts` / `.tsx` file and save: the page updates in a moment.

The notes were written against Principia **0.9.1** (see `principia.version.json`). If the app asks to upgrade
the notebook format, accept; nothing else needs doing.

To rebuild the concept animations after editing a scene in `animations/`, run `npm run slides -- <this folder>`
inside the Principia project (only what changed is rebuilt).

## Course outline

### Lecture 1: Introduction and regression

Course admin (in `01`): coursework 20%, exam 80%, the prerequisites and textbook, and the eight-lecture schedule.

| File | Topic | Core idea |
|---|---|---|
| `01` | Course overview | marking, prerequisites, textbook, schedule |
| `02` | Learning settings and tasks | what machine learning is; the five learning settings; regression, classification, clustering, dimensionality reduction, generative modelling |
| `03` | Local averaging and kernel regression | predict by averaging nearby stored targets (k-NN, Gaussian kernel weights); costs of non-parametric methods, the curse of dimensionality |
| `04` | Linear regression and least squares | $\hat y=\mathbf w^\top\mathbf x$; fit a line by minimising the residual sum of squares; the normal equation |
| `05` | Least squares in matrix form | the loss, its gradient and $\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y$ for $N$ examples and $D$ inputs |
| `06` | Nonlinear features | a feature map $\boldsymbol\phi$ and design matrix $\Phi$: curves from a model linear in $\mathbf w$ |
| `07` | Regularisation and ridge regression | the penalty $\lambda\lVert\mathbf w\rVert_2^2$; $(X^\top X+\lambda I)\hat{\mathbf w}=X^\top\mathbf y$ |
| `08` | Validation and test data | train / validation / test, $K$-fold cross-validation to choose $\lambda$, standardising features |
| `09` | Probability basics | joint, marginal, conditional, Bayes' rule, densities, the 1D Gaussian |
| `10` | Maximum likelihood and the Gaussian | minimise the negative log-likelihood; sample mean and $\frac1N$ variance; multivariate Gaussian |
| `11` | Ridge regression as MAP | Gaussian noise gives least squares, a Gaussian prior adds the ridge penalty, $\lambda=\sigma^2/\tau^2$ |
| `12` | L1 regularisation and LASSO | the $L_1$ penalty, the diamond-shaped ball, sparse solutions |
| `13` | Generalisation: risk and bias–variance | empirical vs population risk; bias–variance (non-examinable) |
| `14` | Symbol glossary | every symbol of Lecture 1 with its meaning and shape |

### Lecture 2: Classification and optimisation

| File | Topic | Core idea |
|---|---|---|
| `15` | The classification problem | binary labels, the k-NN vote and its limits |
| `16` | Linear scores, margins and the squared loss | $z=\mathbf w^\top\mathbf x$, the margin, why 0–1 loss has no gradient |
| `17` | Logistic regression and the log-loss | Bernoulli likelihood, binary cross-entropy, $\log(1+e^{-m})$ |
| `18` | Multiclass classification and softmax | one score per class, normalised to probabilities; cross-entropy with one-hot targets |
| `19` | Nonlinear features for classification | curved decision boundaries from a linear score |
| `20` | The gradient of the cross-entropy | $\nabla L=X^\top(\mathbf p-\mathbf y)$ by the chain rule; no closed form |
| `21` | Gradient descent | $\mathbf w_{t+1}=\mathbf w_t-\eta_t\nabla L$; converge, oscillate or diverge |
| `22` | Newton–Raphson and curvature | second-order steps $H\mathbf d=-\nabla L$; IRLS for logistic regression |
| `23` | Stochastic gradient descent | unbiased noisy mini-batch gradients; decreasing learning rate |
| `24` | L1 and L2 regularisation in optimisation | shrinkage vs exact zeros; penalty ↔ constraint |
| `25` | Decision trees | splits by information gain, leaves as Bernoulli models, depth and overfitting |
| `26` | Ensembles and error averaging | uncorrelated errors average out: $E_{\text{COM}}=\frac1KE_{\text{AV}}$ |
| `27` | Bagging and random forests | bootstrap samples and random candidate splits decorrelate the trees |
| `28` | Decisions, thresholds and costs | threshold $\tau$, loss matrix, expected loss, reject option |
| `29` | Evaluation metrics | confusion matrix, accuracy, precision, recall, F-score, micro / macro averages |
| `30` | ROC, AUC and reliability | threshold sweep, AUC, precision–recall, confidence intervals, calibration |
| `31` | Appendix: Lecture 1 reference | where each appendix slide is written up; ERM, population risk, bias–variance |
| `32` | Lecture 2 symbol glossary | the notation slides, with the shape of every vector and matrix |

### Lecture 3: Representation learning and neural networks

Skipped as course admin: the title and meeting-hours slides (1, 2, 72), the course schedule (43), the reading list
and the references (141, 142). Slide numbers in the badges are PDF page numbers.

| File | Topic | Core idea |
|---|---|---|
| `33` | Features and milestones | learned features versus hand-designed ones; the timeline of methods |
| `34` | Decision trees as path features, pruning | a tree as $f=\mathbf c^\top\boldsymbol\phi$ with leaf indicator features; pruning and the train/validation gap |
| `35` | Bias and variance: intuition | underfit versus overfit, the dartboard picture, why variance is the problem of deep trees |
| `36` | Averaging a committee | $\operatorname{Var}[\bar f]=\sigma^2[\rho+(1-\rho)/K]$: correlation limits what averaging buys |
| `37` | Bagging and random forests | bootstrap samples, out-of-bag error, $m<d$ random candidate features |
| `38` | Support vector machines | maximum margin, support vectors, $\mathbf w=\sum_i\alpha_iy_i\boldsymbol\phi(\mathbf x_i)$ (non-examinable) |
| `39` | Polynomial and Gaussian kernels | $k(\mathbf x,\mathbf z)=\boldsymbol\phi(\mathbf x)^\top\boldsymbol\phi(\mathbf z)$ without building $\boldsymbol\phi$ |
| `40` | Learning features: deep learning | the pre-deep-learning pipeline versus learning the features end to end |
| `41` | The perceptron and XOR | a linear separator cannot represent XOR; a hand-built two-layer network can |
| `42` | Neurons and activation functions | sigmoid, tanh, ReLU; why stacking linear layers without a nonlinearity collapses |
| `43` | Learning XOR and its representations | what each layer's output looks like once the weights are learned |
| `44` | Universal approximation | sums of bumps and ReLU tents; width versus depth, the sawtooth |
| `45` | Representations in deep networks | LeNet and AlexNet; simple features early, complex ones late |
| `46` | Gradients, notation and the chain rule | $\mathbf g_{\mathbf u}=J^\top\mathbf g_{\mathbf v}$; logistic regression $\partial L/\partial z=p-y$ |
| `47` | Worked MLP: forward pass and loss | one two-layer ReLU network with every number written out |
| `48` | Worked MLP: backward pass | $\nabla_WL=\mathbf g_{\hat y}\mathbf a^\top$, $\mathbf g_z=\mathbf g_a\odot\mathbb 1[\mathbf z>0]$, $\nabla_VL=\mathbf g_z\mathbf x^\top$ |
| `49` | General backprop, gradient checks, branching | the recursion for $M$ layers; central differences; copy forward means add backward |
| `50` | Appendix: bias, variance and risk | $\text{bias}^2+\text{variance}+\text{noise}$ derived at one input |
| `51` | Appendix: forest applications and history | Kinect per-pixel forests; Bayes to ridge regression timeline |
| `52` | Appendix: margins, hinge loss and kernels | geometric margin, the SVM dual, the infinite Gaussian feature expansion |
| `53` | Appendix: softmax and cross-entropy backprop | the softmax Jacobian and why $\mathbf g_{\mathbf z}=\hat{\mathbf y}-\mathbf y$ |
| `54` | Appendix: computation graphs | add distributes, multiply swaps; topological order; the sigmoid neuron as seven gates |

Interactive widgets in Lecture 3 (each sits at the end of the named section):

| File | Widget | What you can do |
|---|---|---|
| `34` | `DecisionTreeExplorer` | grow a tree level by level; training vs validation error against depth; click a point to see its path feature $\phi_\ell$ |
| `37` | `ForestAverager` | average $K$ bootstrapped trees, bagging ($m=d$) vs random forest ($m=1$); test and out-of-bag error against $K$ |
| `39` | `KernelSVM` | train an SVM with a linear, polynomial or Gaussian kernel; support vectors, margins $f=\pm1$, the effect of $C$ and $\sigma$ |
| `43` | `XorNetwork` | train a one-hidden-layer network on XOR; input space and hidden space side by side; activations, $H$, $\eta$ |
| `44` | `ExpressivenessExplorer` | approximate a target with $m$ ReLUs (as ramps or tents); stack tent layers for $2^k$ pieces from $3k$ units |
| `48` | `BackpropStepper` | step through the worked network's forward and backward pass with every number; apply the update; finite-difference check |

Lecture 3 overlaps with Lecture 2 on trees and ensembles (files 25 to 27) and with Lecture 1 on bias and variance
(file 13); the Lecture 3 files cover every slide of their own deck but point to those files for the longer working.
One convention differs: Lecture 3 writes $\mathbf z=W\mathbf x$ with $W:\ C\times D$, while Lecture 2 wrote
$\mathbf z=W^\top\tilde{\mathbf x}$ with $W:\ (D+1)\times C$ (identity C15).

The three lectures share one thread: write down a **model**, choose a **loss** that measures its mistakes, then
**fit** it, either in closed form (least squares, ridge) or by repeated improvement (gradient descent, Newton),
and finally **check it on data it has not seen**. Regularisation, validation and the evaluation metrics are
the three ways of keeping a good training fit from being mistaken for a good model.

## What is in the folder

| Path | Format | Contents |
|---|---|---|
| `principia.config.ts` | config | title, slide decks, shared identities, folder titles |
| `identities.ts` | TypeScript | identities shared by every topic, such as $\nabla_{\mathbf w}(\mathbf w^\top A\mathbf w)=(A+A^\top)\mathbf w$ |
| `lecture-1/…`, `lecture-2/…`, `lecture-3/…` | topics (`.ts`, `.tsx`) | sections, derivation rows, identity tags, slide badges; `.tsx` files also place a widget |
| `playground.mdx` | MDX | prose, math and topic components mixed freely |
| `widgets/*.tsx` | React components | interactive demos (gradient descent, ridge shrinkage, ROC thresholds, line fit; Lecture 3: tree growth, forest averaging, kernel SVM, XOR network, width vs depth, backprop stepper) |
| `animations/*.py` | manim scenes | concept pictures (matrix shapes, least squares as a projection, $L_1$ vs $L_2$, …) |
| `slides/*.html` | reveal.js decks | built from the scenes in `animations/` |

## How each topic is laid out

- **Slide badges** read *deck · page* (for example `L2 · 40`) and say which lecture slide the section covers.
  Rows or numbers marked "added" in a section note are not on the slide: they fill in a skipped step.
- **Derivation rows** write each step in full: nothing is left for you to work out. Where an identity is quoted
  it is tagged, not proved, unless the topic derives it.
- **Shapes** are written under every matrix and vector, for example $X:\ N\times(D+1)$.
- **Colours** are the same everywhere: teal labels, green shapes, orange constants, pink concepts, red warnings.

## Conventions

Every equation is TeX. In Markdown, inline math goes between single dollars, $X^\top X\mathbf w=X^\top\mathbf y$,
and display math between double dollars:

$$
\hat{\mathbf w}=(X^\top X+\lambda I)^{-1}X^\top\mathbf y
$$

Vectors are bold lower case and are columns ($\mathbf w:\ (D+1)\times1$), matrices are upper case, and
$\mathbf x^\top$ is the transpose. There are $N$ training examples and $D$ features, plus a constant 1 for the
intercept, hence $D+1$ parameters.

## Animated derivations

A section with `derive: true` shows its rows as an animated derivation, drawn in the page (MathJax SVG, no build
step): each step builds the next line out of the one before, the symbols they share flying into place, with the
row's notes and clickable identity tags beside its line. It steps with the note's step bar like any other row.

Pictures (`manim: 'SceneName'`, the scenes in `animations/`) are manim videos: after editing a scene, rebuild
with `npm run slides -- <this folder>` in Principia (only what changed is rebuilt).

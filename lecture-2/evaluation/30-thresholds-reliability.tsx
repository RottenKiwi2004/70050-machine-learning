import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';
import ThresholdExplorer from '../../widgets/ThresholdExplorer';

const identities: Identity[] = [
  {
    id: 'I86',
    area: 'Probability',
    tex: R`\hat e=\frac{1}{N}\sum_{i=1}^{N}Z_i,\ \ Z_i\sim\text{Bernoulli}(e)\ \text{independent}\ \Rightarrow\ \mathbb E[\hat e]=e,\quad\operatorname{Var}(\hat e)=\frac{e(1-e)}{N}`,
    note: R`The test error fraction is an average of 0/1 error indicators. Each has variance $e(1-e)$; for independent terms variances add (I49) and the $\tfrac1N$ factor squares (I26), giving $Ne(1-e)/N^2$. For large $N$, $\hat e$ is roughly Gaussian, and a Gaussian has 95% of its mass within $1.96$ standard deviations of its mean, which gives $\hat e\pm1.96\sqrt{\hat e(1-\hat e)/N}$.`,
  },
  {
    id: 'C13',
    area: 'Conventions',
    tex: R`TPR=\frac{TP}{TP+FN}=\text{Recall},\qquad FPR=\frac{FP}{FP+TN}`,
    note: R`True-positive rate: the share of actual positives that are flagged. False-positive rate: the share of actual negatives that are (wrongly) flagged. Each divides by a row total of the confusion matrix, so neither depends on how many positives there are.`,
  },
];

const sections: Section[] = [
  {
    id: 'roc',
    circ: 1,
    title: 'ROC curves and operating points',
    why: R`A probabilistic classifier is really a family of classifiers, one per threshold. Plotting the true-positive rate against the false-positive rate for every threshold shows the whole family at once; the costs of each kind of error then pick the point to use.`,
    slides: [slide('L2', 136, 'Thresholds and reliability (section divider)'), slide('L2', 137, 'ROC curves and operating points')],
    slideNote: R`Slide 136 is the divider (figure: the ROC curve of slide 137; reading Murphy §§5.1.3–5.1.4, ROC and precision–recall curves). Slide 137 figure: "Thyroid anomaly detection", a stepped red ROC curve, a cyan "Equal" line, and three marked operating points: top right "best when FN costs 10× FP", middle (about FPR 0.3, TPR 0.7) "best when the costs are equal", bottom left "best when FP costs 10× FN". Row 3 (with its arithmetic) and the widget are added.`,
    rows: [
      {
        eq: R`TPR=\frac{TP}{TP+FN},\qquad FPR=\frac{FP}{FP+TN}`,
        notes: [
          tag(['C13'], 'true-positive rate (= recall) and false-positive rate'),
          shape(R`TPR,\ FPR\in[0,1]`),
        ],
      },
      {
        eq: R`\tau\ \text{from 1 down to 0}:\quad(FPR,TPR)\ \text{moves from }(0,0)\text{ to }(1,1)`,
        notes: [
          term('ROC curve'),
          lab('sweep the decision threshold; plot true-positive rate against false-positive rate'),
          lab('a lower threshold flags more inputs, so both rates can only grow'),
          lab('the preferred operating point depends on error costs and class prevalence'),
        ],
      },
      {
        eq: R`\text{confusion matrix }(TP,FN,FP,TN)=(3,1,2,2):\quad TPR=\frac{TP}{TP+FN}=\frac{3}{3+1}=\frac34,\ \ FPR=\frac{FP}{FP+TN}=\frac{2}{2+2}=\frac24=\frac12`,
        notes: [ex('the metrics-topic classifier is one point (0.5, 0.75) on its ROC curve')],
      },
    ],
    extra: <ThresholdExplorer />,
  },
  {
    id: 'auc',
    circ: 2,
    title: 'Area under the ROC curve',
    why: R`To compare classifiers without picking a threshold, summarise the whole ROC curve by its area. The area has a neat meaning: the chance that a random positive gets a higher score than a random negative.`,
    slides: [slide('L2', 138, 'Area under the ROC curve')],
    slideNote: R`Figure: three ROC curves: the diagonal (AUC 0.50), a gently bowed curve (0.65) and a curve that shoots up almost vertically (0.93). The counting form and the worked example are added.`,
    rows: [
      {
        eq: R`\text{AUC}=P(s_+>s_-)+\tfrac12P(s_+=s_-)`,
        notes: [
          term('Area under the ROC curve (AUC)'),
          lab(R`$s_+$ and $s_-$ are scores for a randomly chosen positive and negative input`),
          lab('AUC measures ranking across thresholds, with half credit for tied scores'),
        ],
      },
      {
        eq: R`\text{AUC}=0.5:\ \text{random ranking};\qquad\text{AUC}=1:\ \text{every positive above every negative}`,
        notes: [lab('the diagonal ROC (left panel) is a classifier that ignores the input')],
      },
      {
        eq: R`\text{AUC}=\frac{\#\{\text{pairs with }s_+>s_-\}+\tfrac12\#\{\text{ties}\}}{\#\text{positives}\times\#\text{negatives}}`,
        notes: [lab('the probability in the definition, computed by counting over all positive–negative pairs (each pair equally likely)')],
      },
      {
        eq: R`s_+\in\{0.9,\,0.6\},\ s_-\in\{0.7,\,0.2\}:\quad\text{pairs }(0.9,0.7)\checkmark,\ (0.9,0.2)\checkmark,\ (0.6,0.7)\ \text{wrong},\ (0.6,0.2)\checkmark\ \Rightarrow\ \text{AUC}=\frac{3+\tfrac12\cdot0}{2\times2}=\tfrac34`,
        notes: [ex('count the positive–negative pairs ranked correctly: 3 of the 2 × 2 = 4 pairs, and no ties')],
      },
    ],
  },
  {
    id: 'pr-curve',
    title: 'Precision–recall curves',
    why: R`When positives are rare, the false-positive rate stays small even with many false alarms, so ROC curves can look good. Precision is more sensitive to false alarms, and its baseline is the share of positives.`,
    slides: [slide('L2', 139, 'Precision-recall curves')],
    slideNote: R`Figure: a stepped red curve for an illustrative classifier (precision 1 up to recall 0.5, then dropping to about 0.67 and below) and a grey horizontal line at the positive prevalence 0.5.`,
    rows: [
      {
        eq: R`\text{plot Precision}=\frac{TP}{TP+FP}\ \text{against Recall}=\frac{TP}{TP+FN}\ \text{as }\tau\text{ changes}`,
        notes: [
          term('Precision–recall curve'),
          lab('for rare positives, compare against their prevalence in the evaluation set'),
        ],
      },
      {
        eq: R`\text{prevalence}=\frac{\#\text{positives}}{\#\text{inputs}}=\frac48=0.5`,
        notes: [lab('this illustration has 4 positive examples among 8 inputs'), lab('a classifier that flags everything has precision equal to the prevalence')],
      },
    ],
  },
  {
    id: 'ci',
    circ: 3,
    title: 'Confidence intervals',
    why: R`A test error measured on 50 examples is itself uncertain: another 50 examples would give a different number. A confidence interval puts a range around the measured error that reflects how many test examples we had.`,
    slides: [slide('L2', 140, 'Confidence intervals'), slide('L2', 141, 'Confidence-interval exercise')],
    slideNote: R`The derivation of the standard error (rows 1 to 3) and the body-row interval (row 7) are added; the slide works only the face row.`,
    pre: [
      text('A 95% confidence-interval procedure covers the fixed population quantity in 95% of repeated samples, under its sampling assumptions.'),
      warn('Width depends on sample size and assumptions about independent observations. Small samples or rates near 0 or 1 may need a better interval method.'),
    ],
    rows: [
      {
        eq: R`\operatorname{Var}(Z_i)=\mathbb E[Z_i^2]-\mathbb E[Z_i]^2=e-e^2=e(1-e)`,
        notes: [
          lab(R`$Z_i=1$ if test example $i$ is misclassified, else 0, so $Z_i^2=Z_i$ and $\mathbb E[Z_i^2]=\mathbb E[Z_i]=e$`),
          lab(R`$e$ is the true error probability; shapes: $Z_i,e:\ 1\times1$`),
        ],
      },
      {
        eq: R`\operatorname{Var}(\hat e)=\operatorname{Var}\Big(\frac1N\sum_{i=1}^{N}Z_i\Big)=\frac1{N^2}\sum_{i=1}^{N}\operatorname{Var}(Z_i)=\frac{N\,e(1-e)}{N^2}=\frac{e(1-e)}{N}`,
        notes: [tag(['I86'], R`the constant $\tfrac1N$ comes out squared, and the variances of independent terms add; all $N$ terms are equal, so the sum is $N$ times one`)],
      },
      {
        eq: R`\text{SE}(\hat e)=\sqrt{\operatorname{Var}(\hat e)}=\sqrt{\frac{e(1-e)}{N}}\approx\sqrt{\frac{\hat e(1-\hat e)}{N}}`,
        notes: [lab(R`the true $e$ is unknown, so substitute the observed $\hat e$; the standard error is the typical size of $\hat e-e$`)],
      },
      {
        eq: R`\hat e\ \pm\ 1.96\sqrt{\frac{\hat e(1-\hat e)}{N_{\text{test}}}}`,
        notes: [
          term('Approximate 95% confidence interval'),
          lab(R`$\hat e$ is the observed error fraction; $N_{\text{test}}$ is the number of test examples`),
          tag(['I86'], R`the square root is the standard error of $\hat e$`),
          con('the factor 1.96 is the normal quantile for this approximate 95% interval'),
        ],
      },
      {
        eq: R`\begin{array}{c|cccc}\text{Representation} & \text{Attributes} & \text{Classes} & \text{Classifier} & \text{Correct}\\ \hline\text{Face} & 67 & 8 & \text{C4.5} & 78\%\\ \text{Body} & 140 & 6 & \text{BayesNet} & 90\%\end{array}`,
        notes: [lab('original emotion-recognition example: 156 training samples, 50 test samples from three subjects')],
      },
      {
        eq: R`\text{Face: }\hat e=1-0.78=0.22:\quad0.22\pm1.96\sqrt{\frac{0.22\times0.78}{50}}=0.22\pm1.96\sqrt{\frac{0.1716}{50}}=0.22\pm1.96\sqrt{0.003432}=0.22\pm1.96(0.0586)\approx0.22\pm0.115`,
        notes: [
          ex('endpoints: 0.22 − 0.115 = 0.105 and 0.22 + 0.115 = 0.335, so about [0.105, 0.335]'),
          warn('treating the 50 observations as independent; dependence between observations (e.g. only three subjects) changes this calculation'),
        ],
      },
      {
        eq: R`\text{Body: }\hat e=0.10:\quad0.10\pm1.96\sqrt{\frac{0.10\times0.90}{50}}=0.10\pm1.96\sqrt{\frac{0.09}{50}}=0.10\pm1.96\sqrt{0.0018}=0.10\pm1.96(0.0424)\approx0.10\pm0.083`,
        notes: [ex('endpoints: 0.10 − 0.083 = 0.017 and 0.10 + 0.083 = 0.183, so about [0.017, 0.183]; the two intervals overlap, and the rows also differ in classes and features, so they are not a like-for-like comparison')],
      },
    ],
  },
  {
    id: 'compare',
    title: 'Comparing classifiers',
    why: R`To compare two classifiers fairly, test them on the same examples and look at where they disagree. Examples where both are right (or both wrong) carry no evidence either way.`,
    slides: [slide('L2', 142, 'Comparing classifiers')],
    pre: [
      text('Evaluate both classifiers on the same held-out examples.'),
      text('Report the size of the performance difference.'),
      warn('Account for paired predictions, dependence and repeated model selection when assessing statistical evidence.'),
    ],
    rows: [
      {
        eq: R`\begin{array}{l|l}\text{Paired outcome} & \text{What it tells us}\\ \hline\text{Both correct or both wrong} & \text{No difference on this example}\\ \text{Only classifier A correct} & \text{Evidence favouring A}\\ \text{Only classifier B correct} & \text{Evidence favouring B}\end{array}`,
        notes: [ex('if A and B disagree on 10 examples and A is right on 8 of them (so B is right on the other 2), the evidence is those 10 disagreements, not the full test set')],
      },
    ],
  },
  {
    id: 'calibration',
    title: 'Probability calibration',
    why: R`Decision costs and thresholds assume the probabilities mean what they say. A calibrated model's "80%" really is right about 80% of the time; a model can rank well (high AUC) and still be badly calibrated.`,
    slides: [slide('L2', 143, 'Probability calibration')],
    rows: [
      {
        eq: R`\begin{array}{l|l}\text{Prediction} & \text{A calibrated interpretation}\\ \hline\text{Class-1 probability near 0.8} & \text{About 80\% of these inputs have label 1}\\ \text{Predicted-class confidence near 0.8} & \text{About 80\% of these predictions are correct}\end{array}`,
        notes: [
          term('Calibration'),
          lab('the second statement also applies to multiclass predictions'),
          warn('high softmax confidence alone does not establish reliability under shift (when test inputs differ from training inputs)'),
        ],
      },
    ],
  },
  {
    id: 'summary',
    title: 'Classification: fit, decide, evaluate',
    why: 'The lecture in three steps: what we fit, how we act on it, and how we check it.',
    slides: [slide('L2', 144, 'Classification: fit, decide, evaluate')],
    pre: [
      term('Fit a score or class distribution'),
      text('Choose a loss that suits classification. Optimisation or tree splitting fits the model to the training data.'),
      term('Choose an action'),
      text('Class probabilities and error costs determine the decision. A threshold of 1/2 assumes equal costs in the binary case.'),
      term('Assess unseen performance'),
      text('Use validation for choices, then independent test data for assessment. Match the metric to the task and check probability calibration.'),
    ],
    rows: [],
  },
];

export const thresholdsReliability: Topic = {
  id: 'thresholds-reliability',
  title: 'ROC, AUC and reliability',
  short: 'ROC & CIs',
  summary: R`Sweeping the threshold traces the ROC curve (TPR against FPR); AUC $=P(s_+>s_-)+\tfrac12P(s_+=s_-)$. Precision–recall curves for rare positives. The 95% interval $\hat e\pm1.96\sqrt{\hat e(1-\hat e)/N_{\text{test}}}$, paired comparisons, and calibration.`,
  identities,
  sections,
};

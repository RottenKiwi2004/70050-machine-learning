import { R, ex, lab, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I85',
    area: 'Algebra & calculus',
    tex: R`\frac{2ab}{a+b}=\Big(\tfrac12\big(\tfrac1a+\tfrac1b\big)\Big)^{-1}\le\frac{a+b}{2}`,
    note: R`Harmonic mean of two positive numbers: the reciprocal of the average reciprocal. It is pulled towards the smaller number (it is 0 if either is 0), so a high F1 needs both precision and recall to be high. Substituting $a=\frac{TP}{TP+FP}$ and $b=\frac{TP}{TP+FN}$ and multiplying top and bottom by $(TP+FP)(TP+FN)/TP$ gives $\frac{2TP}{2TP+FP+FN}$.`,
  },
];

const confusion = R`
\begin{array}{c|cc}
\text{Held-out counts} & \text{Predicted 1} & \text{Predicted 0}\\ \hline
\text{Actual 1} & TP=3 & FN=1\\
\text{Actual 0} & FP=2 & TN=2
\end{array}`;

const sections: Section[] = [
  {
    id: 'confusion',
    title: 'Confusion matrix',
    why: R`Before computing any single score, count the four possible outcomes of a binary prediction. Every metric in this topic is a ratio of these four counts, and the table shows which kinds of errors occur.`,
    slides: [slide('L2', 127, 'Evaluation metrics (section divider)'), slide('L2', 128, 'Confusion matrix')],
    slideNote: R`Slide 127 is the divider (figure: this confusion matrix; reading Murphy §5.1.2 and §5.1.4, classification and precision–recall). The same 8-example table is used on slides 128 to 132.`,
    display: confusion,
    pre: [
      text('Class 1 is positive. Rows are actual classes and columns are predictions.'),
      term('TP, FN, FP, TN'),
      lab('TP: true positive. FN: false negative. FP: false positive. TN: true negative.'),
      lab('"true/false": was the prediction right? "positive/negative": what was predicted?'),
      text('Total: 8 examples. The matrix shows which kinds of errors occur.'),
    ],
    rows: [],
  },
  {
    id: 'accuracy',
    circ: 1,
    title: 'Accuracy',
    why: 'The most familiar score: the fraction of all predictions that are right. It treats both kinds of error the same, which the next slides show is not always what we want.',
    slides: [slide('L2', 129, 'Accuracy')],
    rows: [
      {
        eq: R`\text{Accuracy}=\frac{TP+TN}{TP+FN+FP+TN}=\frac{3+2}{3+1+2+2}=\frac58=62.5\%`,
        notes: [
          term('Accuracy'),
          lab('counts all correct predictions: the diagonal of the table'),
          ex('here, 5 of the 8 held-out examples have the correct label'),
        ],
      },
    ],
  },
  {
    id: 'precision',
    circ: 2,
    title: 'Precision',
    why: R`When we act on every positive prediction (flag an email, call a patient back), we care how many of those calls were justified. Precision answers that, and only false positives lower it.`,
    slides: [slide('L2', 130, 'Precision')],
    rows: [
      {
        eq: R`\text{Precision}=\frac{TP}{TP+FP}=\frac{3}{3+2}=\frac35=60\%`,
        notes: [
          term('Precision'),
          lab('among predicted positives (the "Predicted 1" column), what fraction are truly positive?'),
          lab('false positives reduce precision'),
        ],
      },
    ],
  },
  {
    id: 'recall',
    circ: 3,
    title: 'Recall',
    why: 'When missing a positive is costly (an illness, a fraud), we care how many of the real positives we caught. Recall answers that, and only false negatives lower it.',
    slides: [slide('L2', 131, 'Recall')],
    rows: [
      {
        eq: R`\text{Recall}=\frac{TP}{TP+FN}=\frac{3}{3+1}=\frac34=75\%`,
        notes: [
          term('Recall'),
          lab('among actual positives (the "Actual 1" row), what fraction did we find?'),
          lab('false negatives reduce recall'),
          lab('also called the true-positive rate (TPR) or sensitivity'),
        ],
      },
    ],
  },
  {
    id: 'tradeoff',
    title: 'Precision and recall',
    why: R`The two scores pull against each other: predicting "positive" more often finds more positives (recall up) but adds false alarms (precision down). Reading them together tells you which kind of mistake a classifier makes.`,
    slides: [slide('L2', 132, 'Precision and recall')],
    rows: [
      {
        eq: R`\text{Precision}=\frac{TP}{TP+FP}=\frac{3}{3+2}=\frac35=60\%,\qquad\text{Recall}=\frac{TP}{TP+FN}=\frac{3}{3+1}=\frac34=75\%`,
        notes: [lab(R`the numerator is the same $TP=3$; only the denominator changes: it adds the false positives for precision and the false negatives for recall`)],
      },
      {
        eq: R`\begin{array}{l|l}\text{Pattern} & \text{Interpretation}\\ \hline\text{High recall, low precision} & \text{finds most positives, with many false alarms}\\ \text{High precision, low recall} & \text{few false alarms, but misses many positives}\end{array}`,
        notes: [ex(R`always predicting 1 gives recall $100\%$ but precision equal to the share of positives`)],
      },
    ],
  },
  {
    id: 'f-score',
    circ: 4,
    title: 'F-score',
    why: R`One number that is high only when both precision and recall are high: their harmonic mean. A weight $b$ lets you say how much more recall matters than precision.`,
    slides: [slide('L2', 133, 'F-score')],
    slideNote: R`The count form is derived (rows 2 to 4) and the numbers are added, using the confusion matrix above.`,
    rows: [
      {
        eq: R`F_1=\frac{2\,\text{Prec}\,\text{Rec}}{\text{Prec}+\text{Rec}}=\frac{2TP}{2TP+FP+FN}`,
        notes: [
          term('F1 score'),
          lab('Prec is precision and Rec is recall; F1 is their harmonic mean'),
          tag(['I85'], 'harmonic mean, and the substitution that gives the count form'),
        ],
      },
      {
        eq: R`\text{Prec}=\frac{TP}{TP+FP},\quad\text{Rec}=\frac{TP}{TP+FN}\ \Rightarrow\ F_1=\frac{2\cdot\dfrac{TP}{TP+FP}\cdot\dfrac{TP}{TP+FN}}{\dfrac{TP}{TP+FP}+\dfrac{TP}{TP+FN}}`,
        notes: [lab('substitute the definitions of precision and recall into the harmonic mean')],
      },
      {
        eq: R`F_1=\frac{2\,TP^2}{TP\,(TP+FN)+TP\,(TP+FP)}`,
        notes: [lab(R`multiply the top and the bottom by $(TP+FP)(TP+FN)$ to clear the fractions: on top the denominators cancel, leaving $2TP\cdot TP$; on the bottom, $\frac{TP}{TP+FP}$ times $(TP+FP)(TP+FN)$ leaves $TP\,(TP+FN)$, and the second term leaves $TP\,(TP+FP)$`)],
      },
      {
        eq: R`F_1=\frac{2\,TP^2}{TP\,(2TP+FP+FN)}=\frac{2TP}{2TP+FP+FN}`,
        notes: [
          lab(R`factor $TP$ out of the bottom: $TP+FN+TP+FP=2TP+FP+FN$`),
          lab(R`cancel one factor of $TP$ from top and bottom (needs $TP>0$; if $TP=0$ then $F_1=0$)`),
        ],
      },
      {
        eq: R`F_1=\frac{2(0.6)(0.75)}{0.6+0.75}=\frac{0.9}{1.35}=0.667,\qquad F_1=\frac{2\cdot3}{2\cdot3+2+1}=\frac{6}{9}=0.667`,
        notes: [ex('both forms agree')],
      },
      {
        eq: R`F_b=(1+b^2)\,\frac{\text{Prec}\,\text{Rec}}{b^2\,\text{Prec}+\text{Rec}},\qquad b>0`,
        notes: [
          term('Weighted F-score'),
          lab(R`$b$ controls the relative importance of recall and precision; $b=1$ gives $F_1$`),
          lab(R`$b>1$ gives recall more weight; $b<1$ gives precision more weight`),
          warn(R`this $b$ is separate from the momentum coefficient $\beta$`),
        ],
      },
      {
        eq: R`F_2=\frac{(1+4)(0.6)(0.75)}{4(0.6)+0.75}=\frac{5(0.45)}{2.4+0.75}=\frac{2.25}{3.15}=0.714,\qquad F_{0.5}=\frac{(1+0.25)(0.45)}{0.25(0.6)+0.75}=\frac{0.5625}{0.15+0.75}=\frac{0.5625}{0.9}=0.625`,
        notes: [
          lab(R`$\text{Prec}\cdot\text{Rec}=0.6\times0.75=0.45$; for $b=2$: $b^2=4$; for $b=0.5$: $b^2=0.25$`),
          ex('recall (0.75) is the higher score here, so weighting recall raises F'),
          lab(R`check $b=1$: $(1+1)\frac{PR}{1\cdot P+R}=\frac{2PR}{P+R}=F_1$`),
        ],
      },
    ],
  },
  {
    id: 'imbalance',
    title: 'Class imbalance',
    why: R`When one class is much more common, accuracy is dominated by it. A classifier can look acceptable on accuracy while completely failing to detect the rare class, so always look at per-class recall too.`,
    slides: [slide('L2', 134, 'Class imbalance')],
    slideNote: 'The calculations are added.',
    pre: [text('Inspect class counts and per-class recall alongside aggregate accuracy.')],
    rows: [
      {
        eq: R`\begin{array}{c|cc}\text{Actual / predicted} & \text{Class 1} & \text{Class 0}\\ \hline\text{Class 1} & 70 & 30\\ \text{Class 0} & 10 & 90\end{array}\qquad\text{Accuracy}=\frac{70+90}{70+30+10+90}=\frac{160}{200}=80\%`,
        notes: [ex(R`left table. Recall: $70/100=70\%$ for class 1, $90/100=90\%$ for class 0`)],
      },
      {
        eq: R`\begin{array}{c|cc}\text{Actual / predicted} & \text{Class 1} & \text{Class 0}\\ \hline\text{Class 1} & 700 & 300\\ \text{Class 0} & 100 & 0\end{array}\qquad\text{Accuracy}=\frac{700+0}{700+300+100+0}=\frac{700}{1100}\approx63.6\%`,
        notes: [
          ex(R`right table. Recall: $700/1000=70\%$ for class 1, $0/100=0\%$ for class 0`),
          warn('the minority class has zero recall'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Accuracy can hide a failure',
        text: R`A useful-looking accuracy can coexist with failure to detect a class. With 1000 of class 1 and 100 of class 0, always predicting class 1 already scores $1000/1100=90.9\%$.`,
        eq: R`\text{per-class recall}_c=\frac{\#\{\text{actual }c,\ \text{predicted }c\}}{\#\{\text{actual }c\}}`,
      },
    ],
  },
  {
    id: 'micro-macro',
    circ: 5,
    title: 'Micro and macro averages',
    why: R`With more than two classes each class has its own precision and recall. Macro-averaging gives every class equal weight (so rare classes count); micro-averaging pools the counts first (so common classes dominate).`,
    slides: [slide('L2', 135, 'Micro and macro averages')],
    slideNote: R`The per-class counts (row 3), the per-class ratios (row 4) and all the numbers are worked out from the slide's 8-item table.`,
    pre: [
      text(R`Labels: $+$, $\circ$, $-$, $\times$ ($C=4$). Predictions for IDs 1 to 8: (+,+), (+,×), (∘,∘), (∘,∘), (−,−), (−,+), (×,×), (×,+), written (label, prediction).`),
      text(R`$C$ is the class count. $P_c$ and $R_c$ are per-class precision and recall.`),
    ],
    rows: [
      {
        eq: R`P_{\text{macro}}=\frac1C\sum_{c=1}^{C}P_c,\qquad R_{\text{macro}}=\frac1C\sum_{c=1}^{C}R_c`,
        notes: [term('Macro average'), lab('equal weight for each class')],
      },
      {
        eq: R`P_{\text{micro}}=\frac{\sum_cTP_c}{\sum_c(TP_c+FP_c)},\qquad R_{\text{micro}}=\frac{\sum_cTP_c}{\sum_c(TP_c+FN_c)}`,
        notes: [term('Micro average'), lab('pool counts across classes')],
      },
      {
        eq: R`\begin{array}{c|ccc|cc}c & TP_c & FP_c & FN_c & P_c & R_c\\ \hline + & 1 & 2 & 1 & 1/3 & 1/2\\ \circ & 2 & 0 & 0 & 1 & 1\\ - & 1 & 0 & 1 & 1 & 1/2\\ \times & 1 & 1 & 1 & 1/2 & 1/2\\ \hline\Sigma & 5 & 3 & 3 & & \end{array}`,
        notes: [
          ex(R`class $+$: correct on ID 1 (TP); predicted $+$ for IDs 6 and 8 whose labels were $-$ and $\times$ (2 FP); missed ID 2 (FN)`),
          lab(R`for class $c$, "positive" means "predicted $c$"`),
        ],
      },
      {
        eq: R`P_+=\tfrac{1}{1+2}=\tfrac13,\ R_+=\tfrac{1}{1+1}=\tfrac12;\quad P_\circ=\tfrac{2}{2+0}=1,\ R_\circ=\tfrac{2}{2+0}=1;\quad P_-=\tfrac{1}{1+0}=1,\ R_-=\tfrac{1}{1+1}=\tfrac12;\quad P_\times=\tfrac{1}{1+1}=\tfrac12,\ R_\times=\tfrac{1}{1+1}=\tfrac12`,
        notes: [lab(R`per class: $P_c=\frac{TP_c}{TP_c+FP_c}$ and $R_c=\frac{TP_c}{TP_c+FN_c}$, with the counts from the table in row 3`)],
      },
      {
        eq: R`P_{\text{macro}}=\tfrac14\big(\tfrac13+1+1+\tfrac12\big)=\tfrac14\cdot\tfrac{2+6+6+3}{6}=\tfrac14\cdot\tfrac{17}{6}=\tfrac{17}{24}=0.708`,
        notes: [ex(R`common denominator 6: $\tfrac13=\tfrac26$, $1=\tfrac66$, $\tfrac12=\tfrac36$`)],
      },
      {
        eq: R`R_{\text{macro}}=\tfrac14\big(\tfrac12+1+\tfrac12+\tfrac12\big)=\tfrac14\cdot\tfrac{5}{2}=\tfrac58=0.625`,
        notes: [ex(R`$\tfrac12+1+\tfrac12+\tfrac12=2.5=\tfrac52$`)],
      },
      {
        eq: R`\textstyle\sum_cTP_c=1+2+1+1=5,\quad\sum_cFP_c=2+0+0+1=3,\quad\sum_cFN_c=1+0+1+1=3`,
        notes: [lab('the totals in the last row of the table')],
      },
      {
        eq: R`P_{\text{micro}}=\frac{5}{5+3}=0.625,\qquad R_{\text{micro}}=\frac{5}{5+3}=0.625=\text{accuracy }\tfrac58`,
        notes: [
          lab(R`for single-label predictions over all classes, micro P, R and $F_1$ equal accuracy`),
          lab(R`each wrong prediction is one FP (for the predicted class) and one FN (for the true class), so $\sum FP_c=\sum FN_c$`),
        ],
      },
    ],
  },
];

export const evaluationMetrics: Topic = {
  id: 'evaluation-metrics',
  title: 'Evaluation metrics',
  short: 'Metrics',
  summary: R`From the confusion matrix (TP, FN, FP, TN): accuracy, precision $TP/(TP+FP)$, recall $TP/(TP+FN)$, $F_1=2TP/(2TP+FP+FN)$ and $F_b$. Class imbalance hides failures behind accuracy; macro averages weight classes equally, micro averages pool counts (and equal accuracy).`,
  identities,
  sections,
};

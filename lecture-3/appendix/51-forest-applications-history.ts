import { R, ex, lab, shape, slide, text } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'forest-applications',
    title: 'Appendix: forest applications',
    why: R`Random forests are cheap to train and to evaluate, and they work on raw features (such as pixel comparisons). This is why they were the workhorse of computer vision before deep learning (compare the Pre-DL pipeline of file 40). The examples below are only here to show what "a forest prediction" looks like in practice; there is nothing to derive.`,
    slides: [
      slide('L3', 112, 'Appendix: forest applications (divider)'),
      slide('L3', 113, 'Randomized Forests in Vision'),
    ],
    slideNote: R`Slide 112 is the divider: "Appendix: optional material", the same topic list as before with "Forest applications" highlighted; Reading: K. Murphy (2022), §18.4 Random forests. Slide 113 is a six-panel figure of selected applications, each labelled with its paper: [Amit & Geman, 97] digit recognition (a grid of handwritten characters); [Lepetit et al., 06] keypoint recognition (the same object photographed from two viewpoints); [Moosmann et al., 06] visual word clustering (photographs and their heat-map responses); [Shotton et al., 08] object segmentation (photos of a boat and a bench next to colour labels water, boat, tree, chair, road); [Rogez et al., 08] pose estimation (a walking person with a skeleton overlaid); [Criminisi et al., 09] organ detection (a body scan with coloured organs). Caption: "Selected applications".`,
    pre: [
      text('Reading: K. Murphy (2022), §18.4 Random forests.'),
      text('Selected applications.'),
    ],
    rows: [
      {
        eq: R`\text{task}\ \Rightarrow\ \text{forest output}`,
        notes: [
          lab('digit recognition: the image (or patch) is classified as a character'),
          lab('keypoint recognition: match points of an object between two photos of it taken from different viewpoints'),
          lab('visual word clustering: group local image patches into visual "words" (the picture shows photographs and their response maps)'),
          lab('object segmentation: a class label (water, boat, tree, chair, road) at every pixel'),
          lab('pose estimation: locate the body parts of a person (skeleton overlay)'),
          lab('organ detection: locate organs in a medical scan'),
        ],
      },
    ],
  },
  {
    id: 'kinect',
    circ: 1,
    title: 'Kinect\'s pipeline',
    why: R`This is the one application the lecture explains in detail. It shows how a standard tool of this lecture (a random forest classifier) becomes a real-time system by turning a hard problem into many small classification problems, one per pixel.`,
    slides: [slide('L3', 114, 'Kinect\'s pipeline')],
    slideNote: R`Four pictures from left to right: a photo of a person standing in front of a whiteboard; a Kinect sensor; the person's depth image (blue, silhouetted against a textured background); and Figure 1 of the paper (a depth image, the per-pixel body-part labels as coloured regions on the body, and the 3D joint proposals in a box, "depth image $\to$ body parts $\to$ 3D joint proposals"). Text: "A single depth image supplies a classification problem at each pixel. A random forest predicts body-part labels. The body-part distributions support 3D joint estimates." Source: Shotton et al., CVPR 2011, "Real-Time Human Pose Recognition in Parts from a Single Depth Image".`,
    derive: true,
    pre: [
      text('A single depth image supplies a classification problem at each pixel.'),
      text('A random forest predicts body-part labels.'),
      text('The body-part distributions support 3D joint estimates.'),
    ],
    rows: [
      {
        eq: R`\text{depth image}\ \xrightarrow{\ \text{forest, per pixel}\ }\ \text{body-part distribution}\ \xrightarrow{\ \text{local modes}\ }\ \text{3D joint proposals}`,
        notes: [
          lab('stage 1: for every pixel, ask "which body part does this pixel belong to?": a classification problem with the pixel as the example'),
          lab('stage 2: the forest outputs, for each pixel, a probability for each body part'),
          lab('stage 3: the high-probability regions ("local modes") of those distributions are turned into estimates of where each joint is in 3D'),
        ],
      },
      {
        eq: R`\bar{\mathbf p}(\text{pixel})=\frac1K\sum_{k=1}^{K}\mathbf p_k(\text{pixel}),\qquad\hat c=\operatorname*{arg\,max}_c\ \bar p_c(\text{pixel})`,
        notes: [
          lab(R`the forest prediction is the average of the $K$ tree class distributions (file 37), computed independently at each pixel`),
          shape(R`\mathbf p_k,\ \bar{\mathbf p}:\ C\times1\ (C\ \text{body parts});\ \hat c:\ 1\times1`),
        ],
      },
      {
        eq: R`K=3,\ C=3\ (\text{head, arm, leg}):\ \mathbf p_1=\begin{bmatrix}0.6\\0.3\\0.1\end{bmatrix},\ \mathbf p_2=\begin{bmatrix}0.5\\0.1\\0.4\end{bmatrix},\ \mathbf p_3=\begin{bmatrix}0.7\\0.2\\0.1\end{bmatrix}\ \Rightarrow\ \bar{\mathbf p}=\begin{bmatrix}0.6\\0.2\\0.2\end{bmatrix}`,
        notes: [
          ex(R`entry-wise average: $(0.6+0.5+0.7)/3=0.6$, $(0.3+0.1+0.2)/3=0.2$, $(0.1+0.4+0.1)/3=0.2$. The result still sums to 1. The label is "head". Invented numbers, to show the mechanics`),
          shape(R`3\times1`),
        ],
      },
    ],
  },
  {
    id: 'history-divider',
    circ: 2,
    title: 'Appendix: historical context',
    why: R`Much of what this course calls "machine learning" for regression and classification (least squares, logistic regression, ridge, Bayesian estimation) is old statistics. Knowing the dates shows that deep learning (file 40) reuses these ideas rather than replacing them.`,
    slides: [
      slide('L3', 115, 'Appendix: historical context (divider)'),
      slide('L3', 116, 'Statistical foundations: historical context'),
    ],
    slideNote: R`Slide 115: divider with the sub-topics "Bayesian estimation", "Least squares", "Logistic and ridge regression"; Reading: Wasserman (2004), All of Statistics, Chs. 11, 13 and 22. Slide 116: a timeline of four rows with date ranges on the right. "Bayesian parameter estimation 1763–1774": Bayes (1763), Laplace (1774): infer unknown parameters from data. "Linear regression 1805–1809": Legendre (1805), Gauss (1809): least squares; the term "regression" followed with Galton's work in the 1880s. "Logistic regression 1944–1958": Berkson (1944), Cox (1958): model binary-outcome probabilities. "Ridge regression 1962–1970": Hoerl (1962), Hoerl & Kennard (1970): coefficient shrinkage; the 1970 paper already gives the Gaussian-prior interpretation. Closing line: "Modern machine learning builds on these statistical foundations: learning from data, regularisation and probabilistic prediction." Sources: Wasserman (2004), All of Statistics, Chs. 11, 13 and 22; Hastie, Tibshirani & Friedman (2009), The Elements of Statistical Learning.`,
    pre: [
      text('Wasserman (2004), All of Statistics, Chs. 11, 13 and 22.'),
      text('Hastie, Tibshirani & Friedman (2009), The Elements of Statistical Learning.'),
    ],
    rows: [
      {
        eq: R`1763\text{–}1774\quad\text{Bayesian parameter estimation}`,
        notes: [
          lab('Bayes (1763), Laplace (1774): infer unknown parameters from data'),
          lab(R`this is the posterior of Lecture 1 (the Bayes rule I30 used for MAP and ridge)`),
        ],
      },
      {
        eq: R`1805\text{–}1809\quad\text{Linear regression (least squares)}`,
        notes: [
          lab('Legendre (1805), Gauss (1809): least squares. The term "regression" followed with Galton in the 1880s'),
          lab('Lecture 1: least squares in 1D and in matrix form (files 04 and 05)'),
        ],
      },
      {
        eq: R`1944\text{–}1958\quad\text{Logistic regression}`,
        notes: [
          lab('Berkson (1944), Cox (1958): model binary-outcome probabilities'),
          lab('Lecture 2: logistic regression and softmax (files 17 and 18)'),
        ],
      },
      {
        eq: R`1962\text{–}1970\quad\text{Ridge regression}`,
        notes: [
          lab('Hoerl (1962), Hoerl & Kennard (1970): coefficient shrinkage. The 1970 paper already gives the Gaussian-prior interpretation'),
          lab('Lecture 1: ridge as MAP with a Gaussian prior (file 11)'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Takeaway of the slide',
        text: R`Modern machine learning builds on these statistical foundations: learning from data, regularisation and probabilistic prediction.`,
      },
    ],
  },
];

export const forestApplicationsHistory: Topic = {
  id: 'forest-applications-history',
  title: 'Appendix: forest applications and historical context',
  short: 'Forest applications & history',
  summary: R`Forests were used for digit recognition, keypoints, segmentation, pose and organ detection. Kinect: per-pixel body-part classification by a forest, $\bar{\mathbf p}=\frac1K\sum_k\mathbf p_k$, then 3D joint proposals from the modes. History: Bayes/Laplace 1763–74, least squares 1805–09, logistic regression 1944–58, ridge 1962–70.`,
  identities: [],
  sections,
};

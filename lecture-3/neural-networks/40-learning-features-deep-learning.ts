import { R, con, ex, lab, shape, slide, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'pre-deep-learning',
    title: 'Machine learning before deep learning',
    why: R`Before 2012 most systems had a fixed, hand-designed front end that turned raw data into features, and only the last classifier was trained on labels. Seeing that pipeline makes it clear what deep learning changes: every stage becomes trainable.`,
    slides: [slide('L3', 39, 'Machine Learning pre Deep Learning')],
    slideNote: R`Three pipelines, each a chain of boxes (slide credit: Marc'Aurelio Ranzato, Yann LeCun). VISION: image → SIFT/HOG (fixed) → K-Means / pooling (unsupervised) → classifier (supervised) → "car". SPEECH: waveform → MFCC (fixed) → Mixture of Gaussians (unsupervised) → classifier (supervised) → phoneme. NLP: "This burrito place is yummy and fun!" → Parse Tree / Syntactic (fixed) → n-grams (unsupervised) → classifier (supervised) → "+". The functional form in the rows is added.`,
    derive: true,
    pre: [
      lab('Vision: SIFT/HOG (fixed) → K-Means/pooling (unsupervised) → classifier (supervised)'),
      lab('Speech: MFCC (fixed) → Mixture of Gaussians (unsupervised) → classifier (supervised)'),
      lab('NLP: parse tree/syntactic features (fixed) → n-grams (unsupervised) → classifier (supervised)'),
    ],
    rows: [
      {
        eq: R`\mathbf x\ \xrightarrow{\ \text{fixed}\ }\ \boldsymbol\psi(\mathbf x)\ \xrightarrow{\ \text{unsupervised}\ }\ \mathbf u\ \xrightarrow{\ \text{supervised}\ }\ \hat y=c(\mathbf u)`,
        notes: [
          lab(R`stage 1 is designed by hand (SIFT/HOG, MFCC, parse features): no parameters are fitted. Stage 2 is fitted to the inputs alone, without labels (K-Means, mixture of Gaussians, n-gram counts). Stage 3, the classifier $c$, is the only part that sees the labels $y$`),
          shape(R`\mathbf x:\ \text{raw input (pixels, audio samples, text)};\quad\mathbf u:\ \text{feature vector};\quad\hat y:\ 1\times1\ \text{or}\ C\times1`),
          warn('the features are never adapted to the final task; if they discard something the classifier needs, that is lost for good'),
        ],
      },
    ],
  },
  {
    id: 'learn-compositions',
    circ: 1,
    title: 'Deep learning = learning feature compositions',
    why: R`Deep learning replaces the three hand-built stages with a stack of simple trainable layers. Early layers learn low-level patterns, later layers combine them into parts and objects, and the labels shape all layers at once.`,
    slides: [slide('L3', 40, 'Deep Learning = learning feature compositions'), slide('L3', 41, 'Deep Learning: learn the features!')],
    slideNote: R`Slide 40: image → low-level feature → mid-level feature → high-level feature → trainable classifier → "car"; below, three grids of visualised filters from a convolutional net trained on ImageNet (Zeiler & Fergus 2013): edges and colour blobs (low level), textures and simple parts (mid level), object parts (high level). Slide 41: the same stack for vision, speech and NLP, each drawn as $\mathbf x\to\max(0,W^1\mathbf x)=\mathbf h^1\to\max(0,W^2\mathbf h^1)=\mathbf h^2\to W^3\mathbf h^2=\mathbf o$. Slide credit: Ranzato and LeCun.`,
    derive: true,
    pre: [
      lab('Low-level feature → mid-level feature → high-level feature → trainable classifier → "car"'),
      text('Learn the features!'),
    ],
    rows: [
      {
        eq: R`\mathbf h^1=\max(0,\,W^1\mathbf x),\qquad\mathbf h^2=\max(0,\,W^2\mathbf h^1),\qquad\mathbf o=W^3\mathbf h^2`,
        notes: [
          lab(R`$W^1,W^2,W^3$ are weight matrices, all learned; $\max(0,\cdot)$ is applied to every entry (ReLU, slide 52); $\mathbf h^1,\mathbf h^2$ are the hidden feature vectors; $\mathbf o$ is the output`),
          shape(R`\mathbf x:\ d\times1;\quad W^1:\ n_1\times d,\ \mathbf h^1:\ n_1\times1;\quad W^2:\ n_2\times n_1,\ \mathbf h^2:\ n_2\times1;\quad W^3:\ C\times n_2,\ \mathbf o:\ C\times1`),
          con(R`slide 41 omits the biases; they are added in slide 51`),
        ],
      },
      {
        eq: R`\mathbf o=W^3\max\!\big(0,\,W^2\max(0,\,W^1\mathbf x)\big)`,
        notes: [
          term('Feature composition'),
          lab('substitute row 1 into itself: a function of a function of a function, each layer a feature of the previous one'),
          lab(R`low-level: $\mathbf h^1$; mid-level: $\mathbf h^2$; high-level and classifier: $\mathbf o$`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'What "trainable" now means',
        text: R`In the old pipeline only the classifier had weights fitted to the labels. Here the loss on $\mathbf o$ also pulls on $W^1$ and $W^2$, so the features themselves are shaped to help the final task. How to compute those pulls (gradients) for every layer is backpropagation (files 46–49).`,
      },
    ],
  },
  {
    id: 'alexnet',
    circ: 2,
    title: '2012: AlexNet',
    why: R`This is the result that made the field switch. On the ImageNet benchmark a deep network with learned features beat the best pipeline of hand-built features by a wide margin.`,
    slides: [slide('L3', 42, '2012: AlexNet'), slide('L3', 71, '2012: AlexNet (repeat)')],
    slideNote: R`Figure: AlexNet drawn as a row of green convolutional blocks, then fully connected layers. Text: "AlexNet used a deep convolutional network for ImageNet classification. ImageNet top-5 error: AlexNet 16.4%, best shallow competitor 26%. Next week: convolutional networks and ImageNet." Credit: Krizhevsky, Sutskever and Hinton (2012); comparison reused from Lecture 4. Slide 71 is an exact repeat of slide 42. The gap arithmetic is added.`,
    pre: [
      text('AlexNet used a deep convolutional network for ImageNet classification.'),
      text('ImageNet top-5 error: AlexNet 16.4%. Best shallow competitor: 26%.'),
      text('Next week: convolutional networks and ImageNet.'),
    ],
    rows: [
      {
        eq: R`\text{top-5 error}=\frac{\#\{\text{images whose true class is not among the 5 highest-scoring classes}\}}{\#\{\text{images}\}}`,
        notes: [lab('a prediction counts as correct if the true label is in the five best guesses (1000 classes)')],
      },
      {
        eq: R`26\%-16.4\%=9.6\ \text{percentage points},\qquad\frac{9.6}{26}=0.369\approx37\%\ \text{fewer errors}`,
        notes: [
          ex(R`absolute gap $26-16.4=9.6$ points; relative reduction $9.6/26\approx37\%$`),
          lab('learned features beat the best hand-designed ("shallow") pipeline by more than a third'),
        ],
      },
    ],
  },
];

export const learningFeaturesDeepLearning: Topic = {
  id: 'learning-features-deep-learning',
  title: 'Deep learning: learn the features',
  short: 'Learning features',
  summary: R`Before deep learning: fixed features $\to$ unsupervised stage $\to$ trained classifier. Deep learning: a stack $\mathbf o=W^3\max(0,W^2\max(0,W^1\mathbf x))$ whose layers are all trained from the final loss. AlexNet (2012): 16.4% top-5 ImageNet error against 26% for the best shallow system.`,
  identities: [],
  sections,
};

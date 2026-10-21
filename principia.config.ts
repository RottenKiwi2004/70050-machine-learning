import { R, defineNotebook } from 'principia';
import { identities } from './identities';

export default defineNotebook({
  title: '70050 Machine Learning',
  // Slide badges read "<deck> · <page>". The combined deck "3 Week_1_regression" is decks I and II merged.
  // Deck L2 badges use the PDF page number. Its printed corner numbers run ahead of it: +2 on pages 48–68,
  // +4 on pages 69–166 and +5 on pages 167–169 (e.g. PDF page 49 is printed "51").
  // Deck L3 badges use the PDF page number. Its printed corner numbers run ahead of it: +1 on pages 85–111 and
  // +2 on pages 112–140 (e.g. PDF page 90 is printed "91", PDF page 112 is printed "114").
  decks: [
    { id: 'I', label: 'Week 1 · Regression I (1 Week_1_regression_ I.pdf)', pages: 60 },
    { id: 'II', label: 'Week 1 · Regression II (2 Week_1_regression_II.pdf)', pages: 53 },
    { id: 'L2', label: 'Week 2 · Classification & optimisation (4 Week_2_classification_optimisation.pdf)', pages: 169 },
    { id: 'L3', label: 'Week 3 · Representation learning & neural networks (5 Week_3_representation_learning_neural_networks.pdf)', pages: 142 },
  ],
  identities,
  indexWhy: R`Each derivation leans on a few linear-algebra, vector-calculus and probability rules. Keeping them in one place, with their shapes, lets you look one up from any step instead of re-deriving it.`,
  folders: {
    'lecture-1': 'Lecture 1 · Introduction & regression',
    'lecture-1/regression-1': 'Regression I',
    'lecture-1/regression-2': 'Regression II',
    'lecture-2': 'Lecture 2 · Classification & optimisation',
    'lecture-2/classification': 'Classification',
    'lecture-2/optimisation': 'Optimisation',
    'lecture-2/trees': 'Trees and ensembles',
    'lecture-2/evaluation': 'Decisions and evaluation',
    'lecture-2/appendix': 'Appendix and glossary',
    'lecture-3': 'Lecture 3 · Representation learning & neural networks',
    'lecture-3/overview': 'Features and milestones',
    'lecture-3/trees': 'Trees, committees and forests',
    'lecture-3/kernels': 'Support vectors and kernels',
    'lecture-3/neural-networks': 'Neurons and learned features',
    'lecture-3/expressiveness': 'Expressiveness and depth',
    'lecture-3/backprop': 'Backpropagation',
    'lecture-3/appendix': 'Appendix (optional)',
    widgets: 'Widgets',
  },
  defaultFile: 'lecture-1/regression-1/01-course-overview.ts',
});

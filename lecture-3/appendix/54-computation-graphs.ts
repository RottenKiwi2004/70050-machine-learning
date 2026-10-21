import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const sections: Section[] = [
  {
    id: 'basic-block',
    title: 'Appendix: computation graphs, the basic block',
    why: R`A neural network is just a long formula, and any formula can be drawn as a graph of small operations (add, multiply, exp, ...). Backpropagation then needs nothing but a local rule for each operation. The appendix shows this on scalar examples, where every number can be checked by hand, before returning to the layered picture of file 49.`,
    slides: [
      slide('L3', 132, 'Appendix: computation graphs (divider)'),
      slide('L3', 133, 'Basic block'),
    ],
    slideNote: R`Slide 132 is the divider ("Appendix: optional material"); a figure credited "COMP0169, p. 31"; Reading: K. Murphy (2022), §13.3.4 "Computation graphs"; COMP0169 lecture slides, pp. 24–32. Slide 133 (credited to Niloy, COMP0169, p. 21): "$x_1$ and $x_2$ are scalar inputs." A box labelled $f$ takes the arrows $x_1$ and $x_2$ and outputs $z=f(x_1,x_2)$ (green arrow, forward), which enters a box "Loss" and produces $L$. Red arrows point backwards: $\partial L/\partial z$ leaves the Loss box and enters $f$, and red arrows leave $f$ towards $x_1$ and $x_2$. Below, the local derivatives $\partial z/\partial x_1$ and $\partial z/\partial x_2$ and the products $\dfrac{\partial L}{\partial x_1}=\dfrac{\partial L}{\partial z}\dfrac{\partial z}{\partial x_1}$, $\dfrac{\partial L}{\partial x_2}=\dfrac{\partial L}{\partial z}\dfrac{\partial z}{\partial x_2}$.`,
    derive: true,
    pre: [
      text('Optional appendix material.'),
      text('x₁ and x₂ are scalar inputs.'),
    ],
    rows: [
      {
        eq: R`z=f(x_1,x_2),\qquad L=\text{Loss}(z)`,
        notes: [
          lab(R`forward (green arrows): the block $f$ computes $z$ from its two inputs, and a later block turns $z$ into the loss $L$`),
          shape(R`x_1,\ x_2,\ z,\ L:\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial x_1}=\frac{\partial L}{\partial z}\,\frac{\partial z}{\partial x_1},\qquad\frac{\partial L}{\partial x_2}=\frac{\partial L}{\partial z}\,\frac{\partial z}{\partial x_2}`,
        notes: [
          tag(['I15'], R`scalar chain rule at one block: the "upstream" gradient $\partial L/\partial z$ (arriving from the right, red) times the "local" gradient $\partial z/\partial x_i$ (a property of $f$ alone)`),
          lab('every block does exactly this, so backpropagation is the repeated application of one rule'),
          shape(R`\text{all}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'add-multiply',
    circ: 1,
    title: 'Backpropagation: addition and multiplication',
    why: R`Two blocks, addition and multiplication, already give all the intuition. Addition passes the gradient to both inputs unchanged; multiplication passes it to each input scaled by the other input. Their vector versions are the branch/merge and the linear layer of file 48 and 49.`,
    slides: [
      slide('L3', 134, 'Backpropagation: addition'),
      slide('L3', 135, 'Backpropagation: multiplication'),
    ],
    slideNote: R`Both slides (credited to Niloy, COMP0169, pp. 22 and 23) repeat the diagram of slide 133 with numbers. Addition: $x_1=5$, $x_2=2$, a box "+", $z=x_1+x_2=7$, and $\partial L/\partial z=15$; local derivatives $\partial z/\partial x_1=1$, $\partial z/\partial x_2=1$; results $\partial L/\partial x_1=\frac{\partial L}{\partial z}\cdot1=15$ and $\partial L/\partial x_2=\frac{\partial L}{\partial z}\cdot1=15$. Multiplication: $x_1=5$, $x_2=2$, a box "$\times$", $z=x_1x_2=10$, $\partial L/\partial z=7$; $\partial z/\partial x_1=x_2=2$, $\partial z/\partial x_2=x_1=5$; results $\partial L/\partial x_1=\frac{\partial L}{\partial z}x_2=7\cdot2=14$ and $\partial L/\partial x_2=\frac{\partial L}{\partial z}x_1=7\cdot5=35$.`,
    derive: true,
    rows: [
      {
        eq: R`z=x_1+x_2\ \Rightarrow\ \frac{\partial z}{\partial x_1}=1,\ \frac{\partial z}{\partial x_2}=1\ \Rightarrow\ \frac{\partial L}{\partial x_1}=\frac{\partial L}{\partial z},\ \ \frac{\partial L}{\partial x_2}=\frac{\partial L}{\partial z}`,
        notes: [
          lab(R`addition: a change of 1 in either input changes the output by 1, so each input receives the same gradient as the output ("distributes" it)`),
          ex(R`$x_1=5,x_2=2$: $z=7$. With $\partial L/\partial z=15$: $\partial L/\partial x_1=15\cdot1=15$ and $\partial L/\partial x_2=15\cdot1=15$`),
          shape(R`\text{all}:\ 1\times1`),
        ],
      },
      {
        eq: R`z=x_1x_2\ \Rightarrow\ \frac{\partial z}{\partial x_1}=x_2,\ \frac{\partial z}{\partial x_2}=x_1\ \Rightarrow\ \frac{\partial L}{\partial x_1}=\frac{\partial L}{\partial z}\,x_2,\ \ \frac{\partial L}{\partial x_2}=\frac{\partial L}{\partial z}\,x_1`,
        notes: [
          lab(R`multiplication: increasing $x_1$ by 1 changes $z$ by $x_2$, so the gradient at $x_1$ is the upstream gradient scaled by the OTHER input. This is why the forward values $x_1,x_2$ must be cached`),
          ex(R`$x_1=5,x_2=2$: $z=10$. With $\partial L/\partial z=7$: $\partial L/\partial x_1=7\cdot2=14$ and $\partial L/\partial x_2=7\cdot5=35$`),
          tag(['I92'], R`the weight-gradient rule of file 48 (gradient of the output times the input) is this multiplication rule, applied to all weights and inputs at once`),
          shape(R`\text{all}:\ 1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Add = distribute, multiply = swap',
        text: R`Addition sends the incoming gradient unchanged to both inputs. Multiplication sends it to each input multiplied by the value of the other input (so the roles of $x_1$ and $x_2$ swap). These two rules are enough to differentiate any polynomial computation.`,
      },
    ],
  },
  {
    id: 'example-2-sigmoid',
    circ: 2,
    title: 'Example 2: a neuron as a graph of small operations',
    why: R`The logistic-regression/neuron formula $\sigma(w_0x_0+w_1x_1+w_2)$ looks like one operation, but it is a chain of seven elementary ones. Running backpropagation through that chain, one tiny local rule at a time, gives the same gradient as differentiating the formula directly. The slide only shows the forward values; the backward pass below is the continuation of the exercise.`,
    slides: [slide('L3', 136, 'Example 2')],
    slideNote: R`Credited to Niloy, COMP0169, pp. 28–30. Formula: $f(\mathbf x,\mathbf w)=\dfrac1{1+e^{-(w_0x_0+w_1x_1+w_2)}}$. A graph with green forward values. Inputs: $w_0=2$, $x_0=-1$, $w_1=-3$, $x_1=-2$, $w_2=-3$. Nodes in order: $*$ (of $w_0,x_0$) $=-2$; $*$ (of $w_1,x_1$) $=6$; $+$ of those two $=4$; $+$ with $w_2$ $=1$; "$*{-1}$" $=-1$; $\exp$ $=0.37$; $+1$ $=1.37$; $1/x$ $=0.73$ (the output). Footnote: "Source notation: $w_2$ is the bias $b$; inputs are indexed 0 and 1." The slide shows the forward pass only; rows 2 to 4 below are the matching backward pass.`,
    derive: true,
    pre: [text('Source notation: w₂ is the bias b; inputs are indexed 0 and 1.')],
    rows: [
      {
        eq: R`f=\frac{1}{1+e^{-(w_0x_0+w_1x_1+w_2)}}=\sigma\big(w_0x_0+w_1x_1+w_2\big)`,
        notes: [
          tag(['I64'], R`the logistic function $g(a)=1/(1+e^{-a})$ of Lecture 2, written out with its argument $a=w_0x_0+w_1x_1+w_2$ (a bias $w_2$ and two weights)`),
          shape(R`w_0,w_1,w_2,x_0,x_1,f:\ 1\times1`),
        ],
      },
      {
        eq: R`\begin{aligned}u_1&=w_0x_0=2\cdot(-1)=-2,&u_2&=w_1x_1=(-3)(-2)=6,\\u_3&=u_1+u_2=4,&u_4&=u_3+w_2=1,\\u_5&=-u_4=-1,&u_6&=e^{u_5}=0.368,\\u_7&=1+u_6=1.368,&f&=1/u_7=0.731\end{aligned}`,
        notes: [
          lab('forward pass: the seven operations of the graph, left to right. The values in green on the slide (-2, 6, 4, 1, -1, 0.37, 1.37, 0.73) are exactly these, rounded'),
          lab(R`the slide labels $u_5$'s block "$*{-1}$" (multiply by $-1$)`),
        ],
      },
      {
        eq: R`\begin{aligned}g_f&=1,&g_{u_7}&=-\frac1{u_7^2}\cdot1=-0.534,&g_{u_6}&=1\cdot g_{u_7}=-0.534,\\g_{u_5}&=e^{u_5}\,g_{u_6}=0.368\cdot(-0.534)=-0.197,&g_{u_4}&=-1\cdot g_{u_5}=0.197\end{aligned}`,
        notes: [
          tag(['I37'], R`the rule for each gate: reciprocal $1/u$ has local derivative $-1/u^2$; "$+1$" has local derivative 1 (pass through); $\exp$ has local derivative $e^{u}$ (its own output $u_6$); multiply-by-$-1$ has local derivative $-1$ (flip sign)`),
          lab(R`start at the output with $g_f=\partial L/\partial f=1$ (we take $L=f$ for this exercise) and move right to left, multiplying the upstream gradient by the local derivative at each gate`),
        ],
      },
      {
        eq: R`g_{u_3}=g_{w_2}=g_{u_4}=0.197;\quad g_{u_1}=g_{u_2}=g_{u_3}=0.197;\quad\begin{cases}g_{w_0}=x_0\,g_{u_1}=-0.197,&g_{x_0}=w_0\,g_{u_1}=0.393\\g_{w_1}=x_1\,g_{u_2}=-0.393,&g_{x_1}=w_1\,g_{u_2}=-0.590\end{cases}`,
        notes: [
          lab(R`the two "+" gates copy the gradient 0.197 to both of their inputs (addition rule); the two "$\times$" gates use the other input (multiplication rule): $g_{w_0}=x_0g_{u_1}=(-1)(0.197)$, $g_{x_0}=w_0g_{u_1}=2\cdot0.197$, and so on`),
          ex(R`check against the closed form: for $f=\sigma(a)$ the derivative is $\sigma(a)(1-\sigma(a))=0.731\cdot0.269=0.197$ (I69), equal to $g_{u_4}$ (the gradient at the argument $a$). Then $\partial f/\partial w_0=x_0\cdot0.197$, etc. ✓`),
          shape(R`\text{all gradients}:\ 1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Takeaway',
        text: R`Because we composed seven simple gates, we never differentiated the whole formula. The product of seven local factors telescopes into $\sigma'(a)=\sigma(a)(1-\sigma(a))$. Deep learning libraries do exactly this, automatically, for much bigger graphs.`,
      },
    ],
  },
  {
    id: 'small-computation',
    circ: 3,
    title: 'Backpropagation on a small computation',
    why: R`This is the smallest example with both kinds of gate in one graph: an addition feeding a multiplication. It is the standard first exercise, and it is the one to redo by hand until the two rules are automatic.`,
    slides: [slide('L3', 137, 'Backpropagation on a small computation')],
    slideNote: R`$f=(r+s)\,t$ with $r=3$, $s=5$, $t=-2$. Intermediate: $q=r+s=8$ and $f=qt=-16$. Backward: $\dfrac{\partial f}{\partial q}=t=-2$ and $\dfrac{\partial f}{\partial t}=q=8$; then $\dfrac{\partial f}{\partial r}=\dfrac{\partial f}{\partial q}\cdot1=-2$ and $\dfrac{\partial f}{\partial s}=-2$. Caption: "Multiplication uses the other input. Addition sends the gradient to both inputs." Footer: "Worked example adapted from supplied COMP0169 slides, PDF pp. 24–27".`,
    derive: true,
    pre: [text('Multiplication uses the other input. Addition sends the gradient to both inputs.')],
    rows: [
      {
        eq: R`q=r+s=3+5=8,\qquad f=q\,t=8\cdot(-2)=-16`,
        notes: [lab('forward pass: the addition gate first, then the multiplication gate'), shape(R`\text{all}:\ 1\times1`)],
      },
      {
        eq: R`\frac{\partial f}{\partial q}=t=-2,\qquad\frac{\partial f}{\partial t}=q=8`,
        notes: [
          lab(R`the last gate (multiplication) first: each input gets the other input's value, with upstream gradient $\partial f/\partial f=1$`),
          tag(['I15'], 'see the multiplication rule of slide 135'),
        ],
      },
      {
        eq: R`\frac{\partial f}{\partial r}=\frac{\partial f}{\partial q}\cdot\frac{\partial q}{\partial r}=-2\cdot1=-2,\qquad\frac{\partial f}{\partial s}=\frac{\partial f}{\partial q}\cdot\frac{\partial q}{\partial s}=-2\cdot1=-2`,
        notes: [
          tag(['I15'], R`the addition gate sends the gradient $-2$ unchanged to both inputs (slide 134)`),
          ex(R`check with the closed form $f=(r+s)t=rt+st$: $\partial f/\partial r=t=-2$ ✓, $\partial f/\partial s=t=-2$ ✓, $\partial f/\partial t=r+s=8$ ✓`),
          ex(R`finite difference: $r\to3.01$: $f=(8.01)(-2)=-16.02$, a change of $-0.02$ for a step $0.01$: slope $-2$ ✓`),
        ],
      },
    ],
  },
  {
    id: 'graph-ordering',
    circ: 4,
    title: 'Ordering a computation graph',
    why: R`In a graph with branches, "left to right" is not unique. What matters is that every operation is evaluated after all of its inputs (a topological order). The backward pass needs the opposite guarantee: a node's gradient is complete only when every node that uses it has been processed.`,
    slides: [slide('L3', 138, 'Ordering a computation graph')],
    slideNote: R`Credited to "COMP0169, PDF p. 31". A graph of seven circled nodes $u_1,\dots,u_7$ with an input arrow into $u_1$. Arrows: $u_1\to u_2$, $u_1\to u_3$, $u_1\to u_4$; $u_2\to u_5$, $u_3\to u_5$; $u_4\to u_6$; $u_5\to u_7$, $u_6\to u_7$. Caption: "A forward pass visits each operation after its inputs. Several topological orders can be valid."`,
    derive: true,
    pre: [
      text('A forward pass visits each operation after its inputs.'),
      text('Several topological orders can be valid.'),
    ],
    rows: [
      {
        eq: R`\text{edges: }u_1\to u_2,u_3,u_4;\quad u_2,u_3\to u_5;\quad u_4\to u_6;\quad u_5,u_6\to u_7`,
        notes: [
          term('Directed acyclic graph (DAG)'),
          lab(R`nodes are operations or values; an arrow $a\to b$ means "$b$ uses $a$"; acyclic means no loops, so a forward order exists`),
        ],
      },
      {
        eq: R`\text{valid forward orders, e.g.}\quad u_1,u_2,u_3,u_4,u_5,u_6,u_7\qquad\text{or}\qquad u_1,u_4,u_6,u_2,u_3,u_5,u_7`,
        notes: [
          term('Topological order'),
          lab(R`both satisfy "each node after all its inputs" ($u_5$ after $u_2$ and $u_3$; $u_6$ after $u_4$; $u_7$ last). They give the same values, because each node depends only on its inputs`),
          ex(R`how many orders are valid? $u_1$ is first and $u_7$ last. In the middle, $u_5$ must come after $u_2,u_3$ and $u_6$ after $u_4$. Of the $5!=120$ orderings of $\{u_2,\dots,u_6\}$ a fraction $\tfrac13$ puts $u_5$ after both $u_2,u_3$ and, independently, a fraction $\tfrac12$ puts $u_6$ after $u_4$ (the two conditions involve different nodes), so $120\cdot\tfrac13\cdot\tfrac12=20$ orders`),
        ],
      },
      {
        eq: R`g_{u_1}=\underbrace{g_{u_2}\frac{\partial u_2}{\partial u_1}}_{\text{via }u_2}+\underbrace{g_{u_3}\frac{\partial u_3}{\partial u_1}}_{\text{via }u_3}+\underbrace{g_{u_4}\frac{\partial u_4}{\partial u_1}}_{\text{via }u_4}`,
        notes: [
          tag(['I90'], R`$u_1$ feeds three nodes, so its gradient is the sum of three path contributions (the branch rule of file 49)`),
          lab(R`this sum can only be formed after $g_{u_2},g_{u_3},g_{u_4}$ are all known: the backward pass must visit a node after all nodes that use it, i.e. in a reverse topological order (next slide)`),
          shape(R`\text{all}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'backprop-on-graph',
    circ: 5,
    title: 'Backpropagation on a graph',
    why: R`The whole algorithm is a pair of loops. Forward: visit the gates in a topological order and compute their outputs. Backward: visit them in the reverse order, and let each gate add its contribution to the gradients of its inputs.`,
    slides: [slide('L3', 139, 'Backpropagation on a graph')],
    slideNote: R`Credited to "COMP0169, PDF p. 32". A screenshot of a code listing, a class \`ComputationalGraph\` with two methods. \`forward(inputs)\`: "1. [pass inputs to input gates...]", "2. forward the computational graph:" \`for gate in self.graph.nodes_topologically_sorted(): gate.forward()\`, then \`return loss\` ("the final gate in the graph outputs the loss"). \`backward()\`: \`for gate in reversed(self.graph.nodes_topologically_sorted()): gate.backward()\` ("little piece of backprop (chain rule applied)"), then \`return inputs_gradients\`. Caption: "The backward pass reverses the forward order. Each operation contributes gradients to its inputs."`,
    derive: true,
    pre: [
      text('The backward pass reverses the forward order.'),
      text('Each operation contributes gradients to its inputs.'),
    ],
    rows: [
      {
        eq: R`\textbf{forward:}\ \ \text{for }u\text{ in a topological order: compute }u\text{ from its inputs (and cache them)}`,
        notes: [lab('the loss is the last node; its value is returned')],
      },
      {
        eq: R`\textbf{backward:}\ \ g_{\text{loss}}=1;\ \ \text{for }u\text{ in the reversed order: for every input }v\text{ of }u:\quad g_v\ \mathrel{+}=\ \Big(\frac{\partial u}{\partial v}\Big)^{\!\top}g_u`,
        notes: [
          tag(['I91', 'I90'], R`each gate applies its local backward rule (file 49, slide 101) and ADDS ("+=") the result to its input's gradient, so that a node with several consumers accumulates the sum over its paths`),
          warn(R`the gradients must start at zero and accumulate with += (not assign =), otherwise a node used twice would keep only one of its two contributions`),
          lab(R`the returned \`inputs_gradients\` are the $g_v$ of the input nodes (and parameters)`),
          shape(R`g_u,\ g_v:\ \text{same shape as}\ u,\ v;\ \tfrac{\partial u}{\partial v}:\ (\text{size of }u)\times(\text{size of }v)`),
        ],
      },
    ],
  },
  {
    id: 'information-flow',
    circ: 6,
    title: 'Forward/backward information flow',
    why: R`This closes the loop with the layered picture of the lecture: a feed-forward network is a graph of the same shape, with one layer per node, and the backward flow of gradients mirrors the forward flow of activations.`,
    slides: [slide('L3', 140, 'Forward/backward information flow')],
    slideNote: R`Left (a diagram in the source notation, with $E$ = the loss $L$ and $X_i$ = the activation of layer $i$): a stack of boxes from bottom to top: input $X$ enters as $X_0$ into $F_1(X_0,W_1)$ (with parameters $W_1$ entering from the left and a green arrow $dE/dW_1$ leaving to the left); its output $X_1$ goes up to $F_i(X_{i-1},W_i)$, with the activations $X_i$ going up (red) and the gradients $dE/dX_i$, $dE/dX_{i-1}$, $dE/dX_1$ coming down (green); the last layer $F_n(X_{n-1},W_n)$ outputs $X_n$ into a cost box $C(X_n,Y)$, which also receives the desired output $Y$ from the right and outputs the energy $E$ at the top. Right: the statement "Backpropagation computes gradients in acyclic graphs with suitable local derivatives." and a sketch of a red-framed graph of blue boxes with black arrows (a general acyclic graph). Footnote: "Source notation: $E=L$; $X_i$ is a layer activation."`,
    derive: true,
    pre: [
      text('Backpropagation computes gradients in acyclic graphs with suitable local derivatives.'),
      text('Source notation: E = L; Xᵢ is a layer activation.'),
    ],
    rows: [
      {
        eq: R`X_i=F_i\big(X_{i-1},W_i\big),\quad i=1,\dots,n,\qquad E=C\big(X_n,Y\big)`,
        notes: [
          lab(R`forward flow (red arrows going up): layer $i$ takes the previous activation $X_{i-1}$ and its own parameters $W_i$; the cost $C$ compares the last activation to the desired output $Y$ and gives the loss $E$ ($=L$ of this lecture)`),
          shape(R`X_i:\ \text{one column per layer}\ (n_i\times1);\ E:\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial E}{\partial X_{i-1}}=\Big(\frac{\partial F_i}{\partial X_{i-1}}\Big)^{\!\top}\frac{\partial E}{\partial X_i},\qquad\frac{\partial E}{\partial W_i}=\Big(\frac{\partial F_i}{\partial W_i}\Big)^{\!\top}\frac{\partial E}{\partial X_i}`,
        notes: [
          tag(['I91'], R`backward flow (green arrows going down): the gradient at each activation is computed from the gradient above, and each layer also emits the gradient of its own parameters ($dE/dW_i$, to the left)`),
          lab(R`this is the local backward operation of file 49 (slide 101), with $\mathbf x_{\text{in}}=X_{i-1}$, $\boldsymbol\theta=W_i$, $\mathbf x_{\text{out}}=X_i$ (and the column convention for gradients, C14)`),
          shape(R`\tfrac{\partial E}{\partial X_i}:\ n_i\times1;\ \tfrac{\partial F_i}{\partial X_{i-1}}:\ n_i\times n_{i-1}\ \Rightarrow\ \tfrac{\partial E}{\partial X_{i-1}}:\ n_{i-1}\times1`),
        ],
      },
      {
        eq: R`\text{any acyclic graph: forward in topological order, backward in reverse order, add the contributions of all paths}`,
        notes: [
          lab(R`the right-hand sketch of the slide: no layered structure needed. What is required is that every block has a local derivative ("suitable local derivatives": the operation must be differentiable, or have a usable sub-gradient, such as ReLU at 0)`),
        ],
      },
    ],
  },
];

export const computationGraphs: Topic = {
  id: 'computation-graphs',
  title: 'Appendix: computation graphs',
  short: 'Computation graphs',
  summary: R`Each gate: $g_{\text{in}}=(\partial z/\partial x)^\top g_{\text{out}}$. Add: copy the gradient to both inputs. Multiply: scale by the other input. A node used by several gates sums their contributions. Forward in topological order, backward in reverse order. Worked: $f=(r+s)t$ at $(3,5,-2)$ gives $(-2,-2,8)$; the sigmoid neuron graph gives $g_{u_4}=\sigma(1-\sigma)=0.197$.`,
  identities: [],
  sections,
};

"""Probability pictures: a joint table as areas, the Gaussian likelihood of a mean, prior x likelihood for MAP,
and bias and variance over many datasets.

Build: npm run slides -- <this notes folder>   (in the Principia folder)
"""

import numpy as np
from manim import (
    DL,
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    UR,
    Axes,
    Brace,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    Indicate,
    Line,
    ParametricFunction,
    Rectangle,
    SurroundingRectangle,
    Transform,
    ValueTracker,
    VGroup,
    always_redraw,
)
from manim_slides import Slide

from principia_manim import INK, INK_2, PENS, Caption, Formula, number

GREEN, TEAL, ORANGE, RED, PURPLE, PINK = (PENS[k] for k in ("green", "teal", "orange", "red", "purple", "pink"))


def heading(text: str):
    return Caption(text, scale=0.85, color=PURPLE).to_edge(UP, buff=0.35)


class Say:
    def __init__(self, scene):
        self.scene, self.cur = scene, None

    def __call__(self, text: str):
        new = Caption(text).to_edge(DOWN, buff=0.35)
        if new.width > 13.4:
            new.scale_to_fit_width(13.4)
        anims = [FadeIn(new, shift=UP * 0.15)]
        if self.cur is not None:
            anims.append(FadeOut(self.cur))
        self.cur = new
        return anims


# ---- joint, marginal and conditional as areas ------------------------------------------------------------------


class JointAsAreas(Slide):
    """The fruit-and-box example as a unit square: widths are P(B), heights inside a column are P(Y | B), so every
    area is a joint probability. Marginals add areas; a conditional is a share of one column."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"Joint, marginal and conditional, as areas"))
        S = 4.4
        origin = LEFT * 5.6 + DOWN * 2.0  # bottom left of the square
        pr, pb = 0.40, 0.60
        a_r, a_b = 0.25, 0.75  # P(apple | red box), P(apple | blue box)

        def rect(x0, y0, w, h, color, op=0.45):
            r = Rectangle(width=w * S, height=h * S, stroke_color=INK, stroke_width=2, fill_color=color, fill_opacity=op)
            return r.move_to(origin + RIGHT * (x0 + w / 2) * S + UP * (y0 + h / 2) * S)

        square = rect(0, 0, 1, 1, INK_2, 0.1)
        one = Formula(r"\text{area }1", scale=0.6, color=INK_2).move_to(square)
        self.play(Create(square), FadeIn(one), *say(r"all outcomes together: a square of area 1"))
        self.next_slide()

        red = rect(0, 0, pr, 1, RED, 0.25)
        blue = rect(pr, 0, pb, 1, TEAL, 0.25)
        lr = Formula(r"P(B=r)=0.40", scale=0.5, color=RED).next_to(red, DOWN, buff=0.15).align_to(red, LEFT)
        lb = Formula(r"P(B=b)=0.60", scale=0.5, color=TEAL).next_to(blue, DOWN, buff=0.5).align_to(blue, RIGHT)
        self.play(FadeOut(one), FadeIn(red), FadeIn(blue), FadeIn(lr), FadeIn(lb),
                  *say(r"cut it by box colour: the widths are the marginal $P(B)$"))
        self.next_slide()

        cells = {
            ("a", "r"): rect(0, 0, pr, a_r, GREEN, 0.55), ("o", "r"): rect(0, a_r, pr, 1 - a_r, ORANGE, 0.45),
            ("a", "b"): rect(pr, 0, pb, a_b, GREEN, 0.55), ("o", "b"): rect(pr, a_b, pb, 1 - a_b, ORANGE, 0.45),
        }
        vals = {("a", "r"): 0.10, ("o", "r"): 0.30, ("a", "b"): 0.45, ("o", "b"): 0.15}
        texts = VGroup(*[Formula(rf"{vals[k]:.2f}", scale=0.6).move_to(cells[k]) for k in cells])
        key = VGroup(Formula(r"\htmlClass{c-green}{\blacksquare}\ \text{apple }(Y=a)", scale=0.55),
                     Formula(r"\htmlClass{c-orange}{\blacksquare}\ \text{orange }(Y=o)", scale=0.55)).arrange(DOWN, aligned_edge=LEFT)
        key.next_to(square, RIGHT, buff=0.6).align_to(square, UP)
        self.play(*[FadeIn(c) for c in cells.values()], FadeIn(texts), FadeIn(key),
                  *say(r"cut each column by fruit: every piece's area is a joint probability $P(Y,B)$"))
        self.next_slide()

        eq1 = Formula(r"P(Y=a)=0.10+0.45=0.55", scale=0.65, color=GREEN).next_to(key, DOWN, buff=0.6).align_to(key, LEFT)
        self.play(Indicate(cells[("a", "r")], color=GREEN), Indicate(cells[("a", "b")], color=GREEN), FadeIn(eq1),
                  *say(r"a marginal adds the pieces: all the apple area, whichever box (sum rule)"))
        self.next_slide()

        box = SurroundingRectangle(red, color=RED, buff=0.04, stroke_width=4)
        eq2 = Formula(r"P(Y=a\mid B=r)=\frac{0.10}{0.40}=0.25", scale=0.65, color=RED).next_to(eq1, DOWN, buff=0.45).align_to(key, LEFT)
        self.play(Create(box), FadeIn(eq2),
                  *say(r"a conditional keeps one column only: the apple share of the red column (product rule)"))
        self.next_slide()

        apples = VGroup(cells[("a", "r")], cells[("a", "b")])
        box2 = VGroup(SurroundingRectangle(cells[("a", "r")], color=GREEN, buff=0.03, stroke_width=4),
                      SurroundingRectangle(cells[("a", "b")], color=GREEN, buff=0.03, stroke_width=4))
        eq3 = Formula(r"P(B=r\mid Y=a)=\frac{0.10}{0.55}=\frac{2}{11}", scale=0.65, color=PINK).next_to(eq2, DOWN, buff=0.45).align_to(key, LEFT)
        self.play(FadeOut(box), Create(box2), FadeIn(eq3),
                  *say(r"Bayes turns it round: of all the apple area, the share that is in the red box"))
        self.wait(0.5)


# ---- the likelihood of a Gaussian mean ------------------------------------------------------------------------


class GaussianLikelihood(Slide):
    """Six observations and a Gaussian whose mean slides along: each point's density is a stem up to the curve;
    the log-likelihood adds their logs and is largest when the mean is the sample mean."""

    def construct(self):
        xs = np.array([1.1, 1.9, 2.4, 2.8, 3.6, 4.4])
        sig = 0.9
        xbar = xs.mean()
        say = Say(self)
        self.add(heading(r"Maximum likelihood for the mean $\mu$ of a Gaussian"))
        ax = Axes(x_range=[-0.5, 6.5, 1], y_range=[0, 0.5, 0.1], x_length=8, y_length=3.4, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).to_edge(LEFT, buff=0.5).shift(DOWN * 0.3)
        ll_ax = Axes(x_range=[-0.5, 6.5, 1], y_range=[0, 20, 5], x_length=3.6, y_length=3.4, tips=False,
                     axis_config={"color": INK_2, "stroke_width": 2}).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.3)
        ll_lab = Formula(r"\log L(\mu)", scale=0.55, color=PINK).next_to(ll_ax, UP, buff=0.1)
        mu_lab = Formula(r"\mu", scale=0.55, color=INK_2).next_to(ll_ax.x_axis, DOWN, buff=0.1)
        mu = ValueTracker(0.6)

        pdf = lambda x, m: np.exp(-((x - m) ** 2) / (2 * sig ** 2)) / (np.sqrt(2 * np.pi) * sig)  # noqa: E731
        ll = lambda m: float(np.sum(np.log(pdf(xs, m))))  # noqa: E731

        dots = VGroup(*[Dot(ax.c2p(x, 0), radius=0.07, color=TEAL) for x in xs])
        self.play(Create(ax), FadeIn(dots, lag_ratio=0.1), *say(r"six observations $x_n$, modelled as draws from $\mathcal N(\mu,\sigma^2)$"))
        self.next_slide()

        curve = always_redraw(lambda: ax.plot(lambda x: pdf(x, mu.get_value()), x_range=[-0.5, 6.5, 0.02], color=ORANGE, stroke_width=3))
        stems = always_redraw(lambda: VGroup(*[Line(ax.c2p(x, 0), ax.c2p(x, pdf(x, mu.get_value())), color=GREEN, stroke_width=4) for x in xs]))
        self.play(Create(curve), Create(stems),
                  *say(r"each stem is $p(x_n;\mu,\sigma^2)$; the likelihood multiplies them, the log-likelihood adds their logs"))
        self.next_slide()

        self.play(Create(ll_ax), FadeIn(ll_lab), FadeIn(mu_lab))
        llp = lambda m: max(0.0, ll(m) + 25)  # noqa: E731  (shifted up so the axis sits at the bottom; only the shape matters)
        tracer = always_redraw(lambda: Dot(ll_ax.c2p(mu.get_value(), llp(mu.get_value())), radius=0.07, color=PINK))
        graph = always_redraw(lambda: ll_ax.plot(llp, x_range=[0.6, max(0.61, mu.get_value()), 0.02], color=PINK, stroke_width=3))
        self.add(graph, tracer)
        self.play(mu.animate.set_value(5.6), *say(r"slide $\mu$: far from the data some stems are tiny and $\log L$ is very negative"), run_time=4)
        self.next_slide()

        self.remove(graph)
        self.add(ll_ax.plot(llp, x_range=[0.6, 5.6, 0.02], color=PINK, stroke_width=3), tracer)
        self.play(mu.animate.set_value(xbar), *say(r"the top of $\log L$ is at $\hat\mu=\frac1N\sum_n x_n$, the sample mean"), run_time=2)
        mline = DashedLine(ax.c2p(xbar, 0), ax.c2p(xbar, 0.48), color=PINK)
        mtext = Formula(r"\hat\mu=\bar x", scale=0.55, color=PINK).next_to(mline, UP, buff=0.05)
        peak = DashedLine(ll_ax.c2p(xbar, 0), ll_ax.c2p(xbar, llp(xbar)), color=PINK)
        self.play(Create(mline), FadeIn(mtext), Create(peak))
        self.wait(0.5)


# ---- prior x likelihood --------------------------------------------------------------------------------------


def ellipse(ax, center, cov, level, color, width=2.5, opacity=1.0):
    """The contour (w - c)^T cov^{-1} (w - c) = level^2 of a 2D Gaussian, in axes coordinates."""
    vals, vecs = np.linalg.eigh(cov)
    L = vecs @ np.diag(np.sqrt(vals)) * level
    return ParametricFunction(lambda t: ax.c2p(*(center + L @ np.array([np.cos(t), np.sin(t)]))),
                              t_range=[0, 2 * np.pi, 2 * np.pi / 180], color=color, stroke_width=width, stroke_opacity=opacity)


class PriorTimesLikelihood(Slide):
    """Weights (w1, w2). The likelihood is a Gaussian bump around the least-squares fit, the prior a round bump at
    zero; their product, the posterior, peaks in between: that peak is the MAP (ridge) estimate."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"Posterior $\propto$ likelihood $\times$ prior: MAP sits in between"))
        ax = Axes(x_range=[-2, 4, 1], y_range=[-2, 3, 1], x_length=6.6, y_length=5.5, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).shift(LEFT * 2.6 + DOWN * 0.15)
        w1 = Formula(r"w_1", scale=0.55, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.1)
        w2 = Formula(r"w_2", scale=0.55, color=INK_2).next_to(ax.y_axis, UP, buff=0.1)
        m_ml = np.array([2.6, 1.6])
        C_l = np.array([[0.55, 0.32], [0.32, 0.35]])  # likelihood covariance, sigma^2 (X^T X)^{-1}
        tau = ValueTracker(1.2)

        def post():
            P = np.linalg.inv(C_l) + np.eye(2) / tau.get_value() ** 2
            C = np.linalg.inv(P)
            return C @ (np.linalg.inv(C_l) @ m_ml), C

        self.play(Create(ax), FadeIn(w1), FadeIn(w2), *say(r"each point of the plane is a weight vector $\mathbf w=(w_1,w_2)$"))
        lik = VGroup(*[ellipse(ax, m_ml, C_l, k, TEAL, opacity=1 - 0.25 * (k - 1)) for k in (1, 2, 3)])
        ml = Dot(ax.c2p(*m_ml), color=TEAL)
        ml_t = Formula(r"\hat{\mathbf w}_{\text{ML}}", scale=0.55, color=TEAL).next_to(ml, UR, buff=0.05)
        self.play(Create(lik), FadeIn(ml), FadeIn(ml_t),
                  *say(r"likelihood $p(\mathbf y\mid X,\mathbf w)$: contours around the least-squares fit $\hat{\mathbf w}_{\text{ML}}$"))
        self.next_slide()

        prior = always_redraw(lambda: VGroup(*[ellipse(ax, np.zeros(2), np.eye(2) * tau.get_value() ** 2, k, ORANGE, opacity=1 - 0.25 * (k - 1))
                                                    for k in (1, 2) if k * tau.get_value() < 3.0]))
        self.play(Create(prior), *say(r"prior $p(\mathbf w)=\mathcal N(\mathbf 0,\tau^2I)$: round contours, small weights are more probable"))
        self.next_slide()

        post_c = always_redraw(lambda: VGroup(*[ellipse(ax, post()[0], post()[1], k, PINK, width=3.5) for k in (1, 2)]))
        mp = always_redraw(lambda: Dot(ax.c2p(*post()[0]), color=PINK, radius=0.1))
        mp_t = always_redraw(lambda: Formula(r"\hat{\mathbf w}_{\text{MAP}}", scale=0.55, color=PINK).next_to(mp, DL, buff=0.05))
        self.play(Create(post_c), FadeIn(mp), FadeIn(mp_t),
                  *say(r"posterior $\propto$ likelihood $\times$ prior: its peak $\hat{\mathbf w}_{\text{MAP}}$ is pulled from $\hat{\mathbf w}_{\text{ML}}$ towards $\mathbf 0$"))
        self.next_slide()

        lam = always_redraw(lambda: VGroup(
            Formula(r"\lambda=\sigma^2/\tau^2=", scale=0.65, color=INK),
            number(0.5 / tau.get_value() ** 2, 2, font_size=30)).arrange(RIGHT, buff=0.3).to_edge(RIGHT, buff=1.0).shift(UP * 1.2))
        self.play(FadeIn(lam))
        self.play(tau.animate.set_value(0.45), *say(r"a narrower prior (small $\tau$, large $\lambda$) pulls harder: stronger ridge, smaller weights"), run_time=3)
        self.next_slide()
        self.play(tau.animate.set_value(2.2), *say(r"a flat prior (large $\tau$, $\lambda\to0$) lets the data win: MAP $\to$ ML, plain least squares"), run_time=3)
        self.wait(0.5)


# ---- bias and variance ---------------------------------------------------------------------------------------


class BiasVariance(Slide):
    """Draw many training sets from the same source and fit each one: the average fit m(x) misses f*(x) by the bias;
    the fits scatter around m(x) by the variance. A simple model has large bias, a flexible one large variance."""

    def construct(self):
        rng = np.random.default_rng(11)
        f = lambda x: np.sin(np.pi * x)  # noqa: E731
        say = Say(self)
        self.add(heading(r"Bias and variance: average over many training sets"))
        x0 = 0.5

        def panel(shift):
            return Axes(x_range=[-1, 1, 0.5], y_range=[-1.8, 1.8, 1], x_length=5.8, y_length=4.0, tips=False,
                        axis_config={"color": INK_2, "stroke_width": 2}).shift(shift)

        def fits(deg, n=14):
            out = []
            for _ in range(n):
                x = rng.uniform(-1, 1, 20)
                y = f(x) + rng.normal(0, 0.3, x.size)
                out.append(np.polyfit(x, y, deg))
            return out

        L = panel(LEFT * 3.4 + DOWN * 0.25)
        R = panel(RIGHT * 3.4 + DOWN * 0.25)
        tl = Formula(r"\text{degree 1 (simple)}", scale=0.55, color=INK).next_to(L, UP, buff=0.1)
        tr = Formula(r"\text{degree 5 (flexible)}", scale=0.55, color=INK).next_to(R, UP, buff=0.1)
        truth = [a.plot(f, x_range=[-1, 1, 0.01], color=GREEN, stroke_width=4) for a in (L, R)]
        self.play(Create(L), Create(R), FadeIn(tl), FadeIn(tr), *[Create(t) for t in truth],
                  *say(r"the true function $f^*(x)$ (green); every training set is 20 noisy samples of it"))
        self.next_slide()

        groups = []
        for a, deg in ((L, 1), (R, 5)):
            cs = fits(deg)
            g = VGroup(*[a.plot(lambda x, c=c: float(np.clip(np.polyval(c, x), -1.8, 1.8)), x_range=[-0.95, 0.95, 0.01],
                                color=TEAL, stroke_width=1.6, stroke_opacity=0.55) for c in cs])
            mean = a.plot(lambda x, cs=cs: float(np.clip(np.mean([np.polyval(c, x) for c in cs]), -1.8, 1.8)), x_range=[-0.95, 0.95, 0.01],
                          color=PINK, stroke_width=4)
            groups.append((a, cs, g, mean))
        self.play(*[Create(g, lag_ratio=0.1) for _, _, g, _ in groups],
                  *say(r"fit each training set: one teal curve $\hat f_{\mathcal D}$ per dataset"), run_time=2.5)
        self.next_slide()
        self.play(*[Create(m) for *_, m in groups], *say(r"their average $m(x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(x)]$ (pink)"))
        self.next_slide()

        marks = VGroup()
        for a, cs, g, m in groups:
            vals = np.array([np.polyval(c, x0) for c in cs])
            mv, fv = float(np.clip(vals.mean(), -1.8, 1.8)), f(x0)
            bias = Line(a.c2p(x0, fv), a.c2p(x0, mv), color=ORANGE, stroke_width=6)
            spread = Line(a.c2p(x0 + 0.12, np.clip(mv - vals.std(), -1.8, 1.8)), a.c2p(x0 + 0.12, np.clip(mv + vals.std(), -1.8, 1.8)),
                          color=PURPLE, stroke_width=6)
            marks.add(bias, spread)
        key = VGroup(Formula(r"\htmlClass{c-orange}{\blacksquare}\ \text{bias: }m(x)-f^*(x)", scale=0.5),
                     Formula(r"\htmlClass{c-purple}{\blacksquare}\ \text{spread: }\sqrt{\text{variance}}", scale=0.5)).arrange(RIGHT, buff=0.6)
        key.next_to(VGroup(L, R), DOWN, buff=0.12)
        self.play(FadeIn(marks), FadeIn(key),
                  *say(r"at $x=0.5$: simple model, big bias, small spread; flexible model, small bias, big spread"))
        self.next_slide()
        self.play(*say(r"expected error $=$ bias$^2+$ variance $+$ noise: the best model balances the first two"))
        self.wait(0.5)

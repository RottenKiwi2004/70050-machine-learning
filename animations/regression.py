"""Regression pictures for Lecture 1: matrix shapes, least squares as a projection, kernel smoothing,
model complexity and K-fold cross-validation.

Build: npm run slides -- <this notes folder>   (in the Principia folder)
"""

import numpy as np
from manim import (
    DEGREES,
    DOWN,
    IN,
    LEFT,
    ORIGIN,
    PI,
    RIGHT,
    UP,
    Arrow,
    Arrow3D,
    Axes,
    Brace,
    Create,
    DashedLine,
    Dot,
    Dot3D,
    FadeIn,
    FadeOut,
    Indicate,
    Line,
    Line3D,
    Polygon,
    Rectangle,
    ReplacementTransform,
    Rotate,
    SurroundingRectangle,
    ThreeDAxes,
    TracedPath,
    Transform,
    TransformFromCopy,
    ValueTracker,
    VGroup,
    always_redraw,
)
from manim_slides import Slide, ThreeDSlide

from principia_manim import INK, INK_2, PENS, Caption, Formula, number

GREEN, TEAL, ORANGE, RED, PURPLE, PINK = (PENS[k] for k in ("green", "teal", "orange", "red", "purple", "pink"))


def heading(text: str):
    return Caption(text, scale=0.85, color=PURPLE).to_edge(UP, buff=0.35)


class Say:
    """The caption at the bottom of the slide: say("...") fades the old one out and the new one in."""

    def __init__(self, scene, fixed: bool = False):
        self.scene, self.fixed, self.cur = scene, fixed, None

    def __call__(self, text: str):
        new = Caption(text).to_edge(DOWN, buff=0.35)
        if new.width > 13.4:
            new.scale_to_fit_width(13.4)
        if self.fixed:
            self.scene.add_fixed_in_frame_mobjects(new)
            new.to_edge(DOWN, buff=0.35)
        anims = [FadeIn(new, shift=UP * 0.15)]
        if self.cur is not None:
            anims.append(FadeOut(self.cur))
        self.cur = new
        return anims


# ---- the shapes of y = Xw + e ---------------------------------------------------------------------------------


def block(w: float, h: float, label: str, color: str = INK_2, fill: float = 0.12):
    r = Rectangle(width=w, height=h, stroke_color=color, stroke_width=2.5, fill_color=color, fill_opacity=fill)
    t = Formula(label, scale=0.9).move_to(r)
    return VGroup(r, t)


def size_label(m, tex: str, side=DOWN):
    return Formula(tex, scale=0.55, color=GREEN).next_to(m, side, buff=0.18)


class MatrixShapes(Slide):
    """y = Xw + e as blocks: each block's size is its shape, so a product only fits when the inner sizes agree."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"The shapes in $\mathbf y=X\mathbf w+\boldsymbol\varepsilon$"))
        H, Wd, c = 3.2, 2.0, 0.55  # N rows tall, D+1 columns wide, one column wide
        y = block(c, H, r"\mathbf y", TEAL)
        X = block(Wd, H, "X", PURPLE)
        ones = Rectangle(width=Wd / 4, height=H, stroke_width=0, fill_color=RED, fill_opacity=0.35)
        ones.align_to(X[0], LEFT).align_to(X[0], UP)
        one_t = Formula(r"\htmlClass{c-red}{1}", scale=0.7).move_to(ones).align_to(ones, UP).shift(DOWN * 0.15)
        cols = VGroup(*[Line(X[0].get_corner(UP + LEFT) + RIGHT * Wd / 4 * k, X[0].get_corner(DOWN + LEFT) + RIGHT * Wd / 4 * k,
                             stroke_color=PURPLE, stroke_width=1, stroke_opacity=0.6) for k in (1, 2, 3)])
        X.add(ones, cols, one_t)
        w = block(c, Wd, r"\mathbf w", ORANGE)
        e = block(c, H, r"\boldsymbol\varepsilon", INK_2)
        eq, plus = Formula("=", scale=0.8), Formula("+", scale=0.8)
        row = VGroup(y, eq, X, w, plus, e).arrange(RIGHT, buff=0.35)
        w.shift(RIGHT * 0.45)
        VGroup(plus, e).shift(RIGHT * 1.0)
        w.align_to(X, UP)
        row.move_to(ORIGIN + UP * 0.25)
        labels = VGroup(size_label(y, r"N\times1"), size_label(X, r"N\times(D+1)"), size_label(w, r"(D+1)\times1"),
                        size_label(e, r"N\times1"))

        self.play(FadeIn(row, lag_ratio=0.15), *say(r"one row per sample, stacked: $N$ equations at once"), run_time=1.6)
        self.play(FadeIn(labels, lag_ratio=0.2))
        self.next_slide()

        # one row: y_i = x_i^T w + e_i
        band_y = H / 5
        def band(m):
            return Rectangle(width=m[0].width + 0.12, height=band_y, stroke_color=PINK, stroke_width=3).move_to(m[0]).align_to(m[0], UP).shift(DOWN * band_y * 1.5)
        bands = VGroup(band(y), band(X), band(e))
        wbox = SurroundingRectangle(w[0], color=PINK, buff=0.06)
        self.play(Create(bands), Create(wbox),
                  *say(r"row $i$: $y_i=\mathbf x_i^\top\mathbf w+\varepsilon_i$, one sample's row of $X$ times the whole $\mathbf w$"))
        self.next_slide()

        # inner sizes agree
        bx = Brace(X[0], UP, color=GREEN)
        bw = Brace(w[0], RIGHT, color=GREEN)
        bxt = Formula(r"D+1", scale=0.55, color=GREEN).next_to(bx, UP, buff=0.08)
        bwt = Formula(r"D+1", scale=0.55, color=GREEN).next_to(bw, RIGHT, buff=0.08)
        self.play(FadeOut(bands), FadeOut(wbox), FadeIn(bx), FadeIn(bxt), FadeIn(bw), FadeIn(bwt),
                  *say(r"the width of $X$ equals the height of $\mathbf w$ (both $D+1$), so $X\mathbf w$ exists and is $N\times1$"))
        self.next_slide()

        # X^T X: turn X on its side
        self.play(FadeOut(VGroup(y, eq, w, plus, e, labels, bx, bxt, bw, bwt)), X.animate.move_to(LEFT * 1.2 + UP * 0.2))
        Xt = block(H, Wd, r"X^\top", PURPLE)
        top_ones = Rectangle(width=H, height=Wd / 4, stroke_width=0, fill_color=RED, fill_opacity=0.35)
        top_ones.align_to(Xt[0], UP).align_to(Xt[0], LEFT)
        rows_ = VGroup(*[Line(Xt[0].get_corner(UP + LEFT) + DOWN * Wd / 4 * k, Xt[0].get_corner(UP + RIGHT) + DOWN * Wd / 4 * k,
                              stroke_color=PURPLE, stroke_width=1, stroke_opacity=0.6) for k in (1, 2, 3)])
        Xt.add(top_ones, rows_)
        Xt.next_to(X, LEFT, buff=0.5).align_to(X, UP)
        self.play(TransformFromCopy(X, Xt), *say(r"transpose: $X^\top$ is $X$ turned on its side, $(D+1)\times N$: rows become columns"), run_time=1.4)
        l1 = size_label(Xt[0], r"(D+1)\times N")
        l2 = size_label(X[0], r"N\times(D+1)")
        self.play(FadeIn(l1), FadeIn(l2))
        self.next_slide()

        eq2 = Formula("=", scale=0.8).next_to(X, RIGHT, buff=0.4)
        G = block(Wd, Wd, r"X^\top X", GREEN).next_to(eq2, RIGHT, buff=0.4)
        lg = size_label(G[0], r"(D+1)\times(D+1)")
        self.play(FadeIn(eq2), FadeIn(G), FadeIn(lg),
                  *say(r"inner sizes $N$ and $N$ cancel: $X^\top X$ is $(D+1)\times(D+1)$, small and square however many samples"))
        self.next_slide()

        y2 = block(c, H, r"\mathbf y", TEAL).move_to(X)
        G2 = VGroup(Rectangle(width=c, height=Wd, stroke_color=TEAL, stroke_width=2.5, fill_color=TEAL, fill_opacity=0.12))
        G2.move_to(G).align_to(G, LEFT)
        G2.add(Formula(r"X^\top\mathbf y", scale=0.8).next_to(G2[0], RIGHT, buff=0.2))
        lg2 = size_label(G2[0], r"(D+1)\times1")
        self.play(ReplacementTransform(X, y2), FadeOut(l2), ReplacementTransform(G, G2), ReplacementTransform(lg, lg2),
                  *say(r"and $X^\top\mathbf y$ is $(D+1)\times1$: so $X^\top X\,\hat{\mathbf w}=X^\top\mathbf y$ is $D+1$ equations in $D+1$ unknowns"))
        self.wait(0.5)


# ---- least squares is a projection ---------------------------------------------------------------------------


class NormalEquationsAsProjection(ThreeDSlide):
    """N = 3 samples, so y is a point in 3D. Xw for every w fills a plane (the span of X's two columns); least squares
    picks the point of that plane nearest y, where the residual is perpendicular to the plane: X^T(y - Xw) = 0."""

    def construct(self):
        a = np.array([2.2, 0.4, 0.5])   # column 1 of X
        b = np.array([0.2, 2.0, 0.6])   # column 2 of X
        yv = np.array([1.4, 1.1, 2.4])
        X = np.stack([a, b], axis=1)
        w_hat = np.linalg.solve(X.T @ X, X.T @ yv)
        p = X @ w_hat

        axes = ThreeDAxes(x_range=[-0.5, 3, 1], y_range=[-0.5, 3, 1], z_range=[-0.5, 3, 1], x_length=6, y_length=6, z_length=5,
                          axis_config={"color": INK_2, "stroke_width": 1.5, "include_tip": False}).shift(IN * 1.3)
        self.set_camera_orientation(phi=68 * DEGREES, theta=-38 * DEGREES, zoom=0.92)
        c = axes.c2p
        title = heading(r"Least squares is a projection")
        self.add_fixed_in_frame_mobjects(title)
        say = Say(self, fixed=True)

        plane = Polygon(c(*(-0.25 * a - 0.25 * b)), c(*(1.1 * a - 0.25 * b)), c(*(1.1 * a + 1.1 * b)), c(*(-0.25 * a + 1.1 * b)),
                        stroke_color=PURPLE, stroke_width=1.5, fill_color=PURPLE, fill_opacity=0.18)
        va = Arrow3D(c(0, 0, 0), c(*a), color=PURPLE, thickness=0.015)
        vb = Arrow3D(c(0, 0, 0), c(*b), color=PURPLE, thickness=0.015)
        vy = Arrow3D(c(0, 0, 0), c(*yv), color=TEAL, thickness=0.02)
        self.add(axes)
        self.play(Create(va), Create(vb), *say(r"$N=3$ samples: $\mathbf y$ and each column of $X$ are arrows in 3D"))
        self.play(Create(vy))
        self.next_slide()

        self.play(FadeIn(plane), *say(r"every $X\mathbf w=w_1\mathbf x_{:,1}+w_2\mathbf x_{:,2}$ lies in the plane of the columns"))
        self.next_slide()

        # try a w: the residual from y to Xw
        t = ValueTracker(0.0)
        start = np.array([0.3, 0.2])
        def cur():
            s = t.get_value()
            return X @ ((1 - s) * start + s * w_hat)
        dot = always_redraw(lambda: Dot3D(c(*cur()), radius=0.07, color=ORANGE))
        res = always_redraw(lambda: Line3D(c(*cur()), c(*yv), color=RED, thickness=0.012))
        self.play(FadeIn(dot), Create(res), *say(r"a guess $X\mathbf w$ (orange) and its residual $\mathbf y-X\mathbf w$ (red): the loss is its squared length"))
        self.next_slide()
        self.play(t.animate.set_value(1.0), *say(r"move $\mathbf w$ to shorten the residual: the shortest one drops straight down onto the plane"), run_time=2.5)
        self.begin_ambient_camera_rotation(rate=0.12)
        self.wait(2)
        self.stop_ambient_camera_rotation()
        self.next_slide()

        # the right angle
        n = (yv - p) / np.linalg.norm(yv - p)
        u = a / np.linalg.norm(a)
        s = 0.25
        corner = Polygon(c(*p), c(*(p + s * u)), c(*(p + s * u + s * n)), c(*(p + s * n)), stroke_color=INK, stroke_width=2, fill_opacity=0)
        self.play(Create(corner), *say(r"at $\hat{\mathbf w}$ the residual is perpendicular to both columns: $X^\top(\mathbf y-X\hat{\mathbf w})=\mathbf 0$"))
        self.next_slide()
        self.play(*say(r"multiply out: $X^\top X\,\hat{\mathbf w}=X^\top\mathbf y$, the Normal Equation, and $X\hat{\mathbf w}$ is the projection of $\mathbf y$"))
        self.begin_ambient_camera_rotation(rate=-0.12)
        self.wait(2.5)
        self.stop_ambient_camera_rotation()


# ---- kernel regression ---------------------------------------------------------------------------------------


class KernelSmoothing(Slide):
    """A prediction at x is a weighted average of the y_i, with Gaussian weights around x. The bandwidth h sets how
    far the weights reach: small h follows the data, large h flattens towards the overall mean."""

    def construct(self):
        rng = np.random.default_rng(3)
        xs = np.sort(rng.uniform(0.03, 0.97, 22))
        ys = np.sin(2 * np.pi * xs) * 0.8 + rng.normal(0, 0.18, xs.size)
        say = Say(self)
        self.add(heading(r"Kernel regression: a weighted average of nearby $y_i$"))
        axes = Axes(x_range=[0, 1, 0.25], y_range=[-1.6, 1.6, 0.5], x_length=10, y_length=4.6, tips=False,
                    axis_config={"color": INK_2, "stroke_width": 2}).shift(DOWN * 0.15)
        h = ValueTracker(0.12)
        q = ValueTracker(0.3)

        def weights(x0, hh):
            k = np.exp(-((xs - x0) ** 2) / (2 * hh ** 2))
            return k / k.sum()

        def pred(x0, hh):
            return float(weights(x0, hh) @ ys)

        dots = always_redraw(lambda: VGroup(*[
            Dot(axes.c2p(x, y), radius=0.05 + 0.22 * np.sqrt(wt), color=TEAL, fill_opacity=0.35 + 0.65 * min(1, wt * 6))
            for x, y, wt in zip(xs, ys, weights(q.get_value(), h.get_value()))]))
        plain = VGroup(*[Dot(axes.c2p(x, y), radius=0.06, color=TEAL) for x, y in zip(xs, ys)])
        self.play(Create(axes), FadeIn(plain, lag_ratio=0.05), *say(r"$N$ observations $(x_i,y_i)$; we want $\hat y(x)$ at a new $x$"))
        self.next_slide()

        bump = always_redraw(lambda: axes.plot(
            lambda x: -1.6 + 1.1 * np.exp(-((x - q.get_value()) ** 2) / (2 * h.get_value() ** 2)),
            x_range=[0, 1, 0.004], color=ORANGE, stroke_width=3))
        qline = always_redraw(lambda: DashedLine(axes.c2p(q.get_value(), -1.6), axes.c2p(q.get_value(), 1.6), color=ORANGE, stroke_width=2))
        self.play(ReplacementTransform(plain, dots), Create(qline), Create(bump),
                  *say(r"the kernel $K_h(x-x_i)$ (orange) weights each point by its distance: big dots count more, $\alpha_i(x)$ sum to 1"))
        self.next_slide()

        pdot = always_redraw(lambda: Dot(axes.c2p(q.get_value(), pred(q.get_value(), h.get_value())), radius=0.11, color=RED))
        self.play(FadeIn(pdot), *say(r"$\hat y(x)=\sum_i\alpha_i(x)\,y_i$ (red): the weighted average of the $y_i$"))
        self.next_slide()

        self.play(q.animate.set_value(0.02), run_time=0.8)
        trace = TracedPath(pdot.get_center, stroke_color=RED, stroke_width=3)
        self.add(trace)
        self.play(q.animate.set_value(0.98), *say(r"slide $x$ across: the red dot draws the prediction curve ($h=0.12$)"), run_time=4)
        self.next_slide()

        curve_small = axes.plot(lambda x: pred(x, 0.12), x_range=[0, 1, 0.004], color=RED, stroke_width=3)
        self.remove(trace)
        self.add(curve_small)
        for hv, text in ((0.4, r"larger $h$: wider weights, a smoother curve; as $h\to\infty$ it tends to the mean $\frac1N\sum_i y_i$"),
                         (0.03, r"smaller $h$: only the nearest points count, and the curve chases the noise")):
            target = axes.plot(lambda x, hv=hv: pred(x, hv), x_range=[0, 1, 0.002], color=RED, stroke_width=3)
            self.play(h.animate.set_value(hv), q.animate.set_value(0.5), Transform(curve_small, target), *say(text), run_time=2)
            self.next_slide()
        target = axes.plot(lambda x: pred(x, 0.12), x_range=[0, 1, 0.004], color=RED, stroke_width=3)
        self.play(h.animate.set_value(0.12), Transform(curve_small, target),
                  *say(r"$h$ trades smoothness against fidelity: choose it on validation data"), run_time=1.5)
        self.wait(0.5)


# ---- model complexity ------------------------------------------------------------------------------------------


class PolynomialDegree(Slide):
    """Fits of degree 1, 3 and 9 to ten points: training error keeps falling, validation error falls then rises."""

    def construct(self):
        rng = np.random.default_rng(7)
        f = lambda x: np.sin(2 * np.pi * x)  # noqa: E731
        xt = np.linspace(0.05, 0.95, 10) + rng.uniform(-0.02, 0.02, 10)
        yt = f(xt) + rng.normal(0, 0.25, xt.size)
        xv = np.sort(rng.uniform(0.02, 0.98, 30))
        yv = f(xv) + rng.normal(0, 0.25, xv.size)
        degrees = list(range(0, 10))
        fits = {d: np.polyfit(xt, yt, d) for d in degrees}
        tr = {d: float(np.mean((np.polyval(fits[d], xt) - yt) ** 2)) for d in degrees}
        va = {d: float(np.mean((np.polyval(fits[d], xv) - yv) ** 2)) for d in degrees}

        say = Say(self)
        self.add(heading(r"Model complexity: training error vs validation error"))
        ax = Axes(x_range=[0, 1, 0.25], y_range=[-2.5, 2.5, 1], x_length=6.2, y_length=4.4, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).to_edge(LEFT, buff=0.6).shift(DOWN * 0.2)
        er = Axes(x_range=[0, 9, 1], y_range=[0, 1.2, 0.4], x_length=5.2, y_length=4.0, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).to_edge(RIGHT, buff=0.6).shift(DOWN * 0.2)
        er_x = Formula(r"\text{degree }q", scale=0.5, color=INK_2).next_to(er.x_axis, DOWN, buff=0.15)
        er_y = Formula(r"\text{MSE}", scale=0.5, color=INK_2).next_to(er.y_axis, UP, buff=0.1)
        tdots = VGroup(*[Dot(ax.c2p(x, y), radius=0.07, color=TEAL) for x, y in zip(xt, yt)])
        vdots = VGroup(*[Dot(ax.c2p(x, y), radius=0.05, color=ORANGE, fill_opacity=0.0, stroke_width=2, stroke_color=ORANGE) for x, y in zip(xv, yv)])

        def curve(d):
            return ax.plot(lambda x: float(np.clip(np.polyval(fits[d], x), -2.5, 2.5)), x_range=[0.0, 1.0, 0.002], color=RED, stroke_width=3)

        self.play(Create(ax), FadeIn(tdots), Create(er), FadeIn(er_x), FadeIn(er_y),
                  *say(r"ten training points (teal); fit polynomials $w_0+w_1x+\dots+w_qx^q$ by least squares"))
        self.next_slide()

        cur = curve(1)
        self.play(Create(cur), *say(r"degree 1: too simple, it misses the shape (underfitting)"))
        trd, vad = VGroup(), VGroup()
        def mark(d):
            a = Dot(er.c2p(d, min(tr[d], 1.2)), radius=0.07, color=TEAL)
            b = Dot(er.c2p(d, min(va[d], 1.2)), radius=0.07, color=ORANGE)
            trd.add(a); vad.add(b)
            return [FadeIn(a), FadeIn(b)]
        self.play(*mark(0), *mark(1))
        self.next_slide()

        self.play(Transform(cur, curve(3)), *mark(2), *mark(3), *say(r"degree 3: follows the trend, both errors low"))
        self.next_slide()

        self.play(Transform(cur, curve(9)), *[a for d in range(4, 10) for a in mark(d)],
                  *say(r"degree 9: through every training point (training error $\approx0$), wild in between (overfitting)"))
        self.next_slide()

        self.play(FadeIn(vdots), *say(r"new data (orange rings) shows it: validation error rises again past the sweet spot"))
        trl = VGroup(*[Line(er.c2p(d, min(tr[d], 1.2)), er.c2p(d + 1, min(tr[d + 1], 1.2)), color=TEAL) for d in range(9)])
        val = VGroup(*[Line(er.c2p(d, min(va[d], 1.2)), er.c2p(d + 1, min(va[d + 1], 1.2)), color=ORANGE) for d in range(9)])
        self.play(Create(trl), Create(val))
        best = min(va, key=va.get)
        ring = Dot(er.c2p(best, min(va[best], 1.2)), radius=0.16, color=ORANGE, fill_opacity=0, stroke_width=3)
        self.play(Create(ring), Transform(cur, curve(best)),
                  *say(rf"pick the complexity with the lowest validation error (here degree {best}), not the lowest training error"))
        self.wait(0.5)


# ---- K-fold cross-validation ----------------------------------------------------------------------------------


class KFoldCV(Slide):
    """K = 5 folds: each fold takes a turn as validation data; CV is the average of the five scores."""

    def construct(self):
        K = 5
        say = Say(self)
        self.add(heading(r"$K$-fold cross-validation, $K=5$"))
        scores = [0.31, 0.27, 0.35, 0.29, 0.33]
        cw, ch = 1.6, 0.5
        rows = VGroup()
        texts = VGroup()
        data = VGroup(*[Rectangle(width=cw, height=ch, stroke_color=INK_2, stroke_width=2, fill_color=INK_2, fill_opacity=0.15)
                        for _ in range(K)]).arrange(RIGHT, buff=0.06).move_to(UP * 2.2 + RIGHT * 0.2)
        dlab = Formula(r"\text{training data}", scale=0.55, color=INK_2).next_to(data, LEFT, buff=0.3)
        self.play(FadeIn(data), FadeIn(dlab), *say(r"shuffle the training data and cut it into $K$ equal folds"))
        self.next_slide()
        for k in range(K):
            r = data.copy()
            for j, cell in enumerate(r):
                cell.set_fill(ORANGE if j == k else TEAL, opacity=0.55 if j == k else 0.25).set_stroke(ORANGE if j == k else TEAL)
            r.move_to(UP * (1.2 - 0.72 * k) + RIGHT * 0.2)
            lab = Formula(rf"\text{{fit }}{k + 1}", scale=0.55, color=INK).next_to(r, LEFT, buff=0.3)
            sc = Formula(rf"\hat R^{{({k + 1})}}_{{\text{{val}}}}={scores[k]:.2f}", scale=0.55, color=ORANGE).next_to(r, RIGHT, buff=0.4)
            rows.add(VGroup(lab, r)); texts.add(sc)
            text = (r"fit $k$: train on the teal folds, score on the orange one" if k == 0 else
                    r"each fold is the validation fold exactly once" if k == 1 else None)
            anims = [FadeIn(rows[-1], shift=DOWN * 0.2), FadeIn(sc)]
            if text:
                anims += say(text)
            self.play(*anims, run_time=0.9)
            if k < 2:
                self.next_slide()
        self.next_slide()
        cv = Formula(r"\mathrm{CV}(\lambda)=\tfrac15(0.31+0.27+0.35+0.29+0.33)=0.31", scale=0.7, color=GREEN).move_to(DOWN * 2.35)
        self.play(FadeIn(cv), *say(r"average the $K$ scores: one number per setting $\lambda$; repeat for each $\lambda$ and keep the smallest"))
        self.wait(0.5)

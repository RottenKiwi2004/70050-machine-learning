"""Why L1 gives sparse weights and L2 does not: grow the loss contours until they first touch the constraint set.

Build: npm run slides -- <this notes folder>   (in the Principia folder)
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    UR,
    Axes,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Indicate,
    ParametricFunction,
    Polygon,
    Transform,
    ValueTracker,
    VGroup,
    always_redraw,
)
from manim_slides import Slide

from principia_manim import INK, INK_2, PENS, Caption, Formula

GREEN, TEAL, ORANGE, RED, PURPLE, PINK = (PENS[k] for k in ("green", "teal", "orange", "red", "purple", "pink"))

A = np.array([[1.0, 0.55], [0.55, 0.9]])  # the loss is (w - c)^T A (w - c) + const (A = X^T X)
R = 1.0  # the radius of both balls


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


def loss(w, c):
    d = w - c
    return float(d @ A @ d)


def boundary(kind: str, n: int = 2000):
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    if kind == "l2":
        return np.stack([np.cos(t), np.sin(t)], 1) * R
    # the L1 sphere |w1| + |w2| = R
    u = np.stack([np.cos(t), np.sin(t)], 1)
    return u / np.abs(u).sum(1, keepdims=True) * R


def touch(kind: str, c):
    """The constrained minimiser: the point of the ball's boundary with the least loss (c lies outside the ball)."""
    pts = boundary(kind)
    vals = np.array([loss(p, c) for p in pts])
    k = int(vals.argmin())
    return pts[k], float(vals[k])


def contour(ax, c, level, color, width=2.5, opacity=1.0):
    vals, vecs = np.linalg.eigh(np.linalg.inv(A))
    L = vecs @ np.diag(np.sqrt(vals)) * np.sqrt(max(level, 1e-6))
    return ParametricFunction(lambda t: ax.c2p(*(c + L @ np.array([np.cos(t), np.sin(t)]))),
                              t_range=[0, 2 * np.pi, 2 * np.pi / 180], color=color, stroke_width=width, stroke_opacity=opacity)


class L1VsL2Geometry(Slide):
    """The loss contours are ellipses around the least-squares fit. Constrained to a ball, the solution is where
    the growing ellipse first touches the ball. The L2 ball is round, so that point is anywhere on it; the L1 ball
    has corners on the axes, which stick out, so the touch point is usually a corner: a weight exactly zero."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"Why L1 makes weights exactly zero and L2 does not"))
        ax = Axes(x_range=[-2, 3.5, 1], y_range=[-2, 2.5, 1], x_length=6.6, y_length=5.4, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).shift(LEFT * 2.5 + DOWN * 0.2)
        lab = VGroup(Formula(r"w_1", scale=0.55, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.1),
                     Formula(r"w_2", scale=0.55, color=INK_2).next_to(ax.y_axis, UP, buff=0.1))
        c = ValueTracker(0.0)
        cs = [np.array([1.7, 0.6]), np.array([1.3, 1.2]), np.array([1.9, -0.15])]
        center = lambda: cs[0] + (cs[1] - cs[0]) * min(1, c.get_value()) + (cs[2] - cs[1]) * max(0, c.get_value() - 1)  # noqa: E731

        ls = always_redraw(lambda: Dot(ax.c2p(*center()), color=TEAL))
        ls_t = always_redraw(lambda: Formula(r"\hat{\mathbf w}_{\text{LS}}", scale=0.5, color=TEAL).next_to(ls, UR, buff=0.04))
        self.play(Create(ax), FadeIn(lab), FadeIn(ls), FadeIn(ls_t),
                  *say(r"plain least squares has its minimum at $\hat{\mathbf w}_{\text{LS}}$ (teal)"))
        rings = VGroup(*[contour(ax, cs[0], lv, TEAL, 1.6, 0.8) for lv in (0.1, 0.4, 0.9)])
        self.play(Create(rings), run_time=1.2)
        self.next_slide()

        # L2
        disc = Circle(radius=R * ax.x_axis.unit_size, stroke_color=ORANGE, stroke_width=3, fill_color=ORANGE, fill_opacity=0.15).move_to(ax.c2p(0, 0))
        level = ValueTracker(0.05)
        grow = always_redraw(lambda: contour(ax, center(), level.get_value(), PINK, 3.5))
        self.play(FadeOut(rings), FadeIn(disc), *say(r"ridge as a constraint: $\lVert\mathbf w\rVert_2\le r$, a disc (orange)"))
        self.next_slide()
        p2, v2 = touch("l2", cs[0])
        self.add(grow)
        self.play(level.animate.set_value(v2), *say(r"grow the loss contour until it first touches the disc: that point is the ridge solution"), run_time=2.2)
        d2 = Dot(ax.c2p(*p2), color=PINK, radius=0.1)
        t2 = Formula(rf"\hat{{\mathbf w}}=({p2[0]:.2f},\ {p2[1]:.2f})", scale=0.6, color=PINK).to_edge(RIGHT, buff=0.7).shift(UP * 1.6)
        self.play(FadeIn(d2), FadeIn(t2), *say(r"on a round disc the touch point is off the axes: both weights shrink, neither becomes 0"))
        self.next_slide()

        # L1
        diamond = Polygon(ax.c2p(R, 0), ax.c2p(0, R), ax.c2p(-R, 0), ax.c2p(0, -R), stroke_color=ORANGE, stroke_width=3,
                          fill_color=ORANGE, fill_opacity=0.15)
        p1, v1 = touch("l1", cs[0])
        self.play(FadeOut(d2), FadeOut(t2), Transform(disc, diamond), level.animate.set_value(0.05),
                  *say(r"LASSO as a constraint: $\lVert\mathbf w\rVert_1=|w_1|+|w_2|\le r$, a diamond with corners on the axes"))
        self.next_slide()
        self.play(level.animate.set_value(v1), *say(r"grow the contour again: it hits a corner first"), run_time=2.2)
        d1 = always_redraw(lambda: Dot(ax.c2p(*touch("l1", center())[0]), color=PINK, radius=0.1))
        t1 = always_redraw(lambda: Formula(rf"\hat{{\mathbf w}}=({touch('l1', center())[0][0]:.2f},\ {touch('l1', center())[0][1]:.2f})",
                                           scale=0.6, color=PINK).to_edge(RIGHT, buff=0.7).shift(UP * 1.6))
        self.play(FadeIn(d1), FadeIn(t1), *say(r"at the corner $w_2=0$ exactly: that feature is switched off (sparsity)"))
        self.next_slide()

        follow = always_redraw(lambda: contour(ax, center(), touch("l1", center())[1], PINK, 3.5))
        self.remove(grow)
        self.add(follow)
        self.play(c.animate.set_value(1.0), *say(r"move the data's optimum: the solution can slide along an edge (both weights non-zero)"), run_time=2.5)
        self.next_slide()
        self.play(c.animate.set_value(2.0), *say(r"for a wide range of optima it sticks to a corner: corners stick out, so L1 often lands on them"), run_time=2.5)
        self.wait(0.5)

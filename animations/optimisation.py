"""Optimisation pictures for Lecture 2: gradient descent zig-zagging in a narrow valley against Newton's single step,
and Newton's method in 1D as a sequence of parabolas.

Build: npm run slides -- <this notes folder>   (in the Principia folder)
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Axes,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    ParametricFunction,
    VGroup,
)
from manim_slides import Slide

from principia_manim import INK, INK_2, PENS, Caption, Formula

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


class GDvsNewton(Slide):
    """L(w) = 1/2 (w1^2 + k w2^2) with k = 10: the valley is narrow along w2. With eta = 0.15 gradient descent
    overshoots across the valley (factor 1 - k eta = -0.5) while crawling along it (factor 0.85); Newton divides each
    direction by its curvature and lands on the minimum in one step."""

    def construct(self):
        k, eta = 10.0, 0.15
        say = Say(self)
        self.add(heading(r"A narrow valley: gradient descent zig-zags, Newton jumps"))
        ax = Axes(x_range=[-2.5, 2.5, 1], y_range=[-1.25, 1.25, 0.5], x_length=11, y_length=5.5, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 1.5}).shift(DOWN * 0.3)
        rings = VGroup(*[ParametricFunction(lambda t, c=c: ax.c2p(np.sqrt(2 * c) * np.cos(t), np.sqrt(2 * c / k) * np.sin(t)),
                                            t_range=[0, 2 * np.pi, 2 * np.pi / 180], color=TEAL, stroke_width=1.6,
                                            stroke_opacity=0.35 + 0.1 * i)
                         for i, c in enumerate([3.0, 2.0, 1.2, 0.6, 0.25, 0.06])])
        eq = Formula(r"L=\tfrac12(w_1^2+10\,w_2^2)", scale=0.6, color=TEAL).to_corner(UP + RIGHT, buff=0.6).shift(DOWN * 0.5)
        self.play(Create(ax), Create(rings), FadeIn(eq),
                  *say(r"contours of $L$: ten times steeper across the valley ($w_2$) than along it ($w_1$)"))
        self.next_slide()

        w = np.array([-2.2, 0.9])
        start = Dot(ax.c2p(*w), color=ORANGE, radius=0.09)
        self.play(FadeIn(start), *say(r"gradient descent with $\eta=0.15$: $w_1\leftarrow0.85\,w_1$, $w_2\leftarrow(1-10\eta)\,w_2=-0.5\,w_2$"))
        path = VGroup()
        for i in range(12):
            nw = np.array([(1 - eta) * w[0], (1 - k * eta) * w[1]])
            a = Arrow(ax.c2p(*w), ax.c2p(*nw), buff=0, color=ORANGE, stroke_width=3, max_tip_length_to_length_ratio=0.15)
            path.add(a)
            self.play(Create(a), run_time=0.35)
            w = nw
        self.next_slide()
        self.play(*say(r"it bounces across the valley and crawls along it: still far from the minimum after 12 steps"))
        self.next_slide()

        w0 = np.array([-2.2, 0.9])
        jump = Arrow(ax.c2p(*w0), ax.c2p(0, 0), buff=0, color=PINK, stroke_width=5)
        mn = Dot(ax.c2p(0, 0), color=PINK, radius=0.1)
        hess = Formula(r"H=\begin{bmatrix}1&0\\0&10\end{bmatrix},\quad H^{-1}\nabla L=\begin{bmatrix}w_1\\w_2\end{bmatrix}", scale=0.55, color=PINK)
        hess.next_to(eq, DOWN, buff=0.35).align_to(eq, RIGHT)
        self.play(Create(jump), FadeIn(mn), FadeIn(hess),
                  *say(r"Newton: $\mathbf w-H^{-1}\nabla L$ divides each direction by its curvature and lands on the minimum in one step"))
        self.wait(0.5)


class Newton1D(Slide):
    """L(w) = w^2 - log w + e^{w/20}. At each w_t, Newton fits the parabola q_t that matches L, L' and L'' there and
    jumps to its minimum: w_{t+1} = w_t - L'(w_t) / L''(w_t)."""

    def construct(self):
        L = lambda w: w ** 2 - np.log(w) + np.exp(w / 20)  # noqa: E731
        d1 = lambda w: 2 * w - 1 / w + np.exp(w / 20) / 20  # noqa: E731
        d2 = lambda w: 2 + 1 / w ** 2 + np.exp(w / 20) / 400  # noqa: E731
        say = Say(self)
        self.add(heading(r"Newton's method: jump to a parabola's minimum"))
        ax = Axes(x_range=[0.15, 2.2, 0.5], y_range=[1.5, 4.5, 0.5], x_length=10, y_length=4.8, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).shift(DOWN * 0.3)
        wl = Formula(r"w", scale=0.6, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.1)
        def inside(f):
            # the part of [0.15, 2.2] where f stays under the top of the axes
            xs = np.linspace(0.16, 2.2, 800)
            ok = xs[np.array([f(x) for x in xs]) <= 4.45]
            return [float(ok.min()), float(ok.max()), 0.004]

        curve = ax.plot(L, x_range=inside(L), color=TEAL, stroke_width=4)
        lab = Formula(r"L(w)=w^2-\log w+e^{w/20}", scale=0.6, color=TEAL).move_to(ax.c2p(0.3, 4.2), aligned_edge=LEFT)
        self.play(Create(ax), FadeIn(wl), Create(curve), FadeIn(lab), *say(r"minimise $L(w)$, starting from $w_0=1.7$"))
        self.next_slide()

        w = 1.7
        dot = Dot(ax.c2p(w, L(w)), color=ORANGE, radius=0.09)
        self.play(FadeIn(dot))
        old = VGroup()
        for t in range(3):
            q = lambda x, w=w: L(w) + (x - w) * d1(w) + 0.5 * (x - w) ** 2 * d2(w)  # noqa: E731
            par = ax.plot(q, x_range=inside(q), color=ORANGE, stroke_width=3)
            nw = w - d1(w) / d2(w)
            text = (r"at $w_0$: the parabola $q_0$ with the same value, slope and curvature as $L$" if t == 0 else
                    rf"repeat at $w_{t}={w:.3f}$: a new parabola, a new jump" if t == 1 else
                    r"after a few steps the jumps are tiny: $L'(w)\approx0$ at $w\approx0.66$")
            self.play(FadeOut(old), Create(par), *say(text))
            self.next_slide()
            bottom = Dot(ax.c2p(nw, q(nw)), color=PINK, radius=0.08)
            drop = DashedLine(ax.c2p(nw, q(nw)), ax.c2p(nw, L(nw)), color=PINK, stroke_width=2.5)
            if t == 0:
                self.play(FadeIn(bottom), *say(rf"jump to its minimum: $w_1=w_0-\frac{{L'(w_0)}}{{L''(w_0)}}=1.7-\frac{{2.866}}{{2.349}}={nw:.3f}$"))
            else:
                self.play(FadeIn(bottom))
            self.play(Create(drop), dot.animate.move_to(ax.c2p(nw, L(nw))))
            old = VGroup(par, bottom, drop)
            w = nw
            if t < 2:
                self.next_slide()
        self.wait(0.5)

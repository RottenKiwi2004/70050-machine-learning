"""Least squares, seen as areas: each residual is the side of a square, and the fitted line is the one with the
smallest total area. Shown in "Linear regression and least squares", section "Least squares criterion".

Build: npm run slides -- <this notes folder>   (in the Principia folder)
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Axes,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    Polygon,
    Rectangle,
    ValueTracker,
    VGroup,
    always_redraw,
)
from manim_slides import Slide

from principia_manim import INK_2, PENS, Caption, Formula, number

X = np.array([1.0, 2.5, 4.0, 5.5, 7.0, 8.8])
Y = np.array([2.2, 2.6, 4.6, 4.4, 6.9, 7.1])
W1, W0 = np.polyfit(X, Y, 1)  # the least-squares line


def rss(w0: float, w1: float) -> float:
    return float(np.sum((Y - w0 - w1 * X) ** 2))


class SquaredResiduals(Slide):
    def construct(self):
        title = Caption("Least squares: the line with the smallest total area", scale=0.85, color=PENS["purple"])
        title.to_edge(UP, buff=0.35)
        axes = Axes(x_range=[0, 10, 2], y_range=[0, 10, 2], x_length=5.2, y_length=5.2, tips=False,
                    axis_config={"color": INK_2, "stroke_width": 2})
        axes.to_edge(LEFT, buff=1.2).shift(UP * 0.1)
        dots = VGroup(*[Dot(axes.c2p(x, y), radius=0.07, color=PENS["red"]) for x, y in zip(X, Y)])

        w0, w1 = ValueTracker(5.0), ValueTracker(0.0)
        fit = lambda x: w0.get_value() + w1.get_value() * x  # noqa: E731
        line = always_redraw(lambda: Line(axes.c2p(0, fit(0)), axes.c2p(10, fit(10)), color=PENS["teal"], stroke_width=4))
        gaps = always_redraw(lambda: VGroup(*[
            Line(axes.c2p(x, y), axes.c2p(x, fit(x)), color=PENS["green"], stroke_width=3) for x, y in zip(X, Y)
        ]))

        def squares():
            out = VGroup()
            for x, y in zip(X, Y):
                e = y - fit(x)
                s = abs(e)  # the axes have equal units, so a side of |e| looks square
                out.add(Polygon(axes.c2p(x, y), axes.c2p(x + s, y), axes.c2p(x + s, fit(x)), axes.c2p(x, fit(x)),
                                stroke_width=1.5, stroke_color=PENS["red"], fill_color=PENS["red"], fill_opacity=0.28))
            return out

        boxes = always_redraw(squares)

        # the total area as a bar, and as a number
        base = axes.get_corner(DOWN + RIGHT) + RIGHT * 2.6
        tallest = 4.0
        unit = tallest / rss(5.0, 0.0)  # the first guess fills the bar
        bar = always_redraw(lambda: Rectangle(width=0.8, height=max(0.01, rss(w0.get_value(), w1.get_value()) * unit),
                                              fill_color=PENS["red"], fill_opacity=0.6, stroke_width=0)
                            .move_to(base, aligned_edge=DOWN))
        label = Formula(r"L(\mathbf w)=\sum_i\epsilon_i^2", scale=0.6).next_to(base + UP * tallest, UP, buff=0.55)
        value = always_redraw(lambda: number(rss(w0.get_value(), w1.get_value())).next_to(bar, UP, buff=0.15))

        def say(text: str, old=None):
            new = Caption(text).to_edge(DOWN, buff=0.3)
            return new, ([FadeOut(old)] if old else []) + [FadeIn(new, shift=UP * 0.15)]

        # 1. the data
        self.add(title)
        cap, anims = say("six observations $(x_i,y_i)$")
        self.play(Create(axes), FadeIn(dots, lag_ratio=0.1), *anims)
        self.next_slide()

        # 2. a guess, and its residuals
        cap, anims = say(r"a guess $\hat y=w_0+w_1x$; each residual $\epsilon_i=y_i-\hat y_i$ is a vertical gap", cap)
        self.play(Create(line), Create(gaps), *anims)
        self.next_slide()

        # 3. squared residuals are areas
        cap, anims = say(r"square each residual: $\epsilon_i^2$ is the area of a square on it", cap)
        self.play(FadeIn(boxes), FadeIn(bar), FadeIn(label), FadeIn(value), *anims)
        self.next_slide()

        # 4. move the line to the least-squares fit
        cap, anims = say(r"move the line to shrink the total area: least squares picks the smallest", cap)
        self.play(w0.animate.set_value(W0), w1.animate.set_value(W1), *anims, run_time=3)
        self.next_slide()

        # 5. any other line has more area
        cap, anims = say(r"tilt it either way and the area grows: at the minimum $\nabla L(\hat{\mathbf w})=\mathbf 0$", cap)
        self.play(*anims)
        for dw in (0.18, -0.18, 0.0):
            self.play(w1.animate.set_value(W1 + dw), w0.animate.set_value(W0 - dw * X.mean()), run_time=1.2)
        self.wait(0.5)

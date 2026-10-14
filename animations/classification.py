"""Classification pictures for Lecture 2: the logistic squashing function, losses along the margin, a feature map
that makes circular data separable, and softmax.

Build: npm run slides -- <this notes folder>   (in the Principia folder)
"""

import numpy as np
from manim import (
    DEGREES,
    DOWN,
    IN,
    LEFT,
    OUT,
    RIGHT,
    UP,
    Axes,
    Create,
    DashedLine,
    Dot,
    Dot3D,
    FadeIn,
    FadeOut,
    Line,
    Rectangle,
    Surface,
    ThreeDAxes,
    Transform,
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


def g(z):
    return 1 / (1 + np.exp(-z))


# ---- the logistic function ---------------------------------------------------------------------------------------


class SigmoidSquash(Slide):
    """Any score z = w^T x in (-inf, inf) is squashed into a probability g(z) in (0, 1); the boundary z = 0 is p = 1/2,
    and the inverse of g is the log-odds."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"The logistic function turns a score into a probability"))
        ax = Axes(x_range=[-6, 6, 2], y_range=[0, 1, 0.5], x_length=9.5, y_length=4.2, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).shift(DOWN * 0.2 + LEFT * 0.8)
        zl = Formula(r"z=\mathbf w^\top\mathbf x", scale=0.55, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.15)
        pl = Formula(r"p=g(z)", scale=0.55, color=INK_2).next_to(ax.y_axis, UP, buff=0.1)
        half = DashedLine(ax.c2p(-6, 0.5), ax.c2p(6, 0.5), color=INK_2, stroke_width=1.5, dash_length=0.08)
        one = DashedLine(ax.c2p(-6, 1), ax.c2p(6, 1), color=INK_2, stroke_width=1.2, dash_length=0.08)
        curve = ax.plot(g, x_range=[-6, 6, 0.02], color=TEAL, stroke_width=4)
        eq = Formula(r"g(z)=\frac{1}{1+e^{-z}}", scale=0.75, color=TEAL).to_edge(RIGHT, buff=0.4).shift(UP * 1.6)
        self.play(Create(ax), FadeIn(zl), FadeIn(pl), Create(half), Create(one), Create(curve), FadeIn(eq),
                  *say(r"the score $z$ can be any number; $g$ squashes it into $(0,1)$"))
        self.next_slide()

        z = ValueTracker(0.0)
        dot = always_redraw(lambda: Dot(ax.c2p(z.get_value(), g(z.get_value())), color=ORANGE, radius=0.09))
        v = always_redraw(lambda: DashedLine(ax.c2p(z.get_value(), 0), ax.c2p(z.get_value(), g(z.get_value())), color=ORANGE, stroke_width=2))
        h = always_redraw(lambda: DashedLine(ax.c2p(-6, g(z.get_value())), ax.c2p(z.get_value(), g(z.get_value())), color=ORANGE, stroke_width=2))
        readout = always_redraw(lambda: VGroup(
            Formula(r"z=", scale=0.6), number(z.get_value(), 2, font_size=28, color=ORANGE),
            Formula(r"\quad p=", scale=0.6), number(g(z.get_value()), 3, font_size=28, color=ORANGE),
        ).arrange(RIGHT, buff=0.1).to_edge(RIGHT, buff=0.5).shift(UP * 0.4))
        self.play(FadeIn(dot), Create(v), Create(h), FadeIn(readout),
                  *say(r"$z=0$, on the decision boundary: $p=\frac12$, a coin toss"))
        self.next_slide()
        self.play(z.animate.set_value(2.0), *say(r"$z=2$: $p=0.881$; the further on the positive side, the closer to 1"), run_time=1.5)
        self.next_slide()
        self.play(z.animate.set_value(-2.0), *say(r"$z=-2$: $p=0.119=1-0.881$; the curve is symmetric, $1-g(z)=g(-z)$"), run_time=1.8)
        self.next_slide()
        tau = 0.8
        zt = np.log(tau / (1 - tau))
        self.play(z.animate.set_value(zt), *say(r"read it backwards: $p=0.8$ needs $z=\log\frac{p}{1-p}=\log4=1.39$, the log-odds"), run_time=1.5)
        self.wait(0.5)


# ---- losses along the margin ---------------------------------------------------------------------------------------


class MarginLosses(Slide):
    """0-1 loss, squared loss (1 - m)^2 and log loss log(1 + e^{-m}) as functions of the margin m = y z."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"Three losses as functions of the margin $m=y_\pm z$"))
        ax = Axes(x_range=[-3, 3, 1], y_range=[0, 5, 1], x_length=9, y_length=4.4, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).shift(DOWN * 0.2 + LEFT * 1.2)
        ml = Formula(r"m", scale=0.6, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.15)
        wrong = Formula(r"\text{wrong side}", scale=0.5, color=RED).move_to(ax.c2p(-1.6, -0.45))
        right = Formula(r"\text{right side}", scale=0.5, color=GREEN).move_to(ax.c2p(1.6, -0.45))
        zero = DashedLine(ax.c2p(0, 0), ax.c2p(0, 5), color=INK_2, stroke_width=1.5)
        self.play(Create(ax), FadeIn(ml), Create(zero), FadeIn(wrong), FadeIn(right),
                  *say(r"$m>0$: correct with a margin; $m<0$: misclassified"))
        self.next_slide()

        l01 = VGroup(Line(ax.c2p(-3, 1), ax.c2p(0, 1), color=INK, stroke_width=4), Line(ax.c2p(0, 0), ax.c2p(3, 0), color=INK, stroke_width=4))
        key = VGroup()
        def label(tex, color):
            t = Formula(tex, scale=0.6, color=color)
            key.add(t)
            key.arrange(DOWN, aligned_edge=LEFT, buff=0.3).to_edge(RIGHT, buff=0.4).shift(UP * 0.8)
            return t
        t01 = label(r"\ell_{01}", INK)
        self.play(Create(l01), FadeIn(t01), *say(r"0-1 loss: counts mistakes, but it is flat, so it has no gradient to follow"))
        self.next_slide()

        sq = ax.plot(lambda m: min(5, (1 - m) ** 2), x_range=[-1.236, 3, 0.01], color=ORANGE, stroke_width=4)
        tsq = label(r"\ell_{\text{sq}}=(1-m)^2", ORANGE)
        self.play(Create(sq), FadeIn(tsq), *say(r"squared loss $(1-m)^2$: smooth, but it rises again for $m>1$"))
        self.next_slide()
        trap = Dot(ax.c2p(3, 4), color=ORANGE, radius=0.1)
        trapt = Formula(r"m=3:\ \ell_{\text{sq}}=4", scale=0.5, color=ORANGE).next_to(trap, LEFT, buff=0.15)
        self.play(FadeIn(trap), FadeIn(trapt),
                  *say(r"so a point classified correctly and confidently ($m=3$) is punished as much as a mistake at $m=-1$"))
        self.next_slide()

        lg = ax.plot(lambda m: np.log(1 + np.exp(-m)), x_range=[-3, 3, 0.01], color=TEAL, stroke_width=4)
        tlg = label(r"\ell_{\log}=\log(1+e^{-m})", TEAL)
        self.play(Create(lg), FadeIn(tlg),
                  *say(r"log loss: smooth, large for mistakes, and it only decreases as $m$ grows ($m=3$: 0.049)"))
        self.wait(0.5)


# ---- a feature map makes the data separable ---------------------------------------------------------------------


class FeatureLift(ThreeDSlide):
    """Class 1 inside a circle, class 0 around it: no line separates them in (x1, x2). Add the feature x1^2 + x2^2 as
    a height: the inner points stay low, the outer ones rise, and a flat plane separates them; seen from above, the
    plane's cut is a circle."""

    def construct(self):
        rng = np.random.default_rng(5)
        n = 26
        r_in = np.sqrt(rng.uniform(0, 0.7 ** 2, n))
        a_in = rng.uniform(0, 2 * np.pi, n)
        r_out = rng.uniform(1.25, 1.75, n)
        a_out = rng.uniform(0, 2 * np.pi, n)
        P_in = np.stack([r_in * np.cos(a_in), r_in * np.sin(a_in)], 1)
        P_out = np.stack([r_out * np.cos(a_out), r_out * np.sin(a_out)], 1)

        axes = ThreeDAxes(x_range=[-2, 2, 1], y_range=[-2, 2, 1], z_range=[0, 3.2, 1], x_length=5.5, y_length=5.5, z_length=3.6,
                          axis_config={"color": INK_2, "stroke_width": 1.5, "include_tip": False}).shift(IN * 0.8)
        c = axes.c2p
        title = heading(r"A feature map can make a curved boundary flat")
        self.add_fixed_in_frame_mobjects(title)
        say = Say(self, fixed=True)
        self.set_camera_orientation(phi=0 * DEGREES, theta=-90 * DEGREES, zoom=0.95)
        ins = VGroup(*[Dot3D(c(x, y, 0), radius=0.06, color=TEAL) for x, y in P_in])
        outs = VGroup(*[Dot3D(c(x, y, 0), radius=0.06, color=ORANGE) for x, y in P_out])
        self.add(axes)
        self.play(FadeIn(ins), FadeIn(outs), *say(r"class 1 (teal) inside, class 0 (orange) around it: no straight line separates them"))
        self.next_slide()

        self.move_camera(phi=65 * DEGREES, theta=-50 * DEGREES, run_time=2)
        self.play(*say(r"add a third feature, the height $\phi_3=x_1^2+x_2^2$ (the squared distance from the centre)"))
        bowl = Surface(lambda u, v: c(u * np.cos(v), u * np.sin(v), u ** 2), u_range=[0, 1.8], v_range=[0, 2 * np.pi],
                       resolution=(14, 28), fill_color=PURPLE, fill_opacity=0.12, stroke_color=PURPLE, stroke_width=0.4, checkerboard_colors=False)
        lift_in = [d.animate.move_to(c(x, y, x * x + y * y)) for d, (x, y) in zip(ins, P_in)]
        lift_out = [d.animate.move_to(c(x, y, x * x + y * y)) for d, (x, y) in zip(outs, P_out)]
        self.play(FadeIn(bowl), *lift_in, *lift_out, run_time=2.2)
        self.next_slide()

        r2 = 1.0  # the plane x1^2 + x2^2 = r^2, here r = 1
        plane = Surface(lambda u, v: c(u, v, r2), u_range=[-2, 2], v_range=[-2, 2], resolution=(2, 2),
                        fill_color=PINK, fill_opacity=0.25, stroke_color=PINK, stroke_width=1, checkerboard_colors=False)
        self.play(FadeIn(plane), *say(r"now a flat plane $\phi_3=r^2$ separates them: a linear classifier in the new features"))
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(2.5)
        self.stop_ambient_camera_rotation()
        self.next_slide()

        ring = Surface(lambda u, v: c(np.sqrt(r2) * np.cos(v), np.sqrt(r2) * np.sin(v), 0) * 1 + 0 * u, u_range=[0, 1], v_range=[0, 2 * np.pi],
                       resolution=(1, 48), fill_opacity=0, stroke_color=PINK, stroke_width=4, checkerboard_colors=False)
        drop_in = [d.animate.move_to(c(x, y, 0)) for d, (x, y) in zip(ins, P_in)]
        drop_out = [d.animate.move_to(c(x, y, 0)) for d, (x, y) in zip(outs, P_out)]
        self.play(FadeOut(plane), FadeOut(bowl), *drop_in, *drop_out, FadeIn(ring), run_time=1.8)
        self.move_camera(phi=0 * DEGREES, theta=-90 * DEGREES, run_time=1.8)
        self.play(*say(r"back in $(x_1,x_2)$ the plane's cut is the circle $x_1^2+x_2^2=r^2$: a nonlinear boundary"))
        self.wait(0.5)


# ---- softmax --------------------------------------------------------------------------------------------------------


class SoftmaxBars(Slide):
    """Scores z = (2, 1, 0) become exponentials, then probabilities that sum to 1. Adding a constant to every score
    changes nothing; scaling the scores up sharpens the probabilities."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"Softmax: scores $\to$ exponentials $\to$ probabilities"))
        names = ["1", "2", "3"]
        colors = [TEAL, ORANGE, PINK]
        base = DOWN * 1.9
        unit = ValueTracker(0.8)  # height per unit
        vals = [np.array([2.0, 1.0, 0.0])]

        def bars(v, u, labels_tex=None, decimals=2):
            grp = VGroup()
            for k, (x, col) in enumerate(zip(v, colors)):
                r = Rectangle(width=1.1, height=max(0.02, x * u), stroke_width=0, fill_color=col, fill_opacity=0.75)
                r.move_to(base + RIGHT * (k - 1) * 2.0, aligned_edge=DOWN)
                t = number(x, decimals, font_size=30, color=col).next_to(r, UP, buff=0.12)
                c = Formula(rf"c={names[k]}", scale=0.5, color=INK_2).next_to(base + RIGHT * (k - 1) * 2.0, DOWN, buff=0.2)
                grp.add(VGroup(r, t, c))
            return grp

        z = np.array([2.0, 1.0, 0.0])
        b = bars(z, 0.9)
        lab = Formula(r"z_c=\mathbf w_c^\top\mathbf x", scale=0.7, color=INK).to_edge(LEFT, buff=0.7).shift(UP * 1.4)
        self.play(FadeIn(b), FadeIn(lab), *say(r"one score per class, $\mathbf z=(2,1,0)$: any real numbers, not yet probabilities"))
        self.next_slide()

        e = np.exp(z)
        b2 = bars(e, 0.42)
        lab2 = Formula(r"e^{z_c}", scale=0.7, color=INK).move_to(lab)
        self.play(Transform(b, b2), Transform(lab, lab2), *say(r"exponentiate: all positive, and bigger scores grow much bigger ($7.39, 2.72, 1$)"))
        self.next_slide()

        p = e / e.sum()
        b3 = bars(p, 4.0, decimals=3)
        lab3 = Formula(r"p_c=\frac{e^{z_c}}{\sum_k e^{z_k}}", scale=0.7, color=INK).move_to(lab)
        self.play(Transform(b, b3), Transform(lab, lab3), *say(r"divide by the sum $11.11$: $\mathbf p=(0.665,0.245,0.090)$, which sums to 1"))
        self.next_slide()

        sh = Formula(r"\mathbf z+5=(7,6,5)\ \Rightarrow\ \text{same }\mathbf p", scale=0.6, color=GREEN).to_edge(RIGHT, buff=0.6).shift(UP * 1.4)
        self.play(FadeIn(sh), Transform(b, bars(p, 4.0, decimals=3)),
                  *say(r"adding the same number to every score cancels in the ratio: only differences between scores matter"))
        self.next_slide()

        z2 = 2.5 * z
        p2 = np.exp(z2) / np.exp(z2).sum()
        sc = Formula(r"2.5\,\mathbf z=(5,2.5,0)", scale=0.6, color=ORANGE).next_to(sh, DOWN, buff=0.35).align_to(sh, LEFT)
        self.play(FadeIn(sc), Transform(b, bars(p2, 4.0, decimals=3)),
                  *say(r"scaling the scores up sharpens $\mathbf p$ towards the top class: large weights mean confident predictions"))
        self.wait(0.5)

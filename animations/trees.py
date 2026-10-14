"""Decision-tree pictures for Lecture 2: entropy and information gain for one split, and how a tree's tests cut the
input space into boxes.

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
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    Rectangle,
    RoundedRectangle,
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


def H(p):
    p = np.clip(p, 1e-12, 1 - 1e-12)
    return float(-p * np.log2(p) - (1 - p) * np.log2(1 - p))


def node(yes: int, no: int, label: str):
    """A node box with its examples as dots: teal for yes, orange for no."""
    dots = VGroup(*([Dot(radius=0.11, color=TEAL) for _ in range(yes)] + [Dot(radius=0.11, color=ORANGE) for _ in range(no)]))
    dots.arrange_in_grid(rows=2 if yes + no > 4 else 1, buff=0.12)
    box = RoundedRectangle(corner_radius=0.12, width=max(1.4, dots.width + 0.5), height=dots.height + 0.85,
                           stroke_color=INK_2, stroke_width=2, fill_color=INK_2, fill_opacity=0.06)
    dots.move_to(box).shift(DOWN * 0.15)
    t = Formula(label, scale=0.5, color=INK).move_to(box).align_to(box, UP).shift(DOWN * 0.12)
    return VGroup(box, dots, t)


class InformationGain(Slide):
    """Entropy of a node is the uncertainty of its labels; a split is good when its children are purer. Parent (4, 4),
    children (4, 1) and (0, 3): IG = 1 - 5/8 * 0.722 - 3/8 * 0 = 0.549 bits."""

    def construct(self):
        say = Say(self)
        self.add(heading(r"Information gain: how much purer a split makes the labels"))
        ax = Axes(x_range=[0, 1, 0.5], y_range=[0, 1, 0.5], x_length=4.2, y_length=3.2, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).to_edge(RIGHT, buff=0.7).shift(DOWN * 0.2)
        pl = Formula(r"p", scale=0.55, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.1)
        hl = Formula(r"H(p)", scale=0.55, color=INK_2).next_to(ax.y_axis, UP, buff=0.1)
        curve = ax.plot(H, x_range=[0.0005, 0.9995, 0.0025], color=PURPLE, stroke_width=3)
        self.play(Create(ax), FadeIn(pl), FadeIn(hl), Create(curve),
                  *say(r"binary entropy $H(p)=p\log_2\frac1p+(1-p)\log_2\frac1{1-p}$: 1 bit at $p=\frac12$, 0 when pure"))
        self.next_slide()

        parent = node(4, 4, r"(4,4)").move_to(LEFT * 3.4 + UP * 1.6)
        hp = Formula(r"H=1", scale=0.55, color=PURPLE).next_to(parent, RIGHT, buff=0.25)
        mp = Dot(ax.c2p(0.5, 1), color=INK, radius=0.08)
        self.play(FadeIn(parent), FadeIn(hp), FadeIn(mp), *say(r"a node with 4 yes (teal) and 4 no (orange): as uncertain as it gets"))
        self.next_slide()

        L = node(4, 1, r"(4,1)").move_to(LEFT * 5.0 + DOWN * 0.9)
        Rn = node(0, 3, r"(0,3)").move_to(LEFT * 1.8 + DOWN * 0.9)
        e1 = Line(parent.get_bottom(), L.get_top(), color=INK_2)
        e2 = Line(parent.get_bottom(), Rn.get_top(), color=INK_2)
        test = Formula(r"h(\mathbf x)<\theta\,?", scale=0.5, color=INK_2).next_to(parent, DOWN, buff=0.15).shift(RIGHT * 1.5)
        hL = Formula(r"H=0.722", scale=0.55, color=PURPLE).next_to(L, DOWN, buff=0.2)
        hR = Formula(r"H=0", scale=0.55, color=PURPLE).next_to(Rn, DOWN, buff=0.2)
        mL = Dot(ax.c2p(0.8, H(0.8)), color=TEAL, radius=0.08)
        mR = Dot(ax.c2p(1.0, 0.0), color=ORANGE, radius=0.08)
        self.play(Create(e1), Create(e2), FadeIn(test), FadeIn(L), FadeIn(Rn), *say(r"a test sends 5 examples left and 3 right"))
        self.play(FadeIn(hL), FadeIn(hR), FadeIn(mL), FadeIn(mR))
        self.next_slide()

        ig = Formula(r"IG=1-\tfrac58(0.722)-\tfrac38(0)=0.549\ \text{bits}", scale=0.6, color=GREEN).next_to(ax, DOWN, buff=0.45).to_edge(RIGHT, buff=0.4)
        self.play(FadeIn(ig), *say(r"information gain: the parent's entropy minus the children's, weighted by how many examples each gets"))
        self.next_slide()
        self.play(*say(r"try many tests and thresholds; keep the one with the largest gain, then repeat in each child"))
        self.wait(0.5)


class TreePartition(Slide):
    """Each test of a tree is an axis-aligned cut; following the tests, every leaf is a box of the input space that
    predicts its majority class."""

    def construct(self):
        rng = np.random.default_rng(4)
        say = Say(self)
        self.add(heading(r"A tree's tests cut the input space into boxes"))
        ax = Axes(x_range=[0, 1, 0.25], y_range=[0, 1, 0.25], x_length=5.2, y_length=5.2, tips=False,
                  axis_config={"color": INK_2, "stroke_width": 2}).to_edge(LEFT, buff=0.8).shift(DOWN * 0.2)
        x1l = Formula(r"x_1", scale=0.55, color=INK_2).next_to(ax.x_axis, RIGHT, buff=0.1)
        x2l = Formula(r"x_2", scale=0.55, color=INK_2).next_to(ax.y_axis, UP, buff=0.1)
        t1, t2, t3 = 0.45, 0.6, 0.35
        pts = rng.uniform(0.03, 0.97, (46, 2))

        def label(p):
            if p[0] <= t1:
                return 1 if p[1] >= t2 else 0
            return 1 if p[1] <= t3 else 0

        cls = np.array([label(p) for p in pts])
        flip = rng.uniform(size=cls.size) < 0.06
        cls = np.where(flip, 1 - cls, cls)
        dots = VGroup(*[Dot(ax.c2p(*p), radius=0.06, color=TEAL if c else ORANGE) for p, c in zip(pts, cls)])
        self.play(Create(ax), FadeIn(x1l), FadeIn(x2l), FadeIn(dots, lag_ratio=0.02),
                  *say(r"two features, two classes: no single straight line separates them"))
        self.next_slide()

        def tnode(tex, pos, color=INK):
            t = Formula(tex, scale=0.5, color=color)
            b = RoundedRectangle(corner_radius=0.1, width=t.width + 0.35, height=t.height + 0.3, stroke_color=color,
                                 stroke_width=2, fill_color=color, fill_opacity=0.08).move_to(pos)
            t.move_to(b)
            return VGroup(b, t)

        root = tnode(r"x_1\le\theta_1", RIGHT * 3.3 + UP * 2.0)
        cut1 = Line(ax.c2p(t1, 0), ax.c2p(t1, 1), color=PINK, stroke_width=4)
        self.play(Create(cut1), FadeIn(root), *say(r"the root tests one feature against a threshold: a vertical cut at $x_1=\theta_1$"))
        self.next_slide()

        nl = tnode(r"x_2\ge\theta_2", RIGHT * 1.6 + UP * 0.6)
        nr = tnode(r"x_2\le\theta_3", RIGHT * 5.0 + UP * 0.6)
        el = Line(root.get_bottom(), nl.get_top(), color=INK_2)
        er = Line(root.get_bottom(), nr.get_top(), color=INK_2)
        cut2 = Line(ax.c2p(0, t2), ax.c2p(t1, t2), color=PINK, stroke_width=4)
        cut3 = Line(ax.c2p(t1, t3), ax.c2p(1, t3), color=PINK, stroke_width=4)
        self.play(Create(el), FadeIn(nl), Create(cut2), *say(r"each side is split again, on its own: the left part at $x_2=\theta_2$"))
        self.play(Create(er), FadeIn(nr), Create(cut3))
        self.next_slide()

        def box(x0, x1, y0, y1, c):
            r = Rectangle(width=(x1 - x0) * ax.x_axis.unit_size, height=(y1 - y0) * ax.y_axis.unit_size, stroke_width=0,
                          fill_color=TEAL if c else ORANGE, fill_opacity=0.18)
            return r.move_to(ax.c2p((x0 + x1) / 2, (y0 + y1) / 2))

        boxes = VGroup(box(0, t1, t2, 1, 1), box(0, t1, 0, t2, 0), box(t1, 1, 0, t3, 1), box(t1, 1, t3, 1, 0))
        leaves = VGroup(
            tnode(r"\text{yes}", RIGHT * 0.9 - UP * 0.9, TEAL), tnode(r"\text{no}", RIGHT * 2.3 - UP * 0.9, ORANGE),
            tnode(r"\text{yes}", RIGHT * 4.3 - UP * 0.9, TEAL), tnode(r"\text{no}", RIGHT * 5.7 - UP * 0.9, ORANGE))
        edges = VGroup(Line(nl.get_bottom(), leaves[0].get_top(), color=INK_2), Line(nl.get_bottom(), leaves[1].get_top(), color=INK_2),
                       Line(nr.get_bottom(), leaves[2].get_top(), color=INK_2), Line(nr.get_bottom(), leaves[3].get_top(), color=INK_2))
        self.play(FadeIn(boxes, lag_ratio=0.2), Create(edges), FadeIn(leaves),
                  *say(r"four leaves, four boxes; each box predicts its majority class (or its class proportions)"))
        self.next_slide()

        q = Dot(ax.c2p(0.7, 0.2), radius=0.12, color=PINK)
        path = VGroup(root[0].copy().set_stroke(PINK, 4), nr[0].copy().set_stroke(PINK, 4), leaves[2][0].copy().set_stroke(PINK, 4))
        self.play(FadeIn(q), Create(path, lag_ratio=0.5),
                  *say(r"a new input follows the tests from the root, $x_1>\theta_1$ then $x_2\le\theta_3$, to the box it lands in"), run_time=1.8)
        self.wait(0.5)

from kivymd.uix.card import MDCard
from kivymd.uix.label import MDLabel
from kivy.metrics import dp


class InfoCard(MDCard):
    def __init__(self, title="Title", subtitle="Subtitle", **kwargs):
        super().__init__(**kwargs)

        self.orientation = "vertical"
        self.padding = dp(16)
        self.radius = [20]
        self.size_hint_y = None
        self.height = dp(140)
        self.elevation = 3

        self.add_widget(MDLabel(text=title))
        self.add_widget(MDLabel(text=subtitle))

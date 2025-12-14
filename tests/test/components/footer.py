from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.label import MDLabel


def create_footer():
    layout = MDBoxLayout(
        orientation="horizontal",
        padding=10,
        size_hint_y=None,
        height="50dp",
        md_bg_color=(0.9, 0.9, 0.9, 1),
    )

    layout.add_widget(MDLabel(text="© 2025 Sleep Time", halign="center"))

    return layout

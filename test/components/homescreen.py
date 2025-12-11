from kivymd.uix.screen import MDScreen
from components.appbar import create_appbar

class HomeScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.md_bg_color = (0.95, 0.95, 0.95, 1)

        # Add the appbar
        self.add_widget(create_appbar())
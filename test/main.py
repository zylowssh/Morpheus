from kivymd.app import MDApp
from components.homescreen import HomeScreen


class MainApp(MDApp):
    def build(self):
        self.theme_cls.primary_palette = "Indigo"
        self.theme_cls.theme_style = "Light"
        return HomeScreen()


MainApp().run()
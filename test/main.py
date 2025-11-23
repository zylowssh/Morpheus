from kivymd.app import MDApp
from components.homescreen import HomeScreen


class MainApp(MDApp):
    def build(self):
        return HomeScreen()


MainApp().run()

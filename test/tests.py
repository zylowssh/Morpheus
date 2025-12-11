from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from components.button import create_primary_button


class TestAppbarApp(MDApp):
    def build(self):
        screen = MDScreen()
        screen.add_widget(create_primary_button("Test Button"))
        return screen


TestAppbarApp().run()
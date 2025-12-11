from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.appbar import MDTopAppBar, MDTopAppBarTitle
from kivymd.uix.button import MDFabButton
from kivymd.uix.label import MDLabel
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.scrollview import MDScrollView

from alarmcard import AlarmCard


class MainApp(MDApp):

    def build(self):
        self.theme_cls.theme_style = "Dark"
        self.theme_cls.primary_palette = "Orange"

        screen = MDScreen()

        #topbar
        topbar = MDTopAppBar(
            MDTopAppBarTitle(text="Morpheus", halign="center"),
            type="large",
            pos_hint={"top": 1},
        )
        screen.add_widget(topbar)

        #Layout principal vertical
        main_layout = MDBoxLayout(
            orientation="vertical",
            padding=("20dp", "160dp", "20dp", "22p"),
            spacing="20dp",
        )


        #Label de base
        self.label = MDLabel(
            text="Ajoutez une alarme !",
            halign="center",
            font_style="Headline",
        )
        main_layout.add_widget(self.label)

        #layout d'alarmes avec scroll
        scroll = MDScrollView(size_hint=(1, 1))

        self.alarms_layout = MDBoxLayout(
            orientation="vertical",
            spacing="15dp",
            size_hint_y=None,
        )
        self.alarms_layout.bind(minimum_height=self.alarms_layout.setter("height"))

        scroll.add_widget(self.alarms_layout)

        main_layout.add_widget(scroll)
        screen.add_widget(main_layout)

        #FAB
        fab = MDFabButton(
            icon="plus",
            pos_hint={"right": 0.95, "y": 0.04},
            on_release=self.add_alarm,
        )
        screen.add_widget(fab)

        return screen

    def add_alarm(self, *args):
        # supprime le label si première alarme
        if self.label.parent:
            self.label.parent.remove_widget(self.label)
            
        card = AlarmCard("07:00", "Nouvelle alarme")
        self.alarms_layout.add_widget(card)


MainApp().run()
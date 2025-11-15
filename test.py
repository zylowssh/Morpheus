from kivy.clock import Clock

from kivymd.app import MDApp
from kivymd.uix.button import MDButton, MDButtonText
from kivymd.uix.fitimage import FitImage
from kivymd.uix.hero import MDHeroFrom, MDHeroTo
from kivymd.uix.screen import MDScreen
from kivymd.uix.screenmanager import MDScreenManager


class Example(MDApp):
    def go_to_screen(self, *args):
        self.root.current_heroes = ["hero"]
        if self.root.current == "screen A":
            self.root.current = "screen B"
        else:
            self.root.current = "screen A"

    def on_start(self):
        def on_start(*args):
            self.root.get_ids().image.size = self.root.get_ids().hero_from.size
            self.root.get_ids().screen_b.hero_to = self.root.get_ids().hero_to

        self.root.get_ids().button_b.bind(on_release=self.go_to_screen)
        self.root.get_ids().button_a.bind(on_release=self.go_to_screen)
        Clock.schedule_once(on_start)

    def build(self):
        return (
            MDScreenManager(
                MDScreen(
                    MDHeroFrom(
                        FitImage(
                            id="image",
                            source="kivymd/images/logo/kivymd-icon-512.png",
                            size_hint=(None, None),
                        ),
                        id="hero_from",
                        tag="hero",
                        size_hint=(None, None),
                        size=("120dp", "120dp"),
                        pos_hint={"top": .98},
                        x=24,
                    ),
                    MDButton(
                        MDButtonText(
                            text="Move Hero To Screen B"
                        ),
                        id="button_b",
                        pos_hint={"center_x": .5},
                        y="36dp",
                    ),
                    name="screen A",
                    md_bg_color="lightblue",
                ),
                MDScreen(
                    MDHeroTo(
                        id="hero_to",
                        tag="hero",
                        size_hint=(None, None),
                        size=("220dp", "220dp"),
                        pos_hint={"center_x": .5, "center_y": .5},
                    ),
                    MDButton(
                        MDButtonText(
                            text="Move Hero To Screen A"
                        ),
                        id="button_a",
                        pos_hint={"center_x": .5},
                        y="36dp",
                    ),
                    id="screen_b",
                    name="screen B",
                    md_bg_color="cadetblue",
                )
            )
        )


Example().run()
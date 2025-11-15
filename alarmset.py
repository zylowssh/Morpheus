from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.appbar.appbar import *

class AlarmSet(MDApp):
    def build(self):
        return MDTopAppBar(
            MDTopAppBarLeadingButtonContainer(
                MDActionTopAppBarButton5
                )
                ),
            MDTopAppBarTitle(text="Morpheus", halign="center")
            )

AlarmSet().run()

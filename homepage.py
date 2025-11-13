from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.appbar.appbar import MDTopAppBar
from kivymd.uix.appbar.appbar import MDTopAppBarTitle
from kivymd.uix.button import MDFabButton
from kivymd.uix.label import MDLabel
class MainApp(MDApp):
      
      
    def build(self):
        self.theme_cls.theme_style = "Dark"
        self.theme_cls.primary_palette = "Orange"

        return (
            MDScreen(
                MDTopAppBar(MDTopAppBarTitle(text="Morpheus", halign="center"),
                    type="large",
                    pos_hint={"top": 1},
                ),
                
                
                MDLabel(text="Set an alarm !",
                    halign="center",role="large",),
                
                
                
                MDFabButton(icon="plus",
                    pos_hint={"center_x": 0.9, "center_y": 0.1}, 
            )
            
            )
        )


MainApp().run()
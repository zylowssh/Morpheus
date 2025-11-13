from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.appbar.appbar import MDTopAppBar
from kivymd.uix.appbar.appbar import MDTopAppBarTitle
        
class AlarmSet(MDApp):
    def build(self):
        return MDTopAppBar(
            MDTopAppBarTitle(text="Morpheus", halign="center")
            )

AlarmSet().run()
                
   
                
                
            

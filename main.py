from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen, SlideTransition
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout

class MainScreen(Screen):
    def __init__(self, **kwargs):
        super(MainScreen, self).__init__(**kwargs)
        
        # Create layout
        layout = BoxLayout(orientation='vertical', padding=50, spacing=20)
        
        # Create label
        label = Label(text="Welcome to Kivy App!", font_size='24sp')
        
        # Create button
        button = Button(
            text="Hello World!",
            font_size='20sp',
            size_hint=(None, None),
            size=(200, 60),
            pos_hint={'center_x': 0.5}
        )
        button.bind(on_press=self.go_to_second_page)
        
        # Add widgets to layout
        layout.add_widget(label)
        layout.add_widget(button)
        
        # Add layout to screen
        self.add_widget(layout)
    
    def go_to_second_page(self):
        # Switch to second screen with slide left animation
        self.manager.transition.direction = 'left'
        self.manager.current = 'second'

class SecondScreen(Screen):
    def __init__(self, **kwargs):
        super(SecondScreen, self).__init__(**kwargs)
        
        # Create layout
        layout = BoxLayout(orientation='vertical', padding=50, spacing=20)
        
        # Create label
        label = Label(text="This is the Second Page!", font_size='24sp')
        
        # Create back button
        back_button = Button(
            text="Go Back",
            font_size='20sp',
            size_hint=(None, None),
            size=(200, 60),
            pos_hint={'center_x': 0.5}
        )
        back_button.bind(on_press=self.go_back)
        
        # Add widgets to layout
        layout.add_widget(label)
        layout.add_widget(back_button)
        
        # Add layout to screen
        self.add_widget(layout)
    
    def go_back(self, instance):
        # Switch back to main screen with slide right animation
        self.manager.transition.direction = 'right'
        self.manager.current = 'main'

class MyApp(App):
    def build(self):
        # Create screen manager with slide transition
        sm = ScreenManager(transition=SlideTransition())
        
        # Add screens
        sm.add_widget(MainScreen(name='main'))
        sm.add_widget(SecondScreen(name='second'))
        
        return sm

if __name__ == '__main__':
    MyApp().run()

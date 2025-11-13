from kivymd.uix.card import MDCard
from kivymd.uix.relativelayout import MDRelativeLayout
from kivymd.uix.label import MDLabel
from kivymd.uix.selectioncontrol import MDSwitch



class AlarmCard(MDCard):
    def __init__(self, time_text="00:00", label_text="Alarm", **kwargs):
        super().__init__(**kwargs)

        self.padding = "4dp"
        self.size_hint = (None, None)
        self.size = ("240dp", "100dp")
        self.radius = [15]
        layout = MDRelativeLayout()

        # Heure
        label_time = MDLabel(
            text=time_text.capitalize(),
            adaptive_size=True,
            pos_hint={"center_y": 0.7, "x": 0.1},
            halign="left",
            theme_text_color="Custom",
            text_color=(0, 0, 0, 1),
        )

        # Label
        label_alarm = MDLabel(
            text=label_text.capitalize(),
            adaptive_size=True,
            pos_hint={"center_y": 0.3, "center_x": 0.3},
            halign="left",
            theme_text_color="Custom",
            text_color=(0, 0, 0, 1),
        )

        # Switch
        switch = MDSwitch(
            pos_hint={"center_y": 0.5, "right": 1},
            x=-20,
        )

        layout.add_widget(label_time)
        layout.add_widget(label_alarm)
        layout.add_widget(switch)
        self.add_widget(layout)
        
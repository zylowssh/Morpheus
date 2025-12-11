from kivymd.uix.card import MDCard
from kivymd.uix.relativelayout import MDRelativeLayout
from kivymd.uix.label import MDLabel
from kivymd.uix.selectioncontrol import MDSwitch


class AlarmCard(MDCard):
    def __init__(self, time_text="00:00", label_text="Alarm", **kwargs):
        super().__init__(**kwargs)

        self.padding = "4dp"
        self.size_hint = (1, None)
        self.height = "102dp"
        self.radius = [15]

        layout = MDRelativeLayout()

        # Heure
        label_time = MDLabel(
            text=time_text,
            adaptive_size=True,
            pos_hint={"center_y": 0.7, "x": 0.1},
            halign="left",
        )

        # Label
        label_alarm = MDLabel(
            text=label_text,
            adaptive_size=True,
            pos_hint={"center_y": 0.4, "x": 0.1},
            halign="left",
        )

        # Switch
        switch = MDSwitch(
            pos_hint={"center_y": 0.5, "right": 0.95},
            x=-20,
        )

        # Heure
        label_day = MDLabel(
            text="L M M J V S D",
            adaptive_size=True,
            pos_hint={"center_y": 0.09, "x": 0.1},
            halign="left",
            text_color=(0.5, 0.5, 0.5, 1)
            
        )

        layout.add_widget(label_time)
        layout.add_widget(label_alarm)
        layout.add_widget(switch)
        layout.add_widget(label_day)
        self.add_widget(layout)

from kivymd.uix.button import MDButton, MDButtonText


def create_primary_button(text="Click", callback=None):
    btn = MDButton(
        style="filled",
        size_hint=(0.5, None),
        height="48dp",
        pos_hint={"center_x": 0.5},
    )

    btn.add_widget(MDButtonText(text=text))

    if callback:
        btn.bind(on_release=callback)

    return btn

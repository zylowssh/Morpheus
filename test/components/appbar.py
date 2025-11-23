from kivymd.uix.appbar.appbar import (
    MDTopAppBar,
    MDActionTopAppBarButton,
    MDTopAppBarLeadingButtonContainer,
    MDTopAppBarTitle,
    MDTopAppBarTrailingButtonContainer,
)


def create_appbar():
    return MDTopAppBar(
        MDTopAppBarLeadingButtonContainer(
            MDActionTopAppBarButton(icon="menu")
        ),
        MDTopAppBarTitle(text="Sleep Time", halign="center"),
        MDTopAppBarTrailingButtonContainer(
            MDActionTopAppBarButton(icon="check")
        ),
        type="small",
        size_hint_x=0.8,
        pos_hint={"center_x": 0.5, "center_y": 0.5},
    )

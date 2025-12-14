from kivymd.uix.appbar import (
    MDTopAppBar,
    MDActionTopAppBarButton,
    MDTopAppBarLeadingButtonContainer,
    MDTopAppBarTrailingButtonContainer,
    MDTopAppBarTitle,
)


def create_appbar():
    return MDTopAppBar(
        MDTopAppBarLeadingButtonContainer(
            MDActionTopAppBarButton(icon="menu")
        ),
        MDTopAppBarTitle(
            text="Sleep Time",
            halign="center",
        ),
        MDTopAppBarTrailingButtonContainer(
            MDActionTopAppBarButton(icon="check")
        ),
        type="small",
    )

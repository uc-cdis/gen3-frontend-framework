import tw from "tailwind-styled-components"
import { Button, ButtonProps } from '@mantine/core';

interface NavigationButtonProps extends ButtonProps<'a'> {
        $selected?: boolean
}

export const NavigationButton = tw(Button)<NavigationButtonProps>`
        ${(p:NavigationButtonProps) => (p.$selected ? "bg-gen3-base_blue_light" : "bg-gen3-base_blue")}
        subpixel-antialiased
        shadow
        rounded-lg
        text-base
        font-montserrat
        font-medium
        text-[#FFFFF]
        transition
        hover:bg-gen3-base_blue_lightest
        hover:shadow-[0_4px_5px_0px_rgba(0,0,0,0.35)]
        hover:border-white
        hover:underline
`

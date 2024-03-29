import tw from 'tailwind-styled-components';
import { Button, ButtonProps } from '@mantine/core';

interface NavigationButtonProps extends ButtonProps<'a'> {
        $selected?: boolean
}

export const NavigationButton = tw(Button)<NavigationButtonProps>`
        ${(p) => (p.$selected ? 'bg-heal-magenta' : 'bg-heal-purple')}
        subpixel-antialiased
        shadow
        rounded-lg
        text-base
        font-montserrat
        font-medium
        text-[#FFFFF]
        transition
        hover:bg-heal-purple
        hover:shadow-[0_4px_5px_0px_rgba(0,0,0,0.35)]
        hover:border-white
        hover:underline
`;

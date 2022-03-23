import React from 'react';
import Link from "next/link";
import tw from "tailwind-styled-components"
import { Group, Button } from '@mantine/core';
import { useRouter } from 'next/router'
import { RoleContentEntry } from "../Contents/RolesPageContent";

export interface NavigationButtonGroupProp {
    rolesPages: Record<string, RoleContentEntry>;
}

interface ButtonProps {
    $selected: boolean
}

const Item = tw.div`px-2`
const nav_button  =`bg-heal-purple subpixel-antialiased shadow rounded-lg font-montserrat font-medium hover:bg-heal-purple text-[#EEEEEE] hover:shadow-lg hover:underline`
const NavButton = tw(Button)<ButtonProps>`bg-heal-purple subpixel-antialiased shadow rounded-lg text-base font-montserrat font-medium hover:bg-heal-purple text-[#FFFFF] hover:shadow-lg hover:underline`

const NavigationButtonGroup = ({ rolesPages }: NavigationButtonGroupProp) => {
    const { asPath, basePath } = useRouter();
    return (
        <Group direction="row"  position="center" spacing="lg">
            {Object.entries(rolesPages).map(entry => (
                <Item key={entry[0]
                }>
                    <NavButton component="a"
                               href={`${basePath}${entry[1].link}` || `${basePath}/#`}>
                        {entry[1].title ? entry[1].title : entry[0]}
                    </NavButton>
                </Item>
            ))}
        </Group>
    )
};

export default NavigationButtonGroup;

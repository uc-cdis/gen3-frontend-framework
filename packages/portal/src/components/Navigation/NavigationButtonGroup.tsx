import React from 'react';
import Link from "next/link";
import tw from "tailwind-styled-components"
import { Group } from '@mantine/core';
import { useRouter } from 'next/router'
import { RoleContentEntry } from "../Contents/RolesPageContent";
import { NavigationButton } from "./NavigationButton";

export interface NavigationButtonGroupProp {
    rolesPages: Record<string, RoleContentEntry>;
}

interface ButtonProps {
    $selected: boolean
}

const Item = tw.div`px-2`

const NavigationButtonGroup = ({ rolesPages }: NavigationButtonGroupProp) => {
    const { asPath, basePath } = useRouter();
    return (
        <Group direction="row"  position="center" spacing="lg">
            {Object.entries(rolesPages).map(entry => (
                <Item key={entry[0]
                }>
                    <Link href={`${basePath}${entry[1].link}` || `${basePath}/#`}>
                        <NavigationButton component="a" $selected={asPath === entry[1].link} >
                            {entry[1].title ? entry[1].title : entry[0]}
                        </NavigationButton>
                    </Link>
                </Item>
            ))}
        </Group>
    )
};

export default NavigationButtonGroup;

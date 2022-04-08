import React from "react";
import { useRouter } from 'next/router'
import tw from "tailwind-styled-components"
import { Box, Grid, Group, Text } from '@mantine/core';
import RoleInfoCard, {RoleInfoCardProp} from "../RoleInfoCard"
import NavigationButtonGroup from '../Navigation/NavigationButtonGroup';


export interface RoleContentEntry {
    readonly content: ReadonlyArray<RoleInfoCardProp>;
    readonly link:string;
    readonly title?:string;
}

export interface RolesPageContentProp {
    rolesPages: Record<string, RoleContentEntry>;
    rolePageKey: string;
}

const Item = tw.div`h-100 text-center p-2`

const RolesPageContent = ({ rolesPages, rolePageKey }: RolesPageContentProp) => {
    const { basePath } = useRouter();

    return (
        <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
            {Object.keys(rolesPages).length > 0 ? (
                <Group position="center" direction="column" spacing="xl" className='my-5'>
                    <Item>
                        <Text className="pt-6 font-montserrat subpixel-antialiased text-[2.125rem] text-base font-[400] leading-[1.235] tracking-[.00735em]" >
                            What are you interested in
                        </Text>
                    </Item>
                    <NavigationButtonGroup rolesPages={rolesPages} />
                </Group>
            ) : null}
            {(rolesPages[rolePageKey] && rolesPages[rolePageKey].content && rolesPages[rolePageKey].content.length > 0) ? (
                <Grid className="mx-6" gutter="xl" >
                    {rolesPages[rolePageKey].content.map((entry: RoleInfoCardProp) => (
                        <Grid.Col key={entry.title} xs={4}>
                            <Item className='h-full'>
                                <RoleInfoCard
                                    icon={`${basePath}${entry.icon}`}
                                    tooltip={entry.tooltip}
                                    title={entry.title}
                                    content={entry.content}
                                />
                            </Item>
                        </Grid.Col>
                    ))}
                </Grid>
            ) : null}
        </Box>
    );
}

export default RolesPageContent;

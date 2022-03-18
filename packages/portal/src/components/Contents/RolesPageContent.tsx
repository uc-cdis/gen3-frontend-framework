import React, { PropsWithChildren } from "react";
import { useRouter } from 'next/router'
 import { styled } from '@mui/material/styles';
// import { Stack, Box, Grid, Typography } from '@mui/material';
import { Box, Grid, Text, Title } from '@mantine/core';
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

const Item<T> = styled('div')(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    height: "100%"
}));

const Item:React.FC<ChildPr, any>

const RolesPageContent = ({ rolesPages, rolePageKey }: RolesPageContentProp) => {
    const { basePath } = useRouter();

    return (
        <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
            {Object.keys(rolesPages).length > 0 ? (
                <Stack spacing={2} className='mb-6'>
                    <Item>
                        <Title order={4} className='font-montserrat'>
                            What are you interested in
                        </Title>
                    </Item>
                    <NavigationButtonGroup rolesPages={rolesPages} />
                </Stack>
            ) : null}
            {(rolesPages[rolePageKey] && rolesPages[rolePageKey].content && rolesPages[rolePageKey].content.length > 0) ? (
                <Grid spacing={2}>
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

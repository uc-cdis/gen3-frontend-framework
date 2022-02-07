import * as React from 'react';
import { useRouter } from 'next/router'
import { styled } from '@mui/material/styles';
import { Stack, Box, Grid, Typography } from '@mui/material';
import RoleInfoCard from "../RoleInfoCard"
import NavigationButtonGroup from '../Navigation/NavigationButtonGroup';

export interface RolesPageContentProp {
    rolesPages: Record<any, any>;
    rolePageKey: string;
}

const Item = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: "100%"
}));

const RolesPageContent = ({ rolesPages, rolePageKey }: RolesPageContentProp) => {
    const { basePath } = useRouter();

    return (
        <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
            {Object.keys(rolesPages).length > 0 ? (
                <Stack spacing={2} className='mb-6'>
                    <Item>
                        <Typography variant="h6" component="div">
                            What are you interested in
                        </Typography>
                    </Item>
                    <NavigationButtonGroup rolesPages={rolesPages} />
                </Stack>
            ) : null}
            {(rolesPages[rolePageKey] && rolesPages[rolePageKey].content && rolesPages[rolePageKey].content.length > 0) ? (
                <Grid container justifyContent="space-evenly" spacing={2}>
                    {rolesPages[rolePageKey].content.map((entry: { icon: string | undefined; tooltip: string | undefined; title: string; content: string[]; }) => (
                        <Grid item key={entry.title} xs={4}>
                            <Item className='h-full'>
                                <RoleInfoCard
                                    icon={`${basePath}${entry.icon}`}
                                    tooltip={entry.tooltip}
                                    title={entry.title}
                                    content={entry.content}
                                />
                            </Item>
                        </Grid>
                    ))}
                </Grid>
            ) : null}
        </Box>
    );
}

export default RolesPageContent;

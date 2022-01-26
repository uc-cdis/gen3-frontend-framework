import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Stack, Box, Button, Grid, Typography } from '@mui/material';
import RoleInfoCard from "../RoleInfoCard"

export interface ResearchPageContentProp {
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

const ResearchPageContent = ({ rolesPages, rolePageKey }: ResearchPageContentProp) => (
    <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
        {Object.keys(rolesPages).length > 0 ? (
            <Stack spacing={2} className='mb-6'>
                <Item>
                    <Typography variant="h6" component="div">
                        What are you interested in
                    </Typography>
                </Item>
                <Stack direction={"row"} justifyContent={"center"} spacing={2}>
                    {Object.entries(rolesPages).map(entry => (
                        <Item key={entry[0]}>
                            <Button variant="contained" className="bg-sky-500" href={entry[1].link || '#'}>{entry[0]}</Button>
                        </Item>
                    ))}
                </Stack>
            </Stack>
        ) : null}
        {(rolesPages[rolePageKey] && rolesPages[rolePageKey].content && rolesPages[rolePageKey].content.length > 0) ? (
            <Grid container justifyContent="space-evenly" spacing={2}>
                {rolesPages[rolePageKey].content.map((entry: { icon: string | undefined; tooltip: string | undefined; title: string; content: string[]; }) => (
                    <Grid item key={entry.title} xs={4}>
                        <Item className='h-full'>
                            <RoleInfoCard
                                icon={entry.icon}
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

export default ResearchPageContent;

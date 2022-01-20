import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Stack, Box, Button, Divider, Grid, Typography } from '@mui/material';
import LandingBarChart from '../components/Charts/LandingBarChart';
import LandingLineChart from '../components/Charts/LandingLineChart';
import StatisticComponent from '../components/StatisticComponent';

const Item = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}));

export default function LandingPage() {
    return (
        <Box sx={{ flexGrow: 1, padding: 5, height: '100%' }}>
            <Stack spacing={2}>
                <Item>
                    <Typography component="div">
                        The Helping to End Addiction Long-term Initiative, or NIH HEAL Initiative, is an aggressive, trans-agency effort to
                        speed scientific solutions to stem the national opioid public health crisis. Almost every NIH Institute and Center
                        is accelerating research to address this public health emergency from all angles.
                    </Typography>
                </Item>
                <Stack spacing={2}>
                    <Item>See here an overview of the HEAL platform</Item>
                    <Item>
                        <Button variant="contained" className="bg-blue-800">About HEAL</Button>
                    </Item>
                </Stack>
            </Stack>
            <Divider variant="middle" className="not-prose" />
            <Stack spacing={2}>
                <Item>
                    <Typography variant="h6" component="div">
                        What are you interested in
                    </Typography>
                </Item>
                <Stack direction={"row"} justifyContent={"center"} spacing={2}>
                    <Item>
                        <Button variant="contained" className="bg-sky-500">Research</Button>
                    </Item>
                    <Item>
                        <Button variant="contained" className="bg-sky-500">Treatment</Button>
                    </Item>
                    <Item>
                        <Button variant="contained" className="bg-sky-500">Community and Support</Button>
                    </Item>
                    <Item>
                        <Button variant="contained" className="bg-sky-500">Policy Related</Button>
                    </Item>
                </Stack>
            </Stack>
            <Divider variant="middle" className="not-prose" />
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Item>
                        <LandingBarChart
                            title={'Results generated with HEAL data'}
                            subTitle={'Annual National Opioid Overdoses and Suicides'}
                            note={['* CDC Wonder https://wonder.cdc.gov/']}
                        />
                    </Item>
                </Grid>
                <Grid item xs={4}>
                        <StatisticComponent
                        title={'Studies'}
                        statisticData={[
                            { name: 'Total Studies', value: 601 },
                            { name: 'Young Adults', value: 68 },
                            { name: 'Medication Treatment', value: 65 },
                            { name: 'Overdose', value: 59 },
                            { name: 'Practice', value: 44 },
                            { name: 'Mental Health', value: 37 }
                        ]}
                        />
                </Grid>
                <Grid item xs={4}>
                    <Item>
                        <LandingLineChart
                            title={'Results generated with HEAL data'}
                            subTitle={'Age-adjusted rates of drug overdose death involving opioids by type of opioid: United States'}
                            note={['* CDC Wonder https://wonder.cdc.gov/']}
                        />
                    </Item>
                </Grid>
            </Grid>
        </Box>
    );
}

import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Stack, Box, Button, Divider, Grid, Typography } from '@mui/material';
import LandingBarChart from '../Charts/LandingBarChart';
import LandingLineChart from '../Charts/LandingLineChart';
import StatisticComponent from '../StatisticComponent';
import TableComponent from '../TableComponent';

export interface LandingPageContentProp {
    rolesPages: Record<any, any>
}

const Item = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}));

const LandingPageContent = ({ rolesPages }: LandingPageContentProp) => (
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
        {Object.keys(rolesPages).length > 0 ? (
            <div>
                <Stack spacing={2}>
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
                <Divider variant="middle" className="not-prose" />
            </div>
        ) : null}
        <Grid container justifyContent="space-evenly" spacing={2}>
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
            <Grid item xs={4}>
                <TableComponent
                    title={'Newly Available Data'}
                    columns={[
                        { field: 'title', headerName: 'Title', flex: 1, align: "center", headerAlign: "center" },
                        { field: 'investigator', headerName: 'Investigator', flex: 1, align: "center", headerAlign: "center" },
                        {
                            field: 'repository', headerName: 'Repository', flex: 1, align: "center", headerAlign: "center", renderCell: (params) => (
                                <Button href="/">{params.value}</Button>
                            ),
                        },
                    ]}
                    rows={[
                        { id: 1, title: 'Title 1', investigator: 'John Smith', repository: 'ICPSR' },
                        { id: 2, title: 'Title 2', investigator: 'Mary Jones', repository: 'MPS' },
                        { id: 3, title: 'Title 3', investigator: 'Brian David', repository: 'JCOIN' },
                        { id: 4, title: 'Title 4', investigator: 'John Johnson', repository: 'ICPSR' },
                        { id: 5, title: 'Title 5', investigator: 'Kevin Carlson', repository: 'Clinicaltrials' },
                        { id: 6, title: 'Title 6', investigator: 'Casey Andrews', repository: 'JCOIN' },
                        { id: 7, title: 'Title 7', investigator: 'Bob Morris', repository: 'ICPSR' },
                    ]}
                />
            </Grid>
            <Grid item xs={4}>
                <TableComponent
                    title={'Clinical Trials'}
                    columns={[
                        {
                            field: 'title', headerName: 'Title', flex: 1, align: "center", headerAlign: "center", renderCell: (params) => (
                                <Button href="/">{params.value}</Button>
                            ),
                        },
                        { field: 'dcc', headerName: 'DCC', flex: 1, align: "center", headerAlign: "center" },
                        { field: 'state', headerName: 'State', flex: 1, align: "center", headerAlign: "center" },
                    ]}
                    rows={[
                        { id: 1, title: 'Title 1', dcc: 'PRISM', state: 'IL' },
                        { id: 2, title: 'Title 2', dcc: 'Prevention', state: 'IA' },
                        { id: 3, title: 'Title 3', dcc: 'HOPE', state: 'WI' },
                        { id: 4, title: 'Title 4', dcc: 'BACPAC', state: 'MA' },
                        { id: 5, title: 'Title 5', dcc: 'HOPE', state: 'FL' },
                        { id: 6, title: 'Title 6', dcc: 'Prevention', state: 'MN' },
                        { id: 7, title: 'Title 7', dcc: 'PRISM', state: 'NC' },
                    ]}
                />
            </Grid>
        </Grid>
    </Box>
);

export default LandingPageContent;

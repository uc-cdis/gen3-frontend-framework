import * as React from 'react';
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link';
import { Box, Button, Grid, Group, Text } from '@mantine/core';
import tw from "tailwind-styled-components"
import LandingBarChart from '../Charts/LandingBarChart';
import LandingLineChart from '../Charts/LandingLineChart';
import StatisticComponent from '../StatisticComponent';
import { NavigationButton } from '../Navigation/NavigationButton'
import TableComponent from '../TableComponent';
import NavigationButtonGroup from '../Navigation/NavigationButtonGroup';
import { RoleContentEntry } from './RolesPageContent';

export interface LandingPageContentProp {
    rolesPages: Record<string, RoleContentEntry>
}

const Item = tw.div`font-montserrat`
const Divider = tw.div`
        flex
        flex-row
        items-center
        border
        w-100
        my-16
`
const LandingPageContent = ({ rolesPages }: LandingPageContentProp) => {
    const { basePath } = useRouter();
    const TableHeaderStyle = "font-montserrat text-black text-sm font-medium text-center";

    return (
        <Box className="flex-grow p-[40px] h-100">
            <Group direction="row" position="center"  className="gap-x-36" >
                <Item className='block max-w-[38%]'>
                    <Group className='h-full'  direction="column"  spacing="lg" position="left">
                        <Text className="font-montserrat subpixel-antialiased text-[2.125rem] text-base font-[400] leading-[1.235] tracking-[.00735em]" >
                            HEAL Platform
                        </Text>
                        <Text className="prose font-montserrat font-[500] subpixel-antialiased" >
                            The Helping to End Addiction Long-term Initiative, or NIH HEAL Initiative, is an aggressive, trans-agency effort to
                            speed scientific solutions to stem the national opioid public health crisis. Almost every NIH Institute and Center
                            is accelerating research to address this public health emergency from all angles.
                        </Text>
                        <Item className="pl-2">
                            <Link href={`${basePath}/landing/about-heal`} passHref>
                                <NavigationButton $selected={true}>About HEAL</NavigationButton>
                            </Link>
                        </Item>
                    </Group>
                </Item>
                <Item className='block max-w-[40%]'>
                    <Image
                        src={`${basePath}/images/HEAL_Initiative.jpeg`}
                        alt="HEAL initiative"
                        width={1260}
                        height={630}
                        layout='intrinsic'
                    />
                </Item>
            </Group>
            <Divider />
            {Object.keys(rolesPages).length > 0 ? (
                <div>
                    <Group direction="column"  position="center">
                        <Item className='text-center'>
                            <Text className="my-3 font-montserrat subpixel-antialiased text-[2.125rem] text-base font-[400] leading-[1.235] tracking-[.00735em]" >
                                What are you interested in
                            </Text>
                        </Item>
                        <NavigationButtonGroup rolesPages={rolesPages} />
                    </Group>
                    <Divider/>
                </div>
            ) : null}
            <Grid justify="center">
                <Grid.Col span={4}>
                    <Item>
                        <LandingBarChart
                            title={'Annual National Opioid Overdoses and Suicides'}
                            subTitle={'Data from*'}
                            note={['* CDC Wonder https://wonder.cdc.gov/']}
                        />
                    </Item>
                </Grid.Col>
                <Grid.Col span={4}>
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
                </Grid.Col>
                <Grid.Col span={4}>
                    <Item>
                        <LandingLineChart
                            title={'Age-adjusted rates of drug overdose death involving opioids by type of opioid: United States'}
                            subTitle={'Data from*'}
                            note={['* CDC Wonder https://wonder.cdc.gov/']}
                        />
                    </Item>
                </Grid.Col>
                <Grid.Col span={4}>
                    <TableComponent
                        title={'Newly Available Data'}
                        columns={[
                            { accessor: 'title', Header: 'Title', className: `${TableHeaderStyle}`, },
                            { accessor: 'investigator', Header: 'Investigator',className: `${TableHeaderStyle}`, },
                            {
                                accessor: 'repository', Header: 'Repository Name', className: `${TableHeaderStyle}`,
                                Cell: (params : Record<string, object>) => (
                                    <Button variant="filled"
                                            classNames={{
                                                filled:"hover:bg-gen3-smoke",
                                                inner: "text-gen3-base_blue"
                                            }}
                                           >{params.value}</Button>
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
                </Grid.Col>

                <Grid.Col span={4} className="ml-24" >
                    <TableComponent
                        title={'Clinical Trials'}
                        columns={[
                            {
                                accessor: 'title',
                                Header: 'Title',
                                className: `${TableHeaderStyle}`,
                                Cell: (params : Record<string, object>) => (
                                    <Button variant="filled"
                                            classNames={{
                                                filled:"hover:bg-gen3-smoke",
                                                inner: "text-gen3-base_blue"
                                            }}
                                            >{params.value}</Button>
                                ),
                            },
                            { accessor: 'dcc', Header: 'Coordination Center', className: `${TableHeaderStyle}`},
                            { accessor: 'state', Header: 'State', className: `${TableHeaderStyle}`},
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
                </Grid.Col>

            </Grid>
        </Box>
    );
}

export default LandingPageContent;

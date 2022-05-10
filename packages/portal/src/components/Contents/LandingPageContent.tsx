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
                        <Text className="font-montserrat subpixel-antialiased text-[3.125rem] text-base font-[400] leading-[1.235] tracking-[.00735em]" >
                            Gen3 Platform
                        </Text>
                        <Text className="prose font-montserrat font-[500] subpixel-antialiased" >
                          Gen3 is an open-source platform that enables the standing-up of data commons for managing, analyzing, and sharing research data.
                        </Text>
                        <Item className="pl-2">
                            <Link href={`${basePath}/landing/about-heal`} passHref>
                                <NavigationButton $selected={true}>About Gen3</NavigationButton>
                            </Link>
                        </Item>
                    </Group>
                </Item>
                <Item className='block max-w-[40%]'>
                    <Image
                        src={`${basePath}/images/kv.svg`}
                        alt="Gen3"
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
                            <Text className="my-1 font-montserrat subpixel-antialiased text-[2.125rem] text-base font-[400] leading-[1.235] tracking-[.00735em]" >
                                What are you interested in
                            </Text>
                        </Item>
                        <NavigationButtonGroup rolesPages={rolesPages} />
                    </Group>
                    <Divider/>
                </div>
            ) : null}
        </Box>
    );
}

export default LandingPageContent;

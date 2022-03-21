import { Grid } from '@mantine/core';
import tw from "tailwind-styled-components"
import BorderComponent from './BorderComponent';
import StatisticCard, { StatisticCardProp } from './StatisticCard';

interface StatisticComponentProp {
    title: string,
    statisticData: Array<StatisticCardProp>
}

const Item = tw.div`text-center`

const StatisticComponent = ({ title, statisticData }: StatisticComponentProp) => (
    <BorderComponent title={title} >
        <Grid spacing={0}>
            {statisticData.map((data, index) => (
                <Grid.Col key={index} item xs={4}>
                    <Item className="grid w-full h-full">
                        <StatisticCard name={data.name} value={data.value} />
                    </Item>
                </Grid.Col>
            ))}
        </Grid>
    </BorderComponent>
);

export default StatisticComponent;

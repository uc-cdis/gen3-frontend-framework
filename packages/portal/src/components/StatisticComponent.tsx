import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import BorderComponent from './BorderComponent';
import StatisticCard, { StatisticCardProp } from './StatisticCard';

interface StatisticComponentProp {
    title: string,
    statisticData: Array<StatisticCardProp>
}

const Item = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary
}));

const StatisticComponent = ({ title, statisticData }: StatisticComponentProp) => (
    <BorderComponent title={title} >
        <Grid container spacing={0}>
            {statisticData.map((data, index) => (
                <Grid key={index} item xs={4}>
                    <Item className="grid w-full h-full">
                        <StatisticCard name={data.name} value={data.value} />
                    </Item>
                </Grid>
            ))}
        </Grid>
    </BorderComponent>
);

export default StatisticComponent;

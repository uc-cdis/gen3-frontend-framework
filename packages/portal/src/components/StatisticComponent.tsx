import { Box, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
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
    <Box sx={{ flexGrow: 1, borderWidth: "1px", borderColor: "grey", borderRadius: "4px" }}>
        <div className="grid w-full h-full bg-gray-300">
            <Typography align='center'>
                {title}
            </Typography>
            </div>
        <Grid container spacing={0}>
            {statisticData.map((data, index) => (
                <Grid key={index} item xs={4}>
                    <Item className="grid w-full h-full">
                        <StatisticCard name={data.name} value={data.value} />
                    </Item>
                </Grid>
            ))}
        </Grid>
    </Box>
);

export default StatisticComponent;

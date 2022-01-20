import { Box, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import StasticCard, { StasticCardProp } from './StasticCard';

interface StasticComponentProp {
    title: string,
    stasticData: Array<StasticCardProp>
}

const Item = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary
}));

const StasticComponent = ({ title, stasticData }: StasticComponentProp) => (
    <Box sx={{ flexGrow: 1, borderWidth: "1px", borderColor: "grey", borderRadius: "4px" }}>
        <div className="grid w-full h-full bg-gray-300">
            <Typography align='center'>
                {title}
            </Typography>
            </div>
        <Grid container spacing={0}>
            {stasticData.map((data, index) => (
                <Grid item xs={4}>
                    <Item className="grid w-full h-full">
                        <StasticCard key={index} name={data.name} value={data.value} />
                    </Item>
                </Grid>
            ))}
        </Grid>
    </Box>
);

export default StasticComponent;

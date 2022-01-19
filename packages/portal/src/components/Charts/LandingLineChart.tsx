import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, Legend, XAxis, YAxis,
} from 'recharts';
import Typography from '@mui/material/Typography';

const data = [
  {
    year: '2000',
    heroin: 1,
    heroinPerdiction: [1, 1],
    methadone: 2,
    methadonePerdiction: [2, 2],
  },
  {
    year: '2005',
    heroin: 5,
    heroinPerdiction: [3, 6],
    methadone: 4,
    methadonePerdiction: [4, 4],
  },
  {
    year: '2010',
    heroin: 10,
    heroinPerdiction: [8, 13],
    methadone: 6,
    methadonePerdiction: [6, 8],
  },
  {
    year: '2015',
    heroin: 14,
    heroinPerdiction: [10, 20],
    methadone: 14,
    methadonePerdiction: [13, 15],
  },
];

interface LineChartProps {
    title?: string,
    subTitle?: string,
    note?: Array<string>,
}


const LandingLineChart: React.FC<LineChartProps> = ({
    title = '',
    subTitle = '',
    note = [],
}: LineChartProps) => {
    return (
        <div className="not-prose" style={{
            width: "100%",
            height: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
        {(title) ? <Typography>{title}</Typography> : null}
        {(subTitle) ? <Typography variant="body2">{subTitle}</Typography> : null}
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <XAxis dataKey='year' />
            <YAxis />
            <Legend />
            <Line type='linear' dataKey='heroin' stroke='#f70000' />
            <Area type='linear' dataKey='heroinPerdiction' stroke='none' fill='#ff968f' fillOpacity='0.85' />
            <Line type='linear' dataKey='methadone' stroke='#0303ff' />
            <Area type='linear' dataKey='methadonePerdiction' stroke='none' fill='#039eff' fillOpacity='0.85' />
          </ComposedChart>
        </ResponsiveContainer>
        {(note.length > 0)
          ? (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
              {note.map((e, index) => <Typography key={index}>{e}</Typography>)}
            </div>
          )
          : null}
      </div>
    );
  }

export default LandingLineChart;

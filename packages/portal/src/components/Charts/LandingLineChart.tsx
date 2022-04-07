import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, Legend, XAxis, YAxis,
} from 'recharts';
import { Text } from '@mantine/core';

const data = [
  {
    year: '2000',
    heroin: 1,
    heroinPrediction: [1, 1],
    methadone: 2,
    methadonePrediction: [2, 2],
  },
  {
    year: '2005',
    heroin: 5,
    heroinPrediction: [3, 6],
    methadone: 4,
    methadonePrediction: [4, 4],
  },
  {
    year: '2010',
    heroin: 10,
    heroinPrediction: [8, 13],
    methadone: 6,
    methadonePrediction: [6, 8],
  },
  {
    year: '2015',
    heroin: 14,
    heroinPrediction: [10, 20],
    methadone: 14,
    methadonePrediction: [13, 15],
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
            alignItems: "center",
            textAlign: "center"
        }}>
        {(title) ? <Text className='font-montserrat'>{title}</Text> : null}
        {(subTitle) ? <Text className='font-montserrat' size="xs" >{subTitle}</Text> : null}
        <ResponsiveContainer>
          <ComposedChart data={data} className='font-montserrat text-sm' >
            <XAxis dataKey='year' />
            <YAxis />
            <Legend />
            <Line type='linear' dataKey='heroin' stroke='#46025D' />
            <Area type='linear' dataKey='heroinPrediction' stroke='none' fill='#A55082' fillOpacity='0.6' />
            <Line type='linear' dataKey='methadone' stroke='#BA2800' />
            <Area type='linear' dataKey='methadonePrediction' stroke='none' fill='#F56942' fillOpacity='0.8' />
          </ComposedChart>
        </ResponsiveContainer>
        {(note.length > 0)
          ? (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
              {note.map((e, index) => <div className='font-montserrat text-xs' key={index}>{e}</div>)}
            </div>
          )
          : null}
      </div>
    );
  }

export default LandingLineChart;

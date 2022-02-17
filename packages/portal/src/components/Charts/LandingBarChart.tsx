import React from 'react';
import {
    ResponsiveContainer, BarChart, Bar, Legend, XAxis, YAxis,
} from 'recharts';
import Typography from '@mui/material/Typography';

// TODO: pass data in props
const data = [
    { year: 2000, death: 8000 },
    { year: 2001, death: 9000 },
    { year: 2002, death: 10000 },
    { year: 2003, death: 12000 },
    { year: 2004, death: 14000 },
    { year: 2005, death: 16000 },
    { year: 2006, death: 23000 },
    { year: 2007, death: 25000 },
    { year: 2008, death: 27000 },
    { year: 2009, death: 30000 },
];

interface BarChartProps {
    title?: string,
    subTitle?: string,
    note?: Array<string>,
}


const LandingBarChart: React.FC<BarChartProps> = ({
    title = '',
    subTitle = '',
    note = [],
}: BarChartProps) => {
    return (
        <div className="not-prose" style={{
            width: "100%",
            height: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
        }}>
            {(title) ? <Typography className='font-montserrat'>{title}</Typography> : null}
            {(subTitle) ? <Typography className='font-montserrat' variant="body2">{subTitle}</Typography> : null}
            <ResponsiveContainer>
                <BarChart data={data}>
                    <XAxis dataKey='year' />
                    <YAxis />
                    <Legend />
                    <Bar
                        fill='#c0b3c5'
                        dataKey='death'
                    />
                </BarChart>
            </ResponsiveContainer>
            {(note.length > 0)
                ? (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        {note.map((e, index) => <Typography className='font-montserrat' key={index}>{e}</Typography>)}
                    </div>
                )
                : null}
        </div>
    );
}

export default LandingBarChart;

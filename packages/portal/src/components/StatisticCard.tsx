import React from 'react';
import { Card, Text, Title } from '@mantine/core';
export interface StatisticCardProp {
    name: string,
    value: number,
}

const StatisticCard = ({ name, value }: StatisticCardProp) => (
    <Card elevation={0}>
        <Card.Section>
            <title className='font-montserrat' order="5" >
                {value}
            </title>
            <Text className="font-montserrat not-prose" sx={{ mb: 1.5 }} color="text.secondary">
                {name}
            </Text>
        </Card.Section>
    </Card>
);


export default StatisticCard;

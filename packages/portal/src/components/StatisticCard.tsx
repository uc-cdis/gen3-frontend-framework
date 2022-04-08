import React from 'react';
import { Card, Text } from '@mantine/core';
export interface StatisticCardProp {
    name: string,
    value: number,
}

const StatisticCard = ({ name, value }: StatisticCardProp) => (
    <Card className="p-1 mb-6" >
        <Card.Section className="m-1" >
            <Text className='prose font-montserrat text-black text-2xl p-2 m-2'  >
                {value}
            </Text>
            <Text className='prose font-montserrat ' size="md">
                {name}
            </Text>
        </Card.Section>
    </Card>
);


export default StatisticCard;

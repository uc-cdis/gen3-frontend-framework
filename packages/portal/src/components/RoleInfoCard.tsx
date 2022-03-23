import React from 'react';
import {Button, Card, Tooltip, Title, Text} from '@mantine/core';
import HelpIcon from '@mui/icons-material/Help';
import Image from 'next/image'

export interface RoleInfoCardProp {
    icon?: string,
    tooltip?: string,
    title: string,
    content: ReadonlyArray<string>,
}

const RoleInfoCard = ({ icon = "", tooltip = "", title, content }: RoleInfoCardProp) => (
    <Card className='h-full border-6 rounded b' shadow="sm" sx={{borderColor: "#e5e7eb"}}>
        <Card.Section className="flex flex-row justify-end p-5 pb-0 w-100" >
            {tooltip?
                <Tooltip label={tooltip}
                         position="top"
                         placement="center"
                         wrapLines
                         width={260}
                         transition="fade"
                         transitionDuration={200}
                         withArrow
                         classNames={{
                             arrow: "bg-gen3-gray",
                             body: "bg-gen3-gray"
                         }}
                >
                    <HelpIcon className="opacity-50"/>
                </Tooltip>
            :
            null
            }
            </Card.Section>
        <Card.Section className="my-8">
            {icon ? <Image src={icon} alt={icon} width={60} height={60} /> : null}
            <Title className="not-prose underline font-montserrat mt-2 font-normal" order={5} >{title}</Title>
            {content.map((element, index) => (
                <Text className="prose font-montserrat text-sm m-3 " key={index}>{element}</Text>
            ))}
        </Card.Section>
    </Card>
);

export default RoleInfoCard;

import React from 'react';
import { Card, Tooltip, Title, Text} from '@mantine/core';
import Image from 'next/image'
import { MdHelp as HelpIcon } from "react-icons/md";

export interface RoleInfoCardProp {
    icon?: string,
    tooltip?: string,
    title: string,
    content: ReadonlyArray<string>,
}

const RoleInfoCard = ({ icon = "", tooltip = "", title, content }: RoleInfoCardProp) => (
    <Card className='h-full border-6 rounded b' shadow="none" sx={{borderColor: "#e5e7eb"}}>
        <Card.Section className="flex flex-row justify-end p-5 pb-0 w-100" >
            {tooltip?
                <Tooltip label={
                    <div className="max-w-xs flex flex-wrap prose text-white text-xs text-left break-words">{tooltip}</div>
                }
                         position="top"
                         placement="center"
                         transition="fade"
                         transitionDuration={200}
                         withArrow
                         wrapLines
                         classNames={{
                             arrow: "bg-gen3-gray",
                             body: "bg-gen3-gray text-xs break-words "
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

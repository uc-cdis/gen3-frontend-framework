import { Text } from "@mantine/core";
import { FaExternalLinkAlt } from "react-icons/fa";

export interface MultiPartTextProps {
    readonly parts: ReadonlyArray<MultiPartTextPart>;
}

export interface MultiPartTextPart {
    type: "text"|"link"|"bold"|"break";
    content?: string;
    link?: string;
    linkType: string;
}

const MultiPartText = ({parts}: MultiPartTextProps) => {
    return <>
        {
            parts.map(
                ({type, content, link}) => {
                    return {
                        "text": <span className="text-xl">{content}</span>,
                        "boldText": <span className="text-xl font-bold">{content}</span>,
                        "link": <a className="text-gen3-base_blue no-underline font-bold" href={link}> {content}</a>,
                        "outboundLink": <a className="text-gen3-base_blue flex flex-row align-center no-underline font-bold px-10 mb-5" href={link} target="_blank" rel="noreferrer">
                        <FaExternalLinkAlt className="pr-1 pt-2"/> {content}</a>,
                        "bold": <Text className="font-bold text-4xl text-gen3-coal font-montserrat pb-8">{content}</Text>,
                        "break": <br/>
                    }[type];
                }
            )
        }
    </>
}

export default MultiPartText;

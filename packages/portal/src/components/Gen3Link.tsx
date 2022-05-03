import Link from "next/link";
import { PropsWithChildren } from "react";

interface ClassProps {
    readonly className?: string;
}

interface Gen3LinkProps extends ClassProps {
    readonly href: string;
    readonly linkType?: string;
    readonly text: string;
}

const Gen3Link: React.FC<Gen3LinkProps> = ({ className,
    href,
    linkType,
    text,
}: PropsWithChildren<Gen3LinkProps>) => {

    if (linkType === "gen3ff") {
        return (
            <span className={className}>
                <Link href={href}>{text}</Link>
            </span>
        );
    }
    else if (linkType === "portal") {
        return <a className={className} href={`https://${process.env.PORTAL_BASENAME}${href}`}>{text}</a>
    }
    // external link
    return <a className={className} href={href} target='_blank' rel="noreferrer">{text}</a>
};

export default Gen3Link;

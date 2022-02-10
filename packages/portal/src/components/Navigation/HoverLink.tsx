import Link from "next/link";
import { PropsWithChildren } from "react";

interface ClassProps {
    readonly className?: string;
}

interface HoverLinkProps extends ClassProps {
    readonly href: string;
}

const HoverLink: React.FC<HoverLinkProps> = ({ className,
    href,
    children,
}: PropsWithChildren<HoverLinkProps>) => {
    return (
        <span className={className}>
            <Link href={href} passHref>
                {children}
            </Link>
        </span>
    );
};

export default HoverLink;

import Link from "next/link";
import { PropsWithChildren } from "react";

interface HoverLinkProps {
    readonly href: string;
}

const HoverLink: React.FC<HoverLinkProps> = ({
                                                 href,
                                                 children,
                                             }: PropsWithChildren<HoverLinkProps>) => {
    return (
        <span className="hover:bg-blue-800">
      <Link href={href}>
          {children}
      </Link>
    </span>
    );
};

export default HoverLink;

import Link from "next/link";
import { PropsWithChildren } from "react";

interface ClassProps {
  readonly className?: string;
}

interface HoverLinkProps extends ClassProps {
  children?: React.ReactNode
  readonly href: string;
}

const HoverLink = ({
  className,
  href,
  children,
}: HoverLinkProps) => {
  return (
    <span className={className}>
      <Link href={href} passHref>
        {children}
      </Link>
    </span>
  );
};

export default HoverLink;

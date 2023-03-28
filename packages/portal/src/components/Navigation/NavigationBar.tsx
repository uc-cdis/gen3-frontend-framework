import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import HoverLink from "./HoverLink";

export interface NavigationButtonProps {
  readonly icon: string;
  readonly tooltip: string;
  readonly href: string;
  readonly name: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  tooltip,
  icon,
  href,
  name,
}: NavigationButtonProps) => {
  return (
    <div className="has-tooltip relative h-[80px]">
      <Link
        className="content-center"
        href={`${
          process.env.NEXT_PUBLIC_PORTAL_BASENAME &&
          process.env.NEXT_PUBLIC_PORTAL_BASENAME !== "/"
            ? process.env.NEXT_PUBLIC_PORTAL_BASENAME
            : ""
        }${href}`}
      >
        <div className="flex flex-col min-w-[110px] flex-nowrap px-[2px] py-2 pt-[14px] items-center font-sans text-sm border-b-3 border-b-transparent hover:accent opacity-80 hover:opacity-100">
          <Icon height="27px" icon={icon} className="mt-[2px] ml-[4px]" />
          <p className="content-center pt-1.5 font-montserrat body-typo">
            {name}
          </p>
        </div>
      </Link>
      <div className="opacity-100 tooltip p-2.5 m-5 w-60 bg-white border-gray-400 border border-solid rounded text-left align-content-center text-gen3-titanium">
        {tooltip}
      </div>
    </div>
  );
};

interface NavigationBarLogo {
  readonly src: string;
  readonly title?: string;
  readonly description: string;
  readonly width?: number;
  readonly height?: number;

  readonly basePath?: string;
}

const NavigationLogo = ({
  src,
  title,
  description,
  basePath = "",
}: NavigationBarLogo) => {
  return (
    <div className="relative flex flex-row h-full items-center align-middle font-montserrat font-bold tracking-wide text-xl ml-[20px] mr-[20px]">
      <HoverLink className="w-32 h-full" href={"/"}>
        <Image
          className="pr-3 object-contain"
          fill
          src={`${basePath}${src}`}
          alt={description}
        />
      </HoverLink>
      {title && (
        <div className="border-solid border-base-darker border-l-1 ml-1 mr-3 h-32 w-1 ">
          <HoverLink
            className="font-montserrat h3-typo pt-2 text-ink-dark hover:text-ink-darkest hover:border-accent hover:border-b-3"
            href={"/"}
          ></HoverLink>
        </div>
      )}
    </div>
  );
};

export interface NavigationProps {
  readonly logo?: NavigationBarLogo;
  readonly items: [NavigationButtonProps];
}

const NavigationBar: React.FC<NavigationProps> = ({
  logo = undefined,
  items,
}: NavigationProps) => {
  const { basePath } = useRouter();

  return (
    <div className="flex flex-row border-b-1 bg-gen3-white border-gen3-smoke">
      <div className="flex flex-row items-center align-middle font-montserrat font-bold tracking-wide text-xl ml-[20px] mr-[20px]">
        {logo && <NavigationLogo {...{ ...logo, basePath }} />}
      </div>
      <div className="flex-grow">{/* middle section of header */}</div>
      <div className="flex flex-row pl-[30px] pr-[20px] ">
        {items.map((x, index) => {
          return (
            <div key={`${x.name}-${index}`}>
              <div className="border-l-1 border-gen3-smoke">
                <NavigationButton
                  tooltip={x.tooltip}
                  icon={x.icon}
                  href={x.href}
                  name={x.name}
                />
              </div>
            </div>
          );
        })}
        <div className="border-l-1 border-gray-400 opacity-80" />
      </div>
    </div>
  );
};

export default NavigationBar;

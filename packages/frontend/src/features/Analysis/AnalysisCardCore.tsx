import React from "react";
import { Grid, Text, Image } from "@mantine/core";
import {
  MdPlayArrow as PlayIcon,
} from "react-icons/md";
import Link from "next/link";
import NextImage from "next/image";
import { AnalysisToolConfiguration } from "./types";

const CoreToolCard: React.FC<AnalysisToolConfiguration> = ({
  title,
  description,
  icon,
  href,
  appId,
}) => {
  return (
    <Link
      href={{
        pathname: href,
        query: {
          app: appId,
        },
      }}
      className="group"
    >
      <Grid
        classNames={{
          root: "h-full",
          inner:
            "border-secondary-darkest border h-full w-full m-0 rounded-md p-0",
        }}
      >
        <Grid.Col span={2} className="self-center relative">
          <Image
            component={NextImage}
            src={`${icon}`}
            alt={`${title} logo`}
            w={48}
            h={48}
            width={48}
            height={48}
          />
        </Grid.Col>
        <Grid.Col span={8} className="text-base-content-darkest">
          <Text size="sm" className="font-heading font-bold">
            {title}
          </Text>
          <Text size="xs" className="font-content leading-5">
            {description}
          </Text>
        </Grid.Col>
        <Grid.Col span={2} className="flex justify-end p-0 m-0">
          <div className="bg-secondary w-12 h-full p-0 group-hover:bg-secondary-darker group-focus:bg-secondary-darker rounded-none rounded-r flex justify-center items-center">
            <PlayIcon size={30} color="white" />
          </div>
        </Grid.Col>
      </Grid>
    </Link>
  );
};

export default CoreToolCard;

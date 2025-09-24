import React from "react";
import { Divider } from "@mantine/core";
import { Button, Card, Loader, Tooltip, Image } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import {
  MdArrowDropDown as ArrowDropDownIcon,
  MdInfo as InfoIcon,
  MdPlayArrow as PlayIcon,
  MdKeyboardArrowUp as UpArrowIcon,
} from "react-icons/md";
import Link from 'next/link';
import NextImage from 'next/image';
import { AnalysisToolConfiguration } from "./types";

type AnalysisCardCollapsibleProps = AnalysisToolConfiguration &  {
  readonly descriptionVisible: boolean;
  readonly setDescriptionVisible: () => void;
  readonly useCountHook: () => { data: number, isSuccess: boolean, isFetching: boolean };
}

const AnalysisCardCollapsible: React.FC<AnalysisCardCollapsibleProps> = ({
  descriptionVisible,
  setDescriptionVisible,
  title,
  description,
  icon,
  appId,
  href,
  useCountHook,
  hasDemo,
  noDataTooltip,
  hideCounts,
}) => {
  const cohortCounts = useCountHook();
  const caseCounts = cohortCounts?.data || 0;

  const inactive = caseCounts === 0 || cohortCounts.isFetching;
  const { ref: descRef, height: descHeight } = useElementSize();

  return (
    <Card
      data-testid={`${title}-tool`}
      p={6}
      className={`bg-base-max border-secondary-darkest overflow-visible border ${
        inactive ? "" : "border-t-6"
      }
     `}
      aria-label={`${title} Tool`}
    >
      {/* Spacer so that the cards are the same height without setting an explicit height for the later transition */}
      {inactive && <div className="h-1" />}
      <div className="flex justify-between mb-1">
          <Image
            component={NextImage}
            src={`${icon}`}
            alt={`${title} logo`}
            width={48}
            height={48}
            w={48}
            h={48}
          />
         <div className="flex flex-col">
          <Link
            href={{
              pathname: href,
              query: {
                app: appId,
              },
            }}
            data-testid={`button-${title}`}
            className={`
            flex
            justify-center
            items-center
            bg-secondary
            hover:bg-secondary-dark
            hover:border-secondary-dark
            focus:bg-secondary-dark
            focus:border-secondary-dark
            mb-1
            w-[50px]
            ${inactive ? "opacity-50 pointer-events-none" : ""}
            rounded
            h-5
          `}
            aria-disabled={inactive}
            aria-label={title}
          >
            <PlayIcon size={16} color="white" />
          </Link>

          {hasDemo ? (
            <Link
              href={{
                pathname: href,
                query: {
                  app: appId,
                  demoMode: true,
                },
              }}
              data-testid={`button-${title} Demo`}
              className={`
              flex
              justify-center
              items-center
              hover:bg-secondary-dark
              hover:border-secondary-dark
              hover:text-primary-content-max
              focus:bg-secondary-dark
              focus:border-secondary-dark
              focus:text-primary-content-max
              mb-1
              w-[50px]
              rounded
              h-5
              text-xs
              text-secondary
              p-0
              border
              border-secondary
              font-semibold
            `}
            >
              Demo
            </Link>
          ) : null}
        </div>
      </div>
      <Divider variant="dotted" aria-hidden="true" />
      <div className="flex flex-col items-center text-xs">
        <Button
          data-testid="select-description-tool"
          onClick={() => setDescriptionVisible()}
          variant="white"
          size="xs"
          rightSection={
            descriptionVisible ? (
              <UpArrowIcon size={16} aria-hidden="true" />
            ) : (
              <ArrowDropDownIcon size={16} aria-hidden="true" />
            )
          }
          classNames={{
            root: "text-secondary-darkest font-bold bg-transparent",
            section: "ml-0",
          }}
          aria-expanded={descriptionVisible}
        >
          {title}
        </Button>
        <div
          data-testid="text-description-tool"
          style={{ height: descriptionVisible ? descHeight : 0 }}
          className="transition-[height] duration-300 bg-primary-lightest overflow-hidden w-full mb-1"
          aria-hidden={!descriptionVisible}
        >
          <div
            className={`${
              descriptionVisible ? "opacity-100" : "opacity-0"
            } transition-opacity`}
            ref={descRef}
          >
            <p className="p-2 font-content">{description}</p>
          </div>
        </div>
        {hideCounts ? (
          <div className="h-4" />
        ) : cohortCounts ? (
          <div
            data-testid="text-case-count-tool"
            className="flex items-center text-secondary-darkest"
          >
            {cohortCounts.isFetching ? (
              <span className="flex mr-2 items-center">
                <Loader color="gray" size="xs" className="mr-2" /> Cases
              </span>
            ) : cohortCounts.isSuccess ? (
              <span>{`${caseCounts.toLocaleString()} Cases`}</span>
            ) : (
              <span className="flex mr-2 items-center text-utility-error">
                0 Cases
              </span>
            )}
            {caseCounts === 0 && (
              <Tooltip label={noDataTooltip} withArrow w={200} multiline>
                <div>
                  <InfoIcon className="inline-block ml-1" />
                </div>
              </Tooltip>
            )}
          </div>
        ) : (
          <span>
            <Loader color="gray" size="xs" className="mr-2" />
          </span>
        )}
      </div>
    </Card>
  );
};

export default AnalysisCardCollapsible;

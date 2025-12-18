import React from "react";
import { ExpandMoreIcon, LinkIcon, AlertIcon } from "@/utils/icons";
import { Accordion } from "@mantine/core";
import tw from "tailwind-styled-components";

const H2 = tw.h2`
  font-heading
  text-md
  font-bold
  text-sm
`;

const P = tw.p`
  font-content
  font-normal
  text-sm
`;

function DownloadInfo() {
  return (
    <Accordion
      variant="contained"
      chevron={<ExpandMoreIcon size="1.75em" />}
      classNames={{
        item: "border-accent-warm border-l-[3rem]",
        chevron: "text-accent",
        label: "text-sm font-bold uppercase font-heading py-2 ml-4",
      }}
    >
      <Accordion.Item
        value="howTo"
        className="border border-secondary rounded-none text-secondary-contrast-lighter bg-accent-lighter"
      >
        <Accordion.Control
          className="hover:bg-[#FFFFFF50] pl-0 relative"
          data-testid="button-how-to-download-files"
        >
          <AlertIcon
            color="white"
            className="h-6 w-6 absolute left-[-2.2rem] top-[0.4rem]"
            aria-label="Warning"
          />
          <span className="text-black font-bold">
          How to download files in my cart?
          </span>
        </Accordion.Control>
        <Accordion.Panel>
          <div data-testid="text-download-information">
            <div className="mb-2 text-black">
              <H2>Download Manifest:</H2>
              <P>
                Download a manifest for use with the{" "}
                <a
                  data-testid="link-gen3-sdk-tool"
                  href="https://github.com/uc-cdis/gen3sdk-python?tab=readme-ov-file"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold underline"
                >
                  <LinkIcon className="inline" /> Gen3 SDK
                </a>
                . The Gen3 SDK is recommended for transferring
                large volumes of data.
              </P>
            </div>

            <div className="mb-2 text-black">
              <H2>Download Cart:</H2>
              <P>Download Files in your Cart directly from the Web Browser.</P>
            </div>

          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export default DownloadInfo;

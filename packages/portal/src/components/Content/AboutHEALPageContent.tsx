import * as React from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { Stack, Box, Image, Grid, Text, Card, Accordion } from '@mantine/core';

export interface ImageEntry {
  readonly src: string;
  readonly alt: string;
}

export interface DropdownEntry {
  readonly title: string;
  readonly content: ReadonlyArray<string>;
}

export interface AboutHEALPageContentProp {
  topImages: ReadonlyArray<ImageEntry>;
  leftDropdowns: ReadonlyArray<DropdownEntry>;
  rightDropdowns: ReadonlyArray<DropdownEntry>;
}

const Item = tw.div`h-100 text-center`;

const Link = tw.a`text-heal-blue hover:underline`;

const AboutHEALPageContent = ({
  topImages,
  leftDropdowns,
  rightDropdowns,
}: AboutHEALPageContentProp) => {
  const { basePath } = useRouter();

  return (
    <Box className="flex-grow p-4 h-100">
      {topImages && topImages.length > 0 ? (
        <Grid>
          {topImages.map(
            (entry: { src: string | undefined; alt: string | undefined }) => (
              <Grid.Col key={entry.alt} xs={4}>
                <Item>
                  <Card className="h-full border-0 ">
                    <Card.Section>
                      <Image
                        fit="contain"
                        src={`${basePath}${entry.src}`}
                        alt={entry.alt}
                      />
                    </Card.Section>
                  </Card>
                </Item>
              </Grid.Col>
            ),
          )}
        </Grid>
      ) : null}
      <div className="w-100 flex flex-row justify-center font-montserrat text-sm py-2">
        <p>
          HEAL leverages data from{' '}
          <Link
            href="https://clinicaltrials.gov/"
            target="_blank"
            rel="noreferrer"
          >
            clinicaltrials.gov
          </Link>{' '}
          see{' '}
          <Link href="https://healdata.org/" target="_blank" rel="noreferrer">
            here
          </Link>{' '}
          new studies available on the platform
        </p>
      </div>
      <div className="flex flex-row flex-grow">
        <Item className="w-full max-w-[35%]">
          {leftDropdowns && leftDropdowns.length > 0 ? (
            <Grid>
              {leftDropdowns.map((entry) => (
                <Grid.Col key={entry.title} span={6}>
                  <Card className="h-full" shadow="md" p="xs">
                    <Accordion
                      defaultValue={leftDropdowns[0].title}
                      classNames={{
                        item: 'border-0',
                        label: 'font-montserrat opacity-60 overflow-visible',
                      }}
                    >
                      <Accordion.Item
                        aria-controls={entry.title}
                        value={entry.title}
                      >
                        <Accordion.Control>{entry.title}</Accordion.Control>
                        <Accordion.Panel>
                          {entry.content.length > 0
                            ? entry.content.map((contentLine) => (
                              <Text
                                key={contentLine}
                                className=" text-sm text-left break-words font-montserrat py-3"
                              >
                                  - {contentLine}
                              </Text>
                            ))
                            : null}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : null}
        </Item>
        <Item className="w-full max-w-[30%]">
          <Stack className="px-4" spacing={2}>
            <div className="text-center opacity-60 font-montserrat text-4xl text-medium font-normal py-4 ">
              What is HEAL
            </div>
            <Text className="text-center font-montserrat opacity-60 py-2  ">
              The Helping to End Addiction Long-term Initiative, or NIH HEAL
              Initiative&reg;, is an aggressive, trans-agency effort to speed
              scientific solutions to stem the national opioid public health
              crisis. Almost every NIH Institute and Center is accelerating
              research to address this public health emergency from all angles.
            </Text>
            <Text className="text-center font-montserrat opacity-60 py-2  ">
              The initiative is funding hundreds of projects nationwide.
              Researchers are taking a variety of approaches to tackles the
              opioid epidemic through:
              <ul className="list-disc text-left">
                <li>Understanding, managing, and treating pain</li>
                <li>Improving treatment for opioid misuse and addiction</li>
              </ul>
            </Text>
          </Stack>
        </Item>
        <Item className="w-full max-w-[35%]">
          {rightDropdowns && rightDropdowns.length > 0 ? (
            <Grid>
              {rightDropdowns.map((entry) => (
                <Grid.Col key={entry.title} xs={6}>
                  <Card className="h-full" shadow="md">
                    <Accordion
                      className="h-full"
                      defaultValue={rightDropdowns[0].title}
                    >
                      <Accordion.Item
                        aria-controls={entry.title}
                        value={entry.title}
                      >
                        <Accordion.Control
                          classNames={{
                            item: 'border-0',
                            label:
                              'font-montserrat opacity-60 overflow-visible',
                          }}
                        >
                          {entry.title}
                        </Accordion.Control>
                        <Accordion.Panel>
                          {entry.content.length > 0
                            ? entry.content.map((contentLine) => (
                              <Text
                                key={contentLine}
                                className="prose text-sm  text-left break-words font-montserrat"
                              >
                                  - {contentLine}
                              </Text>
                            ))
                            : null}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : null}
        </Item>
      </div>
    </Box>
  );
};

export default AboutHEALPageContent;

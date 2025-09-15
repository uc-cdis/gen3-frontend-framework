import React, { ReactElement, useMemo, useState } from 'react';
import { Divider, Stack, Text } from '@mantine/core';
import { AnalysisCenterWithSectionsConfiguration } from './types';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import AnaylsisCardCore from './AnalysisCardCore';
import AnalysisCardCollapsible from './AnalysisCardCollapsible';

/**
 * AnalysisPanelWithSections component.
 *
 * This React functional component renders a panel that organizes tools into sections. Each section
 * includes a title, a divider, and a grid of tool cards. The component supports customizable styling
 * for global and section-specific classNames.
 *
 * @type {React.FC<AnalysisCenterWithSectionsConfiguration>}
 *
 * @param {Object} props - The component properties.
 * @param {Array} props.sections - The array of sections to display in the panel. Each section includes
 * a label, an optional classNames object for custom styling, and an array of tools.
 * @param {Object} [props.classNames] - An optional object of global classNames used for styling
 * components within the panel. These can be overridden on a per-section basis.
 *
 * @returns {ReactElement} A React element that renders the analysis panel with sections.
 */
const AnalysisCenterWithSections: React.FC<
  AnalysisCenterWithSectionsConfiguration
> = ({ sections, classNames }): ReactElement => {
  const rootClassNamesDefaults = {
    title: 'font-header font-bold text-2xl uppercase mt-2',
    divider: 'text-accent w-[70px] border-accent mb-4',
  };
  const mergedGlobalClassnames = mergeDefaultTailwindClassnames(
    rootClassNamesDefaults,
    classNames ?? {},
  );

  const [activeAnalysisCard, setActiveAnalysisCard] = useState<string | null>(
    null,
  );

  const sectionPanels = useMemo(
    () =>
      sections.map((section, section_idx) => {
        const sectionClassnames = mergeDefaultTailwindClassnames(
          mergedGlobalClassnames,
          section.classNames ?? {},
        );

        return (
          <Stack key={section.label} gap="xs">
            <Text
              color="primary.4"
              classNames={{ root: sectionClassnames['title'] }}
            >
              {section.label}
            </Text>
            <Divider
              size="lg"
              classNames={{ root: sectionClassnames['divider'] }}
            />
            <div className={`grid sm:grid-cols-2 ${section.core ? 'md:grid-cols-3' : 'md:grid-cols-4 lg:grid-cols-5'} gap-4 items-stretch`}>
              {section.tools.map((tool, idx) => {
                if (section.core) {
                  return <AnaylsisCardCore {...tool} />
                } else {
                  return (
                    <div key={tool.title}>
                      <AnalysisCardCollapsible
                        {...tool}
                        descriptionVisible={activeAnalysisCard === `${section_idx}-${idx}`}
                        setDescriptionVisible={() =>
                          setActiveAnalysisCard(
                            `${section_idx}-${idx}` === activeAnalysisCard ? null : `${section_idx}-${idx}`,
                          )
                        }
                        useCountHook={() => ({ data: 1000, isFetching: false, isSuccess: true })}
                      />
                    </div>
                  );
                }
              })}
            </div>
          </Stack>
        );
      }),
    [sections, activeAnalysisCard],
  );

  return <Stack gap="xl">{sectionPanels}</Stack>;
};
export default AnalysisCenterWithSections;

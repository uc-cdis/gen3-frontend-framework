import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import FormattedParagraph from './FormatedParagraph';
import type { JSONValue } from '@gen3/core';

const meta = {
  component: FormattedParagraph as any, // signature: (fieldValue: JSONValue, fieldLabel?: string) => ReactElement
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    deepControls: { enabled: true },
  },
  argTypes: {
    fieldValue: { control: 'text' },
    fieldLabel: { control: 'text' },
  },
} satisfies Meta<typeof FormattedParagraph>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: { fieldValue: JSONValue; fieldLabel?: string }) =>
  FormattedParagraph(args.fieldValue, args.fieldLabel);

export const Default: Story = {
  render,
  args: {
    fieldValue:
      'The Family Heart Study (FamHS) was funded by the National Heart, Lung, and Blood Institute (NHLBI). It was begun in 1992 with the ascertainment of 1,200 families, half randomly sampled, and half selected because of an excess of coronary heart disease (CHD) or risk factor abnormalities as compared with age- and sex-specific population rates (Higgins et al. 1996). The families, with approximately 6,000 individuals, were sampled on the basis of information on probands from four population-based parent studies: the Framingham Heart Study, the Utah Family Tree Study, and two Atherosclerosis Risk in Communities (ARIC) centers (Minneapolis, and Forsyth County, NC). A broad range of phenotypes were assessed at a clinic examination in broad domains of CHD, atherosclerosis, cardiac and vascular function, inflammation and hemostasis, lipids and lipoproteins, blood pressure, diabetes and insulin resistance, pulmonary function, and anthropometry (FamHS Visit 1). Approximately 8 years later, study participants belonging to the largest pedigrees were invited for a second clinical exam (FamHS Visit 2). A total of 2,756 Caucasian subjects in 508 extended families were examined. A two-phase design was adopted for the genome wide association (GWA) study. In phase-1, 1007 subjects were chosen, equally distributed between the upper and lower quartile of age- and sex-adjusted values for coronary artery calcification, assessed by CT scan in Visit 2. These subjects were chosen to be largely unrelated; 34% of the subjects were from unique families, while 200 other subjects had 1 or more siblings selected into the sample, yielding a sample of 465 unrelated subjects. The remaining family members (N=1749) were genotyped in the phase-2 for replication of the top hits from the phase-1. The results presented here represent those for the analysis of the phase-1 case-control sample for variables assessed in FamHS Visit 1 (from 1992 to 1995) and for the variables assessed in FamHS Visit 2 (from 2002 to 2003). All subjects were typed on the Illumina HumMap 550 chip (Phase 1 genotype). Of these, 33 (3.3%) were excluded due to technical errors, call rates below 98%, and discrepancies between reported sex and sex-diagnostic markers. The final sample of 974 subjects have Visit 2 phenotypes, approximately 100 of these do not have Visit 1 phenotypes. There was no significant plate-to-plate variation in allele frequencies. The covariate adjustments were performed separately by sex using cubic polynomial age and clinical centers, and retaining the terms in the stepwise regression analysis that were significant at the 5% level. Extreme outliers (>4 SD from the mean) were set aside, temporarily, for the adjustments. The final phenotypes were computed for all individuals using the best mean regression models and standardizing to 0 mean and unit variance. The FamHS has contributed GWA results in many phenotype domains (antropometric and adiposity, atherosclerosis and coronary heart disease, lipid profile, diabetes and glicemic traits, metabolic syndrome etc) to meta-analyses and various consortia, including Heard-Costa et al. 2009, Köttgen et al. 2010, Teslovich et al. 2010, Nettleton et al. 2010, Lango et al. 2010, Heid et al. 2010, Speliotes et al. 2010, Dupuis et al. 2010, Kraja et al. 2011.   Study Weblinks:   The NHLBI Family Heart Study FHS SCAN    Study Design:       Prospective Longitudinal Cohort    Study Type:  Family Longitudinal   NOTE: This text was scraped from https://www.ncbi.nlm.nih.gov/ on 2026-01-09 and may not include exact formatting or images.',
    fieldLabel: 'Summary',
  } as unknown as never,
};

export const NoFieldLabel: Story = {
  render,
  args: {
    fieldValue: 'Paragraph without a label should render just the text.',
    fieldLabel: '',
  } as unknown as never,
};

export const EmptyFieldValue: Story = {
  render,
  args: {
    fieldValue: '',
    fieldLabel: 'Empty',
  } as unknown as never,
};

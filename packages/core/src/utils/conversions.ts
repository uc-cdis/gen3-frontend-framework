import { HistogramData, HistogramDataAsStringKey } from '../types';

export const DAYS_IN_YEAR = 365.25;

/**
 * Converts HistogramData to HistogramDataAsStringKey by ensuring the key is a string.
 * If the key is already a string, it's used as is.
 * If the key is a number tuple [min, max], it's converted to a string in the format "min-max".
 *
 * @param data The HistogramData object to convert
 * @returns HistogramDataAsStringKey with the converted key
 */
export const convertToHistogramDataAsStringKey = (
  data: HistogramData,
): HistogramDataAsStringKey => {
  return {
    key:
      typeof data.key === 'string' ? data.key : `${data.key[0]}-${data.key[1]}`,
    count: data.count,
  };
};

export const calculatePercentageAsNumber = (
  count: number,
  total: number,
): number => (count ? (count / total) * 100 : 0);

export const calculatePercentageAsString = (
  count: number,
  total: number,
): string => `${((count / total) * 100).toFixed(2)}%`;

export const capitalize = (original: string): string => {
  const customCapitalizations: Record<string, string> = {
    id: 'ID',
    uuid: 'UUID',
    dna: 'DNA',
    dbsnp: 'dbSNP',
    cosmic: 'COSMIC',
    civic: 'CIViC',
    dbgap: 'dbGaP',
    ecog: 'ECOG',
    bmi: 'BMI',
    gdc: 'GDC',
    cnv: 'CNV',
    ssm: 'SSM',
    aa: 'AA',
  };

  return original
    .split(' ')
    .map(
      (word) =>
        customCapitalizations[word.toLowerCase()] ||
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(' ');
};

interface HumanifyParams {
  term: string;
  capitalize?: boolean;
  facetTerm?: boolean;
}
export const humanify = ({
  term = '',
  capitalize: cap = true,
  facetTerm = false,
}: HumanifyParams): string => {
  let original;
  let humanified;
  if (facetTerm) {
    // Splits on capital letters followed by lowercase letters to find
    // words squished together in a string.
    original = term?.split(/(?=[A-Z][a-z])/).join(' ');
    humanified = term?.replace(/\./g, ' ').replace(/_/g, ' ').trim();
  } else {
    const split = (original || term)?.split('.');
    humanified = split[split.length - 1]?.replace(/_/g, ' ').trim();

    // Special case 'name' to include any parent nested for sake of
    // specificity in the UI
    if (humanified === 'name' && split?.length > 1) {
      humanified = `${split[split?.length - 2]} ${humanified}`;
    }
  }
  return cap ? capitalize(humanified) : humanified;
};

/*https://github.com/NCI-GDC/portal-ui/blob/develop/src/packages/%40ncigdc/utils/ageDisplay.js*/
/**
 * Converts age in days into a human-readable format.
 *
 * @param ageInDays - The age in days.
 * @param yearsOnly - If true, only display years.
 *   @defaultValue false
 * @param defaultValue - The default value to return if ageInDays is falsy.
 *   @defaultValue "--"
 * @returns The formatted age string.
 */
export const ageDisplay = (
  ageInDays: number,
  yearsOnly: boolean = false,
  defaultValue: string = '--',
): string => {
  if (ageInDays !== 0 && !ageInDays) {
    return defaultValue;
  }
  const calculateYearsAndDays = (
    years: number,
    days: number,
  ): [number, number] => (days === 365 ? [years + 1, 0] : [years, days]);

  const ABS_AGE_DAYS = Math.abs(ageInDays);

  const [years, remainingDays] = calculateYearsAndDays(
    Math.floor(ABS_AGE_DAYS / DAYS_IN_YEAR),
    Math.ceil(ABS_AGE_DAYS % DAYS_IN_YEAR),
  );

  const formattedYears =
    years === 0 ? '' : `${years} ${years === 1 ? 'year' : 'years'}`;

  const formattedDays =
    !yearsOnly && remainingDays > 0
      ? `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`
      : years === 0 && remainingDays === 0
        ? '0 days'
        : '';

  const ageString = [formattedYears, formattedDays].filter(Boolean).join(' ');

  return ageInDays >= 0 ? ageString : `-${ageString}`;
};

/**
 * Given an object of JSON, stringify it into a string.
 * @param obj - the object to stringify
 * @param defaults - the default value to return if the object is undefined
 * @category Utility
 */

export const stringifyJSONParam = (
  obj?: Record<string, any>,
  defaults = '{}',
): string => (obj ? JSON.stringify(obj) : defaults);

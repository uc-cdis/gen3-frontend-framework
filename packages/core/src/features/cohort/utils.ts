import { type CohortId, StorageEntity } from './types';

export const defaultCohortNameGenerator = (): string =>
  `Custom cohort ${new Date()
    .toLocaleString('en-CA', {
      timeZone: 'America/Chicago',
      hour12: false,
    })
    .replace(',', '')}`;

export const isNameUnique = <T extends CohortId = CohortId>(
  entities: Array<StorageEntity<T>>,
  name: string,
  excludeId?: T,
): boolean => {
  const trimmedName = name.trim();
  if (!trimmedName) return false;

  return !entities.some(
    (cohort) =>
      cohort &&
      cohort.id !== excludeId &&
      cohort.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );
};

export const generateUniqueName = <T extends CohortId = CohortId>(
  entities: Array<StorageEntity<T>>,
  baseName: string,
): string => {
  const trimmedBaseName = baseName.trim();

  // If base name is unique, use it
  if (isNameUnique(entities, trimmedBaseName)) {
    return trimmedBaseName;
  }

  // Find a unique name by appending numbers
  let counter = 1;
  let uniqueName: string;

  do {
    uniqueName = `${trimmedBaseName} (${counter})`;
    counter++;
  } while (!isNameUnique(entities, uniqueName));

  return uniqueName;
};

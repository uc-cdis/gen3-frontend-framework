export const getClinicalTrialMetadata = async (
  clinicalTrialFields: string[],
  ctID: string,
): Promise<object> => {
  const errMsg = 'Unable to fetch study metadata from ClinicalTrials.gov';
  try {
    const resp = await fetch(
      `https://clinicaltrials.gov/api/v2/studies/${ctID}?fields=${clinicalTrialFields.join('|')}`,
    );
    if (!resp.ok) {
      throw new Error('Unable to verify ClinicalTrials.gov ID');
    }

    return await resp.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(errMsg);
  }
};

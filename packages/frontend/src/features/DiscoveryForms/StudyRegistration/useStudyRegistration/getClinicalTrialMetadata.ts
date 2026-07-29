export const getClinicalTrialMetadata = async (
  clinicalTrialFields: string[],
  ctID: string,
): Promise<object> => {
  const errMsg = 'Unable to fetch study metadata from ClinicalTrials.gov';
  const clinicalTrialFieldsToFetch = clinicalTrialFields || [];
  // get metadata from the clinicaltrials.gov API
  const resp = await fetch(
    `https://clinicaltrials.gov/api/v2/studies/${ctID}?fields=${clinicalTrialFieldsToFetch.join('|')}`,
  );
  if (!resp || resp.status !== 200) {
    return Promise.reject('Unable to verify ClinicalTrials.gov ID');
  }
  try {
    const respJson = await resp.json();
    return respJson;
  } catch {
    throw errMsg;
  }
};

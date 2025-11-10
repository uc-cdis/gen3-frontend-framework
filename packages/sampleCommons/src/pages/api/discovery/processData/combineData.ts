import _ from 'lodash';

const STUDY_DATA_FIELD = 'gen3_discovery';

// Note: this should be updated to come from the config
const studyRegistrationConfig = {
  variableMetadataField: 'variable_level_metadata',
};

// Note: this should be updated to come from the config
const discoveryConfig = { tagCategories: [{ name: '' }] };

const processMDSMetadataData = (jsonResponse) => {
  let allStudies = [];
  const studies = Object.values(jsonResponse).map((entry) => {
    const study = { ...entry[STUDY_DATA_FIELD] };
    // copy VLMD info if exists
    if (
      studyRegistrationConfig?.variableMetadataField &&
      entry[studyRegistrationConfig.variableMetadataField]
    ) {
      study[studyRegistrationConfig.variableMetadataField] =
        entry[studyRegistrationConfig.variableMetadataField];
    }
    return study;
  });
  allStudies = allStudies.concat(studies);
  return allStudies;
};

const processMDSAggregateData = (metadataResponse) => {
  const getUniqueTags = (tags) =>
    tags.filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.name?.length > 0 &&
            t.category === v.category &&
            t.name === v.name,
        ) === i,
    );
  const commons = Object.keys(metadataResponse);
  let allStudies = [];

  commons.forEach((commonsName) => {
    const studies = metadataResponse[commonsName];
    const editedStudies = studies.map((entry, index) => {
      const keys = Object.keys(entry);
      const studyId = keys[0];
      const entryUnpacked = entry[studyId].gen3_discovery;
      entryUnpacked.study_id = studyId;
      entryUnpacked.commons = commonsName;
      entryUnpacked.frontend_uid = `${commonsName}_${index}`;
      entryUnpacked.tags = entryUnpacked.tags || [];
      entryUnpacked.tags.push(
        Object({ category: 'Commons', name: commonsName }),
      );

      // If the discoveryConfig has a tag with the same name as one of the fields on an entry,
      // add the value of that field as a tag.

      discoveryConfig?.tagCategories.forEach((tag) => {
        if (tag.name in entryUnpacked) {
          if (typeof entryUnpacked[tag.name] === 'string') {
            const tagValue = entryUnpacked[tag.name];
            entryUnpacked.tags.push(
              Object({ category: tag.name, name: tagValue }),
            );
          } else if (Array.isArray(entryUnpacked[tag.name])) {
            entryUnpacked.tags = entryUnpacked.tags.concat(
              entryUnpacked[tag.name].map((name) => ({
                category: tag.name,
                name,
              })),
            );
          }
        }
      });
      entryUnpacked.tags = [...getUniqueTags(entryUnpacked.tags).entries()].map(
        (e) => e[1],
      );

      // copy VLMD info if exists
      if (
        studyRegistrationConfig?.variableMetadataField &&
        entry[studyId][studyRegistrationConfig.variableMetadataField]
      ) {
        entryUnpacked[studyRegistrationConfig.variableMetadataField] =
          entry[studyId][studyRegistrationConfig.variableMetadataField];
      }
      return entryUnpacked;
    });
    allStudies = allStudies.concat(editedStudies);
  });
  return allStudies;
};

const combineData = (mdsAggregateData, mdsMetadataData) => {
  const processedAggregateData = processMDSAggregateData(mdsAggregateData);
  const processedMetadataData = processMDSMetadataData(mdsMetadataData);
  const result = _.union(processedMetadataData, processedAggregateData);
  return result;
};

export default combineData;

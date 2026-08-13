import React, { createContext } from 'react';
import { JSONObject } from '@gen3/core';

interface StudyProviderValue {
  setStudyDetails: React.Dispatch<React.SetStateAction<JSONObject>>;
  studyDetails: StudyDetails;
}
interface StudyDetails {
  study_metadata?: {
    minimal_info?: {
      study_name?: string;
    };
  };
  [key: string]: any;
}

const StudyContext = createContext<StudyProviderValue>({
  setStudyDetails: () => null,
  studyDetails: {},
});

const useStudyContext = () => {
  const context = React.useContext(StudyContext);
  if (context === undefined) {
    throw Error('Study must be used must be used inside of a StudyContext');
  }
  return context;
};

const StudyProvider = ({ children }: { children: React.ReactNode }) => {
  const [studyDetails, setStudyDetails] = React.useState<JSONObject>({});

  return (
    <StudyContext.Provider
      value={{
        setStudyDetails,
        studyDetails,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export { useStudyContext, StudyProvider as default };

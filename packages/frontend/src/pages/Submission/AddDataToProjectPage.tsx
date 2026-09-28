import React from "react";
import { NavPageLayout } from "../../features/Navigation"
import AddDataToProject from "../../features/Submission/AddDataToProject";
import { SubmissionsPageLayoutProps } from "./types"

const AddDataToProjectPage = ({ footerProps, headerProps, dictionaryConfig } : SubmissionsPageLayoutProps) => {
   return (
    <NavPageLayout
       footerProps={footerProps}
       headerProps={headerProps}
       headerMetadata={{
         title: 'Gen3 Submission Add to Project Page',
         content: 'Submission Add to Project page',
         key: 'gen3-submission-add-to-project-page',
       }}
     >
       <AddDataToProject config={dictionaryConfig} />
     </NavPageLayout>
   );
}

export default AddDataToProjectPage;

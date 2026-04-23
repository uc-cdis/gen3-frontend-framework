import { NavPageLayout } from "../../features/Navigation"
import AddDataToProject from "../../features/Submission/AddDataToProject";
import { SubmissionsPageLayoutProps } from "./types"

const AddDataToProjectPage = ({ footerProps, headerProps, dictionaryConfig } : SubmissionsPageLayoutProps) => {
   return (
    <NavPageLayout
       footerProps={footerProps}
       headerProps={headerProps}
       headerMetadata={{
         title: 'Gen3 Submission Page',
         content: 'Submission page',
         key: 'gen3-submission-page',
       }}
     >
       <AddDataToProject config={dictionaryConfig} />
     </NavPageLayout>
   );
}

export default AddDataToProjectPage;

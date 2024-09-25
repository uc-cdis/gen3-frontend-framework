import React from 'react';
import AdminPanel from './AdminPanel';
import AddDataPanel from './statistics/AddDataPanel';

const SiteAdministration = () => {
  return (
    <AdminPanel
      subPanels={[
        {
          label: 'Statistics Data',
          content: <AddDataPanel />,
        },
      ]}
    />
  );
};

export default SiteAdministration;

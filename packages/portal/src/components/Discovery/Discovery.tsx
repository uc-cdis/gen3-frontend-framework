import { useState } from "react";
import TagCloud from "./TagCloud";
import DiscoveryTable from "./DiscoveryTable";
import { Badge, Stack, Divider, Button, LoadingOverlay } from "@mantine/core";
import SimpleTable, { StyledColumn } from "../Tables/SimpleTable";

import {
  useGetMetadataQuery
} from "@gen3/core"
import React from "react";



const Discovery:React.FC<undefined> = () => {

  const [ offset, setOffset ] = useState(0);
  const [ pageSize, setPageSize ]= useState(10);
  const { data, isSuccess } = useGetMetadataQuery({limit: pageSize*10, offset: offset });
  const TableHeaderStyle = "font-montserrat text-slate-200 text-md font-medium text-center bg-gen3-silver";
  const columns=
    [
      { accessor: 'project_title', Header: 'PROJECT TITLE', className: `${TableHeaderStyle}`},
      { accessor: 'project_number', Header: 'PROJECT NUMBER', className: `${TableHeaderStyle}`},
      { accessor: 'location', Header: 'LOCATION', className: `${TableHeaderStyle}`},
      {
        accessor: 'tags',
        Header: 'STUDY CHARACTERISTICS',
        className: `${TableHeaderStyle}`,
        Cell: (params ) => (
          params.value.filter((x) => x.name.split(" ").length < 3).slice(0,4).map((x, idx) => {

          return (
          <Badge key={`${x.name}-${idx}`} variant="filled"
                  classNames={{
                    filled:"hover:bg-gen3-smoke bg-gen3-teal",
                    inner: "text-gen3-coal"
                  }}
          >{x.name}</Badge>
        )}))
      },
    ];

  console.log(data);
  const tableData = data ? data["HEAL"].map((entry, index) => {
      const keys = Object.keys(entry);
      const studyId = keys[0];

      const entryUnpacked = entry[studyId].gen3_discovery;
      return { ...entryUnpacked };
    }) : [];

  return (
    <div className="flex flex-col">
      <LoadingOverlay visible={!isSuccess}/>

      <div className="flex-row"><TagCloud /></div>
      <SimpleTable columns={columns} data={tableData} itemsPerPage={pageSize} />
    </div>
  )
}

export default Discovery;

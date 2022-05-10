import { Card, Group, TextInput, Button, Paper} from "@mantine/core";
import * as React from "react";
import { MdSearch as SearchIcon} from "react-icons/md";


const DiscoveryStats:React.FC<undefined> = () => {

  return (
    <Paper className="my-3 mt-8 p-4" shadow="md">
      <div className="flex flex-row items-center">
        <div className="relative flex items-center text-gray-400 focus-within:text-gray-600">
          <div className="w-5 h-5 absolute ml-3 pointer-events-none" >
          <SearchIcon />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search studies by keyword"
            autoComplete="off"
            aria-label="Search studies by keyword"
            className="w-96 pr-3 pl-10 py-2 font-semibold placeholder-gray-500 text-black rounded-2xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
          />
        </div>
      </div>
    </Paper>
  )

}

export default DiscoveryStats;

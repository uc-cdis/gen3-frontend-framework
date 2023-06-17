import React from "react";
import { Badge } from "@mantine/core";
import { useGetTagsQuery } from "@gen3/core";

interface TagCloudProps {
  tagSelector?: (_: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = () => {
  const { isLoading } = useGetTagsQuery("");

  if (isLoading) {
    return <div>Is Loading</div>;
  }
  return (
    <div>
      <Badge>Coming Soon</Badge>
    </div>
  );
};

export default TagCloud;

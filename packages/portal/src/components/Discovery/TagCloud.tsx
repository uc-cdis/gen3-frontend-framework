import { Badge, LoadingOverlay } from "@mantine/core";
import { useGetTagsQuery} from "@gen3/core";

interface TagCloudProps {
  tagSelector?: (_:string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tagSelector = () => null} : TagCloudProps) => {

  const { data, isLoading } = useGetTagsQuery("")

  console.log(data);
  if (isLoading) {
    return <div>Is Loading</div>
  }
  return (
    <div>

      { data?.map((x) => <Badge key={`tag-${x}`}>{x}</Badge>) }
    </div>
  )
}

export default TagCloud;

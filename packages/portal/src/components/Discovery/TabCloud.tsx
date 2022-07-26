import { Badge } from '@mantine/core';
import { useGetTagsQuery} from '@gen3/core';

interface TagCloudProps {
  tagSelector?: (_:string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tagSelector = () => null} : TagCloudProps) => {

  const { data, isLoading } = useGetTagsQuery('');

  console.log(data);
  if (isLoading) {
    return <div>Is Loading</div>;
  }
  return (
    <div>
      Coming Soon
    </div>
  );
};

export default TagCloud;

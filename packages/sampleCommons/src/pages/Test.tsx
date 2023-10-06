import { useGetJobListQuery } from '@gen3/core/';

const TestPage = () => {


  const status = useGetJobListQuery();
  console.log('status', status  );
  return (
    <div>
      <h1>Test Page</h1>
    </div>
  );
};

export default TestPage;

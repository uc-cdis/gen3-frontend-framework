const HighlightSearchTerm = (value: string, searchTerm: string) => {
  console.log('value', value);
  const matchIndex =
    typeof value === 'string'
      ? value.toLowerCase().indexOf(searchTerm.toLowerCase())
      : -1;
  const noMatchFound = matchIndex === -1;
  if (noMatchFound) {
    return <>{value}</>;
  }
  const prev = value.slice(0, matchIndex);
  const matched = value.slice(matchIndex, matchIndex + searchTerm.length);
  const after = value.slice(matchIndex + searchTerm.length);
  return (
    <>
      {prev}
      <span className="text-green-500 text-4xl">{matched}</span>
      {after}
    </>
  );
};

export default HighlightSearchTerm;

const HighlightSearchTerm = (
  value: string | string[] | undefined,
  searchTerm: string,
) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value = value.join('').replace(/  +/g, ' ');
  }
  console.log('value', value);

  const matchIndex =
    typeof value === 'string'
      ? value.toLowerCase().indexOf(searchTerm.toLowerCase())
      : -1;
  const noMatchFound = matchIndex === -1;
  if (noMatchFound) {
    console.log('noMatchFound for value', value);
    return <>{value}</>;
  }
  const prev = value.slice(0, matchIndex);
  const matched = value.slice(matchIndex, matchIndex + searchTerm.length);
  const after = value.slice(matchIndex + searchTerm.length);
  return (
    <>
      {prev}
      <span className="font-bold underline">{matched}</span>
      {after}
    </>
  );
};

export default HighlightSearchTerm;

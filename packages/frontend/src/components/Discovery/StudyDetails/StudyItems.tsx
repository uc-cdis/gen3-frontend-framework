
const formatResourceValuesWhenNestedArray = (resourceFieldValue: string[]) : string | string[] => {
  if (
    Array.isArray(resourceFieldValue)
    && Array.isArray(resourceFieldValue[0])
  ) {
    return resourceFieldValue[0].join(', ');
  }
  return resourceFieldValue;
};

const blockTextField = (text: string) => <div {...fieldCls}>{text}</div>;
const label = (text: string) => <b {...labelCls}>{text}</b>;
const textField = (text: string) => <span>{text}</span>;
const linkField = (text: string) => <a href={text} target="_blank" rel="noreferrer">{text}</a>;

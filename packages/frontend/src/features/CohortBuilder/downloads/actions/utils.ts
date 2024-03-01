export const handleDownload = (data: Blob, filename: string) => {
  const aElement = document.createElement('a');
  const href = URL.createObjectURL(data);
  aElement.setAttribute('download', filename);
  aElement.href = href;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(href);
};

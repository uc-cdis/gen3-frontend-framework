import { ServiceAndMethod } from "@gen3/core";

export const convertToRecordMethodToResource = (entries: ServiceAndMethod[], filters: string[]) => {
  return entries.reduce(
    (acc: Record<string, string[]>, entry: ServiceAndMethod) => {
      if (filters.length > 0 && !filters.includes(entry.service)) return acc;
      if (!(entry.method in acc)) {
        acc[entry.method] = [entry.service];
      } else acc[entry.method].push(entry.service);
      return acc;
    },
    {} as Record<string, string[]>
  );
};

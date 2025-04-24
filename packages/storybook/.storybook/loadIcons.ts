import { type RegisteredIcons } from '@gen3/frontend';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const gen3Icons: RegisteredIcons = require(
  `../../sampleCommons/config/icons/gen3.json`,
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorIcons: RegisteredIcons = require(
  `../../sampleCommons/config/icons/color.json`,
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dictionaryIcons: RegisteredIcons = require(
  `../../sampleCommons/config/icons/dataDictionary.json`,
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const workspaceIcons: RegisteredIcons = require(
  `../../sampleCommons/config/icons/workspace.json`,
);

const icons: RegisteredIcons[] = [
  gen3Icons,
  colorIcons,
  dictionaryIcons,
  workspaceIcons,
];

export default icons;

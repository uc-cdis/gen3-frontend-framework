import { RendererFunction } from '../../utils/RendererFactory';
import { MRT_Row } from 'mantine-react-table';

export interface DetailsPanelComponentProps extends Record<string, unknown> {
  id?: string;
  onClose?: (id?: string) => void;
  row?: MRT_Row<Record<string, any>>;
}

export type DetailsRendererFunction =
  RendererFunction<DetailsPanelComponentProps>;

/**
 * Represents the properties of the DetailsComponent.
 */
export interface DetailsComponentProps<
  T extends DetailsPanelComponentProps = DetailsPanelComponentProps,
> {
  id?: string; // id passed to modal and panel
  row?: MRT_Row<Record<string, any>>;
  onClose?: (id?: string) => void; // function called when modal/drawer is closed
  panel: RendererFunction<T>; // Panel Component
  panelProps: T; // and properties passed to the Panel Component
  classNames?: Record<string, string>; // className to set styles for the modal/drawer all entries must be prefixed with !
  title?: string; // title of the modal/drawer
  withCloseButton?: boolean; // Should modal have a close (i.e. x ) button
  closeOnEscape?: boolean; // if true, closed when the esc key is pressed
  closeOnClickOutside?: boolean; // close when anywhere outside the modal is closed
  size?: string; // size of the modal
}

import { RendererFunction } from '../../utils/RendererFactory';

export interface DetailsPanelComponentProps extends Record<string, unknown> {
  id?: string;
  onClose?: (id?: string) => void;
}

export type DetailsRendererFunction =
  RendererFunction<DetailsPanelComponentProps>;

export interface DetailsComponentProps<
  T extends DetailsPanelComponentProps = DetailsPanelComponentProps,
> {
  id?: string;
  onClose?: (id?: string) => void;
  panel: RendererFunction<T>;
  panelProps: T;
  classNames?: Record<string, string>;
  title?: string;
  withCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  size?: string;
}


interface TexturedSidePanelProps {
  readonly url?: string;
}
const TexturedSidePanel = ({ url }: TexturedSidePanelProps) => {

  return (
    <div
      aria-label={'background image'}
      style={{ backgroundImage: `url(${url})` }}
      className="flex h-screen w-full bg-left bg-repeat-y last:-scale-x-100"
    ></div>
  );
};

export default TexturedSidePanel;

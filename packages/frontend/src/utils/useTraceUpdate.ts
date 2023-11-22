import { useRef, useEffect } from 'react';

/**
 * Debugging utility hook for figuring out why a component or hook is rendering/changing. Prints
 * out the properties that changed. Credit: https://stackoverflow.com/a/51082563
 * @param props
 *
 * @example
 * const MyComponent = (props: Props) => {
 *  useTraceUpdate(props);
 *  return <div>{props.foo}</div>;
 *  };
 */
const useTraceUpdate = (props: any) : void => {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {} as Record<string, any>);
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
};

export default useTraceUpdate;

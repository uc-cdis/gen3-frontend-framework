type PropsAreEqual<P> = (
    prevProps: Readonly<P>,
    nextProps: Readonly<P>
) => boolean;

const withSampleHoC = <P extends {}>(
    component: {
        (props: P): Exclude<React.ReactNode, undefined>;
        displayName?: string;
    },
    propsAreEqual?: PropsAreEqual<P> | false,

    componentName = component.displayName ?? component.name
): {
    (props: P): JSX.Element;
    displayName: string;
} => {

    function WithSampleHoc(props: P) {
        //Do something special to justify the HoC.
        return component(props) as JSX.Element;
    }

    WithSampleHoc.displayName = `withSampleHoC(${componentName})`;

    let wrappedComponent = propsAreEqual === false ? WithSampleHoc : React.memo(WithSampleHoc, propsAreEqual);

    //copyStaticProperties(component, wrappedComponent);

    return wrappedComponent as typeof WithSampleHoc
};

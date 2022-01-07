interface IconComponentProps {
    readonly iconName:string;
    readonly dictIcons: Record<any, any>;
    readonly height?: string;
    readonly svgStyles?: Record<any, any>
}

const IconComponent = ({dictIcons, iconName, height = "27px", svgStyles = {} }: IconComponentProps) => (
     dictIcons[iconName](height, svgStyles)
);


export default IconComponent;

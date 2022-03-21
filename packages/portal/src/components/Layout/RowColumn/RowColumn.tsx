import React, { PropsWithChildren } from "react";
import { DefaultProps, MantineNumberSize, useMantineDefaultProps } from '@mantine/styles';
import { Group } from "@mantine/core";

/**
 * Return an array with the separator React element interspersed between
 * each React node of the input children.
 *
 * > joinChildren([1,2,3], 0)
 * [1,0,2,0,3]
 */
const joinChildren = (children, separator): JSXElement  => {
    const childrenArray = React.Children.toArray(children).filter(Boolean);

    return childrenArray.reduce((output, child, index)  => {
        output.push(child);

        if (index < childrenArray.length - 1) {
            output.push(React.cloneElement(separator, { key: `separator-${index}` }));
        }

        return output;
    }, []);
}


export interface RowColumnProps {
    readonly direction: "row" | "column"
    readonly spacing: number;
    readonly className: string;
}

export const RowColumn : React.FC<RowColumnProps> = ( { className,  children, direction = "column", spacing = 2, ...other } : PropsWithChildren<RowColumnProps>) => {

    if (typeof children === 'function') {
        return children({ className, ...other });
    }

    return (
        <Group className={className} direction={direction} {...other} >
            { typeof children === 'function' ? children({ className, ...other }) : children }
        </Group>
    )
}

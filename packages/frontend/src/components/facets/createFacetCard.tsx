import React from 'react';
import {FacetRequiredHooks} from './types';
import EnumFacet from './EnumFacet';
import RangeFacet from './RangeFacet';
import {FacetDefinition} from '@gen3/core';

export const createFacetCard = (
    facetDefinition: FacetDefinition,
    valueLabel: string,
    dataFunctions: FacetRequiredHooks,
    idPrefix: string,
    dismissCallback: (_arg0:string) => void = () => null,
    hideIfEmpty = false,
    collapse: boolean,
    facetName?: string,
    width?: string,
): React.ReactNode => {

    const {field, type, description} = facetDefinition;
    return (
        <div key={`${idPrefix}-enum-${field}`}>
            {
                {
                    enum:
                        (
                            <EnumFacet
                                key={`${idPrefix}-enum-${field}`}
                                valueLabel={valueLabel}
                                field={field}
                                facetName={facetName}
                                description={description}
                                hideIfEmpty={hideIfEmpty}
                                width={width}
                                dataHooks={dataFunctions}
                                showPercent={false}
                                collapse={collapse}
                            />
                        ),
                    range: (
                        <RangeFacet
                            key={`${idPrefix}-enum-${field}`}
                            valueLabel={valueLabel}
                            field={field}
                            facetName={facetName}
                            description={description}
                            hideIfEmpty={hideIfEmpty}
                            width={width}
                            dataHooks={dataFunctions}
                            minimum={facetDefinition.range?.minimum}
                            maximum={facetDefinition.range?.maximum}
                            collapse={collapse}
                        />
                    )
                }[type as string]
            }
        </div>);
};

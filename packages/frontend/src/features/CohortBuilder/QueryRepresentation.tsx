import React, { PropsWithChildren, ReactElement, useContext, useEffect } from 'react';
import { get } from 'lodash';
import {
  Equals,
  GreaterThan,
  GreaterThanOrEquals,
  handleOperation,
  Includes,
  Intersection,
  LessThan,
  LessThanOrEquals,
  NotEquals,
  Operation,
  OperationHandler,
  removeCohortFilter,
  Union,
  useCoreDispatch,
  fieldNameToTitle,
  useCoreSelector,
  selectCurrentCohortId,
  updateCohortFilter,
  Exists,
  Missing,
  ExcludeIfAny,
  Excludes,
  NestedFilter,
  CoreState
} from '@gen3/core';
import { ActionIcon, Badge, Divider, Group } from '@mantine/core';
import { isArray } from 'lodash';
import {
  MdClose as ClearIcon,
  MdOutlineArrowBack as LeftArrow,
  MdOutlineArrowForward as RightArrow,
} from 'react-icons/md';
import tw from 'tailwind-styled-components';
import OverflowTooltippedLabel from '../../components/OverflowTooltippedLabel';
import QueryRepresentationLabel from './QueryRepresentationLabel';
import { QueryExpressionsExpandedContext } from './QueryExpressionsExpandedContext';
import { buildNested } from '../../components/facets/utils';

const RemoveButton = ({ value }: { value: string }) => (
  <ActionIcon
    size="xs"
    color="white"
    radius="xl"
    variant="transparent"
    aria-label={`remove ${value}`}
  >
    <ClearIcon size={10} />
  </ActionIcon>
);
const QueryRepresentationText = tw.div`
flex truncate ... px-2 py-1 bg-base-max h-full
`;

const QueryFieldLabel = tw.div`
bg-accent-cool-content-lightest
text-base-darkest
uppercase
px-2
border-primary-darkest
border-r-[1.5px]
flex
items-center
`;

const QueryItemContainer = tw.div`
flex
flex-row
items-center
font-heading
shadow-md
font-medium
text-sm
border-[1.5px]
mr-1
mb-2
border-secondary-darkest
w-inherit
`;

const QueryContainer = tw.div`
flex
flex-row
items-stretch
h-full
bg-white
`;

type RangeOperation =
  | LessThan
  | LessThanOrEquals
  | GreaterThanOrEquals
  | GreaterThan;

type ValueOperation = RangeOperation | Equals | NotEquals;
type ComparisonOperation = RangeOperation | Equals | NotEquals;
export type SetOperation = Includes | Excludes | ExcludeIfAny;

export const isRangeOperation = (x?: Operation): x is RangeOperation => {
  return (
    x !== undefined &&
    'operator' in x &&
    ['>=', '>', '<', '<='].includes(x.operator)
  );
};

export const isValueOperation = (x: Operation): x is ValueOperation => {
  return 'field' in x;
};

export const isNestedFilter = (x: Operation): x is NestedFilter => {
  return 'path' in x;
};

interface IncludeExcludeQueryElementProps
  extends Pick<
    Includes | Excludes | ExcludeIfAny,
    'field' | 'operator' | 'operands'
  > {
  index: string;
  path?: string;
}

const IncludeExcludeQueryElement: React.FC<IncludeExcludeQueryElementProps> = ({
  index,
  field,
  path,
  operator,
  operands,
}: IncludeExcludeQueryElementProps) => {
  const dispatch = useCoreDispatch();
  const [queryExpressionsExpanded, setQueryExpressionsExpanded] = useContext(
    QueryExpressionsExpandedContext,
  );
  const currentCohortId = useCoreSelector((state:CoreState) =>
    selectCurrentCohortId(state),
  );

  useEffect(() => {
    if (get(queryExpressionsExpanded, field) === undefined) {
      setQueryExpressionsExpanded({
        type: 'expand',
        cohortId: currentCohortId,
        field,
      });
    }
  }, [
    field,
    currentCohortId,
    queryExpressionsExpanded,
    setQueryExpressionsExpanded,
  ]);

  const expanded = get(queryExpressionsExpanded, field, true);
  const fieldName = fieldNameToTitle(field);

  const operandsArray = isArray(operands) ? operands : [operands];
  return (
    <QueryContainer>
      <QueryFieldLabel>{fieldName}</QueryFieldLabel>
      <ActionIcon
        variant="transparent"
        size={'xs'}
        onClick={() => {
          setQueryExpressionsExpanded({
            type: expanded ? 'collapse' : 'expand',
            cohortId: currentCohortId,
            field,
          });
        }}
        className="ml-1 my-auto"
        aria-label={expanded ? `collapse ${fieldName}` : `expand ${fieldName}`}
        aria-expanded={expanded}
      >
        {expanded ? <LeftArrow /> : <RightArrow />}
      </ActionIcon>
      <Divider
        orientation="vertical"
        size="xs"
        className="m-1"
        color="base.2"
      />
      {!expanded ? (
        <b className="text-primary-darkest px-2 py-1 flex items-center">
          {operands.length}
        </b>
      ) : (
        <QueryRepresentationText>
          <Group spacing="xs">
            {operandsArray.map((x: string | number, i) => {
              const value = x.toString();
              return (
                <Badge
                  key={`query-rep-${field}-${value}-${i}`}
                  data-testid={`query-rep-${field}-${value}-${i}`}
                  variant="filled"
                  color="accent-cool"
                  size="md"
                  className="normal-case items-center max-w-[162px] cursor-pointer pl-1.5 pr-0"
                  rightSection={<RemoveButton value={value} />}
                  onClick={() => {
                    const newOperands = operandsArray.filter((o) => o !== x);

                    if (newOperands.length === 0) {
                      setQueryExpressionsExpanded({
                        type: 'clear',
                        cohortId: currentCohortId,
                        field: path ? [path, field].join('.') : field,
                      });
                      dispatch(
                        removeCohortFilter({
                          field: path ? [path, field].join('.') : field,
                          index: index,
                        }),
                      );
                    } else {
                      dispatch(
                        updateCohortFilter({
                          index,
                          field: path ? [path, field].join('.') : field,
                          filter: buildNested(
                            path ? [path, field].join('.') : field,
                            {
                              operator: operator,
                              field: field,
                              operands: newOperands,
                            },
                          ),
                        }),
                      );
                    }
                  }}
                >
                  <OverflowTooltippedLabel
                    label={value}
                    className="flex-grow text-md font-content-noto"
                  >
                    <QueryRepresentationLabel value={value.toString()} />
                  </OverflowTooltippedLabel>
                </Badge>
              );
            })}
          </Group>
        </QueryRepresentationText>
      )}
    </QueryContainer>
  );
};

interface ComparisonElementProps {
  readonly index: string;
  readonly filter: ValueOperation;
  readonly showLabel?: boolean;
}

const ComparisonElement = ({
  index,
  filter,
  showLabel = true,
}: ComparisonElementProps) => {
  const coreDispatch = useCoreDispatch();

  // fix the code below
  const handleKeepMember = (keep: ValueOperation) => {
    coreDispatch(
      updateCohortFilter({ field: keep.field, filter: keep, index: index }),
    );
  };

  return (
    <React.Fragment>
      {showLabel ? (
        <QueryFieldLabel>{fieldNameToTitle(filter.field)}</QueryFieldLabel>
      ) : null}
      <div className="flex flex-row items-center">
        <button
          className="h-[25px] w-[25px] mx-2 rounded-[50%] bg-accent-cool-content-lightest text-base pb-1"
          onClick={() => handleKeepMember(filter)}
        >
          {filter.operator}
        </button>
        <QueryRepresentationText>{filter.operand}</QueryRepresentationText>
      </div>
    </React.Fragment>
  );
};

const ExistsElement: React.FC<Exists | Missing> = ({
  field,
  operator,
}: Exists | Missing) => {
  return (
    <div className="flex flex-row items-center">
      {fieldNameToTitle(field)} is
      <span className="px-1 underline">{operator}</span>
    </div>
  );
};

interface ClosedRangeQueryElementProps {
  readonly index: string;
  readonly lower: ComparisonOperation;
  readonly upper: ComparisonOperation;
  readonly op?: 'and';
}

export const ClosedRangeQueryElement: React.FC<
  ClosedRangeQueryElementProps
> = ({
  index,
  lower,
  upper,
  op = 'and',
}: PropsWithChildren<ClosedRangeQueryElementProps>) => {
  const {field} = lower; // As this is a Range the field for both lower and upper will be the same

  return (
    <React.Fragment>
      <QueryElement field={field} index={index}>
        <QueryContainer>
          <ComparisonElement filter={lower} index={index} />
          <div className="flex items-center">
            <span className={'uppercase text-accent-contrast-max font-bold'}>
              {op}
            </span>
          </div>
          <ComparisonElement filter={upper} showLabel={false} index={index} />
        </QueryContainer>
      </QueryElement>
    </React.Fragment>
  );
};

interface QueryElementBaseProps {
  readonly index: string;
}

interface QueryElementProps {
  index: string;
  field: string;
  children?: React.ReactNode;
  path?: string;
}

export const QueryElement: React.FC<QueryElementProps> = ({
  index,
  field,
  path,
  children,
}: QueryElementProps) => {
  const coreDispatch = useCoreDispatch();
  const [, setQueryExpressionsExpanded] = useContext(
    QueryExpressionsExpandedContext,
  );
  const currentCohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
  );

  const handleRemoveFilter = () => {
    coreDispatch(
      removeCohortFilter({
        index: index,
        field: path ? [path, field].join('.') : field,
      }),
    );
    setQueryExpressionsExpanded({
      type: 'clear',
      cohortId: currentCohortId,
      field: path ? [path, field].join('.') : field,
    });
  };

  return (
    <QueryItemContainer>
      {children}
      {/* ---
        // TODO: enable facet dropdown
         <button onClick={handlePopupFacet}>
        <DropDownIcon size="1.5em" onClick={handlePopupFacet} />
      </button>
      -- */}
      <button
        className="bg-accent p-0 m-0 h-full round-r-lg text-white"
        onClick={handleRemoveFilter}
        aria-label={`remove ${fieldNameToTitle(field)}`}
      >
        <ClearIcon size="1.5em" className="px-1" />
      </button>
    </QueryItemContainer>
  );
};

/**
 *  Processes a Filter into a component representation
 */
class CohortFilterToComponent implements OperationHandler<ReactElement> {
  private readonly index: string;
  private readonly path?: string;

  constructor(index: string, path = '.') {
    this.index = index;
    this.path = path;
  }

  handleIncludes = (f: Includes) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <IncludeExcludeQueryElement {...f} index={this.index} path={this.path} />
    </QueryElement>
  );
  handleExcludes = (f: Excludes) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <IncludeExcludeQueryElement {...f} index={this.index} path={this.path} />
    </QueryElement>
  );
  handleEquals = (f: Equals) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ComparisonElement filter={f} index={this.index} />
    </QueryElement>
  );
  handleNotEquals = (f: NotEquals) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ComparisonElement filter={f} index={this.index} />
    </QueryElement>
  );
  handleLessThan = (f: LessThan) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ComparisonElement filter={f} index={this.index} />
    </QueryElement>
  );
  handleLessThanOrEquals = (f: LessThanOrEquals) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ComparisonElement filter={f} index={this.index} />
    </QueryElement>
  );
  handleGreaterThan = (f: GreaterThan) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ComparisonElement filter={f} index={this.index} />
    </QueryElement>
  );
  handleGreaterThanOrEquals = (f: GreaterThanOrEquals) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ComparisonElement filter={f} index={this.index} />
    </QueryElement>
  );
  handleExists = (f: Exists) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ExistsElement {...f} />
    </QueryElement>
  );
  handleMissing = (f: Missing) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <ExistsElement {...f} />
    </QueryElement>
  );
  handleExcludeIfAny = (f: ExcludeIfAny) => (
    <QueryElement key={f.field} {...f} index={this.index} path={this.path}>
      <IncludeExcludeQueryElement {...f} index={this.index} />
    </QueryElement>
  );

  handleIntersection = (f: Intersection) => {
    if (f.operands.length < 1) return null as unknown as ReactElement;

    // special case of ranges combined with AND
    if (
      f.operands.length == 2 &&
      isRangeOperation(f.operands[0]) &&
      isRangeOperation(f.operands[1])
    ) {
      return (
        <ClosedRangeQueryElement
          index={this.index}
          key={(f.operands[0] as ComparisonOperation).field}
          lower={f.operands[0] as ComparisonOperation}
          upper={f.operands[1] as ComparisonOperation}
        />
      );
    }
    // TODO: handle deeper nesting
    return null as unknown as ReactElement;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleUnion = (_f: Union) => {
    return <div>Union</div>;
  };
  handleNestedFilter = (op: NestedFilter) => {
    if (isNestedFilter(op.operand)) {
      const newOp = {
        ...op.operand,
        path: [op.path, op.operand.path].join('.'),
      } as NestedFilter;
      return convertFilterToComponent(
        newOp,
        this.index,
        [op.path, op.operand.path].join('.'),
      );
    } else {
      return convertFilterToComponent(op.operand, this.index, op.path);
    }
  };
}

export const convertFilterToComponent = (
  filter: Operation,
  index: string,
  path = '.',
): ReactElement => {
  const handler: OperationHandler<ReactElement> = new CohortFilterToComponent(
    index,
    path,
  );
  return handleOperation(handler, filter);
};

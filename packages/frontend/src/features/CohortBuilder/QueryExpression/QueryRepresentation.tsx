import React, { PropsWithChildren, ReactElement, useContext } from 'react';
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
  Union,
  fieldNameToTitle,
  Exists,
  Missing,
  ExcludeIfAny,
  Excludes,
  NestedFilter,
} from '@gen3/core';
import { ActionIcon, Badge, Divider, Group } from '@mantine/core';
import { isArray } from 'lodash';
import {
  MdClose as ClearIcon,
  MdOutlineArrowBack as LeftArrow,
  MdOutlineArrowForward as RightArrow,
} from 'react-icons/md';
import tw from 'tailwind-styled-components';
import OverflowTooltippedLabel from '../../../components/OverflowTooltippedLabel';
import QueryRepresentationLabel from './QueryRepresentationLabel';
import { QueryExpressionsExpandedContext } from './QueryExpressionsExpandedContext';
import { buildNested } from '../../../components/facets';
import { useDeepCompareEffect } from 'use-deep-compare';
import { QueryExpressionContext } from './QueryExpressionContext';

const RemoveButton = ({ value }: { value: string }) => (
  <ActionIcon
    size="xs"
    color="base.0"
    radius="xl"
    variant="transparent"
    aria-label={`remove ${value}`}
    pl={0}
    pr={0}
  >
    <ClearIcon size={12} aria-hidden="true" />
  </ActionIcon>
);
const QueryRepresentationText = tw.div`
flex truncate ... px-2 py-1 bg-base-max h-full
`;

const QueryFieldLabel = tw.div`
bg-accent-cool-lightest
text-base-darkest
uppercase
px-2 pl-1
border-primary-darkest
border-r-[1.5px]
flex
items-center
`;

const QueryItemContainer = tw.div`
flex
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
bg-base-max
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
  displayOnly?: boolean;
}

const IncludeExcludeQueryElement = ({
  index,
  field,
  path,
  operator,
  operands,
  displayOnly = false,
}: IncludeExcludeQueryElementProps) => {
  // const dispatch = useCoreDispatch();
  const [queryExpressionsExpanded, setQueryExpressionsExpanded] = useContext(
    QueryExpressionsExpandedContext,
  );
  const {
    cohortId: currentCohortId,
    useRemoveFilter,
    useUpdateFilters,
  } = useContext(QueryExpressionContext);

  const removeCohortFilter = useRemoveFilter();
  const updateCohortFilter = useUpdateFilters();
  useDeepCompareEffect(() => {
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
        color="accent"
        className="ml-1 my-auto hover:bg-accent-darker hover:bg-primary]"
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
          <Group gap="xs">
            {operandsArray.map((x: string | number, i) => {
              const value = x.toString();
              return (
                <Badge
                  key={`query-rep-${field}-${value}-${i}`}
                  data-testid={`query-rep-${field}-${value}-${i}`}
                  variant="filled"
                  color="accent.5"
                  size="md"
                  className={`normal-case items-center max-w-[162px] cursor-pointer hover:bg-accent-darker pl-2 ${displayOnly ? 'pr-3' : 'pr-0'}`}
                  rightSection={!displayOnly && <RemoveButton value={value} />}
                  onClick={() => {
                    if (displayOnly) return;
                    const newOperands = operandsArray.filter((o) => o !== x);
                    const fieldToUpdate =
                      path && path != '.' ? [path, field].join('.') : field;

                    if (newOperands.length === 0) {
                      setQueryExpressionsExpanded({
                        type: 'clear',
                        cohortId: currentCohortId,
                        field: fieldToUpdate,
                      });

                      removeCohortFilter(index, fieldToUpdate);
                    } else {
                      updateCohortFilter(
                        index,
                        fieldToUpdate,
                        buildNested(fieldToUpdate, {
                          operator: operator,
                          field: field,
                          operands: newOperands,
                        }),
                      );
                    }
                  }}
                >
                  <OverflowTooltippedLabel
                    label={value}
                    className="flex-grow text-md font-content"
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
  index: string;
  filter: ValueOperation;
  showLabel?: boolean;
  displayOnly?: boolean;
}

const ComparisonElement = ({
  index,
  filter,
  showLabel = true,
  displayOnly = false,
}: ComparisonElementProps) => {
  const { useUpdateFilters } = useContext(QueryExpressionContext);
  const updateCohortFilter = useUpdateFilters();

  // fix the code below
  const handleKeepMember = (keep: ValueOperation) => {
    updateCohortFilter(index, keep.field, keep);
  };

  return (
    <React.Fragment>
      {showLabel ? (
        <QueryFieldLabel>{fieldNameToTitle(filter.field)}</QueryFieldLabel>
      ) : null}
      <div className="flex flex-row items-center">
        <button
          className="h-[25px] w-[25px] mx-2 rounded-[50%] bg-accent-cool-lightest text-accent-cool-lightest-contrast pb-1"
          onClick={() => {
            if (displayOnly) return;
            handleKeepMember(filter);
          }}
        >
          {filter.operator}
        </button>
        <QueryRepresentationText>{filter.operand}</QueryRepresentationText>
      </div>
    </React.Fragment>
  );
};

const ExistsElement = ({ field, operator }: Exists | Missing) => {
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

export const ClosedRangeQueryElement = ({
  index,
  lower,
  upper,
  op = 'and',
}: PropsWithChildren<ClosedRangeQueryElementProps>) => {
  const { field } = lower; // As this is a Range the field for both lower and upper will be the same

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
  displayOnly?: boolean;
}

export const QueryElement = ({
  index,
  field,
  path,
  children,
  displayOnly = false,
}: QueryElementProps) => {
  const [, setQueryExpressionsExpanded] = useContext(
    QueryExpressionsExpandedContext,
  );

  const { cohortId: currentCohortId, useRemoveFilter } = useContext(
    QueryExpressionContext,
  );

  const removeCohortFilter = useRemoveFilter();

  // const currentCohortId = useCoreSelector((state: CoreState) =>
  //   selectCurrentCohortId(state),
  // );

  const fieldName = path && path != '.' ? [path, field].join('.') : field;
  const handleRemoveFilter = () => {
    removeCohortFilter(index, fieldName);
    setQueryExpressionsExpanded({
      type: 'clear',
      cohortId: currentCohortId,
      field: fieldName,
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
      {!displayOnly && (
        <button
          className="bg-accent-vivid p-0 m-0 h-full rounded-r-sm text-white hover:bg-accent-darker"
          onClick={handleRemoveFilter}
          aria-label={`remove ${fieldNameToTitle(field)}`}
        >
          <ClearIcon size="1.5em" className="px-1" />
        </button>
      )}
    </QueryItemContainer>
  );
};

/**
 *  Processes a Filter into a component representation
 */
class CohortFilterToComponent implements OperationHandler<ReactElement> {
  private readonly index: string;
  private readonly path?: string;
  private readonly displayOnly?: boolean;

  constructor(index: string, path = '.', displayOnly = false) {
    this.index = index;
    this.path = path;
    this.displayOnly = displayOnly;
  }

  handleIncludes = (f: Includes) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <IncludeExcludeQueryElement
        {...f}
        index={this.index}
        path={this.path}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleExcludes = (f: Excludes) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <IncludeExcludeQueryElement
        {...f}
        index={this.index}
        path={this.path}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleEquals = (f: Equals) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ComparisonElement
        filter={f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleNotEquals = (f: NotEquals) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ComparisonElement
        filter={f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleLessThan = (f: LessThan) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ComparisonElement
        filter={f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleLessThanOrEquals = (f: LessThanOrEquals) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ComparisonElement
        filter={f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleGreaterThan = (f: GreaterThan) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ComparisonElement
        filter={f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleGreaterThanOrEquals = (f: GreaterThanOrEquals) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ComparisonElement
        filter={f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
    </QueryElement>
  );
  handleExists = (f: Exists) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ExistsElement {...f} />
    </QueryElement>
  );
  handleMissing = (f: Missing) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <ExistsElement {...f} />
    </QueryElement>
  );
  handleExcludeIfAny = (f: ExcludeIfAny) => (
    <QueryElement
      key={f.field}
      {...f}
      index={this.index}
      path={this.path}
      displayOnly={this.displayOnly}
    >
      <IncludeExcludeQueryElement
        {...f}
        index={this.index}
        displayOnly={this.displayOnly}
      />
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
        this.displayOnly,
      );
    } else {
      return convertFilterToComponent(
        op.operand,
        this.index,
        op.path,
        this.displayOnly,
      );
    }
  };
}

export const convertFilterToComponent = (
  filter: Operation,
  index: string,
  path = '.',
  displayOnly = false,
): ReactElement => {
  const handler: OperationHandler<ReactElement> = new CohortFilterToComponent(
    index,
    path,
    displayOnly,
  );
  return handleOperation(handler, filter);
};

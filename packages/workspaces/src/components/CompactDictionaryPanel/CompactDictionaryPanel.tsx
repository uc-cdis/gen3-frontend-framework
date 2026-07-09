import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Group,
  LoadingOverlay,
  Scroller,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  MdKeyboardArrowDown as DownArrowIcon,
  MdKeyboardArrowRight as RightArrowIcon,
} from 'react-icons/md';
import { OverflowTooltippedLabel } from '@gen3/frontend';
import { parseSchemaNodes, type SchemaNode } from '../../lib/ragContext';
import {
  isFetchBaseQueryError,
  useGetDictionaryFromUrlQuery,
} from '@gen3/core';
import FieldLinkCountBadge from './FieldLinkCountBadge';

export interface CompactDictionaryPanelProps {
  schemaUrl?: string;
}

const CompactDictionaryPanel = ({
  schemaUrl = '_dictionary/_all',
}: CompactDictionaryPanelProps) => {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const isNarrow = width > 0 && width < 280;
  const isCompact = width > 0 && width < 360;

  const [nodes, setNodes] = useState<SchemaNode[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isFetching, isError, error, isSuccess } =
    useGetDictionaryFromUrlQuery(schemaUrl);

  const filtered = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    return nodes.filter(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q) ||
        Object.keys(n.properties).some((k) => k.toLowerCase().includes(q)),
    );
  }, [nodes, search]);

  useEffect(() => {
    if (isSuccess) {
      const parsed = parseSchemaNodes(data);
      setNodes(parsed);
    }
  }, [isSuccess, data]);

  if (isError) {
    let message = 'Could not load dictionary';
    if (isFetchBaseQueryError(error)) {
      message = `Error loading dictionary from server`;
    }
    return (
      <div className="rounded-lg border border-utility-error bg-utility-error opacity-90 px-3 py-2 text-xs text-utility-contrast-error">
        {message}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative flex flex-col gap-2 bg-base-lightest p-2 h-full"
    >
      <LoadingOverlay visible={isFetching} />
      <TextInput
        placeholder="Filter nodes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="text-xs text-base-darker">
        {filtered.length} node{filtered.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </div>

      <div className="flex h-full flex-1 flex-col gap-0.5 overflow-y-auto">
        {filtered.map((node) => {
          const isExpanded = expandedId === node.id;
          const propCount = Object.keys(node.properties).length;
          const linkCount = node.links.length;

          return (
            <div
              key={node.id}
              className="rounded-md border border-base-lightest bg-base-max"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : node.id)}
                className="flex w-full flex-col px-2.5 py-2 text-left hover:bg-base-lightest hover:bg-opacity-50"
                aria-label={`Expand description for ${node.title}`}
                aria-expanded={isExpanded}
              >
                {/* Top row: arrow + title (+ badge when not narrow) */}
                <div className="flex w-full items-center gap-2">
                  {isExpanded ? <DownArrowIcon /> : <RightArrowIcon />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-base-darkest">
                      {node.title}
                    </div>
                    {!isNarrow && node.category && (
                      <div className="truncate text-sm text-base-darker">
                        {node.category}
                      </div>
                    )}
                  </div>
                  {!isNarrow && (
                    <FieldLinkCountBadge
                      fieldsCount={propCount}
                      linksCount={linkCount}
                    />
                  )}
                </div>

                {/* Second row (narrow only): category + badge */}
                {isNarrow && (
                  <div className="flex w-full items-center justify-between pl-5 pt-0.5">
                    {node.category && (
                      <span className="truncate text-xs text-base-darker">
                        {node.category}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-base-lightest px-2.5 py-2">
                  {node.description && (
                    <p className="mb-2 text-sm italic text-base-darker px-4">
                      {node.description}
                    </p>
                  )}

                  {propCount > 0 && (
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Field</Table.Th>
                          <Table.Th>Type</Table.Th>
                          {!isCompact && <Table.Th></Table.Th>}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {Object.entries(node.properties).map(([name, info]) => (
                          <Table.Tr key={name}>
                            <Table.Td>
                              <Text size="xs" c="base-contrast.5">
                                {name}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c="base-contrast.5">
                                {info.type}
                              </Text>
                            </Table.Td>
                            {!isCompact && (
                              <Table.Td>
                                {info.enum && (
                                  <Scroller draggable>
                                    <Group gap="xs" wrap="nowrap">
                                      {info.enum.map((value) => (
                                        <Badge
                                          variant="light"
                                          size="sm"
                                          color="secondary.4"
                                          key={value}
                                        >
                                          <OverflowTooltippedLabel
                                            label={value}
                                            className="font-bold text-secondary-contrast"
                                            color="accent-light"
                                            noTruncate={true}
                                          >
                                            {value}
                                          </OverflowTooltippedLabel>
                                        </Badge>
                                      ))}
                                    </Group>
                                  </Scroller>
                                )}
                              </Table.Td>
                            )}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}

                  {linkCount > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-base-darker">
                        Links
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {node.links.map((link, i) => (
                          <div key={i} className="text-sm text-base-darker">
                            <span className="font-mono">{link.name}</span>
                            <span className="text-base-dark"> → </span>
                            <span className="text-utility-category3">
                              {link.target_type}
                            </span>
                            {link.multiplicity && (
                              <span className="text-xs text-base-dark">
                                {' '}
                                ({link.multiplicity})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactDictionaryPanel;

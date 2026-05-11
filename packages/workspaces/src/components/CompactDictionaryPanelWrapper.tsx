import React, { useEffect, useMemo, useState } from 'react';
import CompactDictionaryPanel from './CompactDictionaryPanel';
import { parseSchemaNodes, type SchemaNode } from '../lib/ragContext';

export interface CompactDictionaryPanelWrapperProps {
  schemaUrl?: string;
};

const CompactDictionaryPanelWrapper = ({
  schemaUrl = '/api/v0/submission/_dictionary/_all',
} : CompactDictionaryPanelWrapperProps) => {
  const [nodes, setNodes] = useState<SchemaNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(schemaUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) {
          setNodes(parseSchemaNodes(json));
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to load dictionary');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [schemaUrl]);

  return (
    <CompactDictionaryPanel nodes={nodes} loading={loading} error={error} />
  )
}

export default CompactDictionaryPanelWrapper;

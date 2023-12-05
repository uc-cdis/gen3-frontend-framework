import { useGetExternalLoginsQuery } from './externalLoginsSlice';
import { FileMetadata } from './types';
import { GUID_PREFIX_PATTERN } from '../../constants';
import { resolveDRSObjectId } from '../drsResolver/utils';

/**
 * Input is a list of files selected for download.
 * Output is a array of GUID prefixes
 * @param selectedFiles
 */
const gatherGUIDPrefixes = (selectedFiles: ReadonlyArray<FileMetadata>) => {
  return selectedFiles.reduce((acc, selectedFile) => {
    if (selectedFile.object_id) {
      const guidDomainPrefix = (
        selectedFile.object_id.match(GUID_PREFIX_PATTERN) || []
      ).shift();
      if (guidDomainPrefix) {
        if (!acc.includes(guidDomainPrefix)) {
          acc.push(guidDomainPrefix);
        }
      }
    }
    return acc;
  }, [] as string[]);
};

/**
 * Resolves DRS object ID from a list of guids using dataguids.org or other DRS resolver
 * @param guidPrefixes
 */
const resolveDRSPrefixes = async (guidPrefixes: string[]) => {
  return await resolveDRSObjectId(guidPrefixes);
};

// holds hostname of DRS server for each GUID
interface ResolvedGUID extends FileMetadata {
  url?: string;
  drsPrefix?: string;
}

/**
 * Given a list of object ids, extracts and DRS prefixes and resolves them to DRS server hostnames
 * then returns a list of resolved GUIDs, and a list of unresolved GUIDs
 * @param selectedFiles
 * @returns - {
 *           resolvedDRSPrefixes: Record<string, string> - map of GUID prefixes to DRS server hostnames
 *           resolvedFiles: ResolvedGUID[] - list of resolved GUIDs
 *           unresolvedFiles: ResolvedGUID[] - list of unresolved GUIDs
 *           }
 */
const resolveGUIDsInSelectedFiles = async (
  selectedFiles: ReadonlyArray<FileMetadata>,
) => {
  if (!selectedFiles || selectedFiles.length === 0) {
    return {
      externalHosts: {},
      resolvedFiles: [],
      unresolvedFiles: [],
    };
  }

  const guidPrefixes = gatherGUIDPrefixes(selectedFiles);
  const resolvedDRSPrefixes = await resolveDRSPrefixes(guidPrefixes);

  const resolvedIds: ResolvedGUID[] = [];
  const unresolvedIds: ResolvedGUID[] = [];
  selectedFiles.forEach((selectedFile) => {
    if (selectedFile.object_id) {
      const guidDomainPrefix = (
        selectedFile.object_id.match(GUID_PREFIX_PATTERN) || []
      ).shift();
      if (guidDomainPrefix && resolvedDRSPrefixes[guidDomainPrefix]) {
        resolvedIds.push({
          ...selectedFile,
          drsPrefix: guidDomainPrefix,
          url: resolvedDRSPrefixes[guidDomainPrefix],
        });
      }
    } else {
      unresolvedIds.push(selectedFile);
    }
  });
  return {
    externalHosts: resolvedDRSPrefixes,
    resolvedFiles: resolvedIds,
    unresolvedFiles: unresolvedIds,
  };
};

interface FederatedLoginStatusParams {
  selectedFiles: ReadonlyArray<FileMetadata>;
}

const useGetFederatedLoginStatus = async ({
  selectedFiles,
}: FederatedLoginStatusParams) => {
  const {
    data: wtsResults,
    isLoading: wstIsLoading,
    error: wtsError,
  } = useGetExternalLoginsQuery();

  if (wtsError || wtsResults === undefined) {
    return { error: wtsError };
  }

  const providers = wtsResults.providers ?? [];

  const unauthenticatedProviders = providers.filter(
    (provider) => !provider.refresh_token_expiration,
  );

  const guidResolutions = await resolveGUIDsInSelectedFiles(selectedFiles);
  const providersToAuthenticate = unauthenticatedProviders.filter(
    (unauthenticatedProvider) =>
      Object(guidResolutions.externalHosts)
        .values()
        .includes(new URL(unauthenticatedProvider.base_url).hostname),
  );

  const missingProviders = providersToAuthenticate.filter(
    (provider) =>
      !Object(guidResolutions.externalHosts)
        .values()
        .includes(new URL(provider.base_url).hostname),
  );
  if (missingProviders.length > 0) {
    throw new Error(
      `Could not find DRS server hostname for providers: ${missingProviders
        .map((provider) => provider.name)
        .join(', ')}`,
    );
  }

  return {
    data: wtsResults,
    isLoading: wstIsLoading,
    error: wtsError,
    providersToAuthenticate: providersToAuthenticate,
    missingProviders: missingProviders,
  };
};

export default useGetFederatedLoginStatus;

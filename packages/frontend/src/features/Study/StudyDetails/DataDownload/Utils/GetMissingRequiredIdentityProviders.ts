// This will possibly need to be updated in HP-2896:
const GetMissingRequiredIdentityProviders = (
  selectedResources: ReadonlyArray<Record<string, unknown>>,
  identityProvider: string | undefined,
): string[] => {
  const missingRequiredIdentityProvider: string[] = [];
  if (Array.isArray(selectedResources) && selectedResources.length > 0) {
    selectedResources.forEach((resource) => {
      if (resource && Array.isArray(resource.tags)) {
        (resource.tags as { name: string; category: string }[]).forEach(
          (tag) => {
            if (tag.category === 'RequiredIDP' && tag.name) {
              // If any resources RequiredIDP check if logged in
              switch (tag.name) {
                case 'InCommon':
                  if (
                    identityProvider &&
                    identityProvider === 'shibboleth'
                  ) {
                    return; // do not add tag to list
                  }
                  break;
                default:
                  console.error(
                    `Required Identity Provider does not expect: ${tag.name}`,
                  );
                  return; // do not add tag to list
              }
              if (!missingRequiredIdentityProvider.includes(tag.name)) {
                missingRequiredIdentityProvider.push(tag.name);
              }
            }
          },
        );
      }
    });
  }
  return missingRequiredIdentityProvider;
};
export default GetMissingRequiredIdentityProviders;

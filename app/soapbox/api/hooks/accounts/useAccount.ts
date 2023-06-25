import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useFeatures, useLoggedIn } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account, accountSchema } from 'soapbox/schemas';

import { useRelationship } from './useRelationship';

interface UseAccountOpts {
  withRelationship?: boolean
}

function useAccount(accountId?: string, opts: UseAccountOpts = {}) {
  const api = useApi();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity: account, ...result } = useEntity<Account>(
    [Entities.ACCOUNTS, accountId!],
    () => api.get(`/api/v1/accounts/${accountId}`),
    { schema: accountSchema, enabled: !!accountId },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(accountId, { enabled: withRelationship });

  const isBlocked = account?.relationship?.blocked_by === true;
  const isUnavailable = (me === account?.id) ? false : (isBlocked && !features.blockersVisible);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isUnavailable,
    account: account ? { ...account, relationship } : undefined,
  };
}

export { useAccount };
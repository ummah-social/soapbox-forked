import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';
import { groupRelationshipSchema } from 'soapbox/schemas';

import { useGroups } from './useGroups';

import type { Group, GroupRelationship } from 'soapbox/schemas';

function useJoinGroup(group: Group) {
  const { invalidate } = useGroups();

  const { createEntity, isLoading } = useEntityActions<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    { post: `/api/v1/groups/${group.id}/join` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isLoading,
    invalidate,
  };
}

export { useJoinGroup };
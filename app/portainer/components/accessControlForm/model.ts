import { ResourceControlOwnership as RCO } from 'Portainer/models/resourceControl/resourceControlOwnership';

import { TeamId } from '@/portainer/teams/types';
import { UserId } from '@/portainer/users/types';
import { ResourceControlViewModel } from '@/portainer/models/resourceControl/resourceControl';

export class AccessControlFormData {
  accessControlEnabled = true;

  ownership: RCO = RCO.PRIVATE;

  authorizedUsers: UserId[] = [];

  authorizedTeams: TeamId[] = [];
}

export function parseFromResourceControl(
  isAdmin: boolean,
  resourceControl?: ResourceControlViewModel
): AccessControlFormData {
  const formData = new AccessControlFormData();

  // TODO should be done at the using component. something like `mergeResourceControl(resourceControl, isAdmin)
  if (!resourceControl && isAdmin) {
    formData.ownership = RCO.ADMINISTRATORS;
  }

  if (resourceControl) {
    let ownership = resourceControl.Ownership;
    if (isAdmin && ownership === RCO.PRIVATE) {
      ownership = RCO.RESTRICTED;
    }

    let accessControl = formData.accessControlEnabled;
    if (ownership === RCO.PUBLIC) {
      accessControl = false;
    }

    formData.ownership = ownership;
    formData.accessControlEnabled = accessControl;
  }

  return formData;
}

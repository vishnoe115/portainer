import _ from 'lodash';
import { useEffect, useState, useCallback } from 'react';

import { ResourceControlOwnership as RCO } from '@/portainer/models/resourceControl/resourceControlOwnership';
import { BoxSelector, buildOption } from '@/portainer/components/BoxSelector';
import { ownershipIcon } from '@/portainer/filters/filters';
import { useUser } from '@/portainer/hooks/useUser';
import { Team } from '@/portainer/teams/types';
import { UserViewModel } from '@/portainer/models/user';
import { BoxSelectorOption } from '@/portainer/components/BoxSelector/types';
import { FormSectionTitle } from '@/portainer/components/form-components/FormSectionTitle';
import { SwitchField } from '@/portainer/components/form-components/SwitchField';
import { ResourceControlViewModel } from '@/portainer/models/resourceControl/resourceControl';

import { AccessControlFormData } from './porAccessControlFormModel';
import { UsersField } from './UsersField';
import { TeamsField } from './TeamsField';

export interface BaseProps {
  values: AccessControlFormData;
  onChange(values: AccessControlFormData): void;
  hideTitle?: boolean;
  resourceControl: ResourceControlViewModel;
}

interface Props extends BaseProps {
  teams: Team[];
  users: UserViewModel[];
}

export function AccessControlForm({
  values,
  onChange,
  hideTitle,
  users,
  teams,
  resourceControl,
}: Props) {
  const { user } = useUser();
  const isAdmin = user?.Role === 1;

  const options: BoxSelectorOption<string>[] = useOptions(isAdmin, teams);

  const handleChange = useCallback(
    (partialValues: Partial<typeof values>) => {
      onChange({ ...values, ...partialValues });
    },

    [values, onChange]
  );

  // TODO should be done at the using component. something like `mergeResourceControl(resourceControl, isAdmin)
  useEffect(() => {
    if (!resourceControl && isAdmin) {
      handleChange({ Ownership: RCO.ADMINISTRATORS });
    }

    if (resourceControl) {
      let ownership = resourceControl.Ownership;
      if (isAdmin && ownership === RCO.PRIVATE) {
        ownership = RCO.RESTRICTED;
      }

      let accessControl = true;
      if (ownership === RCO.PUBLIC) {
        accessControl = false;
      }

      handleChange({
        Ownership: ownership,
        AccessControlEnabled: accessControl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceControl]);

  return (
    <>
      {!hideTitle && <FormSectionTitle>Access control</FormSectionTitle>}

      <div className="form-group">
        <div className="col-sm-12">
          <SwitchField
            checked={values.AccessControlEnabled}
            name="ownership"
            label="Enable access control"
            tooltip="When enabled, you can restrict the access and management of this resource."
            onChange={(AccessControlEnabled) =>
              handleChange({ AccessControlEnabled })
            }
          />
        </div>
      </div>

      {values.AccessControlEnabled && (
        <>
          <div className="form-group">
            <BoxSelector
              radioName="access-control"
              value={values.Ownership}
              options={options}
              onChange={(Ownership) => handleChange({ Ownership })}
            />
          </div>
          {values.Ownership === RCO.RESTRICTED && (
            <div aria-label="extra-options">
              <UsersField
                users={users}
                onChange={(AuthorizedUsers) =>
                  handleChange({ AuthorizedUsers })
                }
                value={values.AuthorizedUsers}
              />

              <TeamsField
                teams={teams}
                onChange={(AuthorizedTeams) =>
                  handleChange({ AuthorizedTeams })
                }
                value={values.AuthorizedTeams}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

function useOptions(isAdmin: boolean, teams: Team[]) {
  const [options, setOptions] = useState<Array<BoxSelectorOption<string>>>([]);

  useEffect(() => {
    setOptions(isAdmin ? adminOptions() : nonAdminOptions(teams));
  }, [isAdmin, teams]);

  return options;
}

function adminOptions() {
  return [
    buildOption(
      'access_administrators',
      ownershipIcon('administrators'),
      'Administrators',
      'I want to restrict the management of this resource to administrators only',
      'administrators'
    ),
    buildOption(
      'access_restricted',
      ownershipIcon('restricted'),
      'Restricted',
      'I want to restrict the management of this resource to a set of users and/or teams',
      'restricted'
    ),
  ];
}
function nonAdminOptions(teams: Team[]) {
  return _.compact([
    buildOption(
      'access_private',
      ownershipIcon('private'),
      'Private',
      'I want to this resource to be manageable by myself only',
      'private'
    ),
    teams.length > 0 &&
      buildOption(
        'access_restricted',
        ownershipIcon('restricted'),
        'Restricted',
        teams.length === 1
          ? `I want any member of my team (${teams[0].Name})  to be able to manage this resource`
          : 'I want to restrict the management of this resource to one or more of my teams',
        'restricted'
      ),
  ]);
}

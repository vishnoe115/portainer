import _ from 'lodash';

import { ResourceControlOwnership as RCO } from '@/portainer/models/resourceControl/resourceControlOwnership';
import { UserContext } from '@/portainer/hooks/useUser';
import { UserViewModel } from '@/portainer/models/user';
import { render, within } from '@/react-tools/test-utils';
import { Team } from '@/portainer/teams/types';
import { ResourceControlViewModel } from '@/portainer/models/resourceControl/resourceControl';

import { AccessControlForm } from './AccessControlForm';
import { AccessControlFormData } from './porAccessControlFormModel';

test('renders correctly', async () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: '',
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByText, queryByLabelText } = renderComponent(values);

  expect(queryByText('Access control')).toBeVisible();

  expect(queryByLabelText(/Enable access control/)).toBeVisible();
});

test('when AccessControlEnabled is true, ownership selector should be visible', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: '',
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByRole } = renderComponent(values);

  expect(queryByRole('radiogroup')).toBeVisible();
});

test('when AccessControlEnabled is false, ownership selector should be hidden', () => {
  const values = {
    AccessControlEnabled: false,
    Ownership: '',
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByRole } = renderComponent(values);

  expect(queryByRole('radiogroup')).toBeNull();
});

test('when hideTitle is true, title should be hidden', () => {
  const values = {
    AccessControlEnabled: false,
    Ownership: '',
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByText } = renderComponent(values, jest.fn(), {
    hideTitle: true,
  });

  expect(queryByText('Access control')).toBeNull();
});

test('when isAdmin and AccessControlEnabled, ownership selector should admin and restricted options', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: '',
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByRole } = renderComponent(values, jest.fn(), { isAdmin: true });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);
  expect(selectorQueries.queryByLabelText(/Administrator/)).toBeVisible();
  expect(selectorQueries.queryByLabelText(/Restricted/)).toBeVisible();
});

test('when isAdmin, AccessControlEnabled and admin ownership is selected, no extra options are visible', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.ADMINISTRATORS,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByRole, queryByLabelText } = renderComponent(values, jest.fn(), {
    isAdmin: true,
  });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);

  expect(selectorQueries.queryByLabelText(/Administrator/)).toBeChecked();
  expect(selectorQueries.queryByLabelText(/Restricted/)).not.toBeChecked();

  const extraOptions = queryByLabelText('extra-options');
  expect(extraOptions).toBeNull();
});

test('when isAdmin, AccessControlEnabled and restricted ownership is selected, show team and users selectors', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.RESTRICTED,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByRole, queryByLabelText } = renderComponent(values, jest.fn(), {
    isAdmin: true,
  });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);

  expect(selectorQueries.queryByLabelText(/Administrator/)).not.toBeChecked();

  expect(selectorQueries.queryByLabelText(/Restricted/)).toBeChecked();

  const extraOptions = queryByLabelText('extra-options');
  expect(extraOptions).toBeVisible();

  if (!extraOptions) {
    throw new Error('extra options section is missing');
  }

  const extraQueries = within(extraOptions);
  expect(extraQueries.queryByText(/Authorized users/)).toBeVisible();
  expect(extraQueries.queryByText(/Authorized teams/)).toBeVisible();
});

interface AdditionalProps {
  teams?: Team[];
  users?: UserViewModel[];
  isAdmin?: boolean;
  hideTitle?: boolean;
  resourceControl?: ResourceControlViewModel;
}

function renderComponent(
  values: AccessControlFormData,
  onChange = jest.fn(),
  {
    teams = [],
    users = [],
    isAdmin = false,
    hideTitle = false,
    resourceControl = new ResourceControlViewModel({
      UserAccesses: [],
      TeamAccesses: [],
    }),
  }: AdditionalProps = {}
) {
  const user = new UserViewModel({ Username: 'user', Role: isAdmin ? 1 : 2 });
  const state = { user };

  const renderResult = render(
    <UserContext.Provider value={state}>
      <AccessControlForm
        values={values}
        resourceControl={resourceControl}
        onChange={onChange}
        hideTitle={hideTitle}
        teams={teams}
        users={users}
      />
    </UserContext.Provider>
  );

  return renderResult;
}

test('when user is not an admin and access control is enabled and no teams, should have only private option', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.ADMINISTRATORS,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const { queryByRole } = renderComponent(values, jest.fn(), { teams: [] });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);

  expect(selectorQueries.queryByLabelText(/Private/)).toBeVisible();
  expect(selectorQueries.queryByLabelText(/Restricted/)).toBeNull();
});

test('when user is not an admin and access control is enabled and there is 1 team, should have private and restricted options', async () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.ADMINISTRATORS,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const teams: Team[] = [{ Id: 1, Name: 'team1' }];

  const { queryByRole } = renderComponent(values, jest.fn(), { teams });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);

  expect(selectorQueries.queryByLabelText(/Private/)).toBeVisible();
  expect(selectorQueries.queryByLabelText(/Restricted/)).toBeVisible();
});

test('when user is not an admin, access control is enabled, there are more then 1 team and ownership is restricted, team selector should be visible', async () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.RESTRICTED,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const teams: Team[] = _.range(Math.random() * 10 + 1).map((value) => ({
    Id: value,
    Name: `team${value}`,
  }));

  const { queryByRole, queryByLabelText } = renderComponent(values, jest.fn(), {
    teams,
  });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);

  expect(selectorQueries.queryByLabelText(/Private/)).toBeVisible();
  expect(selectorQueries.queryByLabelText(/Restricted/)).toBeVisible();

  const extraOptions = queryByLabelText('extra-options');
  expect(extraOptions).toBeVisible();

  if (!extraOptions) {
    throw new Error('extra options section is missing');
  }

  const extraQueries = within(extraOptions);
  expect(extraQueries.queryByLabelText(/Authorized teams/)).toBeVisible();
});

test('when user is not an admin, access control is enabled, there is 1 team and ownership is restricted, team selector should be visible', async () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.RESTRICTED,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const teams: Team[] = _.range(Math.random() + 1).map((value) => ({
    Id: value,
    Name: `team${value}`,
  }));

  const { queryByRole, queryByLabelText } = renderComponent(values, jest.fn(), {
    teams,
  });

  const ownershipSelector = queryByRole('radiogroup');

  expect(ownershipSelector).toBeVisible();
  if (!ownershipSelector) {
    throw new Error('selector is missing');
  }

  const selectorQueries = within(ownershipSelector);

  expect(selectorQueries.queryByLabelText(/Private/)).toBeVisible();
  expect(selectorQueries.queryByLabelText(/Restricted/)).toBeVisible();

  const extraOptions = queryByLabelText('extra-options');
  expect(extraOptions).toBeVisible();

  if (!extraOptions) {
    throw new Error('extra options section is missing');
  }

  const extraQueries = within(extraOptions);
  expect(extraQueries.queryByLabelText(/Authorized teams/)).toBeVisible();
});

test('when resource control supplied, if user is admin and resource ownership is private, will change ownership to restricted', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.PRIVATE,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const resourceControl = new ResourceControlViewModel({
    UserAccesses: [],
    TeamAccesses: [],
  });
  resourceControl.Ownership = RCO.PRIVATE;

  const onChangeHandler = jest.fn();

  renderComponent(values, onChangeHandler, { isAdmin: true, resourceControl });

  expect(onChangeHandler).toHaveBeenCalledWith({
    ...values,
    Ownership: RCO.RESTRICTED,
  });
});

test('when resource control supplied, if user is not admin , will change ownership to rc ownership', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.ADMINISTRATORS,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const resourceControl = new ResourceControlViewModel({
    UserAccesses: [],
    TeamAccesses: [],
  });
  resourceControl.Ownership = RCO.PRIVATE;

  const onChangeHandler = jest.fn();

  renderComponent(values, onChangeHandler, { isAdmin: false, resourceControl });

  expect(onChangeHandler).toHaveBeenCalledWith({
    ...values,
    Ownership: resourceControl.Ownership,
  });
});

test('when resource control supplied, if resource ownership is not private (and user admin) , will change ownership to rc ownership', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.ADMINISTRATORS,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const resourceControl = new ResourceControlViewModel({
    UserAccesses: [],
    TeamAccesses: [],
  });
  resourceControl.Ownership = RCO.RESTRICTED;

  const onChangeHandler = jest.fn();

  renderComponent(values, onChangeHandler, { isAdmin: true, resourceControl });

  expect(onChangeHandler).toHaveBeenCalledWith({
    ...values,
    Ownership: resourceControl.Ownership,
  });
});

test('when resource control supplied, if ownership is public, will disabled access control', () => {
  const values = {
    AccessControlEnabled: true,
    Ownership: RCO.PUBLIC,
    AuthorizedTeams: [],
    AuthorizedUsers: [],
  };

  const resourceControl = new ResourceControlViewModel({
    UserAccesses: [],
    TeamAccesses: [],
  });
  resourceControl.Ownership = RCO.PUBLIC;

  const onChangeHandler = jest.fn();

  renderComponent(values, onChangeHandler, {
    resourceControl,
  });

  expect(onChangeHandler).toHaveBeenCalledWith({
    ...values,
    AccessControlEnabled: false,
  });
});

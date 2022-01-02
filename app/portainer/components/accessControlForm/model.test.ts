import { ResourceControlOwnership as RCO } from '@/portainer/models/resourceControl/resourceControlOwnership';
import { ResourceControlViewModel } from '@/portainer/models/resourceControl/resourceControl';

import { parseFromResourceControl } from './model';

test('when resource control supplied, if user is not admin, will change ownership to rc ownership', () => {
  [RCO.ADMINISTRATORS, RCO.RESTRICTED, RCO.PUBLIC, RCO.PRIVATE].forEach(
    (ownership) => {
      const resourceControl = new ResourceControlViewModel({
        UserAccesses: [],
        TeamAccesses: [],
      });
      resourceControl.Ownership = ownership;

      const actual = parseFromResourceControl(false, resourceControl);
      expect(actual.ownership).toBe(resourceControl.Ownership);
    }
  );
});

test('when resource control supplied and user is admin, if resource ownership is not private , will change ownership to rc ownership', () => {
  [RCO.ADMINISTRATORS, RCO.RESTRICTED, RCO.PUBLIC].forEach((ownership) => {
    const resourceControl = new ResourceControlViewModel({
      UserAccesses: [],
      TeamAccesses: [],
    });
    resourceControl.Ownership = ownership;

    const actual = parseFromResourceControl(true, resourceControl);
    expect(actual.ownership).toBe(resourceControl.Ownership);
  });
});

test('when resource control supplied, if ownership is public, will disabled access control', () => {
  const resourceControl = new ResourceControlViewModel({
    UserAccesses: [],
    TeamAccesses: [],
  });
  resourceControl.Ownership = RCO.PUBLIC;

  const actual = parseFromResourceControl(false, resourceControl);

  expect(actual.accessControlEnabled).toBe(false);
});

test('when isAdmin and resource control not supplied, ownership should be set to Administrator', () => {
  const actual = parseFromResourceControl(true);

  expect(actual.ownership).toBe(RCO.ADMINISTRATORS);
});

test('when resource control supplied, if user is admin and resource ownership is private, will change ownership to restricted', () => {
  const resourceControl = new ResourceControlViewModel({
    UserAccesses: [],
    TeamAccesses: [],
  });
  resourceControl.Ownership = RCO.PRIVATE;

  const actual = parseFromResourceControl(true, resourceControl);
  expect(actual.ownership).toBe(RCO.RESTRICTED);
});

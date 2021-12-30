import _ from 'lodash-es';

import { ownershipIcon } from '@/portainer/filters/filters';
import { ResourceControlOwnership as RCO } from 'Portainer/models/resourceControl/resourceControlOwnership';
import { buildOption } from '../BoxSelector';

angular.module('portainer.app').controller('porAccessControlFormController', porAccessControlFormController);

/* @ngInject */
function porAccessControlFormController($q, $scope, UserService, TeamService, Notifications, Authentication, ResourceControlService) {
  var ctrl = this;

  ctrl.RCO = RCO;

  ctrl.availableTeams = [];
  ctrl.availableUsers = [];
  ctrl.options = [];

  ctrl.onChangeOwnershipType = onChangeOwnershipType;
  ctrl.onToggle = onToggle;

  function onToggle(AccessControlEnabled) {
    $scope.$evalAsync(() => {
      handleChange({ AccessControlEnabled });
    });
  }

  function onChangeOwnershipType(Ownership) {
    $scope.$evalAsync(() => {
      handleChange({ Ownership });
    });
  }

  function handleChange(partialValues) {
    ctrl.onChange({ ...ctrl.formData, ...partialValues });
  }

  function setOwnership(resourceControl, isAdmin) {
    if (isAdmin && resourceControl.Ownership === RCO.PRIVATE) {
      ctrl.formData.Ownership = RCO.RESTRICTED;
    } else {
      ctrl.formData.Ownership = resourceControl.Ownership;
    }

    if (ctrl.formData.Ownership === RCO.PUBLIC) {
      ctrl.formData.AccessControlEnabled = false;
    }
  }

  function setAuthorizedUsersAndTeams(authorizedUsers, authorizedTeams) {
    angular.forEach(ctrl.availableUsers, function (user) {
      var found = _.find(authorizedUsers, { Id: user.Id });
      if (found) {
        user.selected = true;
      }
    });

    angular.forEach(ctrl.availableTeams, function (team) {
      var found = _.find(authorizedTeams, { Id: team.Id });
      if (found) {
        team.selected = true;
      }
    });
  }

  this.$onInit = $onInit;
  function $onInit() {
    var isAdmin = Authentication.isAdmin();
    ctrl.isAdmin = isAdmin;

    if (isAdmin) {
      ctrl.formData.Ownership = ctrl.RCO.ADMINISTRATORS;
    }

    $q.all({
      availableTeams: TeamService.teams(),
      availableUsers: isAdmin ? UserService.users(false) : [],
    })
      .then(function success(data) {
        ctrl.availableUsers = _.orderBy(data.availableUsers, 'Username', 'asc');

        var availableTeams = _.orderBy(data.availableTeams, 'Name', 'asc');
        ctrl.availableTeams = availableTeams;
        if (!isAdmin && availableTeams.length === 1) {
          ctrl.formData.AuthorizedTeams = availableTeams;
        }

        ctrl.options = isAdmin ? adminOptions() : nonAdminOptions(availableTeams);

        return $q.when(ctrl.resourceControl && ResourceControlService.retrieveOwnershipDetails(ctrl.resourceControl));
      })
      .then(function success(data) {
        if (data) {
          var authorizedUsers = data.authorizedUsers;
          var authorizedTeams = data.authorizedTeams;
          setOwnership(ctrl.resourceControl, isAdmin);
          setAuthorizedUsersAndTeams(authorizedUsers, authorizedTeams);
        }
      })
      .catch(function error(err) {
        Notifications.error('Failure', err, 'Unable to retrieve access control information');
      });
  }
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
    buildOption('access_restricted', ownershipIcon('restricted'), 'Restricted', 'I want to restrict the management of this resource to a set of users and/or teams', 'restricted'),
  ];
}
function nonAdminOptions(teams) {
  return _.compact([
    buildOption('access_private', ownershipIcon('private'), 'Private', 'I want to this resource to be manageable by myself only', 'private'),
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

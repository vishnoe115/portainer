import angular from 'angular';

class PorAccessControlFormWrapperController {
  /* @ngInject */
  constructor() {
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(formData) {
    this.formData = formData;
  }
}

angular.module('portainer.app').component('porAccessControlForm', {
  template: `<por-access-control-form-react
    form-data="$ctrl.formData"
    resource-control="$ctrl.resourceControl"
    hideTitle="$ctrl.hideTitle"
    on-change="$ctrl.handleChange"
  ></por-access-control-form-react>`,
  bindings: {
    // This object will be populated with the form data.
    // Model reference in porAccessControlFromModel.js
    formData: '=',
    // Optional. An existing resource control object that will be used to set
    // the default values of the component.
    resourceControl: '<',
    hideTitle: '<',
  },
  controller: PorAccessControlFormWrapperController,
});

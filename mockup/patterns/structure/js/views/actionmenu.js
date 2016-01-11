define([
  'jquery',
  'underscore',
  'backbone',
  'mockup-ui-url/views/base',
  'mockup-patterns-structure-url/js/models/result',
  'mockup-utils',
  'mockup-patterns-structure-url/js/actions',
  'text!mockup-patterns-structure-url/templates/actionmenu.xml',
  'translate',
  'bootstrap-dropdown'
], function($, _, Backbone, BaseView, Result, utils, Actions, ActionMenuTemplate, _t) {
  'use strict';

  var ActionMenu = BaseView.extend({
    className: 'btn-group actionmenu',
    template: _.template(ActionMenuTemplate),
    events: function() {
      // figure out a way to let third-party supply their own ``define``ed
      // functions into this thing.
      return {
        'click .selectAll a': this.actions.selectAll,
        'click .cutItem a': this.actions.cutClicked,
        'click .copyItem a': this.actions.copyClicked,
        'click .pasteItem a': this.actions.pasteClicked,
        'click .move-top a': this.actions.moveTopClicked,
        'click .move-bottom a': this.actions.moveBottomClicked,
        'click .set-default-page a': this.actions.setDefaultPageClicked,
        'click .openItem a': this.actions.openClicked,
        'click .editItem a': this.actions.editClicked
      }
    },
    initialize: function(options) {
      this.options = options;
      this.app = options.app;
      this.model = options.model;
      this.selectedCollection = this.app.selectedCollection;
      if (options.canMove === false){
        this.canMove = false;
      }else {
        this.canMove = true;
      }
      this.actions = new Actions(this);
    },
    render: function() {
      var self = this;
      self.$el.empty();

      var data = this.model.toJSON();
      data.attributes = self.model.attributes;
      data.pasteAllowed = self.app.pasteAllowed;
      data.canSetDefaultPage = self.app.setDefaultPageUrl;
      data.inQueryMode = self.app.inQueryMode();
      data.header = self.options.header || null;
      data.canMove = self.canMove;

      self.$el.html(self.template($.extend({
        _t: _t,
        id: utils.generateId()
      }, data)));

      self.$dropdown = self.$('.dropdown-toggle');
      self.$dropdown.dropdown();

      if (self.options.className){
        self.$el.addClass(self.options.className);
      }
      return this;
    }
  });

  return ActionMenu;
});

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

    eventTableDefaults: {
      'cutItem': [
        'mockup-patterns-structure-url/js/actions',
        'cutClicked',
        '#',
        'Cut',
      ],
      'copyItem': [
        'mockup-patterns-structure-url/js/actions',
        'copyClicked',
        '#',
        'Copy'
      ],
      'pasteItem': [
        'mockup-patterns-structure-url/js/actions',
        'pasteClicked',
        '#',
        'Paste'
      ],
      'move-top': [
        'mockup-patterns-structure-url/js/actions',
        'moveTopClicked',
        '#',
        'Move to top of folder'
      ],
      'move-bottom': [
        'mockup-patterns-structure-url/js/actions',
        'moveBottomClicked',
        '#',
        'Move to bottom of folder'
      ],
      'set-default-page': [
        'mockup-patterns-structure-url/js/actions',
        'setDefaultPageClicked',
        '#',
        'Set as default page'
      ],
      'selectAll': [
        'mockup-patterns-structure-url/js/actions',
        'selectAll',
        '#',
        'Select all contained items'
      ],
      'openItem': [
        'mockup-patterns-structure-url/js/actions',
        'openClicked',
        '#',
        'Open'
      ],
      'editItem': [
        'mockup-patterns-structure-url/js/actions',
        'editClicked',
        '#',
        'Edit'
      ],
    },

    eventConstructor: function(definition) {
      var self = this;
      var lib = definition[0],
          key = definition[1];
      var doEvent = function (e) {
        require([lib], function(Lib) {
          new Lib(self)[key](e);
        });
      };
      return doEvent;
    },

    events: function() {
      // XXX providing ALL the actions in the eventTableDefaults
      // fix this later when the filtering checks are moved from template
      // to a dynamic user specified definition.
      var self = this;
      var result = {};
      _.each(self.eventTableDefaults, function(eventItem, idx) {
        result['click .' + idx + ' a'] = self.eventConstructor(eventItem);
      });
      return result;
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

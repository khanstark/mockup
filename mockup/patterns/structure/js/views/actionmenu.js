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

    menuOptions: null,
    _default_menuOptions: {
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
      var self = this;
      var result = {};
      _.each(self.menuOptions, function(menuOption, idx) {
        result['click .' + idx + ' a'] = self.eventConstructor(menuOption);
      });
      return result;
    },

    initialize: function(options) {
      this.options = options;
      this.app = options.app;
      this.model = options.model;
      this.selectedCollection = this.app.selectedCollection;

      var menuOptions = this.options['menuOptions'] || null;

      if (menuOptions === null) {
        /*
          directly providing and manipulating the defaults as the values
          are not explicitly overridden - management of their visibility
          will be computed here, instead of inside the template.

          Manipulation/construction of menuOptions should not be done
          here.
        */
        this.menuOptions = _.clone(this._default_menuOptions);
        if (!this.app.pasteAllowed || !this.model.attributes.is_folderish) {
          delete this.menuOptions.pasteItem;
        }
        if (this.app.inQueryMode() || options.canMove === false) {
          delete this.menuOptions['move-top'];
          delete this.menuOptions['move-bottom'];
        }
        if (this.model.attributes.is_folderish || !this.app.setDefaultPageUrl) {
          delete this.menuOptions['set-default-page'];
        }
        if (!this.model.attributes.is_folderish) {
          delete this.menuOptions['selectAll'];
        }
        if (!this.options.header) {
          delete this.menuOptions['openItem'];
        }
      } else {
        this.menuOptions = menuOptions;
      }
    },
    render: function() {
      var self = this;
      self.$el.empty();

      var data = this.model.toJSON();
      data.header = self.options.header || null;
      data.menuOptions = self.menuOptions;

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

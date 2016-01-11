define([
  'jquery',
  'underscore',
  'backbone',
  'mockup-ui-url/views/base',
  'mockup-patterns-structure-url/js/models/result',
  'mockup-utils',
  'translate',
  'bootstrap-dropdown'
], function($, _, Backbone, BaseView, Result, utils, _t) {
  'use strict';

  var doAction = function(self, buttonName, successMsg, failMsg){
    $.ajax({
      url: self.app.buttons.get(buttonName).options.url,
      data: {
        selection: JSON.stringify([self.model.attributes.UID]),
        folder: self.model.attributes.path,
        _authenticator: utils.getAuthenticator()
      },
      dataType: 'json',
      type: 'POST'
    }).done(function(data){
      if(data.status === 'success'){
        self.app.setStatus(_t(successMsg + ' "' + self.model.attributes.Title + '"'));
        self.app.collection.pager();
        self.app.updateButtons();
      }else{
        self.app.setStatus(_t('Error ' + failMsg + ' "' + self.model.attributes.Title + '"'));
      }
    }); 
  };

  // use a more primative class than Backbone.Model?
  var Actions = Backbone.Model.extend({
    initialize: function(options) {
      this.options = options;
      this.app = options.app;
      this.model = options.model;
      this.selectedCollection = this.app.selectedCollection;
    },
    selectAll: function(e){
      e.preventDefault();
      var self = this;
      var page = 1;
      var count = 0;
      var getPage = function(){
        self.app.loading.show();
        $.ajax({
          url: self.app.collection.url,
          type: 'GET',
          dataType: 'json',
          data: {
            query: self.app.collection.queryParser({
              searchPath: self.model.attributes.path
            }),
            batch: JSON.stringify({
              page: page,
              size: 100
            }),
            attributes: JSON.stringify(self.app.queryHelper.options.attributes)
          }
        }).done(function(data){
          var items = self.app.collection.parse(data, count);
          count += items.length;
          _.each(items, function(item){
            self.app.selectedCollection.add(new Result(item));
          });
          page += 1;
          if(data.total > count){
            getPage();
          }else{
            self.app.loading.hide();
            self.app.tableView.render();
          }
        });
      };
      getPage();
    },

    cutClicked: function(e) {
      e.preventDefault();
      doAction(this, 'cut', _t('Cut'), _t('cutting'));
    },
    copyClicked: function(e) {
      e.preventDefault();
      doAction(this, 'copy', _t('Copied'), _t('copying'));
    },
    pasteClicked: function(e) {
      e.preventDefault();
      doAction(this, 'paste', _t('Pasted into'), _t('Error pasting into'));
    },
    moveTopClicked: function(e) {
      e.preventDefault();
      this.app.moveItem(this.model.attributes.id, 'top');
    },
    moveBottomClicked: function(e) {
      e.preventDefault();
      this.app.moveItem(this.model.attributes.id, 'bottom');
    },
    setDefaultPageClicked: function(e) {
      e.preventDefault();
      var self = this;
      $.ajax({
        url: self.app.getAjaxUrl(self.app.setDefaultPageUrl),
        type: 'POST',
        data: {
          '_authenticator': $('[name="_authenticator"]').val(),
          'id': this.model.attributes.id
        },
        success: function(data) {
          self.app.ajaxSuccessResponse.apply(self.app, [data]);
        },
        error: function(data) {
          self.app.ajaxErrorResponse.apply(self.app, [data]);
        }
      });
    },
    getSelectedBaseUrl: function() {
      var self = this;
      return self.model.attributes.getURL;
    },
    getWindow: function() {
      var win = window;
      if (win.parent !== window) {
        win = win.parent;
      }
      return win;
    },
    openUrl: function(url) {
      var self = this;
      var win = self.getWindow();
      var keyEvent = this.app.keyEvent;
      if (keyEvent && keyEvent.ctrlKey) {
        win.open(url);
      } else {
        win.location = url;
      }
    },
    openClicked: function(e) {
      e.preventDefault();
      var self = this;
      self.openUrl(self.getSelectedBaseUrl() + '/view');
    },
    editClicked: function(e) {
      e.preventDefault();
      var self = this;
      self.openUrl(self.getSelectedBaseUrl() + '/edit');
    },
  });

  return Actions;
});

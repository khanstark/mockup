// Author: Nathan Van Gheem
// Contact: nathan@vangheem.us
// Version: 1.0
//
// Description:
//    TinyMCE pattern (for now its depening on Plone's integration)
// 
// License:
//
// Copyright (C) 2010 Plone Foundation
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program; if not, write to the Free Software Foundation, Inc., 51
// Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//

/*jshint bitwise:true, curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, noempty:true, nonew:true, plusplus:true,
  undef:true, strict:true, trailing:true, browser:true, evil:true */
/*global define:false */
/*global tinymce:true */


define([
  'jquery',
  'js/patterns/base',
  'js/patterns/relateditems',
  'js/patterns/modal'
], function($, Base, RelatedItems, Modal) {
  "use strict";

  try{
    // XXX if tinymce not loading, let's bail instead of giving errors.
    if(tinymce === undefined){}
  }catch(e){
    console.log('Warning: tinymce not loaded.');
    return;
  }
  var editor = null;

  var Modal_ = Modal;
  tinymce.PluginManager.add('plonelink', function(editor) {
    editor.addButton('plonelink', {
      icon: 'link',
      tooltip: 'Insert/edit link',
      shortcut: 'Ctrl+K',
      onclick: editor.settings.openLink,
      stateSelector: 'a[href]'
    });

    editor.addButton('unlink', {
      icon: 'unlink',
      tooltip: 'Remove link(s)',
      cmd: 'unlink',
      stateSelector: 'a[href]'
    });

    editor.addShortcut('Ctrl+K', '', editor.settings.openLink);

    editor.addMenuItem('plonelink', {
      icon: 'link',
      text: 'Insert link',
      shortcut: 'Ctrl+K',
      onclick: editor.settings.openLink,
      stateSelector: 'a[href]',
      context: 'insert',
      prependToContext: true
    });
  });

  var TinyMCE = Base.extend({
    name: 'tinymce',
    defaults: {
      relatedItems: {
        attributes: ['UID', 'title:Title', 'Description', 'getURL', 'Type', 'path', 'ModificationDate'],
        batchSize: 20,
        basePath: '/',
        ajaxvocabulary: null,
        width: 500,
        maximumSelectionSize: 1
      },
      targetList: [
        {text: 'None', value: ''},
        {text: 'New window', value: '_blank'},
      ],
      tiny: {
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table contextmenu paste plonelink"
        ],
        toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | unlink plonelink image"
      }
    },
    openLink: function(){
      var self = this;

      var editor = self.tiny;
      var dom = editor.dom;
      var selection = editor.selection;
      var data = {};
      var initialText;
      editor.focus();

      var selectedElm = selection.getNode();
      var anchorElm = dom.getParent(selectedElm, 'a[href]');
      if (anchorElm) {
        selection.select(anchorElm);
      }

      data.text = initialText = selection.getContent({format: 'text'});
      data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
      data.target = anchorElm ? dom.getAttrib(anchorElm, 'target') : '';
      data.rel = anchorElm ? dom.getAttrib(anchorElm, 'rel') : '';

      if (selectedElm.nodeName == "IMG") {
        data.text = initialText = " ";
      }

      if(self.linkModal === null){
        self.linkModal = new Modal_(self.$el, {
          html: '<div>' +
            '<div>' +
              '<h1>Select Item</h1>' +
              "<input type='text' class='pat-relateditems' data-pat-relateditems='" +
                JSON.stringify(self.options.relatedItems) + "' />" +
              '<div class="control-group">' +
                '<label class="control-label">Target</label>' +
                '<div class="controls">' +
                  '<select name="target"><option>None</option><option value="_blank">New window</option></select>' +
                '</div>' +
              '</div>' +
              '<input type="submit" class="btn" name="cancel" value="Cancel" />' +
              '<input type="submit" class="btn btn-primary" name="insert" value="Insert" />' +
            '</div>' +
          '</div>',
          templateOptions: {
            content: null,
            buttons: '.btn'
          }
        });
        self.linkModal.on('shown', function(){
          self.linkModal.select = $('input.pat-relateditems', self.linkModal.$modal);
          self.linkModal.button = $('input[name="insert"]', self.linkModal.$modal);
          self.linkModal.button.click(function(e){
            var href = 'resolveuid/' + self.linkModal.select.val();
            e.preventDefault();
            if (data.text !== initialText) {
              if (anchorElm) {
                editor.focus();
                anchorElm.innerHTML = data.text;

                dom.setAttribs(anchorElm, {
                  href: href,
                  target: data.target ? data.target : null,
                  rel: data.rel ? data.rel : null
                });

                selection.select(anchorElm);
              } else {
                editor.insertContent(dom.createHTML('a', {
                  href: href,
                  target: data.target ? data.target : null,
                  rel: data.rel ? data.rel : null
                }, data.text));
              }
            } else {
              editor.execCommand('mceInsertLink', false, {
                href: href,
                target: data.target,
                rel: data.rel ? data.rel : null
              });
            }

            self.linkModal.hide();
          });
          $('input[name="cancel"]', self.linkModal.$modal).click(function(e){
            e.preventDefault();
            self.linkModal.hide();
          });
        });
      }
      self.linkModal.show();
    },
    init: function() {
      var self = this;
      self.linkModal = null;
      // tiny needs an id in order to initialize. Creat it if not set.
      var id = self.$el.attr('id');
      if(id === undefined){
        id = 'tiny' + (Math.floor((1 + Math.random()) * 0x10000)
          .toString(16).substring(1));
        self.$el.attr('id', id);
      }
      var tinyOptions = self.options.tiny;
      tinyOptions.selector = '#' + id;
      tinyOptions.openLink = function(){
        self.openLink.apply(self, []);
      };
      tinymce.init(tinyOptions);
      self.tiny = tinymce.get(id);
    }
  });

  return TinyMCE;

});

'use strict';

var path = require('path');

module.exports = {
  name: 'ember-list-view',
  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },
  included: function(app) {
    this._super.included(app);

    var options = {
      exports: {
        'list-view': [
          'default',
          'ListView',
          'ListViewHelper',
          'ListItemView',
          'VirtualListView',
          'ReusableListItemView'
        ]
      }
    };

    this.app.import(app.bowerDirectory + '/ember-list-view/', options);
  }
};

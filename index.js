var path = require('path');

module.exports = {
  name: 'list-view',
  included: function (app) {
    this._super.included(app);

    app.import('vendor/list-view.amd.js', {
      exports: {
        'list-view/main': ['default'],
        'list-view/helper': ['default'],
        'list-view/list_item_view': ['default'],
        'list-view/list_item_view_mixin': ['default'],
        'list-view/list_view': ['default'],
        'list-view/list_view_helper': ['default'],
        'list-view/list_view_mixin': ['default']
      }
    });

  },
  treeForVendor: function () {
    var dist = this._unwatchedTreeGenerator(path.join(__dirname, 'dist'));
    return this.pickFiles(dist, {
      srcDir: '/',
      files: ['list-view.amd.js'],
      destDir: '/'
    });
  }
};
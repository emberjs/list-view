/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-list-view',
  treeForVendor: function() {

    if(!this.isDevelopingAddon()) {
      return;
    }


    var klassy = new this.Funnel('bower_components', {
      srcDir: '/klassy/lib',
      files: ['klassy.js'],
      destDir: '/'
    });

    var emberTestHelpers = new this.Funnel('bower_components', {
      srcDir: '/ember-test-helpers/lib',
      include: [/.js$/],
      destDir: '/'
    });

    var es6EmberTestHelpers = new this.transpileModules(this.mergeTrees([klassy, emberTestHelpers]), {
      esperantoOptions: {
        _evilES3SafeReExports: true,
        strict: true
      }
    });

    var emberTestHelpersAMD = this.concatFiles(es6EmberTestHelpers, {
      inputFiles: ['**/*.js'],
      outputFile: '/ember-test-helpers.amd.js'
    });

    var qunitModule = new this.Funnel('bower_components', {
      srcDir: '/ember-qunit-source/lib/ember-qunit',
      include: [/qunit-module.js$/],
      destDir: '/'
    });

    var es6QunitModule = new this.transpileModules(this.mergeTrees([klassy, qunitModule]), {
      esperantoOptions: {
        _evilES3SafeReExports: true,
        strict: true
      }
    });

    var qunitModuleAMD = this.concatFiles(es6QunitModule, {
      inputFiles: ['**/*.js'],
      outputFile: '/ember-qunit-module.amd.js'
    });

    return this.mergeTrees(['vendor', emberTestHelpersAMD, qunitModuleAMD]);
  }
};

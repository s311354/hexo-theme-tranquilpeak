module.exports = function(grunt) {
  var pipeline = require('../pipeline');
  var util = require('util');
  grunt.config.set('sails-linker', {
    devJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileRef: function(filepath) {
          var tmpl = '<script defer src="/%s"></script>';
          return util.format(tmpl, filepath);
        },
        appRoot: 'source/'
      },
      files: {
        'layout/_partial/script.ejs': pipeline.tranquilpeakJsFilesToInject
      }
    },
    devCss: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<%- css(\'%s\') EJS_ENDTAG',
        appRoot: 'source/'
      },
      files: {
        'layout/_partial/head.ejs': pipeline.tranquilpeakCssFilesToInject
      }
    },
    prodJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<%- js(\'%s\') EJS_ENDTAG',
        appRoot: 'source/'
      },
      files: {
        'layout/_partial/script.ejs': 'source/assets/js/*.min.js'
      }
    },
    prodCss: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<%- css(\'%s\') EJS_ENDTAG',
        appRoot: 'source/'
      },
      files: {
        'layout/_partial/head.ejs': 'source/assets/css/*.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-sails-linker');
};

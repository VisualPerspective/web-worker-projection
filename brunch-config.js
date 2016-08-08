fs = require('fs')

module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app|webworker)/,
      },
      entryPoints: {
        'app/webworker.js': 'webworker.js',
        'app/initialize.js': 'app.js'
      },
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {
      presets: ['es2015'],
      plugins: [
        'transform-object-assign',
        'transform-es2015-for-of'
      ]
    }
  },

  hooks: {
    onCompile: function (generated) {
      for (file of generated) {
        if (file.path == 'public/webworker.js') {
          contents = fs.readFileSync(file.path, 'UTF-8')

          contents = 'var window = self;\n\n' +
            contents +
            '\n\nrequire("webworker.js");'

          fs.writeFileSync(file.path, contents)
        }
      }
    }
  },

  server: {
    hostname: '0.0.0.0'
  }
};

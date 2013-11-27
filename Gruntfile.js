"use strict";

module.exports = function (grunt) {
  // load all grunt tasks
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks)
  var mountFolder = function (connect, dir) {
    return connect.static(require("path").resolve(dir))
  }

  var config = {

    // Watch tasks
    // ------------------
    watch: {
      assets: {
        files: [
          "assets/styles/**/*.css"
        ],
          tasks: ["copy:dev"]
      }
    },

    // Server tasks
    // ------------------
    connect: {
      options: {
        port: 9000,
          // change this to '0.0.0.0' to access the server from outside
          hostname: "localhost"
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, "tmp")
            ]
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, "dist")
            ]
          }
        }
      }
    },

    // Dist
    // ------------------
    clean: {
      dist: {
        files: [{
                  dot: true,
                  src: [
                    "tmp",
                    "dist/*",
                    "!dist/.git*"
                  ]
                }]
      },
      server: "tmp"
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      all: [
        "Gruntfile.js",
        "server/**/*.js",
        "client/**/*.js",
        "models/**/*.js",
        "storage/**/*.js",
        "test/**/*.js"
      ]
    }
  }

  // if you'd like to modify the default grunt config, do it here
  // for example:
  // config.less = { ... }

  // concurrent tasks. customize this instead of the multitasks for faster
  // builds
  config.concurrent = {
    server: [
      "copy:dev"
    ],
    test: [
    ],
    dist: [
      "copy:dist"
    ]
  }

  grunt.initConfig(config)

  grunt.renameTask("regarde", "watch")

  grunt.registerTask("server", function(target){
    return (target === "dist") ?
      grunt.task.run(["build", "open", "connect:dist:keepalive"])
    :
      grunt.task.run([
        "clean:server",
        "concurrent:server",
        "open",
        "watch"
      ])
  })

  grunt.registerTask("test", [
    "clean:server",
    "concurrent:test",
    "copy:dev",
    "copy:test",
    "connect:test"
  ])

  grunt.registerTask("test-server", [
    "clean:server",
    "concurrent:test",
    "copy:dev",
    "copy:test",
    "connect:test",
    "open",
    "watch"
  ])

  grunt.registerTask("build", [
    "clean:dist",
    "concurrent:dist",
    "copy:dev"
  ])

  grunt.registerTask("default", [
    "jshint",
    "test",
    "build"
  ])
}

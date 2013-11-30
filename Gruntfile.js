module.exports = function(grunt) {
  //basic config
  grunt.initConfig({
    mochaTest: {
      admin: {
        options: {
          require: "./app/test",
          reporter: "list",
          ui: "bdd"
        },
        src: [
          "util/**/*.test.js",
          "app/**/*.test.js"
        ]
      }
    },
    watch: {
      "test": {
        files: ["*.js"],
        tasks: ["test"]
      }
    },
    projectUpdate: {
      projectUpdate: {
        options: {
          commands: [
            {cmd: "npm", args: ["install"]},
            {cmd: "npm", args: ["update"]},
            {cmd: "npm", args: ["prune"]}
          ]
        }
      }
    }
  })
  //load modules
  grunt.loadNpmTasks("grunt-mocha-test")
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-project-update")

  //server tasks
  grunt.registerTask("test",["mochaTest"])
  grunt.registerTask("update",["projectUpdate"])
  grunt.registerTask("default",["watch"])

}

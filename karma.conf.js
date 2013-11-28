// Karma configuration
module.exports = function(config){
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      "**/*.spec.js",
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["PhantomJS"],
    captureTimeout: 60000,
    singleRun: false
  })
}

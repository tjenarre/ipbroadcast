module.exports = function(grunt) {

  grunt.initConfig({
    run: {
      tool: {
        //exec: 'standard src/**/*.js --verbose | snazzy && npm run start'
        exec: 'standard src/**/*.js --verbose | snazzy && node --inspect-brk src/index.js'
      }
    },
    watch: {
      options: {
        atBegin: true
      },
      default: {
        files: ['src/**/*.js'],
        tasks: ['run:tool']
      }
    }
  })
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['watch']);

};

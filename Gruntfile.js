module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      files: [
          '../rubysound/public/rubysound_app/main.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_controllers.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_factories.js.coffee'],
      tasks: ['coffee']
    },
    coffee: {
      compile: {
        files: {
          '../rubysound/public/rubysound_assets/js/coffcompile.js': [
          '../rubysound/public/rubysound_app/main.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_key.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_controllers.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_factories.js.coffee',]
        }
      }
    }
  });
  // Default task.
  grunt.registerTask('default', 'coffee');

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

};
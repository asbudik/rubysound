module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      tasks: 'coffee'
    },
    coffee: {
      compile: {
        files: {
          '../rubysound/public/rubysound_assets/js/coffcompile.js': [
          '../rubysound/public/rubysound_app/main.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_controllers.js.coffee',
          '../rubysound/public/rubysound_app/rubysound_factories.js.coffee']
        }
      }
    }
  });
  // Default task.
  grunt.registerTask('default', 'coffee');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');

};
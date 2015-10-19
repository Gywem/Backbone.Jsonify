/*global module:false */
module.exports = function (grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			version: '<%= pkg.version %>',
			base_banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' +
			'\n',
			supermodel_banner: '/*! supermodel.jsonify - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' +
			'\n'
		},		
		// Task configuration.
		bump: {
			options: {
				part: 'patch'
			},
			files: ['package.json', 'component.json']
		},
		clean: {
			base: [
				'lib/<%= pkg.name %>.js', 
				'lib/<%= pkg.name %>.min.js'
			],
			supermodel: [
				'lib/supermodel.jsonify.js', 
				'lib/supermodel.jsonify.min.js'
			]
		},
		preprocess: {
			base: {
				src: 'src/build/base.js',
				dest: 'tmp/<%= pkg.name %>.js'
			},
			supermodel: {
				src: 'src/build/supermodel.js',
				dest: 'tmp/supermodel.jsonify.js'
			}
		},
		template: {
			options: {
				data: {
					version: '<%= pkg.version %>'
				}
			},
			base: {
				src: '<%= preprocess.base.dest %>',
				dest: '<%= preprocess.base.dest %>'
			},
			supermodel: {
				src: '<%= preprocess.supermodel.dest %>',
				dest: '<%= preprocess.supermodel.dest %>'
			}
		},
		concat: {
			options: {
				banner: '<%= meta.base_banner %>',
				stripBanners: true
			},
			base: {
				src: '<%= preprocess.base.dest %>',
				dest: 'lib/<%= pkg.name %>.js'
			},
			supermodel: {
				options: {
					banner: '<%= meta.supermodel_banner %>'
				},
				src: '<%= preprocess.supermodel.dest %>',
				dest: 'lib/supermodel.jsonify.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			base: {
				src: ['<%= concat.base.dest %>']
			},
			supermodel: {
				src: ['<%= concat.supermodel.dest %>']
			},
			baseTest: {
				src: ['test/base/*.js']
			}
		},
		qunit: {
			base: ['test/base/*.html'],
			supermodel: ['test/supermodel/*.html']
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			base: {
				src: '<%= concat.base.dest %>',
				dest: 'lib/<%= pkg.name %>.min.js'
			},
			supermodel: {
				src: '<%= concat.supermodel.dest %>',
				dest: 'lib/supermodel.jsonify.min.js'
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			base: {
				files: ['<%= concat.base.src %>'],
				tasks: ['clean:base', 'concat:base', 'jshint:baseTest', 'jshint:test', 'qunit:base']
			},
			baseTest: {
				files: ['<%= jshint.baseTest.src %>', '<%= qunit.files %>'],
				tasks: ['jshint:baseTest', 'qunit:base']
			}
		}
	});

	// Grunt-Contrib Tasks
	Object.keys(grunt.config('pkg').devDependencies).forEach(function (dep) {
		if (/^grunt\-/i.test(dep)) {
			grunt.loadNpmTasks(dep);
		} // if
	});

	var baseTasks = [
		'clean:base',
		'preprocess:base',
		'template:base',
		'concat:base',
		'jshint:base',
		'qunit:base',
		'uglify:base'
	];

	// Default task.
	grunt.registerTask('default', baseTasks);
	grunt.registerTask('base', baseTasks);

	var supermodelTasks = [
		'clean:supermodel',
		'preprocess:supermodel',
		'template:supermodel',
		'concat:supermodel',
		'jshint:supermodel',
		'qunit:supermodel',
		'uglify:supermodel'
	];

	grunt.registerTask('supermodel', supermodelTasks);
	
	// Test task.
	grunt.registerTask('test', ['qunit']);

};

const gulp = require('gulp');
const rev  = require('gulp-rev-append'); // 给URL自动加上版本号
const browserSync = require('browser-sync').create();
const jshint = require('gulp-jshint');    //jshint检测javascript的语法错误
const size = require('gulp-size');
const notify = require('gulp-notify');
const babel = require('gulp-babel'); 
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');//Minify JavaScript with UglifyJS2.
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const del = require('del')
const proxyMiddleware = require('http-proxy-middleware');

var reload = browserSync.reload;
var url = require('url');
var mockApi = require('./mockApi');
var dist = "dist";
var jsList = [
	'app/**/*.js',
  ];

function jshintTask() {
	return gulp.src(jsList)
		//.pipe(reload({stream: true, once: true}))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		//.pipe(gulp.dest('jshint.log'))
}

function cleanTask() {
	return del([dist + '/**']);
}

function revTask() {
	return gulp.src('index.html')
		.pipe(rev())
		.pipe(gulp.dest(dist + '/'));
}

function htmlTask() {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
	return gulp.src(['app/**/*.html'])
		//.pipe(htmlmin(options))
		.pipe(gulp.dest(dist + '/app/'));	
}

function jsTask() {
	return gulp.src(['app/**/*.js'])
		//.pipe(uglify())
		.pipe(gulp.dest(dist + '/app/'));
}

function bowerTask() {
	return gulp.src(['bower_components/**/*'])
		.pipe(gulp.dest(dist + '/bower_components/'));
}

function staticTask() {
	return gulp.src(['static/**/*'])
		.pipe(gulp.dest(dist + '/static/'));
}

function assetsTask() {
	return gulp.src(['assets/**/*', '!assets/css/*.css', '!assets/js/*.js'])
		.pipe(gulp.dest(dist + '/assets/'));
}

function es6Task() {
	return gulp.src('app/**/*.js')
		//将ES6代码转译为可执行的JS代码
		.pipe(babel({
			"presets": [
			["env", {
				"targets": {
				"browsers": [ "ie > 8", "chrome >= 62" ]
				}      
			}]
			]
		}))
		.pipe(gulp.dest(dist +'/app/'));
}

var cssList = [
	'assets/css/*.css',
	];

function cssTask() {
	return gulp.src(cssList)
		.pipe(autoprefixer({
            overrideBrowserslist: ['last 3 versions', 'Android >= 4.0', 'Firefox > 20', 'iOS >= 7'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        	}))
		.pipe(gulp.dest(dist + '/assets/css/'));
}

var minjsList = [
	'assets/js/*.js'
	];

function minjsTask() {
	return gulp.src(minjsList)
		//.pipe(uglify())
		.pipe(gulp.dest(dist + '/assets/js/'));
}

function sizeTask() {
	const s = size({title: 'build', gzip: false});
	return gulp.src(dist + '/**/*')
		.pipe(s)
		.pipe(notify({
			onLast: true,
			message: () => `Total size ${s.prettySize}`
		}));
}

// 自带MockAPI模拟数据服务
function serverTask() {
    browserSync.init({
		notify: false, // Don't show any notifications in the browser.
		port: 3000,
		open: true,
		server: {
		  baseDir: ['./'],
		  routes: {
			// 'bower_components': 'bower_components',//if bower_components' path is up the tree of app
		  },
		  middleware:
			  function (req, res, next) {
				  var urlObj = url.parse(req.url, true),
					  method = req.method,
					  paramObj = urlObj.query;
				  mockApi(res, urlObj.pathname, req, next);
			  }
		}
	  });
	  // watch for changes
	  gulp.watch([
		'app/**/*.html',
		'app/**/*.css',
		'app/**/*.js',
		'app/public/**/*',
		'data/**/*'
	  ]).on('change', reload);
}

// 独立前端服务
function serveTask() {
    browserSync.init({
		//server: './',
		server: {
			baseDir: './'
		},
		port: 3000,
	});
    // watch for changes
    gulp.watch([
		'app/**/*.html',
		'app/**/*.css',
		'app/**/*.js',
	  ]).on('change', reload);
}

const apiProxy = proxyMiddleware('/api', {
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
		'^/api': 'api',	
    },
    logLevel: 'debug'
});

const staticProxy = proxyMiddleware('/static', {
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
		'^/static': 'static',	
    },
    logLevel: 'debug'
});

// proxy前端服务
function proxyTask() {
    browserSync.init({
		server: {
			baseDir: './'
		},
		port: 3333,
		middleware:[
			apiProxy,staticProxy			
		]
	});
    // watch for changes
    gulp.watch([
		'app/**/*.html',
		'app/**/*.css',
		'app/**/*.js',
	  ]).on('change', reload);
}

// proxy生产测试前端服务
function prodTask() {
    browserSync.init({
		server: {
			baseDir: dist + '/'
		},
		port: 3000,
		middleware:[
			apiProxy,staticProxy			
		]
	});
}
  
exports.jshint = jshintTask; // 代码查错
exports.clean = cleanTask; // 清空构建项目代码
exports.rev = revTask; // 生产主文件，导入的css和js库加入版本hash
exports.html = htmlTask; // 复制并预处理app中的html代码至dist目录
exports.js = jsTask; // 复制并预处理app中的js代码至dist目录
exports.bower = bowerTask; // 复制bower_components至dist目录
exports.assets = assetsTask; // 复制 asseets 至dist目录
exports.es6 = es6Task; 
exports.css = cssTask;
exports.minjs = minjsTask;
exports.static = staticTask;
exports.size = sizeTask; // 统计代码大小及通知项目构建完成
// 构建生产代码
exports.build = gulp.series(jshintTask, cleanTask, bowerTask, assetsTask, staticTask, revTask, htmlTask, jsTask, cssTask, minjsTask, sizeTask);
exports.server = serverTask; // 仅开发前端服务（自带MockAPI模拟数据服务）
exports.serve = serveTask; // 全栈开发前端服务
exports.proxy = proxyTask; // proxy全栈开发前端服务
exports.prod = prodTask; // proxy前端生产服务


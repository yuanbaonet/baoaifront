"use strict"
/*!
 * config
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */ 

// product env config // 生产部署环境配置，采用html5Mode模式，配合nginx反向代理，用户无需了解后端服务器地址
// SERVER_URL = ""
// app.constant('BASE_URL', 'http://www.baoai.co/'); // Front Base URL // 前端基础地址

// gulp serve
// full stack dev env config // 全栈开发环境配置
// var SERVER_URL = "http://localhost:8000";
// app.constant('BASE_URL', 'http://localhost:3000/'); // Front Base URL // 前端基础地址

// gulp server
// only web developer's config // 前端工程师开发环境配置（由gulp提供模拟服务器环境）
var SERVER_URL = "http://localhost:3000";
app.constant('BASE_URL', 'http://localhost:3000/'); // Front Base URL // 前端基础地址

// gulp prod
// gulp proxy
// produce or proxy full stack dev env config // 生产测试或反向代理全栈开发环境配置 
// var SERVER_URL = "";
// app.constant('BASE_URL', 'http://localhost:3000/'); // Front Base URL // 前端基础地址

app.constant('API_URL', SERVER_URL + '/api/'); // Access external service API address // 访问外部服务 API 地址
app.constant('STATIC_URL', SERVER_URL + '/static/uploads/'); // Accessing static resource addresses of external services // 访问外部服务静态资源地址
app.constant('STATIC_QUANT_URL', SERVER_URL + '/static/quant/'); // Accessing static resource addresses of external services // 访问量化回测结果地址
app.constant('STATIC_AI_URL', SERVER_URL + '/static/ai/'); // Accessing static resource addresses of external services // 访问AI图形地址
app.constant('LOCAL_STORAGE', true); // Whether user information is stored locally // 用户信息是否本地存储
app.constant('DEVELOPMENT_ENVIRONMENT', false); // development environment? // 是否开发环境
app.constant('APP_KEY', 'ksdjfiwoeiwo_#@iewo293828iweo12'); // application Encryption Key // 应用加密密钥
app.constant('LANG', 'zh-cn'); // Default Local Language // 默认本地语言
app.constant('LANG_LIST', ['zh-cn', 'en', 'all']); // List of all languages, 'all' needs to be at the end // 所有语言列表, 'all'必须放最后
app.constant('BREADCRUMB_DIVIDER', '&nbsp;/&nbsp;'); // Default breadcrumb divider // 默认面包屑分隔符
app.constant('COLUMN_TYPE', ['Integer', 'SmallInteger', 'BigInteger', 'Float', 'Numeric', 'String', 'Text', 'Text(CKeditor)', 'Unicode', 'Boolean', 'Date', 'Time', 'DateTime', 'Interval', 'Enum', 'Enum(String)', 'Enum(MultiString)', 'PickleType', 'LargeBinary', 'Integer(Select)', 'Integer(Tree)', 'String(Select)', 'Text(MultiSelect)', 'Text(MultiTree)', 'OneToOne(ForeignKey)', 'ManyToOne(ForeignKey)', 'ManyToMany']);
app.constant('IMAGE_URL_DOWNLOAD_EXCLUDE', ['www.baoai.co', 'localhost']); // CKEditor复制网页内容时，根据内容中img的src自动下载图片，该列表中的地址将被排除 
app.constant('BAOAI_THEME', ['default', 'tech']);
app.constant('BAOAI_TEMPLATE', ['web', 'web_index', 'web_article', 'web_block', 'web_book', 'web_books', 'web_category', 'web_search']);
app.constant('WEB_BREADCRUMB', false); // web breadcrumb close // false 网站面包屑关闭 true 开放
var MENU = ''; // Dynamic generation of system tree menu based on resources table // 根据资源表，动态生成系统树形菜单
var NAV_MENU = ''; // Navigation Menu // 导航菜单

// register 添加注册机制, 按需加载用
app.config(function ($provide, $compileProvider, $controllerProvider, $filterProvider) {
  app.controller = $controllerProvider.register;
  app.directive = $compileProvider.directive;
  app.filter = $filterProvider.register;
  app.factory = $provide.factory;
  app.service = $provide.service;
  app.constant = $provide.constant;
});

/*
* URL地址带# 问题：
* 开发环境带#号 html5Mode=false, 生产模式配合nginx去掉#号， html5Mode=true,
* By default, Angularjs does not start HTML5 mode, and the URL will include a # number to distinguish the path managed by Angular JS from that managed by Web Server.
* The Angular JS framework provides an HTML5-mode routing that removes # directly. Just set up $locationProvider. html5Mode (true).
* Solution reference: http://blog.fens.me/angularjs-url/
* 
* Angularjs默认的情况，是不启动HTML5模式的，URL中会包括一个#号，用来区别是AngularJS管理的路径还是WebServer管理的路径。
* AngularJS框架提供了一种HTML5模式的路由，可以直接去掉#号。通过设置$locationProvider.html5Mode(true)就行了。
* 解决方案参考： http://blog.fens.me/angularjs-url/
*/
app.config(function ($locationProvider) {
  $locationProvider.hashPrefix('');
  $locationProvider.html5Mode(false);
});

// bug: Possibly unhandled rejection
// issue: https://github.com/angular-ui/ui-router/issues/2889
app.config(function ($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
});

app.config(function ($httpProvider) {
  //initialize get if not there
  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.get = {};    
  }    
  // Answer edited to include suggestions from comments
  // because previous version of code introduced browser-related errors
  // disable IE ajax request caching // 解决IE ajax请求缓存问题
  $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
  // extra
  $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
  $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
  $httpProvider.interceptors.push(function ($q, SecurityService, API_URL, LOCAL_STORAGE, $rootScope) {
    return {
      'request': function request(config) {
        var token = $rootScope.user.token;
        if (!$.emp(token)) {
          config.headers['authtoken'] = token;
        }
        return config;
      },

      'requestError': function requestError(rejection) {
        return $q.reject(rejection);
      },

      'response': function response(_response) {
        return _response;
      },

      'responseError': function responseError(rejection) {
        if (rejection.status == 403 && rejection.data.message == 'TokenError') {
          BootstrapDialog.confirm({
            title: $rootScope.t("Token"),
            message: rejection.data.data.message,
            type: BootstrapDialog.TYPE_DANGER, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            closeByBackdrop: false,
            closeByKeyboard: false,
            btnCancelLabel: $rootScope.t("Get New Token Again"), // <-- Default value is 'Cancel',
            btnOKLabel: $rootScope.t("Re-login"), // <-- Default value is 'OK',
            btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
            callback: function(result) {
                // result will be true if button was click, while it will be false if users close the dialog directly.
                if(result) {
                  SecurityService.logout(); 
                }else {
                  $.ajax({
                    type: "POST",
                    url: API_URL + "admin/rftoken",
                    data: JSON.stringify({
                      "username": $rootScope.user.username,
                      "rftoken": $rootScope.user.rftoken
                    }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function success(data) {
                      toastr.success($rootScope.t("Token Update Successful"), $rootScope.t("Token"))    
                      $rootScope.user.token = data.data.token;
                      var session_remember = localStorage.getItem("session_remember");
                      if (session_remember == "true") {
                        localStorage.setItem("session_token", data.data.token);
                      } else {
                        if (LOCAL_STORAGE === true) {
                          localStorage.setItem("session_token", data.data.token);
                        }
                      }
                    },
                    error: function error(data) {
                      toastr.error(data.message, $rootScope.t("Token"))    
                    }
                  }); 
                }
            }
          });          
        } else if (rejection.status == 403 && rejection.data.message == 'NoAccess') {
          toastr.error($rootScope.t("No Access"), $rootScope.t("RBAC")) 
        }
        return $q.reject(rejection);
      }
    };
  });
});
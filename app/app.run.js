'use strict';
/*!
 * run
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.run(function ($rootScope, $location, $state, $stateParams, STATIC_URL, STATIC_QUANT_URL, LANG, LANG_LIST, BAOAI_THEME, BAOAI_TEMPLATE, I18nService, LOCAL_STORAGE, WEB_BREADCRUMB) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.STATIC_URL = STATIC_URL;
  $rootScope.STATIC_QUANT_URL = STATIC_QUANT_URL;
  $rootScope.lang = LANG;
  $rootScope.lang_list_all = LANG_LIST; // contain all, Used to configure settings
  $rootScope.lang_list = LANG_LIST.slice(0, -1); // exclude all, Used for language switching
  $rootScope.i18n = {}; // Internationalized keys list
  $rootScope.user = {}; // auth account object
  $rootScope.menu = MENU; // System tree menu html
  $rootScope.nav_menu = NAV_MENU;
  $rootScope.BAOAI_THEME = BAOAI_THEME;
  $rootScope.BAOAI_TEMPLATE = BAOAI_TEMPLATE;
  $rootScope.local_storage = LOCAL_STORAGE;
  $rootScope.web_breadcrumb = WEB_BREADCRUMB;

  /* 
   *  Internationalized Init
   */
  // 1. Get Lang defaults from local storage, defined by LANG by default // 从本地存储中获取lang缺省值，默认由 LANG 定义
  if (!$.emp(localStorage.getItem('session_lang'))) {
    $rootScope.lang = localStorage.getItem('session_lang');
  }

  // 2. init Internationalized key list
  I18nService.init();

  // 3. Language Switch Global Function // 语言转换全局函数
  $rootScope.t = function (key) {
    if ($.emp(key)) {
      return key;
    }   
    var lowerCaseKey = key.toLowerCase();
    var value = $rootScope.i18n[lowerCaseKey];
    if ($.emp(value)) {
      value = key;
    }
    return value;
  };

  /* 
   *  User Init
   */
  // 1. remember is checked
  // 2. 全局常量 LOCAL_STORAGE 设置为true 用户信息本地存储
  var session_remember = localStorage.getItem("session_remember");
  if (session_remember == "true") {
    $rootScope.user = {
      username: localStorage.getItem('session_username'),
      rftoken: localStorage.getItem('session_rftoken'),
      token: localStorage.getItem('session_token')
    };
  } else {
    if (LOCAL_STORAGE === true) {
      $rootScope.user = {
        rftoken: localStorage.getItem('session_rftoken'),
        token: localStorage.getItem('session_token')
      };
    }
  }

  // 2. avatar , default = assets/img/avatar.png
  $rootScope.user.real_avatar = 'assets/img/avatar.png';
  if (!$.emp($rootScope.user.avatar)) {
    if ($rootScope.user.avatar != 'assets/img/avatar.png') {
      $rootScope.user.real_avatar = STATIC_URL + $rootScope.user.avatar;
    }
  }

  // 3. name, if nickname exist, name is nickname , else is username
  if ($.emp($rootScope.user.nickname)) $rootScope.user.name = $rootScope.user.username;else {
    $rootScope.user.name = $rootScope.user.nickname;
  }

  /* 
   *  Location Global Function
   */
  $rootScope.getLocation = function(){    
    return $location.url()
  }

  $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
    if (CKEDITOR.instances.body) CKEDITOR.instances.body.destroy();
    // This state can be prevented from completing // 可以阻止这一状态完成
    //evt.preventDefault(); 
    var token = $rootScope.user.token;
    if ($.emp(token)){
      if (toState.name == 'login') {
        $location.url('login');
      }
    } else {
      if (toState.name === "login" && fromState.name === "login") {
        // The login route has been diverted so no redirection is required // 已经转向登录路由因此无需重定向
        evt.preventDefault();
      } else {
      }
    }
  });

  $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
    $rootScope.previousState = from;
    $rootScope.previousStateParams = fromParams;
    $rootScope.currentState = to;
    $rootScope.currentStateParams = toParams;
  });
});
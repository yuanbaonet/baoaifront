/*!
 * Login Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('loginCtrl',function($scope, $rootScope, $window, ApiService, SecurityService, APP_KEY, RouteService, I18nService){
  "use strict";
  console.log('loginCtrl')
  $rootScope.user = {}
  $scope.reg = {}
  $scope.forgetpass = {}
  $scope.captcha = ''

  /* 
   *  remember , and not remember data initialization 
   *  记住功能，和无记住功能数据初始化
   */
  // There is a local token, no need to log in, go directly to the console, or initialize (session_remember/session_username/session_password) // 本地有令牌，无须登录，直接进入控制台，否则初始化(session_remember / session_username  / session_password)
  if(localStorage.getItem('session_token'))
    $rootScope.$state.go('app.main')  
  var remember = localStorage.getItem('session_remember')
  var username = localStorage.getItem("session_username")
  var password = localStorage.getItem("session_password")
  // Password Encryption Save // 密码加密保存
  if(!$.emp(password)){
    password = CryptoJS.AES.decrypt(password,APP_KEY).toString(CryptoJS.enc.Utf8)
  }
  // With remember feature, synchronize three local saved data to $rootScope.user // 有记住功能，将本地保存三个数据同步至$rootScope.user
  if(remember=='true'){
    $rootScope.user.remember = true
    $rootScope.user.username = username        
    $rootScope.user.password = password
  }
  // Synchronize Checkboxes and Local Save Items // 同步记住复选框和本地保存项
  $rootScope.$watch('user.remember',function(){
    localStorage.setItem("session_remember", $rootScope.user.remember)
  })  
  // Dynamic routing completes events and jumps to the console // 动态路由完成事件，跳转至控制台
  $rootScope.$on('routeComplete',function(event, data){
    console.log('routeComplete is received')
    $rootScope.$state.go('app.main')
  })

  // next captcha // 下一个验证码
  $scope.getCaptcha = function () {
    ApiService.getCaptcha().then(function successCallback(response) { 
      $scope.captcha = response.data.data
    }).catch(function errorCallback(error) {

    })
  }
  /* 
   *  Language internationalization // 语言国际化
   */
  // choiced language // 当前语言
  $scope.isActive = function (curr_lang) {
    return localStorage.getItem("session_lang") === curr_lang
  }

  if($.emp($rootScope.i18n)){
    I18nService.init()
  }

  // Registration protocol internationalization, asynchrony, may not get the value correctly // 注册协议国际化，异步，可能未正确获取值
  $scope.agreement = $rootScope.t('agreement')

  // Internationalized Data List Loading Completes Events and Re-internationalizes Protocols // 国际化数据列表加载完成事件，重新对协议国际化
  $rootScope.$on('i18nComplete',function(event, data){
    // i18nComplete is received
    $scope.agreement = $rootScope.t('agreement')
  })

  // lang switch // 语言切换
  $scope.langSwitch = function (lang) {
    $rootScope.lang = lang
    localStorage.setItem("session_lang", $rootScope.lang)
    var params = {}
    params.module = 'configs'
    params.section = 'i18n'
    params.lang = $rootScope.lang
    ApiService.getKeys(params).then(function successCallback(response) { 
      for(var i=0; i< response.data.length; i++){
        var keys = response.data[i].keys
        var value = response.data[i].value
        $rootScope.i18n[keys] = value
      }
      $window.location.reload();
    }) 
  }

  $(function(){
    var loginFOrmObj = $('#login').validator({
      custom: {
        length: function($el) {
          var matchValue = $el.data("length") // foo
          var matchValueList = matchValue.split(',')
          if ($el.val().length < parseInt(matchValueList[0]) || $el.val().length > parseInt(matchValueList[1])) {
            return $rootScope.t("Length") + " [" + matchValueList[0] + "-" + matchValueList[1] + "]"
          }
        }
      }
    })
    
    var registerFormObj = $('#register').validator({

    })
    
    var forgetpassFormObj = $('#forgetpass').validator({

    })

    loginFOrmObj.on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        return false
      } else {
        e.stopPropagation()
        if($.emp($rootScope.user.username)){
          toastr.error($rootScope.t('Required'), $rootScope.t("Login")) 
          return false
        }
        var session_remember = localStorage.getItem("session_remember")
        if(session_remember == "true"){
          localStorage.setItem("session_username", $rootScope.user.username)
          localStorage.setItem("session_password", CryptoJS.AES.encrypt($rootScope.user.password, APP_KEY))
        }
        $('#login-button').button('loading')
        ApiService.login($rootScope.user).then(function successCallback(response) {
            if(response.data.status == 200000){
              // init $rootScope.user
              // remember feature , init local storage //记住功能， 初始化本地数据项
              SecurityService.login(response.data.data)
              // Set the route for the corresponding permissions of the logged-in user and load it into effect // 设置登录用户对应权限的路由，并加载生效
              // before login, route completed by app.route.config.js // 登录前权限路由，由 app.route.config.js完成
              RouteService.setRoute()
            }else{
                toastr.warning($rootScope.t(response.data.message), $rootScope.t("Login")) 
                $scope.logindisabled=false
                $('#login-button').button('reset')
            }
        }).catch(function errorCallback(error) {
            $('#login-button').button('reset');
            var message = $rootScope.t("Internal Server Error")
            toastr.warning(message, $rootScope.t("Login")) 
        })
        return false
      }
    })

    // register submit
    registerFormObj.on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        return false
      } else {        
        e.stopPropagation()
        var params = {}
        params.username = $scope.reg.username
        params.email = $scope.reg.email
        params.password_hash = $scope.reg.password
        params.avatar = $scope.reg.captcha 
        ApiService.register(params).then(function successCallback(response) { 
          toastr.success("Account: "+ $('#reg-username').val(), $rootScope.t("Register Success")) 
          $('#register')[0].reset()
          $(".register-box").hide()
          $(".forgot-box").hide()
          $(".login-box").show()
          return false;
       }).catch(function errorCallback(error) {
         var message = $rootScope.t("Internal Server Error")
         if (error.status == 500){
           message = error.data.message
         }
         toastr.error(message, $rootScope.t("Register")) 
         return false
       })
      }
    })

    // find password submit
    forgetpassFormObj.on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        return false
      } else {
        e.stopPropagation()
        var params = {}
        params.email = $scope.forgetpass.email
        ApiService.find_pass(params).then(function successCallback(response) {
          if ( response.data.status == 200000 ) {
            toastr.success("Email: "+ $scope.forgetpass.email, $rootScope.t("Password Retrieved Successfully")) 
          }else{
            var message = $rootScope.t("Internal Server Error")
            toastr.error(message, $rootScope.t("Password Retrieval Failed")) 
          }
          $('#forgetpass')[0].reset()
          $(".register-box").hide()
          $(".forgot-box").hide()
          $(".login-box").show()
       }).catch(function errorCallback(error) {
          toastr.error(error, $rootScope.t("Password Retrieval Failed")) 
          return false
       })
      }
    })
})


/* 
  *  Switch between three form blocks and display only one block at the same time
  *  三个表单区块之间切换，同时仅显示一个区块
  */
$(".register-box").hide()
$(".forgot-box").hide()

$("#create-user").click(function(event) {
      event.preventDefault()
      $(".login-box").hide()
      $(".register-box").show()
      $(".forgot-box").hide()
      ApiService.getCaptcha().then(function successCallback(response) { 
        $scope.captcha = response.data.data
      }).catch(function errorCallback(error) {
    
      })
})

$("#user-login").click(function(event) {
      event.preventDefault()
      $(".register-box").hide()
      $(".forgot-box").hide()
      $(".login-box").show()
})

$("#forgot-login").click(function(event) {
      event.preventDefault()
      $(".register-box").hide()
      $(".forgot-box").show()
      $(".login-box").hide()
})

$("#forgot-box-user-login").click(function(event) {
      event.preventDefault()
      $(".register-box").hide()
      $(".forgot-box").hide()
      $(".login-box").show()
})
})

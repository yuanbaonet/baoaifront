"use strict";
/*!
 * Layout Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('LayoutService', function($http, API_URL) {
  // 查询
  this.getRoutes = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "resources/routes",
      async: true,
      params: params,
    })
  }

  // view list 
  this.getNoticeList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "notice_content/listbyuid",
      async: true,
      params: params.data,
    })
  }

  this.getValue = function(params) {
    return $http({
      url: API_URL + "configs/value",      
      method: 'POST', 
      data: params,
    })
  }

})

/*!
 * Layout Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('layoutCtrl',   
      function ($scope, $rootScope, $timeout, $location, $ocLazyLoad, $window, SecurityService, ApiService, I18nService, LayoutService, router, $sce, $compile, STATIC_URL, BREADCRUMB_DIVIDER) {
        console.log("layoutCtrl...")
        //$(window).trigger("resize"); 

        $rootScope.hide_header = false
        $rootScope.hide_main_sidebar = false
        $rootScope.notices_total = 0
        $rootScope.notices = []
        $rootScope._search_key = ''
        
        // i18n init
        if($.emp($rootScope.i18n)){
          I18nService.init()
        }

        // // module i18n init
        // $scope.i18nm = [] // module internationalization key value list 
        // I18nService.i18nm('resources', $scope.i18nm)  

        // // Module Language Switch Module Function // 语言转换模块函数
        // $scope.tm = function(key){
        //   lowerCaseKey = key.toLowerCase()
        //   value = $scope.i18nm[lowerCaseKey]
        //   if($.emp(value)){
        //     value = key
        //   }
        //   return value
        // }

        // get user info with token
        ApiService.getUserByToken().then(function successCallback(response) {
          $rootScope.user.nickname = response.data.nickname
          $rootScope.user.avatar = response.data.avatar
          $rootScope.user.uid = response.data.id
          $rootScope.user.username = response.data.username
          $rootScope.user.email = response.data.email
          $rootScope.user.title = response.data.title
          if(!$.emp($rootScope.user.avatar)){
            if($rootScope.user.avatar != 'assets/img/avatar.png'){
              $rootScope.user.real_avatar = STATIC_URL + $rootScope.user.avatar
            }
          }
          if($.emp($rootScope.user.nickname))
            $rootScope.user.name = $rootScope.user.username
          else{
            $rootScope.user.name = $rootScope.user.nickname
          } 
        }) 
 

        // current language // 当前语言
        $scope.isActive = function (curr_lang) {
          return localStorage.getItem("session_lang") === curr_lang
        }

        // language switch // 语言切换
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

        // fullscreen event // 全屏按钮
        $scope.fullScreen = function () {
            var viewFullScreen = document.getElementById("view-fullscreen");
            if (viewFullScreen) {
                viewFullScreen.addEventListener("click", function () {
                    var docElm = document.documentElement;
                    if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                    }
                    else if (docElm.msRequestFullscreen) {
                        docElm = document.body; //overwrite the element (for IE)
                        docElm.msRequestFullscreen();
                    }
                    else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                    }
                    else if (docElm.webkitRequestFullScreen) {
                        docElm.webkitRequestFullScreen();
                    }
                }, false);
            }
            $('#view-fullscreen').hide()
            $('#cancel-fullscreen').show()
        }

        // fullscreen exit // 全屏退出按钮
        $scope.exitScreen = function () {
            var cancelFullScreen = document.getElementById("cancel-fullscreen");
            $('#cancel-fullscreen').hide()
            $('#view-fullscreen').show()
            if (cancelFullScreen) {
                cancelFullScreen.addEventListener("click", function () {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                    else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                    else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                }, false);
            }
        }

        // logout event
        $scope.logout = function(){
          SecurityService.logout()     
        }

        $scope.demopush = function($event){
          $('.sidebar-toggle').pushMenu('toggle')
        }

        $scope.controlSidebar = function($event){
          $('[data-toggle="control-sidebar"]').controlSidebar('toggle')
        }

        $ocLazyLoad.load({
          serie:true,
          cache: false,
          files:[
            "app/module/layout/layout.init.js",
          ]
        })

        // breadcrumb and remark // 面包屑和模块注释
        $scope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
          $scope.currentState = to
          $scope.currentStateParams = toParams
          if($scope.currentState.remark == 'null'){
            $scope.remark = "";
          }else{
            $scope.remark = $scope.currentState.remark;
          }         
          $scope.breadcrumb = "";
          if(!$.emp($scope.currentState.breadcrumb)){
            var breadcrumbtemp = angular.copy($scope.currentState.breadcrumb);
            var n=breadcrumbtemp.split("*");
            for(var i=0;i<n.length;i++){
              var temp = $rootScope.t(n[i]);
              n[i] = "{{t('" + temp + "')}}";
            }
            breadcrumbtemp = n.join(BREADCRUMB_DIVIDER);
            $scope.breadcrumb = breadcrumbtemp;
          }
        })

        // Get Notice
        var params = {}
        params.data = {}
        params.data.lang = $rootScope.lang
        params.data.limit = 5
        params.data.offset = 0
        params.data.order = 'asc'
        params.data.search = 'status=1'
        LayoutService.getNoticeList(params).then(function successCallback(response) {
          var notices_pager = response.data
          $rootScope.notices_total = notices_pager.total
          $rootScope.notices = notices_pager.rows
        }).catch(function errorCallback(error) {
  
        })

        // Check Update # 检查更新
        $scope.checkupdate = function(){
          var params = {}
          params.module = 'configs'
          params.section = 'i18n'
          params.lang = 'all'
          params.keys = 'baoai.version'
          LayoutService.getValue(params).then(function successCallback(response) { 
            var curr_version = $rootScope.t('baoai.version')
            var last_version = response.data.value
            var message = $rootScope.t("Current Version") + ": " + curr_version + "<br>" + $rootScope.t("Lastest Version") + ": " + last_version
            BootstrapDialog.alert({
              title: $rootScope.t("Version"),
              message: message,
              type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
              closable: true, // <-- Default value is false
              draggable: true, // <-- Default value is false
              closeByBackdrop: false,
              closeByKeyboard: false,
              buttonLabel: $rootScope.t("OK"), // <-- Default value is 'OK',
              callback: function(result) {
                  // result will be true if button was click, while it will be false if users close the dialog directly.                  
              }
            });
          }) 
        }

})   
    
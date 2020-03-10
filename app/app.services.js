"use strict";
/*!
 * services
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('SecurityService', function ($rootScope, $location, STATIC_URL) {
  this.login = function (response) {
    // 记住 被勾选， 把token和rftoken保存本地，存在crsf攻击
    var session_remember = localStorage.getItem("session_remember");
    if (session_remember == "true") {
      localStorage.setItem("session_username", response.username);
      localStorage.setItem("session_token", response.token);
      localStorage.setItem("session_rftoken", response.rftoken);
    } else {
      if ($rootScope.local_storage === true) {
        localStorage.setItem("session_token", response.token);
        localStorage.setItem("session_rftoken", response.rftoken);
      }
    }
    $rootScope.user.username = response.username;
    $rootScope.user.token = response.token;
    $rootScope.user.rftoken = response.rftoken;
    $rootScope.user.avatar = response.avatar;
    $rootScope.user.uid = response.id;
    $rootScope.user.nickname = response.nickname;
    $rootScope.user.title = response.title;
    $rootScope.user.real_avatar = 'assets/img/avatar.png';
    if (!$.emp($rootScope.user.avatar)) {
      if ($rootScope.user.avatar != 'assets/img/avatar.png') {
        $rootScope.user.real_avatar = STATIC_URL + $rootScope.user.avatar;
      }
    }
    if ($.emp(response.nickname)) $rootScope.user.name = response.username;else {
      $rootScope.user.name = response.nickname;
    }
  };

  this.logout = function () {
    var session_remember = localStorage.getItem("session_remember");
    if (session_remember == "undefined" || session_remember == "false") {
      localStorage.setItem("session_username", "");
      localStorage.setItem("session_token", "");
      localStorage.setItem("session_rftoken", "");
      localStorage.setItem("session_password", "");
    } else {
      localStorage.setItem("session_token", "");
      localStorage.setItem("session_rftoken", "");
    }
    $rootScope.user.username = "";
    $rootScope.user.token = "";
    $rootScope.user.rftoken = "";
    $rootScope.user.avatar = "";
    $rootScope.user.uid = "";
    $rootScope.user.nickname = "";
    $rootScope.user.title = "";
    $rootScope.user.name = "";
    $rootScope.user.real_avatar = "";
    $rootScope.$state.go("login");
  };
});

app.service('ApiService', function ($http, API_URL, $rootScope) {
  // 由刷新令牌获取新令牌
  this.getNewToken = function () {
    return $http({
      method: "POST",
      url: API_URL + "admin/rftoken",
      data: {
        username: $rootScope.user.username,
        rftoken: $rootScope.user.rftoken
      }
    });
  };

  // 登录
  this.login = function (user) {
    console.log('api_url:', API_URL);
    return $http({
      method: "POST",
      url: API_URL + "admin/login",
      data: {
        username: user.username,
        password: user.password
      }
    });
  };

  // User Routes // 查询用户路由
  this.getRoutes = function () {
    return $http({
      method: "GET",
      url: API_URL + "resources/routes",
      params: {}
    });
  };

  // Register
  // 注册
  this.register = function (params) {
    return $http({
      url: API_URL + 'admin/reg',
      method: 'POST',
      data: params
    });
  };

  // get captcha
  // 获取验证码
  this.getCaptcha = function () {
    return $http({
      url: API_URL + 'admin/captcha',
      method: 'GET',
      params: {}
    });
  };

  // Retrieve password
  // 找回口令
  this.find_pass = function (params) {
    return $http({
      url: API_URL + 'admin/find_pass',
      method: 'POST',
      data: params
    });
  };

  // Get Lang Key Value List
  // 按语言获取配置表中的键值列表
  this.getKeys = function (params) {
    return $http({
      url: API_URL + 'configs/keys',
      async: false,
      method: 'POST',
      data: params
    });
  };

  // Get user info by token
  // 由令牌获取用户信息
  this.getUserByToken = function () {
    return $http({
      method: "GET",
      url: API_URL + "admin/user_by_token",
      params: {}
    });
  };

  // Get local image url with other website image url
  // for example: params.remote_imgurl = "http://www.ybao.org/data/upload/201708/f_076dec430c2a9fcbf86d1457bf7fa541.png"
  // 从图片的远程地址下载图片至本地，并返回本地地址
  this.getLocalImgURL = function (params) {
    return $http({
      method: "GET",
      url: API_URL + "attachments/local_imgurl",
      params: params
    });
  };

  // 区块文章列表
  this.getBlockList = function (params) {
    return $http({
      method: "GET",
      url: API_URL + "articles/block",
      params: params
    });
  };
});

app.service('ScriptService', function ($q) {
  /**
   * This functions sets and removes asynchronously a js file at calling it..
   * I use it for a js file of the AdminLTE that must be declared after the view
   */
  this.loadFileAsync = function (src) {
    var q = $q.defer();
    if ($("script[src='" + src + "']").length > 0) {
      // void repeat load file
      q.resolve();
    }
    var script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0];
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = src;
    if (script.addEventListener) {
      script.addEventListener('load', function () {
        q.resolve();
      }, false);
    } else if (script.attachEvent) {
      script.attachEvent('onreadystatechange', function () {
        var target = window.event.srcElement;
        if (target.readyState == 'loaded') {
          q.resolve();
        }
      });
    } else {
      q.reject();
    }
    //head.appendChild(script);
    document.body.appendChild(script);
    return q.promise;
  };

  this.removeFileAsync = function (url) {
    document.querySelector("script[src*='" + url + "']").remove();
  };
});

app.service('TreeService', function ($rootScope) {
  // list turn into a tree list // list 转成树形列表
  this.listToTree = function (list, pid) {
    var ret = []; // A temporary array for storing results
    for (var i in list) {
      if (list[i].pid == pid) {
        // If the parent ID of the current item equals the parent ID to be looked up, recurse // 如果当前项的父id等于要查找的父id，进行递归
        list[i].children = this.listToTree(list, list[i].id);
        list[i].value = list[i].id;
        list[i].otitle = list[i].title; // Save the original title
        list[i].title = $rootScope.t(list[i].title);
        ret.push(list[i]);
      }
    }
    return ret; // Return the result after recursion // 递归结束后返回结果
  };

  this.createSelectTree = function (tree) {
    //var icon = ['│', '├', '└']
    var icon = '├';
    var nbsp = "&nbsp;";
    var divider = nbsp + icon;
    var j = '';
    function creatSelectTree(d) {
      var option = "";
      for (var i = 0; i < d.length; i++) {
        if (d[i].children.length) {
          // If there is a subset // 如果有子集
          option += "<option value='" + d[i].id + "'>" + j + " " + d[i].title + "</option>";
          j += divider;
          option += creatSelectTree(d[i].children); // Recursive call subset // 递归调用子集
          j = j.substring(0, j.lastIndexOf(divider)); // The prefix symbol needs to be subtracted by one symbol each time the recursive end returns to the superior // 每次递归结束返回上级时，前缀符号需要减一个符号
        } else {
          // No subset is displayed directly // 没有子集直接显示
          option += "<option value='" + d[i].id + "'>" + j + " " + d[i].title + "</option>";
        }
      }
      return option; // Returns the final HTML result // 返回最终html结果
    }
    return creatSelectTree(tree);
  };

  // Create the left menu html of the system // 创建系统左侧菜单HTML
  this.createMenuTree = function (tree) {
    var j = 'app';
    function creatSelectTree(d) {
      var option = "";
      for (var i = 0; i < d.length; i++) {
        if (d[i].children.length) {
          // If there is a subset
          option += "<li class=\"treeview\"> \n                              <a href=\"\"><i class=\"" + d[i].icon + "\"></i> <span>{{t(\"" + d[i].title + "\")}}</span> <i class=\"fa fa-angle-left pull-right\"></i></a>\n                              <ul class=\"treeview-menu\">";
          j = j + "." + d[i].name;
          d[i].stateName = j;
          option += creatSelectTree(d[i].children); // Recursive call subset // 递归调用子集
          option += "</ul></li>";
          j = j.substring(0, j.lastIndexOf("."));
        } else {
          // No subset is displayed directly // 没有子集直接显示
          d[i].stateName = j + "." + d[i].name;
          if (!$.emp(d[i].params)) {
            if (d[i].link_type == 'Inner Link') {
              option += "<li ui-sref=\"" + d[i].route + "(" + d[i].params + ")\" ui-sref-active=\"active\"><a href=\"\"><i class=\"" + d[i].icon + "\"></i>{{t(\"" + d[i].title + "\")}}</a></li>";
            } else if (d[i].link_type == 'Outer Link') {
              option += "<li ui-sref-active=\"active\"><a href=\"" + d[i].route + "\" target=\"_blank\"><i class=\"" + d[i].icon + "\"></i>{{t(\"" + d[i].title + "\")}}</a></li>";
            } else {
              option += "<li ui-sref=\"" + d[i].stateName + "(" + d[i].params + ")\" ui-sref-active=\"active\"><a href=\"\"><i class=\"" + d[i].icon + "\"></i>{{t(\"" + d[i].title + "\")}}</a></li>";
            }
          } else {
            if (d[i].link_type == 'Inner Link') {
              option += "<li ui-sref=\"" + d[i].route + "()\" ui-sref-active=\"active\"><a href=\"\"><i class=\"" + d[i].icon + "\"></i>{{t(\"" + d[i].title + "\")}}</a></li>";
            } else if (d[i].link_type == 'Outer Link') {
              option += "<li ui-sref-active=\"active\"><a href=\"" + d[i].route + "\" target=\"_blank\"><i class=\"" + d[i].icon + "\"></i>{{t(\"" + d[i].title + "\")}}</a></li>";
            } else {
              option += "<li ui-sref=\"" + d[i].stateName + "\" ui-sref-active=\"active\"><a href=\"\"><i class=\"" + d[i].icon + "\"></i>{{t(\"" + d[i].title + "\")}}</a></li>";
            }
          }
        }
      }
      return option; // Returns the final HTML result // 返回最终html结果
    }
    return creatSelectTree(tree);
  };

  this.createOrderTree = function (tree, icon) {
    var j = '';
    var ntree = [];
    var icon = icon;
    function creatSelectTree(d) {
      var option = "";
      for (var i = 0; i < d.length; i++) {
        if (d[i].children.length) {
          // If there is a subset //如果有子集
          option += "";
          d[i].flag = j;
          d[i].ntitle = j + d[i].title;
          ntree.push(d[i]);
          j += icon; // Prefix symbol plus a symbol // 前缀符号加一个符号
          option += creatSelectTree(d[i].children); // Recursive call subset // 递归调用子集
          j = j.substring(0, j.lastIndexOf(icon)); //每次递归结束返回上级时，前缀符号需要减一个符号
        } else {
          // No subset is displayed directly // 没有子集直接显示
          d[i].flag = j;
          d[i].ntitle = j + d[i].title;
          option += "";
          ntree.push(d[i]);
        }
      }
      return option; // Returns the final HTML result // 返回最终html结果
    }
    creatSelectTree(tree);
    return ntree;
  };

  // Create an ordered routing data list // 创建有序路由数据列表
  this.createOrderRouteTree = function (tree) {
    var j = 'app';
    var k = '';
    var ntree = [];
    function creatSelectTree(d) {
      for (var i = 0; i < d.length; i++) {
        if (d[i].children.length) {
          // If there is a subset // 如果有子集
          d[i].abstract = true;
          d[i].url = "/" + d[i].route;
          d[i].templateUrl = "app/module/" + d[i].name + "/index.html";
          d[i].controller = d[i].name + "Ctrl";
          d[i].controllerFile = "app/module/" + d[i].name + "/control.js";
          d[i].breadcrumbLabel = d[i].title;
          d[i].breadcrumbParent = j;
          j = j + "." + d[i].name;
          k = k + "*" + d[i].title;
          d[i].stateName = j;
          d[i].brd = k;
          ntree.push(d[i]);
          creatSelectTree(d[i].children); // Recursive call subset // 递归调用子集
          j = j.substring(0, j.lastIndexOf("."));
          k = k.substring(0, k.lastIndexOf("*"));
        } else {
          // No subset is displayed directly // 没有子集直接显示
          if (!$.emp(d[i].link_type)) {
            continue;
          }
          d[i].abstract = false;
          d[i].url = "/" + d[i].route;
          d[i].templateUrl = "app/module/" + d[i].name + "/index.html";
          d[i].controller = d[i].name + "Ctrl";
          d[i].controllerFile = "app/module/" + d[i].name + "/control.js";
          d[i].breadcrumbLabel = d[i].title;
          d[i].breadcrumbParent = j;
          d[i].stateName = j + "." + d[i].name;
          d[i].brd = k + "*" + d[i].title;
          ntree.push(d[i]);
        }
      }
      return;
    }
    creatSelectTree(tree);
    return ntree;
  };
});

// Dynamic Additional Routing // 动态增加路由
/* for example
URL: https://oclazyload.readme.io/docs/oclazyload-service

$ocLazyLoad.load([{
  files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js'],
  cache: false
},{
  files: ['anotherModule.js'],
  cache: true
}]);
*/
/*
LIST OF PARAMETERS: cache reconfig rerun serie insertBefore
*/
app.provider('router', function ($urlRouterProvider, $stateProvider) {
  this.$get = function ($state, $rootScope) {
    return {
      setUpRoutes: function setUpRoutes(routes) {
        if (!$state.get('app')) {
          $urlRouterProvider.otherwise("app/main");
          $stateProvider.state('app', {
            url: "/app",
            abstract: true,
            templateUrl: 'app/module/layout/index.html',
            controller: "layoutCtrl",
            controllerAs: "layout",
            resolve: {
              deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  serie: true,
                  //cache: false,
                  files: ["app/module/layout/control.js"]
                });
              }]
            }
          }).state('app.main', {
            url: '/main',
            templateUrl: 'app/module/dashboard/dashboard.html',
            controller: "dashboardCtrl",
            resolve: {
              deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  serie: true,
                  //cache:false,
                  files: ["app/module/dashboard/control.js"]
                });
              }]
            }
          });
        } else {
          //console.log('reload app');
          //$state.reload('app')
        }
        for (var routeName in routes) {
          if (!$state.get(routeName)) {
            $stateProvider.state(routeName, routes[routeName]);
          }
        }
        console.log("init router");
        $rootScope.$emit('routeComplete', { routes: routes });
      }
    };
  };
});

app.service('RouteService', function ($http, API_URL, ApiService, router, TreeService, $rootScope, $state) {

  this.setRoute = function () {
    // If Token exists, get dynamic routing // 如果Token存在，获取动态路由
    if (!$.emp($rootScope.user.token)) {
      ApiService.getRoutes().then(function successCallback(response) {
        var json = response.data;
        var tree = TreeService.listToTree(json, 0);
        var tree2 = angular.copy(tree);
        var ntree = TreeService.createOrderRouteTree(tree);
        var menu = TreeService.createMenuTree(tree2);
        $rootScope.menu = menu;
        var routes = {};
        for (var i = 0; i < ntree.length; i++) {
          var route = {};
          if (!$.emp(ntree[i].link_type)) {
            continue;
          }
          var url = ntree[i].url;
          var abstract = ntree[i].abstract;
          var stateName = ntree[i].stateName;
          var controller = ntree[i].controller;
          var controllerFile = ntree[i].controllerFile;
          var templateUrl = ntree[i].templateUrl;
          var breadcrumbLabel = ntree[i].breadcrumbLabel;
          var breadcrumbParent = ntree[i].breadcrumbParent;
          var breadcrumb = ntree[i].brd;
          var remark = ntree[i].remark;
          if(ntree[i].abstract){
            var obj = "{url: '" + url + "',abstract: '" + abstract + "'}";
            route = Function('return (' + obj + ')')();                            
            // eval(
            //     "route = {url: '"+url+"',abstract: '"+abstract+"'}"
            // )
        }else{
            var obj2 = "route = {" + "url: '" + url + "'," + "breadcrumb: '" + breadcrumb + "'," + "remark: '" + remark + "'," + "views:{" + "\"@app\":{" + "    templateUrl:'" + templateUrl + "'," + "    controller: '" + controller + "'" + "}" + "}," + "resolve:{" + "deps:[\"$ocLazyLoad\",function($ocLazyLoad){" + "return $ocLazyLoad.load('" + controllerFile + "')" + "}]" + "}," + "}"
            route = Function('return (' + obj2 + ')')();
              // eval(
              //     "route = {" +
              //         "url: '"+url+"'," +
              //         "breadcrumb: '"+breadcrumb+"'," +
              //         "remark: '"+remark+"'," +
              //         "views:{" +
              //             "\"@app\":{" +
              //             "    templateUrl:'"+templateUrl+"'," +
              //             "    controller: '"+controller+"'" +
              //             "}" +
              //         "}," +
              //         "resolve:{" +
              //             "deps:[\"$ocLazyLoad\",function($ocLazyLoad){" +
              //                 "return $ocLazyLoad.load('"+controllerFile+"')" +
              //                 "}]" +
              //                 "}," +
              //                 "}"
              // )
          }
          routes[stateName] = route;
        }
        router.setUpRoutes(routes);
      }).catch(function errorCallback(error) {
        console.log(error);
      });
    }
  };
});

app.service('I18nService', function ($rootScope, ApiService) {
  this.init = function () {
    var params = {};
    params.module = 'configs';
    params.section = 'i18n';
    params.lang = $rootScope.lang;
    ApiService.getKeys(params).then(function successCallback(response) {
      for (var i = 0; i < response.data.length; i++) {
        var keys = response.data[i].keys.toLowerCase();
        var value = response.data[i].value;
        $rootScope.i18n[keys] = value;
      }
      $rootScope.$emit('i18nComplete', { status: 'ok', module: 'configs' });
    });
  };

  // internationalization module
  this.i18n = function (module) {
    var params = {};
    params.module = module;
    params.section = 'i18n';
    params.lang = $rootScope.lang;
    ApiService.getKeys(params).then(function successCallback(response) {
      for (var i = 0; i < response.data.length; i++) {
        var keys = response.data[i].keys.toLowerCase();
        var value = response.data[i].value;
        $rootScope.i18n[keys] = value;
      }
      $rootScope.$emit('i18nComplete', { status: 'ok', module: module });
    });
  };

  // module configs
  this.configs = function (module, module_configs) {
    var params = {};
    params.module = module;
    params.section = '';
    params.lang = $rootScope.lang;
    ApiService.getKeys(params).then(function successCallback(response) {
      for (var i = 0; i < response.data.length; i++) {
        var keys = response.data[i].title.toLowerCase();
        var value = response.data[i].value;
        module_configs[keys] = value;
      }
      $rootScope.$emit('configsComplete', { status: 'ok', module: module });
    });
  };
});

app.service('ModuleService', function ($rootScope, ApiService) {
  this.del = function (services, title, id, $table) {
    BootstrapDialog.confirm({
      title: $rootScope.t("Delete"),
      message: title + '<br>' + $rootScope.t("OK OR CANCEL"),
      type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
      closable: true, // <-- Default value is false
      draggable: true, // <-- Default value is false
      closeByBackdrop: false,
      closeByKeyboard: false,
      btnCancelLabel: $rootScope.t("Cancel"), // <-- Default value is 'Cancel',
      btnOKLabel: $rootScope.t("OK"), // <-- Default value is 'OK',
      btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
      callback: function(result) {
          // result will be true if button was click, while it will be false if users close the dialog directly.
          if(result) {
            var params = {}
            params.ids = [id]
            services.del(params).then(function successCallback(response) { 
                if(response.data.status) {
                  toastr.success($rootScope.t("Success"), $rootScope.t("Delete"))              
                  $table.bootstrapTable('refresh')                            
                }else{
                  toastr.error($rootScope.t("Fail"), $rootScope.t("Delete"))   
                }
            }).catch(function errorCallback(error) {
                var message = $rootScope.t("Internal Server Error")
                if (error.status == 500){
                  message = error.data.message
                }
                toastr.error(message, $rootScope.t("Delete"))   
            }) 
          }else {
            toastr.info($rootScope.t("Cancel"), $rootScope.t("Delete"))   
          }
      }
    });
  };

  this.dels = function (services, $table, $remove, getIdSelections) {
    var ids = getIdSelections()
    BootstrapDialog.confirm({
      title: $rootScope.t("Delete"),
      message: $rootScope.t("Batch Delete") + ': '+ ids + '<br>' + $rootScope.t("OK OR CANCEL"),
      type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
      closable: true, // <-- Default value is false
      draggable: true, // <-- Default value is false
      closeByBackdrop: false,
      closeByKeyboard: false,
      btnCancelLabel: $rootScope.t("Cancel"), // <-- Default value is 'Cancel',
      btnOKLabel: $rootScope.t("OK"), // <-- Default value is 'OK',
      btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
      callback: function(result) {
          // result will be true if button was click, while it will be false if users close the dialog directly.
          if(result) {
            var params = {}
            params.ids = ids
            services.del(params).then(function successCallback(response) {    
              toastr.success($rootScope.t("Success"), $rootScope.t("Delete"))         
              $table.bootstrapTable('refresh')
              $remove.prop('disabled', true)
            }).catch(function errorCallback(error) {
              var message = $rootScope.t("Internal Server Error")
              if (error.status == 500){
                message = error.data.message
              }
              toastr.error(message, $rootScope.t("Delete"))   
            })  
          }else {
            toastr.info($rootScope.t("Cancel"), $rootScope.t("Delete"))   
          }
      }
    });
  };

  this.add_edit = function (services, $table, $scope, addParams, editParams, formObj_add_edit_, modal_add_edit_ ) {
      var formObj_add_edit = formObj_add_edit_
      var modal_add_edit = modal_add_edit_
      if($.emp(formObj_add_edit_)){
        // form validate init // 表单检验初始化
        formObj_add_edit = $('#add-edit-form').validator({
          feedback: {
            success: 'glyphicon-ok',
            error: 'glyphicon-remove'
          },
        })
      }

      if($.emp(modal_add_edit_)){
        // form validate init // 表单检验初始化
        modal_add_edit = $('#modal-add-edit')
      }      

      /*!
      * Modal Form Submit
      */
      formObj_add_edit.on('submit', function (e) {
          if (e.isDefaultPrevented()) {
              // invalidated
              return false;
          } else {
              // validated
              if($scope.s=='add'){
                //Pace.restart();
                var params = addParams()               
                services.add(params).then(function successCallback(response) {
                    toastr.success($rootScope.t("Success"), $rootScope.t("Add"))   
                    modal_add_edit.modal('hide');
                    $table.bootstrapTable('refresh');
                }).catch(function errorCallback(error) {
                    var message = $rootScope.t("Internal Server Error")
                    if (error.status == 500){
                      // message = error.data.message;
                    }
                    toastr.error(message, $rootScope.t("Add"))   
                })
                return false;
            } else if($scope.s=='edit'){
              //Pace.restart();
              var params = editParams() 
              services.edit(params).then(function successCallback(response) {
                  toastr.success($rootScope.t("Success"), $rootScope.t("Edit"))   
                  modal_add_edit.modal('hide')
                  $table.bootstrapTable('refresh')
              }).catch(function errorCallback(error) {
                  var message = $rootScope.t("Internal Server Error")
                  if (error.status == 500){
                    // message = error.data.message;
                  }
                  toastr.error(message, $rootScope.t("Edit"))   
              })
              return false;
            }
            return false;
          }
      })
  };

  this.getBlockList = function(params, callback){
    var default_params = {};
    default_params.lang = $rootScope.lang;
    default_params.block_id = 1;
    default_params.order = 'asc';
    default_params.offset = 0;
    default_params.limit = 10;
    // 是否分页，pager_lock = true 不分页
    default_params.pager_lock = true;
    var extend_params = $.extend({}, default_params, params);
    ApiService.getBlockList(extend_params).then(function successCallback(response) { 
      callback(response.data.rows, response.data.total, extend_params)
    })
  }

  this.pageChangedEvent = function(total, params, callback){
    var options = {
      currentPage: 1,
      totalPages: Math.ceil(total / params.limit),
      onPageChanged: function onPageChanged(e, oldPage, newPage) {        
        params.offset = params.limit * (newPage - 1);
        ApiService.getBlockList(params).then(function successCallback(response) {
          total = response.data.total;
          callback(response.data.rows)
        });
      }
    };
    $('#bp-page-changed-event').bootstrapPaginator(options);    
  }

  this.icheck = function () {
      $('input[type=radio]').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
      })
  };
});
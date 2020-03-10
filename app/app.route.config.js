"use strict";
/*!
 * route
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */ 

/*
* Routing initialization before login. (after login,  routing initialization completed by RouteService service in app.services.js is invoked by auth/login.js) 
* 1. Local Storage token (CSRF attacks may occur if remember is checked in the login interface)
* If a token exists, the server verifies that it is valid and generates the privilege routing for the corresponding user of the token
* Without token, simple routing is generated
* 2. Do not store token locally (remember is not checked in the login interface to avoid CSRF attacks)
* Generating Simple Routing

* 登录前的路由初始化 (登录后的路由初始化由auth/login.js调用app.services.js中的RouteService服务)
* 1. 缺省本地存储token（LOCAL_STORAGE = true, 登录界面中的'记住'被勾选也会保存，本地存储token可能会产生CSRF攻击）
*      如果存在token，服务端验证有效后，产生该token所对应用户的权限路由
*      没有token, 产生简单路由
* 2. 本地不存储token (登录界面中的'记住'不被勾选，避免CSRF攻击)
*      产生简单路由    
*/
function Tree(){
    // list turn into a tree list
    this.listToTree = function (list, pid) {
        var ret = []; // A temporary array for storing results
        for (var i in list) {
            if (list[i].pid == pid) {
                // If the parent ID of the current item equals the parent ID to be looked up, recurse // 如果当前项的父id等于要查找的父id，进行递归
                list[i].children = this.listToTree(list, list[i].id);
                list[i].value = list[i].id;
                ret.push(list[i]);
            }
        }
        return ret; // Return the result after recursion // 递归结束后返回结果
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
            return option;
        }
        return creatSelectTree(tree);
    };

    // Create an ordered routing data list // 创建有序路由数据列表
    this.createOrderRouteTree = function (tree) {
        var j = 'app';
        var k = '';
        var ntree = [];
        function creatSelectTree(d) {
            for (var i = 0; i < d.length; i++) {
                if (d[i].children.length) {
                    // If there is a subset
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
}
app.config(function ($stateProvider, $urlRouterProvider, API_URL, LOCAL_STORAGE) {    
        var token = "";
        // Remember that the check box is checked and the token is stored locally // 记住复选框被勾选， token被本地存储
        var session_remember = localStorage.getItem("session_remember");
        if (session_remember == "true") {
            token = localStorage.getItem("session_token");
        } else {
            if (LOCAL_STORAGE === true) {
                token = localStorage.getItem("session_token");
            }
        }
        // If token is empty, there is only one login route // 如果token为空，仅有一个 login 路由
        if ($.emp(token)) {
            $urlRouterProvider.otherwise("login");
            $stateProvider.state("login", {
                url: "/login",
                templateUrl: "app/module/auth/login.html",
                controller: "loginCtrl",
                resolve: {
                    deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                        return $ocLazyLoad.load(["app/module/auth/login.js"]);
                    }]
                }
            });
        } else {
            // Token is not empty. Verify token from the server, get the list of permissions corresponding to the corresponding account number, and convert it to dynamic menu tree and routing tree. // token 不为空，从服务器验证token，并获取相应账号对应的权限列表， 并转成动态菜单树和路由树
            //_this = this;
            // console.log('ajax begin' + API_URL + "resources/routes");
            // jQuery ajax跨域调用出现No Transport
            $.support.cors = true;
            $.ajax({
                type: "GET",
                url: API_URL + "resources/routes",
                data: {},
                async: false,
                //crossDomain: true,
                headers: {
                    "authtoken": token
                },
                beforeSend: function beforeSend(request) {
                    //request.setRequestHeader("authtoken", token);
                },
                success: function success(data) {
                    var treeObj = new Tree()
                    var tree = treeObj.listToTree(data, 0);
                    var tree1 = angular.copy(tree);
                    var tree2 = angular.copy(tree);
                    var ntree = treeObj.createOrderRouteTree(tree1);
                    var menu = treeObj.createMenuTree(tree2);

                    MENU = menu;
                    var routes = {};
                    for (var i = 0; i < ntree.length; i++) {
                        if (!$.emp(ntree[i].link_type)) {
                            continue;
                        }
                        var route = {};
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
                        var globalEval = eval; // 缓存一个全局的eval函数
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
                    $urlRouterProvider.otherwise("app/main");
                    $stateProvider.state("login", {
                        url: "/login",
                        templateUrl: "app/module/auth/login.html",
                        controller: "loginCtrl",
                        resolve: {
                            deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                                return $ocLazyLoad.load(["app/module/auth/login.js"]);
                            }]
                        }
                    });
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
                                    //cache:false,
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
                    for (var routeName in routes) {
                        if (!$stateProvider.state[routeName]) {
                            $stateProvider.state(routeName, routes[routeName]);
                        }
                    }
                },
                error: function error(xhr, textStatus, errorThrown) {
                    /*错误信息处理*/
                    console.log("进入error---");
                    console.log("状态码："+xhr.status);
                    console.log("状态:"+xhr.readyState);//当前状态,0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成。
                    console.log("错误信息:"+xhr.statusText );
                    console.log("返回响应信息："+xhr.responseText );//这里是详细的信息
                    console.log("请求状态："+textStatus); 　　　　　　　　
                    console.log(errorThrown); 　　　　　　　　
                    console.log("请求失败"); 
                    // Unable to get dynamic resources from the server to generate basic routing // 无法从服务器获取动态资源，生成基本路由
                    $urlRouterProvider.otherwise("app/main");
                    $stateProvider.state("login", {
                        url: "/login",
                        templateUrl: "app/module/auth/login.html",
                        controller: "loginCtrl",
                        resolve: {
                            deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                                return $ocLazyLoad.load(["app/module/auth/login.js"]);
                            }]
                        }
                    }).state('app', {
                        url: "/app",
                        abstract: true,
                        templateUrl: 'app/module/layout/index.html',
                        controller: "layoutCtrl",
                        controllerAs: "layout",
                        resolve: {
                            deps: ["$ocLazyLoad", function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    files: ["app/module/layout/control.js"]
                                });
                            }]
                        }
                    }).state('app.main', {
                        url: '/main',
                        templateUrl: 'app/module/dashboard/dashboard.html'
                    });
                }
            });
        }
});
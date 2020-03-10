"use strict";
/*!
 * Login Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('DashboardService', function($http) {
    var API_URL = "http://www.baoai.co/api/"
    // view list 
    this.getBlockList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "articles/block",
        params: params,
      })
    }
  
    // view list 
    this.getSlideBlockList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "articles/block",
        params: params,
      })
    }
  
    // view list 
    this.getArticlesWithCategory = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "articles/web_list",
        params: params,
      })
    }
  
    this.getSearchList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "articles/web_list",
        params: params,
      })
    }
    
    this.getCategory = function(params) {
        return $http({
          method: 'GET', 
          url: API_URL + 'category/',
          params: params, 
        })
      }
    
      this.getBookData = function(params) {
        return $http({
          method: "GET",
          url: API_URL + "articles/book_data",
          params: params,
        })
      }
    
      // get
      this.getArticle = function(params) {
        return $http({
          method: 'GET', 
          //cache: false,
          url: API_URL + 'articles/',
          params: params, 
        })
      }

      this.getSearchList = function(params) {
        return $http({
          method: "GET",
          url: API_URL + "articles/web_list",
          params: params,
        })
      }
  
  })
  
  app.controller('dashboardCtrl',function($scope, $rootScope, $window, ApiService, SecurityService, $sce, DashboardService, APP_KEY, RouteService, I18nService, $state, $stateParams){
    console.log("dashboardCtrl...");
    var params = {}
    params.lang = $rootScope.lang
    params.block_id = 1
    params.order = 'asc'  
    params.offset = 0
    params.limit = 10
    params.pager_lock = true
    $scope.search_result = []
    $scope.search_result_total = 0
    
    $scope.baoai_news= []
    var params_baoai_news = angular.copy(params) 
    params_baoai_news.block_id = 9
    DashboardService.getBlockList(params_baoai_news).then(function successCallback(response) { 
      $scope.baoai_news = response.data.rows
    })

    $scope.more = function(id){
        $state.go('web.block',{id:id})
    }

    var params_search_key = {}
    params_search_key.lang = $rootScope.lang
    
    params_search_key.sort = 'created'
    params_search_key.order = 'desc'  
    params_search_key.offset = 0
    params_search_key.limit = 10 

    function search(search_key){
        params_search_key.search = search_key
        DashboardService.getSearchList(params_search_key).then(function successCallback(response) { 
          $scope.search_result = response.data.rows
          $scope.search_result_total = response.data.total
          pageChangedEvent(search_key)
        })  
      }

      function pageChangedEvent(search_key)
      {
          var options = {
              currentPage: 1,
              totalPages: Math.ceil($scope.search_result_total / params_search_key.limit),
              onPageChanged: function(e,oldPage,newPage){
                  params_search_key.search = search_key;
                  params_search_key.sort = 'created'
                  params_search_key.order = 'desc'  
                  params_search_key.offset = params_search_key.limit * (newPage-1)
                  DashboardService.getSearchList(params_search_key).then(function successCallback(response) { 
                    $scope.search_result = response.data.rows
                    $scope.search_result_total = response.data.total
                  }) 
              }
          }
          $('#bp-page-changed-event').bootstrapPaginator(options);
      }

      $scope.$watch('_search_key', function () {
        if ($.emp($scope._search_key)) {
          //return
        } else {
          search($scope._search_key)
        }
      });



  // 获取系统扩展列表
  $scope.article = {}
  $scope.book_title = ''

  $scope.mainContent = function(id){
    var book_id = 88
    if(!$.emp(id)){
        book_id = id // default : books category id-88 //默认手册分类ID：BaoAI手册的ID号
    }
    var params_book = {}
    params_book.id = book_id
    DashboardService.getCategory(params_book).then(function successCallback(response) { 
    $scope.article = response.data
    $scope.book_title = $scope.article.title
    $scope.article.book_id = book_id
    $scope.article.section_id = '0'
    $scope.article.article_id = '0'
    $scope.article.content = $scope.article.content
    }) 
  }  

  $scope.mainContent()
  
  $scope.book_data = []
  var params_book_data = {}
  params_book_data.book_id = 88
  DashboardService.getBookData(params_book_data).then(function successCallback(response) { 
    $scope.book_data = response.data.rows
    var selectableTree = $('#book_treeview').treeview({
      levels: 99,
      data: $scope.book_data,
      onNodeSelected: function(event, node) {
        //$('#selectable-output').prepend('<p>' + node.text + ' was selected</p>');
        var id = node.id
        var params_article = {}         
        params_article.id = parseInt(id)
        if(node.isCategory){
            DashboardService.getCategory(params_article).then(function successCallback(response) { 
                var temp = {}
                temp = response.data
                temp.content = $sce.trustAsHtml(temp.content);
                $scope.article = temp
                $scope.article.book_id = params_book.id
                $scope.article.section_id = temp.id
                $scope.article.article_id = '0'
          }) 
        }else{
            DashboardService.getArticle(params_article).then(function successCallback(response) { 
            var temp = {}
            temp = response.data
            temp.content = $sce.trustAsHtml(temp.content);
            $scope.article = temp
            $scope.article.book_id = params_book.id
            $scope.article.section_id = '0'
            $scope.article.article_id = temp.id              
          })           
        }
      },
    })
    // var section = ''
    // var article = ''
    // var search_key = section + '_' + article
    // if(!$.emp($stateParams.section)){
    //   section = $stateParams.section
    // }
    // if(!$.emp($stateParams.article)){
    //   article = $stateParams.article
    // }
    // if($.emp($stateParams.section) && $.emp($stateParams.article)){
    //   return 
    // }
    // if(!$.emp(article) && article!='0'){
    //   search_key = '0_' + article
    // }else if(!$.emp(section) && section!='0'){
    //   search_key = section + '_0'
    // }
    // if(search_key == '_'){
    //   return
    // }
    // var findSelectableNodes = function() {
    //   return selectableTree.treeview('search', [ search_key, { ignoreCase: false, exactMatch: true, attribute:'key' } ]);
    // }
    // var selectableNodes = findSelectableNodes()
    // selectableTree.treeview('selectNode', [ selectableNodes, { silent: false }])
  }).catch(function errorCallback(error) {
    var message = $rootScope.t("Internal Server Error")    
    if (error.status == 500){
      message = error.data.message
    }
    toastr.error($rootScope.t("Network Exception or Other Error"), $scope.book_title) 
  }) 

    function system_architecture(size){
         // 基于准备好的dom，初始化echarts实例
         //var systemChart = echarts.init(document.getElementById('chart-panel'),null, {height:889});
         var systemChart = echarts.init(document.getElementById("system"));         
         //var size = 50; //节点大小               
         var listdata = [] 
         var links = []
         var legends = []
         var colors = []
         var texts = []                 
         var nodes = {
             "rbac": ["权限管理", "管理员、角色和资源", "rbac_64.png", "#63C2EB"],
             "user_manager": ["账号管理", "配置、日志和通知", "user_manager_64.png", "#FFDD6A"],
             "system_manager": ["系统管理", "附件、操作、配置参和分类", "system_manager_64.png", "#1fbb4b"],
             "notice": ["通知管理", "通知内容", "notice_64.png", "#BB7E5D"],
             "autocode_manager": ["自动代码", "模块、模型和数据迁移", "autocode_manager_64.png", "#63C2EB"],
             "tasksys": ["任务系统", "任务、任务调度和信息", "tasksys_64.png", "#FFDD6A"],
             "cms": ["内容管理", "文章、模板、区块、评论、表单设计", "cms_64.png", "#1fbb4b"],
             "news": ["新闻网站", "分类和文章", "news_64.png", "#BB7E5D"],
             "books": ["手册管理", "分类和文章", "books_64.png", "#63C2EB"],
             "ai": ["人工智能", "人工智能基础、基础应用", "ailearn_64.png", "#FFDD6A"],
             "image_recognition": ["图像识别", "图像识别", "image_recognition_64.png", "#1fbb4b"],
             "face_recognition": ["人脸识别", "人脸识别", "face_recognition_64.png", "#BB7E5D"],
             "crawler_system": ["网络爬虫", "网络爬虫", "crawler_system_64.png", "#63C2EB"],
             "finance_basic_data": ["金融数据管理", "主要金融数据采集", "finance_basic_data_64.png", "#FFDD6A"],
             "quant": ["量化系统", "策略选择、交易等", "quant_64.png", "#1fbb4b"],
        }
         
        for(var legend in nodes){
            legends.push(nodes[legend][0])
        }
        legends.push("BaoAI")
        for(var color in nodes){
            colors.push(nodes[color][3])
        }
        colors.push("#63C2EB")        
         
         var mainRelationShip = {
              BaoAI: "BaoAI"
         }
         
         function setDataBaoAI(nodes, n) {
             var i = 0;
             for (var p in nodes) {
                 listdata.push({
                     x: 50,
                     y: 100,
                     "name": p,
                     "showName": nodes[p],
                     "symbol":'image://'+"/assets/img/dashboard/baoai_avatar_160.png",
                     "symbolSize": 70,
                     "category": n,
                     "draggable": "false",
                     formatter: function(params) {
                         return params.data.showName
                     },
                     label:{
                         position: 'bottom'
                     }
                 });
                 i++;
             }
         }
         function nodeFactory(nodes, category) {
             var i = 0;
             for (var p in nodes) {
                 listdata.push({
                     x: i * 50,
                     y: size + i * 10,
                     "name": p,
                     "showName": nodes[p][0],
                     "symbol":'image://' + "/assets/img/dashboard/" + nodes[p][2],
                     "symbolSize": size,
                     "category": i, //legends 序号
                     "draggable": "false",
                     formatter: function(params) {
                         return params.data.showName
                     },
                     label:{
                         position: 'bottom'
                     }
                 });
                 i++;
             }
         }  
         
         function setLinkData(nodes, title) {
            var i = 0;
            for (var p in nodes) {
                links.push({
                    "source": p,
                    "target": title,
                    "value": nodes[p][1], //nodes[p][1],
                    lineStyle: {
                        normal: {
                            // text: relarr[i],
                            color: 'source'
                        }
                    }
                });
                i++;
            }
         }
         
         for (var i = 0; i < legends.length; i++) {
             texts.push({
                 "name": legends[i]
             })
         }

         nodeFactory(nodes, 0)
         setDataBaoAI(mainRelationShip, legends[legends.length-1]);         
         setLinkData(nodes, legends[legends.length-1]);
         
         var option = {
             title: {
                 text: "BaoAI 小宝人工智能和量化平台系统架构",
                 top: "top",
                 left: "left",
                 textStyle: {
                     color: '#000000'
                 }
             },
             tooltip: {
                 formatter: '{b}'
             },
             toolbox: {
                 show: true,
                 feature: {
                     restore: {
                         show: true
                     },
                     saveAsImage: {
                         show: true
                     }
                 }
             },         
             backgroundColor: '#fff', //'#ecf0f5', //'#f7f7f7',
             legend: {
                 data: legends,
                 textStyle: {
                     color: '#000000',
                     fontSize: 20,
                     padding:[5,0,0,0]
                 },
                 icon: 'circle',
                 type: 'scroll',
                 orient: 'vertical',
                 left: 10,
                 top: 50,
                 bottom: 20,
                 itemWidth: 20,
                 itemHeight: 20,
                 fontSize:50,
                 padding:[5,0,0,0],
             },
             animationDuration: 1000,
             animationEasingUpdate: 'quinticInOut',
             series: [{
                 type: 'graph',
                 layout: 'force',
                 force: {
                     repulsion: 80,
                     gravity: 0,
                     edgeLength: 150,
                     layoutAnimation: true,
                 },
                 data: listdata,
                 links: links,
                 categories: texts,
                 roam: false,
                 nodeScaleRatio: 0, 
                 focusNodeAdjacency: false, 
                 lineStyle: {
                     normal: {
                         opacity: 0.5,
                         width: 1.5,
                         curveness: 0
                     }
                 },
                 label: {
                     normal: {
                         show: true,
                         position: 'inside',
                         textStyle: { 
                             color: '#000000', 
                             fontWeight: 'normal', 
                             fontSize: "12" //字体大小
                         },
                         formatter: function(params) {
                             return params.data.showName 
                         },
                         fontSize: 18,
                         fontStyle: '600',
                     }
                 },
                 edgeLabel: {
                     normal: {
                         show: true,
                         textStyle: {
                             fontSize: 12
                         },
                         formatter: "{c}"
                     }
                 }
             }],
             color: colors
         };
         
        var clickFun = function(param) {
             console.log(param.name)
        }
         
        systemChart.on("click", clickFun);     
        // 使用刚指定的配置项和数据显示图表。
        systemChart.setOption(option);
        $(window).resize(systemChart.resize);
        systemChart.on('legendselectchanged', function(obj) {
            var selected = obj.selected;
            var legend = obj.name;      
        });
    }

    function knowledge_system(){
        // 基于准备好的dom，初始化echarts实例
        var knowledgeChart = echarts.init(document.getElementById('knowledge'));
        var size = 80;
        var size1 = 50;
        var yy = 200;
        var yy1 = 250;
        var colors =  ['#ec0e42','orange' , '#FFDD6A', '#1fbb4b', '#BB7E5D',  '#63C2EB', 'darkseagreen', '#1fbb4b']
        var knowledge_option = {
            title: {
                text: "BaoAI 小宝人工智能和量化平台知识体系",
                top: "top",
                left: "left",
                textStyle: {
                    color: '#000000'
                }
            },
            tooltip: {
                formatter: '{b}'
            },
            toolbox: {
                show: true,
                feature: {
                    restore: {
                        show: true
                    },
                    saveAsImage: {
                        show: true
                    }
                }
            },
            backgroundColor: '#fff', //'#ecf0f5',
            textStyle:{
                color: '#000000'
            },
            animationDuration: 1000,
            animationEasingUpdate: 'quinticInOut',
            series: [{
                name: '知识体系',
                type: 'graph',
                layout: 'force',
                force: {
                    repulsion: 60,
                    gravity: 0.1,
                    edgeLength: 30,
                    layoutAnimation: true,
                },
                data: [{
                    "name": "BaoAI",
                    x: 0,
                    y: yy,
                    "symbolSize": 100,
                    "category": "BaoAI",
                    "draggable": "true"
                }, {
                    "name": "BaoAIFront前端",
                    x: 10,
                    y: yy1,
                    "symbolSize": size,
                    "category": "BaoAIFront前端",
                    "draggable": "true"

                }, {
                    "name": "HTML5",
                    x: 20,
                    y: yy,
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true"
                }, {
                    x: 30,
                    y: yy1,
                    "name": "CSS",
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true"
                }, {
                    x: 40,
                    y: yy,
                    "name": "Javascript",
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true",
                    "value": 1
                }, {
                    x: 60,
                    y: yy,
                    "name": "Supervisor",
                    "symbolSize": size1,
                    "category": "安装部署",
                    "draggable": "true"
                }, {
                    x: 70,
                    y: yy1,
                    "name": "JQuery",
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true"
                }, {
                    x: 80,
                    y: yy,
                    "name": "开发工具",
                    "symbolSize": size,
                    "category": "开发工具",
                    "draggable": "true"
                }, {
                    x: 90,
                    y: yy1,
                    "name": "Gulp",
                    "symbolSize": size1,
                    "category": "开发工具",
                    "draggable": "true"
                }, {
                    x: 100,
                    y: yy,
                    "name": "Visual Studio Code",
                    "symbolSize": size1,
                    "category": "开发工具",
                    "draggable": "true"
                }, {
                    x: 110,
                    y: yy1,
                    "name": "Git",
                    "symbolSize": size1,
                    "category": "开发工具",
                    "draggable": "true"
                }, {
                    x: 120,
                    y: yy1,
                    "name": "Jupyter Notebook",
                    "symbolSize": size1,
                    "category": "开发工具",
                    "draggable": "true"
                }, {
                    x: 130,
                    y: yy1,
                    "name": "安装部署",
                    "symbolSize": size,
                    "category": "安装部署",
                    "draggable": "true"
                }, {
                    x: 140,
                    y: yy,
                    "name": "Nginx",
                    "symbolSize": size1,
                    "category": "安装部署",
                    "draggable": "true"
                }, {
                    x: 150,
                    y: yy1,
                    "name": "Gunicorn",
                    "symbolSize": size1,
                    "category": "安装部署",
                    "draggable": "true"
                }, {
                    x: 160,
                    y: yy,
                    "name": "Bootstrap",
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true"
                }, {
                    x: 170,
                    y: yy,
                    "name": "AngularJS",
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true"
                }, {
                    x: 180,
                    y: yy,
                    "name": "ECharts",
                    "symbolSize": size1,
                    "category": "BaoAIFront前端",
                    "draggable": "true"
                }, {
                    x: 170,
                    y: yy1,
                    "name": "数据库",
                    "symbolSize": size,
                    "category": "数据库",
                    "draggable": "true"
                }, {
                    x: 180,
                    y: yy,
                    "name": "Redis",
                    "symbolSize": size1,
                    "category": "数据库",
                    "draggable": "true"
                }, {
                    x: 200,
                    y: yy,
                    "name": "MySQL",
                    "symbolSize": size1,
                    "category": "数据库",
                    "draggable": "true"
                }, {
                    x: 210,
                    y: yy1,
                    "name": "BaoAIBack后端",
                    "symbolSize": size,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 220,
                    y: yy,
                    "name": "Flask",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 230,
                    y: yy1,
                    "name": "Backtrader",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 240,
                    y: yy,
                    "name": "Python",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 250,
                    y: yy1,
                    "name": "Pandas",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 260,
                    y: yy1,
                    "name": "Scikit-learn",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 270,
                    y: yy1,
                    "name": "Tensorflow",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 280,
                    y: yy1,
                    "name": "Keras",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 290,
                    y: yy1,
                    "name": "Numpy",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 300,
                    y: yy1,
                    "name": "Celery",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 310,
                    y: yy1,
                    "name": "SQLAlchemy",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 320,
                    y: yy1,
                    "name": "Scapy",
                    "symbolSize": size1,
                    "category": "BaoAIBack后端",
                    "draggable": "true"
                }, {
                    x: 330,
                    y: yy,
                    "name": "行业应用",
                    "symbolSize": size,
                    "category": "行业应用",
                    "draggable": "true"
                }, {
                    x: 270,
                    y: yy1,
                    "name": "金融量化",
                    "symbolSize": size1,
                    "category": "行业应用",
                    "draggable": "true"
                }, {
                    x: 280,
                    y: yy,
                    "name": "人工智能",
                    "symbolSize": size1,
                    "category": "行业应用",
                    "draggable": "true"
                }, {
                    x: 290,
                    y: yy1,
                    "name": "大数据",
                    "symbolSize": size1,
                    "category": "行业应用",
                    "draggable": "true"
                }, {
                    x: 300,
                    y: yy,
                    "name": "企业门户",
                    "symbolSize": size1,
                    "category": "行业应用",
                    "draggable": "true"
                }, {
                    x: 310,
                    y: yy1,
                    "name": "企业应用管理平台",
                    "symbolSize": size1,
                    "category": "行业应用",
                    "draggable": "true"
                }, {
                    x: 320,
                    y: yy,
                    "name": "任务调度平台",
                    "symbolSize": size1,
                    "category": "行业应用",
                    "draggable": "true"
                }],
                links: [{
                    "source": "BaoAI",
                    "target": "BaoAIFront前端"
                }, {
                    "source": "BaoAI",
                    "target": "开发工具"
                }, {
                    "source": "BaoAI",
                    "target": "安装部署"
                }, {
                    "source": "BaoAI",
                    "target": "数据库"
                }, {
                    "source": "BaoAI",
                    "target": "BaoAIBack后端"
                }, {
                    "source": "BaoAI",
                    "target": "行业应用"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "HTML5"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "CSS"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "Javascript"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "JQuery"
                }, {
                    "source": "安装部署",
                    "target": "Supervisor"
                }, {
                    "source": "开发工具",
                    "target": "Gulp"
                }, {
                    "source": "开发工具",
                    "target": "Visual Studio Code"
                }, {
                    "source": "开发工具",
                    "target": "Git"
                }, {
                    "source": "开发工具",
                    "target": "Jupyter Notebook"
                }, {
                    "source": "安装部署",
                    "target": "Nginx"
                }, {
                    "source": "安装部署",
                    "target": "Gunicorn"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "Bootstrap"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "AngularJS"
                }, {
                    "source": "BaoAIFront前端",
                    "target": "ECharts"
                }, {
                    "source": "数据库",
                    "target": "Redis"
                }, {
                    "source": "数据库",
                    "target": "MySQL"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Flask"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Backtrader"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Python"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Pandas"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Scikit-learn"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Tensorflow"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Keras"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Numpy"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Celery"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "SQLAlchemy"
                }, {
                    "source": "BaoAIBack后端",
                    "target": "Scapy"
                }, {
                    "source": "行业应用",
                    "target": "金融量化"
                }, {
                    "source": "行业应用",
                    "target": "人工智能"
                }, {
                    "source": "行业应用",
                    "target": "大数据"
                }, {
                    "source": "行业应用",
                    "target": "企业门户"
                }, {
                    "source": "行业应用",
                    "target": "企业应用管理平台"
                }, {
                    "source": "行业应用",
                    "target": "任务调度平台"
                }],
                categories: [{
                    'name': 'BaoAI'
                }, {
                    'name': 'BaoAIFront前端'
                }, {
                    'name': '开发工具'
                }, {
                    'name': '安装部署'
                }, {
                    'name': '数据库'
                }, {
                    'name': 'BaoAIBack后端'
                }, {
                    'name': '行业应用'
                }],
                roam: false,
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: '{b}',
                        fontSize: 16,
                        fontStyle: '600',
                    }
                },
                lineStyle: {
                    normal: {
                        width: 4,
                        color: 'source',
                        curveness: 0,
                        type: "solid"
                    }
                },
                color: colors,
            }]
        };
        var clickFun2 = function(param) {
            console.log(param.name)
        }
        knowledgeChart.on("click", clickFun2);
        // 使用刚指定的配置项和数据显示图表。
        knowledgeChart.setOption(knowledge_option);
        $(window).resize(knowledgeChart.resize);       
    }  

    $(function(){
        $('.box').boxWidget()
        system_architecture(50) 
        knowledge_system()                
        // $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        //     // 获取已激活的标签页的名称
        //     // var activeTab = $(e.target).text(); 
        //     // 获取前一个激活的标签页的名称
        //     var previousTab = $(e.relatedTarget).text()
        //     var activeTab=$(e.target)[0].hash
        //     if(activeTab == "#tab-1"){
        //         //system_architecture(50)  
        //     }
        //     if(activeTab == "#tab-2"){
        //         knowledge_system()
        //     }
        //     return false
        // })      
    })    
  })
  
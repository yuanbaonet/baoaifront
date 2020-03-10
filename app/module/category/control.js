/*!
 * Category Module Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-08-04 10:04:19
 */
app.service('CategoryService', function($http, API_URL) {
  // view list 
  this.getList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "category/list",
      async: true,
      params: params.data,
    })
  }

  // add
  this.add = function(params) {
    return $http({
      url: API_URL + 'category/',
      async: true,      
      method: 'POST', 
      data: params, 
    })
  }

  // del
  this.del = function(params) {
    return $http({
      url: API_URL + 'category/',
      async: true,      
      method: 'DELETE', 
      data: params, 
    })
  }

  // edit
  this.edit = function(params) {
    return $http({
      url: API_URL + 'category/',
      async: true,      
      method: 'PUT', 
      data: params, 
    })
  }

  
  // category module tree menu 
  this.getCategoryMenu = function() {
    return $http({
      method: "GET",
      url: API_URL + "category/menu",
      async: true,
      params: {},
    })
  }
  // category module tree menu 
  this.getCategoryMenu = function() {
    return $http({
      method: "GET",
      url: API_URL + "category/menu",
      async: true,
      params: {},
    })
  }
  // view block module list 
  this.getBlockList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "block/list",
      async: true,
      params: params.data,
    })
  }
  
  // view articles module list 
  this.getArticlesList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "category/list_articles",
      params: params.data,
    })
  }

  // add Articles
  this.addArticles = function(params) {
    return $http({
      url: API_URL + 'category/articles',
      method: 'POST', 
      data: params, 
    })
  }

  // del Articles
  this.deleteArticles = function(params) {
    return $http({
      url: API_URL + 'category/articles',
      method: 'DELETE', 
      data: params, 
    })
  }

  // all record reorder
  this.reOrder = function() {
    return $http({
      url: API_URL + 'category/reorder',
      async: true,      
      method: 'GET', 
      params: {}, 
    })
  }
})

/*!
 * Category Module Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-08-04 10:04:19
 */
app.controller('categoryCtrl', function ($scope, $rootScope, I18nService, $state, $stateParams, $timeout, TreeService, STATIC_URL, CategoryService, ModuleService) {
    "use strict";  
    console.log("categoryCtrl...")  
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    $scope.s = ""  // Page status : add or edit // 页面状态 add / edit
    $scope.category = {}
    $scope.contentCkeditor = null //CKEDITOR.instances['content'];
    $scope.summaryCkeditor = null

    // get module i18n configs
    // if same key, module key will override the original key (configs.i18n)
    I18nService.i18n('category') 

    $scope.$watch('category.ismenu',function(){
      if($scope.category.ismenu){
        $scope.link_type_hide = true
      }else{
        $scope.link_type_hide = false
      }
    }) 

    $scope.link_type_change = function(){
      if($scope.category.link_type == 'Inner Link'){
        $scope.inner_link_hide = false
        $scope.link_target_hide = true
        $scope.link_hide = true
        $scope.block_link_hide = true
        $scope.article_link_hide = true  
        $scope.route_link_hide = true        
      }else if($scope.category.link_type == 'Outer Link'){
        $scope.inner_link_hide = true
        $scope.link_target_hide = false
        $scope.link_hide = false
        $scope.block_link_hide = true
        $scope.article_link_hide = true 
        $scope.route_link_hide = true         
      }else if($scope.category.link_type == 'Article Link'){
        $scope.inner_link_hide = true
        $scope.link_target_hide = true
        $scope.link_hide = true
        $scope.block_link_hide = true
        $scope.article_link_hide = false 
        $scope.route_link_hide = true         
      }else if($scope.category.link_type == 'Block Link'){
        $scope.inner_link_hide = true
        $scope.link_target_hide = true
        $scope.link_hide = true
        $scope.block_link_hide = false
        $scope.article_link_hide = true 
        $scope.route_link_hide = true         
      }else if($scope.category.link_type == 'Route Link'){
        $scope.inner_link_hide = true
        $scope.link_target_hide = true
        $scope.link_hide = true
        $scope.block_link_hide = true
        $scope.article_link_hide = true 
        $scope.route_link_hide = false         
      }
    }

    /*!
     * table 
     */
    // init table 
    function initTable() {
      $table.bootstrapTable('destroy').bootstrapTable({
        height: 850,
        pagination: true,
        showPaginationSwitch: false,
        search: true,
        ajax: ajaxRequest,
        pageSize: 50,
        pageList: [50, 100, 150, 300],
        responseHandler: responseHandler,
        detailFormatter: detailFormatter,
        columns: [
          [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
          }, {
            title: 'ID',
            field: 'id',
            align: 'center',
            valign: 'middle',
            sortable: true,
          }, {
            field: 'cover',
            title: $rootScope.t('Preview'),
            sortable: false,
            align: 'left',
            formatter: previewFormatter
          }, {
            title: $rootScope.t('User ID'),
            field: 'uid',
            sortable: true,
            align: 'center',
          }, {
            field: 'ismenu',
            title: $rootScope.t('Menu'),
            sortable: false,
            align: 'center',
          }, {
            field: 'pid',
            title: $rootScope.t('Parents'),
            sortable: true,
            align: 'center',
          }, {
            field: 'title',
            title: $rootScope.t('Title'),
            sortable: true,
            align: 'left',
            formatter: titleFormatter,
          }, {
            field: 'alias',
            title: $rootScope.t('Alias'),
            sortable: false,
            align: 'center',
          }, {
            field: 'weight',
            title: $rootScope.t('Weight'),
            sortable: true,
            align: 'center',
          }, {
            field: 'link_type',
            title: $rootScope.t('Link Type'),
            sortable: false,
            align: 'center',
          }, {
            field: 'inner_link',
            title: $rootScope.t('Inner Link'),
            sortable: false,
            align: 'center',
          }, {
            field: 'link_target',
            title: $rootScope.t('Link Target'),
            sortable: false,
            align: 'center',
          }, {
            field: 'link',
            title: $rootScope.t('Link'),
            sortable: false,
            align: 'center',
          }, {
            field: 'block_link',
            title: $rootScope.t('Block Link'),
            sortable: false,
            align: 'center',
          }, {
            field: 'article_link',
            title: $rootScope.t('Article Link'),
            sortable: false,
            align: 'center',
          },{
            field: 'operate',
            title: $rootScope.t('Operate'),
            align: 'center',
            events: window.operateEvents,
            formatter: operateFormatter
          }]
        ]
      })

      // checkbox event
      $table.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table',
        function () {
          $remove.prop('disabled', !$table.bootstrapTable('getSelections').length)
          selections = getIdSelections()
      })

      // Triggered when clicking the detail icon to expand the detail page // 当点击详细图标展开详细页面的时候触发
      $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        // to do
      })

      // All events trigger the event, including name: event name, args: event parameters. // 所有的事件都会触发该事件，参数包括：name：事件名，args：事件的参数
      $table.on('all.bs.table', function (e, name, args) {
        //console.log(name, args)
      })
    
    }

    /*!
    * Table feature function 
    */
    // ajax get table init data list
    function ajaxRequest(params) {
      //params.data.lang = $rootScope.lang
      CategoryService.getList(params).then(function successCallback(response) {
        params.success(response.data)
      }).catch(function errorCallback(error) {

      })
    }
    
    // Get the ID selected in the check box // 获取复选框选中的ID
    function getIdSelections() {
      return $.map($table.bootstrapTable('getSelections'), function (row) {
        return row.id
      })
    }

    // Processing each table record, selected, with a status value of true or false // 处理每条表格记录，被选中，状态值为true , 否则为false
    function responseHandler(res) {
      $.each(res.rows, function (i, row) {
        row.state = $.inArray(row.id, selections) !== -1
      })
      return res
    }

    // Detail Formatter // 详细信息格式化
    function detailFormatter(index, row) {
      var html = []
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
      })
      return html.join('')
    }

    // title Style Formatter // 标题样式格式化
    function titleFormatter(value, row, index) {
      var value = $rootScope.t(value)
      if(row.treegrade == 1){

      }else{
        for (var i = 1;i< row.treegrade;i++){
          value = '├&nbsp;&nbsp;' + value
        } 
      }
      if(row.treegrade==1) value = '<span class="text-success">'+value+'</span>'
      else if(row.treegrade==2) value = '<span class="text-info">'+value+'</span>'
      else if(row.treegrade==3) value = '<span class="text-warning">'+value+'</span>'
      else if(row.treegrade==4) value = '<span class="text-danger">'+value+'</span>'
      else value = '<span class="text-muted">'+value+'</span>'    
      return value
    }

    function previewFormatter(value, row, index) {
      if($.emp(value)){
        return ""
      }
      return '<a href="javascript:void(0)" class="view-image" title="' + row.title + '" target="_blank" onclick="viewImage(\'' + STATIC_URL + value + '\', \'' + row.title + '\', ' + row.id + ')">' + 
      '<img src="' + STATIC_URL + value + '" width="50px" height="50px" alt="' + row.title + '" >' +
      '</a>'
    }
    
    // Operation Style Formatter // 操作样式格式化
    function operateFormatter(value, row, index) {
      return [
        '<a class="btn btn-xs btn-success edit" href="javascript:void(0)" title="' + $rootScope.t('Edit') + '">',
        '<i class="fa fa-pencil"></i>',
        '</a> ',
        '<a class="btn btn-xs btn-danger remove" href="javascript:void(0)" title="' + $rootScope.t('Delete') + '">',
        '<i class="fa fa-trash"></i>',
        '</a> ',
        '<a class="btn btn-xs btn-info attachment" href="javascript:void(0)" title="' + $rootScope.t('Attachments') + '">',
        '<i class="fa fa-file-o"></i>',
        '</a> ',
        '<a class="btn btn-xs btn-primary articles" href="javascript:void(0)" title="' + $rootScope.t('Articles') + '">',
        '<i class="fa fa-search-plus"></i>',
        '</a> ',
        '<a class="btn btn-xs btn-primary related_articles" href="javascript:void(0)" title="' + $rootScope.t('Related') + '">',
        '<i class="fa fa-angle-double-right"></i>',
        '</a> ',
      ].join('')
    }

    // Operate Events // 操作事件
    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.category = {}
        $scope.s = 'edit'
        $scope.category = angular.copy(row)
        if($.emp($scope.category.content)){
          $scope.contentCkeditor.setData('')
        }else{
          $scope.contentCkeditor.setData($scope.category.content)
        }
        if($.emp($scope.category.summary)){
          $scope.summaryCkeditor.setData('')
        }else{
          $scope.summaryCkeditor.setData($scope.category.summary)
        }

        if($.emp($scope.category.link_type)){
          $scope.inner_link_hide = true
          $scope.link_target_hide = true
          $scope.link_hide = true
          $scope.block_link_hide = true
          $scope.article_link_hide = true  
          $scope.route_link_hide = true        
        }else if($scope.category.link_type == 'Inner Link'){
          $scope.inner_link_hide = false
          $scope.link_target_hide = true
          $scope.link_hide = true
          $scope.block_link_hide = true
          $scope.article_link_hide = true  
          $scope.route_link_hide = true        
        }else if($scope.category.link_type == 'Outer Link'){
          $scope.inner_link_hide = true
          $scope.link_target_hide = false
          $scope.link_hide = false
          $scope.block_link_hide = true
          $scope.article_link_hide = true 
          $scope.route_link_hide = true         
        }else if($scope.category.link_type == 'Article Link'){
          $scope.inner_link_hide = true
          $scope.link_target_hide = true
          $scope.link_hide = true
          $scope.block_link_hide = true
          $scope.article_link_hide = false 
          $scope.route_link_hide = true         
        }else if($scope.category.link_type == 'Block Link'){
          $scope.inner_link_hide = true
          $scope.link_target_hide = true
          $scope.link_hide = true
          $scope.block_link_hide = false
          $scope.article_link_hide = true 
          $scope.route_link_hide = true         
        }else if($scope.category.link_type == 'Route Link'){
          $scope.inner_link_hide = true
          $scope.link_target_hide = true
          $scope.link_hide = true
          $scope.block_link_hide = true
          $scope.article_link_hide = true 
          $scope.route_link_hide = false         
        }               
        
        CategoryService.getCategoryMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t("Top"), 
            "value": 0,
            "children": tree
          }]
          var root_pid = $scope.category.pid
          if($.emp(root_pid)){
            root_pid = rootNode[0].value
            $scope.category.pid = rootNode[0].value
          }
          $('.treeSelector_pid').treeSelector(rootNode, [root_pid], function (e, values) {
            $scope.category.pid = values.join(",")
          }, { 
            checkWithParent: false, 
            titleWithParent: false,
            notViewClickParentTitle: false
          })
        })
        
        CategoryService.getCategoryMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t("Top"), 
            "value": 0,
            "children": tree
          }]
          var root_inner_link = $scope.category.inner_link
          if($.emp(root_inner_link)){
            root_inner_link = rootNode[0].value
            $scope.category.inner_link = rootNode[0].value
          }
          $('.treeSelector_inner_link').treeSelector(rootNode, [root_inner_link], function (e, values) {
            $scope.category.inner_link = values.join(",")
          }, { 
            checkWithParent: false, 
            titleWithParent: false,
            notViewClickParentTitle: false
          })
        })
        var params = {}
        params.data = {}
        params.data.limit = 200
        params.data.offset = 0
        params.data.order = 'asc'
        params.data.search = ''
        //params.data.lang = $rootScope.lang
        CategoryService.getBlockList(params).then(function successCallback(response) { 
            $scope.block_block_link = response.data.rows
            $scope.category.block_link = row.block_link.toString()      
        })        
        $scope.$apply()
        $('#modal-add-edit').modal('show')
        $('#add-edit-form').validator('validate')
      },
      'click .remove': function (e, value, row, index) {
        ModuleService.del(CategoryService, row.title, row.id, $table)
      },
      'click .attachment': function (e, value, row, index) {
        $state.go("app.system_manager.attachments",{module_name: 'category', module_obj_id: row.id})
      },
      'click .articles': function (e, value, row, index) {
        $scope.category.articles = row.id
        $('#modalTable_articles').modal('show')
        initTable_articles()
      },
      'click .related_articles': function (e, value, row, index) {
        $state.go("app.cms.articles",{category_id: row.id})
      },
      
    }

    // add event // 增加按钮事件处理
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add-edit').modal('show')
      $scope.category = {}
      $scope.category.lang = $rootScope.lang
      $scope.category.pid = '0'
      $scope.category.weight = 0
      $scope.category.inner_link = '0'
      $scope.category.link_target = '_blank'
      $scope.category.ismenu = true
      $scope.inner_link_hide = true
      $scope.link_type_hide = true
      $scope.link_target_hide = true
      $scope.link_hide = true
      $scope.block_link_hide = true
      $scope.article_link_hide = true
      $scope.route_link_hide = true
      //$scope.category.lang = $rootScope.lang
      $scope.category.uid = $rootScope.user.uid
      $scope.contentCkeditor.setData('')
      $scope.summaryCkeditor.setData('')      
        CategoryService.getCategoryMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t("Top"), 
            "value": 0,
            "children": tree
          }]
          var root_pid = $scope.category.pid
          if($.emp(root_pid)){
            root_pid = rootNode[0].value
            $scope.category.pid = rootNode[0].value
          }
          $('.treeSelector_pid').treeSelector(rootNode, [root_pid], function (e, values) {
            $scope.category.pid = values.join(",")
          }, { 
            checkWithParent: false, 
            titleWithParent: false,
            notViewClickParentTitle: false
          })
        })
        
        CategoryService.getCategoryMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t("Top"), 
            "value": 0,
            "children": tree
          }]
          var root_inner_link = $scope.category.inner_link
          if($.emp(root_inner_link)){
            root_inner_link = rootNode[0].value
            $scope.category.inner_link = rootNode[0].value
          }
          $('.treeSelector_inner_link').treeSelector(rootNode, [root_inner_link], function (e, values) {
            $scope.category.inner_link = values.join(",")
          }, { 
            checkWithParent: false, 
            titleWithParent: false,
            notViewClickParentTitle: false
          })
        })
        var params = {}
        params.data = {}
        params.data.limit = 200
        params.data.offset = 0
        params.data.order = 'asc'
        params.data.search = ''
        //params.data.lang = $rootScope.lang
        CategoryService.getBlockList(params).then(function successCallback(response) { 
            $scope.block_block_link = response.data.rows
            $scope.category.block_link = row.block_link.toString()      
        })
      $scope.category.articles = $stateParams.articles                
      $scope.$apply()
    })

    // delete event // 删除按钮单击事件处理
    $remove.click(function () {
      ModuleService.dels(CategoryService, $table, $remove, getIdSelections)
    })

    // Order event // 排序事件处理
    $("#order").click(function(){
      BootstrapDialog.confirm({
        title: $rootScope.t("Order"),
        message: $rootScope.t("OK OR CANCEL"),
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
              Pace.restart()
              CategoryService.reOrder().then(function successCallback(response) { 
                toastr.success($rootScope.t("Success"), $rootScope.t("Order")) 
              }).catch(function errorCallback(error) {
                  var message = $rootScope.t("Internal Server Error")
                  if (error.status == 500){
                    message = error.data.message
                  }
                  toastr.error(message, $rootScope.t("Order")) 
              })  
            }else {
              toastr.info($rootScope.t("Cancel"), $rootScope.t("Delete"))   
            }
        }
      });     
    })

    // configs click event // 配置参数按钮事件处理
    $("#configs").click(function(){
      $state.go("app.system_manager.configs",{module_name:'category'})
    })   
    
    var $table_article_link = $('#table_article_link')
    var $choice_article_link = $('#choice_article_link')
    function initTable_article_link(){
      $table_article_link.bootstrapTable('destroy').bootstrapTable({
        height: 550,
        pagination: true,
        showPaginationSwitch: false,
        search: true,
        ajax: ajaxRequest_article_link,
        pageSize: 10,
        pageList: [10, 20, 30, 100],
        responseHandler: responseHandler_article_link,
        detailFormatter: detailFormatter_article_link,
        columns: [
          [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
          }, {
            title: 'ID',
            field: 'id',
            align: 'center',
            valign: 'middle',
            sortable: true,
          }, {
            title: $rootScope.t('title'),
            field: 'title',
            sortable: true,
            align: 'center',
          }]
        ]
      })

      // checkbox event
      $table_article_link.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table',
        function () {
          $choice_article_link.prop('disabled', !$table_article_link.bootstrapTable('getSelections').length)
          selections = getIdSelections_article_link()
      })

      // Triggered when clicking the detail icon to expand the detail page // 当点击详细图标展开详细页面的时候触发
      $table_article_link.on('expand-row.bs.table', function (e, index, row, $detail) {
        // to do
      })

      // All events trigger the event, including name: event name, args: event parameters. // 所有的事件都会触发该事件，参数包括：name：事件名，args：事件的参数
      $table_article_link.on('all.bs.table', function (e, name, args) {
        //console.log(name, args)
      })   
    }

    /*!
    * Table feature function 
    */
    // ajax get table init data list
    function ajaxRequest_article_link(params) {
      params.data.lang = $rootScope.lang
      search = params.data.search
      if(!$.emp(search) && search.indexOf('id=')!=0 ){
        //
      }else if(search.indexOf('id=')==0 && search.length==3){
        params.data.search = ""
      }else if(search.indexOf('id=')==0 && search.length>3){
        //
      }
      else{
        if(!$.emp($scope.category.article_link)){
          params.data.search = 'id=' + $scope.category.article_link.toString()
        }
      } 
      CategoryService.getArticlesList(params).then(function successCallback(response) {
        params.success(response.data)
      }).catch(function errorCallback(error) {

      })
    }
    
    // Get the ID selected in the check box // 获取复选框选中的ID
    function getIdSelections_article_link() {
      return $.map($table_article_link.bootstrapTable('getSelections'), function (row) {
        return row.id
      })
    }

    // Processing each table record, selected, with a status value of true or false // 处理每条表格记录，被选中，状态值为true , 否则为false
    function responseHandler_article_link(res) {
      $.each(res.rows, function (i, row) {
        row.state = $.inArray(row.id, selections) !== -1
      })
      return res
    }

    // Detail Formatter // 详细信息格式化
    function detailFormatter_article_link(index, row) {
      var html = []
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
      })
      return html.join('')
    }

    $('#modalTable_article_link').on('shown.bs.modal', function () {
      $table_article_link.bootstrapTable('resetView')
    })

    // Bug Fix: scroll exceptions caused by two mode boxes // 修复两模式框产生的滚动异常
    $('#modalTable_article_link').on("hidden.bs.modal", function () {
      $(this).removeData("bs.modal")
      $(document.body).addClass("modal-open")
    })

    $("#btn_article_link").click(function(){
      $('#modalTable_article_link').modal('show')
      initTable_article_link()
    }) 

    // delete event // 删除按钮单击事件处理
    $choice_article_link.click(function () {
        Pace.restart()
        var ids = getIdSelections_article_link()
        $scope.category.article_link = ids[0]
        $('#modalTable_article_link').modal('hide')
        $scope.$apply()
    })
    
    var $table_articles = $('#table_articles')
    var $choice_articles = $('#choice_articles')
    var $remove_articles = $('#remove_articles')
    function initTable_articles(){
      $table_articles.bootstrapTable('destroy').bootstrapTable({
        height: 550,
        pagination: true,
        showPaginationSwitch: false,
        search: true,
        ajax: ajaxRequest_articles,
        pageSize: 10,
        pageList: [10, 20, 30, 100],
        responseHandler: responseHandler_articles,
        detailFormatter: detailFormatter_articles,
        columns: [
          [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
          }, {
            title: 'ID',
            field: 'id',
            align: 'center',
            valign: 'middle',
            sortable: true,
          }, {
            title: $rootScope.t('title'),
            field: 'title',
            sortable: true,
            align: 'center',
          }]
        ]
      })

      // checkbox event
      $table_articles.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table',
        function () {
          $choice_articles.prop('disabled', !$table_articles.bootstrapTable('getSelections').length)
          $remove_articles.prop('disabled', !$table_articles.bootstrapTable('getSelections').length)
          selections = getIdSelections_articles()
      })

      // Triggered when clicking the detail icon to expand the detail page // 当点击详细图标展开详细页面的时候触发
      $table_articles.on('expand-row.bs.table', function (e, index, row, $detail) {
        // to do
      })

      // All events trigger the event, including name: event name, args: event parameters. // 所有的事件都会触发该事件，参数包括：name：事件名，args：事件的参数
      $table_articles.on('all.bs.table', function (e, name, args) {
        //console.log(name, args)
      })   
    }

    /*!
    * Table feature function 
    */
    // ajax get table init data list
    function ajaxRequest_articles(params) {
      params.data.lang = $rootScope.lang
      search = params.data.search
      articles = $scope.category.articles
      if(!$.emp(search) && search.indexOf('id=')!=0 ){
        //
      }else if(search.indexOf('id=')==0 && search.length==3){
        params.data.search = ""
      }else if(search.indexOf('id=')==0 && search.length>3){
        //
      }
      else{
         if(!$.emp(articles)){
           params.data.search = 'ids=' + articles.toString()
         }
      } 
      CategoryService.getArticlesList(params).then(function successCallback(response) {
        params.success(response.data)
      }).catch(function errorCallback(error) {

      })
    }
    
    // Get the ID selected in the check box // 获取复选框选中的ID
    function getIdSelections_articles() {
      return $.map($table_articles.bootstrapTable('getSelections'), function (row) {
        return row.id
      })
    }

    // Processing each table record, selected, with a status value of true or false // 处理每条表格记录，被选中，状态值为true , 否则为false
    function responseHandler_articles(res) {
      $.each(res.rows, function (i, row) {
        row.state = $.inArray(row.id, selections) !== -1
      })
      return res
    }

    // Detail Formatter // 详细信息格式化
    function detailFormatter_articles(index, row) {
      var html = []
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
      })
      return html.join('')
    }

    $('#modalTable_articles').on('shown.bs.modal', function () {
      $table_articles.bootstrapTable('resetView')
    })

    // Bug Fix: scroll exceptions caused by two mode boxes // 修复两模式框产生的滚动异常
    $('#modalTable_articles').on("hidden.bs.modal", function () {
      $(this).removeData("bs.modal")
      $(document.body).addClass("modal-open")
    })

    $("#btn_articles").click(function(){
      $('#modalTable_articles').modal('show')
      initTable_articles()
    }) 

    // add event 
    $choice_articles.click(function () {
        //Pace.restart()
        $scope.$apply()
        BootstrapDialog.confirm({
          title: $rootScope.t("Add"),
          message: $rootScope.t("OK OR CANCEL"),
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
                //Pace.restart()
                var ids = getIdSelections_articles()
                var uid = $scope.category.articles
                var params = {}
                params.uid = uid
                params.ids = ids
                CategoryService.addArticles(params).then(function successCallback(response) {
                  toastr.success($rootScope.t("Success"), $rootScope.t("Add")) 
                  $choice_articles.prop('disabled', true)
                  $table.bootstrapTable('refresh')
                  $('#modalTable_articles').modal('hide')
                }).catch(function errorCallback(error) {
                    var message = $rootScope.t("Internal Server Error")
                    if (error.status == 500){
                      message = error.data.message
                    }
                    toastr.error(message, $rootScope.t("Add"))
                })  
              }else {
                toastr.info($rootScope.t("Cancel"), $rootScope.t("Delete"))   
              }
          }
        }); 
    })

    // remove event 
    $remove_articles.click(function () {
      Pace.restart()
      $scope.$apply()
      BootstrapDialog.confirm({
        title: $rootScope.t("Delete"),
        message: $rootScope.t("OK OR CANCEL"),
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
              Pace.restart()
              var ids = getIdSelections_articles()
              var uid = $scope.category.articles
              var params = {}
              params.uid = uid
              params.ids = ids
              CategoryService.deleteArticles(params).then(function successCallback(response) {
                toastr.success($rootScope.t("Success"), $rootScope.t("Delete")) 
                $remove_articles.prop('disabled', true)
                $table.bootstrapTable('refresh')
                $('#modalTable_articles').modal('hide')
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
    })

    function addParams(){
      var params = $scope.category
      params.content = $scope.contentCkeditor.getData()
      params.summary = $scope.summaryCkeditor.getData() 
      return params
    }
  
    function editParams(){
      var params = $scope.category
      params.content = $scope.contentCkeditor.getData()
      params.summary = $scope.summaryCkeditor.getData() 
      return params
    }
    
    $(function(){
      // init table // 初始化表格
      $timeout(function(){
        $scope.contentCkeditor = CKEDITOR.instances.content
        $scope.summaryCkeditor = CKEDITOR.instances.summary
        initTable()
      }, 0);       
      ModuleService.add_edit(CategoryService, $table, $scope, addParams, editParams)   
      $('.modal').on('shown.bs.modal', function (e) {//赋值
        $(this).draggable({
          handle: ".modal-header"   // 只能点击头部拖动
        });
        // $(this).css("overflow", "hidden");
      });
    })

})




  
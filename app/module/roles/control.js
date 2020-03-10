"use strict";
/*!
 * Roles Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('RolesService', function($http, API_URL) {
    // view
    this.getList = function(params) {
      return $http({
        method: "GET",
        cache: false,
        url: API_URL + "roles/list",
        params: params.data,
      })
    }

    // add
    this.add = function(params) {
      return $http({
        url: API_URL + 'roles/',
        method: 'POST', 
        data: params, 
      })
    }

    // get roles menu
    this.getRolesMenu = function() {
      return $http({
        url: API_URL + 'roles/menu',
        method: 'GET', 
        params: {}, 
      })
    }

    // get all resources 
    this.getResourcesAll = function() {
      return $http({
        url: API_URL + 'resources/all',
        method: 'GET', 
        params: {}, 
      })
    }

    // del
    this.del = function(params) {
      return $http({
        url: API_URL + 'roles/',
        method: 'DELETE', 
        data: params, 
      })
    }

    // edit
    this.edit = function(params) {
      return $http({
        url: API_URL + 'roles/',
        method: 'PUT', 
        data: params, 
      })
    }
})

/*!
 * Roles Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('rolesCtrl', function ($scope, $rootScope, $timeout, SecurityService, $http, API_URL, ModuleService, RolesService, TreeService) {
    console.log("rolesCtrl...");
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    $scope.s = ""  // Page status : add or edit // 页面状态 add / edit

    /*!
     * table 
     */
    // init table 
    function initTable() {
      $table.bootstrapTable('destroy').bootstrapTable({
        height: 550,
        pagination: true,
        showPaginationSwitch: false,
        search: true,
        cache: false, //bootstrapTable进行表格数据的绑定，在谷歌、火狐等常用的浏览器上都是没有问题，在ie浏览器上使用bootstrapTable重新加载数据没有请求后台，而是直接才ie缓存中获取。
        ajax: ajaxRequest,
        pageSize: 100,
        pageList: [100, 125, 150, 200],
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
            sortable: false,
          }, {
            field: 'ntitle',
            title: $rootScope.t('Title'),
            sortable: false,
            align: 'left',
          }, {
            field: 'pid',
            title: $rootScope.t('Parents'),
            sortable: false,
            align: 'center',
          },{
            field: 'weight',
            title: $rootScope.t('Weight'),
            sortable: false,
            align: 'center',
          },{
            field: 'status',
            title: $rootScope.t('Status'),
            sortable: false,
            align: 'center',
            formatter: statusFormatter
          },{
            field: 'locked',
            title: $rootScope.t('Locked'),
            sortable: true,
            align: 'center',
            formatter: lockedFormatter,
          },{
            field: 'operate',
            title: $rootScope.t('Operate'),
            align: 'center',
            events: window.operateEvents,
            formatter: operateFormatter
          }]
        ]
      })
  
      $table.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table',
        function () {
          $remove.prop('disabled', !$table.bootstrapTable('getSelections').length)
          // save your data, here just save the current page
          selections = getIdSelections()
          // push or splice the selections if you want to save all data selections
      })
  
      $table.on('expand-row.bs.table', function (e, index, row, $detail) {
      })
  
      $table.on('all.bs.table', function (e, name, args) {
        //console.log(name, args)
      }) 
    }

    /*!
    * Table feature function 
    */
    // ajax get table init data list
    function ajaxRequest(params) {
      RolesService.getList(params).then(function successCallback(response) {
        var json = angular.copy(response.data.rows)
        var tree=TreeService.listToTree(json,0); 
        var option = TreeService.createSelectTree(tree)
        var ntree = TreeService.createOrderTree(tree, '&nbsp;&nbsp;├&nbsp;&nbsp;')
        response.data.rows = ntree
        params.success(response.data)
      }).catch(function errorCallback(error) {
  
      })
    }
  
    function getIdSelections() {
      return $.map($table.bootstrapTable('getSelections'), function (row) {
        return row.id
      })
    }
  
    function responseHandler(res) {
      $.each(res.rows, function (i, row) {
        row.state = $.inArray(row.id, selections) !== -1
      })
      return res
    }
  
    function detailFormatter(index, row) {
      var html = []
      var id = 0
      var resources = ""
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
        if(key=='id'){
            id = value
        }else if(key=='resources'){
            resources = value
        }
      })
      html.push('<p><b>'+ $rootScope.t("Resources") + ':</b><div class="resources-container" style="width:100%"><div class="treeSelectorResourcesDetail"></div></div> </p>')
      RolesService.getResourcesAll().then(function successCallback(response) { 
        var json = response.data
        var tree=TreeService.listToTree(json,0)
        $('.treeSelectorResourcesDetail').treeSelectorCheckbox(tree, [resources], function (e, values) {
            //console.info('onChange', e, values);
          }, { 
            checkWithParent: true, 
            titleWithParent: true,
            notViewClickParentTitle: true,
            disabled:true
          })
      })
      return html.join('')
    }

    // Locked Style Formatter // 锁定样式格式化
    function lockedFormatter(value, row, index) {
      if(value) return '<span class="text-success"><i class="fa fa-circle"></i>' + $rootScope.t('Locked') + '</span>'
      else return '<span class="text-danger"><i class="fa fa-circle"></i>' + $rootScope.t('UnLocked') + '</span>'
    }
    
    // Operation Style Formatter // 操作样式格式化
    function operateFormatter(value, row, index) {
      return [
        '<a class="btn btn-xs btn-success edit" href="javascript:void(0)" title="' + $rootScope.t('Edit') + '">',
        '<i class="fa fa-pencil"></i>',
        '</a>  ',
        '<a class="btn btn-xs btn-danger remove" href="javascript:void(0)" title="' + $rootScope.t('Delete') + '">',
        '<i class="fa fa-trash"></i>',
        '</a>'
      ].join('')
    }

    function statusFormatter(value, row, index) {
        if(value == 1) return '<span class="text-success"><i class="fa fa-circle"></i>' + $rootScope.t('Normal') + '</span>'
        else if(value == 0) return '<span class="text-danger"><i class="fa fa-circle"></i>' + $rootScope.t('Pause') + '</span>'
        else return '<span class="text-danger"><i class="fa fa-circle"></i>' + $rootScope.t('Delete') + '</span>'
    }

    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        //alert('You click , row: ' + JSON.stringify(row))
        $scope.roles = {}
        $scope.s = 'edit'
        $scope.roles = row
        $('#modal-add-edit').modal('show')        
        RolesService.getRolesMenu().then(function successCallback(response) { 
            var json = response.data
            var tree=TreeService.listToTree(json,0)
            var rootNode = [{
              "id": 0,
              "title": $rootScope.t('Top'), 
              "value": 0,
              "children": tree
            }]       
            $('.treeSelector').treeSelector(rootNode, [row.pid], function (e, values) {
              $scope.roles.pid = values.join(",")
            }, { 
              checkWithParent: false, 
              titleWithParent: false,
              notViewClickParentTitle: false
            })
        })

        RolesService.getResourcesAll().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t('Top'), 
            "value": 0,
            "children": tree
          }] 
          $('.treeSelectorResources').treeSelectorCheckbox(rootNode, eval('['+row.resources+']'), function (e, values) {
            $scope.roles.resources = values.join(",")
          }, { 
            checkWithParent2: true, 
            titleWithParent: true,
            notViewClickParentTitle: true
          })
        })

        
      },
      'click .remove': function (e, value, row, index) {
            ModuleService.del(RolesService, row.title, row.id, $table)
      }
    }
  
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add-edit').modal('show')
      $scope.roles = {}
      $scope.roles.status = true
      $scope.roles.pid = 0
      $scope.roles.resources = "0"
      RolesService.getRolesMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t('Top'), 
            "value": 0,
            "children": tree
          }]     
          $('.treeSelector').treeSelector(rootNode, [0], function (e, values) {
            $scope.roles.pid = values.join(",")
          }, { 
            checkWithParent: false, 
            titleWithParent: true,
            notViewClickParentTitle: false
          })
      })
      RolesService.getResourcesAll().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t('Top'), 
            "value": 0,
            "children": tree
          }] 
    
          $('.treeSelectorResources').treeSelectorCheckbox(rootNode, [0], function (e, values) {
            $scope.roles.resources = values.join(",")
          }, { 
            checkWithParent2: true, 
            titleWithParent: true,
            notViewClickParentTitle: true
          })
      })
    })

    $remove.click(function () {
      ModuleService.dels(RolesService, $table, $remove, getIdSelections)
    })

    function addParams(){
      // Save the original title, not the translated title // 保存原标题，而不是语言转换后的标题
      var params = $scope.roles
      params.title = params.otitle
      return params
    }

    function editParams(){
      var params = $scope.roles
      params.title = params.otitle
      return params
    }
  
    $(function(){
      $timeout(initTable, 0);  
      ModuleService.add_edit(RolesService, $table, $scope, addParams, editParams)
    })
})


  
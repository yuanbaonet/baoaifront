"use strict";
/*!
 * Admin Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('AdminService', function($http, API_URL) {

    // list
    this.getList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "admin/list",
        async: true,
        params: params.data,
      })
    }

    // add
    this.add = function(params) {
      return $http({
        url: API_URL + 'admin/',
        async: true,      
        method: 'POST', 
        data: params, 
      })
    }

    // edit
    this.edit = function(params) {
      return $http({
        url: API_URL + 'admin/',
        async: true,      
        method: 'PUT', 
        data: params, 
      })
    }

    // del
    this.del = function(params) {
      return $http({
        url: API_URL + 'admin/',
        async: true,      
        method: 'DELETE', 
        data: params, 
      })
    }

    // 找回密码
    // this.find_pass = function(params) {
    //   return $http({
    //     url: API_URL + 'admin/find_pass',
    //     async: true,      
    //     method: 'POST', 
    //     data: params, 
    //   })
    // }

    // get own rbac
    this.getRBAC = function() {
      return $http({
        url: API_URL + 'admin/rbac',
        method: 'GET', 
        params: {}, 
      })
    }

    // get all rbac
    this.getRBACByUid = function(params) {
      return $http({
        url: API_URL + 'admin/rbac',
        method: 'POST', 
        data: params, 
      })
    }

    // get roles menu
    this.getRolesMenu = function() {
      return $http({
        url: API_URL + 'roles/menu',
        async: true,      
        method: 'GET', 
        params: {}, 
      })
    }

    // add role
    this.add_role = function(params) {
      return $http({
        url: API_URL + 'admin/adminroles',
        async: true,      
        method: 'POST', 
        data: params, 
      })
    }
})

/*!
 * Admin Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('adminCtrl', function ($scope, $rootScope, $timeout, $compile, $http, API_URL, ModuleService, TreeService, AdminService) {
    console.log("adminCtrl...");
    var $table = $('#table')
    var $remove = $('#remove')
    var $role = $('#role')
    var selections = []   

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
        ajax: ajaxRequest,
        pageSize: 10,
        pageList: [10, 25, 50, 100],
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
            field: 'username',
            title: $rootScope.t('Account'),
            sortable: true,
            align: 'center',
          }, {
            field: 'nickname',
            title: $rootScope.t('Nickname'),
            sortable: true,
            align: 'center',
          },{
            field: 'email',
            title: 'Email',
            sortable: true,
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
        $role.prop('disabled', !$table.bootstrapTable('getSelections').length)
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
      AdminService.getList(params).then(function successCallback(response) {  
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
      $scope.roles_titles = ""
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
        if(key=='id'){
          id = value
        }
      })
      html.push('<p><b>'+$rootScope.t('Roles')+':</b> <span id=rolesofuid></span> </p>')
      var params = {}
      params.id = id
      AdminService.getRBACByUid(params).then(function successCallback(response) { 
        var roles = response.data
        //$scope.roles_titles = roles.titles
        $('#rolesofuid').html(roles.titles)
      })

      return html.join('')
    }
  
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

    // Locked Style Formatter // 锁定样式格式化
    function lockedFormatter(value, row, index) {
      if(value) return '<span class="text-success"><i class="fa fa-circle"></i>' + $rootScope.t('Locked') + '</span>'
      else return '<span class="text-danger"><i class="fa fa-circle"></i>' + $rootScope.t('UnLocked') + '</span>'
    }

    // 操作事件  
    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.user = {}
        $scope.user = row
        $('#modal-edit').modal('show')
        var rids = []
        var params = {}
        params.id = row.id
        AdminService.getRBACByUid(params).then(function successCallback(response) { 
          var roles = response.data
          rids = roles.rids
          var rids_str = roles.rids_str
          $scope.user.roles = rids_str
          AdminService.getRolesMenu().then(function successCallback(response) { 
            var json = response.data
            var tree=TreeService.listToTree(json,0)
            $('.edit-treeSelector').treeSelectorCheckbox(tree, rids, function (e, values) {
                $scope.user.roles = values
            }, { 
                checkWithParent2: true, 
                titleWithParent: true,
                notViewClickParentTitle: true
            })
          })
        })
      },
      'click .remove': function (e, value, row, index) {
        ModuleService.del(AdminService, row.username, row.id, $table)
      }
    }

    $("#add").click(function(){      
      $scope.s = 'add'      
      $('#modal-default').modal('show')
      $scope.admin = {}
      $scope.$apply()
    })

    $role.click(function(){
      $scope.s = 'role'      
      $('#modal-role').modal('show')
      $scope.role = {}
      AdminService.getRolesMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,0)
          var rootNode = [{
            "id": 0,
            "title": $rootScope.t('Top'), 
            "value": 0,
            "children": tree
          }] 
          var ids = getIdSelections()
          $scope.role.ids = ids
          $scope.role.roles = 0
          $('.role-treeSelector').treeSelectorCheckbox(tree, [2], function (e, values) {
            $scope.role.roles = values
          }, { 
            checkWithParent: true, 
            titleWithParent: true,
            notViewClickParentTitle: false
          })
      })
    })

    $remove.click(function () {
      ModuleService.dels(AdminService, $table, $remove, getIdSelections)
    })

    $(function(){
      $timeout(initTable, 0); 

      var formObj = $('#add-form').validator({
        feedback: {
          success: 'glyphicon-ok',
          error: 'glyphicon-remove'
        }
      })

      var formObj_edit = $('#edit-form').validator({
        feedback: {
          success: 'glyphicon-ok',
          error: 'glyphicon-remove'
        },
      })

      var formObj_role = $('#add-role').validator({
        feedback: {
          success: 'glyphicon-ok',
          error: 'glyphicon-remove'
        },
      })

      formObj.on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          // handle the invalid form...
          return false
        } else {
          var params = {}
          params = $scope.admin
          AdminService.add(params).then(function successCallback(response) { 
            toastr.success($rootScope.t("Success"), $rootScope.t("Add")) 
            $('#modal-default').modal('hide')
            $table.bootstrapTable('refresh')
         }).catch(function errorCallback(error) {
            var message = $rootScope.t("Internal Server Error")
            if (error.status == 500){
              message = error.data.message
            }
            toastr.error(message, $rootScope.t("Add")) 
         })
         return false
        }
      })

      formObj_edit.on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          // handle the invalid form...
          return false
        } else {
          $scope.$apply()
          var params = {}
          params = $scope.user
           AdminService.edit(params).then(function successCallback(response) { 
              var params_roles = {}
              params_roles.rids = eval('['+ $scope.user.roles + ']')
              params_roles.uids = eval('['+ $scope.user.id + ']')
              AdminService.add_role(params_roles).then(function successCallback(response) { 
                toastr.success($rootScope.t("Success"), $rootScope.t("Edit")) 
                $('#modal-edit').modal('hide')
                $table.bootstrapTable('refresh')
                return false
            }).catch(function errorCallback(error) {
                var message = $rootScope.t("Internal Server Error")
                if (error.status == 500){
                  message = error.data.message
                }
                toastr.error(message, $rootScope.t("Edit")) 
                $('#modal-edit').modal('hide')
                $table.bootstrapTable('refresh')
                return false
            })
         }).catch(function errorCallback(error) {
            var message = $rootScope.t("Internal Server Error")
            if (error.status == 500){
              message = error.data.message
            }
            toastr.error(message, $rootScope.t("Edit")) 
         })
         return false
        }
      })

      formObj_role.on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          // handle the invalid form...
          return false
        } else {
          $scope.$apply()
          var params = {}
          params.rids = eval('['+ $scope.role.roles + ']')
          params.uids = eval('['+ $scope.role.ids + ']')
          AdminService.add_role(params).then(function successCallback(response) { 
            toastr.success($rootScope.t("Success"), $rootScope.t("Add")) 
            $('#modal-role').modal('hide')
            $table.bootstrapTable('refresh')
         }).catch(function errorCallback(error) {
            var message = $rootScope.t("Internal Server Error")
            if (error.status == 500){
              message = error.data.message
            }
            toastr.error(message, $rootScope.t("Edit")) 
         })
         return false
        }
      })
    })
  })
  
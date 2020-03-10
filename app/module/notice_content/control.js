/*!
 * Notice Content Module Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-11-30 02:22:26
 */
app.service('Notice_contentService', function($http, API_URL) {
  // view list 
  this.getList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "notice_content/list",
      async: true,
      params: params.data,
    })
  }

  // add
  this.add = function(params) {
    return $http({
      url: API_URL + 'notice_content/',
      async: true,      
      method: 'POST', 
      data: params, 
    })
  }

  // del
  this.del = function(params) {
    return $http({
      url: API_URL + 'notice_content/',
      async: true,      
      method: 'DELETE', 
      data: params, 
    })
  }

  // edit
  this.edit = function(params) {
    return $http({
      url: API_URL + 'notice_content/',
      async: true,      
      method: 'PUT', 
      data: params, 
    })
  }  
  
  // view admin module list 
  this.getAdminList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "notice_content/list_admin",
      params: params.data,
    })
  }

  // add Admin
  this.addAdmin = function(params) {
    return $http({
      url: API_URL + 'notice_content/admin',
      method: 'POST', 
      data: params, 
    })
  }

  // del Admin
  this.deleteAdmin = function(params) {
    return $http({
      url: API_URL + 'notice_content/admin',
      method: 'DELETE', 
      data: params, 
    })
  }
})

/*!
 * Notice Content Module Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-11-30 02:22:26
 */
app.controller('notice_contentCtrl', function ($scope, $rootScope, I18nService, $state, $stateParams, $timeout, ModuleService, Notice_contentService ) {
    console.log("notice_contentCtrl...")
    $scope.contentCkeditor = null
    
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    $scope.s = ""  // Page status : add or edit // 页面状态 add / edit
    $scope.notice_content = {}

    // get module i18n configs
    // if same key, module key will override the original key (configs.i18n)
    I18nService.i18n('notice_content') 

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
        pageSize: 200,
        pageList: [200, 225, 250, 300],
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
            title: $rootScope.t('User ID'),
            field: 'uid',
            sortable: true,
            align: 'center',
          }, {
            field: 'title',
            title: $rootScope.t('Title'),
            sortable: true,
            align: 'center',
          }, {
            field: 'icon',
            title: $rootScope.t('Icon'),
            sortable: false,
            align: 'center',
          }, {
            field: 'status',
            title: $rootScope.t('Status'),
            sortable: false,
            align: 'center',
          }, {
            field: 'weight',
            title: $rootScope.t('Weight'),
            sortable: false,
            align: 'center',
          },
          {
            field: 'operate',
            title: $rootScope.t('Operate'),
            align: 'center',
            events: window.operateEvents,
            formatter: operateFormatter
          }
          ]
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
      params.data.lang = $rootScope.lang
      Notice_contentService.getList(params).then(function successCallback(response) {
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
    
    // Operation Style Formatter // 操作样式格式化
    function operateFormatter(value, row, index) {
      return [
        '<a class="btn btn-xs btn-success edit" href="javascript:void(0)" title="' + $rootScope.t('Edit') + '">',
        '<i class="fa fa-pencil"></i>',
        '</a> ',
        '<a class="btn btn-xs btn-danger remove" href="javascript:void(0)" title="' + $rootScope.t('Delete') + '">',
        '<i class="fa fa-trash"></i>',
        '</a> ',
        // '<a class="btn btn-xs btn-info attachment" href="javascript:void(0)" title="' + $rootScope.t('Attachments') + '">',
        // '<i class="fa fa-file-o"></i>',
        // '</a> ',
        '<a class="btn btn-xs btn-primary receiver" href="javascript:void(0)" title="' + $rootScope.t('Receiver') + '">',
        '<i class="fa fa-search-plus"></i>',
        '</a> ',
        // '<a class="btn btn-xs btn-info reference" href="javascript:void(0)" title="' + $rootScope.t('Reference') + '">',
        // '<i class="fa fa-angle-double-right"></i>',
        // '</a> ',
      ].join('')
    }

    // Operate Events // 操作事件
    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.notice_content = {}
        $scope.s = 'edit'
        $scope.notice_content = angular.copy(row)
        
        
        if($.emp($scope.notice_content.content)){
          $scope.contentCkeditor.setData('')
        }else{
          $scope.contentCkeditor.setData($scope.notice_content.content)
        }
        
        $scope.$apply()
        $('#modal-add-edit').modal('show')
        $('#add-edit-form').validator('validate')
      },
      'click .remove': function (e, value, row, index) {
        ModuleService.del(Notice_contentService, row.title, row.id, $table)
      },
      'click .attachment': function (e, value, row, index) {
        $state.go("app.system_manager.attachments",{module_name: 'notice_content', module_obj_id: row.id})
      },
      'click .receiver': function (e, value, row, index) {
        $scope.notice_content.receiver = row.id
        $('#modalTable_receiver').modal('show')
        initTable_receiver()
      },
      'click .reference': function (e, value, row, index) {
        var params = {}
        if (!$.emp(row.reference_params)){
          params = eval('(' + row.reference_params + ')') 
        }
        $state.go(row.reference,params)
      },
      
    }

    // add event // 增加按钮事件处理
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add-edit').modal('show')
      $scope.notice_content = {}
      $scope.notice_content.icon = 'fa fa-circle-o'
      $scope.notice_content.weight = 0      
      $scope.notice_content.status = true      
      $scope.notice_content.lang = $rootScope.lang
      $scope.notice_content.uid = $rootScope.user.uid      
      $scope.notice_content.receiver = $stateParams.receiver          
      $scope.contentCkeditor.setData('')        
      $scope.$apply()
    })

    // delete event // 删除按钮单击事件处理
    $remove.click(function () {
      ModuleService.dels(Notice_contentService, $table, $remove, getIdSelections)
    })

    // configs click event // 配置参数按钮事件处理
    $("#configs").click(function(){
      $state.go("app.system_manager.configs",{module_name:'notice_content'})
    })   
    
    
    var $table_receiver = $('#table_receiver')
    var $choice_receiver = $('#choice_receiver')
    var $remove_receiver = $('#remove_receiver')
    function initTable_receiver(){
      $table_receiver.bootstrapTable('destroy').bootstrapTable({
        height: 550,
        pagination: true,
        showPaginationSwitch: false,
        search: true,
        ajax: ajaxRequest_receiver,
        pageSize: 10,
        pageList: [10, 20, 30, 100],
        responseHandler: responseHandler_receiver,
        detailFormatter: detailFormatter_receiver,
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
            title: $rootScope.t('username'),
            field: 'username',
            sortable: true,
            align: 'center',
          }]
        ]
      })

      // checkbox event
      $table_receiver.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table',
        function () {
          $choice_receiver.prop('disabled', !$table_receiver.bootstrapTable('getSelections').length)
          $remove_receiver.prop('disabled', !$table_receiver.bootstrapTable('getSelections').length)
          selections = getIdSelections_receiver()
      })

      // Triggered when clicking the detail icon to expand the detail page // 当点击详细图标展开详细页面的时候触发
      $table_receiver.on('expand-row.bs.table', function (e, index, row, $detail) {
        // to do
      })

      // All events trigger the event, including name: event name, args: event parameters. // 所有的事件都会触发该事件，参数包括：name：事件名，args：事件的参数
      $table_receiver.on('all.bs.table', function (e, name, args) {
        //console.log(name, args)
      })   
    }

    /*!
    * Table feature function 
    */
    // ajax get table init data list
    function ajaxRequest_receiver(params) {
      params.data.lang = $rootScope.lang
      search = params.data.search
      receiver = $scope.notice_content.receiver
      if(!$.emp(search) && search.indexOf('id=')!=0 ){
        //
      }else if(search.indexOf('id=')==0 && search.length==3){
        params.data.search = ""
      }else if(search.indexOf('id=')==0 && search.length>3){
        //
      }
      else{
         if(!$.emp(receiver)){
           params.data.search = 'ids=' + receiver.toString()
         }
      } 
      Notice_contentService.getAdminList(params).then(function successCallback(response) {
        params.success(response.data)
      }).catch(function errorCallback(error) {

      })
    }
    
    // Get the ID selected in the check box // 获取复选框选中的ID
    function getIdSelections_receiver() {
      return $.map($table_receiver.bootstrapTable('getSelections'), function (row) {
        return row.id
      })
    }

    // Processing each table record, selected, with a status value of true or false // 处理每条表格记录，被选中，状态值为true , 否则为false
    function responseHandler_receiver(res) {
      $.each(res.rows, function (i, row) {
        row.state = $.inArray(row.id, selections) !== -1
      })
      return res
    }

    // Detail Formatter // 详细信息格式化
    function detailFormatter_receiver(index, row) {
      var html = []
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
      })
      return html.join('')
    }

    $('#modalTable_receiver').on('shown.bs.modal', function () {
      $table_receiver.bootstrapTable('resetView')
    })

    // Bug Fix: scroll exceptions caused by two mode boxes // 修复两模式框产生的滚动异常
    $('#modalTable_receiver').on("hidden.bs.modal", function () {
      $(this).removeData("bs.modal")
      $(document.body).addClass("modal-open")
    })

    $("#btn_receiver").click(function(){
      $('#modalTable_receiver').modal('show')
      initTable_receiver()
    }) 

    // add event 
    $choice_receiver.click(function () {
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
                var ids = getIdSelections_receiver()
                var uid = $scope.notice_content.receiver
                var params = {}
                params.uid = uid
                params.ids = ids
                Notice_contentService.addAdmin(params).then(function successCallback(response) {
                  toastr.success($rootScope.t("Success"), $rootScope.t("Add")) 
                  $choice_receiver.prop('disabled', true)
                  $table.bootstrapTable('refresh')
                  $('#modalTable_receiver').modal('hide')
                }).catch(function errorCallback(error) {
                    var message = $rootScope.t("Internal Server Error")
                    if (error.status == 500){
                      message = error.data.message
                    }
                    toastr.error(message, $rootScope.t("Add"))  
                })   
              }else {
                toastr.info($rootScope.t("Cancel"), $rootScope.t("Add"))   
              }
          }
        }); 
    })

    // remove event 
    $remove_receiver.click(function () {
      //Pace.restart()
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
              var ids = getIdSelections_receiver()
              var uid = $scope.notice_content.receiver
              var params = {}
              params.uid = uid
              params.ids = ids
              Notice_contentService.deleteAdmin(params).then(function successCallback(response) { 
                toastr.success($rootScope.t("Success"), $rootScope.t("Delete")) 
                $remove_receiver.prop('disabled', true)
                $table.bootstrapTable('refresh')
                $('#modalTable_receiver').modal('hide')
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
      var params = $scope.notice_content
      params.content = $scope.contentCkeditor.getData()
      return params
    }
  
    function editParams(){
      var params = $scope.notice_content
      params.content = $scope.contentCkeditor.getData() 
      return params
    }
    
    $(function(){
      // init table // 初始化表格
      $timeout(function(){
        $scope.contentCkeditor = CKEDITOR.instances['content'] 
        initTable()
      }, 0);         
      ModuleService.add_edit(Notice_contentService, $table, $scope, addParams, editParams)       
  })
})




  
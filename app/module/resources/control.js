"use strict";
/*!
 * Resources Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('ResourcesService', function($http, API_URL) {
  // view list 
  this.getList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "resources/list",
      async: true,
      params: params.data,
    })
  }

  // add
  this.add = function(params) {
    return $http({
      url: API_URL + 'resources/',
      async: true,      
      method: 'POST', 
      data: params, 
    })
  }

  // del
  this.del = function(params) {
    return $http({
      url: API_URL + 'resources/',
      async: true,      
      method: 'DELETE', 
      data: params, 
    })
  }

  // edit
  this.edit = function(params) {
    return $http({
      url: API_URL + 'resources/',
      async: true,      
      method: 'PUT', 
      data: params, 
    })
  }

  // get resources menu
  this.getMenu = function() {
    return $http({
      url: API_URL + 'resources/menu',
      async: true,      
      method: 'GET', 
      params: {}, 
    })
  }

  // all record reorder
  this.reOrder = function() {
    return $http({
      url: API_URL + 'resources/reorder',
      async: true,      
      method: 'GET', 
      params: {}, 
    })
  }

  // Get variables. less of font-awesome to get all icon resource names // 获取font-awesome的variables.less，从而得到所有图标资源名
  this.getFontAwesomeVariables = function() {
    return $http({
      url: 'assets/css/variables.less',
      async: true,      
      method: 'GET',
    })
  }
})

/*!
 * Resources Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('resourcesCtrl', function ($scope, $rootScope, $timeout, I18nService, ResourcesService, TreeService, ModuleService) {
    console.log("resourcesCtrl...");
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    $scope.s = ""  // Page status : add or edit // 页面状态 add / edit
    
    // get module i18n configs
    // if same key, module key will override the original key (configs.i18n)
    I18nService.i18n('resources') 
    
    // get module configs with local lang
    // data format for example : $scope.resources_configs = [resources.i18n.article: "文章"]
    $scope.resources_configs = []
    I18nService.configs('resources', $scope.resources_configs)  

    $rootScope.$on('configsComplete',function(event, data){
      console.log('configsComplete is received')
    })
  
    $scope.iconselect = function(x){
      if($scope.s == 'add'){
        //$("#icon").val('fa fa-' + x)
        $scope.resources.icon = 'fa fa-' + x
        $('#modal-icon').modal('hide')
      }else if($scope.s == 'edit'){
        //$("#edit-icon").val('fa fa-' + x)
        $scope.resources.icon = 'fa fa-' + x
        $('#modal-icon').modal('hide')
      }
    }

    /*!
     * table 
     */
    // init table 
    function initTable() {
      $table.bootstrapTable('destroy').bootstrapTable({
        height: 550,
        pagination: true,
        cache: false, //bootstrapTable进行表格数据的绑定，在谷歌、火狐等常用的浏览器上都是没有问题，在ie浏览器上使用bootstrapTable重新加载数据没有请求后台，而是直接才ie缓存中获取。
        showPaginationSwitch: false,
        search: true,
        ajax: ajaxRequest,
        pageSize: 50,
        pageList: [50, 100, 150, 200],
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
            field: 'title',
            title: $rootScope.t('Title'),
            sortable: false,
            align: 'left',
            formatter: titleFormatter
          }, {
            field: 'name',
            title: $rootScope.t('Resources'),
            sortable: false,
            align: 'center',
          }, {
            field: 'icon',
            title: $rootScope.t('Icon'),
            sortable: false,
            align: 'center',
            formatter: iconFormatter
          },{
            field: 'route',
            title: $rootScope.t('Route'),
            sortable: false,
            align: 'center',
          },{
            field: 'method',
            title: $rootScope.t('Method'),
            sortable: false,
            align: 'center',
          },{
            field: 'weight',
            title: $rootScope.t('Weight'),
            sortable: false,
            align: 'center',
          },{
            field: 'ismenu',
            title: $rootScope.t('Menu'),
            sortable: false,
            align: 'center',
            formatter: ismenuFormatter
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
      ResourcesService.getList(params).then(function successCallback(response) {
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
      return html.join('');
    }

    // Locked Style Formatter // 锁定样式格式化
    function lockedFormatter(value, row, index) {
      if(value) return '<span class="text-success"><i class="fa fa-circle"></i>' + $rootScope.t('Locked') + '</span>'
      else return '<span class="text-danger"><i class="fa fa-circle"></i>' + $rootScope.t('UnLocked') + '</span>'
    }

    // Operation Style Formatter // 操作样式格式化
    function operateFormatter(value, row, index) {
      return [
        '<a class="btn btn-xs btn-success edit" href="javascript:void(0)" title=' + $rootScope.t('Edit') + '>',
        '<i class="fa fa-pencil"></i>',
        '</a>  ',
        '<a class="btn btn-xs btn-danger remove" href="javascript:void(0)" title=' + $rootScope.t('Delete') + '>',
        '<i class="fa fa-trash"></i>',
        '</a>'
      ].join('')
    }

    // Status Style Formatter // 状态样式格式化
    function statusFormatter(value, row, index) {
        if(value == 1) return '<span class="text-success"><i class="fa fa-circle"></i>' + $rootScope.t('Normal') + '</span>';
        else return '<span class="text-info"><i class="fa fa-circle"></i>' + $rootScope.t('Pause') + '</span>';
    }

    // Title Style Formatter // 标题样式格式化
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

    // Menu Style Formatter // 菜单样式格式化
    function ismenuFormatter(value, row, index) {
      if(value == 1) return '<span class="text-success"><i class="fa fa-circle"></i>' + $rootScope.t('Menu') + '</span>'
      else return '<span class="text-danger"><i class="fa fa-circle"></i>' + $rootScope.t('Feature') + '</span>'
    }

    // Icon Style Formatter // 图标样式格式化
    function iconFormatter(value, row, index) {
      return '<span class=""><i class="'+ value +'"></i></span>'
    }

    // Operate Events // 操作事件
    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.resources = {}
        $scope.s = 'edit'
        $scope.resources = row
        $('#modal-add-edit').modal('show')
        ResourcesService.getMenu().then(function successCallback(response) { 
            var json = response.data
            var tree=TreeService.listToTree(json,0)
            var rootNode = [{
              "id": 0,
              "title": $rootScope.t("Top"), 
              "value": 0,
              "children": tree
            }]      
            $('.treeSelector').treeSelector(rootNode, [row.pid], function (e, values) {
              $scope.resources.pid = values.join(",")
            }, { 
              checkWithParent: false, 
              titleWithParent: false,
              notViewClickParentTitle: false
            })
        })
      },
      'click .remove': function (e, value, row, index) {
        if(row.status=='2'){
          toastr.warning($rootScope.t("The system is reserved and cannot be deleted"), $rootScope.t("Delete"))   
          return false
        }
        ModuleService.del(ResourcesService, row.title, row.id, $table)
      }
    }

    // add event // 增加按钮事件处理
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add-edit').modal('show')
      $scope.resources = {}
      $scope.resources.icon = 'fa fa-circle-o'
      $scope.resources.status = true
      $scope.resources.ismenu = true
      ResourcesService.getMenu().then(function successCallback(response) { 
        var json = response.data
        var tree=TreeService.listToTree(json,0)
        var rootNode = [{
          "id": 0,
          "title": $rootScope.t("Top"), 
          "value": 0,
          "children": tree
        }] 
        $scope.resources.pid = rootNode[0].value
        $('.treeSelector').treeSelector(rootNode, [0], function (e, values) {
          $scope.resources.pid = values.join(",")
        }, { 
          checkWithParent: false, 
          titleWithParent: false,
          notViewClickParentTitle: false
        })
      })
      $scope.$apply()
    })

    // delete event // 删除按钮单击事件处理
    $remove.click(function () {
      ModuleService.dels(ResourcesService, $table, $remove, getIdSelections)
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
              ResourcesService.reOrder().then(function successCallback(response) { 
                toastr.success($rootScope.t("Success"), $rootScope.t("Order"))   
              }).catch(function errorCallback(error) {
                  var message = $rootScope.t("Internal Server Error")
                  if (error.status == 500){
                    message = error.data.message
                  }
                  toastr.error(message, $rootScope.t("Order")) 
              })   
            }else {
              toastr.info($rootScope.t("Cancel"), $rootScope.t("Order"))   
            }
        }
      }); 
    })

    /*!
     * icon search modal // 图标搜索 Modal
     */
    // Icon Button Triggers New Icon Search Modal 图标按钮触发新的图标搜索模式框
    // New Modal Overlays Old Modal // 新模式框覆盖在老模式框上
    $(".btn-search-icon").click(function(){
      $scope.iconlist = []
      ResourcesService.getFontAwesomeVariables().then(function successCallback(response) { 
        var ret = response.data
        var exp = /fa-var-(.*):/ig;
        var result;
        while ((result = exp.exec(ret)) != null) {
          $scope.iconlist.push(result[1]);
        }
      })
      $('#modal-icon').modal('show')

      $timeout(function(){
        $("#modal-icon").css({"paddingLeft":"0px","color":"red"}); 
      },200)

      $('input.js-icon-search').keyup(function () {
        $("#chooseicon ul li").show();
        if ($(this).val() != '') {
            $("#chooseicon ul li:not([data-font*='" + $(this).val() + "'])").hide();
        }
      })
    })

    $("#modal-icon-close").click(function(){
      $('#modal-icon').modal('hide')       
    })

    // Bug Fix: scroll exceptions caused by two mode boxes // 修复两模式框产生的滚动异常
    $('#modal-icon').on("hidden.bs.modal", function () {
      $(this).removeData("bs.modal");
      $(document.body).addClass("modal-open");  
    })

    function addParams(){
      var params = {}
      params = $scope.resources
      return params
    }

    function editParams(){
      var params = {}
      params = $scope.resources
      return params
    }

    $(function(){
      // init table // 初始化表格
      // 在AngularJs和JQuery插件共存咋项目中经常会遇到如下异常
      // Type error : Cannot read property 'childNodes' of undefined  
      // 解决方法：
      // 1. 引用$timeout服务，异步执行JQuery的初始化代码
      $timeout(initTable, 0);  
      // 2. 在angularjs初始化视图之后执行JQuery 的绑定
      // angular.element(document).ready(function () {  
      //   //Angular breaks if this is done earlier than document ready.  
      //   initTable();  
      // });      
      ModuleService.add_edit(ResourcesService, $table, $scope, addParams, editParams)
  })
})




  
/*!
 * IRIS Module Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-08-23 16:18:40
 */
app.service('IrisService', function($http, API_URL) {
  // view list 
  this.getList = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "iris/list",
      async: true,
      params: params.data,
    })
  }

  // add
  this.add = function(params) {
    return $http({
      url: API_URL + 'iris/',
      async: true,      
      method: 'POST', 
      data: params, 
    })
  }

  // del
  this.del = function(params) {
    return $http({
      url: API_URL + 'iris/',
      async: true,      
      method: 'DELETE', 
      data: params, 
    })
  }

  // edit
  this.edit = function(params) {
    return $http({
      url: API_URL + 'iris/',
      method: 'PUT', 
      data: params, 
    })
  }

  this.linearPredict = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "iris/linear_predict",
      params: params,
    })
  } 

  this.classifyPredict = function(params) {
    return $http({
      method: "GET",
      url: API_URL + "iris/classify_predict",
      params: params,
    })
  } 
  
  this.show = function() {
    return $http({
      method: "GET",
      url: API_URL + "iris/show",
      params: {},
    })
  }  
  
})

/*!
 * IRIS Module Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-08-23 16:18:40
 */
app.controller('irisCtrl', function ($scope, $rootScope, I18nService, $state, $stateParams, $timeout, ModuleService, IrisService, STATIC_AI_URL ) {
    "use strict";
    console.log("irisCtrl...")  
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    $scope.s = ""  // Page status : add or edit // 页面状态 add / edit
    $scope.iris = {}
    $scope.linear_predict = {}
    $scope.logic_predict = {}
    $scope.linear_predict.hide = true
    $scope.logic_predict.hide = true
    $scope.figure_hide = true

    // get module i18n configs
    // if same key, module key will override the original key (configs.i18n)
    I18nService.i18n('iris') 

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
            field: 'sepal_length',
            title: $rootScope.t('Sepal Length'),
            sortable: false,
            align: 'center',
          }, {
            field: 'sepal_width',
            title: $rootScope.t('Sepal Width'),
            sortable: false,
            align: 'center',
          }, {
            field: 'petal_length',
            title: $rootScope.t('Petal Length'),
            sortable: false,
            align: 'center',
          }, {
            field: 'petal_width',
            title: $rootScope.t('Petal Width'),
            sortable: false,
            align: 'center',
          }, {
            field: 'irisclass',
            title: $rootScope.t('IRIS Class'),
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
      params.data.lang = $rootScope.lang
      IrisService.getList(params).then(function successCallback(response) {
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
        '<a class="btn btn-xs btn-info attachment" href="javascript:void(0)" title="' + $rootScope.t('Attachments') + '">',
        '<i class="fa fa-file-o"></i>',
        '</a> ',                
      ].join('')
    }

    // Operate Events // 操作事件
    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.iris = {}
        $scope.s = 'edit'
        $scope.iris = angular.copy(row)                        
        $scope.$apply()
        $('#modal-add-edit').modal('show')
        $('#add-edit-form').validator('validate')
      },
      'click .remove': function (e, value, row, index) {
        ModuleService.del(IrisService, row.id, row.id, $table)
      },
      'click .attachment': function (e, value, row, index) {
        $state.go("app.system_manager.attachments",{module_name: 'iris', module_obj_id: row.id})
      },
      
    }

    // add event // 增加按钮事件处理
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add-edit').modal('show')
      $scope.iris = {}            
      $scope.iris.lang = $rootScope.lang
      $scope.iris.uid = $rootScope.user.uid                  
      $scope.$apply()
    })

    $("#linear_pred").click(function(){
      $scope.linear_predict.hide = false
      $scope.logic_predict.hide = true  
      $scope.figure_hide = true                        
      $scope.$apply()
    })

    $("#logic_pred").click(function(){
      $scope.linear_predict.hide = true
      $scope.logic_predict.hide = false  
      $scope.figure_hide = true                            
      $scope.$apply()
    })

    $("#relation").click(function(){
      $scope.linear_predict.hide = true
      $scope.logic_predict.hide = true 
      $scope.figure_hide = false                             
      IrisService.show().then(function successCallback(response) { 
        var figure_name = response.data.figure_name 
        var figure_path = '<img src="' + STATIC_AI_URL + 'iris/' + figure_name + '.png" width="100%" alt="' + figure_name + '" >' 
        $scope.show_result = figure_path   
      })  
    })

    $scope.linear_pred_do = function(){
      console.log($scope.linear_predict)
      var params = {}
      params.feature_select = $scope.linear_predict.feature_select
      params.feature_value = $scope.linear_predict.feature_value
      params.linear_select = $scope.linear_predict.linear_select
      params.feature_select_predict = $scope.linear_predict.feature_select_predict
      IrisService.linearPredict(params).then(function successCallback(response) { 
        $scope.linear_predict.result = response.data       
      })         
      $scope.$apply()
    }

    $scope.logic_pred_do = function(){
      console.log($scope.logic_predict)
      var params = {}
      params.sepal_length_logic = $scope.logic_predict.sepal_length_logic
      params.sepal_width_logic = $scope.logic_predict.sepal_width_logic
      params.petal_length_logic = $scope.logic_predict.petal_length_logic
      params.petal_width_logic = $scope.logic_predict.petal_width_logic
      params.logic_select = $scope.logic_predict.logic_select
      IrisService.classifyPredict(params).then(function successCallback(response) { 
        $scope.logic_predict.result = response.data       
      })         
      $scope.$apply()
    }

    // delete event // 删除按钮单击事件处理
    $remove.click(function () {
      ModuleService.dels(IrisService, $table, $remove, getIdSelections)
    })

    // configs click event // 配置参数按钮事件处理
    $("#configs").click(function(){
      $state.go("app.system_manager.configs",{module_name:'iris'})
    })   
    
    function addParams(){
      var params = $scope.iris 
      return params
    }
  
    function editParams(){
      var params = $scope.iris
      return params
    }
    
    $(function(){
      // init table // 初始化表格 
      $timeout(function(){
        initTable()        
      }, 0);
      $('.box').boxWidget()
      ModuleService.add_edit(IrisService, $table, $scope, addParams, editParams)      
    }) 
}) 

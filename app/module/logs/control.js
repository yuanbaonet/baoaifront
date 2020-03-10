"use strict";
/*!
 * Logs Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('LogsService', function($http, API_URL) {
    // list
    this.getList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "logs/list",
        async: true,
        params: params.data,
      })
    }

    // add
    this.add = function(params) {
      return $http({
        url: API_URL + 'logs/',
        async: true,      
        method: 'POST', 
        data: params, 
      })
    }

    // del
    this.del = function(params) {
      return $http({
        url: API_URL + 'logs/',
        async: true,      
        method: 'DELETE', 
        data: params, 
      })
    }

    // edit
    this.edit = function(params) {
      return $http({
        url: API_URL + 'logs/',
        async: true,      
        method: 'PUT', 
        data: params, 
      })
    }
})

/*!
 * Logs Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('logsCtrl', function ($scope, $rootScope, $timeout, ModuleService, LogsService) {
    console.log("logsCtrl...");
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    
    $scope.s = ""  // Page status : add or edit // 当前页面处理状态 add  edit
    
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
            sortable: false,
          }, {
            field: 'uid',
            title: $rootScope.t('User ID'),
            sortable: false,
            align: 'center',
          }, {
            field: 'url',
            title: 'URL',
            sortable: false,
            align: 'left',
          },{
            field: 'method',
            title: $rootScope.t('Method'),
            sortable: false,
            align: 'center',
          },{
            field: 'route',
            title: $rootScope.t('Route'),
            sortable: false,
            align: 'left',
          }, {
            field: 'referer',
            title: $rootScope.t('Referer'),
            sortable: false,
            align: 'left',
          },{
            field: 'ip',
            title: 'IP',
            sortable: false,
            align: 'center',
          },{
            field: 'desc',
            title: $rootScope.t('Description'),
            sortable: false,
            align: 'left',
          },{
            field: 'created',
            title: $rootScope.t('Created Time'),
            sortable: false,
            align: 'center',
          }, {
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

    function ajaxRequest(params) {
      LogsService.getList(params).then(function successCallback(response) {
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
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
      })
      return html.join('')
    }
  
    function operateFormatter(value, row, index) {
      return [
        '<a class="btn btn-xs btn-danger remove" href="javascript:void(0)" title="' + $rootScope.t('Delete') + '">',
        '<i class="fa fa-trash"></i>',
        '</a>'
      ].join('')
    }

    window.operateEvents = {      
      'click .remove': function (e, value, row, index) {
        ModuleService.del(LogsService, row.url, row.id, $table)
      }
    }
  
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add').modal('show')
    })

    $remove.click(function () {
      ModuleService.dels(LogsService, $table, $remove, getIdSelections)
    })
  
    $(function(){
      $timeout(initTable, 0);              
    })
})


  
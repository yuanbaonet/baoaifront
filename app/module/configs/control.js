"use strict";
/*!
 * Configs Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('ConfigsService', function($http, API_URL) {
    // list
    this.getList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "configs/list",
        params: params.data,
      })
    }

    // add
    this.add = function(params) {
      return $http({
        url: API_URL + 'configs/',
        method: 'POST', 
        data: params, 
      })
    }

    // del
    this.del = function(params) {
      return $http({
        url: API_URL + 'configs/',
        method: 'DELETE', 
        data: params, 
      })
    }

    // edit
    this.edit = function(params) {
      return $http({
        url: API_URL + 'configs/',
        method: 'PUT', 
        data: params, 
      })
    }

    // view modules 
    this.getModules = function() {
      return $http({
        url: API_URL + 'configs/modules',
        cache: false,      
        method: 'POST', 
        data: {}, 
      })
    }

    // view the module's sections
    this.getSections = function(params) {
      return $http({
        url: API_URL + 'configs/sections',
        async: true,  
        cache: false,      
        method: 'POST', 
        data: params, 
      })
    }

    // view key and value list with module, section and lang
    this.getKeys = function(params) {
      return $http({
        url: API_URL + 'configs/keys',
        async: true,  
        //cache: false,      
        method: 'POST', 
        data: params, 
      })
    }

  // get parent models list
  this.getModels = function() {
    return $http({
      url: API_URL + 'configs/models',
      method: 'GET', 
      params: {}, 
    })
  }

})

/*!
 * Configs Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('configsCtrl', function ($scope, $rootScope, $timeout, ConfigsService, $stateParams, ModuleService) {
    console.log("configsCtrl...");
    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []   
    $scope.s = ""  // Page status : add or edit // 当前页面处理状态 add  edit
    $scope.modules = []
    $scope.select_modules = []
    $scope.select_sections = []


    // init list search
    $scope.select = {}
    $scope.select.lang = $rootScope.lang

    // Module Select Value Changed Event
    $scope.moduleChange_select = function(){
      var params = {}
      params.module = $scope.select.module
      if($.emp(params.module)){
        return
      }
      ConfigsService.getSections(params).then(function successCallback(response) { 
        $scope.select_sections = response.data
      })  
      initTable()    
    }
    
    
    ConfigsService.getModels().then(function successCallback(response) { 
      $scope.select_modules = response.data   
      $scope.select.module = $stateParams.module_name
      console.log($scope.select.module)
      if(!$.emp($scope.select.module)){
        $('#select_module').attr("disabled",true)
        $scope.moduleChange_select()
      }      
    })

    // Section Select Value Changed Event
    $scope.sectionChange_select = function(){
      initTable()     
    }

    // Language Select Value Changed Event
    $scope.langChange_select = function(){
      initTable()       
    }

    // Module Select Value Changed Event
    $scope.moduleChange = function(){
      var params = {}
      params.module = $scope.configs.module
      if($.emp(params.module)){
        return
      }
      ConfigsService.getSections(params).then(function successCallback(response) { 
        $scope.sections = response.data
      })      
    }

    // Section Select Value Changed Event
    $scope.sectionChange = function(){
      var params = {}
      params.module = $scope.configs.module
      params.section = $scope.configs.section
      params.lang = $scope.configs.lang
      if($.emp($scope.configs.lang)){
        params.lang = $rootScope.lang
      }
      if($.emp(params.module) || $.emp(params.section)){
        return
      }
      ConfigsService.getKeys(params).then(function successCallback(response) { 
        $scope.keysvalue = response.data.slice(0,10)
      })       
    }

    // Language Select Value Changed Event
    $scope.langChange = function(){
      var params = {}
      params.module = $scope.configs.module
      params.section = $scope.configs.section
      params.lang = $scope.configs.lang
      if($.emp($scope.configs.lang)){
        params.lang = $rootScope.lang
      }
      if($.emp(params.module) || $.emp(params.section) || $.emp(params.lang)){
        return
      }
      ConfigsService.getKeys(params).then(function successCallback(response) { 
        $scope.keysvalue = response.data.slice(0,10)
      })       
    }
    
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
            field: 'module',
            title: $rootScope.t('Module'),
            sortable: true,
            align: 'center',
          }, {
            field: 'section',
            title: $rootScope.t('Section'),
            sortable: true,
            align: 'center',
          }, {
            field: 'keys',
            title: $rootScope.t('Key'),
            sortable: true,
            align: 'center',
          }, {
            field: 'value',
            title: $rootScope.t('Value'),
            sortable: true,
            align: 'center',
          }, {
            field: 'weight',
            title: $rootScope.t('Weight'),
            sortable: true,
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
          selections = getIdSelections()
      })
  
      $table.on('expand-row.bs.table', function (e, index, row, $detail) {
      })
  
      $table.on('all.bs.table', function (e, name, args) {
        //console.log(name, args)
      }) 
    }

    function ajaxRequest(params) {
      params.data.lang = $rootScope.lang
      if(!$.emp($scope.select.lang)){
        params.data.lang = $scope.select.lang
      }
      if(!$.emp($scope.select.section)){
        params.data.section = $scope.select.section
      }
      if(!$.emp($stateParams.module_name)){
        params.data.module_name = $stateParams.module_name
      }else if(!$.emp($scope.select.module)){
        params.data.module_name = $scope.select.module
      }
      ConfigsService.getList(params).then(function successCallback(response) {
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
      $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>')
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

    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.modules = {}
        $scope.sections = {}
        $scope.keysvalue = {}
        $scope.configs = {}
        $scope.s = 'edit'
        $('#modal-add-edit').modal('show')
        $scope.configs = angular.copy(row)
        ConfigsService.getModels().then(function successCallback(response) { 
          $scope.modules = response.data
          var params = {}
          params.module = row.module
          $scope.configs.module = row.module
          ConfigsService.getSections(params).then(function successCallback(response) { 
            $scope.sections = response.data
            var params = {}
            params.module = row.module
            params.section = row.section
            params.lang = row.lang
            $scope.configs.section = row.section
            ConfigsService.getKeys(params).then(function successCallback(response) { 
              $scope.keysvalue = response.data.slice(0,10)
              $scope.configs.keys = row.keys
              $scope.configs.value = row.value
            })  
          }) 
        })
      },
      'click .remove': function (e, value, row, index) {
        ModuleService.del(ConfigsService, row.title, row.id, $table)        
      }
    }
  
    $("#add").click(function(){
      $scope.s = 'add'
      $('#modal-add-edit').modal('show')
      $scope.configs = {}
      $scope.modules = {}
      $scope.sections = {}
      $scope.keysvalue = {}
      $scope.configs.lang = $rootScope.lang
      ConfigsService.getModels().then(function successCallback(response) { 
        $scope.modules = response.data    
        if(!$.emp($scope.select.module)){
          $scope.configs.module = $scope.select.module
        }else{
          if(!$.emp($stateParams.module_name)){
            $scope.configs.module = $stateParams.module_name
          }
        }
        if(!$.emp($scope.configs.module)){
          $scope.moduleChange()
        }      
      })
      $scope.$apply()
    })

    $remove.click(function () {
      ModuleService.dels(ConfigsService, $table, $remove, getIdSelections)
    })

    function addParams(){
      var params = $scope.configs;
      params.uid = $rootScope.user.uid;
      params.title = $scope.configs.module + "." + $scope.configs.section + "." + $scope.configs.keys;
      return params
    }
  
    function editParams(){
      var params = $scope.configs;
      params.title = $scope.configs.module + "." + $scope.configs.section + "." + $scope.configs.keys;
      return params
    }
  
    $(function(){
      $timeout(initTable, 0); 
      ModuleService.add_edit(ConfigsService, $table, $scope, addParams, editParams)  
  })
})


  
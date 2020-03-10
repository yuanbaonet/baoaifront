"use strict";
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
app.service('User_noticeService', function ($http, API_URL) {
  // view list 
  this.getList = function (params) {
    return $http({
      method: "GET",
      url: API_URL + "notice_content/listbyuid",
      async: true,
      params: params.data
    });
  };

  // view list 
  this.getNoticeList = function (params) {
    return $http({
      method: "GET",
      url: API_URL + "notice_content/listbyuid",
      async: true,
      params: params.data
    });
  };

  // add
  this.add = function (params) {
    return $http({
      url: API_URL + 'notice_content/',
      async: true,
      method: 'POST',
      data: params
    });
  };

  // del
  this.del = function (params) {
    return $http({
      url: API_URL + 'notice_content/',
      async: true,
      method: 'DELETE',
      data: params
    });
  };

  // edit
  this.edit = function (params) {
    return $http({
      url: API_URL + 'notice_content/',
      async: true,
      method: 'PUT',
      data: params
    });
  };

  // edit
  this.read_edit = function (params) {
    return $http({
      url: API_URL + 'notice_content/read_edit',
      async: true,
      method: 'PUT',
      data: params
    });
  };
});

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
app.controller('user_noticeCtrl', function ($scope, $rootScope, I18nService, $state, $stateParams, TreeService, ModuleService, User_noticeService, $timeout) {
  console.log("user_noticeCtrl...");
  $scope.contentCkeditor = null;

  var $table = $('#table');
  var $remove = $('#remove');
  var selections = [];
  $scope.s = ""; // Page status : add or edit // 页面状态 add / edit
  $scope.notice_content = {};

  // get module i18n configs
  // if same key, module key will override the original key (configs.i18n)
  I18nService.i18n('notice_content');

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
      columns: [[{
        field: 'state',
        checkbox: true,
        align: 'center',
        valign: 'middle'
      }, {
        title: 'ID',
        field: 'id',
        align: 'center',
        valign: 'middle',
        sortable: true
      }, {
        field: 'title',
        title: $rootScope.t('Title'),
        sortable: true,
        align: 'center'
      }, {
        field: 'status',
        title: $rootScope.t('Status'),
        sortable: false,
        align: 'center',
        formatter: statusFormatter
      }, {
        field: 'weight',
        title: $rootScope.t('Weight'),
        sortable: false,
        align: 'center'
      }, 
      // {
      //   field: 'operate',
      //   title: $rootScope.t('Operate'),
      //   align: 'center',
      //   events: window.operateEvents,
      //   formatter: operateFormatter
      // }
      ]]
    });

    // checkbox event
    $table.on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table', function () {
      $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
      selections = getIdSelections();
    });

    // Triggered when clicking the detail icon to expand the detail page // 当点击详细图标展开详细页面的时候触发
    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
      // to do
    });

    // All events trigger the event, including name: event name, args: event parameters. // 所有的事件都会触发该事件，参数包括：name：事件名，args：事件的参数
    $table.on('all.bs.table', function (e, name, args) {
      //console.log(name, args)
    });
  }

  /*!
  * Table feature function 
  */
  // ajax get table init data list
  function ajaxRequest(params) {
    params.data.lang = $rootScope.lang;
    User_noticeService.getList(params).then(function successCallback(response) {
      params.success(response.data);
    }).catch(function errorCallback(error) {});
  }

  // Get the ID selected in the check box // 获取复选框选中的ID
  function getIdSelections() {
    return $.map($table.bootstrapTable('getSelections'), function (row) {
      return row.id;
    });
  }

  // Processing each table record, selected, with a status value of true or false // 处理每条表格记录，被选中，状态值为true , 否则为false
  function responseHandler(res) {
    $.each(res.rows, function (i, row) {
      row.state = $.inArray(row.id, selections) !== -1;
    });
    return res;
  }

  // Detail Formatter // 详细信息格式化
  function detailFormatter(index, row) {
    var html = new Array(5);
    $.each(row, function (key, value) {
      if (key == 'title') {
        html[0] = "<p><b>" + $rootScope.t('Title') + ":</b> " + value + '</p>';
      } else if (key == 'created') {
        //html[1] = "<p><b>" + $rootScope.t('created') + ":</b> " + value + '</p>';
      } else if (key == 'updated') {
        //html[2] = "<p><b>" + $rootScope.t('updated') + ":</b> " + value + '</p>';
      } else if (key == 'receive_created') {
        var new_value = ''
        moment.locale($rootScope.lang)
        new_value = moment(value).format('lll')        
        html[3] = "<p><b>" + $rootScope.t('Date') + ":</b> " + new_value + '</p>';
      } else if (key == 'content') {
        html[4] = "<p><b>" + $rootScope.t('Content') + ":</b> " + value + '</p>';
      }
    });
    if (row.status == true) {
      var params = {};
      params.id = row.receive_id;
      params.status = false;
      User_noticeService.read_edit(params).then(function successCallback(response) {
        toastr.success($rootScope.t("OK"), $rootScope.t("Read")) 
        $('#status_' + row.id).html("<i class=\"fa fa-circle\"></i>" + $rootScope.t('Read'));
        $('#status_' + row.id).addClass("text-success").removeClass("text-danger");
        // Get Notice
        var params_notices = {};
        params_notices.data = {};
        params_notices.data.lang = $rootScope.lang;
        params_notices.data.limit = 5;
        params_notices.data.offset = 0;
        params_notices.data.order = 'asc';
        params_notices.data.search = 'status=1';
        User_noticeService.getNoticeList(params_notices).then(function successCallback(response) {
          var notices_pager = response.data;
          $rootScope.notices_total = notices_pager.total;
          $rootScope.notices = notices_pager.rows;
        }).catch(function errorCallback(error) {});
        //$table.bootstrapTable('refresh')
      }).catch(function errorCallback(error) {
        var message = $rootScope.t("Internal Server Error");
        if (error.status == 500) {
          message = error.data.message;
        }
        toastr.error(message, $rootScope.t("Read"))
      });
    }
    return html.join('');
  }

  // Status Formatter // 状态格式化
  function statusFormatter(value, row, index) {
    if (value == 0) return "<span class=\"text-success\" id=\"status_" + row.id + "\"><i class=\"fa fa-circle\"></i> " + $rootScope.t('Read') + "</span>";
    else return "<span class=\"text-danger\"  id=\"status_" + row.id + "\"><i class=\"fa fa-circle\"></i>" + $rootScope.t('UnRead') + "</span>";
  }

  // Operation Style Formatter // 操作样式格式化
  function operateFormatter(value, row, index) {
    return ["<a class=\"btn btn-xs btn-success edit\" href=\"javascript:void(0)\" title=\"" + $rootScope.t('Edit') + "\">", '<i class="fa fa-pencil"></i>', '</a> ', "<a class=\"btn btn-xs btn-danger remove\" href=\"javascript:void(0)\" title=\"" + $rootScope.t('Delete') + "\">", '<i class="fa fa-trash"></i>', '</a> ', "<a class=\"btn btn-xs btn-info attachment\" href=\"javascript:void(0)\" title=\"" + $rootScope.t('Attachments') + "\">", '<i class="fa fa-file-o"></i>', '</a> ', "<a class=\"btn btn-xs btn-info reference\" href=\"javascript:void(0)\" title=\"" + $rootScope.t('Reference') + "\">", '<i class="fa fa-angle-double-right"></i>', '</a> '].join('');
  }

  // Operate Events // 操作事件
  window.operateEvents = {
    'click .edit': function clickEdit(e, value, row, index) {
      $scope.notice_content = {};
      $scope.s = 'edit';
      $scope.notice_content = angular.copy(row);

      if ($.emp($scope.notice_content.content)) {
        $scope.contentCkeditor.setData('');
      } else {
        $scope.contentCkeditor.setData($scope.notice_content.content);
      }

      $scope.$apply();
      $('#modal-add-edit').modal('show');
      $('#add-edit-form').validator('validate');
    },
    'click .remove': function clickRemove(e, value, row, index) {
      ModuleService.del(User_noticeService, row.title, row.id, $table)
    },
    'click .attachment': function clickAttachment(e, value, row, index) {
      $state.go("app.system_manager.attachments", { module_name: 'notice_content', module_obj_id: row.id });
    },
    'click .reference': function clickReference(e, value, row, index) {
      var params = {};
      if (!$.emp(row.reference_params)) {
        var params = (new Function("return " + row.reference_params))();
        //params = eval('(' + row.reference_params + ')');
      }
      $state.go(row.reference, params);
    }
    // add event // 增加按钮事件处理
  };
  $("#add").click(function () {
    $scope.s = 'add';
    $('#modal-add-edit').modal('show');
    $scope.notice_content = {};
    $scope.notice_content.weight = 0;
    $scope.notice_content.lang = $rootScope.lang;
    $scope.notice_content.uid = $rootScope.user.uid;
    $scope.contentCkeditor.setData('');
    $scope.$apply();
  });

  // delete event // 删除按钮单击事件处理
  $remove.click(function () {
    ModuleService.dels(User_noticeService, $table, $remove, getIdSelections)
  });

  // configs click event // 配置参数按钮事件处理
  $("#configs").click(function () {
    $state.go("app.system_manager.configs", { module_name: 'notice_content' });
  });

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

  $(function () {
    // init table // 初始化表格
    $timeout(function(){
      $scope.contentCkeditor = CKEDITOR.instances['content'];
      initTable();
    }, 0);      
    ModuleService.add_edit(User_noticeService, $table, $scope, addParams, editParams)   
  });
});
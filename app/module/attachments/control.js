
"use strict";
/*!
 * Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.service('AttachmentsService', function($http, API_URL) {
    // List
    this.getList = function(params) {
      return $http({
        method: "GET",
        url: API_URL + "attachments/list",
        params: params.data,
      })
    }

    // Add
    this.add = function(params) {
      return $http({
        url: API_URL + 'attachments/',
        async: true,      
        method: 'POST', 
        data: params, 
      })
    }

    // Del
    this.del = function(params) {
      return $http({
        url: API_URL + 'attachments/',
        async: true,      
        method: 'DELETE', 
        data: params, 
      })
    }

    // Edit
    this.edit = function(params) {
      return $http({
        url: API_URL + 'attachments/',
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

})

/*!
 * Attachments Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */
app.controller('attachmentsCtrl', function ($scope, $rootScope, $timeout, ModuleService, $http, API_URL, STATIC_URL, ApiService, AttachmentsService, TreeService,  $stateParams) {
    "use strict";  
    console.log("attachmentsCtrl...");
    var $table = $('#table')
    var $remove = $('#remove')
    var $attachments = $('#attachments')
    var selections = []           
    $scope.s = ""  // Page status : add or edit // 当前页面处理状态 add  edit
    $scope.addType = ""     
    $scope.select = {}
    // int the category table， category_id=11 ,Refers to attachments category
    AttachmentsService.getCategoryMenu().then(function successCallback(response) { 
      var json = response.data
      var tree=TreeService.listToTree(json,11)
      var rootNode = [{
        "id": 11,
        "title": $rootScope.t("Attachments"), 
        "value": 11,
        "children": tree
      }]
      var root_pid = $scope.select.category_id
      if($.emp(root_pid)){
        if(!$.emp($stateParams.category_id)){
          root_pid = $stateParams.category_id
        }else{
          root_pid = rootNode[0].value
        }       
        $scope.select.category_id = rootNode[0].value
      }
      $('.treeSelector_select_category_id').treeSelector(rootNode, [root_pid], function (e, values) {
        $scope.select.category_id = values.join(",")
        initTable()
      }, { 
        checkWithParent: false, 
        titleWithParent: false,
        notViewClickParentTitle: false
      })
    })

    //viewImage('http://localhost:5000/static/uploads/2020/01/03/bb410341f6574fddb17f5e945152587e.png', 'avatar1.png', 394)
    var uploaderFile = null;
    // init File Uploader // 初始化文件上传
    function initFileUploader(accept){
          if($.emp(accept)){
            accept = {}
          }
          var $list = $('#fileList'),
          $btn = $('#fileUploadBtn'),
          state = 'pending',
          ratio = window.devicePixelRatio || 1,
          // thumbnail size
          thumbnailWidth = 100 * ratio,
          thumbnailHeight = 100 * ratio;
          //uploaderFile = null;
          uploaderFile = WebUploader.create({
              // Uncompressed image // 不压缩image
              resize: false,
              // chunked: true, // 是否分片
              // duplicate: true,// 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key.
              // chunkSize: 52428 * 100, // 分片大小， 5M
              // fileSingleSizeLimit: 100*1024, // 文件大小限制

              // swf file path // 文件路径
              // swf: BASE_URL + '/js/Uploader.swf',

              // File receiving server. // 文件接收服务端。
              swf: 'assets/js/Uploader.swf',
              server: API_URL + 'attachments/upload',
              headers:{
                'authtoken': $rootScope.user.token,
                'module_name': $stateParams.module_name,
                'module_obj_id': $stateParams.module_obj_id
              },
              // Select the button for the file. Optional. // 选择文件的按钮。可选。
              // Internally created according to the current operation, it may be an input element, or it may be flash. // 内部根据当前运行是创建，可能是input元素，也可能是flash.
              pick: '#filePicker',
              accept: accept
      });

      // When files are added // 当有文件添加进来的时候
      uploaderFile.on( 'fileQueued', function( file ) {
          console.log(file.ext)
          // gif,jpg,jpeg,bmp,png,ico
          if(file.ext=='gif' || file.ext=='jpg' || file.ext=='jpeg' || file.ext=='bmp' || file.ext=='png' || file.ext=='ico'){
            var $li = $(
              '<div id="' + file.id + '" class="file-item thumbnail">' +
                  '<img>' +
                  '<div class="info">' + file.name + '</div>' +
                  '<p class="state">' + $rootScope.t('Waiting for upload') + '...</p>' +
              '</div>'
              )
              var $img = $li.find('img');
              $list.append( $li );
              // Create Thumbnail
              uploaderFile.makeThumb( file, function( error, src ) {
                  if ( error ) {
                      $img.replaceWith('<span>Unable to preview</span>')
                      return
                  }
                  $img.attr( 'src', src )
              }, thumbnailWidth, thumbnailHeight )          
          }else{
            $list.append( '<div id="' + file.id + '" class="item">' +
            '<h4 class="info">' + file.name + '</h4>' +
            '<p class="state">' + $rootScope.t('Waiting for upload') + '...</p>' + '</div>' )
          }

      });

      // Create progress bar to display in real time during file upload. // 文件上传过程中创建进度条实时显示。
      uploaderFile.on( 'uploadProgress', function( file, percentage ) {
          var $li = $( '#'+file.id ),
              $percent = $li.find('.progress .progress-bar');
          // Avoid duplicate creation // 避免重复创建
          if ( !$percent.length ) {
              $percent = $('<div class="progress progress-striped active">' +
                '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                '</div>' +
              '</div>').appendTo( $li ).find('.progress-bar');
          }
          $li.find('p.state').text($rootScope.t('Uploading'));
          $percent.css( 'width', percentage * 100 + '%' );
      });

      uploaderFile.on( 'uploadSuccess', function( file ) {
          $( '#'+file.id ).find('p.state').text($rootScope.t('Uploaded'))         
      });

      uploaderFile.on( 'uploadError', function( file ) {
          $( '#'+file.id ).find('p.state').text($rootScope.t('Upload Failure'));
      });

      uploaderFile.on( 'uploadComplete', function( file ) {
          $( '#'+file.id ).find('.progress').fadeOut();
      });

      
      uploaderFile.on( 'all', function( type ) {
          if ( type === 'startUpload' ) {
              state = 'uploading';
          } else if ( type === 'stopUpload' ) {
              state = 'paused';
          } else if ( type === 'uploadFinished' ) {
              state = 'done';
          }

          if ( state === 'uploading' ) {
              $btn.text($rootScope.t('Suspend upload'));
          } else {
              $btn.text($rootScope.t('Start Uploading'));
          }
      });

      $btn.on( 'click', function() {
          if ( state === 'uploading' ) {
            uploaderFile.stop();
          } else {
            uploaderFile.upload();
          }
          return false
      });    
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
            field: 'url',
            title: $rootScope.t('Preview'),
            sortable: false,
            align: 'center',
            formatter: previewFormatter
          },{
            field: 'isimage',
            title: $rootScope.t('Image'),
            sortable: true,
            align: 'center',
          }, {
            field: 'iscover',
            title: $rootScope.t('Cover'),
            sortable: true,
            align: 'center',
          }, {
            field: 'title',
            title: $rootScope.t('Title'),
            sortable: true,
            align: 'center',
          }, {
            field: 'module_name',
            title: $rootScope.t('Module'),
            sortable: true,
            align: 'center',
          }, {
            field: 'module_obj_id',
            title: $rootScope.t('Module') + 'ID',
            sortable: true,
            align: 'center',
          }, {
            field: 'weight',
            title: $rootScope.t('Weight'),
            sortable: true,
            align: 'center',
          }, {
            field: 'url',
            title: 'URL',
            sortable: false,
            align: 'left',
            formatter: urlFormatter
          },{
            field: 'imagetype',
            title: $rootScope.t('File Type'),
            sortable: false,
            align: 'center',
          },{
            field: 'filesize',
            title: $rootScope.t('Size'),
            sortable: false,
            align: 'center',
          },{
            field: 'mimetype',
            title: 'MIMETYPE',
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
          $attachments.prop('disabled', !$table.bootstrapTable('getSelections').length)
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
      if(!$.emp($stateParams.module_name)){
          params.data.module_name = $stateParams.module_name
      }
      if(!$.emp($stateParams.module_obj_id)){
        params.data.module_obj_id = $stateParams.module_obj_id
      }
      if(!$.emp($scope.select.category_id)){
        var category_id = $scope.select.category_id
        if (category_id == 11 ){
          category_id = 0
        }  
        params.data.category_id = category_id    
      }
      AttachmentsService.getList(params).then(function successCallback(response) {
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
        '<a class="btn btn-xs btn-success edit" href="javascript:void(0)" title="'+ $rootScope.t('Edit')+'">',
        '<i class="fa fa-pencil"></i>',
        '</a>  ',
        '<a class="btn btn-xs btn-danger remove" href="javascript:void(0)" title="'+$rootScope.t('Delete')+'">',
        '<i class="fa fa-trash"></i>',
        '</a>'
      ].join('')
    }

    function previewFormatter(value, row, index) {
      if (row.imagetype=='gif' || row.imagetype=='jpg' || row.imagetype=='jpeg' || row.imagetype=='bmp' || row.imagetype=='ico' || row.imagetype=='png' ){
        return  '<img src="' + STATIC_URL + row.url + '" width="50px" height="50px" alt="' + row.title + '" >' 
      }else if(row.imagetype=='doc' || row.imagetype=='docx'){
        return '<span><i class="fa fa-file-word-o"></i></span>'
      }else if(row.imagetype=='xls' || row.imagetype=='xlsx'){
        return '<span><i class="fa fa-file-excel-o"></i></span>'
      }else if(row.imagetype=='pdf'){
        return '<span><i class="fa fa-file-pdf-o"></i></span>'
      }else if(row.imagetype=='ppt' || row.imagetype=='pptx'){
        return '<span><i class="fa fa-file-powerpoint-o"></i></span>'
      }else if(row.imagetype=='rar' || row.imagetype=='zip' || row.imagetype=='gz'){
        return '<span><i class="fa fa-file-archive-o"></i></span>'
      }else if(row.imagetype=='txt' || row.imagetype=='rtf' || row.imagetype=='md'){
        return '<span><i class="fa fa-file-text-o"></i></span>'
      }else if(row.imagetype=='mp3' || row.imagetype=='wma' || row.imagetype=='wav'){
        return '<span><i class="fa fa-file-audio-o"></i></span>'
      }else if(row.imagetype=='avi' || row.imagetype=='mp4' || row.imagetype=='mpg' || row.imagetype=='mkv' || 
      	row.imagetype=='mov' || row.imagetype=='rm' || row.imagetype=='rmvb' || row.imagetype=='flv' || 
      	row.imagetype=='3gp' || row.imagetype=='ogg' || row.imagetype=='webm'){
        return '<span><i class="fa fa-file-movie-o"></i></span>'
      }else if(row.imagetype=='avi' || row.imagetype=='mp4' || row.imagetype=='mpg' || row.imagetype=='mkv' || 
      	row.imagetype=='mov' || row.imagetype=='rm' || row.imagetype=='rmvb' || row.imagetype=='flv' || 
      	row.imagetype=='3gp' || row.imagetype=='ogg' || row.imagetype=='webm'){
        return '<span><i class="fa fa-file-movie-o"></i></span>'
      }else if(row.imagetype=='php' || row.imagetype=='html' || row.imagetype=='css' || row.imagetype=='js' || 
      	row.imagetype=='py' || row.imagetype=='java' || row.imagetype=='c' || row.imagetype=='vue' || 
      	row.imagetype=='sql'){
        return '<span><i class="fa fa-file-code-o"></i></span>'
      }else{
      	return '<span><i class="fa fa-file-o"></i></span>'
      }

    }

    function urlFormatter(value, row, index) {      
      if (row.imagetype=='gif' || row.imagetype=='jpg' || row.imagetype=='jpeg'  || row.imagetype=='png' || row.imagetype=='bmp' || row.imagetype=='ico' ){
        return  '<a href="javascript:void(0)" class="view-image" title="' + row.title + '" onclick="viewImage(\'' + STATIC_URL + row.url + '\', \'' + row.title + '\', ' + row.id + ')">' + row.url + '</a>'
      }
      return  '<a href="' + STATIC_URL + row.url + '" title="' + row.title + '">' + row.url + '</a>'
   }

    window.operateEvents = {
      'click .edit': function (e, value, row, index) {
        $scope.attachments = {}
        $scope.s = 'edit'
        $scope.attachments = row
        //params.lang = $rootScope.lang
        // int the category table， category_id=11 ,Refers to attachments category
        AttachmentsService.getCategoryMenu().then(function successCallback(response) { 
          var json = response.data
          var tree=TreeService.listToTree(json,11)
          var rootNode = [{
            "id": 11,
            "title": $rootScope.t("Attachments"), 
            "value": 11,
            "children": tree
          }]
          var root_pid = $scope.attachments.category_id
          if($.emp(root_pid)){
            root_pid = rootNode[0].value
            $scope.attachments.category_id = rootNode[0].value
          }
          $('.treeSelector_category_id').treeSelector(rootNode, [root_pid], function (e, values) {
            $scope.attachments.category_id = values.join(",")
          }, { 
            checkWithParent: false, 
            titleWithParent: false,
            notViewClickParentTitle: false
          })
        })
        $scope.$apply()
        $('#modal-edit').modal('show')
      },
      'click .remove': function (e, value, row, index) {
        ModuleService.del(AttachmentsService, row.title, row.id, $table) 
      }
    }
  
    $("#addImage").click(function(){
      $scope.s = 'add'  
      $scope.addType = 'Image'   
      $('#modal-add').modal('show')
      $('#fileList').html("")
      $scope.$apply()
      // When uploading files using webuploader plug-in, clicking the button is invalid // 使用webuploader插件上传文件时点击按钮无效
      // https://blog.csdn.net/h_h_v/article/details/80506948
      // $("#imgPicker div:eq(1)").attr("style","position: absolute; top: 0px; left: 0px; width: 85px; height: 40px; overflow: hidden; bottom: auto; right: auto;");
      // $("#filePicker div:eq(1)").attr("style","position: absolute; top: 0px; left: 0px; width: 85px; height: 40px; overflow: hidden; bottom: auto; right: auto;");
    })

    $("#addFile").click(function(){
      $scope.s = 'add' 
      $scope.addType = 'File'       
      $('#modal-add').modal('show')
      $('#fileList').html("")
      $scope.$apply()
    })

    $remove.click(function () {
      ModuleService.dels(AttachmentsService, $table, $remove, getIdSelections)
    })

    function getUrlParam(paramName) {
      var regExp = new RegExp('([?]|&)' + paramName + '=([^&]*)(&|$)');
      var result = window.location.href.match(regExp);
      if (result) {
          return decodeURIComponent(result[2]);
      } else {
          return null;
      }
    }

    // attachments click event 
    $("#attachments").click(function(){
      Pace.restart()
      var ids = getIdSelections()
      if(!$.emp(ids) && ids.length==1){
        var selectedRow = $table.bootstrapTable('getSelections') 
        var funcNum = getUrlParam( 'CKEditorFuncNum' );
        var fileUrl = STATIC_URL + selectedRow[0].url
        var title = selectedRow[0].title
        window.opener.CKEDITOR.tools.callFunction( funcNum, fileUrl, function() {
          // Get the reference to a dialog window.
          // var dialog = this.getDialog();
          // // Check if this is the Image Properties dialog window.
          // if ( dialog.getName() == 'image' ) {
          //     // Get the reference to a text field that stores the "alt" attribute.
          //     var element = dialog.getContentElement( 'info', 'txtAlt' );
          //     // Assign the new value.
          //     if ( element )
          //         element.setValue( title );
          // }
          // Return "false" to stop further execution. In such case CKEditor will ignore the second argument ("fileUrl")
          // and the "onSelect" function assigned to the button that called the file manager (if defined).
          // return false;
        })
        window.close()
      }else{
        toastr.error($rootScope.t("Select multiple files at the same time or no files at the same time"), $rootScope.t("Add Attachment")) 
      }
    }) 

    $(function(){

      $timeout(initTable, 0);       
      // Each time the modal box opens, it executes
      // 每次模式框打开后，再执行
      // initImageUploader()   
      // initFileUploader()  
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


      formObj.on('reset', function (e) {
        $('#fileList').html("")
      })

      formObj_edit.on('submit', function (e) {
        if (e.isDefaultPrevented()) {
          // handle the invalid form...
          return false
        } else {
          // everything looks good!
          var params = {}
          params = $scope.attachments
          AttachmentsService.edit(params).then(function successCallback(response) { 
            toastr.success($rootScope.t("Success"), $rootScope.t("Edit")) 
            $('#modal-edit').modal('hide')
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

      // Initialize WebUploader when clicking pop-up modal box to solve the problem of no response when clicking upload
      // 在点击弹出模态框的时候再初始化WebUploader，解决点击上传无反应问题
      /*
        —————常用mimeType格式——————————————————————————以下是对应的type类型 

        .doc     application/msword
        .docx   application/vnd.openxmlformats-officedocument.wordprocessingml.document
        .rtf       application/rtf
        .xls     application/vnd.ms-excel	application/x-excel
        .xlsx    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        .ppt     application/vnd.ms-powerpoint
        .pptx    application/vnd.openxmlformats-officedocument.presentationml.presentation
        .pps     application/vnd.ms-powerpoint
        .ppsx   application/vnd.openxmlformats-officedocument.presentationml.slideshow
        .pdf     application/pdf
        .swf    application/x-shockwave-flash
        .dll      application/x-msdownload
        .exe    application/octet-stream
        .msi    application/octet-stream
        .chm    application/octet-stream
        .cab    application/octet-stream
        .ocx    application/octet-stream
        .rar     application/octet-stream
        .tar     application/x-tar
        .tgz    application/x-compressed
        .zip    application/x-zip-compressed
        .z       application/x-compress
        .wav   audio/wav
        .wma   audio/x-ms-wma
        .wmv   video/x-ms-wmv
        .mp3 .mp2 .mpe .mpeg .mpg     audio/mpeg
        .rm     application/vnd.rn-realmedia
        .mid .midi .rmi     audio/mid
        .bmp     image/bmp
        .gif     image/gif
        .png    image/png
        .tif .tiff    image/tiff
        .jpe .jpeg .jpg     image/jpeg
        .txt      text/plain
        .xml     text/xml
        .html     text/html
        .css      text/css
        .js        text/javascript
        .mht .mhtml   message/rfc822
      */
      $("#modal-add").on("shown.bs.modal",function(){
        var accept = {}
        if($scope.addType == 'Image'){
          accept = {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
          }
        }else{
          accept = {
            title: 'Files',
            extensions: 'gif,jpg,jpeg,bmp,png,ico,doc,docx,xls,xlsx,ppt,pptx,txt,text,rft,rar,zip,gz,tar,md,csv,mp3,mp4,pdf,wav,MIDI,m4a,WMA,wma',
            mimeTypes: 'image/*,text/*' +
                            //word
                        ',application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' +
                            //excel
                        ',application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' + 
                            //ppt
                        ',application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation' +
                        ',application/pdf' +
                        ',application/zip' +
                        ',application/csv'
          }          
        }
        //initImageUploader()   
        initFileUploader(accept) 
      })

      // Close the modal box and destroy WebUploader to solve the problem that the buttons get bigger when the modal box is opened again
      // 关闭模态框销毁WebUploader，解决再次打开模态框时按钮越变越大问题
      $('#modal-add').on('hide.bs.modal', function () {
        //clear FileList
        $('#fileList').html("")
        //uploader.destroy()
        if(!$.emp(uploaderFile)){
          uploaderFile.destroy()
        }        
        // Every time the mode box is reopened, the click of BTN is repeatedly bound
        // 每次模式框重新打开，btn的click被重复绑定问题
        $('#fileUploadBtn').unbind("click")
        // refresh bootstrap table
        $table.bootstrapTable('refresh')
      })
  });
})


  
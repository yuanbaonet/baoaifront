"use strict";
/*!
 * User Profile Module Service
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-11-30 02:22:26
 */
app.service('UserProfileService', function ($http, API_URL) {

  // get profiles
  this.getProfiles = function () {
    return $http({
      method: "GET",
      cache: false,
      url: API_URL + "profiles/",
      async: true,
      params: {}
    });
  };

  // get admin
  this.getAdmin = function () {
    return $http({
      method: "GET",
      url: API_URL + "admin/",
      async: true,
      params: {}
    });
  };

  // add
  this.addProfiles = function (params) {
    return $http({
      url: API_URL + 'profiles/',
      async: true,
      method: 'POST',
      data: params
    });
  };

  // edit admin
  this.edit = function (params) {
    return $http({
      url: API_URL + 'admin/',
      async: true,
      method: 'PUT',
      data: params
    });
  };

  // edit profiles
  this.editProfiles = function (params) {
    return $http({
      url: API_URL + 'profiles/',
      async: true,
      method: 'PUT',
      data: params
    });
  };
});

/*!
 * User Profile Module Controller
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co }
 * @copyright Copyright © 2016-2019 Guangzhou Yuanbao Network Co., Ltd. ( http://www.ybao.org )
 * @license Apache-2.0
 * @createdate: 2019-11-30 02:22:26
 */
app.controller('user_profileCtrl', function ($scope, $rootScope, $timeout, SecurityService, API_URL, STATIC_URL, ApiService, UserProfileService) {
  console.log("rolesCtrl...");
  $scope.s = "edit"; // Page status : add or edit // 页面状态 add / edit
  $scope.profiles = {};
  $scope.profiles.id = 0;
  $scope.profiles.uid = $rootScope.user.uid;

  $scope.logout = function () {
    SecurityService.logout();
  };

  UserProfileService.getAdmin().then(function successCallback(response) {
    if (response.status == 204) {
      $scope.s = 'add';
    } else {
      $scope.user.id = response.data.id;
      $scope.user.username = response.data.username;
      $scope.user.nickname = response.data.nickname;
      $scope.user.avatar = response.data.avatar;
      $scope.user.title = response.data.title;
      $scope.user.email = response.data.email;
    }
  }).catch(function errorCallback(error) {
    var message = $rootScope.t("Internal Server Error");
    if (error.status == 500) {
      message = error.data.message;
    }
    toastr.error(message, $rootScope.t("Error")) 
  });

  UserProfileService.getProfiles().then(function successCallback(response) {
      $scope.profiles = response.data;
      //$scope.profiles.created_ = moment.parseZone($scope.profiles.created).utc().format('YYYY-MM-DD HH:mm:ss')
      $scope.profiles.birthday_ = moment.parseZone($scope.profiles.birthday).format('YYYY-MM-DD');
  }).catch(function errorCallback(error) {    
      $scope.s = 'add';
  });

  // init picture uploader // 初始化图像文件上传
  function initUploader(){
    // Optimize retina. Under retina, this value is 2 // 优化retina, 在retina下这个值是2
    var ratio = window.devicePixelRatio || 1,
        // thumbnail size // 缩略图大小
        thumbnailWidth = 100 * ratio,
        thumbnailHeight = 100 * ratio,
        // Web Uploader instance
        uploader = null;

    // init Web Uploader
    uploader = WebUploader.create({   
        // auto upload // 自动上传。
        auto: true,       
        // swf file path
        // swf: BASE_URL + '/js/Uploader.swf',
        // File receiving server. // 文件接收服务端。
        swf: 'assets/js/Uploader.swf',
        server: API_URL + 'attachments/upload_avatar',
        headers:{
          'authtoken': $rootScope.user.token,
        },
        // Select the button for the file. Optional. // 选择文件的按钮。可选。
        // Internally created according to the current operation, it may be an input element, or it may be flash. // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#filePicker',    
        // Only file type is allowed, optional.
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        }
    });

    // // When files are added // 当有文件添加进来的时候
    uploader.on( 'fileQueued', function( file ) {
        var $img = $('#edit-profile-avatar')
        // create thumbnail // 创建缩略图
        uploader.makeThumb( file, function( error, src ) {
            if ( error ) {
                $img.replaceWith('<span>不能预览</span>')
                return
            }  
            $img.attr( 'src', src )
        }, thumbnailWidth, thumbnailHeight )
    });

    // Create progress bar to display in real time during file upload. // 文件上传过程中创建进度条实时显示。
    uploader.on( 'uploadProgress', function( file, percentage ) {
        var $li = $( '#'+file.id ),
            $percent = $li.find('.progress span');

        // Avoid duplicate creation // 避免重复创建
        if ( !$percent.length ) {
            $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
        }
        $percent.css( 'width', percentage * 100 + '%' );
    });

    uploader.on( 'uploadSuccess', function( file, response  ) {
        $( '#'+file.id ).addClass('upload-state-done');
        $scope.user.avatar = response.data.url
    });

    uploader.on( 'uploadError', function( file ) {
        var $li = $( '#'+file.id ),
            $error = $li.find('div.error');
        if ( !$error.length ) {
            $error = $('<div class="error"></div>').appendTo( $li );
        }
        $error.text($rootScope.t('Upload Failure'));
    });

    uploader.on( 'uploadComplete', function( file ) {
        $( '#'+file.id ).find('.progress').remove();
    });

  }

  $(function () {

    $timeout(initUploader, 0); 

    var formObj_edit = $('#edit-form').validator({
      feedback: {
        success: 'glyphicon-ok',
        error: 'glyphicon-remove'
      }
    });

    var formObj_profiles_edit = $('#edit-profiles-form').validator({
      feedback: {
        success: 'glyphicon-ok',
        error: 'glyphicon-remove'
      }
    });

    formObj_edit.on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        // handle the invalid form...
        return false;
      } else {
        // everything looks good!
        console.log('everything looks good!');
        var params = {};
        params = $scope.user;
        UserProfileService.edit(params).then(function successCallback(response) {
          toastr.success($rootScope.t("Success"), $rootScope.t("Edit"))  ;
          var avatar = response.data.avatar;
          if (!$.emp(avatar)) {
            if (avatar != 'assets/img/avatar.png') {
              $rootScope.user.real_avatar = STATIC_URL + avatar;
            }
          }
          $scope.user.password_hash = "";
          $scope.user.password_hash_confirm = "";
          return false;
        }).catch(function errorCallback(error) {
          var message = $rootScope.t("Internal Server Error");
          if (error.status == 500) {
            message = error.data.message;
          }
          toastr.error(message, $rootScope.t("Edit")) ;
          $scope.user.password_hash = "";
          $scope.user.password_hash_confirm = "";
        });
        return false;
      }
    });

    formObj_profiles_edit.on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        return false;
      } else {
        if ($scope.s == 'edit') {
          UserProfileService.editProfiles($scope.profiles).then(function successCallback(response) {
            toastr.success($rootScope.t("Success"), $rootScope.t("Edit"))  ;
            return false;
          }).catch(function errorCallback(error) {
            var message = $rootScope.t("Internal Server Error");
            if (error.status == 500) {
              message = error.data.message;
            }
            toastr.error(message, $rootScope.t("Edit")) ;
          });
        } else {
          UserProfileService.addProfiles($scope.profiles).then(function successCallback(response) {
            toastr.success($rootScope.t("Success"), $rootScope.t("Add")) 
            $scope.s = 'edit'
            return false;
          }).catch(function errorCallback(error) {
            var message = $rootScope.t("Internal Server Error");
            if (error.status == 500) {
              message = error.data.message;
            }
            toastr.error(message, $rootScope.t("Add")) 
          });
        }
        return false;
      }
    });

    $('#dp_birthday').datetimepicker({
      locale: $rootScope.lang,
      //format: 'HH:mm:ss',
      format: 'YYYY-MM-DD'
      //date: '2019-06-15T07:31:00+00:00', //$scope.profiles.created, //moment($scope.profiles.created, moment.ISO_8601).format('YYYY-MM-DD HH:mm:ss'), //'2019-06-15T07:31:00+00:00',
      //format: 'YYYY-MM-DD HH:mm:ss',
      //defaultDate: '2012-01-01'
    });
    $("#dp_birthday").on("dp.change", function (e) {
      // console.log(moment.parseZone(e.date).utc().format())
      // console.log(moment($scope.profiles.created,['YYYY-MM-DD HH:mm:ss']))
      $scope.profiles.birthday = moment(e.date).format('YYYY-MM-DD');      
    });
  });
});
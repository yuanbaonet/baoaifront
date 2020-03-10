'use strict';
/*!
 * directives
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */ 
app.directive('compile', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(function (scope) {
            return scope.$eval(attrs.compile);
        }, function (value) {
            element.append(value);
            $compile(element.contents())(scope);
        });
    };
});

app.directive('recompile', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(function (scope) {
            return scope.$eval(attrs.recompile);
        }, function (value) {
            element.html(value);
            $compile(element.contents())(scope);
        });
    };
});

/*
 * angular directive ng-icheck
 * 
 * @require jquery, icheck
 * @example <input type="radio" ng-model="radioCheck" ng-icheck />
 *          <input type="checkbox" ng-model="checkboxCheck" ng-icheck />
 */
app.directive('ngIcheck', ['$timeout', function ($timeout) {
    return {
        require: 'ngModel',
        link: function link($scope, element, $attrs, ngModel) {
            return $timeout(function () {
                $scope.$watch($attrs['ngModel'], function (newValue) {
                    $(element).iCheck('update');
                });

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_square-blue',
                    radioClass: 'iradio_square-blue'

                }).on('ifChanged', function (event) {
                    if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                        $scope.$apply(function () {
                            return ngModel.$setViewValue(event.target.checked);
                        });
                    }
                    if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                        return $scope.$apply(function () {
                            return ngModel.$setViewValue($attrs['value']);
                        });
                    }
                });
            });
        }
    };
}]);

app.directive('uiSwitch', ['$window', '$timeout', '$log', '$parse', function ($window, $timeout, $log, $parse) {
    /**
     * Initializes the HTML element as a Switchery switch.
     *
     * $timeout is in place as a workaround to work within angular-ui tabs.
     *
     * @param scope
     * @param elem
     * @param attrs
     * @param ngModel
     */
    function linkSwitchery(scope, elem, attrs, ngModel) {
        if (!ngModel) return false;
        var options = {};
        try {
            options = $parse(attrs.uiSwitch)(scope);
        } catch (e) {}
        var switcher;
        attrs.$observe('disabled', function (value) {
            if (!switcher) {
                return;
            }

            if (value) {
                switcher.disable();
            } else {
                switcher.enable();
            }
        });

        // Watch changes
        scope.$watch(function () {
            return ngModel.$modelValue;
        }, function (newValue, oldValue) {
            initializeSwitch();
        });

        function initializeSwitch() {
            $timeout(function () {
                if (switcher) {
                    angular.element(switcher.switcher).remove();
                }
                switcher = new $window.Switchery(elem[0], options);
                var element = switcher.element;
                element.checked = scope.initValue;
                if (attrs.disabled) {
                    switcher.disable();
                }
                switcher.setPosition(false);
                if (element.addEventListener) {                    // 所有主流浏览器，除了 IE 8 及更早版本
                    element.addEventListener('change', function (evt) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(element.checked);
                        });
                    });
                } else if (element.attachEvent) {  // IE 8 及更早版本
                    element.attachEvent("onchange",  function (evt) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(element.checked);
                        });
                    });
                }
                scope.$watch('initValue', function (newValue, oldValue) {
                    switcher.setPosition(false);
                });
            }, 0);
        }
        initializeSwitch();
    }

    return {
        require: 'ngModel',
        restrict: 'AE',
        scope: {
            initValue: '=ngModel'
        },
        link: linkSwitchery
    };
}]);

app.directive('ckeditor', ['$timeout', '$q', '$rootScope', 'STATIC_URL', 'BASE_URL', 'API_URL', 'IMAGE_URL_DOWNLOAD_EXCLUDE', function ($timeout, $q, $rootScope, STATIC_URL, BASE_URL, API_URL, IMAGE_URL_DOWNLOAD_EXCLUDE) {
    return {
        restrict: 'AC',
        require: ['ngModel', '^?form'],
        scope: false,
        link: function link(scope, element, attrs, ctrls) {
            var i = 0;
            var ngModel = ctrls[0];
            var form = ctrls[1] || null;
            var EMPTY_HTML = '<p></p>',
                isTextarea = element[0].tagName.toLowerCase() === 'textarea',
                data = [],
                isReady = false;
            var $defer = $q.defer;
            var loaded = false
            if (!isTextarea) {
                element.attr('contenteditable', true);
            }
            var onLoad = function onLoad() {
                // CKEDITOR.replace( 'content' ) 
                // config.toolbar = 'Full';                
                // config.toolbar_Full =
                // [
                //     { name: 'document', items : [ 'Source','-','Save','NewPage','DocProps','Preview','Print','-','Templates' ] },
                //     { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
                //     { name: 'editing', items : [ 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
                //     { name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 
                //         'HiddenField' ] },
                //     '/',
                //     { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
                //     { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv',
                //     '-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
                //     { name: 'links', items : [ 'Link','Unlink','Anchor' ] },
                //     { name: 'insert', items : [ 'Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','Iframe' ] },
                //     '/',
                //     { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
                //     { name: 'colors', items : [ 'TextColor','BGColor' ] },
                //     { name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','About' ] }
                // ];
                var options = {
                    language: $rootScope.lang,
                    //uiColor: '#AADC6E',
                    // Mathjax
                    // extraPlugins: 'mathjax',
                    // tooltar: 'Mathjax'
                    // mathJaxLib: 'http://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
                    extraPlugins: 'autoembed, embedsemantic,image2, uploadimage, uploadfile, codesnippet, templates, btbutton, btgrid, preview, print, autogrow, placeholder, filebrowser',
                    autoGrow_minHeight: 250,
                    autoGrow_maxHeight: 800,
                    // Remove the default image plugin because image2, which offers captions for images, was enabled above.
                    removePlugins: 'image',
                    // codesnippet skin theme
                    codeSnippet_theme: 'default',
                    // Configure your file manager integration
                    filebrowserBrowseUrl: BASE_URL + '#/app/system_manager/attachments',
                    filebrowserImageBrowseUrl: BASE_URL + '#/app/system_manager/attachments?type=Images',
                    filebrowserUploadUrl: API_URL + 'attachments/ckeditor_browser_upload?command=QuickUpload&type=Files',
                    filebrowserImageUploadUrl: API_URL + 'attachments/ckeditor_browser_upload?command=QuickUpload&type=Images',
                    // filebrowserWindowWidth: '640',
                    // filebrowserWindowHeight: '480',
                    // Upload images to a baoai attachments (note that the response type is set to JSON).
                    uploadUrl: API_URL + 'attachments/ckeditor_browser_upload?command=QuickUpload&type=Files&responseType=json',
                    toolbar: 'full',
                    toolbar_full: [{
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Strike', 'Underline']
                    }, { name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] }, { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] }, { name: 'links', items: ['Link', 'Unlink', 'Anchor'] }, { name: 'tools', items: ['SpellChecker', 'Maximize'] }, '/', {
                        name: 'styles',
                        items: ['Format', 'Font', 'FontSize', 'TextColor', 'BGColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']
                    }, { name: 'insert', items: ['Image', 'EmbedSemantic', 'Templates', 'Table', 'SpecialChar', 'HorizontalRule', 'Smiley', 'CreatePlaceholder', 'CodeSnippet'] }, { name: 'forms', items: ['Outdent', 'Indent'] }, { name: 'clipboard', items: ['Undo', 'Redo'] }, { name: 'Test', items: ['btbutton', 'btgrid'] }, { name: 'document', items: ['PageBreak', 'Preview', 'Print', 'Source'] }],
                    toolbar_simple: [{
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Strike', 'Underline']
                    }, { name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] }, { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] }, { name: 'links', items: ['Link', 'Unlink', 'Anchor'] }, { name: 'tools', items: ['SpellChecker', 'Maximize'] }, '/', {
                        name: 'styles',
                        items: ['Styles', 'Format', 'Font', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']
                    }, { name: 'insert', items: ['Image', 'Table', 'SpecialChar'] }, { name: 'forms', items: ['Outdent', 'Indent'] }, { name: 'clipboard', items: ['Undo', 'Redo'] }, { name: 'document', items: ['PageBreak', 'Source'] }],
                    toolbar_basic: [{
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Strike', 'Underline']
                    }, { name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] }, { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] }, { name: 'links', items: ['Link', 'Unlink', 'Anchor'] }, { name: 'tools', items: ['SpellChecker', 'Maximize'] }, '/', {
                        name: 'styles',
                        items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']
                    }],
                    toolbar_image: [{ name: 'insert', items: ['Image'] }],
                    disableNativeSpellChecker: false,
                    uiColor: '#FAFAFA',
                    height: '400px',
                    width: '100%'
                };

                options = angular.extend(options, scope[attrs.ckeditor]);

                var instance = isTextarea ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options);
                var configLoaderDef = $q.defer();

                element.bind('$destroy', function () {
                    try {
                        if (!$.emp(instance) && !$.emp(CKEDITOR.instances[instance.name])) {
                            console.log("destroy do");
                            //CKEDITOR.instances[instance.name].destroy();
                        }
                    } catch (err) {
                        console.log(err);
                    }
                });

                var setModelData = function setModelData(setPristine) {
                    var data = instance.getData();
                    if (data === '') {
                        data = null;
                    }
                    $timeout(function () {
                        // for key up event
                        if (setPristine !== true || data !== ngModel.$viewValue) {
                            ngModel.$setViewValue(data);
                        }

                        if (setPristine === true && form) {
                            form.$setPristine();
                        }
                    }, 0);
                };
                var onUpdateModelData = function onUpdateModelData(setPristine) {
                    if (!data.length) {
                        return;
                    }
                    var item = data.pop() || EMPTY_HTML;
                    isReady = false;
                    instance.setData(item, function () {
                        setModelData(setPristine);
                        isReady = true;
                    });
                };

                var replace_img = function replace_img(setPristine) {
                    var data = instance.getData();
                    if (data === '') {
                        data = null;
                    }
                    // console.log(data);               
                };

                instance.on('paste', function (evt) {
                    var pastecontent = evt.data.dataValue;
                    var frag = document.createElement('div');
                    frag.innerHTML = pastecontent;
                    var result = [].map.call(frag.querySelectorAll('img'), function (img) {
                        var temp = img.src;
                        for (var i = 0; i < IMAGE_URL_DOWNLOAD_EXCLUDE.length; i++) {
                            if (temp.indexOf(IMAGE_URL_DOWNLOAD_EXCLUDE[i]) != -1) {
                                return temp;
                            }
                        }
                        var params = {};
                        params.remote_img_url = temp;
                        $.support.cors = true;
                        $.ajax({
                            type: "GET",
                            url: API_URL + "attachments/local_imgurl",
                            data: params,
                            async: false,
                            headers: {
                                "authtoken": $rootScope.user.token
                            },
                            beforeSend: function beforeSend(request) {
                                //request.setRequestHeader("authtoken", token); 
                            },
                            success: function success(data) {
                                var result = data;
                                img.src = STATIC_URL + result.url;
                                evt.data.dataValue = frag.innerHTML;
                            }
                        });
                        return temp;
                    });
                });

                instance.on('instanceReady', function () {
                    scope.$broadcast('ckeditor.ready');
                    scope.$apply(function () {
                        onUpdateModelData(true);
                    });
                    instance.document.on('keyup', setModelData);
                });

                instance.on('customConfigLoaded', function () {
                    configLoaderDef.resolve();
                });

                instance.on('fileUploadRequest', function (evt) {
                    var fileLoader = evt.data.fileLoader;
                    var xhr = fileLoader.xhr;
                    xhr.open('post', fileLoader.uploadUrl, true);
                    xhr.setRequestHeader('Cache-Control', 'no-cache');
                    xhr.setRequestHeader('X-File-Name', evt.data.fileLoader.fileName);
                    xhr.setRequestHeader('X-File-Size', evt.data.fileLoader.total);
                    xhr.setRequestHeader('authtoken', $rootScope.user.token);
                    xhr.setRequestHeader('X-Module-Name', scope.module_name);
                    xhr.setRequestHeader('X-Module-Obj-Id', scope.module_obj_id);
                    xhr.setRequestHeader('X-STATIC_URL', STATIC_URL);
                    //xhr.withCredentials = true;
                    var formData = new FormData()
                    formData.append('file', fileLoader.file, fileLoader.fileName, fileLoader.total);
                    fileLoader.xhr.send(formData);
                    evt.stop();
                }, null, null, 4);

                ngModel.$render = function () {
                    data.push(ngModel.$viewValue);
                    if (isReady) {
                        onUpdateModelData();
                    }
                };
            };

            if (CKEDITOR.status === 'loaded') {
                //if (instance.status === 'loaded') {
                loaded = true;
            }
            
            if (loaded) {
                onLoad();
            } else {
                $defer.promise.then(onLoad);
            }
        }
    };
}]);
"use strict";
/*!
 * jquery extend
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */ 

// Judging whether the any value is empty
// true: Empty, false: Not Empty
// Usage:  $.emp(0.000)
jQuery.extend({
    isEmptyObj: function isEmptyObj(obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    },

    emp: function emp(a, zero) {
        //    var a = ""
        //    var a = " "
        //    var a = null
        //    var a = undefined
        //    var a = []
        //    var a = {}
        //    var a = NaN
        //    var a = 0
        //    var a = 0.00

        if (zero === undefined) {
            zero = false;
        }

        // Number
        if (typeof a == "number") {
            // 0 is null for number
            if (a === 0) {
                // console.log("number is null")
                return true;
            } else {
                return false;
            }
        }

        if (a === undefined) {
            // You can only use the === operation to test whether a value is undefined 
            // console.log("undefined")
            return true;
        }
        if (a == null) {
            // a === undefined || a === null
            // console.log("is null")
            return true;
        }

        // String    
        if (a == "" || a == null || a == undefined) {
            // "",null,undefined
            // console.log("string null")
            return true;
        }
        if (!a) {
            // "",null,undefined,NaN
            // console.log("null,undefined,NaN is null")
            return true;
        }
        if (!$.trim(a)) {
            // "",null,undefined
            // console.log("is null after trim ")
            return true;
        }

        // Array
        if (a.length == 0) {
            // "",[]
            // console.log("array is null")
            return true;
        }

        // Object {}
        if ($.isEmptyObj(a)) {
            // objects are judged by for... in, and Existence key is false
            // console.log("object is null")
            return true;
        }

        // '0'
        if (zero == true) {
            if (a == '0') {
                return true;
            }
        }
        return false;
    }
});

String.prototype.startWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length) return false;
    if (this.substr(0, s.length) == s) return true;else return false;
    return true;
};

String.prototype.endWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length) return false;
    if (this.substring(this.length - s.length) == s) return true;else return false;
    return true;
};

// 实现 ECMA-262, Edition 5, 15.4.4.19
// 参考: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
  
      var T, A, k;
  
      if (this == null) {
        throw new TypeError(" this is null or not defined");
      }
  
      // 1. 将O赋值为调用map方法的数组.
      var O = Object(this);
  
      // 2.将len赋值为数组O的长度.
      var len = O.length >>> 0;
  
      // 3.如果callback不是函数,则抛出TypeError异常.
      if (Object.prototype.toString.call(callback) != "[object Function]") {
        throw new TypeError(callback + " is not a function");
      }
  
      // 4. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
      if (thisArg) {
        T = thisArg;
      }
  
      // 5. 创建新数组A,长度为原数组O长度len
      A = new Array(len);
  
      // 6. 将k赋值为0
      k = 0;
  
      // 7. 当 k < len 时,执行循环.
      while(k < len) {
  
        var kValue, mappedValue;
  
        //遍历O,k为原数组索引
        if (k in O) {
  
          //kValue为索引k对应的值.
          kValue = O[ k ];
  
          // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
          mappedValue = callback.call(T, kValue, k, O);
  
          // 返回值添加到新数组A中.
          A[ k ] = mappedValue;
        }
        // k自增1
        k++;
      }
  
      // 8. 返回新数组A
      return A;
    };      
  }

  function viewImage(url, title, id){     
    var json = {
      "title": title, //相册标题
      "id": id, //相册id
      "start": 0, //初始显示的图片序号，默认0
      "data": [   //相册包含的图片，数组格式
        {
          "alt": title,
          "pid": 0, //图片id
          "src": url, //原图地址
          "thumb": "" //缩略图地址
        }
      ]
    };
    layer.photos({
      photos: json,
      anim: 0 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
    })
  }

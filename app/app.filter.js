"use strict";
/*!
 * filter
 *
 * @desc BaoAI Front
 * @author henry <703264459@qq.com>
 * @see {@link http://www.baoai.co}
 * @copyright © 2016-2020 广州源宝网络有限公司 Guangzhou Yuanbao Network Co., Ltd. {@link http://www.ybao.org}
 * @license Apache-2.0
 */ 
app.filter("datefilter", function ($rootScope) {
    return function (input) {
      var out = ''
      moment.locale($rootScope.lang)
      if($.emp(input)){
        //out = moment().format('lll')        
      }else{
        out = moment(input).format('lll')
      } 
      return out;
    }
  });

app.filter("trusted", ["$sce", function ($sce) {
  return function (html) {
      if (typeof html == 'string') //判断类型为字符串
          return $sce.trustAsHtml(html);
      return html;
  };
}]);

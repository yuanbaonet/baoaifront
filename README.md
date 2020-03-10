# BaoAI 小宝人工智能和量化系统
人工智能和量化从这开始

<p align="center">
<a href="http://www.baoai.co/" target="_blank">
    <img style="vertical-align: top;" src="./assets/img/logo.png" alt="logo" height="50px">
</a>
<br>
<br>
    <img src ="https://img.shields.io/badge/version-2.0.0-blueviolet.svg"/>
    <img src ="https://img.shields.io/badge/platform-windows|linux|macos-yellow.svg"/>
    <img src ="https://img.shields.io/badge/Python-3.6-blue.svg" />
    <img src ="https://img.shields.io/badge/Angularjs-1.7.8-orange" />
    <img src ="https://img.shields.io/badge/Bootstrap-3.3.7-blue" />
    <img src ="https://img.shields.io/badge/jQuery-1.12.4-green" />
    <img src ="https://img.shields.io/badge/license-Apache2.0-blue.svg" />
</p>

小宝人工智能和量化平台是简洁、直观、强大的前端和后端SPA开发框架，支持国际化，以模块为基础，让WEB应用、人工智能和量化系统开发更迅速、更简单。平台包含多个模块，主要包括基于角色的权限管理基础平台（用户、角色、权限、日志、附件、配置参数、分类管理）、通知模块、自动代码产生模块、任务系统模块、内容管理系统模块、网站模块、电子手册模块、人工智能模块、图像识别模块，人脸识别模块，金融数据采集模块，大数据模块，量化交易模块等。

## 功能特点：

+ 超10万行代码
+ 平台模块化，易于开发扩展
+ 前端兼容多种浏览器
+ 兼容性好，跨平台，响应式设计
+ 平台二次开发学习曲线低，易上手
+ 国际化
+ 前后端代码分离
+ 基于H5的单页面应用（SPA）
+ 自动代码产生器
+ 自动产生API文档及测试界面
+ 支持多数据库和数据迁移
+ 强大的富文本编辑
+ 人工智能
+ 大数据网络爬虫
+ 金融数据采集模块
+ 量化分析
+ 完善的开发和部署工具和方案

## 下载源码

BaoAI前后端分离框构，包含有前端项目和后端项目

+ 前端项目源码: [BaoAIFront](https://github.com/yuanbaonet/baoaifront) 

## 文档

+ 手册
    + [BaoAI 开发手册](http://www.baoai.co/web/book?id=50)
    + [BaoAI 前端开发手册](http://www.baoai.co/web/book?id=46)

+ 数据模拟API

   + 运行方式：gulp server , API服务文件：./mockAPI.js 。模拟数据：./data/**/*.json

+ 模块扩展

    + [模块](http://www.baoai.co/web/book?id=88)


## 前端开发工具

[Visual Studio Code](http://code.visualstudio.com)

安装插件：

`Chinese (Simplified) Language Pack for Visual Studio Code`

`jshint`


## 项目前端 BaoAIFront 安装步骤

需要安装 [Node.js](https://nodejs.org) 

```shell
# 安装 bower:
npm install -g bower

# 安装 gulp
npm install -g gulp

# npm 安装第三方js
bower install

# npm 安装依赖库:
npm install

# 运行前端代码方式一：自带数据模拟API，适合前端工程师
gulp server

# 运行前端代码方式二：Python全栈开发工程师
gulp serve

# 运行前端代码方式三：Python全栈开发工程师，反向代理(前后端共用相同地址和端口，仅目录不同)
gulp proxy

# 构建生产代码
gulp build

# 运行前端代码方式四：测试运行生产代码
gulp prod

```
构建的生产代码保存在 `dist` 目录.

## 项目代码自动产生模块

使用自动代码产生模块，可以使字段、模型、生成数据库、前端代码、后端代码和权限配置一并可视化完成，一般项目可以零代码实现。
该部份主要包括三个扩展模块： 数据迁移模块、自动代码模型模块和自动代码产生模块


## BaoAI 小宝人工智能和量化平台系统架构
<img style="vertical-align: top;" src="./assets/img/baoai/sys.png" alt="logo" height="300px">


## BaoAI 小宝人工智能和量化平台知识体系

可用于各行业的前端和后端系统软件开发、CMS、人工智能、图像识别、人脸识别、大数据和量化投资领域等。前后端分离SPA架构，使用AngularJS/Bootstrap等前端框架实现响应式和SPA程序设计，后端主要使用Python语言，主要包括如下框架：flask提供web服务，Jinja2提供模板服务，Numpy、Pandas、Scikit-Learn、Tensorflow和Keras等实现人工智能服务，celery实现任务调度，scrapy提供网络爬虫，基于Backtrader的金融量化服务等。

<img style="vertical-align: top;" src="./assets/img/baoai/know.png" alt="logo" height="400px">

基于BaoAI设计案例：

内容管理网站：

<img style="vertical-align: top;" src="./assets/img/baoai/web.png" alt="logo" height="300px">

管理系统后台：

<img style="vertical-align: top;" src="./assets/img/baoai/admin.png" alt="logo" height="300px">

人工智能：

<img style="vertical-align: top;" src="./assets/img/baoai/ai.png" alt="logo" height="300px">

量化系统：

<img style="vertical-align: top;" src="./assets/img/baoai/quant.png" alt="logo" height="300px">

## 帮助

+ Email [703264459@qq.com](703264459@qq.com) 

## 项目捐赠

所有的捐赠资金都投入到了BaoAI社区基金中，用于支持BaoAI项目的运作。

先强调一下：**BaoAI是开源项目，可以永久免费使用，并没有强制捐赠的要求！！！**

捐赠方式：
<img style="vertical-align: top;" src="./assets/img/baoai/donate.jpg" alt="logo" height="200px">

长期维护捐赠清单，请在留言中注明是项目捐赠以及捐赠人的名字。


## 版权说明

Apache2.0

## 版权说明

<img style="vertical-align: top;" src="./assets/img/baoai/soft.jpg" alt="logo" height="400px">
  




//mockAPI.js

var fs = require('fs');
var path = require('path');

var mockbase = path.join(__dirname, 'data');

var mockApi = function(res, pathname, req, next) {
    resdata = '';
    data = '';
    lang = ''
    keyspathname = path.join(mockbase, 'keys.json')
    var pattern=new RegExp('api/');
    pathname=pathname.replace(/%2F/g, "/");
    if (pattern.test(pathname)) {
        switch (pathname) {
            case '/api/':
                resdata = fs.readFileSync(path.join(mockbase, 'api.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/configs/keys':
                // 创建空字符叠加数据片段
                // 注册data事件接收数据（每当收到一段表单提交的数据，该方法会执行一次）
                req.on('data', function (chunk) {
                    // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
                    data += chunk;
                });                
                // 当接收表单提交的数据完毕之后，就可以进一步处理了
                // 注册end事件，所有数据接收完成会执行一次该方法
                req.on('end', function () {
                    //对url进行解码（url会对中文进行编码）
                    data = decodeURI(data);
                    var json_data = JSON.parse(data)
                    lang = json_data.lang
                    if(lang == 'en'){
                        keyspathname = path.join(mockbase, 'keys_en.json')
                    }
                    var data2 = fs.readFileSync(keyspathname, 'utf-8');
                    res.writeHead(200,{
                        "Content-type":"application/json;charset=UTF-8"
                    });
                    res.write(data2);
                    res.end();
                    return ;
                });
                return;
            case '/api/admin/login':
                resdata = fs.readFileSync(path.join(mockbase, 'login.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/resources/routes':
                resdata = fs.readFileSync(path.join(mockbase, 'routes.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/admin/user_by_token':
                resdata = fs.readFileSync(path.join(mockbase, 'user_by_token.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/notice_content/listbyuid':
                resdata = fs.readFileSync(path.join(mockbase, 'listbyuid.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/resources/list':
                resdata = fs.readFileSync(path.join(mockbase, 'resources/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/resources/menu':
                resdata = fs.readFileSync(path.join(mockbase, 'resources/menu.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/roles/list':
                resdata = fs.readFileSync(path.join(mockbase, 'roles/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/roles/menu':
                resdata = fs.readFileSync(path.join(mockbase, 'roles/menu.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/resources/all':
                resdata = fs.readFileSync(path.join(mockbase, 'roles/all.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/admin/list':
                resdata = fs.readFileSync(path.join(mockbase, 'admin/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/admin/rbac':
                resdata = fs.readFileSync(path.join(mockbase, 'admin/rbac.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/admin/':
                resdata = fs.readFileSync(path.join(mockbase, 'user_profile/admin.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/profiles/':
                resdata = fs.readFileSync(path.join(mockbase, 'user_profile/profiles.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/logs/user/list':
                resdata = fs.readFileSync(path.join(mockbase, 'logs/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/logs/list':
                resdata = fs.readFileSync(path.join(mockbase, 'logs/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/category/menu':
                resdata = fs.readFileSync(path.join(mockbase, 'category/menu.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/category/list':
                resdata = fs.readFileSync(path.join(mockbase, 'category/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/attachments/list':
                resdata = fs.readFileSync(path.join(mockbase, 'attachments/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/configs/list':
                resdata = fs.readFileSync(path.join(mockbase, 'configs/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/configs/models':
                resdata = fs.readFileSync(path.join(mockbase, 'configs/models.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/configs/sections':
                resdata = fs.readFileSync(path.join(mockbase, 'configs/sections.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/configs/value':
                resdata = fs.readFileSync(path.join(mockbase, 'configs/value.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/notice_content/list':
                resdata = fs.readFileSync(path.join(mockbase, 'notice_content/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/notice_content/list_admin':
                resdata = fs.readFileSync(path.join(mockbase, 'notice_content/list_admin.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/iris/list':
                resdata = fs.readFileSync(path.join(mockbase, 'iris/list.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/iris/show':
                resdata = fs.readFileSync(path.join(mockbase, 'iris/show.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            case '/api/admin/captcha':
                resdata = fs.readFileSync(path.join(mockbase, 'admin/captcha.json'), 'utf-8');
                res.writeHead(200,{
                    "Content-type":"application/json;charset=UTF-8"
                });
                res.write(resdata);
                res.end();
                return ;
            default:
                ;
        }
    }
    next();
};

module.exports = mockApi;

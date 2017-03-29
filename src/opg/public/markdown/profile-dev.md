# 页面构建静态资源推送平台开发文档

## 1. 平台使用的技术
    平台主要使用node作为后台服务，使用express框架，模板引擎使用jade。

## 2. 目录结构
    -bin
        www                     // 服务启动文件
    -config                     // 配置文件
        config.js               // 配置文件
        constants.js            // 常量文件
        data-menu.json          // 菜单数据
        data-project-init.json  // 存储新建的构建项目关系
    -public                     // 静态文件
        -javascripts
        -modules
        -stylesheets
    -routes                     // 路由js
    -views                      // 相关的视图文件
     app.js                     // 入口文件

## 3. 功能以及说明
    1）登录/登出
        登录的校验使用的是gitlab 的auth认证。使用自己的gitlab用户名和密码登录，调用gitlab
        http://gitlab.intra.gomeplus.com/oauth/token 接口做登录的校验，认证成功之后把登录
        信息存储在session中。

    2）编译推送
        编译推送主要的实现思路是利用node的子进程运行gulpfile脚本文件来执行相应的操作。sass的
        编译需要在服务器上安装Ruby和sass。把编译完成后的结果保存在一个临时目录中，包括html、
        css以及image文件。最后把编译和拷贝完成的文件复制到指定的业务仓库中进行提交和推送。
        整个操作流程为：
            1. 初始化项目：检出UI构建分支、检出业务分支
            2. 开发完成UI之后， 做提交。在平台上点击编译推送
            3. 平台去更新UI分支，编译，拷贝文件至业务分支
            4. 更新业务分支，提交，推送。

    3. UI展示




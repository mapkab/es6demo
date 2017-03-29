var express = require('express');
var router = express.Router();

var config = require('../config/config');
var dataProjectInit = require('../config/data-project-init.json');
var datamenu = require('../config/data-menu.json');

var distUrl = '';
var sourceBranch = '';
var sourceUrl = '';
var distBranch = '';

var fs = require('fs');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;

var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';

var path = require('path');
var async = require('async');

/**
 * 根据传入的git项目url路径截取工程名
 * @param gitUrl
 * @returns {string}
 */
function getProjName(gitUrl) {
    var res = '';
    var tempArrUrl = gitUrl.split('/');
    if(tempArrUrl && tempArrUrl[tempArrUrl.length - 1]) {
        res = tempArrUrl[tempArrUrl.length - 1].split('.')[0]
    }
    return res;
}

/**
 * 把传入的git url 拼接上username and password
 * http://username:password@gitlabXXX.git
 * @param gitUrl
 */
function joinUserNameAndPass(req, gitUrl) {
    return gitUrl.replace('http://', 'http://' + req.session.userInfo.username + ':' + req.session.userInfo.psw + '@');;
}

/**
 * 获取要操作的文件夹路径
 * @param req
 * @returns {string}
 */
function getOptDistByUser(req) {
    return config.rootPath + '/' + dataProjectInit[req.session.userInfo.username].rootPath;
}

function cloneFromGitIfNE(dist, gitUrl, rootPath, optType, callback, req, res) {
    fs.access(dist + '/' + gitUrl.name, fs.F_OK, function (err) {
        if(err) {
            console.log('检出项目：' + gitUrl.name + '\n' + '----' + JSON.stringify(gitUrl));
            // 不存在则去git clone  gitRepos[gitUrls[i]]
            try {
                execSync(config.cd + dist + ' && git clone -b ' + gitUrl.branch + ' ' + joinUserNameAndPass(req, gitUrl.url), function(err, stdout, stderr){
                    if(err || stderr) {
                        callback(null, "false");
                        console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                        return;
                    }
                    console.log(iconv.decode(new Buffer(stdout, binaryEncoding), encoding), iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                });
            } catch (e) {
                res.json({message:e.toString(), error:{stack:e.toString()}});
                return;
            }
            // 把dist + '/' + fileName存储起来， 初始化完的项目
            writeDataProjectInit(req, gitUrl, rootPath, optType);
            callback(null, "true");
            return true;
        }
        console.log('存在该项目:' + dist + '/' + gitUrl.name);
        // 如果存在该项目则去更新
        execSync(config.cd + dist + '/' + gitUrl.name + ' && git pull ' , function(err, stdout, stderr){
            if(err || stderr) {
                callback(null, "false");
                console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                return;
            }
            console.log(iconv.decode(new Buffer(stdout, binaryEncoding), encoding));
            console.log('更新成功...');
        });
        writeDataProjectInit(req, gitUrl, rootPath, optType);
        callback(null, "true");
    });
}

function writeDataProjectInit(req, gitUrl, rootPath, optType) {
    // 把dist + '/' + fileName存储起来， 初始化完的项目
    var dpi = dataProjectInit[req.session.userInfo.username];
    // dpi.projects[gitUrl.name] = gitUrl;
    var tempO = dpi.projects[rootPath] || {};
    tempO[optType] = gitUrl;
    dpi.projects[rootPath] = tempO;
    fs.writeFileSync(config.dataProjectInit, JSON.stringify(dataProjectInit));
}

function consoleInfo(req, res) {
    // console.log('没有文件啦');
    var dataInfo = dataProjectInit[req.session.userInfo.username];

    // 文件拷贝完成之后去做提交
    exec(config.cd+ dataInfo.dist.optPath + ' && git add . ', function (err, stdout, stderr) {
        if(err || stderr) {
            console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
            // res.json({message:stdout, error:{stack:stdout}});
            // return;
        }
        exec(config.cd+ dataInfo.dist.optPath + ' && git commit -m 提交静态文件', function (err, stdout, stderr) {
            if(err || stderr) {
                console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                console.log(stdout);
                // res.json({message:stdout, error:{stack:stdout}});
                // return;
            }
            exec(config.cd+ dataInfo.dist.optPath + ' && git push -u origin ' + dataInfo.dist.branch, function (err, stdout, stderr) {
                if(err || stderr) {
                    console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                    res.json({message:stderr, error:{stack:stderr}});
                    return;
                }
                res.json({message:'编译提交成功', error:{stack:'编译提交成功'}});
            });
        });
    });
}

/**
 * 遍历文件
 * @param dir
 * @param callback
 * @param finish
 */
function travel(dir, bizPath, callback, finish) {
    fs.readdir(dir, function (err, files) {
        (function next(i) {
            if (i < files.length) {
                var pathname = path.join(dir, files[i]);
                var nextPath = path.join(bizPath, files[i]);
                console.log("pathname: " + pathname + 'files[i]:' + files[i]);
                console.log("nextPath: " + nextPath);
                fs.stat(pathname, function (err, stats) {
                    if (stats.isDirectory()) {
                        // 创建文件夹
                        fs.mkdir(nextPath, function (err) {
                            // 如果文件夹存在不做处理
                            if(err) {
                                console.log(err);
                            }
                            console.log('文件夹创建成功');
                            travel(pathname, nextPath, callback, function () {
                                next(i + 1);
                            });
                        });
                    } else {
                        callback(pathname, function () {
                            next(i + 1);
                        });
                    }
                });
            } else {
                finish && finish();
            }
        }(0));
    });
}

/**
 * 拷贝文件
 * @param src
 * @param dst
 */
function copyFile(src, dst) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}

function gulpTask(src, dest, req, res, next) {
    var bizType = req.query.bizType;
    var bizPath = getOptDistByUser(req) + '/' + dataProjectInit[req.session.userInfo.username].dist.name;
    // 进入操作目录， 进行更新。更新完毕之后做编译

    if(bizType !== dataProjectInit[req.session.userInfo.username].dist.bizType || !bizType) {
        res.json({message:'业务类型不对！'});
        return ;
    }
    // else {
    //     bizType = bizType.split('-').join('/');
    // }

    async.series([
        function (callback) {
            exec(config.cd + src + ' && git config --global user.email "'+ req.session.userInfo.username +'@gomeplus.com"' , function(err, stdout, stderr){
                callback(null, 'true');
            })
        },
        function (callback) {
            exec(config.cd + src + ' && git config --global user.name "'+ req.session.userInfo.username +'"' , function(err, stdout, stderr){
                callback(null, 'true');
            })
        }
    ],
    function (err, results) {
        exec(config.cd + src + ' && git pull ' , {
            encoding: 'binary',timeout: 100000,maxBuffer: 200*1024,killSignal: 'SIGTERM',cwd: null,env: null
        },function(err, stdout, stderr){
            if(err || stderr) {
                console.log(iconv.decode(new Buffer(JSON.stringify(err)), 'GBK'));
                console.log(iconv.decode(stderr, 'GBK'));
                res.json({message:iconv.decode(stderr, 'GBK') + ' 请先进行初始化'});
                return;
            }
            console.log('更新成功...');
            //更新成功后开一个进程去执行编译操作，需传入编译到哪的路径dest和要编译的路径src
            // dest = dest + '/' + datamenu.bizType[bizType].path + '/'+bizType;
            var execGulp = config.cd + config.rootPath + ' && gulp '+datamenu.bizType[bizType].task+' --src '+src+' --dest '+dest + '/' + datamenu.bizType[bizType].path + '/'+bizType+ ' --bizType ' + bizType + ' --imgPath ' + datamenu.bizType[bizType].gulpImgSrc;
            exec(execGulp,{encoding:'gbk'}, function (err, stdout, stderr) {
                if(err|| (stderr && stderr.length > 0)){
                    console.log(JSON.stringify(err));
                    console.log(iconv.decode(stderr,'GBK'));
                    res.json({message:iconv.decode(stderr, 'GBK') + ' '});
                    return;
                }else{
                    console.log(iconv.decode(stdout,'GBK'));
                    console.log(`编译到${dest}成功`);
                    // bizPath = bizPath + '/' + datamenu.bizType[bizType].path + '/'+bizType;
                    travel(dest, bizPath, function (pathname, call) {
                        var tempPath = path.join(bizPath, pathname.substring(dest.length, pathname.length));
                        console.log("tempPath"  +  tempPath);
                        copyFile(pathname, tempPath);
                        call();
                    }, consoleInfo(req, res));
                }
            });
        })
    });

}

function init(req, res, next) {
    // 获取源路径和目标路径
    sourceUrl = req.query.sourceGitUrl;
    sourceBranch = req.query.sourceBranch;
    distUrl = req.query.distGitUrl;
    distBranch = req.query.distBranch;
    var bizType = req.query.bizType;// 业务分支类型 pc app h5， 根据对应的类型去执行不同的脚本文件
    if(!(sourceUrl && sourceBranch && distUrl && distBranch && bizType)) {
        res.json({success:0, message:'请完善信息！'});
        return;
    }

    var username = req.session.userInfo.username;
    var projWorkSpace = config.rootPath + '/' ;
    var sourceUrlP = '',
        distUrlP = '',
        cloneOpt = {
            source: {
                name:"",
                url:"",
                optPath:"",
                branch:""
            },// 开发分支
            dist: {
                name:"",
                url:"",
                optPath:"",
                branch:"",
                bizType:bizType
            }, // 推送分支
            rootPath:""
        },
        rootPath = "";
    // 根据传入的路径截取最后的工程名， 再用当前用户名拼接上工程名作为本地仓库的文件夹名称
    if(username && sourceUrl && distUrl) {
        sourceUrlP = getProjName(sourceUrl);
        distUrlP = getProjName(distUrl);

        if(sourceUrlP && distUrlP) {
            cloneOpt.source.name = sourceUrlP;
            cloneOpt.source.url = sourceUrl;
            cloneOpt.source.branch = sourceBranch;
            cloneOpt.dist.name = distUrlP;
            cloneOpt.dist.url = distUrl;
            cloneOpt.dist.branch = distBranch;

            rootPath = username + '_' + sourceUrlP + '_' + distUrlP + '_b_'+ sourceBranch +'_'+ distBranch;
            projWorkSpace += rootPath;
            cloneOpt.rootPath = rootPath;
        }
    }
    console.log( __dirname + ' ------- '  +  projWorkSpace);

    // 判断该目录是否存在
    fs.access(projWorkSpace, fs.F_OK, function (err) {
        if(err) {
            // 不存在这样的目录的时候去创建改目录
            fs.mkdir(projWorkSpace, function(err){
                if(err) {
                    console.log(err);
                    res.json({message:'创建目录失败', error:{stack:'创建目录失败' + err}});
                }
                // 创建目录成功之后， 在该目录下创建一个用于暂存编译文件的文件夹， 在后续编译提交的时候，
                // 编译完成的静态文件就存储在该目录下。
                fs.mkdir(projWorkSpace + '/dist', function (err) {
                    if(err) {
                        console.log(err);
                        /*res.json({message:'创建目录失败', error:{stack:'创建目录失败' + err}});
                         return;*/
                    }
                });
            });
        }
        // 保存当前初始化的数据
        cloneOpt.source.optPath = projWorkSpace + '/' + cloneOpt.source.name;
        cloneOpt.dist.optPath = projWorkSpace + '/' + cloneOpt.dist.name;
        if(!dataProjectInit[req.session.userInfo.username]){
            dataProjectInit[req.session.userInfo.username] = {};
            dataProjectInit[req.session.userInfo.username].projects = {};
        }
        dataProjectInit[req.session.userInfo.username].rootPath = cloneOpt.rootPath;
        dataProjectInit[req.session.userInfo.username].source = cloneOpt.source;
        dataProjectInit[req.session.userInfo.username].dist = cloneOpt.dist;
        async.series([
                function(callback) {
                    cloneFromGitIfNE(projWorkSpace, cloneOpt.source, cloneOpt.rootPath, 'source',callback, req, res);
                    // callback(null, 'one');
                },
                function(callback) {
                    // do some more stuff ...
                    cloneFromGitIfNE(projWorkSpace, cloneOpt.dist, cloneOpt.rootPath, 'dist',callback, req, res);
                }
            ],
            // optional callback
            function(err, results) {
                console.log(results);
                var tag = true;
                for(var i in results) {
                    tag = results[i] && tag;
                }
                if(tag) {
                    res.json({message:'初始化成功', error:{stack:'初始化成功'}});
                } else {
                    res.json({message:'初始化失败', error:{stack:'初始化失败'}});
                }
            });

    })
}

router.get('/', function(req, res, next) {

    // 获取源路径和目标路径
    var sourceUrl = req.body.sourceUrl;
    var distUrl = req.body.distUrl;

});

router.get('/init', function(req, res, next) {
    init(req, res, next);
});

router.get('/push', function(req, res, next) {
    // init(req, res, next);
    // 在推送的时候， 先去编译再去拷贝文件， add, commit, push
    var src = getOptDistByUser(req) + '/' + dataProjectInit[req.session.userInfo.username].source.name;
    var dist = getOptDistByUser(req) + '/dist';
    gulpTask(src, dist, req, res, next);
});



module.exports = router;

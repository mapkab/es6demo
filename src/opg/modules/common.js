var config = require('../config/config');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var iconv = require('iconv-lite');
var config = require('../config/config');

module.exports =  {
    /**
     * 根据传入的git项目url路径截取工程名
     * @param gitUrl
     * @returns {string}
     */
    getProjName: function(gitUrl) {
        var res = '';
        var tempArrUrl = gitUrl.split('/');
        if(tempArrUrl && tempArrUrl[tempArrUrl.length - 1]) {
            res = tempArrUrl[tempArrUrl.length - 1].split('.')[0]
        }
        return res;
    },
    /**
     * 把传入的git url 拼接上username and password
     * http://username:password@gitlabXXX.git
     * @param gitUrl
     */
    joinUserNameAndPass: function(req, gitUrl) {
        return gitUrl.replace('http://', 'http://' + req.session.userInfo.username + ':' + req.session.userInfo.psw + '@');;
    },
    /**
     * 利用gulp进行编译
     * @param src
     * @param dest
     */
    compileStatic: function (src, dest, callback) {
        execSync(config.cd + config.gomeplusUIPath + ' && gulp --src '+src+' --dest '+dest , function (err, stdout, stderr) {
            if(err|| (stderr && stderr.length > 0)){
                console.log(JSON.stringify(err));
                console.log(iconv.decode(stderr,'GBK'));
                return;
            }else{
                console.log(iconv.decode(stdout,'GBK'));
                console.log(`编译到${dest}成功`);
            }
        });
    }

}



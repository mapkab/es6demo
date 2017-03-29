/**
 * Created by lishengyong on 2016/11/2.
 */


/**
 * 退出登录
 */
document.getElementById('logout').addEventListener('click', function () {
    var form = document.createElement('form');
    form.action = '/logout';
    form.method = 'POST';
    form.submit();
});

/**
 * 菜单切换
 */
$("#menu li").on('click', function () {
    $("#content .dataContent").hide();
   var target = $(this).attr('data-target');
    $("#menu li").toggleClass('active', '');
    $("#" + target).show();
});

/**
 * 初始化项目以及编译推送
 */
$(".commitBtn").on('click', 'button',function () {
    setLoading('#' + $(this).attr('id'));
    var param = {};
    param.sourceGitUrl = $('#sourceGitUrl').val();
    param.sourceBranch = $('#sourceBranch').val();
    param.distGitUrl = $('#distGitUrl').val();
    param.distBranch = $('#distBranch').val();
    param.bizType = $('#bizTypeText').val();
    if(!(param.sourceGitUrl && param.sourceBranch && param.distGitUrl && param.distBranch && param.bizType)) {
        $('#resultTip').html('请完善信息...');
        stopLoading();
        return ;
    }
    if(!isGitRepo(param.sourceGitUrl)
        || !isGitRepo(param.distGitUrl)) {
        $('#resultTip').html('请输入正确的git仓库路径');
        stopLoading();
        return;
    }
    switch (param.distBranch) {
        case 'master':
            $('#resultTip').html('业务仓库分支不能为master');
            stopLoading();
            return;
            break;
        /*case 'develop':
            $('#resultTip').html('业务仓库分支不能为develop');
            stopLoading();
            return;
            break;*/
        case 'release':
            $('#resultTip').html('业务仓库分支不能为release');
            stopLoading();
            return;
            break;
        default:
    };
    $.ajax({
        url:$(this).attr('data-formAction'),
        type:'json',
        method:'get',
        data:param,
        success:function (data) {
            console.log(data);
            if(data && data.message) {
                $('#resultTip').html(data.message);
            } else {
                $('#resultTip').html('');
            }
            stopLoading();
        },
        error:function (err) {
            console.log(err);
            stopLoading();
        }
    });
});

/**
 * 已经构建分支的选择
 */
$("#initedBtn ul li a").on('click',  function () {
    var distGitUrl = $(this).attr("data-disturl");
    var sourceBranch = $(this).attr("data-sourcebranch");
    var sourceGitUrl = $(this).attr("data-sourceurl");
    var distBranch = $(this).attr("data-distbranch");
    var bizTypeText = $(this).attr("data-bizType");
    $('#sourceGitUrl').val(sourceGitUrl);
    if(sourceGitUrl) {
        queryBranch();
    }
    $('#sourceBranch').val(sourceBranch);
    $('#distGitUrl').val(distGitUrl);
    $('#distBranch').val(distBranch);
    $('#bizTypeText').val(bizTypeText);
});

/**
 * 业务分支类型选择
 */
$("#bizTypeBtn ul li a").on('click', function () {
    console.log($(this).html());
    $('#bizTypeText').val($(this).html());
})

/**
 * 设置按钮为加载中状态
 * @param clazz
 */
function setLoading(clazz) {
    var l = Ladda.create( document.querySelector( clazz ) );
    l.start();
    l.setProgress( 0.5 );
    l.stop();
    l.toggle();
    l.isLoading();
}

/**
 * 取消按钮加载中状态
 */
function stopLoading() {
    Ladda.stopAll();
}

/**
 * 重置表单
 */
$('#reset').on('click', function () {
    $('#sourceGitUrl').val('');
    $('#sourceGitUrl').blur();
    $('#sourceBranch').val('');
    $('#distGitUrl').val('');
    $('#distBranch').val('');
    $('#bizTypeText').val('');
    $('#resultTip').html('');
    $('#branchesSrc').html('');
});

function queryBranch() {
    var sourceGitUrl = $('#sourceGitUrl').val();
    sourceGitUrl = sourceGitUrl.trim();
    $.ajax({
        url:'branch/get',
        type:'json',
        method:'get',
        data:{sourceGitUrl:sourceGitUrl},
        success:function (data) {
            $('#branchesSrc').html('');
            console.log(data);
            var branchs = '';
            if(data && data.data) {
                for(var i = 0, len = data.data.length; i < len; ++i) {
                    if(data.data[i].name === 'master' || data.data[i].name === 'develop') {
                        branchs += '<li class="disabled"><a href="#">' + data.data[i].name + '</a></li>'
                    } else {
                        branchs += '<li><a href="#">' + data.data[i].name + '</a></li>'
                    }
                }
            }
            console.log(branchs);
            $('#branchesSrc').append(branchs);
            $('#branchesSrc li a').on('click', function () {
                $('#sourceBranch').val($(this).text());
                switch($(this).text()){
                    case 'master':
                    case 'develop':
                        $('#resultTip').html('源仓库分支不建议使用'+$(this).text());
                        break;
                    default:
                }
            });
        },
        error:function (data) {
            console.log(data);
        }
    });
}

/**
 * 选择源路径默认值
 */
$('#gitUrlSrc li a').on('click', function () {
    $('#sourceGitUrl').val($(this).text());
    queryBranch();
});

$('#distGitUrl').change(function () {
    console.log($(this).val());
    if(!isGitRepo($(this).val())) {
        $('#resultTip').html('请输入正确的git仓库路径');
        return;
    } else {
        $('#resultTip').html('');
    }
});

function isGitRepo(url) {
    if(url && url.indexOf('.git') < 0) {
        return false;
    }
    return true;
}

$('#help').on('click', function () {

})

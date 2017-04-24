/**
 * Created by hq on 2017/3/6.
 */
$(function () {
    //一、导航搜索吸顶
    //1.1 获取nav距离顶部的间距
    var navOffsetTop = $('.nav').offset().top;

    //1.2 监听窗口滚动，设置对应的样式
    $(window).on('scroll',function () {
        var scroll_top = $(window).scrollTop();
        if (scroll_top >= navOffsetTop){
            $('.nav img').css({opacity:1});
            $('.nav').css({position:'fixed',top:0});
            $('.back_top').fadeIn(300);

        }else {
            $('.nav img').css({opacity:0});
            $('.nav').css({position:'absolute',top:navOffsetTop});
            $('.back_top').fadeOut(300);
        }
    });

    //二、点击back_top返回顶部
    $('.back_top').on('click',function () {
       $('html body').animate({scrollTop:0})
    });

    //三、点击提交按钮，添加任务（添加li）
    /**
     * taskArray 记录添加的事项
     * 当界面加载进来的时候，就去从存储的数据中拿出对应的数据，如果没有才去加载
     * @type {Array}
     */
    var taskArray = store.get('taskArray')||[];

    //将加载的数据显示在界面上
    render_view();

    $('input[type=submit]').on('click',function (event) {
        //3.1 去掉submit的默认行为
        event.preventDefault();

        //3.2 获取输入的内容，并作判断
        var inputContent = $('input[type=text]').val();
        if ($.trim(inputContent) == ''){
            alert('请输入内容');
            return;

        }else {
            if ($.trim(inputContent)!=''){
                $('input[type=text]').val('');
            }
            //创建任务对象
            var obj = {
                title:'',
                content:'',
                isCheck:false,
                remind_time:'',
                is_notice:false
            };
            //给title赋值
            obj.title = inputContent;

            //将创建的任务添加到数组中
            taskArray.push(obj);

            //根据数组的长度，添加节点而且把节点显示出来
            render_view();
        }
    });
    
    //四、创建并显示添加的任务
    function render_view() {
        /**
         * 存储数据，第一个参数用来表示存储的数据的标示，任何值都可以，
         * 只是用这个值来取出数据第二个参数表示要存储的数据
         */
        store.set('taskArray',taskArray);
        //清空上次内容
        $('.task').empty();
        $('.finish_task').empty();

        //取出添加到数组中的每一个元素（每一项任务）
        for(var i = 0; i < taskArray.length; i++){
            var obj = taskArray[i];
            if (obj == undefined ||!obj){//为了规范和严格要进行元素的判定
                continue;
            }
            /**
             * 创建li
             * data-index:用来给li绑定索引 当删除对应任务的时候可以根据这个索引来删除
             * 为了让对应的checkBox点击的时候，让对应的不同的事项中添加不同的li
             * 所以我们需要改造渲染方法'+(obj.isCheck?'checked':'')+'
             */
            var tag = '<li data-index='+ i +' >'+
                '<input type="checkbox" '+(obj.isCheck?'checked':'')+'>'+
                '<span class="item_title">'+ obj.title +' </span>'+
                '<span class="del">删 除</span>'+
                '<span class="detail">详 情</span>'+
                '</li>';

            //添加li 根据是否检查过，来确定添加到待选事件还是完成事件
            if (obj.isCheck){
                $('.finish_task').prepend(tag);
            }else {
                $('.task').prepend(tag);
            }
        }
    }

    //五、切换tab
    $('.header li').on('click',function () {
        //5.1 点击li切换任务事项
        $(this).addClass('curr').siblings().removeClass('curr');

        //5.2 切换li下对应的盒子
        //5.21 获取点击的索引值
        var index = $(this).index();
        //5.22 切换对应的盒子
        $('.body').eq(index).addClass('active').siblings().removeClass('active');
    });

    //六、点击删除按钮删除对应的li（任务）
    //出了事件域  需要使用代理来触发对应的事件
    $('body').on('click','.del',function () {
        //6.1 获取del所在的li
        var item = $(this).parent();
        //6.2 获取li对应的索引值
        var index = item.data('index');
        //6.3 为了代码严格，判断索引
        if (index == undefined || !taskArray[index]){
            return;
        }
        //6.4 删除数组中对应的元素（删除数据）
        delete taskArray[index];
        //6.5 删除节点
        item.slideUp(300,function () {
            item.remove();
        });

        //6.6保存数据
        store.set('taskArray',taskArray);

    });

    //七、点击checkbox 将任务添加到已完成事项
    $('body').on('click','input[type=checkbox]',function () {
        //7.1 获取checkbox所在的li
        var item = $(this).parent();
        //7.2 获取li对应的索引值
        var index = item.data('index');
        //7.3 为了代码严格，判断索引
        if (index == undefined || !taskArray[index]){
            return;
        }
        //7.4 取出数组中对应的元素
        var obj = taskArray[index];

        //7.5 设置isCheck选中
        obj.isCheck = $(this).is(':checked');

        //7.6 用选中的元素替换原来没有选中的元素
        taskArray[index] = obj;

        //更新界面
        render_view();
    });

    //八、点击详情显示内容
    var detail_current_index = 0;//记录当前点击的详情的索引
    $('body').on('click','.detail',function () {
        $('.mask').fadeIn();
        var item = $(this).parent();
        var index = item.data('index');
        detail_current_index = index;
        if (index==undefined||!taskArray[index])return;
        var obj = taskArray[index];
        //设置详情界面的值
        $('.detail_header .title').text(obj.title);
        $('.detail_body textarea').val(obj.content);
        $('.detail_body #date_time').val(obj.remind_time);

    });
    //8.1 点击蒙版和关闭按钮 隐藏详情界面
    $('.mask').click(function () {
        $(this).fadeOut()
    });
    $('.detail_header .close').click(function () {
        $('.mask').fadeOut();
    });
    //8.2 点击详情界面不隐藏蒙版
    $('.detail_content').click(function (event) {
        //阻止冒泡
        event.stopPropagation();
    });
    
    //8.3 当鼠标移动到时间输入框的时候  弹出时间选择器
    //设置本地化时间(设置中国时间)
    $.datetimepicker.setLocale('ch');
    //给对应的标签设置对应时间选择器
    $('#date_time').datetimepicker();

    //九、点击更新按钮 更新数据和界面
    $('.detail_body button').click(function () {
        /*9.1 获取点击详细按钮对应的索引值 detail_current_index*/
        /*9.2 根据索引值获取对应数组中的元素*/
        var item = taskArray[detail_current_index];

        /*9.3 给对应的元素赋值*/
        item.title = $('.detail_body textarea').val();
        //item.content = $('.detail_body textarea').val();
        item.remind_time = $('.detail_body #date_time').val();
        item.is_notice = false;

        //9.4 将更新的数据替换原来数组中的数据
        taskArray[detail_current_index] = item;

        //9.5 存储数据
        store.set('taskArray',taskArray);

        //9.6 更新界面
        render_view();

        //9.7 让蒙版消失
        $('.mask').fadeOut();
    });

    //十、设置提醒
    //我们需要时时刻刻比较当前的时间和设置的时间，所以要使用定时器
    setInterval(function () {
        //10.1 获取实时时间的毫秒（当前时间）
        var currentTime = (new Date()).getTime();
        //10.2 获取每一个元素设置的提醒时间，和当前时间比较
        for(var i = 0; i < taskArray.length; i++){
            var item = taskArray[i];
            if(item == undefined ||!item ||item.remind_time.length<1||item.is_notice)continue;
            /*10.3 判断当前的时间是否大于提醒时间*/
            /*10.31 获取每一提醒时间的毫秒数*/
            var rem_time = (new Date(item.remind_time)).getTime();
            if(currentTime - rem_time > 1){
                //需要提醒，让对应铃声响起
                /*获取的对象是jQuery对象我们需要转化成js对象*/
                $('video').get(0).play();
                $('video').get(0).currentTime = 0;
                /*10.4 当铃声响起后，表示已经提醒过了，我们要设置提醒为true*/
                item.is_notice = true;
                /*10.5重新赋值*/
                taskArray[i] = item;
                /*10.6数据变化，就要存储数据*/
                store.set('taskArray',taskArray);
            }
        }
    },2000)

});
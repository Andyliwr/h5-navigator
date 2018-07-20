'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * 同花顺H5自定义导航插件
 * @author andyliwr(lidikang@myhexin.com)
 * @date 2018/07/17
 * @last_modified 2018/07/17 15:21
 */

(function (factory) {
  // 如果要兼容 CMD 等其他标准，可以在下面添加条件，比如：
  // CMD: typeof define === 'function' && define.cmd
  // UMD: typeof exports === 'object'
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['zepto'], factory);
  } else {
    // 如果要兼容 Zepto，可以改写，比如使用：factory(Zepto||jQuery)
    factory(Zepto);
  }
})(function ($) {
  'use strict';

  /**
   * 定义插件的构造方法
   * @param element 选择器对象
   * @param options 配置项
   * @constructor
   */

  var Plugin = function Plugin(element, options) {
    //合并参数设置
    this.options = $.extend({}, Plugin.defaults, options);

    //将选择器对象赋值给插件，方便后续调用
    this.$element = $(element);

    //进行一些初始化工作
    this.init();
  };

  /**
   * 插件名称，即调用时的名称（$.fn.pluginName）
   * @type {string}
   */
  Plugin.pluginName = 'thsH5Navigator';

  /**
   * 插件缓存名称，插件通过 data 方法缓存在 dom 结构里，存储数据的名称
   * @type {string}
   */
  Plugin.dataName = 'thsH5NavigatorData';

  /**
   * 插件版本
   * @type {string}
   */
  Plugin.version = '1.0.0';

  /**
   * 插件默认配置项
   * @type {{}}
   */
  Plugin.defaults = {
    openDebug: true, // 是否开启调试模式
    title: document.title, // 页面标题
    titleAlign: 'center', // 页面标题的对齐方式，left或者center
    backgroundColor: '#e83031', // 导航背景颜色，多个区域请用逗号隔开
    autoHideNavArea: '.header-img', // 导航栏经过该区域的时候透明化
    showRightNav: true, // 是否展示导航最右边的按钮
    rightNavIcon: 'share', // 导航最右边的按钮图标名称，可选值more(更多)，share(分享)
    clickLeftNavCallback: null, // 点击导航最左边边的按钮图标的执行函数，如传空，默认跳转到上一页
    clickRightNavCallback: function clickRightNavCallback() {} // 点击导航最右边的按钮图标的执行函数
  };

  /**
   * 定义插件的方法
   * @type {{}}
   */
  Plugin.prototype = {
    // 插件初始化事件
    init: function init() {
      var _this = this;

      this.debug('==== 导航栏插件开始初始化 ====');

      // 填充DOM
      this.$element.html('\n        <div class="nav-bg"></div>\n        <div class="nav">\n          <div class="back"><i class="iconfont icon-back"></i></div>\n          <div class="title ' + this.options.titleAlign + '"><p class="inner"><span class="text">' + this.options.title + '</span></p></div>\n          ' + (this.options.showRightNav ? '<div class="other"><i class="iconfont icon-' + this.options.rightNavIcon + '"></i></div>' : '') + '\n        </div>\n      ');

      // 设置导航的样式
      this.$element.find('.nav-bg').css('background-color', this.options.backgroundColor);

      // 判断标题是否超出，超出部分滚动显示
      this.scrollTitle();

      // 绑定点击事件
      // 双击标题回到顶部
      var lastClickTime = 0;
      this.$element.on('click', function () {
        var nowTime = new Date().getTime();
        if (nowTime - lastClickTime < 400) {
          _this.debug('触发了导航双击事件');
          lastClickTime = 0;
          _this.scrollToTop({
            element: $(window),
            toT: 0,
            durTime: 300,
            delay: 30,
            callback: null
          });
        } else {
          lastClickTime = nowTime;
        }
      });

      // 点击导航最左边按钮
      this.$element.find('.back').on('click', function () {
        _this.debug('触发了导航最左边图标的点击事件');
        if (_this.options.clickLeftNavCallback && typeof _this.options.clickLeftNavCallback === 'function') {
          _this.options.clickLeftNavCallback.apply(_this);
        } else {
          history.back();
        }
      });

      // 点击导航最右边按钮
      if (this.options.showRightNav) {
        this.$element.find('.other').on('click', function () {
          _this.debug('触发了导航最右边图标的点击事件');
          if (_this.options.clickRightNavCallback && typeof _this.options.clickRightNavCallback === 'function') {
            _this.options.clickRightNavCallback.apply(_this);
          }
        });
      }

      // 页面滑动的时候自动隐藏导航栏
      if (this.options.autoHideNavArea) {
        var areas = this.options.autoHideNavArea.split(',').filter(function (item) {
          return $(item).length > 0;
        });
        // 改变透明度函数
        var changeOpacity = function changeOpacity() {
          var navHeight = _this.$element.height();
          var scrollHeight = $(window).scrollTop();
          var autoHideAreaElement = null; // 当前需要透明化导航的元素
          // 判断当前是否处在需要隐藏的dom上
          var isOnArea = areas.some(function (item) {
            var currentElement = $(item);
            if (currentElement && currentElement.offset()) {
              // 控制当前导航处在元素覆盖范围内
              if (currentElement.offset().top - scrollHeight <= 0 && currentElement.offset().top + currentElement.offset().height > scrollHeight) {
                autoHideAreaElement = currentElement;
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          });
          if (isOnArea) {
            // 去除body的padding-top，让页面在顶部展示
            $('body').css('padding-top', '0');
            // 计算导航高度到元素底部的距离，以此来决定透明度的值，40是偏移值
            var opacity = (autoHideAreaElement.offset().top + autoHideAreaElement.offset().height + 40 - navHeight - scrollHeight) / autoHideAreaElement.offset().height;
            if (opacity > 1) opacity = 1;
            if (opacity < 0) opacity = 0;
            _this.$element.find('.nav-bg').css('opacity', 1 - opacity);
          }
        };
        changeOpacity();
        // 监听window的scroll事件
        $(window).on('scroll', function () {
          changeOpacity();
        });
      }
    },

    // 插件调试函数，可根据openDebug参数选择打开或者关闭调试
    debug: function debug() {
      if (!!this.options.openDebug) {
        console.log.apply(this, arguments);
      }
    },

    /**
     * 滚动到顶部函数
     * @param options 滚动设置，例如 {element: 'body', toTop: 0, duration: 300, delay: 30, callback: () => {}}
     */

    scrollToTop: function scrollToTop(options) {
      var defaults = {
        element: $(window), // 滚动元素
        toT: 0, //滚动目标位置
        durTime: 500, //过渡动画时间
        delay: 30, //定时器时间
        callback: null //回调函数
      };

      var opts = $.extend(defaults, options);
      var timer = null;
      var $element = opts.element;
      var curTop = $element.scrollTop(); //滚动条当前的位置
      var subTop = opts.toT - curTop; //滚动条目标位置和当前位置的差值
      var index = 0;
      var dur = Math.round(opts.durTime / opts.delay);

      var smoothScroll = function smoothScroll(t) {
        index++;
        var per = Math.round(subTop / dur);
        if (index >= dur) {
          document.documentElement.scrollTop = t;
          window.clearInterval(timer);
          if (opts.callback && typeof opts.callback == 'function') {
            opts.callback();
          }
          return;
        } else {
          document.documentElement.scrollTop = curTop + index * per;
        }
      };

      timer = window.setInterval(function () {
        smoothScroll(opts.toT);
      }, opts.delay);
    },

    // 标题滚动显示函数
    scrollTitle: function scrollTitle() {
      var _this2 = this;

      var titleWidth = this.$element.find('.title').width(); // 标题最大宽度
      var titleInnerWidth = this.$element.find('.title .inner .text').width(); // 标题实际宽度

      if (titleInnerWidth > titleWidth) {
        // 复制标题以实现无缝滚动
        var innerElement = this.$element.find('.title .inner');
        innerElement.append(innerElement.html());
        var textElement = this.$element.find('.title .inner .text');
        var maxLeftValue = textElement.eq(0).width();
        var currentLeftValue = 0;

        // 3s后开始向左滑动
        setTimeout(function () {
          _this2.titleTimer = setInterval(function () {
            currentLeftValue += 1;
            textElement.css('left', -currentLeftValue);
            // 当currentLeftValue超过maxLeftValue，重置currentLeftValue为0
            if (currentLeftValue > maxLeftValue) {
              currentLeftValue = 0;
            }
          }, 60);
        }, 3000);
      }
    }
  };

  /**
   * 缓存同名插件
   */
  var old = $.fn[Plugin.pluginName];

  /**
   * 定义插件，扩展$.fn，为Zepto对象提供新的插件方法
   * 调用方式：$.fn.pluginName()
   * @param option {string/object}
   */
  $.fn[Plugin.pluginName] = function (option) {
    return this.each(function () {
      var $this = $(this);

      var data = $.fn[Plugin.pluginName].pluginData[$this.data(Plugin.dataName)];
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
      if (!data) {
        //zepto的data方法只能保存字符串，所以用此方法解决一下
        $.fn[Plugin.pluginName].pluginData[++$.fn[Plugin.pluginName].pluginData.index] = new Plugin(this, options);
        $this.data(Plugin.dataName, $.fn[Plugin.pluginName].pluginData.index);
        data = $.fn[Plugin.pluginName].pluginData[$this.data(Plugin.dataName)];
      }

      //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
      if (typeof option == 'string') data[option]();
    });
  };

  /**
   * zepto的data方法只能保存字符串，所以用一个对象来存储data
   * @type {{index: number}}
   */
  $.fn[Plugin.pluginName].pluginData = { index: 0 };

  $.fn[Plugin.pluginName].Constructor = Plugin;

  /**
   * 为插件增加 noConflict 方法，在插件重名时可以释放控制权
   * @returns {*}
   */
  $.fn[Plugin.pluginName].noConflict = function () {
    $.fn[Plugin.pluginName] = old;
    return this;
  };

  /**
   * 可选：
   * 通过在 dom 上定义 data-role='pluginName' 的方式，自动实例化插件，省去页面编写代码
   * 在这里还可以扩展更多配置，仅仅通过 data 属性 API 就能使用插件
   */
  $(document).ready(function () {
    // 自动插入dom
    $('<div data-role="' + Plugin.pluginName + '">').addClass('navigator').appendTo('body');
    // 进行插件的初始化
    $('[data-role="' + Plugin.pluginName + '"]').each(function () {
      var $this = $(this);
      var data = $.fn[Plugin.pluginName].pluginData[$this.data(Plugin.dataName)];

      // ...

      $.fn[Plugin.pluginName].call($this, data);
    });
  });
});
/*
 * 同花顺H5自定义导航插件
 * @author andyliwr(lidikang@myhexin.com)
 * @date 2018/07/17
 * @last_modified 2018/07/17 15:21
 */

;(function(factory) {
  // 如果要兼容 CMD 等其他标准，可以在下面添加条件，比如：
  // CMD: typeof define === 'function' && define.cmd
  // UMD: typeof exports === 'object'
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['zepto'], factory)
  } else {
    // 如果要兼容 Zepto，可以改写，比如使用：factory(Zepto||jQuery)
    factory(Zepto)
  }
})(function($) {
  'use strict'

  /**
   * 定义插件的构造方法
   * @param element 选择器对象
   * @param options 配置项
   * @constructor
   */
  let Plugin = function(element, options) {
    //合并参数设置
    this.options = $.extend({}, Plugin.defaults, options)

    //将选择器对象赋值给插件，方便后续调用
    this.$element = $(element)

    //进行一些初始化工作
    this.init()

    // 设置body的padding-top
    $('body').css('padding-top', this.$element.height())
  }

  /**
   * 插件名称，即调用时的名称（$.fn.pluginName）
   * @type {string}
   */
  Plugin.pluginName = 'H5Navigator'

  /**
   * 插件缓存名称，插件通过 data 方法缓存在 dom 结构里，存储数据的名称
   * @type {string}
   */
  Plugin.dataName = 'H5NavigatorData'

  /**
   * 插件版本
   * @type {string}
   */
  Plugin.version = '1.0.0'

  /**
   * 插件默认配置项
   * @type {{}}
   */
  Plugin.defaults = {
    openDebug: true, // 是否开启调试模式
    title: '', // 页面标题
    titleAlign: 'center', // 页面标题的对齐方式，left或者center
    backgroundColor: '#e83031', // 导航背景颜色，多个区域请用逗号隔开
    autoHideNavArea: '', // 导航栏经过该区域的时候透明化
    showRightNav: false, // 是否展示导航最右边的按钮
    rightNavIcon: '', // 导航最右边的按钮图标名称，可选值more(更多)，share(分享)
    clickLeftNavCallback: null, // 点击导航最左边边的按钮图标的执行函数，如传空，默认跳转到上一页
    clickRightNavCallback: null, // 点击导航最右边的按钮图标的执行函数
    isExitWhenNoPageBack: false, // 是否退出全屏webview当页面已经返回到顶部(history.length = 1)
    iosScrollBottomCallback: null // 滑动到底部统计函数
  }

  /**
   * 定义插件的方法
   * @type {{}}
   */
  Plugin.prototype = {
    // 插件初始化事件
    init: function() {
      this.debug('==== 导航栏插件开始初始化 ====')

      // 给navigator添加平台标识
      this.$element.data('platform', this.isIos() ? 1 : 0)

      // 填充DOM
      this.$element.html(`
        <div class="nav-bg"></div>
        <div class="nav">
          <div class="back"><i class="iconfont icon-back"></i></div>
          <div class="title ${this.options.titleAlign}"><p class="inner"><span class="text">${this.options.title}</span></p></div>
          ${this.options.showRightNav ? `<div class="other"><i class="iconfont icon-${this.options.rightNavIcon}"></i></div>` : ''}
        </div>
      `)

      // 设置导航的样式
      this.$element.find('.nav-bg').css('background-color', this.options.backgroundColor)

      // 判断标题是否超出，超出部分滚动显示
      this.scrollTitle()

      // 点击导航最左边按钮
      this.$element.find('.back').on('click', () => {
        this.debug('触发了导航最左边图标的点击事件')
        if (this.options.clickLeftNavCallback && typeof this.options.clickLeftNavCallback === 'function') {
          this.options.clickLeftNavCallback.apply(this)
        } else {
          this.debug('执行了history.back')
          // 当页面返回到顶层的时候需要调用客户端协议退出webview
          if (this.options.isExitWhenNoPageBack && history.length === 1) {
            if (typeof callNativeHandler === 'function') {
              callNativeHandler('goback', { type: 'component' }, function(data) {})
            } else {
              history.back()
            }
          } else {
            history.back()
          }
        }
      })

      // 点击导航最右边按钮
      if (this.options.showRightNav) {
        this.$element.find('.other').on('click', () => {
          this.debug('触发了导航最右边图标的点击事件')
          if (this.options.clickRightNavCallback && typeof this.options.clickRightNavCallback === 'function') {
            this.options.clickRightNavCallback.apply(this)
          }
        })
      }

      /**
       * 修复ios下输入弹框弹出时fixed失效的问题
       * 通过引入Iscoll来模拟浏览器的滚动
       */
      if (this.isIos()) {
        // 动态引入iscoll.js
        let script = document.createElement('script')
        script.language = 'JavaScript'
        script.type = 'text/javascript'
        script.src = 'http://s.thsi.cn/js/m/kh/common/scripts/iscroll-probe.js'
        document.body.appendChild(script)
        script.onload = event => {
          this.debug('==== 加载iscroll.js成功 ====')
          $('html, body').css({ height: '100%', overflow: 'hidden' })
          $('.container').css({
            height: $('body').height() - this.$element.height()
          })
          let myIscroll = new IScroll('.container', {
            mouseWheel: true, // 允许滚轮 , 默认false
            scrollbars: false, // 允许滚动条出现 ,并滚动 , 默认false
            probeType: this.options.autoHideNavArea ? 3 : 1, // probeType为2表示定时执行，probeType为1表示定时执行
            click: true, // 不默认组织click和touch事件
            tap: true
            // fadeScrollbars: false, //滚动条 渐隐 渐现 , 默认 false
          })
          window.myIscroll = myIscroll

          // 页面滑动的时候自动隐藏导航栏
          if (this.options.autoHideNavArea) {
            this.changeOpacity()
            myIscroll.on('scroll', () => {
              this.changeOpacity()
            })
            myIscroll.on('scrollEnd', () => {
              this.changeOpacity()
            })
          }

          if (this.options.iosScrollBottomCallback) {
            this.hasScrollToBottom = false
            myIscroll.on('scrollEnd', () => {
              if (Math.abs(myIscroll.y - myIscroll.maxScrollY) < 20 && myIscroll.directionY === 1 && !this.hasScrollToBottom) {
                if (typeof this.options.iosScrollBottomCallback === 'function') {
                  this.options.iosScrollBottomCallback()
                  this.hasScrollToBottom = true
                }
              }
            })
          }

          // 双击标题滚动到顶部
          let lastClickTime = 0
          // IOS click有300ms的延迟所以使用touchstart来替代click事件
          this.$element.find('.text').on('touchstart', () => {
            let nowTime = new Date().getTime()
            if (nowTime - lastClickTime < 400) {
              this.debug('触发了导航双击事件')
              myIscroll.scrollTo(0, 0, 300)
              // scrollTo事件不触发scroll事件，使用setTimeout弥补下
              if (this.options.autoHideNavArea) {
                setTimeout(() => {
                  this.changeOpacity()
                }, 300)
              }
            } else {
              lastClickTime = nowTime
            }
          })
        }
        script.onerror = () => {
          this.debug('加载iscroll.js失败')
        }
      } else {
        // 双击标题回到顶部
        let lastClickTime = 0
        this.$element.on('click', event => {
          if (event.target.className.indexOf('text') > -1) {
            let nowTime = new Date().getTime()
            if (nowTime - lastClickTime < 400) {
              this.debug('触发了导航双击事件')
              lastClickTime = 0
              this.scrollToTop({
                element: $(window),
                toT: 0,
                durTime: 300,
                delay: 30,
                callback: null
              })
            } else {
              lastClickTime = nowTime
            }
          }
        })

        // 页面滑动的时候自动隐藏导航栏
        if (this.options.autoHideNavArea) {
          this.changeOpacity()
          // Android监听window的scroll事件
          $(window).on('scroll', () => {
            this.changeOpacity()
          })
        }
      }
    },

    // 插件调试函数，可根据openDebug参数选择打开或者关闭调试
    debug: function() {
      if (!!this.options.openDebug) {
        console.log.apply(this, arguments)
      }
    },

    /**
     * 滚动到顶部函数
     * @param options 滚动设置，例如 {element: 'body', toTop: 0, duration: 300, delay: 30, callback: () => {}}
     */

    scrollToTop: function(options) {
      let defaults = {
        element: $(window), // 滚动元素
        toT: 0, //滚动目标位置
        durTime: 500, //过渡动画时间
        delay: 30, //定时器时间
        callback: null //回调函数
      }

      const opts = $.extend(defaults, options)
      let timer = null
      const $element = opts.element
      let curTop = $element.scrollTop() //滚动条当前的位置
      let subTop = opts.toT - curTop //滚动条目标位置和当前位置的差值
      let index = 0
      let dur = Math.round(opts.durTime / opts.delay)

      const smoothScroll = function(t) {
        index++
        let per = Math.round(subTop / dur)
        if (index >= dur) {
          window.scrollTo(0, t)
          window.clearInterval(timer)
          if (opts.callback && typeof opts.callback == 'function') {
            opts.callback()
          }
          return
        } else {
          window.scrollTo(0, curTop + index * per)
        }
      }

      timer = window.setInterval(function() {
        smoothScroll(opts.toT)
      }, opts.delay)
    },

    // 标题滚动显示函数
    scrollTitle: function() {
      let titleWidth = this.$element.find('.title').width() // 标题最大宽度
      let titleInnerWidth = this.$element.find('.title .inner .text').width() // 标题实际宽度

      if (titleInnerWidth > titleWidth) {
        // 复制标题以实现无缝滚动
        let innerElement = this.$element.find('.title .inner')
        innerElement.append(innerElement.html())
        let textElement = this.$element.find('.title .inner .text')
        let maxLeftValue = textElement.eq(0).width()
        let currentLeftValue = 0

        // 3s后开始向左滑动
        setTimeout(() => {
          this.titleTimer = setInterval(() => {
            currentLeftValue += 1
            textElement.css('left', -currentLeftValue)
            // 当currentLeftValue超过maxLeftValue，重置currentLeftValue为0
            if (currentLeftValue > maxLeftValue) {
              currentLeftValue = 0
            }
          }, 60)
        }, 3000)
      }
    },

    // 修改标题透明度
    changeOpacity: function() {
      const areas = this.options.autoHideNavArea.split(',').filter(item => {
        return $(item).length > 0
      })
      const navHeight = this.$element.height()
      const scrollHeight = $(window).scrollTop()
      let autoHideAreaElement = null // 当前需要透明化导航的元素
      // 判断当前是否处在需要隐藏的dom上
      const isOnArea = areas.some(item => {
        let currentElement = $(item)
        if (currentElement && currentElement.offset()) {
          // 控制当前导航处在元素覆盖范围内
          let isOnInitArea = scrollHeight === 0 && currentElement.offset().top === navHeight
          if (isOnInitArea || (currentElement.offset().top - scrollHeight <= 0 && currentElement.offset().top + currentElement.offset().height > scrollHeight)) {
            autoHideAreaElement = currentElement
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      })
      if (isOnArea) {
        // 去除body的padding-top，让页面在顶部展示
        $('body').css('padding-top', '0 !important')
        // 计算导航高度到元素底部的距离，以此来决定透明度的值，40是偏移值
        let opacity = (autoHideAreaElement.offset().top + autoHideAreaElement.offset().height + 80 - navHeight - scrollHeight) / autoHideAreaElement.offset().height
        opacity = opacity.toFixed(2)
        if (opacity > 1) opacity = 1
        if (opacity < 0) opacity = 0
        this.$element.find('.nav-bg').css('opacity', 1 - opacity)
      } else {
        // 不在自动隐藏区域透明度设置为1
        if (this.$element.find('.nav-bg').css('opacity') !== 1) {
          this.$element.find('.nav-bg').css('opacity', 1)
        }
      }
    },

    // 判断当前是否是IOS系统
    isIos: function() {
      return navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1 || navigator.userAgent.indexOf('Mac') > -1
    }
  }

  /**
   * 缓存同名插件
   */
  let old = $.fn[Plugin.pluginName]

  /**
   * 定义插件，扩展$.fn，为Zepto对象提供新的插件方法
   * 调用方式：$.fn.pluginName()
   * @param option {string/object}
   */
  $.fn[Plugin.pluginName] = function(option) {
    return this.each(function() {
      let $this = $(this)

      let data = $.fn[Plugin.pluginName].pluginData[$this.data(Plugin.dataName)]
      let options = typeof option == 'object' && option

      //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
      if (!data) {
        //zepto的data方法只能保存字符串，所以用此方法解决一下
        $.fn[Plugin.pluginName].pluginData[++$.fn[Plugin.pluginName].pluginData.index] = new Plugin(this, options)
        $this.data(Plugin.dataName, $.fn[Plugin.pluginName].pluginData.index)
        data = $.fn[Plugin.pluginName].pluginData[$this.data(Plugin.dataName)]
      }

      //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
      if (typeof option == 'string') data[option]()
    })
  }

  /**
   * zepto的data方法只能保存字符串，所以用一个对象来存储data
   * @type {{index: number}}
   */
  $.fn[Plugin.pluginName].pluginData = { index: 0 }

  $.fn[Plugin.pluginName].Constructor = Plugin

  /**
   * 为插件增加 noConflict 方法，在插件重名时可以释放控制权
   * @returns {*}
   */
  $.fn[Plugin.pluginName].noConflict = function() {
    $.fn[Plugin.pluginName] = old
    return this
  }

  /**
   * 初始化导航
   * @param {{}}} options
   */
  $.fn[Plugin.pluginName].init = function(options) {
    // 自动插入dom
    $('<div data-role="' + Plugin.pluginName + '">')
      .addClass('navigator')
      .appendTo('body')
    $.fn[Plugin.pluginName].call($('div[data-role="' + Plugin.pluginName + '"]'), options)
  }

  /**
   * 修改导航属性
   */
  $.fn[Plugin.pluginName].changeOptions = function(newOptions) {
    // 确保导航已经被初始化了
    let $element = $('[data-role="' + Plugin.pluginName + '"]')
    if ($element.length > 0) {
      // 遍历新属性
      for (let i in newOptions) {
        switch (i) {
        case 'title':
          $element.find('.title .inner .text').html(newOptions[i])
          break
        case 'clickLeftNavCallback':
          if (typeof newOptions[i] === 'function') {
            $element
              .find('.nav .back')
              .off('click')
              .on('click', function() {
                newOptions[i]()
              })
          }
          break
        default:
          break
        }
      }
    }
  }
})

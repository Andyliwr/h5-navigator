# 同花顺`H5`导航栏插件

README: [English](README_en.md) | [中文](README.md)

插件化导航组件，只需要引入的`navigator.css`和`navigator.js`就能在页面顶部添加一个导航栏，插件实现了导航的自定义，还附加了很多新功能。

[![npm](https://img.shields.io/npm/dw/localeval.svg)](https://github.com/Andyliwr/h5-navigator)

[查看 demo](http://khtest.10jqka.com.cn/dev/lidikang/h5-navigator/index.html)

## 功能

1.  自定义导航按钮、标题以及导航颜色
2.  双击页面标题回滚到顶部
3.  自定导航透明区域

## 用法

- 下载源代码

```
git clone https://github.com/Andyliwr/h5-navigator.git
```

- 在页面中引入`dist/navigator.min.css`和`dist/navigator.min.js`

请注意在引入`zepto`之后引入`dist/navigator.min.js`

- 初始化插件

```
$(document).ready(function () {
  $.fn.H5Navigator.init({
    openDebug: false,
    Title: document.title,
    titleAlign: 'center',
    backgroundColor: '#e83031',
    autoHideNavArea: '.header-img',
    showRightNav: true,
    rightNavIcon: 'share',
    clickLeftNavCallback: null,
    clickRightNavCallback: null,
    isExitWhenNoPageBack: true,
    iosScrollBottomCallback: null
  });
});
```

## 参数说明

- `openDebug`: 是否开启调试模式，默认 `false`
- `title`: 自定义页面标题，默认值是`document.title`
- `titleAlign`: 标题齐方式，默认为`center`
- `backgroundColor`: 导航背景颜色，默认为`#e83031`
- `autoHideNavArea`: 需要自动隐藏导航的区域的选择器，导航在滑过该区域的时候透明度会从 0 逐渐变到 1
- `showRightNav`: 是否展示导航右边的按钮，默认为`false`
- `rightNavIcon`: 导航右边的按钮`iconfont`图标名称
- `clickLeftNavCallback`: 点击导航左边按钮的回调, 默认为`null`，为空则会执行默认函数`history.back()`
- `clickRightNavCallback`: 点击导航右边按钮的回调
- `isExitWhenNoPageBack`: 当页面已经返回到顶部(history.length = 1)时，是否退出全屏 webview
- `iosScrollBottomCallback`: 滑动到底部回调函数，IOS 使用原来的底部统计不生效，需要自定义

## 自定义方法

- `$.fn.H5Navigator.changeOptions`修改当前导航的属性

  使用方法如下

```
$.fn.H5Navigator.changeOptions({
  title: 'xxx', // 导航标题
  clickLeftNavCallback: () => {} // 导航左边按钮的点击事件
})
```

## 更新历史

### 2018/09/04

1. 修改导航图标以及字体的大小，与原生导航保持一致
2. 修复移动端双击导航标题未能返回顶部的 bug
3. 修复 IOS 下滑动的时候导航透明度修改不及时的 bug
4. 修复 IOS 键盘弹出时导航拦 fixed 定位失效的 bug
5. 修复 IOS 下返回页面顶层(history.length 等于 1)的时候继续点击返回无反应的 bug

PS: 导航栏在 ios 下加入了 iscoll 插件，强制将 body 的宽度设置成了 100%，所以原来的底部统计方法不能使用了，请使用插件新增的 `iosScrollBottomCallback` 回调函数

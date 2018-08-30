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
    clickRightNavCallback: null
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

## `H5` navigation bar plugin

README: [English](README_en.md) | [Chinese](README.md)

Plug-in navigation components, you only need to introduce the `navigator.css` and `navigator.js` to add a navigation bar at the top of the page. The plug-in implements navigation customization and adds a lot of new features.

[![npm](https://img.shields.io/npm/dw/localeval.svg)](https://github.com/Andyliwr/h5-navigator)

[View demo](http://khtest.10jqka.com.cn/dev/lidikang/h5-navigator/index.html)

## Features

1.  Customize navigation buttons, titles, and navigation colors
2.  Double-click the page title to roll back to the top
3.  Custom navigation transparent area

## usage

- Download source code

```
Git clone https://github.com/Andyliwr/h5-navigator.git
```

- Introduce `dist/navigator.min.css` and `dist/navigator.min.js` on the page.

Please note that `dist/navigator.min.js` is introduced after the introduction of `zepto`.

- Initialize the plugin

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

## Parameter Description

- `openDebug`: Whether to enable debug mode, default `false`
- `title`: custom page title, the default value is `document.title`
- `titleAlign`: The title is in the same way, the default is `center`
- `backgroundColor`: Navigating the background color, the default is `#e83031`
- `autoHideNavArea`: A selector that needs to automatically hide the area of ​​the navigation. The transparency will change from 0 to 1 as the navigation slides over the area.
- `showRightNav`: Whether to display the button to the right of the navigation, the default is `false`
- `rightNavIcon`: navigate to the right button `iconfont` icon name
- `clickLeftNavCallback`: Click the callback of the left button of the navigation. The default is `null`. If it is empty, the default function `history.back() will be executed.
- `clickRightNavCallback`: Click the callback of the button on the right of the navigation
- `isExitWhenNoPageBack`: Whether to exit full screen webview when the page has returned to the top (history.length = 1)
- `iosScrollBottomCallback`: Swipe to the bottom callback function, IOS uses the original bottom statistics does not take effect, you need to customize

## Custom Method

- `$.fn.H5Navigator.changeOptions` to modify the properties of the current navigation

  How to use

```
$.fn.H5Navigator.changeOptions({
   Title: 'xxx', // navigation title
   clickLeftNavCallback: () => {} // Navigating the click event of the left button
})
```

## Update history

### 2018/09/04

1. Modify the navigation icon and the size of the font to be consistent with the native navigation
2. Fix the bug where the mobile side double-clicks the navigation title and fails to return to the top.
3. Fix the bug that the navigation transparency is not timely changed when sliding under IOS
4. Fix the bug that the navigation bar fixed positioning is invalid when the IOS keyboard pops up.
5. Fix IOS to return to the top of the page (history.length is equal to 1) continue to click to return to the unresponsive bug

PS: The navigation bar has been added the iscoll plugin under ios, forcing the width of the body to be 100%, so the original bottom statistics method can not be used, please use the new plugin `iosScrollBottomCallback` callback function

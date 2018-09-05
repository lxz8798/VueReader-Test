/**
 * introduce : 适配方案 通过设置rem来算
 * author    : yhy
 * date      : 2018/07/01
 */
;(function () {
  function setFontSize () {
    var winWidth = document.documentElement.clientWidth
    document.documentElement.style.fontSize = (winWidth / 750) * 100 + 'px'
  }
  var evt = 'onorientationchange' in window ? 'orientationchange' : 'resize'
  var timer = null
  window.addEventListener(
    evt,
    function () {
      clearTimeout(timer)
      timer = setTimeout(setFontSize, 300)
    },
    false
  )
  window.addEventListener(
    'pageshow',
    function (event) {
      if (event.persisted) {
        clearTimeout(timer)
        timer = setTimeout(setFontSize, 300)
      }
    },
    false
  )
  // 初始化
  setFontSize()
})()

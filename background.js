chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("main.html", {
    id: "main",
    innerBounds: {
      width: 542,
      height: 360
    },
    // resizeable: false, // 加入此设置报错
    frame: "none"
  });
});

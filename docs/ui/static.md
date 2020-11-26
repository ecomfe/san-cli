# 公共静态文件

若需要在 cli-ui内建的http服务器上暴露一些静态文件，例如：为自定义视图指定图标。可以通过在插件包根目录里可选的放置一个`public`文件夹，这个文件夹里的任何文件都会暴露至 /_plugin/:id/* 的http路由。

例如，如果将 x-logo.png 文件放置到 san-cli-ui-widget-x/public/ 文件夹，那么 cli-ui 加载插件的时候可以通过 /_plugin/san-cli-ui-widget-x/x-logo.png 这个url来访问。
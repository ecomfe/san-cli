const {defineComponent} = require('san')

module.exports = defineComponent({
    // components: {content: content},
    template: /*html*/ `
        <div id="site">
            <header id="header">
                <a href="{{config.rootUrl}}" class="logo">{{config.siteName}}</a>
                {{navbar | raw}}
            </header>
            <aside id="sidebar">
                {{sidebar | raw}}
            </aside>
            <article id="content">
                {{content | raw}}
                <aside class="toc">{{toc.html | raw}}</aside>
            </article>
        </div>`
});

import './styles/index.less';
import {Component} from 'san';

import Content from './components/Content';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import routers from '~routers';
import content from '~content';
import frontMatter from '~frontmatter';


class Index extends Component {
    static template = /*html*/ `
        <div class="site">
            <doc-header class="site-navbar"/>
            <div class="site-body">
                <site
                    class="${prefixCls}-navigator"
                    style="top: {{navigatorFixedTop}}px;"
                    routes="{{routes}}"
                    current-path="{{currentPath}}"
                    on-redirect="handleRedirect"
                />
                <doc-content
                    class="${prefixCls}-content"
                    style="{{contentStyle}}"
                    content="{{content}}"
                />
                <doc-simulator
                    s-ref="simulator"
                    class="{{simulatorClass}}"
                    style="{{simulatorStyle}}"
                    src="{{simulatorSrc}}"
                    width="{=simulatorWidth=}"
                />
            </div>
        </div>
    `;

    static components = {
        Sidebar,
        Navbar,
        Content
    };
}

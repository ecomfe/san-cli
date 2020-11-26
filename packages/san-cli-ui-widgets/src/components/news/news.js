/**
 * @file 新闻组件
 * @author zttonly, Lohoyo
 */

import './news.less';

export default {
    template: /* html */`
        <div class="dashboard-widget-news">
            <div s-if="loading" class="widget-loading">
                <s-spin spinning="{=loading=}">
                    <s-icon slot="indicator" type="loading" style="font-size: 24px;" />
                </s-spin>
            </div>
            <div s-elif="error" class="error">
                <s-icon type="{{errIcons[error]}}"/>
                <div>{{$t('dashboard.widgets.news.errors.' + error)}}</div>
            </div>
            <fragment s-else>
                <nav>
                    <article
                        s-for="item in feed.items"
                        class="news-item {{selectedItem === item ? 'news-item-selected' : ''}}"
                        on-click="handleClick(item)">
                        <div>
                            <div class="title" title={{item.title}}>{{item.title}}</div>
                            <div class="snippet">{{item.contentSnippet}}</div>
                            <span class="date">{{item.pubDate | dateFormat}}</span>
                            <a href="{{item.link}}" target="_blank" rel="noopener noreferrer">
                                {{$t('dashboard.widgets.news.origin')}}
                            </a>
                        </div>
                    </article>
                </nav>
                <main s-html="selectedItem['content:encoded'] || selectedItem.content"></main>
                <div s-if="selectedItem.enclosure" class="media">
                    <img s-if="isImg" src="{{selectedItem.enclosure.url}}"/>
                    <audio s-if="isAudio" src="{{selectedItem.enclosure.url}}" controls></audio>
                    <video s-if="isVideo" src="{{selectedItem.enclosure.url}}" controls></video>
                </div>
            </fragment>
        </div>
    `,
    computed: {
        isImg() {
            const selectedItem = this.data.get('selectedItem');
            return selectedItem
                && selectedItem.enclosure
                && selectedItem.enclosure.type.indexOf('image/') === 0;
        },
        isAudio() {
            const selectedItem = this.data.get('selectedItem');
            return selectedItem
                && selectedItem.enclosure
                && selectedItem.enclosure.type.indexOf('audio/') === 0;
        },
        isVideo() {
            const selectedItem = this.data.get('selectedItem');
            return selectedItem
                && selectedItem.enclosure
                && selectedItem.enclosure.type.indexOf('video/') === 0;
        }
    },
    filters: {
        dateFormat(d) {
            return new Date(d).toLocaleString();
        }
    },
    initData() {
        return {
            loading: false,
            feed: null,
            error: null,
            selectedItem: null,
            errIcons: {
                fetch: 'close',
                offline: 'disconnect',
                empty: 'frown'
            }
        };
    },
    created() {
        this.addAction();
    },
    attached() {
        const url = this.data.get('data.config.url');
        if (url) {
            this.fetchFeed();
            this.currentUrl = url;
        }
        this.watch('data.config.url', value => {
            const url = this.data.get('data.config.url');
            // 有时data.config.url明明没有变化，却监听到了变化，所以这里做了下判断，判断到底有没有变化
            if (url === this.currentUrl) {
                return;
            }
            value && this.fetchFeed();
            this.currentUrl = url;
        });
        this.watch('loading', value => {
            !value && this.addAction();
        });
    },
    addAction() {
        this.dispatch('Widget:addHeaderAction', {
            id: 'reload',
            icon: 'reload',
            disabled: this.data.get('loading'),
            onCalled: () => this.fetchFeed(true),
            tooltip: this.$t('dashboard.widgets.news.actionTooltip.reload')
        });
    },
    async fetchFeed(force = false) {
        this.data.set('selectedItem', null);

        if (!navigator.onLine) {
            this.data.set('loading', false);
            this.data.set('error', 'offline');
            return;
        }

        this.data.set('loading', true);
        this.data.set('error', false);
        this.dispatch('Widget:title', null);
        try {
            const {results, errors} = await this.$callPluginAction('san.widgets.actions.fetch-news', {
                url: this.data.get('data.config.url'),
                force
            });
            if (errors.length && errors[0]) {
                throw new Error(errors[0]);
            }
            let feed = results[0];
            if (feed && feed.items && feed.items.length) {
                feed.items.forEach(item => this.imgSrcReplace(item));
                this.data.set('feed', feed);
                this.data.set('selectedItem', feed.items[0]);
                this.dispatch('Widget:title', feed.title);
            }
            else {
                this.data.set('error', 'empty');
            }
        }
        catch (e) {
            this.data.set('error', 'fetch');
            // eslint-disable-next-line no-console
            console.error(e);
        }
        this.data.set('loading', false);
    },
    handleClick(value) {
        this.data.set('selectedItem', value);
    },
    imgSrcReplace(item) {
        let match = item.link.match(/^http(s)?:\/\/(.*?)\//);
        let domain = match ? match[0] : '';
        item.content = item.content.replace(/src=\"\/([^"]*\")/g, (m, s1) => 'src="' + domain + s1);
    }
};

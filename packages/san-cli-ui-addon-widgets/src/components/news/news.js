/**
 * @file 新闻组件
 * @author zttonly
 */

import './news.less';

export default {
    template: /* html */`
        <div class="news small {{selectedItem ? 'has-item-selected' : ''}}">
            <div s-if="loading" class="widget-loading">
                <s-spin spinning="{=loading=}">
                    <s-icon slot="indicator" type="loading" style="font-size: 24px;" />
                </s-spin>
            </div>
            <div s-elif="error" class="error">
                <s-icon type="{{errIcons[error]}}" class="huge"/>
                <div>{{$t('dashboard.widgets.news.errors.' + error)}}</div>
            </div>
            <div s-else class="panes">
                <div class="feed">
                    <div s-for="item in feed.items"
                        class="news-item {{ selectedItem === item ? 'selected' : ''}}"
                        on-click="handleClick(item)"
                    >
                        <div class="title">
                            <a href="{{item.link}}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                            {{item.title}}<s-icon type="link"/>
                            </a>
                        </div>
                        <div class="snippet">{{item.contentSnippet | snippet}}</div>
                        <div class="date">{{item.pubDate | dateFormat}}</div>
                    </div>
                </div>

                <div s-if="selectedItem" class="item-details" >
                    <div class="back">
                        <s-button
                            type="primary"
                            ghost="{{true}}"
                            icon="arrow-left"
                            on-click="handleClick(null)"
                        >{{$t('common.back')}}</s-button>
                    </div>
                    <div  s-if="selectedItem" class="news-item-details">
                        <div class="head">
                            <div class="title">
                                <a href="{{selectedItem.link}}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >{{selectedItem.title}}</a>
                            </div>
                            <div class="date">{{selectedItem.pubDate | dateFormat}}</div>
                        </div>

                        <div class="content"
                            s-html="selectedItem['content:encoded'] || selectedItem.content"
                        ></div>

                        <div s-if="selectedItem.enclosure" class="media" >
                            <img
                                s-if="isImg"
                                src="{{selectedItem.enclosure.url}}"
                                class="image media-content"
                            />

                            <audio
                                s-if="isAudio"
                                src="{{selectedItem.enclosure.url}}"
                                controls
                            ></audio>

                            <video
                                s-if="isVideo"
                                src="{{selectedItem.enclosure.url}}"
                                controls
                            ></video>
                        </div>
                    </div>
                </div>
            </div>
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
        },
        snippet(text) {
            if (text.length > 200) {
                return text.substr(0, 197) + '...';
            }
            return text;
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
        if (this.data.get('data.config.url')) {
            this.fetchFeed();
        }
        this.watch('data.config.url', value => {
            value && this.fetchFeed();
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
            onCalled: () => this.fetchFeed(true)
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

/**
 * @file gen-qrcode schema相关函数
 * @author zttonly
 */

export const frameTypes = [
    {
        text: '普通url',
        value: 'url'
    }, {
        text: '轻框架',
        value: 'easybrowse'
    }, {
        text: '搜索浏览框架',
        value: 'search'
    }, {
        text: '沉浸式框架',
        value: 'immerse'
    }
];

export const box = [
    {
        text: '百度APP',
        value: 'boxapp',
        // logargs调起参数source=来源渠道 from=端外调起 page=事件发生位置 type=调起位置 value=调起功能 channel依情况决定
        // slog时长参数
        easybrowse: (url, slog = '') => {
            let log = slog ? '&slog=' + encodeURIComponent(JSON.stringify(slog)) : '';
            return 'baiduboxapp://v1/easybrowse/open?url=' + encodeURIComponent(url)
                + '&newbrowser=1&style='
                + encodeURIComponent('{"menumode":2,"toolbaricons":{"toolids":["3"],"tids":["3"]}}')
                + log;
        },
        search: (url, isSearch) => {
            return isSearch
                ? 'baiduboxapp://v1/browser/search?query=' + encodeURIComponent(url)
                : 'baiduboxapp://v1/browser/open?url=' + encodeURIComponent(url) + '&newbrowser=1';
        },
        immerse: url => {
            return [
                {
                    text: 'android',
                    qr: 'baiduboxapp://v1/easybrowse/open?url=' + encodeURIComponent(url) + '&type=immerse'
                },
                {
                    text: 'ios',
                    qr: 'baiduboxapp://v1/immerseBrowser/open?url=' + encodeURIComponent(url) + '&newbrowser=1&forbidautorotate=1'
                }
            ];
        }
    }, {
        text: '百度极速版',
        value: 'boxlite',
        easybrowse: url => {
            return 'baiduboxlite://v1/easybrowse/open?url=' + encodeURIComponent(url) + '&newbrowser=1';
        }
    }, {
        text: '好看视频',
        value: 'haokan',
        easybrowse: url => {
            return 'baiduhaokan://webview?url_key=' + encodeURIComponent(url);
        }
    }, {
        text: '全民小视频',
        value: 'minivideo',
        easybrowse: url => {
            return 'bdminivideo://webview?params=' + encodeURIComponent(JSON.stringify({
                'url_key': url
            }));
        },
        immerse: url => {
            return 'bdminivideo://webview?url_key=' + encodeURIComponent(url)
                + '&style=' + encodeURIComponent(JSON.stringify({fullscreen: 1, titlebar: 0}));
        }
    }, {
        text: '贴吧',
        value: 'tieba',
        easybrowse: url => {
            return 'com.baidu.tieba://unidispatch/tbwebview?url=' + encodeURIComponent(url);
        }
    }, {
        text: '爱奇艺',
        value: 'iqiyi',
        easybrowse: url => {
            return 'iqiyi://mobile/register_business/qyclient?pluginParams=' + encodeURIComponent(JSON.stringify({
                'biz_plugin': '',
                'biz_id': 100,
                'biz_params': encodeURIComponent(JSON.stringify({
                    'biz_sub_id': 202,
                    'biz_params': 'url=' + encodeURIComponent(url),
                    'biz_dynamic_params': ''
                }))
            }));
        }
    }, {
        text: '百度网盘',
        value: 'netdisk',
        easybrowse: url => {
            return 'bdnetdisk://n/action.EXTERNAL_ACTIVITY?m_n_v=10.0.20&type=invitation&url=' + encodeURIComponent(url);
        }
    }, {
        text: '百度地图',
        value: 'baidumap',
        easybrowse: url => {
            return 'baidumap://map/cost_share?url=' + encodeURIComponent(url) + '&hideshare=0&needLocation=1';
        }
    }, {
        text: '有驾',
        value: 'youjia',
        easybrowse: url => {
            return 'youjia://app/web?url=' + encodeURIComponent(url);
        }
    }
];

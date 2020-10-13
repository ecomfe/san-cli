const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const cwd = require('./cwd');
const channels = require('../utils/channels');
const plugins = require('./plugins');

const debug = getDebugLogger('ui:views');

const createViewsSet = () => {
    return [{
        id: 'nav.dashboard',
        // icon: 'dashboard',
        name: 'dashboard'
    },
    {
        id: 'nav.plugins',
        name: 'plugins'
    },
    {
        id: 'nav.dependency',
        name: 'dependency'
    },
    {
        id: 'nav.configuration',
        name: 'configuration'
    },
    {
        id: 'nav.task',
        name: 'task'
    }];
};

class Views {
    constructor() {
        this.viewsMap = new Map();
    }

    getViews() {
        const file = cwd.get();
        let list = this.viewsMap.get(file);
        if (!list) {
            list = createViewsSet();
            this.viewsMap.set(file, list);
        }
        return list;
    }

    findOne(id) {
        const views = this.getViews();
        return views.find(view => view.id === id);
    }

    async add(view, context) {
        this.remove(view.id, context);
        const views = this.getViews();
        views.push(view);
        context.pubsub.publish(channels.VIEW_ADDED, {
            viewAdded: view
        });
        debug('View added', view.id);
    }

    remove(id, context) {
        const views = this.getViews();
        const index = views.findIndex(view => view.id === id);
        if (index !== -1) {
            const view = views[index];
            views.splice(index, 1);
            context.pubsub.publish(channels.VIEW_REMOVED, {
                viewRemoved: view
            });
        }
    }

    update(view, context) {
        const existingView = this.findOne(view.id);
        if (existingView) {
            Object.assign(existingView, view);
            context.pubsub.publish(channels.VIEW_CHANGED, {
                viewChanged: existingView
            });
        }
    }

    open(id, context) {
        const view = this.findOne(id);
        this.currentView = view;
        const plugins = require('./plugins');
        plugins.callHook({
            id: 'viewOpen',
            args: [{
                view,
                cwd: cwd.get()
            }],
            file: cwd.get()
        }, context);
        return true;
    }

    getCurrent() {
        return this.currentView;
    }
};

module.exports = new Views();

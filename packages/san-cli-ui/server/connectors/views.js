const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const cwd = require('./cwd');
const channels = require('../utils/channels');
const plugins = require('./plugins');

const debug = getDebugLogger('ui:views');

const createViewsSet = () => {
    return [{
        id: 'dashboard',
        // icon: 'dashboard',
        name: 'dashboard'
    },
    {
        id: 'plugins',
        name: 'plugins'
    },
    {
        id: 'dependency',
        name: 'dependency'
    },
    {
        id: 'configuration',
        name: 'configuration'
    },
    {
        id: 'task',
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
        debug('get views', list);
        return list;
    }

    findOne(id) {
        const views = this.getViews();
        return views.find(view => view.id === id);
    }

    findByPkgName(pkgName) {
        const views = this.getViews();
        return views.filter(view => view.pkgName === pkgName);
    }

    async add({view, project}, context) {
        debug('add', view);
        this.remove(view.id, context);
        const views = this.getViews();
        views.push(view);
        context.pubsub.publish(channels.VIEW_ADDED, {
            viewAdded: view
        });
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
        debug('Open View:', view);
        this.currentView = view;
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

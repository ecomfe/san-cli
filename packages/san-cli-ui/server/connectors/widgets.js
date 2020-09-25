/**
 * @file 部件相关的resolver
 * @author zttonly
*/

const shortid = require('shortid');
const cwd = require('./cwd');
const prompts = require('./prompts');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const debug = getDebugLogger('ui:widget');

const getDefaultWidgets = () => (
    [
        {
            id: shortid(),
            definitionId: 'san.widgets.welcome',
            x: 0,
            y: 0,
            width: 3,
            height: 4,
            configured: true,
            config: null
        },
        {
            id: shortid(),
            definitionId: 'san.widgets.kill-port',
            x: 3,
            y: 0,
            width: 2,
            height: 1,
            configured: true,
            config: null
        }
    ]
);

class Widgets {
    constructor() {
        this.reset();
    }
    reset() {
        this.widgetDefs = new Map();
        this.widgetCount = new Map();
        this.widgets = [];
        this.loadPromise = new Promise(resolve => {
            this.loadResolve = () => {
                this.loadPromise = null;
                resolve();
                debug('Load Promise resolved');
            };
        });
    }
    async registerDefinition({definition, project}, context) {
        definition.hasConfigPrompts = !!definition.onConfigOpen;

        // Default icon
        if (!definition.icon) {
            const plugins = require('./plugins');
            const plugin = plugins.findOne({id: definition.pluginId, file: cwd.get()}, context);
            const logo = await plugins.getLogo(plugin, context);
            if (logo) {
                definition.icon = `${logo}?project=${project.id}`;
            }
        }

        this.widgetDefs.set(definition.id, definition);
    }
    listDefinitions() {
        return this.widgetDefs.values();
    }
    findDefinition({definitionId}) {
        const def = this.widgetDefs.get(definitionId);
        debug(`
            definitionId: ${definitionId}, 
            def: ${def},
            this.widgetDefs: ${JSON.stringify(this.widgetDefs)}
        `);
        if (!def) {
            throw new Error(`Widget definition ${definitionId} not found`);
        }
        return def;
    }
    async list() {
        debug('loadPromise', this.loadPromise);
        if (this.loadPromise) {
            await this.loadPromise;
        }
        debug('widgets', this.widgets);
        return this.widgets;
    }
    load(context) {
        const projects = require('./projects');
        const id = projects.getCurrent(context).id;
        const project = context.db.get('projects').find({id}).value();
        this.widgets = project.widgets;

        if (!this.widgets) {
            this.widgets = getDefaultWidgets();
        }

        this.widgets.forEach(widget => {
            // 防止多次重复加载的问题
            !this.widgetCount.has(widget.definitionId) && this.updateCount(widget.definitionId, 1);
        });

        debug('Widgets loaded', this.widgets.length);

        this.loadResolve();
    }
    save(context) {
        const projects = require('./projects');
        const id = projects.getCurrent(context).id;
        context.db.get('projects').find({id}).assign({
            widgets: this.widgets
        }).write();
    }
    canAddMore(definition, context) {
        if (definition.maxCount) {
            return this.getCount(definition.id) < definition.maxCount;
        }
        return true;
    }
    add({definitionId}, context) {
        const definition = this.findDefinition({definitionId}, context);

        const {x, y, width, height} = this.findValidPosition(definition);

        const widget = {
            id: shortid(),
            definitionId,
            x,
            y,
            width,
            height,
            config: null,
            configured: !definition.needsUserConfig
        };

        // Default config
        if (definition.defaultConfig) {
            widget.config = definition.defaultConfig({
                definition
            });
        }

        this.updateCount(definitionId, 1);
        this.widgets.push(widget);
        this.save(context);

        if (definition.onAdded) {
            definition.onAdded({widget, definition});
        }

        return widget;
    }
    getCount(definitionId) {
        if (this.widgetCount.has(definitionId)) {
            return this.widgetCount.get(definitionId);
        }
        return 0;
    }
    updateCount(definitionId, mod) {
        this.widgetCount.set(definitionId, this.getCount(definitionId) + mod);
    }
    findValidPosition(definition, currentWidget = null) {
        // Find next available space
        const width = (currentWidget && currentWidget.width) || definition.defaultWidth || definition.minWidth;
        const height = (currentWidget && currentWidget.height) || definition.defaultHeight || definition.minHeight;
        // Mark occupied positions on the grid
        const grid = new Map();
        for (const widget of this.widgets) {
            if (widget !== currentWidget) {
                for (let x = widget.x; x < widget.x + widget.width; x++) {
                    for (let y = widget.y; y < widget.y + widget.height; y++) {
                        grid.set(`${x}:${y}`, true);
                    }
                }
            }
        }
        // Go through the possible positions
        let x = 0;
        let y = 0;
        while (true) {
            // Virtual "line brak"
            if (x !== 0 && x + width >= 7) {
                x = 0;
                y++;
            }
            const {result, testX} = this.hasEnoughSpace(grid, x, y, width, height);
            if (!result) {
                x = testX + 1;
                continue;
            }
            // Found! :)
            break;
        }

        return {
            x,
            y,
            width,
            height
        };
    }
    hasEnoughSpace(grid, x, y, width, height) {
        // Test if enough horizontal available space
        for (let testX = x; testX < x + width; testX++) {
            // Test if enough vertical available space
            for (let testY = y; testY < y + height; testY++) {
                if (grid.get(`${testX}:${testY}`)) {
                    return {result: false, testX};
                }
            }
        }
        return {result: true};
    }
    findById({id}, context) {
        return this.widgets.find(w => w.id === id);
    }
    remove({id}, context) {
        const index = this.widgets.findIndex(w => w.id === id);
        if (index !== -1) {
            const widget = this.widgets[index];
            this.updateCount(widget.definitionId, -1);
            this.widgets.splice(index, 1);
            this.save(context);

            const definition = this.findDefinition(widget, context);
            if (definition.onAdded) {
                definition.onAdded({widget, definition});
            }

            return widget;
        }
    }
    move(input, context) {
        const widget = this.findById(input, context);
        if (widget) {
            widget.x = input.x;
            widget.y = input.y;
            const definition = this.findDefinition(widget, context);
            widget.width = input.width;
            widget.height = input.height;
            if (widget.width < definition.minWidth) {
                widget.width = definition.minWidth;
            }
            if (widget.width > definition.maxWidth) {
                widget.width = definition.maxWidth;
            }
            if (widget.height < definition.minHeight) {
                widget.height = definition.minHeight;
            }
            if (widget.height > definition.maxHeight) {
                widget.height = definition.maxHeight;
            }

            for (const otherWidget of this.widgets) {
                if (otherWidget !== widget) {
                    if (this.areOverlapping(otherWidget, widget)) {
                        const otherDefinition = this.findDefinition(otherWidget, context);
                        Object.assign(otherWidget, this.findValidPosition(otherDefinition, otherWidget));
                    }
                }
            }

            this.save(context);
        }
        return this.widgets;
    }
    areOverlapping(widgetA, widgetB) {
        return (
            widgetA.x + widgetA.width - 1 >= widgetB.x
            && widgetA.x <= widgetB.x + widgetB.width - 1
            && widgetA.y + widgetA.height - 1 >= widgetB.y
            && widgetA.y <= widgetB.y + widgetB.height - 1
        );
    }

    async openConfig({id}, context) {
        const widget = this.findById({id}, context);
        const definition = this.findDefinition(widget, context);
        if (definition.onConfigOpen) {
            const result = await definition.onConfigOpen({
                widget,
                definition,
                context
            });
            await prompts.reset(widget.config || {});
            result.prompts.forEach(item => prompts.add(item));
            await prompts.start();
            this.currentWidget = widget;
        }
        return widget;
    }

    getConfigPrompts({id}, context) {
        return this.currentWidget && this.currentWidget.id === id
            ? prompts.list() : [];
    }

    saveConfig({id}, context) {
        const widget = this.findById({id}, context);
        widget.config = prompts.getAnswers();
        widget.configured = true;
        this.save(context);
        this.currentWidget = null;
        return widget;
    }

    resetConfig({id}, context) {
    }
}

module.exports = new Widgets();

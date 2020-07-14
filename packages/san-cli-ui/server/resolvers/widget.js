/**
 * @file 部件相关的resolver
 * @author zttonly
*/

const cwd = require('../connectors/cwd');
const widgets = require('../connectors/widgets');

module.exports = {
    WidgetDefinition: {
        canAddMore: (definition, args, context) => widgets.canAddMore(definition, context),
        count: (definition, args, context) => widgets.getCount(definition.id)
    },

    Widget: {
        definition: (widget, args, context) => widgets.findDefinition(widget, context),
        prompts: (widget, args, context) => widgets.getConfigPrompts(widget, context)
    },

    Query: {
        widgetDefinitions: (root, args, context) => widgets.listDefinitions(context),
        widgets: (root, args, context) => widgets.list(context)
    },

    Mutation: {
        widgetAdd: (root, {input}, context) => widgets.add(input, context),
        widgetRemove: (root, {id}, context) => widgets.remove({id}, context),
        widgetMove: (root, {input}, context) => widgets.move(input, context),
        widgetConfigOpen: (root, {id}, context) => widgets.openConfig({id}, context),
        widgetConfigSave: (root, {id}, context) => widgets.saveConfig({id}, context),
        widgetConfigReset: (root, {id}, context) => widgets.resetConfig({id}, context)
    }
};

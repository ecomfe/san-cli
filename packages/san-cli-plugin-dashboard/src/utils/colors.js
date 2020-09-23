let colors = {
    '__file__': '#db7100',
    'node_modules': '#599e59',
    '__default__': '#487ea4'
};


export function getColor(obj) {
    let name = obj.name;
    let dotIndex = name.indexOf('.');
    if (dotIndex !== -1 && dotIndex !== 0 && dotIndex !== name.length - 1) {
        return colors.__file__;
    }
    else if (obj.parent && obj.parent.name === 'node_modules') {
        return colors.node_modules;
    }
    return colors[name] || colors.__default__;
}

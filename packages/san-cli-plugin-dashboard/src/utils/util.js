export function getAssetsData(assets, chunks) {
    let chunksMap = {};
    chunks.forEach(chunk => {
        chunksMap[chunk.id] = chunk;
    });

    return assets
        .filter(asset => asset.name.indexOf('.js') === asset.name.length - 3)
        .map(asset => {
            const chunkIndex = asset.chunks[0];
            return {
                ...asset,
                chunk: chunksMap[chunkIndex]
            };
        });
};

export function getBundleDetails({assets, selectedAssetIndex}) {
    if (selectedAssetIndex === 0) {
        return assets.length === 1 ? {
            type: 'normal',
            assetName: assets[0].name,
            actual: assets[0].size,
            raw: assets.reduce((total, thisAsset) => total + thisAsset.chunk.size, 0)
        } : {
            type: 'collection',
            assetName: 'All Modules',
            actual: '',
            raw: ''
        };
    }

    const asset = assets[selectedAssetIndex - 1];
    return {
        type: 'normal',
        assetName: asset.name,
        actual: asset.size,
        raw: asset.chunk.size
    };
};

export function getAncestors(node) {
    let ancestors = [];
    let current = node;
    while (current.parent) {
        ancestors.unshift(current);
        current = current.parent;
    }
    return ancestors;
};

export function getAllChildren(rootNode) {
    let allChildren = [];
    let getChildren = node => {
        allChildren.push(node);

        if (node.children) {
            node.children.forEach(child => {
                getChildren(child);
            });
        }
    };
    getChildren(rootNode);
    return allChildren;
};

export function markDuplicates(nodes) {
    let fullNameList = {};
    nodes.forEach(item => {
        if (!item.fullName) {
            return;
        }
        let lastIndex = item.fullName.lastIndexOf('~');
        if (lastIndex !== -1) {
            let fullName = item.fullName.substring(lastIndex);
            if (fullName in fullNameList) {
                item.duplicate = true;
                fullNameList[fullName].duplicate = true;
            }
            else {
                fullNameList[fullName] = item;
            }
        }
    });
};

export function formatSize(size, precision = 1) {
    const kb = {
        label: 'k',
        value: 1024
    };
    const mb = {
        label: 'M',
        value: 1024 * 1024
    };

    const rate = 0.92;

    let denominator;

    if (size >= mb.value) {
        denominator = mb;
    }
    else {
        denominator = kb;
        if (size < (kb.value * rate) && precision === 0) {
            precision = 1;
        }
    }
    return (size / denominator.value).toFixed(precision) + denominator.label;
};

export function bytes2kb(size) {
    return size ? (size / 1024).toFixed(3) + ' kb' : '...';
};

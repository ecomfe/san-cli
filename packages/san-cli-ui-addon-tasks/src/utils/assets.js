import speedsData from './speeds';

const DOWNLOAD_TIME_THRESHOLD_SECONDS = 5;
const BIG_FILE_SIZE = 250000;

export function getSpeedData(datapoint, size) {
    const assetsSizeInMB = size / 1024 / 1024;
    const bandwidthInMbps = datapoint.mbps;
    const bandwidthInMBps = bandwidthInMbps / 8;
    const rttInSeconds = datapoint.rtt / 1000;

    const totalDownloadTime = (assetsSizeInMB / bandwidthInMBps + rttInSeconds).toFixed(3) + ' s';

    const isDownloadTimeOverThreshold = totalDownloadTime > DOWNLOAD_TIME_THRESHOLD_SECONDS;
    const timeDifferenceToThreshold = (isDownloadTimeOverThreshold ? '+' : '-')
        + Math.abs(totalDownloadTime - DOWNLOAD_TIME_THRESHOLD_SECONDS).toFixed(2)
        + 's';

    return {
        totalDownloadTime,
        isDownloadTimeOverThreshold,
        timeDifferenceToThreshold
    };
}

export function getSpeeds(size) {
    return Object.keys(speedsData).reduce((obj, key) => {
        obj[key] = {
            ...getSpeedData(speedsData[key], size),
            ...speedsData[key]
        };
        return obj;
    }, {});
}

export function buildSortedAssets(assets, sizeField) {
    let list = assets.slice();
    if (list.length) {
        const max = list[0].size;
        list = list.map(asset => {
            const size = asset.size[sizeField];
            return {
                name: asset.name,
                size,
                big: size > BIG_FILE_SIZE,
                ratio: size / max,
                secondary: /\.map$/.test(asset.name),
                speeds: getSpeeds(size)
            };
        });
        list.sort((a, b) => {
            if (a.secondary === b.secondary) {
                return b.size - a.size;
            }
            return (a.secondary && !b.secondary) ? 1 : -1;
        });
    }

    return list;
}

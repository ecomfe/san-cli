const path = require('path');
exports.getReportFileName = function getReportFileName(optFilename, prefixer = '', defaultFilename = 'report.html') {
    let reportFileName = defaultFilename;
    let defaultExtName = path.extname(defaultFilename);

    if (typeof optFilename === 'string' && optFilename.length > 0) {
        // 只支持json html htm
        if (/\.(html?|json)$/.test(optFilename)) {
            reportFileName = optFilename;
        } else {
            reportFileName = optFilename + defaultExtName;
        }
    }
    if (prefixer.length > 0) {
        const baseName = path.basename(reportFileName);
        const dirName = path.dirname(reportFileName);

        reportFileName = `${dirName}/${prefixer}${baseName}`;
    }
    return reportFileName;
};

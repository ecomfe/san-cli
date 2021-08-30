const path = require('path');
// 将 env 中的值进行赋值
exports.defineVar = (projectOptions, raw) => {
    const vars = {
        // TODO 这里要不要按照 mode 设置下 undefined 的情况？
        NODE_ENV: process.env.NODE_ENV,
        PRODUCTION: process.env.NODE_ENV === 'production',
        BASE_URL: projectOptions.publicPath
    };
    // 这里把var 变量名拆出来
    const re = /^SAN_VAR_([\w\d\_]+)$/;
    Object.keys(process.env).forEach(key => {
        if (re.test(key)) {
            const name = re.exec(key)[1];
            vars[name] = process.env[key];
        }
    });
    if (raw) {
        return vars;
    }

    for (const [key, value] of Object.entries(vars)) {
        vars[key] = JSON.stringify(value);
    }
    return vars;
};
exports.ensureRelative = (outputDir, p) => {
    if (path.isAbsolute(p)) {
        return path.relative(outputDir, p);
    }
    return p;
};

exports.resolveLocal = (...args) => {
    return path.join(__dirname, ...args);
};


export function bytes2kb(size) {
    return size ? (size / 1024).toFixed(3) + ' kb' : '...';
};

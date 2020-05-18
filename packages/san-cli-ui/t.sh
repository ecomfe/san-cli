#! /bin/bash
const cp = require('child_process');

const c = cp.exec('yarn dev:san init test-dir --download-repo-only --offline');

c.stdout.on('data', buffer => console.log(buffer.toString()));


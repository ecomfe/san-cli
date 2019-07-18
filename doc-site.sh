#!/usr/bin/env bash
# 保证build.sh脚本有任何错误就退出
set -e
export PATH=$NODEJS_BIN_LATEST:$PATH

# echo "node: $(node -v)"
# echo "npm: v$(npm -v)"

moduleName=hulk-docs

mkdir -p output
tar czf ${moduleName}.tar.gz ./docs
mv ${moduleName}.tar.gz output/

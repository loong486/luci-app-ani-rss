#!/bin/bash
# ================================================================
#         luci-app-ani-rss 独立插件 GitHub 一键推送脚本
# ================================================================

set -e

cd "$(dirname "$0")"

echo "================================================================"
echo "          luci-app-ani-rss 独立插件 GitHub 推送脚本"
echo "================================================================"
echo ""

if [ ! -d ".git" ]; then
    echo "[1/4] 正在初始化本地 Git 仓库..."
    git init
fi

EXISTING_URL="$(git remote get-url origin 2>/dev/null || true)"
REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
    if [ -n "$EXISTING_URL" ]; then
        echo "[1/4] 检测到已关联的 GitHub 仓库:"
        echo "      $EXISTING_URL"
        echo ""
        if [ -t 0 ]; then
            read -p "请输入新的仓库地址 (直接回车保持默认): " INPUT_URL
            REPO_URL="${INPUT_URL:-$EXISTING_URL}"
        else
            REPO_URL="$EXISTING_URL"
        fi
    else
        if [ -t 0 ]; then
            read -p "请输入您的 GitHub 仓库地址: " REPO_URL
        else
            echo "[错误] 未指定 GitHub 仓库地址，用法: ./push_to_github.sh <仓库地址> [提交说明]"
            exit 1
        fi
    fi
fi

if [ -z "$REPO_URL" ]; then
    echo "[错误] 仓库地址为空，操作中止。"
    exit 1
fi

git branch -M main >/dev/null 2>&1 || true

if [ -n "$EXISTING_URL" ]; then
    if [ "$REPO_URL" != "$EXISTING_URL" ]; then
        git remote set-url origin "$REPO_URL"
    fi
else
    git remote add origin "$REPO_URL"
fi

echo ""
echo "[2/4] 检查本地更改..."
if [ -n "$(git status --porcelain)" ]; then
    COMMIT_MSG="$2"
    if [ -z "$COMMIT_MSG" ]; then
        if [ -t 0 ]; then
            read -p "请输入本次提交说明 (直接回车使用默认说明): " USER_MSG
            COMMIT_MSG="${USER_MSG:-feat: update luci-app-ani-rss}"
        else
            COMMIT_MSG="feat: update luci-app-ani-rss"
        fi
    fi
    echo "正在暂存并提交代码..."
    git add .
    git commit -m "$COMMIT_MSG"
else
    echo "本地工作区干净，无新增未提交文件，将直接推送已有提交。"
fi

echo ""
echo "[3/4] 正在推送到 GitHub: $REPO_URL ..."
if ! git push -u origin main; then
    echo ""
    echo "================================================================"
    echo "提示: 检测到远程可能存在冲突或不同步，正在尝试覆盖推送..."
    echo "================================================================"
    git push -u origin main --force
fi

echo ""
echo "================================================================"
echo "[4/4] 推送成功！代码已同步至 GitHub。"
echo "================================================================"

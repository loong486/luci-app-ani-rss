# luci-app-ani-rss

[![GitHub Release](https://img.shields.io/github/v/release/wushuo894/ani-rss?label=ani-rss%20core)](https://github.com/wushuo894/ani-rss)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![OpenWrt](https://img.shields.io/badge/OpenWrt-21.02%20--%2025.12-brightgreen.svg)](https://openwrt.org/)

**luci-app-ani-rss** 是专为 OpenWrt / ImmortalWrt 固件开发的 **[ANI-RSS](https://github.com/wushuo894/ani-rss)**（基于 RSS 自动追番、订阅、下载、刮削与洗版工具）原生 LuCI Web 管理插件。

摒弃繁重复杂的 Docker 依赖，采用 OpenWrt 官方原生的 `procd` 守护进程与现代化 LuCI JS 前端技术栈，低资源开销运行，让路由器化身 24 小时全自动静默追番中心！

---

## ✨ 核心特性

- **纯原生进程守护**：直接由 OpenWrt `procd` 管理生命周期，自动保活、崩溃拉起，无 Docker 引擎的巨大资源开销。
- **现代化 LuCI JS 架构**：适配 OpenWrt 21.02、22.03、23.05、24.10 及最新的 25.12，支持客户端动态渲染、平滑状态刷新与异步操作。
- **一键极速部署**：
  - **核心程序一键安装/更新**：内置国内加速镜像节点（如 `ghfast.top` / `ghproxy`），后台一键下载最新的官方 `ani-rss.jar`。
  - **轻量 musl JRE 一键部署**：自动根据路由器 CPU 架构（`aarch64` / `x86_64` / `armv7`）拉取针对 OpenWrt musl-libc 优化的 OpenJDK 运行时，无需复杂手动配置。
- **路由器防爆内存保护**：支持灵活调整 JVM 堆内存（默认推荐 `-Xms32m -Xmx256m -XX:+UseG1GC`），防止低内存路由触发 Linux OOM Killer。
- **外置存储友好**：支持自由指定配置与 SQLite 数据存放目录（如挂载的 `/mnt/sda1/ani-rss`），避免磨损或占满路由器内部闪存。
- **实时日志与健康诊断**：内置 Web 日志查看器与实时状态监控，快速直达 Web 控制台（默认端口 `7789`）。

---

## 📸 功能界面概览

1. **运行概览**：
   - 实时运行状态徽标（`运行中` / `未运行` / `环境未就绪`）
   - **「打开 Web 管理界面」** 快捷按钮（一键跳转 `http://<路由器IP>:7789`）
   - 进程 PID、内存占用 (RSS)、CPU 架构、Java 路径与版本、JAR 文件大小状态
   - 一键重启服务、一键下载核心、一键安装 JRE 快捷按键
2. **参数设置**：
   - 基础设置：服务开关、监听端口、绑定地址、数据存储路径、动漫落地目录
   - 高级设置：自定义 Java / JAR 路径、JVM 堆内存调优、镜像加速源切换
3. **运行日志**：
   - 实时日志刷新查看、自动滚动、行数切换与一键清空日志

---

## 🛠️ 如何编译与集成到固件中

### 方法 1：作为本地 Package 集成进编译源码

在 OpenWrt 或 ImmortalWrt 源码根目录下：

```bash
# 进入 package 目录
cd package/

# 克隆本插件仓库
git clone https://github.com/<你的用户名>/luci-app-ani-rss.git

# 返回上级目录并更新安装 feeds
cd ..
./scripts/feeds update -i
./scripts/feeds install -a
```

通过 `make menuconfig` 勾选插件：
```text
LuCI --->
  3. Applications --->
    <*> luci-app-ani-rss.............. LuCI support for ANI-RSS
```

保存后执行标准编译流程即可：
```bash
make package/luci-app-ani-rss/compile V=s
```

### 方法 2：在自动化 CI（如 GitHub Actions）中集成

在您的 `diy-part2.sh` 脚本中添加如下命令：
```bash
git clone --depth 1 https://github.com/<你的用户名>/luci-app-ani-rss.git package/luci-app-ani-rss
```
并在 `.config` 种子文件中追加：
```text
CONFIG_PACKAGE_luci-app-ani-rss=y
CONFIG_PACKAGE_luci-i18n-ani-rss-zh-cn=y
```

---

## 📦 手动安装 (已运行的 OpenWrt 路由器)

若已有编译产出的 `.ipk` 或 `.apk` 安装包，可通过 SSH 上传至路由器：

### 在 OpenWrt 21.02 ~ 24.10 (opkg) 上：
```bash
opkg update
opkg install curl ca-bundle tar coreutils
opkg install luci-app-ani-rss_*.ipk
```

### 在 OpenWrt 25.12+ (apk) 上：
```bash
apk add curl ca-bundle tar coreutils
apk add --allow-untrusted luci-app-ani-rss-*.apk
```

安装完成后，刷新浏览器 LuCI 界面，即可在 **「服务」 -> 「ANI-RSS 追番」** 中找到本插件。

---

## 🚀 快速使用指南

1. **环境准备**：
   - 打开 **「服务」 -> 「ANI-RSS 追番」 -> 「运行概览」**。
   - 若尚未准备 Java 环境，直接点击 **「一键安装轻量 musl JRE」**，脚本会自动为您当前的 CPU 架构部署运行时。
   - 点击 **「一键下载 / 更新 ani-rss.jar」** 拉取官方最新核心程序。
2. **启用服务**：
   - 进入 **「参数设置」**，勾选 **「启用服务」**。
   - 若有插入移动硬盘或 NVMe，强烈建议将 **「数据与配置目录」** 设为外置路径（例如 `/mnt/sda1/ani-rss`）。
   - 点击 **「保存并应用」**。
3. **进入 ANI-RSS**：
   - 回到概览页，点击 **「打开 Web 管理界面」**（默认端口 `7789`）。
   - 默认账号：`admin`，默认密码：`admin`（首次登录后请立即修改）。
   - 在 ANI-RSS 设置中配置 qBittorrent / Transmission 下载器及 Mikan Project 等订阅源即可开始全自动追番！

---

## 📄 开源许可证

本项目基于 [Apache License 2.0](LICENSE) 开源发布。核心项目版权归 [wushuo894/ani-rss](https://github.com/wushuo894/ani-rss) 团队所有。

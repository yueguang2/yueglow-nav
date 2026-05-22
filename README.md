# Yueglow Nav

Yueglow Nav 是一个带后台管理能力的个人导航站。它面向个人工作台、浏览器首页、自托管导航页等场景，支持站点分类、常用站点、多链接智能优选、深浅色主题和 Docker 部署。

项目名来自“月光”的意象：Yueglow 表示柔和、清晰、有秩序的光。

## Features

- 前台导航首页：展示常用站点、站点分类、站点卡片和统计信息。
- 后台管理面板：管理分类、站点、常用站点、显示状态和排序。
- 首次初始化账号：第一次访问后台时创建管理员账号，之后使用该账号登录。
- 多链接支持：一个站点可以配置多条链接，并设置启用状态和排序。
- 智能中转：点击站点时弹出进度圈，服务端测速后优选最快可用链接，并在新标签打开。
- 深色/浅色主题：支持手动切换，首次访问会按系统偏好自动选择初始主题。
- SQLite 持久化：无需外部数据库，适合个人部署和轻量服务器。
- Docker 支持：内置 `Dockerfile` 和 `docker-compose.yml`，数据目录可挂载持久化。

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- SQLite with `better-sqlite3`
- Zod
- Docker standalone deployment

## Requirements

本地开发需要：

```bash
node >= 20
npm >= 10
```

Docker 部署需要：

```bash
docker
docker compose
```

## Quick Start

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

访问：

```text
前台：http://localhost:3000
后台：http://localhost:3000/admin
```

第一次访问后台会跳转到 `/admin/login`，用于创建管理员账号。

## Admin Usage

后台入口：

```text
http://localhost:3000/admin
```

后台主要模块：

- 仪表盘：查看分类、站点、常用站点、隐藏站点统计。
- 分类管理：新增、编辑、删除分类，设置排序和显示状态。
- 站点管理：新增、编辑、删除站点，设置所属分类、常用状态、显示状态和排序。
- 链接管理：在站点表单内维护多条链接，可配置名称、URL、排序和启用状态。

删除分类前，需要先删除或移动该分类下的站点。

## Smart Redirect

Yueglow Nav 支持每个站点配置多条链接。点击前台站点卡片时：

1. 页面弹出智能中转进度圈。
2. 服务端并发检测该站点启用的链接。
3. 优先选择最快可用链接。
4. 在新标签打开目标网站，当前导航页保留。

如果浏览器拦截新标签，会显示“手动打开”按钮。

兜底路由：

```text
/go/[siteId]
```

JSON API：

```text
/api/sites/[siteId]/resolve
```

测速结果会在服务端内存中短时间缓存，减少重复测速开销。服务重启后缓存会清空。

## Theme

前台、登录页和后台都支持浅色/深色主题切换。

- 首次访问：按系统偏好自动选择浅色或深色。
- 手动切换：选择会写入浏览器 `localStorage`。
- 后续访问：保持上次选择。

当前不提供“跟随系统”按钮，只有“浅色”和“深色”两个显式选项。

## Data Storage

默认数据目录：

```text
./data
```

SQLite 文件：

```text
data/nav-site.db
```

可以通过环境变量修改数据目录：

```bash
DATA_DIR=/path/to/data npm run start
```

`.gitignore` 已忽略数据库文件和 WAL/SHM 文件，不会把本地数据提交到 Git。

## Scripts

```bash
npm run dev
```

启动开发服务器。

```bash
npm run build
```

生产构建。

```bash
npm run start
```

启动生产服务。需要先执行 `npm run build`。

```bash
npm run lint
```

运行 ESLint 检查。

## Production

普通 Node 部署：

```bash
npm install
npm run build
npm run start
```

默认监听：

```text
http://localhost:3000
```

如果需要指定端口：

```bash
PORT=3000 npm run start
```

## Docker

构建并启动：

```bash
docker compose up -d --build
```

访问：

```text
http://localhost:3000
```

查看状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f
```

停止服务：

```bash
docker compose down
```

Docker 默认配置：

- 服务名：`yueglow-nav`
- 容器名：`yueglow-nav`
- 端口映射：`3000:3000`
- 容器内数据目录：`/app/data`
- 本地数据目录：`./data`

数据卷配置：

```yaml
volumes:
  - ./data:/app/data
```

只要保留 `./data` 目录，重建容器不会丢失后台数据。

## Backup

备份 SQLite 数据：

```bash
cp data/nav-site.db data/nav-site.backup.db
```

如果服务正在运行，建议同时备份 WAL/SHM 文件，或先停止服务后再备份：

```bash
docker compose down
cp -a data data.backup
docker compose up -d
```

## GitHub

当前推荐仓库名：

```text
yueglow-nav
```

远程地址：

```text
git@github.com:yueguang2/yueglow-nav.git
```

推送：

```bash
git push
```

## Notes

- 本项目是单管理员个人导航，当前不提供多用户系统。
- SQLite 适合个人和轻量自托管场景。
- 如果部署到公网，建议放在反向代理后面并启用 HTTPS。
- 后台管理员密码使用哈希保存，不保存明文。
- 首次启动会自动写入一批示例分类和站点，可在后台删除或修改。

## License

未指定许可证。公开发布前建议补充适合你的开源协议，例如 MIT、Apache-2.0 或保留所有权利。

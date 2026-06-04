# Yueglow Nav

Yueglow Nav 是一个带后台管理能力的个人导航站。它面向个人工作台、浏览器首页、自托管导航页等场景，支持站点分类、常用站点、多链接智能优选、深浅色主题和 Docker 部署。

项目名来自“月光”的意象：Yueglow 表示柔和、清晰、有秩序的光。

## 功能特性

- 前台导航首页：展示常用站点、站点分类、站点卡片和统计信息。
- 后台管理面板：管理分类、站点、常用站点、主题配色、显示状态和排序。
- 首次初始化账号：第一次访问后台时创建管理员账号，之后使用该账号登录。
- OIDC 登录：通过环境变量启用后可用懒猫账号进入后台；如需本地用户名密码，可在后台单独设置。
- 多链接支持：一个站点可以配置多条链接，并设置启用状态和排序。
- 智能中转：点击站点时弹出进度圈，服务端测速后优选最快可用链接，并在新标签打开，支持内网 IP 链接参与测速。
- 深色/浅色主题：支持手动切换，首次访问会按系统偏好自动选择初始主题，移动端提供原生兜底切换。
- 主题管理：内置多套预设主题，可在后台激活不同配色方案。
- SQLite 持久化：无需外部数据库，适合个人部署和轻量服务器。
- Docker 支持：内置 `Dockerfile` 和 `docker-compose.yml`，数据目录可挂载持久化。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- SQLite with `better-sqlite3`
- Zod
- Docker standalone deployment

## 项目结构

| Path | Description |
| --- | --- |
| `src/app` | 前台页面、后台页面、API 路由和中转路由 |
| `src/components` | 通用 UI、站点卡片、主题切换、主题预览、智能中转弹层 |
| `src/lib` | 数据库、认证、表单 Action、主题 CSS、链接优选和校验逻辑 |
| `data` | SQLite 数据目录，默认不提交数据库文件 |
| `Dockerfile` | 生产镜像构建文件 |
| `docker-compose.yml` | 单机 Docker 部署配置 |
| `.env.example` | 环境变量示例 |

## 运行要求

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

## 快速开始

克隆项目：

```bash
git clone git@github.com:yueguang2/yueglow-nav.git
cd yueglow-nav
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

如果需要通过局域网 IP 或代理域名访问开发服务，请让 dev server 监听全部网卡：

```bash
next dev -H 0.0.0.0
```

同时在 `.env` 中配置 `NEXT_ALLOWED_DEV_ORIGINS` 和 `NEXT_SERVER_ACTION_ALLOWED_ORIGINS`。前者填写 hostname，不带端口；后者填写 host，可以带端口。修改这些来源配置后需要重启 dev server。

浏览器会按域名/IP 隔离登录 Cookie；分别用 `localhost`、局域网 IP、代理域名测试后台时，需要在每个来源下单独登录。

本地 HTTP 开发时不要在 `.env.local` 中设置 `NODE_ENV=production`，否则登录 Cookie 可能按生产安全策略写入，导致后台登录后仍回到登录页。

访问：

```text
前台：http://localhost:3000
后台：http://localhost:3000/admin
```

第一次访问后台会跳转到 `/admin/login`。如果没有启用 OIDC，这里用于创建管理员账号；如果启用了 OIDC，可以直接用懒猫账号登录，或先创建本地账号。

## 后台使用

后台入口：

```text
http://localhost:3000/admin
```

后台主要模块：

- 仪表盘：查看分类、站点、常用站点、隐藏站点统计。
- 分类管理：新增、编辑、删除分类，设置排序和显示状态。
- 站点管理：新增、编辑、删除站点，设置所属分类、常用状态、显示状态和排序。
- 链接管理：在站点表单内维护多条链接，可配置名称、URL、排序和启用状态。
- 主题设置：查看并激活预设主题，前台、登录页和后台会使用当前激活主题。
- 本地密码：如果先使用 OIDC 登录，可在仪表盘里为当前管理员设置或重置本地密码，之后就能用表单登录并自动填充。

删除分类前，需要先删除或移动该分类下的站点。

## 智能跳转

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

测速会并发检测当前站点启用的全部链接，并选择响应最快的可用链接。内网 IP 地址（例如 `192.168.x.x`、`10.x.x.x`、`172.16-31.x.x`）会参与测速，适合 NAS、软路由、家庭服务等场景。

## 主题

前台、登录页和后台都支持浅色/深色主题切换。

- 首次访问：按系统偏好自动选择浅色或深色。
- 手动切换：选择会写入浏览器 `localStorage`。
- 后续访问：保持上次选择。
- 移动端：主题切换按钮带原生事件兜底，即使客户端 hydration 异常也能更新页面主题。
- 后台主题：访问 `/admin/themes` 可以激活预设主题。当前内置黏土拟态、玻璃拟态、海洋蓝、紫色梦境等方案。

当前不提供“跟随系统”按钮，只有“浅色”和“深色”两个显式选项。

## 登录说明

- 不启用 OIDC 时：第一次访问后台会先创建本地管理员账号。
- 启用 OIDC 时：可以直接用懒猫账号进入后台。
- 如果需要用户名密码登录：先在后台设置本地密码，再使用登录页表单。
- 懒猫自动填充只针对本地用户名密码登录，不会为 OIDC 生成密码。
- `LAZYCAT_PASSWORDLESS_LOGIN_ENABLED` 只控制应用侧表单自动填充适配和提示，不是真正的服务端免密 SSO。

## 数据存储

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

## 环境变量

可以参考 `.env.example` 配置：

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` / `production` | 运行环境，生产部署建议使用 `production`。 |
| `HOSTNAME` | `0.0.0.0` | 服务监听地址，Docker 内默认监听全部网卡。 |
| `PORT` | `3000` | HTTP 服务端口。 |
| `DATA_DIR` | `./data` | SQLite 数据目录，Docker 中默认使用 `/app/data`。 |
| `NEXT_ALLOWED_DEV_ORIGINS` | `ailab.heiyu.space,192.168.31.177` | 开发环境允许访问 Next dev 资源的 hostname，多个值用英文逗号分隔，不带协议和端口。 |
| `NEXT_SERVER_ACTION_ALLOWED_ORIGINS` | `ailab.heiyu.space,ailab.heiyu.space:3000,192.168.31.177,192.168.31.177:3000` | 允许提交 Server Actions 的 host，多个值用英文逗号分隔，可带端口。 |
| `LAZYCAT_OIDC_LOGIN_ENABLED` | `false` | 是否启用后台懒猫/OIDC 登录。只有 `true` / `1` / `yes` / `on` 会启用。 |
| `LAZYCAT_PASSWORDLESS_LOGIN_ENABLED` | `false` | 是否启用懒猫自动填充本地用户名密码表单的应用侧适配。 |
| `OIDC_CLIENT_ID` / `LAZYCAT_AUTH_OIDC_CLIENT_ID` | - | OIDC 客户端 ID。 |
| `OIDC_CLIENT_SECRET` / `LAZYCAT_AUTH_OIDC_CLIENT_SECRET` | - | OIDC 客户端密钥。 |
| `OIDC_AUTH_URI` / `LAZYCAT_AUTH_OIDC_AUTH_URI` | - | OIDC 授权地址。 |
| `OIDC_TOKEN_URI` / `LAZYCAT_AUTH_OIDC_TOKEN_URI` | - | OIDC token 地址。 |
| `OIDC_USERINFO_URI` / `LAZYCAT_AUTH_OIDC_USERINFO_URI` | - | OIDC userinfo 地址。 |
| `LAZYCAT_APP_DOMAIN` | - | 懒猫/反代场景下用于生成外部回调 URL 的域名。 |

普通 Node 部署时可以创建 `.env` 文件，也可以直接在启动命令前传入环境变量。

## 脚本

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

## 生产部署

普通 Node 部署：

```bash
npm ci
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

如果部署到公网，建议放在 Nginx、Caddy、Traefik 等反向代理后面，并启用 HTTPS。反向代理只需要转发到应用端口即可，例如：

```nginx
server {
  listen 80;
  server_name nav.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

生产环境建议：

- 使用强管理员密码。
- 定期备份 `DATA_DIR` 目录。
- 为站点配置 HTTPS。
- 不要把真实数据库文件提交到 Git。

## Docker

构建并启动：

```bash
docker compose up -d --build
```

启用懒猫登录和自动填充适配时，可以在同目录 `.env` 中配置：

```env
LAZYCAT_OIDC_LOGIN_ENABLED=true
LAZYCAT_PASSWORDLESS_LOGIN_ENABLED=true
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

更新代码后重新构建：

```bash
git pull
docker compose up -d --build
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

如果直接使用 Docker Hub 镜像：

```bash
docker run -d \
  --name yueglow-nav \
  -p 3000:3000 \
  -v ./data:/app/data \
  -e DATA_DIR=/app/data \
  -e LAZYCAT_OIDC_LOGIN_ENABLED=true \
  -e LAZYCAT_PASSWORDLESS_LOGIN_ENABLED=true \
  -e LAZYCAT_AUTH_OIDC_CLIENT_ID=your-client-id \
  -e LAZYCAT_AUTH_OIDC_CLIENT_SECRET=your-client-secret \
  -e LAZYCAT_AUTH_OIDC_AUTH_URI=https://example.com/oauth/authorize \
  -e LAZYCAT_AUTH_OIDC_TOKEN_URI=https://example.com/oauth/token \
  -e LAZYCAT_AUTH_OIDC_USERINFO_URI=https://example.com/oauth/userinfo \
  2192098715/yueglow-nav:latest
```

## 备份

建议优先备份整个数据目录：

```bash
cp -a data data.backup
```

如果服务正在运行，建议同时备份 WAL/SHM 文件，或先停止服务后再备份：

```bash
docker compose down
cp -a data data.backup
docker compose up -d
```

恢复数据：

```bash
docker compose down
cp -a data.backup data
docker compose up -d
```

如果只备份单个 SQLite 文件，请确保服务已停止，避免遗漏 WAL/SHM 中尚未合并的数据。

## GitHub

当前推荐仓库名：

```text
yueglow-nav
```

远程地址：

```text
git@github.com:yueguang2/yueglow-nav.git
```

克隆：

```bash
git clone git@github.com:yueguang2/yueglow-nav.git
```

推送：

```bash
git push
```

## 注意事项

- 本项目是单管理员个人导航，当前不提供多用户系统。
- SQLite 适合个人和轻量自托管场景。
- 如果部署到公网，建议放在反向代理后面并启用 HTTPS。
- 后台管理员密码使用哈希保存，不保存明文。
- 首次启动会自动写入一批示例分类和站点，可在后台删除或修改。
- 站点链接优选依赖服务端网络环境，不同服务器到目标站点的测速结果可能不同。

## 许可证

本项目基于 MIT License 开源，详见 [LICENSE](./LICENSE)。

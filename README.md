# Yueglow Nav

Yueglow Nav 是一个带后台管理能力的个人导航站。它面向浏览器首页、自托管导航页等场景，支持站点分类、常用站点、多链接智能优选、深浅色主题和 Docker 部署。

项目名来自“月光”的意象：Yueglow 表示柔和、清晰、有秩序的光。

## 功能特性

- 前台导航首页：展示常用站点、站点分类和站点入口。
- 后台管理面板：管理分类、站点、常用站点、主题配色、置顶状态、显示状态和排序。
- 首次初始化账号：第一次访问后台时创建管理员账号，之后使用该账号登录。
- OIDC 登录：通过环境变量启用后可用懒猫账号进入后台；如需本地用户名密码，可在后台单独设置。
- 多链接支持：一个站点可以配置多条链接，并设置名称、URL、启用状态和排序。
- 智能中转：点击站点时弹出进度圈，服务端测速后优选最快可用链接，并在新标签打开；服务端中转路由也可直接使用。
- 前台搜索：支持按站点、分类和链接快速定位入口，桌面端可用 `Ctrl K` 呼出搜索弹层。
- 深色/浅色主题：支持手动切换，首次访问会按系统偏好自动选择初始主题，移动端提供原生兜底切换。
- 主题管理：内置海洋蓝、微信绿、晨雾灰和纯粹黑白四个只读系统预设，自定义主题支持深色/浅色配色、实时预览、动态背景和背景模糊开关。
- 双界面风格：激活主题不仅切换配色，也会同步影响前台、登录页和后台的布局密度、圆角、阴影和交互动效。
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
| `src/components` | 通用 UI、站点卡片、搜索弹层、主题切换、主题预览、智能中转弹层 |
| `src/lib` | 数据库、认证、表单 Action、主题 CSS、界面风格、链接优选和校验逻辑 |
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

- 概览：查看分类、站点、常用站点、隐藏站点统计，并可设置或重置当前管理员的本地密码。
- 分类管理：新增、编辑、删除分类，设置排序、置顶和显示状态；列表每页显示 12 条。
- 站点管理：新增、编辑、删除站点，设置所属分类、常用状态、置顶、显示状态和排序；列表每页显示 10 条。
- 链接管理：在站点表单内维护多条链接，可配置名称、URL、排序和启用状态。
- 主题设置：查看并激活系统预设或自定义主题，前台、登录页和后台会使用当前激活主题。
- 系统预设：海洋蓝、微信绿、晨雾灰和纯粹黑白由应用自动维护，只能激活，不能编辑或删除。
- 自定义主题：可编辑名称、标识符、描述、界面风格、深色/浅色配色、背景模糊、动态背景和排序。
- 本地密码：如果先使用 OIDC 登录，可在概览页为当前管理员设置或重置本地密码，之后就能用表单登录。

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

测速会并发检测当前站点启用的全部链接，并选择响应最快的可用链接。为避免 SSRF 风险，服务器默认不会主动探测 `localhost`、回环地址、普通内网 IP 或未加入白名单的域名；这些链接仍可作为浏览器直接打开的导航目标。

如果只有一条启用链接，系统会直接使用该链接，不进行测速。如果多条链接都没有通过测速，会退回到排序第一的合法启用链接。

## 主题

前台、登录页和后台都支持浅色/深色主题切换。

- 首次访问：按系统偏好自动选择浅色或深色。
- 手动切换：选择会写入浏览器 `localStorage`。
- 后续访问：保持上次选择。
- 移动端：主题切换按钮带原生事件兜底，即使客户端 hydration 异常也能更新页面主题。
- 后台主题：访问 `/admin/themes` 可以管理主题配色。默认内置“海洋蓝”“微信绿”“晨雾灰”和“纯粹黑白”四个系统预设，系统预设不可编辑或删除。
- 自定义主题：新增主题时可选择“微信简洁”“海洋经典”“毛玻璃”或“极简主义”界面风格，颜色、动态背景和背景模糊仍可独立配置。
- 实时预览：主题表单支持切换深色/浅色预览，便于保存前检查主色、面板、卡片和输入框效果。
- 颜色格式：主题颜色支持 `#rrggbb` 和 `rgb(...)` / `rgba(...)` 格式。
- 界面风格：当前激活主题的 `ui_style` 会写入页面根节点的 `data-ui-style`，用于同步前台、搜索弹层、智能跳转弹层、登录页和后台管理界面。

当前不提供“跟随系统”按钮，只有“浅色”和“深色”两个显式选项。

### 内置主题

| 名称 | 标识符 | 界面风格 | 说明 |
| --- | --- | --- | --- |
| 海洋蓝 | `ocean` | 海洋经典 | 新安装默认激活，保留圆润卡片、阴影和动态背景，更接近经典视觉。 |
| 微信绿 | `wechat` | 微信简洁 | 浅灰底、绿色强调，更偏列表化和紧凑管理体验。 |
| 晨雾灰 | `misty-glass` | 毛玻璃 | 半透明、轻盈的毛玻璃拟态风格。 |
| 纯粹黑白 | `pure-minimal` | 极简主义 | 无边框、大留白、纯平面的极简风格。 |

系统预设会在启动时自动补齐和修正。升级旧版本时，应用会清理旧的示例预设，并保留当前激活主题；如果已有自定义主题占用了系统预设的名称或标识符，会自动重命名为 `custom-*`，避免和系统预设冲突。

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

主题表会自动迁移新增 `ui_style` 字段，未知风格会按 `wechat` 读取。分类、站点表也会自动迁移置顶字段。启动时还会自动维护四个系统预设，并确保始终只有一个激活主题；新安装默认激活海洋蓝，已有唯一激活主题会保持不变。

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
| `APP_COOKIE_SECURE` | `true` | 是否为登录/CSRF Cookie 添加 Secure 标记。公网 HTTPS 保持 `true`；仅内网 HTTP 部署可设为 `false`。 |
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

OIDC 配置读取时优先兼容通用 `OIDC_*` 变量，也兼容懒猫环境注入的 `LAZYCAT_AUTH_OIDC_*` 变量。只打开 `LAZYCAT_OIDC_LOGIN_ENABLED` 但没有提供完整 OIDC 地址和客户端配置时，不会显示可用的 OIDC 登录入口。

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

### 从源码构建

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

### 使用 Docker Hub 镜像

镜像仓库：

```text
2192098715/yueglow-nav
```

拉取最新镜像：

```bash
docker pull 2192098715/yueglow-nav:latest
```

直接运行：

```bash
docker run -d \
  --name yueglow-nav \
  --restart unless-stopped \
  -p 3000:3000 \
  -v ./data:/app/data \
  -e DATA_DIR=/app/data \
  -e LAZYCAT_OIDC_LOGIN_ENABLED=true \
  -e LAZYCAT_AUTH_OIDC_CLIENT_ID=your-client-id \
  -e LAZYCAT_AUTH_OIDC_CLIENT_SECRET=your-client-secret \
  -e LAZYCAT_AUTH_OIDC_AUTH_URI=https://example.com/oauth/authorize \
  -e LAZYCAT_AUTH_OIDC_TOKEN_URI=https://example.com/oauth/token \
  -e LAZYCAT_AUTH_OIDC_USERINFO_URI=https://example.com/oauth/userinfo \
  2192098715/yueglow-nav:latest
```

如果不启用 OIDC，可以去掉所有 `LAZYCAT_*` 环境变量。首次访问 `/admin` 时创建本地管理员账号即可。

使用远端镜像的 Compose 示例：

```yaml
services:
  yueglow-nav:
    image: 2192098715/yueglow-nav:latest
    container_name: yueglow-nav
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      HOSTNAME: 0.0.0.0
      PORT: 3000
      DATA_DIR: /app/data
    volumes:
      - ./data:/app/data
```

绿联云 NAS 或其他内网 HTTP 部署建议使用 Docker named volume，避免 NAS 目录权限导致 SQLite 无法打开；同时关闭 Secure Cookie：

```yaml
services:
  yueglow-nav:
    image: 2192098715/yueglow-nav:latest
    container_name: yueglow-nav
    restart: unless-stopped
    ports:
      - "40331:3000"
    environment:
      HOSTNAME: 0.0.0.0
      PORT: 3000
      DATA_DIR: /app/data
      APP_COOKIE_SECURE: "false"
      LAZYCAT_OIDC_LOGIN_ENABLED: "false"
      LAZYCAT_PASSWORDLESS_LOGIN_ENABLED: "false"
    volumes:
      - yueglow-nav-data:/app/data

volumes:
  yueglow-nav-data:
```

内网访问地址示例：

```text
http://NAS_IP:40331/admin/login
```

仓库也提供了 `docker-compose.hub.yml`，用于直接使用 Docker Hub 镜像：

```bash
docker compose -f docker-compose.hub.yml up -d
```

更新镜像：

```bash
docker pull 2192098715/yueglow-nav:latest
docker compose up -d
```

### 维护者推送镜像

发布镜像前先确认代码已经提交，并使用当前提交短哈希作为版本标签：

```bash
GIT_SHA=$(git rev-parse --short HEAD)
docker build -t 2192098715/yueglow-nav:latest -t 2192098715/yueglow-nav:$GIT_SHA .
docker push 2192098715/yueglow-nav:latest
docker push 2192098715/yueglow-nav:$GIT_SHA
```

在 PowerShell 中可以使用：

```powershell
$GIT_SHA = git rev-parse --short HEAD
docker build -t 2192098715/yueglow-nav:latest -t "2192098715/yueglow-nav:$GIT_SHA" .
docker push 2192098715/yueglow-nav:latest
docker push "2192098715/yueglow-nav:$GIT_SHA"
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

## 安全配置

升级前建议先备份 `data/` 目录。数据库迁移会在启动时幂等补列，不会删除现有数据；会话会在登录后自动轮换为哈希存储。

OIDC 部署建议显式配置外部地址和管理员白名单：

```env
APP_BASE_URL=https://nav.example.com
LAZYCAT_OIDC_LOGIN_ENABLED=true
OIDC_ADMIN_ALLOWED_EMAILS=admin@example.com
# 或使用稳定 subject：
# OIDC_ADMIN_ALLOWED_SUBJECTS=provider-subject-id
```

默认不信任 `x-forwarded-host`。只有确实位于可信反代后面时，才启用：

```env
TRUST_PROXY_HEADERS=true
OIDC_ALLOWED_REDIRECT_HOSTS=nav.example.com
```

智能链接保留内网导航能力，但默认不会由服务器主动探测内网地址或未白名单域名，避免 SSRF 风险。需要服务器测速的公网域名可显式加入白名单：

```env
SMART_LINK_PROBE_ALLOWED_HOSTS=github.com,nextjs.org
```

如果 OIDC 白名单配置错误导致无法登录，可临时关闭 `LAZYCAT_OIDC_LOGIN_ENABLED`，使用本地管理员账号进入后台后再调整配置。

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
- 如果部署到公网，建议放在反向代理后面并启用 HTTPS，且保持 `APP_COOKIE_SECURE=true`。
- 仅内网 HTTP 部署时，可以设置 `APP_COOKIE_SECURE=false`，否则浏览器不会保存生产环境的 Secure Cookie。
- 后台管理员密码使用哈希保存，不保存明文。
- 首次启动会自动写入一批示例分类和站点，可在后台删除或修改；旧版本站点会自动补齐默认链接。
- 站点链接优选依赖服务端网络环境，不同服务器到目标站点的测速结果可能不同。
- 主题模板、主题导入导出相关组件目前存在于代码中，但尚未接入 `/admin/themes` 表单，不应作为当前可用功能依赖。

## 许可证

本项目基于 MIT License 开源，详见 [LICENSE](./LICENSE)。

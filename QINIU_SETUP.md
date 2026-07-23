# 七牛云存储接入指南（Lingorm App）

## 为什么需要它

照片此前存在浏览器 `localStorage`（约 5MB 上限，换设备不共享）。接入七牛云后：

- 照片存到国内对象存储，自带 CDN，**国内打开飞快**
- 跨设备：手机上传、电脑也能看
- 不再有 5MB 容量焦虑

## 架构

```
GitHub Pages（界面）  +  七牛 Kodo（照片存储 + 国内 CDN）  +  Cloudflare Worker（签发上传凭证）
```

> ⚠️ 关键安全点：七牛 `SecretKey` **绝不能进前端**。Worker 用它在服务端签名，只把"短期上传 token"发给前端，前端拿 token 直传到七牛。

前端已改造为**双模式**：配置了 `VITE_QINIU_*` 就直传云端（本地只存 CDN URL）；未配置则自动回退为 base64 存本地，行为与改造前一致。

---

## 步骤

### 1. 创建七牛存储桶

1. 打开 https://www.qiniu.com 注册（实名认证后免费额度更大）
2. 控制台 → 对象存储 → 新建空间
   - 空间名称：如 `lingorm`
   - 存储区域：选**离你近的**（华东-浙江 / 华南-广东）
   - 访问控制：选**公开**（相册图要能直接外链）
3. 记下两项：
   - **空间名（Bucket）**
   - **CDN 加速域名**：测试域名形如 `xxx.bkt.clouddn.com`，或你绑定的自定义域名（需带 `https://`）

### 2. 拿到密钥

控制台 → 个人中心 → 密钥管理 → 复制：
- **AccessKey (AK)**
- **SecretKey (SK)**

### 3. 部署 Cloudflare Worker（签发 token）

1. 打开 https://dash.cloudflare.com → **Workers & Pages** → **Create a Worker**
2. 起名（如 `qiniu-token`）→ Deploy 后点 **Edit code**
3. 把本项目 `qiniu-worker/index.js` 内容**整体粘贴**进去 → Deploy
4. 记下 Worker 地址，形如 `https://qiniu-token-你的子域.workers.dev`
5. **Settings → Variables** → 添加两个 **Secret** 变量：
   - `QINIU_AK` = 你的 AccessKey
   - `QINIU_SK` = 你的 SecretKey

### 4. 填本地配置

项目根目录新建 `.env`（已被 gitignore，不会进仓库），填入：

```
VITE_QINIU_BUCKET=你的空间名
VITE_QINIU_DOMAIN=https://你的cdn域名
VITE_QINIU_TOKEN_URL=https://你的worker地址
```

### 5. 部署到 GitHub Pages

仓库 **Settings → Secrets and variables → Actions → New repository secret**，新增三个同名 secret：

- `VITE_QINIU_BUCKET`
- `VITE_QINIU_DOMAIN`
- `VITE_QINIU_TOKEN_URL`

（值与第 4 步相同）push 代码后��GitHub Actions 会自动重新构建部署。约 1–2 分钟后刷新 `https://beetlelo.github.io/lingorm-app/` 即可。

---

## 回退与容错

- **未配置七牛**：App 自动回退为 base64 存 localStorage（改造前行为）。
- **七牛配置后某次上传失败**：该张自动回退存本地 base64，不会丢图。
- **已上传到七牛的照片删除**：App 仅从列表隐藏，七牛上原图保留（Worker 只授权上传，无删除权限）。如需彻底清理，到七牛控制台手动删除。

## 容量与费用（参考）

- 免费额度：标准存储长期约 **10GB**（个人追星记录够用好一阵）
- 流量：国内 CDN，速度飞快；超出免费流量部分按量计费，个人低频使用几乎不会触顶
- 上传前已压缩到 **1280px / 0.75**，单张约 150–300KB，既省流量又快

## 本地调试

`npm run dev` 时若 `.env` 已填七牛变量，可直接上传到云端；若没填，则上传走本地回退。两种方式都能正常跑。

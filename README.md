# 🎓 Academic Portfolio - 学术主页

一个精美的学术个人主页，专为青年学者/博士毕业生设计。支持暗色/亮色主题切换、粒子动画、打字机效果、论文分类筛选等特性。基于纯 HTML/CSS/JS 构建，Docker 一键部署，开箱即用。

## ✨ 功能特性

- 🎨 暗色 / 亮色主题切换（自动记忆偏好）
- 🎆 交互式粒子网络动画背景
- ⌨️ 打字机效果轮播身份标签
- 📊 论文数 / 引用数 / 项目数 滚动计数动画
- 🔍 论文按 Journal / Conference 分类筛选
- 📱 完全响应式（手机 / 平板 / 桌面）
- 🚀 Docker + Nginx 一键部署

## 📁 项目结构

```
blog/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 交互逻辑
├── nginx.conf          # Nginx 配置（gzip + 缓存 + 安全头）
├── Dockerfile          # Docker 镜像定义
├── docker-compose.yml  # 一键部署配置
└── README.md           # 本文件
```

## 🛠️ 安装与部署

### 前置条件

- 一台云服务器（Ubuntu / CentOS / Debian 均可）
- 已开放 **80** 端口（安全组/防火墙）

---

### 方案一：Docker 部署（推荐 ⭐）

#### 1. 安装 Docker

```bash
# 一键安装 Docker
curl -fsSL https://get.docker.com | sh

# 将当前用户加入 docker 组（避免每次 sudo）
sudo usermod -aG docker $USER

# 重新登录使权限生效
exit
# 重新 SSH 登录
```

验证安装：
```bash
docker --version
docker compose version
```

#### 2. 上传项目到服务器

```bash
# 在本地电脑执行，将项目文件上传到服务器
scp -r ./* user@your-server-ip:/opt/blog/
```

或者使用 Git：
```bash
# 在服务器上
cd /opt
git clone https://your-repo-url.git blog
```

#### 3. 构建并启动

```bash
cd /opt/blog
docker compose up -d --build
```

输出示例：
```
[+] Building 5.2s (9/9) FINISHED
[+] Running 1/1
 ✔ Container academic-blog  Started
```

#### 4. 验证部署

```bash
# 检查容器运行状态
docker ps

# 查看日志
docker logs academic-blog

# 测试访问
curl -I http://localhost
```

打开浏览器访问：`http://你的服务器IP`

#### 5. 更新网站

修改文件后，重新构建即可：
```bash
cd /opt/blog
docker compose up -d --build
```

#### 6. 停止服务

```bash
docker compose down
```

---

### 方案二：直接 Nginx 部署

#### 1. 安装 Nginx

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y nginx

# CentOS
sudo yum install -y nginx
```

#### 2. 部署文件

```bash
# 复制网站文件
sudo cp index.html style.css script.js /var/www/html/

# 如有头像等图片，一并复制
# sudo cp avatar.jpg /var/www/html/

# 使用项目提供的 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/default
```

#### 3. 启动 Nginx

```bash
# 测试配置是否正确
sudo nginx -t

# 启动 / 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

#### 4. 验证

```bash
curl -I http://localhost
```

---

### 方案三：配置域名 + HTTPS（可选）

#### 1. 域名解析

在域名服务商处添加 A 记录，将域名指向服务器 IP。

#### 2. 修改 Nginx 配置

编辑 `nginx.conf`，将 `server_name` 改为你的域名：
```nginx
server_name yourdomain.com www.yourdomain.com;
```

#### 3. 申请免费 SSL 证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动申请并配置 HTTPS
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置证书自动续期
sudo certbot renew --dry-run
```

---

## 📝 个性化修改

### 基本信息

在 `index.html` 中搜索并替换以下内容：

| 搜索内容 | 替换为 |
|---------|--------|
| `Your Name` | 你的真实姓名 |
| `YN` | 你的姓名缩写（导航 Logo） |
| `XXX University` | 你的学校名称 |
| `your.email@university.edu` | 你的邮箱 |
| `yourgithub` | 你的 GitHub 用户名 |

### 添加头像

将你的照片命名为 `avatar.jpg` 放到项目目录，然后修改 `index.html` 中的 hero-visual 区域：

```html
<!-- 删除 avatar-placeholder 整个 div -->
<!-- 取消注释下面这行 -->
<img src="avatar.jpg" alt="Your Name" class="avatar-img">
```

### 修改统计数字

```html
<span class="stat-number" data-target="10">0</span>   <!-- 论文数 -->
<span class="stat-number" data-target="200">0</span>  <!-- 引用数 -->
<span class="stat-number" data-target="5">0</span>    <!-- 项目数 -->
```

### 自定义主题色

编辑 `style.css` 顶部的 CSS 变量：

```css
:root {
    --accent: #6c5ce7;       /* 主色调 */
    --accent-light: #a29bfe; /* 主色浅色 */
    --gradient: linear-gradient(135deg, #6c5ce7, #00cec9); /* 渐变 */
}
```

推荐配色：

| 风格 | `--accent` | `--gradient` |
|------|-----------|-------------|
| 紫色（默认） | `#6c5ce7` | `#6c5ce7, #00cec9` |
| 蓝色科技 | `#0984e3` | `#0984e3, #6c5ce7` |
| 绿色清新 | `#00b894` | `#00b894, #0984e3` |
| 橙金学术 | `#e17055` | `#e17055, #fdcb6e` |

## 📄 License

MIT License - 自由使用和修改。

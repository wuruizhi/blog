#!/bin/bash
# ====================================
# 学术主页一键部署脚本
# 使用方法: sudo bash deploy.sh
# ====================================
set -e

SITE_DIR="/var/www/blog"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

# ========== 自定义配置 ==========
PORT=10086                     # 访问端口（记得在云服务器安全组放行此端口）
DOMAIN="_"                     # 域名，买好后改成你的域名，例如 "blog.example.top"
# ================================

echo "========================================="
echo "  🎓 学术主页 - 一键部署"
echo "========================================="

# 1. 安装 Nginx
echo ""
echo "[1/4] 安装 Nginx..."
if command -v nginx &> /dev/null; then
    echo "  ✅ Nginx 已安装"
else
    apt update -qq && apt install -y nginx
    echo "  ✅ Nginx 安装完成"
fi

# 2. 复制网站文件
echo ""
echo "[2/4] 部署网站文件..."
mkdir -p $SITE_DIR
cp "$REPO_DIR"/index.html "$SITE_DIR/"
cp "$REPO_DIR"/style.css "$SITE_DIR/"
cp "$REPO_DIR"/script.js "$SITE_DIR/"
# 如果有头像或其他图片，也会一起复制
[ -f "$REPO_DIR/avatar.jpg" ] && cp "$REPO_DIR/avatar.jpg" "$SITE_DIR/"
[ -f "$REPO_DIR/avatar.png" ] && cp "$REPO_DIR/avatar.png" "$SITE_DIR/"
echo "  ✅ 文件已部署到 $SITE_DIR"

# 3. 配置 Nginx
echo ""
echo "[3/4] 配置 Nginx..."

# 修复 nginx.conf: 将 vhost include 从 http{} 外部移到 http{} 内部
NGINX_CONF="/etc/nginx/nginx.conf"
if grep -q '^include /etc/nginx/vhost/' "$NGINX_CONF" 2>/dev/null; then
    echo "  🔧 修复 nginx.conf: 将 vhost include 移入 http{} 块内..."
    # 移除顶层的 include（在 http{} 外面的那行）
    sed -i '/^include \/etc\/nginx\/vhost\//d' "$NGINX_CONF"
    # 在 http{} 块末尾插入（在最后一个 } 之前）
    sed -i '/include \/etc\/nginx\/sites-enabled/a\    include /etc/nginx/vhost/*.conf;' "$NGINX_CONF"
fi

# 使用 sites-available/sites-enabled（位于 http{} 内部，正确支持 server 块）
mkdir -p /etc/nginx/sites-available
cat > /etc/nginx/sites-available/blog << EOF
server {
    listen ${PORT};
    server_name ${DOMAIN};
    root /var/www/blog;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
    gzip_vary on;

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t
echo "  ✅ Nginx 配置完成"

# 4. 启动 Nginx
echo ""
echo "[4/4] 启动 Nginx..."
systemctl restart nginx
systemctl enable nginx
echo "  ✅ Nginx 已启动并设为开机自启"

# 完成
# 获取公网 IP（云服务器 hostname -I 返回的是内网 IP）
PUBLIC_IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || curl -s --max-time 3 ip.sb 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo "========================================="
echo "  🎉 部署完成！"
echo ""
if [ "$DOMAIN" = "_" ]; then
    echo "  访问: http://${PUBLIC_IP}:${PORT}"
else
    echo "  访问: http://${DOMAIN}:${PORT}"
fi
echo ""
echo "  ⚠️  请确保云服务器安全组已放行 TCP 端口 ${PORT}"
echo ""
echo "  更新网站: 修改文件后重新运行"
echo "  sudo bash deploy.sh"
echo "========================================="

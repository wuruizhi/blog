#!/bin/bash
# ====================================
# 学术主页一键部署脚本
# 使用方法: sudo bash deploy.sh
# ====================================
set -e

SITE_DIR="/var/www/blog"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

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

# 清理错误的 vhost 配置（vhost/ 在 nginx.conf 中位于 http{} 外部，不能放 server 块）
rm -f /etc/nginx/vhost/blog.conf 2>/dev/null

# 使用 sites-available/sites-enabled（位于 http{} 内部，正确支持 server 块）
mkdir -p /etc/nginx/sites-available
cat > /etc/nginx/sites-available/blog << 'EOF'
server {
    listen 80;
    server_name _;
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
echo ""
echo "========================================="
echo "  🎉 部署完成！"
echo ""
echo "  访问: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "  更新网站: 修改文件后重新运行"
echo "  sudo bash deploy.sh"
echo "========================================="

# Docker 部署指南

本指南详细说明如何使用 Docker 部署搭理 API 后端服务。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+（可选，推荐）
- 已运行的 PostgreSQL 数据库
- 配置好的 `.env` 文件

---

## 🚀 快速开始

### 方式 1: 使用 Docker Compose（推荐）

1. **确保 .env 文件配置正确**

   ```bash
   cd dali-api
   cp .env.example .env
   # 编辑 .env 文件，配置数据库连接和其他环境变量
   ```

   **重要**：如果你的 PostgreSQL 运行在宿主机上，DATABASE_URL 应该使用：
   ```bash
   # Windows/Mac
   DATABASE_URL=postgresql+asyncpg://postgres:root@host.docker.internal:5432/dali

   # Linux
   DATABASE_URL=postgresql+asyncpg://postgres:root@172.17.0.1:5432/dali
   # 或者使用宿主机的实际 IP
   ```

2. **构建并启动服务**

   ```bash
   docker-compose up -d
   ```

3. **查看日志**

   ```bash
   docker-compose logs -f api
   ```

4. **验证服务运行**

   访问：http://localhost:8000/docs

5. **停止服务**

   ```bash
   docker-compose down
   ```

---

### 方式 2: 使用 Docker 单独部署

#### 步骤 1: 构建镜像

```bash
cd dali-api
docker build -t dali-api:latest .
```

#### 步骤 2: 运行容器

```bash
docker run -d \
  --name dali-api \
  -p 8000:8000 \
  --env-file .env \
  --add-host host.docker.internal:host-gateway \
  dali-api:latest
```

#### 步骤 3: 查看日志

```bash
docker logs -f dali-api
```

#### 步骤 4: 停止容器

```bash
docker stop dali-api
docker rm dali-api
```

---

## 🔧 配置说明

### 数据库连接

容器需要连接到宿主机上的 PostgreSQL，有以下几种方式：

#### Windows/Mac（推荐）

使用 `host.docker.internal`：

```bash
DATABASE_URL=postgresql+asyncpg://postgres:password@host.docker.internal:5432/dali
```

#### Linux 方式 1：使用 Docker 网桥 IP

```bash
DATABASE_URL=postgresql+asyncpg://postgres:password@172.17.0.1:5432/dali
```

#### Linux 方式 2：使用宿主机 IP

```bash
# 先查询宿主机 IP
ip addr show docker0

# 然后配置
DATABASE_URL=postgresql+asyncpg://postgres:password@192.168.1.100:5432/dali
```

#### Linux 方式 3：使用 host 网络模式

修改 `docker-compose.yml` 或运行命令：

```bash
docker run -d \
  --name dali-api \
  --network host \
  --env-file .env \
  dali-api:latest
```

**注意**：使用 host 网络模式时，不需要 `-p` 参数。

---

## 📦 Dockerfile 说明

当前 Dockerfile 使用**多阶段构建**优化镜像大小：

```dockerfile
# 阶段 1: 构建阶段（安装依赖）
FROM python:3.11-slim as builder
# ... 安装 Poetry 和依赖

# 阶段 2: 生产阶段（仅包含运行时文件）
FROM python:3.11-slim
# ... 复制依赖和应用代码
```

**优点**：
- 最终镜像不包含 Poetry 和构建工具
- 镜像体积更小
- 安全性更好

---

## 🔍 故障排查

### 问题 1: 容器无法连接数据库

**错误信息**：
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**解决方案**：

1. **检查数据库是否监听外部连接**

   编辑 PostgreSQL 配置文件 `postgresql.conf`：
   ```
   listen_addresses = '*'  # 或 'localhost,172.17.0.1'
   ```

2. **检查防火墙规则**

   ```bash
   # Linux
   sudo ufw allow 5432/tcp

   # Windows
   # 在 Windows 防火墙中添加入站规则，允许端口 5432
   ```

3. **检查 pg_hba.conf**

   添加以下行允许 Docker 网络访问：
   ```
   host    all             all             172.17.0.0/16           md5
   ```

   重启 PostgreSQL：
   ```bash
   # Linux
   sudo systemctl restart postgresql

   # Windows
   # 在服务管理器中重启 PostgreSQL 服务
   ```

4. **测试连接**

   从容器内测试：
   ```bash
   docker exec -it dali-api bash
   apt-get update && apt-get install -y postgresql-client
   psql -h host.docker.internal -U postgres -d dali
   ```

### 问题 2: 容器启动后立即退出

**检查日志**：
```bash
docker logs dali-api
```

**常见原因**：
- `.env` 文件配置错误
- 数据库迁移未执行
- 端口被占用

**解决**：
```bash
# 1. 验证 .env 配置
docker run --rm --env-file .env dali-api:latest printenv

# 2. 手动执行数据库迁移
docker run --rm --env-file .env dali-api:latest alembic upgrade head

# 3. 检查端口占用
netstat -an | grep 8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows
```

### 问题 3: 镜像构建失败

**错误**：`ERROR: failed to solve: process "..." did not complete successfully`

**解决**：

1. **清理 Docker 缓存**
   ```bash
   docker system prune -a
   ```

2. **使用 --no-cache 重新构建**
   ```bash
   docker build --no-cache -t dali-api:latest .
   ```

3. **检查网络连接**（Poetry 安装依赖需要网络）

---

## 🚀 生产环境部署

### 1. 构建优化镜像

```bash
docker build \
  --target production \
  --build-arg POETRY_VERSION=1.7.1 \
  -t dali-api:v1.0.0 \
  .
```

### 2. 使用环境变量（不使用 .env 文件）

```bash
docker run -d \
  --name dali-api \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/dali" \
  -e APP_ENV=production \
  -e DEBUG=false \
  -e SECRET_KEY="your-production-secret" \
  -e ALIBABA_ACCESS_KEY_ID="your-key" \
  -e ALIBABA_ACCESS_KEY_SECRET="your-secret" \
  -e ALIBABA_OSS_BUCKET="your-bucket" \
  -e ALIBABA_OSS_ENDPOINT="oss-cn-hangzhou.aliyuncs.com" \
  --restart unless-stopped \
  dali-api:v1.0.0
```

### 3. 使用 Docker Secrets（推荐）

对于敏感信息，使用 Docker Secrets：

```bash
# 创建 secrets
echo "your-secret-key" | docker secret create app_secret_key -
echo "your-db-password" | docker secret create db_password -

# 在 docker-compose.yml 中使用
secrets:
  app_secret_key:
    external: true
  db_password:
    external: true
```

### 4. 配置健康检查

在 `docker-compose.yml` 中添加：

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 5. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.dali.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. 限制资源使用

```bash
docker run -d \
  --name dali-api \
  --memory="512m" \
  --cpus="1.0" \
  -p 8000:8000 \
  --env-file .env \
  dali-api:latest
```

---

## 📊 监控和日志

### 查看容器状态

```bash
docker ps
docker stats dali-api
```

### 查看日志

```bash
# 实时日志
docker logs -f dali-api

# 最近 100 行
docker logs --tail 100 dali-api

# 带时间戳
docker logs -t dali-api
```

### 进入容器调试

```bash
docker exec -it dali-api bash
```

---

## 🔄 更新部署

### 使用 Docker Compose

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务（零停机时间）
docker-compose up -d

# 4. 清理旧镜像
docker image prune -f
```

### 使用 Docker

```bash
# 1. 停止旧容器
docker stop dali-api

# 2. 删除旧容器
docker rm dali-api

# 3. 构建新镜像
docker build -t dali-api:latest .

# 4. 启动新容器
docker run -d --name dali-api -p 8000:8000 --env-file .env dali-api:latest

# 5. 清理旧镜像
docker image prune -f
```

---

## 🛠️ 常用命令

```bash
# 构建镜像
docker build -t dali-api:latest .

# 运行容器
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 进入容器
docker exec -it dali-api bash

# 查看容器资源使用
docker stats dali-api

# 清理未使用的镜像
docker image prune -a

# 清理所有（危险！）
docker system prune -a --volumes
```

---

## ✅ 部署检查清单

部署前确保：

- [ ] `.env` 文件配置完整且正确
- [ ] PostgreSQL 数据库已创建且可访问
- [ ] 数据库迁移已执行（`alembic upgrade head`）
- [ ] OSS 配置正确（如果使用真实 OSS）
- [ ] 防火墙规则允许访问
- [ ] Docker 和 Docker Compose 版本正确
- [ ] 宿主机有足够的内存和磁盘空间
- [ ] 测试 API 接口是否正常：http://localhost:8000/docs

---

## 📚 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [FastAPI 部署指南](https://fastapi.tiangolo.com/deployment/docker/)
- [项目 README](../README.md)

---

## 🆘 需要帮助？

如遇问题：
1. 查看本文档的故障排查部分
2. 检查容器日志：`docker logs dali-api`
3. 在 GitHub 提交 Issue

---

**部署成功后，记得测试所有 API 端点！** 🎉

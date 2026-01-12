# 阿里云 OSS 配置指南

本指南将帮助你在 10-15 分钟内完成阿里云 OSS 的配置。

## 📋 前置要求

- 阿里云账号（如果没有，请先注册：https://account.aliyun.com/register）
- 实名认证（OSS 服务需要）

---

## 🚀 配置步骤

### 步骤 1: 创建 OSS Bucket

1. 登录阿里云 OSS 控制台：https://oss.console.aliyun.com/
2. 点击 **"创建 Bucket"**
3. 填写 Bucket 配置：
   - **Bucket 名称**：`dali-storage-prod`（或其他唯一名称）
   - **地域**：选择离你最近的区域，如 `华东1（杭州）`
   - **存储类型**：选择 **标准存储**
   - **读写权限**：选择 **私有** ⚠️ 重要！保护用户隐私
   - **服务端加密**：选择 **OSS 完全托管**（免费）
   - **实时日志查询**：可选（建议开启，方便调试）

4. 点击 **"确定"** 创建

### 步骤 2: 获取 AccessKey

1. 访问 RAM 访问控制：https://ram.console.aliyun.com/manage/ak
2. 点击 **"创建 AccessKey"**
3. ⚠️ **安全提示**：
   - AccessKey Secret 只显示一次，请立即复制保存
   - 不要将 AccessKey 提交到 Git 仓库
   - 建议使用 RAM 子账号，限制权限范围

4. 记录以下信息：
   - `AccessKey ID`：例如 `LTAI5tXXXXXXXXXX`
   - `AccessKey Secret`：例如 `Y9kXXXXXXXXXXXXXXXXXXXXX`

### 步骤 3: 获取 Endpoint

根据你创建的 Bucket 地域，Endpoint 格式为：

| 地域 | Endpoint |
|------|----------|
| 华东1（杭州） | `oss-cn-hangzhou.aliyuncs.com` |
| 华东2（上海） | `oss-cn-shanghai.aliyuncs.com` |
| 华北1（青岛） | `oss-cn-qingdao.aliyuncs.com` |
| 华北2（北京） | `oss-cn-beijing.aliyuncs.com` |
| 华南1（深圳） | `oss-cn-shenzhen.aliyuncs.com` |

完整列表：https://help.aliyun.com/document_detail/31837.html

### 步骤 4: 配置环境变量

编辑 `dali-api/.env` 文件（如果没有，复制 `.env.example`）：

```bash
# Alibaba Cloud OSS
ALIBABA_ACCESS_KEY_ID=你的AccessKeyID
ALIBABA_ACCESS_KEY_SECRET=你的AccessKeySecret
ALIBABA_OSS_BUCKET=dali-storage-prod
ALIBABA_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

### 步骤 5: 验证配置

启动后端服务：

```bash
cd dali-api
poetry run uvicorn app.main:app --reload
```

检查日志，应该看到：

```
INFO: Storage service initialized with REAL OSS
INFO: OSS Bucket: dali-storage-prod
INFO: OSS Endpoint: oss-cn-hangzhou.aliyuncs.com
```

如果看到 `Mock storage mode`，说明配置未生效，请检查环境变量。

---

## 💰 费用预估

### 免费额度（前 3 个月）

- 存储容量：40GB
- 外网流出流量：10GB/月
- PUT/GET 请求：100 万次/月

### 正式收费（约 5-10 元/月）

假设场景：
- 100 个活跃用户
- 每人 20 张照片，每张 500KB
- 总存储：1GB

**月成本**：
- 存储费：1GB × 0.12 元 = **0.12 元**
- 流量费：假设每张查看 10 次 = 10GB × 0.5 元 = **5 元**
- 请求费：几乎可忽略

**总计：约 5-6 元/月**

---

## 🔒 安全最佳实践

### 1. 使用 RAM 子账号（推荐）

不要使用主账号 AccessKey！创建子账号并授予最小权限：

1. 访问 RAM 控制台：https://ram.console.aliyun.com/users
2. 创建 RAM 用户，勾选 **"OpenAPI 调用访问"**
3. 授权策略：仅选择 **"AliyunOSSFullAccess"**（或自定义更细粒度权限）
4. 使用 RAM 用户的 AccessKey

### 2. 开启服务端加密

在 Bucket 设置中开启 **"服务端加密"**，选择 **"OSS 完全托管"**，保护用户照片。

### 3. 设置生命周期规则

自动清理过期文件，节省成本：

1. OSS 控制台 → 选择 Bucket → 基础设置 → 生命周期
2. 添加规则：
   - **规则名称**：`清理临时文件`
   - **应用范围**：前缀 `temp/`
   - **删除策略**：30 天后删除

### 4. 配置跨域资源共享（CORS）

如果前端直接上传到 OSS，需要配置 CORS：

1. OSS 控制台 → 选择 Bucket → 权限管理 → 跨域设置
2. 添加规则：
   - **来源**：`http://localhost:19006`（开发环境）+ 生产域名
   - **允许 Methods**：`PUT, POST, GET`
   - **允许 Headers**：`*`
   - **暴露 Headers**：`ETag`

---

## 🔄 切换模式

系统会自动检测配置并切换模式：

| 配置状态 | 使用模式 | 说明 |
|---------|---------|------|
| ✅ 全部配置 | **Real OSS** | 生产环境，推荐 |
| ❌ 未配置 | **Mock** | 开发测试，仅本地 |

无需修改代码，只需设置环境变量即可切换！

---

## ❓ 常见问题

### Q1: 配置后仍然是 Mock 模式？

**检查清单**：
- [ ] `.env` 文件是否在 `dali-api/` 目录下
- [ ] 环境变量是否有空格（应该无空格）
- [ ] AccessKey 是否正确（注意大小写）
- [ ] Endpoint 是否包含 `https://`（不需要，去掉）
- [ ] 重启服务

### Q2: 报错 `InvalidAccessKeyId`？

- AccessKey ID 或 Secret 输入错误
- 使用了已删除的 AccessKey
- RAM 用户权限不足

### Q3: 报错 `NoSuchBucket`？

- Bucket 名称拼写错误
- Endpoint 与 Bucket 所在区域不匹配

### Q4: 上传很慢？

- 检查 Endpoint 区域，选择离你最近的
- 建议：服务器和 OSS 在同一区域，使用内网 Endpoint（免费流量）
  - 内网 Endpoint 格式：`oss-cn-hangzhou-internal.aliyuncs.com`

### Q5: 如何监控费用？

- 阿里云控制台 → 费用中心 → 账单详情
- 设置费用预警：费用中心 → 预算管理

---

## 📚 参考文档

- [OSS 快速入门](https://help.aliyun.com/document_detail/31883.html)
- [OSS Python SDK](https://help.aliyun.com/document_detail/32026.html)
- [OSS 价格计算器](https://www.aliyun.com/price/product#/oss/detail)
- [RAM 权限管理](https://help.aliyun.com/document_detail/31867.html)

---

## ✅ 配置完成！

现在你的应用已经可以使用真实的 OSS 存储了！

**下一步**：
1. 测试照片上传功能
2. 查看 OSS 控制台，确认文件已上传
3. 检查预签名 URL 是否正常工作

有问题？查看 [Issue Tracker](https://github.com/your-repo/issues) 或联系开发团队。

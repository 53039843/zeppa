# 安全指南

## 环境变量配置

为了保护敏感信息，请在部署前配置以下环境变量：

### 必需的环境变量

```bash
# 数据库配置
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

### 本地开发

1. 复制 `.env.example` 文件为 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local` 文件，填入实际的配置值

### 生产环境部署

在 Vercel 或其他平台部署时，请在环境变量设置中添加上述配置。

## 安全最佳实践

1. **不要在代码中硬编码敏感信息**
2. **定期更新依赖包**以修复安全漏洞
3. **使用 HTTPS** 保护数据传输
4. **不要记录用户密码**到日志或数据库
5. **定期进行安全审计**：`npm audit`

## 隐私保护

- 本应用不会保存用户的账号密码到数据库
- 所有用户凭证仅在内存中临时使用
- 建议用户使用强密码并定期更换

## 报告安全问题

如果发现安全漏洞，请通过 GitHub Issues 报告，我们会及时处理。

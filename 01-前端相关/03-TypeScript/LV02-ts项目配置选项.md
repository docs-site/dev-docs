---
title: LV02-ts项目配置选项
date: 2025-06-19 10:45:13
icon: famicons:logo-markdown
index: true
tags:
categories:
---

来详细了解下ts项目配置选项。

<!-- more -->

## 一、target

### 1. target选项

target” 选项用于指定 TypeScript 编译后的JavaScript代码的目标版本。通常情况下，我们会将目标版本设置为所要支持的最低版本。TypeScript 提供了多个目标版本供选择，包括 “ES3″、”ES5″、”ES2015″、”ES2016″等。如果不指定目标版本，则 TypeScript 编译器默认将目标版本设置为 “ES3″。

下面是一个示例的 tsconfig.json 文件，其中指定了目标版本为 “ES2016″：

```json
{
  "compilerOptions": {
    "target": "ES2016"
  }
}
```

在此示例中，TypeScript 编译器将会根据 ES2016 标准来编译 TypeScript 代码，生成相应的 JavaScript 代码。









> 参考资料：
>
> [TypeScript 理解 tsconfig 中的 “target” 和 “module”|极客教程](https://geek-docs.com/typescript/typescript-questions/921_typescript_understanding_target_and_module_in_tsconfig.html)

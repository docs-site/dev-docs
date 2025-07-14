---
title: LV03-扩展Markdown语法
date: 2025-07-14 14:17:05
icon: famicons:logo-markdown
index: true
tags:
categories:
---

<!-- more -->

>Tips：注意，暂不支持同类型标签嵌套使用！！！

## 一、折叠框folding

### 1. 语法说明

```markdown
{% folding [color], [text] %}
contents...
{% endfolding %}
```

### 2. 使用示例

#### 2.1 基本用法

```markdown
{% folding, 这是一个默认的折叠框 %}
默认折叠框测试
{% endfolding %}

{% folding cyan, 这是一个青色的折叠框 %}
青色的折叠框测试
{% endfolding %}

{% folding red, 这是一个红色的折叠框 %}
红色的折叠框测试
{% endfolding %}

{% folding blue, 这是一个蓝色的折叠框 %}
蓝色的折叠框测试
{% endfolding %}

{% folding purple, 这是一个紫色的折叠框 %}
紫色的折叠框测试
{% endfolding %}

{% folding green, 这是一个绿色的折叠框 %}
绿色的折叠框测试
{% endfolding %}

{% folding yellow, 这是一个黄色的折叠框 %}
黄色的折叠框测试
{% endfolding %}

{% folding orange, 这是一个橙色的折叠框 %}
橙色的折叠框测试
{% endfolding %}

```

{% folding, 这是一个默认的折叠框 %}
默认折叠框测试
{% endfolding %}

{% folding cyan, 这是一个青色的折叠框 %}
青色的折叠框测试
{% endfolding %}

{% folding red, 这是一个红色的折叠框 %}
红色的折叠框测试
{% endfolding %}

{% folding blue, 这是一个蓝色的折叠框 %}
蓝色的折叠框测试
{% endfolding %}

{% folding purple, 这是一个紫色的折叠框 %}
紫色的折叠框测试
{% endfolding %}

{% folding green, 这是一个绿色的折叠框 %}
绿色的折叠框测试
{% endfolding %}

{% folding yellow, 这是一个黄色的折叠框 %}
黄色的折叠框测试
{% endfolding %}

{% folding orange, 这是一个橙色的折叠框 %}
橙色的折叠框测试
{% endfolding %}

#### 2.2 含有代码块

{% folding orange, 这是一个橙色的折叠框 %}
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}


#### 2.3 相互嵌套

{% folding orange, 这是一个橙色的折叠框 %}
这是外层橙色折叠框的内容

{% folding red, 这是一个红色的折叠框 %}
这是内层红色折叠框的内容
{% endfolding %}

{% endfolding %}

## 二、行内标签

```markdown
这是一个带 {% u 下划线 %} 的文本
这是一个带 {% emp 着重号 %} 的文本
这是一个带 {% wavy 波浪线 %} 的文本
这是一个带 {% del 删除线 %} 的文本
这是一个键盘样式的文本 {% kbd command %} + {% kbd D %}
这是一个密码样式的文本：{% psw 密码是没有密码 %}
```

这是一个带 {% u 下划线 %} 的文本

这是一个带 {% emp 着重号 %} 的文本

这是一个带 {% wavy 波浪线 %} 的文本

这是一个带 {% del 删除线 %} 的文本

这是一个键盘样式的文本 {% kbd command %} + {% kbd D %}

这是一个密码样式的文本：{% psw 密码是没有密码 %}


## 三、tabs标签

### 1. 语法说明

```markdown
{% tabs Unique name, [index] %}
<!-- tab [Tab caption] -->
Any content (support inline tags too).
<!-- endtab -->
{% endtabs %}

```

### 2. 使用示例

#### 2.1 最简单的示例

```markdown
{% tabs 第1个选项卡 %}
<!-- tab -->
**这是选项卡1的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡2的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡3的内容**
<!-- endtab -->
{% endtabs %}
```

{% tabs 第1个选项卡 %}
<!-- tab -->
**这是选项卡1的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡2的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡3的内容**
<!-- endtab -->
{% endtabs %}


#### 2.2 默认选中第三个选项卡

```markdown
{% tabs 第二个选项卡, 2 %}
<!-- tab -->
**这是选项卡1的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡2的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡3的内容**
<!-- endtab -->
{% endtabs %}
```

{% tabs 第二个选项卡, 2 %}
<!-- tab -->
**这是选项卡1的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡2的内容**
<!-- endtab -->

<!-- tab -->
**这是选项卡3的内容**
<!-- endtab -->
{% endtabs %}

#### 2.3 指定每个选项卡显示名称

```markdown
{% tabs 第三个选项卡, 1%}
<!-- tab Name1 -->
**这是选项卡1的内容**
<!-- endtab -->

<!-- tab Name2 -->
**这是选项卡2的内容**
<!-- endtab -->

<!-- tab Name3 -->
**这是选项卡3的内容**
<!-- endtab -->

<!-- tab 选项卡4 -->
**这是选项卡4的内容**
<!-- endtab -->

{% endtabs %}
```

{% tabs 第三个选项卡, 1%}
<!-- tab Name1 -->
**这是选项卡1的内容**
<!-- endtab -->

<!-- tab Name2 -->
**这是选项卡2的内容**
<!-- endtab -->

<!-- tab Name3 -->
**这是选项卡3的内容**
<!-- endtab -->

<!-- tab 选项卡4 -->
**这是选项卡4的内容**
<!-- endtab -->

{% endtabs %}


#### 2.4 带代码块的tabs

{% tabs 第四个选项卡, 1%}
<!-- tab C -->
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```

<!-- endtab -->

<!-- tab CPP -->
```c++
#include <iostream>

int main(int argc, const char* argv[])
{
    std::cout << "hello,world!" << std::endl;
    return 0;
}
```
<!-- endtab -->

<!-- tab Python -->
```python
def sum(a, b):
    return a + b
```
<!-- endtab -->

<!-- tab JavaScript-->
```javascript
(function() {
    console.log("Hello, World!");
})();
```
<!-- endtab -->

{% endtabs %}


## 四、互相嵌套

### 1. folding与行内标签

```markdown
{% folding orange, 这是一个橙色的折叠框 %}
这是一个带 {% u 下划线 %} 的文本
这是一个带 {% emp 着重号 %} 的文本
这是一个带 {% wavy 波浪线 %} 的文本
这是一个带 {% del 删除线 %} 的文本
这是一个键盘样式的文本 {% kbd command %} + {% kbd D %}
这是一个密码样式的文本：{% psw 密码是没有密码 %}
{% endfolding %}
```

{% folding orange, 这是一个橙色的折叠框 %}
- 这是一个带 {% u 下划线 %} 的文本

- 这是一个带 {% emp 着重号 %} 的文本

- 这是一个带 {% wavy 波浪线 %} 的文本

- 这是一个带 {% del 删除线 %} 的文本

- 这是一个键盘样式的文本 {% kbd command %} + {% kbd D %}

- 这是一个密码样式的文本：{% psw 密码是没有密码 %}
{% endfolding %}

### 2. tabs与行内标签

```markdown
{% tabs 第五个选项卡%}
<!-- tab 下划线 -->
这是一个带 {% u 下划线 %} 的文本
<!-- endtab -->

<!-- tab 着重号 -->
这是一个带 {% emp 着重号 %} 的文本
<!-- endtab -->

<!-- tab 波浪线 -->
这是一个带 {% wavy 波浪线 %} 的文本
<!-- endtab -->

<!-- tab 删除线 -->
这是一个带 {% del 删除线 %} 的文本
<!-- endtab -->

<!-- tab 键盘样式 -->
这是一个键盘样式的文本 {% kbd command %} + {% kbd D %}
<!-- endtab -->

<!-- tab 密码样式 -->
这是一个密码样式的文本：{% psw 密码是没有密码 %}
<!-- endtab -->

{% endtabs %}
```

{% tabs 第五个选项卡%}
<!-- tab 下划线 -->
这是一个带 {% u 下划线 %} 的文本
<!-- endtab -->

<!-- tab 着重号 -->
这是一个带 {% emp 着重号 %} 的文本
<!-- endtab -->

<!-- tab 波浪线 -->
这是一个带 {% wavy 波浪线 %} 的文本
<!-- endtab -->

<!-- tab 删除线 -->
这是一个带 {% del 删除线 %} 的文本
<!-- endtab -->

<!-- tab 键盘样式 -->
这是一个键盘样式的文本 {% kbd command %} + {% kbd D %}
<!-- endtab -->

<!-- tab 密码样式 -->
这是一个密码样式的文本：{% psw 密码是没有密码 %}
<!-- endtab -->

{% endtabs %}

### 3. tabs与folding

#### 3.1 tabs中嵌套folding

{% tabs 第六个选项卡%}
<!-- tab 默认 -->
{% folding, 这是一个默认的折叠框 %}
默认折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 青色 -->
{% folding cyan, 这是一个青色的折叠框 %}
青色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 红色 -->
{% folding red, 这是一个红色的折叠框 %}
红色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 蓝色 -->
{% folding blue, 这是一个蓝色的折叠框 %}
蓝色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 紫色 -->
{% folding purple, 这是一个紫色的折叠框 %}
紫色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 绿色 -->
{% folding green, 这是一个绿色的折叠框 %}
绿色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 黄色 -->
{% folding yellow, 这是一个黄色的折叠框 %}
黄色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

<!-- tab 橙色 -->
{% folding orange, 这是一个橙色的折叠框 %}
橙色的折叠框测试
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```
{% endfolding %}
<!-- endtab -->

{% endtabs %}

#### 3.2 folding中嵌套tabs

{% folding orange, 这是一个橙色的折叠框 %}

{% tabs 第七个选项卡, 1%}
<!-- tab C -->
```c
#include <stdio.h>

int main(int argc, const char *argv[])
{
	printf("hello,world!\n");
	return 0;
}
```

<!-- endtab -->

<!-- tab CPP -->
```c++
#include <iostream>

int main(int argc, const char* argv[])
{
    std::cout << "hello,world!" << std::endl;
    return 0;
}
```
<!-- endtab -->

<!-- tab Python -->
```python
def sum(a, b):
    return a + b
```
<!-- endtab -->

<!-- tab JavaScript-->
```javascript
(function() {
    console.log("Hello, World!");
})();
```
<!-- endtab -->

{% endtabs %}

{% endfolding %}

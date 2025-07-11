---
title: LV09-与C中不同的const
date: 2025-07-11 14:39:39
icon: famicons:logo-markdown
index: true
tags:
categories:
---

C++中的const和C中的const是不太一样的，下面就来看一下吧。

<!-- more -->


在C语言中，const  用来限制一个变量，表示这个变量不能被修改，我们通常称这样的变量为常量（Constant）。在C++中，const 的含义并没有改变，只是对细节进行了一些调整。

## 一、更像是#define?

先来看下面的两条语句：

```c++
const int m = 10;
int n = m;
```

我们知道，变量是要占用内存的，即使被 const 修饰也不例外。m、n 两个变量占用不同的内存，int n = m;表示将 m 的值赋给 n，这个赋值的过程在C和C++中是有区别的。

在C语言中，编译器会先到 m 所在的内存取出一份数据，再将这份数据赋给 n；而在C++中，编译器会直接将 10 赋给 n，没有读取内存的过程，和int n = 10;的效果一样。C++ 中的常量更类似于#define命令，是一个值替换的过程，只不过#define是在预处理阶段替换，而常量是在编译阶段替换。

C++ 对 const 的处理少了读取内存的过程，优点是提高了程序执行效率，缺点是不能反映内存的变化，一旦 const 变量被修改，C++ 就不能取得最新的值。如下示例：

```c
#include <stdio.h>
int main()
{
    const int n = 10;
    int      *p = (int *)&n;
    printf("n=%d\n", n);
    *p = 99;                 // 修改const变量的值
    printf("n=%d\n", n);
    return 0;
}

```

> 注意，`&n`得到的指针的类型是`const int *`，必须强制转换为`int *`后才能赋给 p，否则类型是不兼容的。

将代码放到`.c`文件中，以C语言的方式编译，运行结果为`99`。再将代码放到`.cpp`文件中，以C++的方式编译，运行结果就变成了`10`。这种差异正是由于C和C++对 const 的处理方式不同造成的。

在C语言中，使用 printf 输出 n 时会到内存中获取 n 的值，这个时候 n 所在内存中的数据已经被修改成了 99，所以输出结果也是 99。而在C++中，`printf("%d\n", n);`语句在编译时就将 n 的值替换成了 10，效果和`printf("%d\n", 10);`一样，不管 n 所在的内存如何变化，都不会影响输出结果。

当然，这种修改常量的代码在实际开发中基本不会出现，这里只是为了说明C和C++对 const 的处理方式的差异：C语言对 const 的处理和普通变量一样，会到内存中读取数据；C++ 对 const 的处理更像是编译时期的`#define`，是一个值替换的过程。

>Tips：#define 定义的常量仅仅是字符串的替换，不会进行类型检查，而 const 定义的常量是有类型的，编译器会进行类型检查，相对来说比 #define 更安全，所以鼓励使用 const 代替 #define。

## 二、全局 const 变量的可见范围

### 1. C语言中的const全局变量

我们知道，普通全局变量的作用域是当前文件，但是在其他文件中也是可见的，使用`extern`声明后就可以使用。

- main.c

```c
#include <stdio.h>

int n = 10;
void func();

int main()
{
    func();
    printf("main: %d\n", n);
    return 0;
}
```

- func.c

```c
#include <stdio.h>

extern int n;

void func()
{
    printf("module: %d\n", n);
}
```

编译之后，运行结果如下：

```shell
module: 10
main: 10
```

在C语言中，const 变量和普通变量一样，在其他源文件中也是可见的。我们可以修改 main.c 如下：

```c
#include <stdio.h>

const int n = 10;
void func();

int main()
{
    func();
    printf("main: %d\n", n);
    return 0;
}
```

修改后的代码仍然能够正确编译，运行结果和上面也是一样的。这说明**C语言中的 const 变量在多文件编程时的表现和普通变量一样，除了不能修改，没有其他区别。**

### 2. C++中的const全局变量

但是如果按照C++的方式编译（将源文件后缀设置为`.cpp`），修改后的代码就是错误的。这是因为 C++ 对 const 的特性做了调整，C++ 规定，全局 const 变量的作用域仍然是当前文件，但是它在其他文件中是不可见的，这和添加了`static`关键字的效果类似。

- main.cpp

```c++
#include <stdio.h>

const int n = 10;
void func();

int main()
{
    func();
    printf("main: %d\n", n);
    return 0;
}
```

- func.cpp

```c++
#include <stdio.h>

extern int n;

void func()
{
    printf("module: %d\n", n);
}
```

虽然func.cpp中使用 extern 声明了变量 n，但是在链接时却找不到main.cpp中的 n。由于 C++ 中全局 const 变量的可见范围仅限于当前源文件，所以可以将它放在头文件中，这样即使头文件被包含多次也不会出错。

- func.h

```c++
const int n = 10;
void func();
```

- func.cpp

```c++
#include <iostream>
#include "func.h"

void func()
{
    std::cout << "This is func!n=" << n << std::endl;
}
```

- main.cpp

```c++
#include <iostream>
#include "func.h"

using namespace std;

int main()
{
    func();
    cout << "This is main!n=" << n << endl;

    return 0;
}
```

### 3. 总结

C和C++中全局 const 变量的作用域相同，都是当前文件，不同的是它们的可见范围：C语言中 const 全局变量的可见范围是整个程序，在其他文件中使用 extern 声明后就可以使用；而C++中 const 全局变量的可见范围仅限于当前文件，在其他文件中不可见，所以它可以定义在头文件中，多次引入后也不会出错。
---
title: LV16-C++函数的重载
date: 2025-07-11 16:06:42
icon: famicons:logo-markdown
index: true
tags:
categories:
---

来了解一下C++中函数的重载。

<!-- more -->

## 一、什么是函数重载

### 1. 基本概念

在实际开发中，有时候我们需要实现几个功能类似的函数，只是有些细节不同。例如希望交换两个变量的值，这两个变量有多种类型，可以是 int、float、char、bool 等，我们需要通过参数把变量的地址传入函数内部。在C语言中，我们往往需要分别设计出三个不同名的函数，其函数原型与下面类似：

```c
void swap1(int *a, int *b);      //交换 int 变量的值
void swap2(float *a, float *b);  //交换 float 变量的值
void swap3(char *a, char *b);    //交换 char 变量的值
void swap4(bool *a, bool *b);    //交换 bool 变量的值
```

但在C++中，这完全没有必要。C++ 允许多个函数拥有相同的名字，只要它们的参数列表不同就可以，这就是**函数的重载（Function Overloading）**。借助重载，一个函数名可以有多种用途。

> Tips：参数列表又叫参数签名，包括参数的类型、参数的个数和参数的顺序，只要有一个不同就叫做参数列表不同。

### 2. 一个实例

如下所示，我们定义Swap函数来交换不同数据类型变量的值。这里之所以使用`Swap`这个函数名，而不是使用`swap`，是因为 C++ 标准库已经提供了交换两个变量的值的函数，它的名字就是`swap`，位于`algorithm`头文件中，为了避免和标准库中的`swap`冲突，这里将`S`大写。

```c++
#include <iostream>
using namespace std;
// 交换 int 变量的值
void Swap(int *a, int *b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}
// 交换 float 变量的值
void Swap(float *a, float *b)
{
    float temp = *a;
    *a = *b;
    *b = temp;
}
// 交换 char 变量的值
void Swap(char *a, char *b)
{
    char temp = *a;
    *a = *b;
    *b = temp;
}
// 交换 bool 变量的值
void Swap(bool *a, bool *b)
{
    char temp = *a;
    *a = *b;
    *b = temp;
}

int main()
{
    // 交换 int 变量的值
    int n1 = 100, n2 = 200;
    Swap(&n1, &n2);
    cout << n1 << ", " << n2 << endl;

    // 交换 float 变量的值
    float f1 = 12.5, f2 = 56.93;
    Swap(&f1, &f2);
    cout << f1 << ", " << f2 << endl;

    // 交换 char 变量的值
    char c1 = 'A', c2 = 'B';
    Swap(&c1, &c2);
    cout << c1 << ", " << c2 << endl;

    // 交换 bool 变量的值
    bool b1 = false, b2 = true;
    Swap(&b1, &b2);
    cout << b1 << ", " << b2 << endl;

    return 0;
}

```

重载就是在一个作用范围内（同一个类、同一个命名空间等）有多个名称相同但参数不同的函数。重载的结果是让一个函数名拥有了多种用途，使得命名更加方便（在中大型项目中，给变量、函数、类起名字是一件让人苦恼的问题），调用更加灵活。

### 3. 重载规则

函数的重载的规则：

- 函数名称必须相同。
- 参数列表必须不同（个数不同、类型不同、参数排列顺序不同等）。
- 函数的返回类型可以相同也可以不相同。
- 仅仅返回类型不同不足以成为函数的重载。

注意，参数列表不同包括参数的个数不同、类型不同或顺序不同，仅仅参数名称不同是不可以的。函数返回值也不能作为重载的依据。

### 4. 怎么做到重载的？

C++代码在编译时会根据参数列表对函数进行重命名，例如`void Swap(int a, int b)`会被重命名为`_Swap_int_int`，`void Swap(float x, float y)`会被重命名为`_Swap_float_float`。当发生函数调用时，编译器会根据传入的实参去逐个匹配，以选择对应的函数，如果匹配失败，编译器就会报错，这叫做**重载决议（Overload Resolution）**。

> 不同的编译器有不同的重命名方式，这里仅仅举例说明，实际情况可能并非如此。

从这个角度讲，函数重载仅仅是语法层面的，本质上它们还是不同的函数，占用不同的内存，入口地址也不一样。

## 二、二义性和类型转换

前面我们知道，发生函数调用时编译器会根据传入的实参的个数、类型、顺序等信息去匹配要调用的函数，这在大部分情况下都能够精确匹配。但当实参的类型和形参的类型不一致时情况就会变得稍微复杂，例如函数形参的类型是`int`，调用函数时却将`short`类型的数据交给了它，编译器就需要先将`short`类型转换为`int`类型才能匹配成功。

### 1. 一个实例

#### 1.1 实例1

先看一个实例：

```c++
#include <iostream>
using namespace std;
// 1号函数
void func(char ch)
{
    cout << "#1 " << ch << endl;
}
// 2号函数
void func(int n)
{
    cout << "#2 " << n << endl;
}

// 3号函数
void func(long m)
{
    cout << "#3 " << m << endl;
}
// 4号函数
void func(double f)
{
    cout << "#4 " << f << endl;
}
int main()
{
    short s = 99;
    float f = 84.6;

    func('a'); //不需要类型转换，调用func(char)
    func(s);   //将short转换成int，调用func(int)
    func(49);  //不需要类型转换，调用func(int)
    func(f);   //将float转换成double，调用func(double)
    return 0;
}

```

这个实例，我们运行后有如下打印信息：

```shell
#1 a
#2 99
#2 49
#4 84.6
```

#### 1.2 实例2

我们现在把2号函数去掉：

```c
#include <iostream>
using namespace std;
// 1号函数
void func(char ch)
{
    cout << "#1 " << ch << endl;
}

// 3号函数
void func(long m)
{
    cout << "#3 " << m << endl;
}
// 4号函数
void func(double f)
{
    cout << "#4 " << f << endl;
}
int main()
{
    short s = 99;
    float f = 84.6;

    func('a'); //不需要类型转换，调用func(char)
    func(s);   //将short转换成int，调用func(int)
    func(49);  //不需要类型转换，调用func(int)
    func(f);   //将float转换成double，调用func(double)
    return 0;
}

```

然后就会得到以下报错：

```shell
/xxx/cpp-dev/02_C_To_C++/11_function_overloading/02_data_type_conversion/app_demo.cpp: In function ‘int main()’:
/xxx/work/cpp-dev/02_C_To_C++/11_function_overloading/02_data_type_conversion/app_demo.cpp:36:11: error: call of overloaded ‘func(short int&)’ is ambiguous
     func(s);   //将short转换成int，调用func(int)
           ^
/xxx/cpp-dev/02_C_To_C++/11_function_overloading/02_data_type_conversion/app_demo.cpp:37:12: error: call of overloaded ‘func(int)’ is ambiguous
     func(49);  //不需要类型转换，调用func(int)
            ^

```

这段代码在编译时发生了错误，大概的意思是：`func(s)`和`func(49)`这两个函数发生调用错误，它们可以匹配三个重载函数中的任何一个，编译器不知道如何抉择。

### 2. 重载决议优先级

据以往的编程经验，s 和 49 不都应该被转换成 long 类型，从而匹配3号函数`void func(long m)`吗？这种推论在一般的函数调用或者四则运算中确实没错，但它不一定适用于重载函数！

C++ 标准规定，在进行重载决议时编译器应该按照下面的优先级顺序来处理实参的类型：

<table>
	<tbody>
		<tr>
			<th width="110" align="center">优先级</th>
			<th width="180" align="center">包含的内容</th>
			<th  align="center">举例说明</th>
		</tr>
		<tr>
			<td rowspan="2">精确匹配</td>
			<td>不做类型转换，直接匹配</td>
			<td>（暂无说明）</td>
		</tr>
		<tr>
			<td>只是做微不足道的转换</td>
			<td>从数组名到数组指针、从函数名到指向函数的指针、从非 const 类型到 const 类型。</td>
		</tr>
		<tr>
			<td rowspan="2">类型提升后匹配</td>
			<td>整型提升</td>
			<td>从 bool、char、short 提升为 int，或者从 char16_t、char32_t、wchar_t 提升为 int、long、long long。</td>
		</tr>
		<tr>
			<td>小数提升</td>
			<td>从 float 提升为 double。</td>
		</tr>
		<tr>
			<td rowspan="4">使用自动类型转换后匹配</td>
			<td>整型转换</td>
			<td>从 char&nbsp;到 long、short 到 long、int 到 short、long 到 char。</td>
		</tr>
		<tr>
			<td>小数转换</td>
			<td>从 double 到 float。</td>
		</tr>
		<tr>
			<td>整数和小数转换</td>
			<td>从 int 到 double、short 到 float、float 到 int、double 到 long。</td>
		</tr>
		<tr>
			<td>指针转换</td>
			<td>从 int * 到 void *。</td>
		</tr>
	</tbody>
</table>

C++ 标准还规定，编译器应该按照从高到低的顺序来搜索重载函数，首先是精确匹配，然后是类型提升，最后才是类型转换；一旦在某个优先级中找到唯一的一个重载函数就匹配成功，不再继续往下搜索。

如果在一个优先级中找到多个（两个以及以上）合适的重载函数，编译器就会陷入两难境地，不知道如何抉择，编译器会将这种模棱两可的函数调用视为一种错误，因为这些合适的重载函数同等“优秀”，没有一个脱颖而出，调用谁都一样。这就是函数重载过程中的**二义性错误**。

在实例1中，`func('a')`、`func(49)`分别和`void func(char)`、`void func(int)`精确匹配；`func(s)`没有精确匹配的重载函数，编译器将 s 的类型提升为 int 后和`void func(int)`匹配成功；`func(f)`也是类似的道理，将 f 提升为 double 类型后和`void func(double)`匹配成功。

在实例2中，`func(s)`、`func(49)`没有精确匹配的重载函数，将它们的类型都提升为 int 后仍然不能匹配，接下来进入自动类型转换阶段，发现 s 被转换为 char（整型转换）、long（整型转换）、double（整数和小数转换）后都有比较合适的函数，而且它们在同一个优先级中，谁也不比谁优秀，调用哪个都一样，产生了二义性，所以编译器会报错。

> Tips：注意，类型提升和类型转换不是一码事！类型提升是积极的，是为了更加高效地利用计算机硬件，不会导致数据丢失或精度降低；而类型转换是不得已而为之，不能保证数据的正确性，也不能保证应有的精度。类型提升只有上表中列出的几种情况，其他情况都是类型转换。

### 3. 多个参数时的二义性

当重载函数有多个参数时也会产生二义性，而且情况更加复杂。C++ 标准规定，如果有且只有一个函数满足下列条件，则匹配成功：

- 该函数对每个实参的匹配都不劣于其他函数；
- 至少有一个实参的匹配优于其他函数。

假设现在有以下几个函数原型：

```c++
void func(int, int);             //①
void func(char, int, float);     //②
void func(char, long, double);   //③
```

我们来分析如下的调用会发生什么情况：

```c++
short n = 99;
func('@', n, 99);
func('@', n, 99.5);
```

函数原型`func(int, int)`只有两个参数，而函数调用有三个参数，很容易看出来不匹配，在初次筛选时就会被过滤掉，接下来我们只讨论②③个函数原型。

(1) 先来看第一个函数调用。如果只考虑第一个实参`'@'`，那么②③两个函数都能够精确匹配，谁也不比谁优秀，是平等的；如果只考虑第二个实参`n`，对于②，需要把 short 提升为 int（类型提升），对于③，需要把 short 转换为 long（类型转换），类型提升的优先级高于类型转换，所以②胜出；如果只考虑第三个实参`99`，②③都要进行类型转换，没有哪一个能胜出，它们是平等的。

从整体上看，②③在第一、三个实参的匹配中是平等的，但②在第二个实参的匹配中胜出，也就是说，②对每个实参的匹配都不劣于③，但有一个实参的匹配优于③，所以②最终脱颖而出，成为被调用函数。

(2) 再来看第二个函数调用。只考虑第一个实参时②③是平等的，没有谁胜出；只考虑第二个实参时②胜出；只考虑第三个实参时，②需要类型转换，③能够精确匹配，精确匹配的优先级高于类型转换，所以③胜出。

从整体上看，②③在第一个实参的匹配中是平等的，②在第二个实参的匹配中胜出，③在第三个实参的匹配中胜出，它们最终“打成了平手”，分不清孰优孰劣，所以编译器不知道如何抉择，会产生二义性错误。

---
title: LV10-const与类和对象.md
date: 2025-07-22 13:52:16
icon: famicons:logo-markdown
index: true
tags:
categories:
---

这部分来了解一下c++中的静态成员变量和函数。

<!-- more -->

在类中，如果不希望某些数据被修改，可以使用`const`关键字加以限定。const 可以用来修饰成员变量和成员函数。

## 一、const成员变量

### 1. 怎么定义

const 成员变量的用法和普通 const 变量的用法相似，只需要在声明时加上 const 关键字。

```cpp
class student_t {
  public:
    const char *m_name;
    const int   m_age;
    float       m_score;

  public:
    student_t(const char *name, const int age, float score);
    void show();
};
```

### 2. 怎么初始化

初始化 const 成员变量只有一种方法，就是通过构造函数的初始化列表：

```cpp
student_t::student_t(const char *name, const int age, float score) : m_name(name), m_age(age), m_score(score)
{
}
```

需要知道的是`const char *name`这行中，const修饰的是name指向的数据，指针是可以重新赋值的，但是指针指向的内容，也就是name指向的内容无法修改。

### 3. 一个demo

```cpp
#include <iostream>
using namespace std;

class student_t {
  public:
    const char *m_name;
    const int   m_age;
    float       m_score;

  public:
    student_t(const char *name, const int age, float score);
    void show();
};

student_t::student_t(const char *name, const int age, float score) : m_name(name), m_age(age), m_score(score)
{
}
void student_t::show()
{
    cout << m_name << "的年龄是" << m_age << "，成绩是" << m_score << endl;
}

int main()
{
    // 创建匿名对象
    (new student_t("小明", 15, 90))->show();
    return 0;
}

```



## 二、常成员函数

### 1. 什么是常成员函数

const 成员函数可以使用类中的所有成员变量，但是不能修改它们的值，这种措施主要还是为了保护数据而设置的。const 成员函数也称为常成员函数。

我们通常将 get 函数设置为常成员函数。读取成员变量的函数的名字通常以`get`开头，后跟成员变量的名字，所以通常将它们称为 get 函数。

### 2. 怎么定义？

常成员函数需要在声明和定义的时候在**函数头部的结尾**加上 const 关键字:

```cpp
class student_t {
  public:
    const char *m_name;
    const int   m_age;
    float       m_score;

  public:
    student_t(const char *name, const int age, float score);
    void show();
    // 声明常成员函数
    const char *getname() const;
    int         getage() const;
    float       getscore() const;
};

student_t::student_t(const char *name, const int age, float score) : m_name(name), m_age(age), m_score(score)
{
}
void student_t::show()
{
    cout << m_name << "的年龄是" << m_age << "，成绩是" << m_score << endl;
}

// 定义常成员函数
const char *student_t::getname() const
{
    return m_name;
}
int student_t::getage() const
{
    return m_age;
}
float student_t::getscore() const
{
    return m_score;
}
```

getname()、getage()、getscore() 三个函数的功能都很简单，仅仅是为了获取成员变量的值，没有任何修改成员变量的企图，所以我们加了 const 限制，这是一种保险的做法，同时也使得语义更加明显。

> 需要强调的是，必须在成员函数的声明和定义处同时加上 const 关键字。`char *getname() const`和`char *getname()`是两个不同的函数原型，如果只在一个地方加 const 会导致声明和定义处的函数原型冲突。

### 3. const位置

- 函数开头的 const 用来修饰函数的返回值，表示返回值是 const 类型，也就是不能被修改，例如`const char * getname()`。
- 函数头部的结尾加上 const 表示常成员函数，这种函数只能读取成员变量的值，而不能修改成员变量的值，例如`char * getname() const`。

## 三、const对象

### 1. 常对象

const 也可以用来修饰对象，称为常对象。一旦将对象定义为常对象之后，就只能调用类的 const 成员（包括 const 成员变量和 const 成员函数）了。

### 2. 怎么定义？

定义常对象的语法和定义常量的语法类似：

```cpp
const class object(params);
class const object(params);
```

也可以定义 const 指针

```cpp
const class *p = new class(params);
class const *p = new class(params);
```

`class`为类名，`object`为对象名，`params`为实参列表，`p`为指针名。两种方式定义出来的对象都是常对象。一旦将对象定义为常对象之后，不管是哪种形式，该对象就只能访问被 const 修饰的成员了（包括 const 成员变量和 const 成员函数），因为非 const 成员可能会修改对象的数据（编译器也会这样假设），C++禁止这样做。

### 3. 一个实例

```cpp
#include <iostream>
using namespace std;

class student_t {
  private:
    const char *m_name;
    int         m_age;
    float       m_score;

  public:
    student_t(const char *name, int age, float score);

  public:
    void  show();
    const char *getname() const;
    int   getage() const;
    float getscore() const;
};

student_t::student_t(const char *name, int age, float score) : m_name(name), m_age(age), m_score(score)
{
}
void student_t::show()
{
    cout << m_name << "的年龄是" << m_age << "，成绩是" << m_score << endl;
}
const char *student_t::getname() const
{
    return m_name;
}
int student_t::getage() const
{
    return m_age;
}
float student_t::getscore() const
{
    return m_score;
}

int main()
{
    const student_t stu("小明", 15, 90.6);
    // stu.show();  //error
    cout << stu.getname() << "的年龄是" << stu.getage() << "，成绩是" << stu.getscore() << endl;

    const student_t *pstu = new student_t("李磊", 16, 80.5);
    // pstu -> show();  //error
    cout << pstu->getname() << "的年龄是" << pstu->getage() << "，成绩是" << pstu->getscore() << endl;

    return 0;
}
```


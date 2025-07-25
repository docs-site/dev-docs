---
title: LV08-this指针.md
date: 2025-07-21 18:50:40
icon: famicons:logo-markdown
index: true
tags:
categories:
---

来详细了解一下this指针。

<!-- more -->

## 一、this指针

### 1. 形参与成员变量同名?

我们要是定义了这样一个类，类中的成员变量名和成员函数的形参名称相同了：

```cpp
class student_t {
  private: // 私有的
    const char *name;
    int         age;
    float       score;

  public: // 共有的
    // 声明普通成员函数
    void setname(const char *name);
    void setage(int age);
    void setscore(float score);
    void show();
};
```

我们为这几个变量赋值的函数内部就要写成这样：

```cpp
// 成员函数的定义
void student_t::setname(const char *name)
{
    name = name;
}
void student_t::setage(int age)
{
    age = age;
}
void student_t::setscore(float score)
{
    score = score;
}
```

这样就无法区分等号左边是形参name还是类的成员变量name。这个时候，就可以通过this来区分：

```cpp
// 成员函数的定义
void student_t::setname(const char *name)
{
    this->name = name;
}
void student_t::setage(int age)
{
    this->age = age;
}
void student_t::setscore(float score)
{
    this->score = score;
}
```

### 2. this指针是什么？

`this` 指针是一个特殊的指针，它指向调用成员函数的那个对象。在非静态成员函数内部，可以使用 `this` 指针访问调用对象的成员。在类的非静态成员函数中可返回对象本身，可使用 `return *this`。

本质上，`this` 指针是编译器隐式提供的，我们并不需要定义它，但我们可以在成员函数内部使用它。

### 3. 是什么类型？

其实通过概念我们就可以知道，`this` 实际上是当前类类型的指针，例如，对于类 `student_t` 的成员函数，`this` 是 `student_t *` 类型的指针。我们写个demo打印一下：

```cpp
#include <iostream>
#include <typeinfo>
#include <cstddef>  // For nullptr

using namespace std;

class student_t {
  private: // 私有的
    const char *name;
    int         age;
    float       score;

  public: // 共有的
    // 声明普通成员函数
    void setname(const char *name);
    void setage(int age);
    void setscore(float score);
    void show();
};

// 成员函数的定义
void student_t::setname(const char *name)
{
    this->name = name;
}
void student_t::setage(int age)
{
    this->age = age;
}
void student_t::setscore(float score)
{
    this->score = score;
}

void student_t::show()
{
    // Note: typeof is not standard C++, we use typeid from <typeinfo> instead
    // typeid(this).name() returns a compiler-dependent mangled type name
    cout << "this pointer type (via typeid): " << typeid(this).name() << endl;
    
    if (name == nullptr || age <= 0)
    {
        cout << "成员变量还未初始化" << endl;
    }
    else
    {
        cout << name << "的年龄是" << age << "，成绩是" << score << endl;
    }
}

int main()
{
    // 调用构造函数 Student(char *, int, float)
    student_t stu;
    cout << "student_t object type: " << typeid(stu).name() << endl;
    stu.show();

    stu.setname("sumu");
    stu.setage(18);
    stu.setscore(98.5);
    stu.show();

    student_t *p_stu = new student_t;
    cout << "p_stu type: " << typeid(p_stu).name() << endl;

    p_stu->show();
    p_stu->setname("xiaoming");
    p_stu->setage(16);
    p_stu->setscore(95.5);
    p_stu->show();
    delete p_stu;
    return 0;
}
```

我们会得到以下输出信息：

```cpp
student_t object type: 9student_t
this pointer type (via typeid): P9student_t
成员变量还未初始化
this pointer type (via typeid): P9student_t
sumu的年龄是18，成绩是98.5
p_stu type: P9student_t
this pointer type (via typeid): P9student_t
成员变量还未初始化
this pointer type (via typeid): P9student_t
xiaoming的年龄是16，成绩是95.5
```

可以看到student_t的类型是9student_t，this的类型是P9student_t，而我们定义的student_t类型的指针也是P9student_t。

### 4. 可以在哪里使用？

`this` 指针可以在类的所有非静态成员函数中使用，包括构造函数和析构函数。我们可以使用 `this` 指针来访问成员变量和成员函数。

```cpp
#include <iostream>
#include <typeinfo>
#include <cstddef>  // For nullptr

using namespace std;

class student_t {
  private: // 私有的
    const char *name;
    int         age;
    float       score;

  public: // 共有的
    student_t(const char *name, const int age, float score);
    ~student_t();
    void show();
};

// 构造函数
student_t::student_t(const char *name, const int age, float score)
{
    this->name = name;
    this->age = age;
    this->score = score;
    cout << "[student_t()] this pointer type (via typeid): " << typeid(this).name() << "."
         << this->name << "的年龄是" << this->age << "，成绩是" << this->score << endl;
}

// 析构函数
student_t::~student_t()
{
    cout << "[~student_t()] this pointer type (via typeid): " << typeid(this).name() << "."
         << this->name << "的年龄是" << this->age << "，成绩是" << this->score << endl;
}

void student_t::show()
{
    // Note: typeof is not standard C++, we use typeid from <typeinfo> instead
    // typeid(this).name() returns a compiler-dependent mangled type name
    cout << "[show()] this pointer type (via typeid): " << typeid(this).name() << "."
         << this->name << "的年龄是" << this->age << "，成绩是" << this->score << endl;
}

int main()
{
    // 调用构造函数 Student(char *, int, float)
    student_t stu("sumu", 18, 98.9);
    stu.show();

    return 0;
}
```

可以看到以下输出信息：

```bash
[student_t()] this pointer type (via typeid): P9student_t.sumu的年龄是18，成绩是98.9
[show()] this pointer type (via typeid): P9student_t.sumu的年龄是18，成绩是98.9
[~student_t()] this pointer type (via typeid): P9student_t.sumu的年龄是18，成绩是98.9
```

## 二、实际应用

### 1. 解决变量名冲突

就是前面形参和变量名冲突时可以通过this指针区分。

### 2. 链式调用

链式调用是一种编程技巧，可以使代码更加紧凑和易读。它通过在每个成员函数中返回 `*this`，使得多个成员函数调用可以在同一行内连续进行。例如：

```cpp
#include <iostream>
using namespace std;

class calculator_t {
  public:
    int value;

  public:
    calculator_t();
    calculator_t &add(int num);
    calculator_t &multiply(int num);
};

calculator_t::calculator_t() : value(0)
{
}

// 返回一个指向当前对象的引用
calculator_t &calculator_t::add(int num)
{
    this->value += num; // 将传递的参数 num 与成员变量value相加
    return *this;       // 返回指向当前对象的引用
}

calculator_t &calculator_t::multiply(int num)
{
    this->value *= num; // 将传递的参数 num 与成员变量value相乘
    return *this;       // 返回指向当前对象的引用
}

int main()
{
    calculator_t calc;
    calc.add(5).multiply(2).add(10); // 链式调用

    cout << "Result: " << calc.value << endl; // 输出: 20 (5+5)*2+10
    return 0;
}

```

### 3. 拷贝构造函数和赋值操作符

`this` 指针在拷贝构造函数和赋值操作符中也扮演着重要的角色。在这些函数中，我们通常需要检查传入的对象是否就是当前对象（即，是否是自我赋值）。如果是，则应避免进行可能导致错误的自我赋值。例如：

```cpp
class buffer_t {
  private:
    int *data; // 指向动态分配内存的指针
    int  size; // 缓冲区大小

  public:
    buffer_t &operator=(const buffer_t &other) // 赋值操作符重载函数 
    {
        // 检查自赋值
        if (this == &other)
        {
            cout << "检测到自赋值，跳过操作" << endl;
            return *this;
        }

        delete[] data; // 释放原有内存

        size = other.size;    // 设置新大小
        data = new int[size]; // 分配新内存
        for (int i = 0; i < size; i++)
        {
            data[i] = other.data[i]; // 拷贝数据
        }
        cout << "赋值操作: 拷贝了 " << size << " 个int数据" << endl;
        return *this; // 返回当前对象引用
    }
};
```

完整示例如下：

```cpp
#include <iostream>
using namespace std;

class buffer_t {
  private:
    int *data; // 指向动态分配内存的指针
    int  size; // 缓冲区大小

  public:
    buffer_t(int s); // 构造函数声明
    buffer_t(const buffer_t &other); // 拷贝构造函数声明
    buffer_t &operator=(const buffer_t &other); // 赋值操作符声明
    ~buffer_t(); // 析构函数声明
};

// 构造函数实现
buffer_t::buffer_t(int s) : size(s)
{
    data = new int[size]; // 分配内存
    cout << "构造函数: 分配了 " << size << " 个int空间" << endl;
}

// 拷贝构造函数实现
buffer_t::buffer_t(const buffer_t &other) : size(other.size)
{
    data = new int[size]; // 分配新内存
    for (int i = 0; i < size; i++)
    {
        data[i] = other.data[i]; // 拷贝数据
    }
    cout << "拷贝构造: 拷贝了 " << size << " 个int数据" << endl;
}

// 赋值操作符实现
buffer_t &buffer_t::operator=(const buffer_t &other)
{
    // 检查自赋值
    if (this == &other)
    {
        cout << "检测到自赋值，跳过操作" << endl;
        return *this;
    }

    delete[] data; // 释放原有内存

    size = other.size;    // 设置新大小
    data = new int[size]; // 分配新内存
    for (int i = 0; i < size; i++)
    {
        data[i] = other.data[i]; // 拷贝数据
    }
    cout << "赋值操作: 拷贝了 " << size << " 个int数据" << endl;
    return *this; // 返回当前对象引用
}

// 析构函数实现
buffer_t::~buffer_t()
{
    delete[] data; // 释放内存
    cout << "析构函数: 释放了 " << size << " 个int空间" << endl;
}

int main()
{
    buffer_t buf1(5); // 创建第一个缓冲区
    buffer_t buf2(5); // 创建第二个缓冲区

    buf2 = buf1; // 正常赋值操作
    buf2 = buf2; // 自赋值操作

    return 0;
}

```

在这个例子中，我们首先检查 `this` 是否等于 `&other`，如果等于，则说明这是自我赋值，我们应避免执行可能破坏对象状态的操作。这是 `this` 指针在拷贝构造函数和赋值操作符中的常见用法。会得到以下打印信息：

```bash
构造函数: 分配了 5 个int空间
构造函数: 分配了 5 个int空间
赋值操作: 拷贝了 5 个int数据
检测到自赋值，跳过操作
析构函数: 释放了 5 个int空间
析构函数: 释放了 5 个int空间
```

### 4. 在继承和多态中的作用

`this` 指针在处理继承和多态问题时起到了非常重要的作用。它在动态绑定，虚函数和覆盖等方面发挥着重要作用。

#### 4.1 通过 `this` 指针实现动态绑定

动态绑定是多态的关键机制之一，它使得在运行时可以根据对象的实际类型来调用相应的成员函数。`this` 指针在这个过程中起到了关键的作用。

```cpp
class Base {
  public:
    virtual void print() const { // 定义虚函数 print() ，用来打印 Base 类的信息
        std::cout << "Base::print()" << std::endl;
    }
};

class Derived : public Base { // Derived 类从 Base 类公有继承
  public:
    void print() const override { // 重写基类的虚函数 print() 用来打印 Derived 类的信息
        std::cout << "Derived::print()" << std::endl;
    }
};

void callPrint(const Base *base) { // 定义一个函数，参数类型为指向 Base 类的常指针
    base->print(); // Dynamic binding 动态绑定，通过指针调用 Fprint() 函数
}

// 使用示例
Derived d;     // 创建 Derived 对象
callPrint(&d); // 通过 callPrint 函数打印对象 d 的信息，输出 "Derived::print()"

```

我们有一个基类 `Base` 和一个派生类 `Derived`，它们都有一个 `print` 成员函数。在 `callPrint` 函数中，我们通过 `this` 指针（`base`）来调用 `print` 函数，此时会发生动态绑定。

#### 4.2 `this` 指针在虚函数和覆盖中的行为

在虚函数和覆盖中，`this` 指针指向的是最初用来调用成员函数的那个对象。如果我们在派生类中覆盖了基类的虚函数，那么 `this` 指针的类型在这个虚函数中仍然是基类的指针类型，但它实际上指向的是派生类的对象。

```cpp
class Base {
  public:
    virtual void print() const { // 定义虚函数 print() 打印基类的信息
        std::cout << "This is a Base object." << std::endl;
    }
};

class Derived : public Base {
  public:
    void print() const override { // 重写基类的虚函数 print() ，用来打印派生类的信息
        Base::print();            // 首先调用基类的 print() 函数打印基类信息
        std::cout << "This is a Derived object." << std::endl; // 再打印派生类信息
    }
};

// 使用示例
Derived d; // 创建 Derived 对象
d.print(); // 打印 Derived 对象的信息，输出 "This is a Base object." 和 "This is a Derived object."

```

当我们通过派生类对象 `d` 调用 `print` 函数时，`this` 指针指向的是 `d` 对象。在 `Derived::print` 函数中，我们首先调用了基类的 `print` 函数，然后再输出一行信息。这说明即使在覆盖了基类虚函数的派生类中，`this` 指针仍然能够正确地指向派生类的对象。

### 5. this指针与const成员函数

在 `const` 成员函数中，`this` 指针的类型是指向 `const` 类型的指针。这意味着我们不能通过 `this` 指针修改对象的状态。

```cpp
class Box {
    int length;

  public:
    int getLength() const { // 常成员函数
        // this->length = 10;  // 错误：不能在常成员函数中修改成员变量
        return length; // 返回成员变量的值
    }
};

```

`getLength` 是一个 `const` 成员函数。在这个函数中，`this` 指针的类型是 `const Box*`，所以不能通过 `this` 指针来修改 `length`。

`const` 成员函数是一种保证对象状态不变性的重要机制。当我们将一个成员函数声明为 `const`，就是在承诺这个函数不会修改对象的状态。这对于编写稳定可靠的代码非常有用。

```cpp
class Box {
    int length;

  public:
    Box(int length) : length(length) {} // 构造函数，初始化成员变量 length

    void increaseLength(int increment) { // 增加盒子长度的函数
        length += increment;             // 修改对象的状态
    }

    int getLength() const { // 获取盒子长度的函数，常成员函数
        return length;      // 不修改对象的状态，只返回成员变量的值
    }
};

```

`increaseLength` 是一个非 `const` 成员函数，它可以修改对象的状态。而 `getLength` 是一个 `const` 成员函数，它不能修改对象的状态。当需要读取对象的状态，但不想修改它时，应该使用 `const` 成员函数。

### 6. 多线程编程

#### 6.1 `this` 指针在多线程环境中的行为

在多线程环境中，每个线程都有其独立的栈空间，因此在每个线程中，`this` 指针的值是独立的。也就是说，`this` 指针只能在同一线程中传递，而不能跨线程传递。

假设我们有一个类 `Box`，并且我们在两个不同的线程中同时创建了 `Box` 对象，那么在每个线程中，`this` 指针都会指向其各自创建的 `Box` 对象。

#### 6.2 使用 `this` 指针处理多线程同步和数据竞争

在多线程编程中，`this` 指针常常用于处理多线程同步和数据竞争的问题。例如，我们可能需要在一个类的成员函数中使用 `this` 指针来获取一个互斥锁，以保护类的数据成员不受并发访问的影响。

```cpp
#include <mutex>
#include <thread>

class Box {
  public:
    int        data;
    std::mutex mtx; // 线程互斥量，用于保护共享数据的访问
  public:
    void setData(int value) {
        std::lock_guard<std::mutex> lock(mtx); // 申请互斥锁
        this->data = value;                    // 修改共享数据
    }
};

void threadFunction(Box *box, int value) {
    box->setData(value); // 更新共享数据
}

// 使用示例
Box         b;                          // 创建共享对象
std::thread t1(threadFunction, &b, 10); // 创建第一个线程并传入共享对象的地址以及值
std::thread t2(threadFunction, &b, 20); // 创建第二个线程并传入共享对象的地址以及值
t1.join();                              // 等待第一个线程执行完毕
t2.join();                              // 等待第二个线程执行完毕

```

`setData` 成员函数使用 `this` 指针来获取一个互斥锁，以保护 `data` 成员变量。当我们在两个线程中同时调用 `setData` 函数时，由于互斥锁的存在，只有一个线程可以访问 `data` 成员变量，这就避免了数据竞争的问题。

## 三、注意事项和常见陷阱

`his` 指针是一个强大的工具，但是在使用它的过程中也需要注意一些陷阱和限制，尤其是在构造函数、析构函数以及返回将要析构对象的 `this` 指针等方面。

### 1. 构造函数和析构函数中的使用限制

在构造函数和析构函数中使用 `this` 指针需要特别小心。在构造函数中，由于对象还没有完全构造完成，因此使用 `this` 指针访问未初始化的成员变量可能会导致未定义的行为。同样，在析构函数中，如果对象已经部分或完全析构，那么使用 `this` 指针可能会导致问题。

```cpp
class Box {
    int *data;

  public:
    Box() {
        data = new int[10];
        // 避免使用 'this' 进行重要操作，因为对象没有完全构造完成
    }

    ~Box() {
        delete[] data;
        // 对象正在被析构，进一步使用 'this' 可能会导致未定义行为
    }
};

```

#### 2. 避免返回将要析构对象的 `this` 指针

一个常见的陷阱是在一个成员函数中返回 `this` 指针，尤其是当这个成员函数是一个临时对象的成员函数时。在函数返回后，临时对象会被析构，此时返回的 `this` 指针就会变成悬垂指针，这会导致未定义的行为。

```cpp
class Box {
    int data;

  public:
    Box(int value) : data(value) {
    }

    Box *getDataPtr() {
        return this;
    }
};

Box *badFunc() {
    return Box(10).getDataPtr(); // 返回指向已经被析构的对象的指针
}

// 使用示例
Box *p = badFunc(); // 'p' 是一个悬垂指针（dangling pointer）

```

`badFunc` 函数返回的是一个将要被析构的临时对象的 `this` 指针，这会导致 `p` 成为一个悬垂指针。为了避免这种情况，我们应该尽量避免在成员函数中返回 `this` 指针，或者确保返回的 `this` 指针指向的对象在函数返回后仍然存在。

## 四、总结

- this 指针是一个指向当前对象的特殊指针。在非静态成员函数内部，可以使用 this 指针来访问调用对象的成员。
- this 指针在成员函数中的使用非常灵活，可以通过 this->member 来访问成员变量，或者通过 this->function() 来调用成员函数。
- 在解决变量命名冲突时，this 指针可以帮助消除歧义，使代码更清晰易懂。
- this 指针在链式调用中扮演重要角色，通过返回 \*this，可以实现在同一行内连续调用多个成员函数。
- 在拷贝构造函数和赋值操作符中，this 指针用于处理自我赋值的情况，避免可能导致错误的操作。
- 在继承和多态中，this 指针能够实现动态绑定，确保调用正确的函数实现。
- 在虚函数和覆盖中，this 指针在虚函数调用时保持准确，指向的是最初用来调用成员函数的对象。
- 在 const 成员函数中，this 指针的类型变为 const T\*，用于保证对象状态的不变性。
- 在多线程环境中，每个线程都有独立的 this 指针，因此无法跨线程传递 this 指针。在多线程编程中，this 指针常用于处理多线程同步和数据竞争问题。
- 在构造函数和析构函数中，对 this 指针的使用有限制。在构造函数中，this 指针不能用于访问未初始化的成员变量；在析构函数中，使用 this 指针可能导致未定义的行为。
- 避免在成员函数中返回将要析构的对象的 this 指针，以避免悬垂指针的问题。



> 参考文章：
>
> [【C++】C++中的 `this` 指针：深度探索和应用_c++ this-CSDN博客](https://blog.csdn.net/crr411422/article/details/131063469)
>
> [理解/总结C++中的this指针 - 知乎](https://zhuanlan.zhihu.com/p/625016293)
>
> [C++this指针详解 - ywx-super - 博客园](https://www.cnblogs.com/yuwanxian/p/10988736.html)
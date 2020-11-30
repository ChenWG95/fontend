# 在TS中引入一个script脚本形式的第三方依赖要怎么办
---
## 问题的开始
今天在写业务的时候依赖了一个组件，这个组件是script脚本形式的，我通过`<script src="xx"></script>`形式引入，引入完之后我就写下如下代码
````
const comp = new SomeComp()
````

此时，报错开始了。

首先是ts报错：`Cannot find name 'SomeComp'`
> ts说：怎么突然出现了一个没声明过的`SomeComp`，这是啥？！

## 开始解决第一个TS报错
由于这个组件并没有对应的@type声明文件，随后我去d.ts声明文件里面声明他的类型，甚至查了一下类是如何声明的...看了半天声明的文档内容，最终在文档的<b>声明 => 类章节</b>里面找到了答案
````javascript
declare class Greeter {
  constructor(greeting: string);

  greeting: string;
  showGreeting(): void;
}
````

找到之后我比葫芦画瓢的声明了我的SomeComp类，然后第一个问题解决了！第二个问题又来了，控制台又出现了报错：`'SomeComp' is not defined`，这我就懵了？

## 开始解决第二个问题
我想我难道是引入的脚本时间晚了？怎么会是not defined的呢？通过一阵调换script位置等乱七八糟的方式调试之后我终于在搜索<b>全局变量 xxx is not defined</b>之后再一篇BLOG里面找到了答案：这是一个eslint问题，需要在根据eslint规则全局声明
````javascript
/* global SomeComp */
````
解决之后，我最终完成了本次的问题解决，但是也引发了我的一个反思和一个疑问

## 疑问
### ts如何识别声明文件
我在改写声明文件的时候，我发现我们的d.ts声明文件并没有被引用。但是竟然生效了！这就让我十分的奇怪，难道ts这么智能可以自动识别d.ts？

<b>以下是我看文档准备找出来的结果..最后发现并没用，可以直接跳结尾</b>

在你导入一个模块时，ts会有疑问，你这个模块的结构是什么样的？随后，它将通过依次几种方法来寻找你的模块结构定义：
  1. classic / node
  2. 如1解析失败，且模块名是非相对的。编辑器会找外部模块声明：定义一个d.ts，然后通过`/// <reference> node.d.ts`或者是`import url = require("url")`这种方式引入
  3. 如果依旧找不到，就会抛出`Cannot find module 'moduleA'`
  > reference主要还是声明依赖

#### Classic
Classic导入模块有两种方式
  1. 相对路径导入: './xxx.d.ts'
  2. 非相对路径导入: '@types/xxx'

相对导入：
例如：
````javascript
// /root/src/folder/A.ts文件中
import { b } from "./moduleB"
````
的实质是查找：
````
/root/src/folder/moduleB.ts
/root/src/folder/moduleB.d.ts
````

非相对导入：
从包含导入文件的层级开始向上查询遍历目录，直到找到为止
例如：
````javascript
// /root/src/folder/A.ts
import { b } from "moduleB"
````
的实质是查找：
````
/root/src/folder/moduleB.ts
/root/src/folder/moduleB.d.ts

/root/src/moduleB.ts
/root/src/moduleB.d.ts

/root/moduleB.ts
/root/moduleB.d.ts

./moduleB.ts
./moduleB.d.ts
````

#### Node
Node根据require进行查询，同样也是相对和非相对两种形式：

相对导入：
例如：
````javascript
// /root/src/moduleA.js
var a = require('./moduleB')
````
的实质是查找：
1. /root/src/moduleB.js是否存在，有则返回
2. 查找/root/src/moduleB目录下是否有package.json和main字段指定，有则返回
3. 查找/root/src/moduleB目录下是否有index.js，如果有他会被当成上述的"main模块"返回

非相对导入：
会查node_modules
例如：
````javascript
// /root/src/moduleA.js
var a = require('moduleB')
````
的实质是查找：
````
/root/src/node_modules/moduleB.js
/root/src/node_modules/moduleB/package.json (如果指定了"main"属性)
/root/src/node_modules/moduleB/index.js

/root/node_modules/moduleB.js
/root/node_modules/moduleB/package.json (如果指定了"main"属性)
/root/node_modules/moduleB/index.js

/node_modules/moduleB.js
/node_modules/moduleB/package.json (如果指定了"main"属性)
/node_modules/moduleB/index.js
````

#### TS
ts和node类似，只不过ts中它是以types字段来代表node中的main字段

相对导入
例如：
````javascript
// /root/src/moduleA.ts
var a = require('./moduleB')
````
的实质是查找
````
/root/src/moduleB.ts
/root/src/moduleB.tsx
/root/src/moduleB.d.ts

/root/src/moduleB/package.json (如果指定了"types"属性)

/root/src/moduleB/index.ts
/root/src/moduleB/index.tsx
/root/src/moduleB/index.d.ts
````

非相对查找
例如：
````javascript
// /root/src/moduleA.ts
var a = require('moduleB')
````
的实质是查找
````
/root/src/node_modules/moduleB.ts
/root/src/node_modules/moduleB.tsx
/root/src/node_modules/moduleB.d.ts
/root/src/node_modules/package.json types
/root/src/node_modules/moduleB/index.ts
/root/src/node_modules/moduleB/index.tsx
/root/src/node_modules/moduleB/index.d.ts

/root/node_modules/moduleB.ts
/root/node_modules/moduleB.tsx
/root/node_modules/moduleB.d.ts
/root/node_modules/package.json types
/root/node_modules/moduleB/index.ts
/root/node_modules/moduleB/index.tsx
/root/node_modules/moduleB/index.d.ts

/node_modules/moduleB.ts
/node_modules/moduleB.tsx
/node_modules/moduleB.d.ts
/node_modules/package.json types
/node_modules/moduleB/index.ts
/node_modules/moduleB/index.tsx
/node_modules/moduleB/index.d.ts
````

tsconfig中：
- baseUrl：告诉我们非相对引入模块从哪里找
- paths：通过映射来对应字符与路径之间的关系（paths里的路径是相对baseUrl来的）
- rootDir表示两个会合并：详见[模块解析](https://www.tslang.cn/docs/handbook/module-resolution.html)

比如如下例子：
````
projectRoot
├── folder1
│   ├── file1.ts (imports 'folder1/file2' and 'folder2/file3')
│   └── file2.ts
├── generated
│   ├── folder1
│   └── folder2
│       └── file3.ts
└── tsconfig.json
````
对应的tsconfig为
````
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": [
        "*",  // *代表名字不变
        "generated/*" // generated代表加了generated前缀
      ]
    }
  }
}
// 意思就是不在xx就在generated/xx下
````

你可以通过如下指令看到编译器细节：
````
tsc --traceResolution

1. 导入的名称
======== Resolving module 
2. 使用的策略
Module resolution kind is not specified, using 'NodeJs'.
3. 从npm加载types
'package.json' has 'types' field './lib/typescript.d.ts' that references 'node_modules/typescript/lib/typescript.d.ts'.
4. 最终结果
======== Module name 'typescript' was successfully resolved to 'node_modules/typescript/lib/typescript.d.ts'. ========
````

看了那么多好像没解决最终问题，经实验：确实TS会自动检索全局的d.ts文件..
（本以为查文档能查出来，没想到最后尝试了一下才知道

### 如何区分报错是哪个ts报错还是eslint报错
根据信息旁的关键字进行识别

## 反思
这个问题解决完之后其实并不是很复杂的问题，但是我竟然解决了2-3个小时。我现在都觉得效率低的有些不可思议，这是为什么呢？根据复盘的思想我仔细回想一下自己遇到问题之后的解决路径：

1. 首先，我遇到了问题
2. 然后一头雾水，为什么`Cannot find name 'SomeComp'`
3. 随后我去查了有类似使用的仓库进行查询，查询花费了一段时间（此处出现问题1: 为啥不直接百度？简单直接
4. 再然后我发现了是要声明，就进行声明，但是发现声明之后还是报错？我就有点急躁了（此处出现问题2: 为什么出现了问题不是查询而是急躁？主要是因为问题看不懂，感觉很复杂，觉得自己解决不了，从而缺乏自信。并且中间想过好多次是不是直接求助别人比较好，最终还是自己解决了下来
5. 最后发现是eslint问题的时候我发现自己连控制台的报错是哪里报的都不知道，导致排查的时候没有针对性的抓瞎，盲目猜测（这里也是再次触发急躁问题

通过以上分析，我的解决问题思路其实有几点问题：
1. 遇到问题第一反应不是解决，而是我不行，求助，好麻烦这种不应该的负面情绪
2. 解决问题时缺乏耐心和自信。英文看不懂可以查的，但是我遇到一眼不明白的就容易急躁，觉得自己解决不了
3. 自己的知识体系不够牢固，对于身边出现的问题也没有及时的反思和解决，得过且过。才会出现ts用了这么久类似的很多细节和问题都不知道

下次遇到问题怎么办？
1. 你自己绝对可以解决，先树立自信
2. 了解报错信息具体是什么，进行探索
3. 回顾问题，总结
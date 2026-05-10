# ios-2048

`ios-2048` 是一个基于 `Next.js 16`、`React 19` 和 `TypeScript` 的 2048 Web 游戏。它不是默认模板页，而是一个完整的移动端优先小游戏：界面按手机尺寸设计，支持键盘和手势操作，带分数统计、撤销、音效和本地最高分记录。

## 功能特性

- 经典 `4 x 4` 2048 玩法
- 键盘方向键操作
- 移动端滑动操作
- 方块移动、生成、合并动画
- 单步撤销
- 胜利 / 失败状态提示
- 音效开关
- 最高分持久化到 `localStorage`
- 对 `prefers-reduced-motion` 做了兼容处理
- 纯引擎逻辑带自动化测试

## 技术栈

- `Next.js 16.2.6`
- `React 19.2.4`
- `TypeScript 5`
- `Tailwind CSS 4`
- `ESLint 9`
- `node:test` 用于引擎测试

## 快速开始

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

## 可用脚本

```bash
npm run dev
```

启动 Next.js 开发服务器。

```bash
npm run build
```

构建生产版本。

```bash
npm run start
```

启动生产构建结果。

```bash
npm run lint
```

运行 ESLint。

```bash
npm run test
```

编译 `src/game` 的核心逻辑和 `tests/engine.test.ts`，然后用 Node 内置测试运行器执行测试。

## 项目结构

```text
app/
  layout.tsx        应用布局、页面 metadata、viewport 和全局样式引入
  page.tsx          首页入口，渲染 Game 组件
  globals.css       全局样式和方块动画

src/
  components/       游戏界面组件
  game/
    engine.ts       2048 核心规则、移动合并、生成、撤销、胜负判断
    audio.ts        Web Audio 音效
    storage.ts      localStorage 读写
    types.ts        游戏共享类型
  hooks/
    useSwipe.ts     滑动手势识别

tests/
  engine.test.ts    核心引擎测试
```

## 核心实现

`app/page.tsx` 只负责渲染游戏容器，真正的页面状态集中在 `src/components/Game.tsx`。这个组件在客户端初始化游戏状态，绑定键盘事件，协调音效、撤销、新开局和最高分存储。

2048 规则本身放在 `src/game/engine.ts`，这部分不依赖框架，可以单独测试。它负责：

- 棋盘尺寸和方块 ID
- 移动与合并规则
- 随机生成新方块
- 胜利 / 失败状态判断
- 单步撤销快照
- 动画所需的移动轨迹数据
- 最高分进度计算

## 交互说明

- 桌面端使用方向键控制移动
- 移动端在棋盘区域滑动即可移动
- `Undo` 会恢复到上一步有效移动之前的状态
- 音效默认开启，可在页面右上角开关
- 最高分和音效偏好会保存在当前浏览器本地

## 测试说明

当前测试覆盖的是纯游戏引擎，不包含浏览器 UI 自动化。测试关注点包括：

- 行列移动和合并逻辑
- 无效移动不生成新方块
- 随机生成方块行为
- 动画轨迹数据
- 撤销恢复
- 胜负状态判断
- 最高分进度计算

## 适用场景

这个仓库适合继续做以下方向的迭代：

- 补充 UI 文案和视觉细节
- 增加更多游戏模式或尺寸
- 接入排行榜或后端存档
- 增加触觉反馈、主题切换或更多音效
- 为组件层补充集成测试或端到端测试

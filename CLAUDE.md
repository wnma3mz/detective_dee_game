# detective-game — CLAUDE.md

## 项目简介

古风文字互动推理游戏。玩家扮演类似狄仁杰的断案官员，阅卷、勘查、推理、结案。
现有 38 个案件，01/02/09 三案为"精制版"样板，其余案件使用旧版 UI。

## 技术栈

- React + TypeScript + Vite
- framer-motion（动效）
- lucide-react（图标）
- localStorage 持久化进度

## 目录结构

```
src/
  App.tsx                  主组件，渲染三阶段（阅卷/勘查/断案）
  styles.css               全局样式，古风暗色主题
  data/
    types.ts               所有类型定义（旧+新，向后兼容）
    cases.ts               38 个案件的 seed 数据 + buildCase()
    cases-extended.ts      01/02/09 三案的新结构数据
    progress.ts            进度管理 + calculateScore()
```

## 数据模型

### 旧版（35 个普通案件）

每案由 `CaseSeed` → `buildCase()` 生成，调查动作固定为 5 条，断案是单选题+证据勾选。

### 新版（精制版，目前 01/02/09）

在旧版基础上增加四个可选字段：

| 字段 | 说明 |
|------|------|
| `evidenceList` | 证据列表，每条标注 `role: key/supporting/context/decoy` |
| `investigationNodes` | 调查节点，支持 `requires`（前置）和 `unlocks`（解锁新节点） |
| `deductionSteps` | 4 步推理链：表面判断/核心矛盾/证据组合/最终结论 |
| `feedback` | 针对每个选项和每条证据的逐项反馈文字 |

新案件数据写在 `cases-extended.ts`，在 `cases.ts` 末尾通过 `caseExtensions` 合并。

### 评分规则（新版）

- 每个推理步骤按 `maxScore` 给分（单选全对/多选按比例）
- 关键证据 +1，辅助证据 +0.5，误导证据 -1，证据部分上限 3 分
- 使用轻提示 -1，强提示 -2

## 新增一个精制版案件

1. 在 `cases-extended.ts` 按格式添加：`evidenceListXX`、`investigationNodesXX`、`deductionStepsXX`、`feedbackXX`
2. 在底部 `caseExtensions` 中加入对应 id 的条目
3. 无需改动其他文件

### InvestigationNode 条件解锁示例

```ts
// 解锁 scene-hoe 后，会出现 witness-zhou-hoe 追问节点
{
  id: 'scene-hoe',
  type: 'scene',
  title: '查看墙角锄头',
  result: '锄头立得端正……',
  cost: 1,
  unlocks: ['witness-zhou-hoe'],
},
{
  id: 'witness-zhou-hoe',
  type: 'witness',
  title: '追问周二为何整理锄头',
  result: '周二前后矛盾……',
  cost: 1,
  requires: ['scene-hoe'],
}
```

### DeductionStep 类型

- `single`：单选，`correctOptionIds` 填一个 id
- `multi`：多选，`correctOptionIds` 填多个 id
- `text`：文本输入，有内容就给满分

## 部署

GitHub Pages 通过 `.github/workflows/deploy.yml` 自动部署。
vite.config.ts 已配置 `VITE_BASE_PATH` 环境变量，CI 会自动传入仓库名作为 base path。

**GitHub 仓库设置步骤：**
1. 新建仓库（如 `gong-an`）
2. Settings → Pages → Source 选 **GitHub Actions**
3. push 到 main 分支，自动触发部署

## 开发规范

- 所有案件数据只在 `cases.ts` 和 `cases-extended.ts` 中修改
- 新增案件类型扩展时，先更新 `types.ts`，再更新评分逻辑 `progress.ts`，最后更新 UI
- 旧版案件（无 `deductionSteps`）走旧 UI 分支，不要破坏向后兼容性
- 样式统一写在 `styles.css`，使用 CSS 变量（`--accent-gold`、`--accent-red` 等）

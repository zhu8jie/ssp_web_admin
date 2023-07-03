# vue_media

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

```bash
# 版本号文件说明
1.0.1 数据管理-添加支出修正  2020/09/25
1.0.2 媒体平台-广告位管理添加筛选  2020/09/28
1.0.3 推啊替换成交互通，把推啊默认选择去除 2020、09/28

1.1.0 管理平台增加小时报表（2020.09.15）
1.2.0 管理平台增加预算方gap数据（2020.10.16）
1.3.0 预算位天（2020.10.23）
1.3.1 修复管理平台预算位小时表匹配错误问题（2020/10/28）
1.3.2 管理平台-广告位管理-更换为可编辑(2020.10.29)
1.3.3 预算位和广告位添加素材尺寸比例（管理平台） 2020/11/3
1.4.0 管理平台账号权限（2020.10.27）
1.5.0 管理平台添加接入中心，首页相信分析饼图， 数据管理子表添加可搜索， 数据管理折线图（2020.11.11）
1.5.1 管理平台 添加 素材尺寸比例； 预算位详细数据广告位名称或ID的搜索（2020.11.25）
1.6.0 管理平台- 添加cp和渠道统计
1.7.0 管理平台- 人群定向tag(已发版. 上线时间：2021/1/14日)
1.7.1 RTA需求（2021/1/18； 20201.1.21已合并到主线）
1.8.0 预警中心（创建时间：2021.1.22日，2021.1.29日已合并到主线）
1.8.1 预算数据及预算数据数据的子表增加“一键复制全部广告位ID”的功能 (创建时间： 2021/2/25， 并要求当天上线, 已合并到主线)
1.9.0 功能优化（创建时间：2021.2.1日, 已合并到主线）
1.10.0 DealID管理（创建时间：2021.2.24日，待合并）
1.11.0 预警中心第二版 （创建时间：2021.3.14日，未合并主线，已合并1.10.0）
2.0.0 2.0 自动化匹配预算位+广告位 (创建时间：2021.3.16日, 已合并1.10.0，已合并1.11.0，已于2021/4/14发版)
2.0.1 2.0的优化补充，合并数据管理路由（创建时间： 2021/04/15, 已合并到主线）
2.0.2 2.0.1的优化补充，计划数据列表 （广告位名称） 跳转到 广告位管理列表页（创建时间： 2021/04/27, 未合并到主线）
2.1.0 新建广告位自动匹配预算位、选择素材尺寸（创建时间： 2021/04/28, 2021/05/18已合并到主线）
2.2.0 一键加群/拨打电话/SDK配置 (创建时间2021/5/14, 2021/5/24 合并到主线)
2.3.0 媒体结算账单 （创建时间： 2021/5/28）
3.0.0 任务方（创建时间： 2021/4/26，未开发）

```


```bash

// 常用命令

git branch 1.2.0 // 打分支
git checkout 1.2.0 // 切换到分支
git checkout master // 切换到主线
git merge 1.2.0 // 主线合并分支

git push origin :2.1.0// 删除远程分支
git branch -d 2.1.1 // 删除本地分支
git branch -r // 查看远程分支
git branch -f master // 强制切换到主线
git branch // 查看本地分支

git checkout commit_id <file_name> // 拉取指定提交中的某个文件

// 版本回滚

在当前branch上多次commit代码并且push后，发现不符合要求，需要回滚到特定的版本。步骤如下：
1、 git log           //查找commitId
2、 git reset --hard c503cffa099332911d4fce2fc1399cb4bc3ba9d6
3、 此时本地文件已经回滚，但是服务器仍然没有改变，需要继续远程回滚
    git push -f

此时如果有人获取了更新的版本，可能拉去不下来，执行以下操作：
git fetch --all
git reset --hard origin/branchname




```



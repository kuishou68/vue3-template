# vite-plugin-upload

实现上传静态资源至七牛云和aws的vite插件，可重复刷新上传和增量更新

## 特性
- 支持七牛云
- 支持亚马逊S3


## 使用
### 安装
```bash
npm i @puhaha/vite-plugin-upload-oss -D

# 七牛云sdk安装
npm i qiniu -D

```
### 配置

#### 公用参数

| 参数           | 说明                         | 类型     | 默认值      |
| -------------- | ---------------------------- | -------- | ----------- |
| sdk          | 必填，各平台提供的sdk         | object |  |
| sdkName | uploadPlugin插件使用，其他没必要 | String | |
| accessKey | 必填 | String | |
| secretKey | 必填 | String | |
| bucket | 必填 | String | |
| remoteFilePath | 非必填，表示服务器远程路径   | string   |             |
| filePath       | 必填，本地文件夹路径       | string   |             |
| openConfirm    | 非必填，是否打开上传前的提示 | boolean  | true        |
| success        | 非必填，上传成功回调         | Function | files => {} |
| error          | 非必填，上传失败回调         | Function | files => {} |
| publicCdnPath  | 必填，cdn基础地址            | string   |             |
| enabledRefresh  | 非必填，是否刷新文件         | boolean   |    true      |
| uploadTarget | 必填，打包生成的目录地址 | sting | 无默认值，需手动填写path.resolve(__dirname, './dist') |
| appName | 必填 | string | 项目名称 |
| fileLogPath | 非必填，日志生成的目录地址 | sting | log/ |
| env | 非必填，打包的环境 | sting | development |
| suffix | 非必填，日志版本号 | string | 空 |
| deleteOldFiles | 非必填，本地dist目录是否删除已经上传的老文件 | boolean | true |
| excludeHtml | 非必填，是否排除html文件上传 | boolean | false |
| htmlPath | 非必填，html上传打的路径 | string | 空 |
| awsDistributionId | 刷新aws上的资源的失效id | string |  |



#### 七牛云
```js
// vite.config.[t|j]s
import qiniu from 'qiniu'
import {qiniuPlugin} from '@puhaha/vite-plugin-upload-oss'
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build';

  return {
    plugins: [
      isBuild && qiniuPlugin({
        sdk: qiniu
        accessKey: 'xxx',
        secretKey: 'xxx',
        bucket: 'xxx',
        filePath: 'xxx',
        remoteFilePath: '',
        openConfirm: true,
        publicCdnPath: 'http://xxx.xxx.com/',
        enabledRefresh: true
      })                
    ]
  }
}
```



## 日志

- [x] 2022.04.21 支持七牛云
- [x] 2022.10.11 支持增量更新上传，只上传项目中修改过的文件
- [x] 2022.10.17 支持增量更新上传，删除本地已经上传过的文件
- [x] 2023.02.01 支持aws上传以及刷新


## 感谢

- [@shihao905/upload-upyun](https://github.com/shihao905/upload-upyun)
- [@egoist/ts-lib-starter](https://github.com/egoist/ts-lib-starter)
- [@jomsou/vite-plugin-upload](https://github.com/work-flow/vite-plugin-upload)
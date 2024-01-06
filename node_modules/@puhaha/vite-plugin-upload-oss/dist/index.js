"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : {default: obj};} // src/upyun.ts
var _fs = require('fs');
var _fs2 = _interopRequireDefault(_fs);
const _array = require("lodash/array");
const axios = require('axios');
const _path = require("path");
const mime = require('mime');
// Set the AWS Region.
const REGION = "us-east-1";
const that = this

var utils_default = {
	getFileByDir(list, dirPath, filePath, remoteFilePath, htmlPath, excludeHtml) {
		_fs2.default.readdirSync(dirPath).map((url) => {
			let u = dirPath + "/" + url;
			if (url.charAt(0) !== "." && _fs2.default.existsSync(u)) {
				if (_fs2.default.statSync(u).isDirectory()) {
					this.getFileByDir(list, u, filePath, remoteFilePath, htmlPath, excludeHtml);
				} else if (!(excludeHtml && u.endsWith('.html'))) {
					const _filePath = u.endsWith('.html') ? htmlPath : remoteFilePath
					list.push({
						key: _filePath + u.slice(filePath.length + 1),
						localFile: u
					});
				}
			}
		});
	},
	getFileList(cb, dirPath, filePath, remoteFilePath, htmlPath, excludeHtml) {
		if (htmlPath && !htmlPath.endsWith('/')) {
			htmlPath = htmlPath + '/'
		}
		let filesList = [];
		this.getFileByDir(filesList, dirPath, filePath, remoteFilePath, htmlPath, excludeHtml);
		cb && cb(filesList);
	}
};

// src/core/styles.ts
var styles_default = {
	bold: "[1m%s[22m",
	italic: "[3m%s[23m",
	underline: "[4m%s[24m",
	inverse: "[7m%s[27m",
	strikethrough: "[9m%s[29m",
	white: "[37m%s[39m",
	grey: "[90m%s[39m",
	black: "[30m%s[39m",
	blue: "[34m%s[39m",
	cyan: "[36m%s[39m",
	green: "[32m%s[39m",
	magenta: "[35m%s[39m",
	red: "[31m%s[39m",
	yellow: "[33m%s[39m",
	whiteBG: "[47m%s[49m",
	greyBG: "[4958m%s[49m",
	blackBG: "[40m%s[49m",
	blueBG: "[44m%s[49m",
	cyanBG: "[46m%s[49m",
	greenBG: "[42m%s[49m",
	magentaBG: "[45m%s[49m",
	redBG: "[41m%s[49m",
	yellowBG: "[43m%s[49m"
};

// src/core/progress.ts
var _singlelinelog = require('single-line-log'); var _singlelinelog2 = _interopRequireDefault(_singlelinelog);
var ProgressBar = class {
	constructor(description, bar_length) {
		this.description = description || "Progress";
		this.length = bar_length || 25;
	}
	render(options) {
		let percent = (options.completed / options.total).toFixed(4);
		var cell_num = Math.floor(+percent * this.length);
		let cell = "";
		for (let i = 0; i < cell_num; i++) {
			cell += "\u2588";
		}
		let empty = "";
		for (let i = 0; i < this.length - cell_num; i++) {
			empty += "\u2591";
		}
		let cmdText = this.description + ": " + (100 * +percent).toFixed(2) + "% " + cell + empty + " " + options.completed + "/" + options.total + "\n";
		_singlelinelog2.default.stdout(cmdText);
	}
};
var progress_default = ProgressBar;

// src/core/upload.ts
var Upload = class {
	constructor(option) {
		const {
			sdk,
			filePath,
			remoteFilePath,
			success,
			error,
			openConfirm,
			accessKey,
			secretKey,
			publicCdnPath,
			enabledRefresh,
			uploadTarget,
			appName,
			fileLogPath,
			env,
			suffix,
			deleteOldFiles,
			htmlPath,
			excludeHtml
		} = option;
		this.options = option;
		this.filePath = filePath;
		this.enabledRefresh = true // 设置默认值    
		this.enabledRefresh = enabledRefresh
		this.publicCdnPath = publicCdnPath;
		this.remoteFilePath = remoteFilePath || "";
		this.fileLogPath = fileLogPath || 'log/'
		this.env = env || 'development'
		this.deleteOldFiles = deleteOldFiles
		this.htmlPath = htmlPath || ''
		this.excludeHtml = excludeHtml || false
		this.loadSuccess = success || (() => {
		});
		this.loadError = error || (() => {
		});
		if (typeof openConfirm == "boolean") {
			this.openConfirm = openConfirm;
		} else {
			this.openConfirm = true;
		}
		this.filesList = [];
		this.uploadFiles = [];
		this.errorFiles = [];
		this.sdk = sdk;
		this.verifyOptions(option);
		this.accessKey = accessKey
		this.secretKey = secretKey

		this.logJsonFileName = `${appName}-${this.env}` // logJsonFileName : web-test-development

		// 线上log json资源映射文件地址
		this.jsonFilePath = `${publicCdnPath}${this.fileLogPath || '/'}${this.logJsonFileName}${suffix}.json`

		// 本地资源映射文件目录
		this.logLocalDirPath = `${uploadTarget}/${this.fileLogPath || '/'}`

		// 本地log文件存放地址
		this.logLocalPath = `${this.logLocalDirPath}${this.logJsonFileName}${suffix}.json`

		// 需要新上传的文件列表
		this.newFileList = []
		// 线上已存在的资源文件映射列表
		this.fileExistList = []
		this.repeatFileList = [] // 重复的文件列表
	}

	verifyOptions(option) {
		if (!option.filePath) {
			console.log(styles_default.red, "\u8BF7\u586B\u5199\u672C\u5730\u6587\u4EF6\u8DEF\u5F84");
			process.exit();
		}
	}
	confirm(confirmFn, init) {
		process.stdin.setEncoding("utf8");
		console.log(styles_default.yellow, `\u8BF7\u786E\u8BA4\u4E0A\u4F20\u4FE1\u606F\uFF1A`);
		confirmFn && confirmFn();
		console.log(styles_default.yellow, `\u786E\u8BA4\u5F00\u59CB\u4E0A\u4F20\u5417(N/y)\uFF1F`);
		process.stdin.on("data", (input) => {
			init && init(input);
		});
	}



	init(uploadFile, getToken, refreshInCloud, exit) {
		if (!uploadFile)
			return;
		const cb = async (list) => {
			// console.log('###########', list);
			this.filesList = await this.handleRepeatFile(list) // 去除已经上传的文件
			if (!this.filesList.length) {
				console.log(styles_default.yellow, "未找到可以上传的文件");
				return exit();
			}
			console.log(styles_default.yellow, "\u5F00\u59CB\u4E0A\u4F20...");
			let pb = new progress_default("\u4E0A\u4F20\u8FDB\u5EA6");
			this.filesList.map((file) => {
				if (getToken) file.token = getToken(file.key);
				uploadFile(file, (res, error) => {
					this.uploadFiles.push(file);
					if (!res) {
						this.errorFiles.push(file);
						console.log(styles_default.red, `\u4E0A\u4F20\u5931\u8D25\uFF1A${file.localFile}`);
						console.log(styles_default.red, `\u4E0A\u4F20\u5931\u8D25\u539F\u56E0\uFF1A${error}`);
					}
					pb.render({
						completed: this.uploadFiles.length,
						total: this.filesList.length
					});
					if (this.uploadFiles.length == this.filesList.length) {
						console.log(styles_default.green, "\u4E0A\u4F20\u5B8C\u6210\uFF01");
						if (this.errorFiles.length) {
							console.log(styles_default.red, this.errorFiles.map((res2) => `\u4E0A\u4F20\u5931\u8D25\uFF1A${res2.localFile}`).join("\n"));
							this.loadError(this.errorFiles);
						} else {
							this.loadSuccess(this.uploadFiles);
						}
						this.deleteOldFiles && this.deleteAlreadyUploadFile()
						// 写入log文件并上传
						this.uploadLog(getToken, uploadFile, refreshInCloud)

					}
				});
			});

		};

		utils_default.getFileList(cb, this.filePath, this.filePath, this.remoteFilePath, this.htmlPath, this.excludeHtml);
	}

	// 删除重复上传的文件
	deleteAlreadyUploadFile() {
		this.repeatFileList.forEach(item => {
			if (!item.key.endsWith('.html') && _fs.existsSync(item.localFile)) {
				_fs.unlinkSync(item.localFile)
			}
		})
		this.deleteEmptyDir(this.filePath)
	}
	deleteEmptyDir(filePath) {
		const files = _fs.readdirSync(filePath, {withFileTypes: true})
		if (files.length === 0) {
			_fs.rmdirSync(filePath);
		} else {
			for (const file of files) {
				if (file.isDirectory()) {
					const newPath = _path.resolve(filePath, file.name)
					this.deleteEmptyDir(newPath)
				}
			}
		}
	}

	async handleRepeatFile(allFiles) {
		const _this = this
		try {
			console.log('get data from url:', _this.jsonFilePath)
			// TODO:用过原生node https模块 序列化json数据的时候，数据量过大会出现 问题，没有解决到，所以换了axios来代替发送请求，如果可以舍弃axios用node模块减少依赖更好
			const res = await axios.get(_this.jsonFilePath, {
				params: {
					// 避免获取最新映射资源路劲被缓存
					_: Date.now()
				}
			});
			const resData = res.data

			_this.fileExistList = resData
			const pathList = _this.fileExistList.map(i => i.path)
			allFiles.forEach(e => {
				if (!pathList.includes(e.key)) {
					_this.newFileList.push(e)
				} else {
					_this.repeatFileList.push(e)
				}
			});
			// _this.newFileList = allFiles.filter(e => !pathList.includes(e.key))
			console.log('需要上传的新文件', _this.newFileList);
		} catch (error) {
			console.log(styles_default.yellow, 'not found file log'
			);

			_this.newFileList = allFiles
		}
		if (!_this.newFileList.length) {
			console.log(styles_default.blueBG, '没有新的文件需要上传到云'
			);
			process.exit();
		}


		return _this.newFileList
	}

	// 处理和上传日志文件
	uploadLog(getToken, uploadFile, refreshInCloud) {
		console.log("\n正在处理log日志文件...");
		const _this = this;
		// path.relative() 方法用于根据当前工作目录查找从给定路径到另一个路径的相对路径。

		if (!_fs.existsSync(_this.logLocalDirPath)) {
			_fs.mkdirSync(_this.logLocalDirPath);
		}
		const errorKeys = this.errorFiles.map(item => item.key) // 生成上传错误的key数组
		const successFiles = _this.newFileList.filter(item => !errorKeys.includes(item.key))
		const fd = _fs.openSync(`${_this.logLocalPath}`, 'w');

		_fs.writeFileSync(fd,
			JSON.stringify(
				_this.fileExistList
					.concat(
						successFiles.map(e => {
							return {
								path: e.key,
								updateTime: new Date().toLocaleString()
							}
						}).filter(item => !item.path.endsWith('.html'))
					)
			)
		)

		const logJsonFileName = `${this.fileLogPath}${this.logJsonFileName}${this.options.suffix}.json`
		const logFile = {key: logJsonFileName, localFile: _this.logLocalPath}
		if (getToken) {
			logFile.token = getToken(logJsonFileName);
		}
		uploadFile(logFile, (res, error) => {
			if (!res) {
				console.log(styles_default.red, `\u4E0A\u4F20\u5931\u8D25\uFF1A${file.localFile}`);
				console.log(styles_default.red, `\u4E0A\u4F20\u5931\u8D25\u539F\u56E0\uFF1A${error}`);
			}

			console.log(styles_default.green, "\u006c\u006f\u0067\u65e5\u5fd7\u6587\u4ef6\u4e0a\u4f20\u5b8c\u6210\u0021 \n");
			successFiles.push(logFile);
			this.enabledRefresh && refreshInCloud(successFiles)
		});
	}

};
var upload_default = Upload;

// src/upyun.ts
var UpyunUpload = class extends upload_default {
	constructor(opt) {
		super(opt);
		this.initFn = (input) => {
			if (this.uploading)
				return;
			input = input.toString().trim();
			if (["Y", "y", "YES", "yes"].indexOf(input) > -1) {
				this.uploading = true;
				this.init(this.uploadFile, null, () => {
					this.uploading = false;
					process.exit();
				});
			} else {
				process.exit();
			}
		};
		this.confirmFn = () => {
			console.log(styles_default.green, `---\u670D\u52A1\u540D\uFF1A${this.serviceName}`);
			console.log(styles_default.green, `---\u64CD\u4F5C\u5458\uFF1A${this.operatorName}`);
			console.log(styles_default.green, `---\u5BC6\u7801\uFF1A${this.password}`);
			console.log(styles_default.green, `---\u672C\u5730\u6587\u4EF6\u5939\u8DEF\u5F84\uFF1A${this.filePath}`);
			console.log(styles_default.green, `---\u4E0A\u4F20\u670D\u52A1\u5668\u8DEF\u5F84\uFF1A${this.remoteFilePath}`);
		};
		this.uploadFile = (file, cb) => {
			if (typeof this.sdk !== "object") {
				console.log(styles_default.red, "\u8BF7\u914D\u7F6Esdk\u5E76\u4FDD\u8BC1sdk\u662F\u4E2A\u5BF9\u8C61");
				process.exit();
			}
			if (!this.sdk.hasOwnProperty("Client") || !this.sdk.hasOwnProperty("Service")) {
				console.log(styles_default.red, "\u8BF7\u4FDD\u8BC1sdk\u662F\u53C8\u62CD\u4E91\u7684sdk--upyun");
				process.exit();
			}
			const client = new this.sdk.Client(new this.sdk.Service(this.serviceName, this.operatorName, this.password));
			client.putFile(file.key, _fs2.default.readFileSync(file.localFile)).then((res) => {
				cb(res);
			}).catch((error) => {
				cb(false, error);
			});
		};
		const {
			serviceName,
			operatorName,
			password
		} = opt;
		this.serviceName = serviceName || "";
		this.operatorName = operatorName || "";
		this.password = password || "";
		this.uploading = false;
		this.openConfirm ? this.confirm(this.confirmFn, this.initFn) : this.init(this.uploadFile);
	}
};
var upyun_default = UpyunUpload;

// src/qiniu.ts
var QiuNiuUpload = class extends upload_default {
	constructor(opt) {
		super(opt);
		const logLocalDirPath = this.logLocalDirPath
		const logLocalPath = this.logLocalPath
		this.initFn = (input) => {
			if (this.uploading)
				return;
			input = input.toString().trim();
			if (["Y", "y", "YES", "yes"].indexOf(input) > -1) {
				this.uploading = true;
				this.init(this.uploadFile, this.getToken, this.refreshInCloud, () => {
					this.uploading = false;
					process.exit();
				});
			} else {
				process.exit();
			}
		};
		this.refreshInCloud = (needRefreshArr = []) => {
			const _this = this
			var mac = new this.sdk.auth.digest.Mac(opt.accessKey, opt.secretKey);
			let cdnManager = new this.sdk.cdn.CdnManager(mac);

			//  Can refresh 100 one time
			let refreshQueue = _array.chunk(needRefreshArr, 100);
			console.log(`Refreshing ${needRefreshArr.length} files...`);
			refreshQueue.forEach((item, index) => {
				item = item.map((it) => {
					return (
						this.publicCdnPath + it.key
					);
				});
				cdnManager.refreshUrls(item, function (err, respBody, respInfo) {
					if (err) {
						console.log(styles_default.red, '刷新链接错误', err);
						process.exit()
					}
					if (respInfo.statusCode == 200) {
						console.log(styles_default.green, "\nRefreshInCloud Files Successful \n");
					}
					if (_fs.readdirSync(logLocalDirPath).length !== 0) {
						_fs.unlinkSync(`${logLocalPath}`)
					}
					process.exit()
				});
			});
		}

		this.confirmFn = () => {
			console.log(styles_default.green, `---ACCESS_KEY\uFF1A${this.sdk.conf.ACCESS_KEY}`);
			console.log(styles_default.green, `---SECRET_KEY\uFF1A${this.sdk.conf.SECRET_KEY}`);
			console.log(styles_default.green, `---\u4E0A\u4F20\u7A7A\u95F4\uFF1A${this.bucket}`);
			console.log(styles_default.green, `---\u7A7A\u95F4\u6587\u4EF6\u76EE\u5F55\uFF1A${this.uploadPath}`);
			console.log(styles_default.green, `---\u672C\u5730\u6587\u4EF6\u76EE\u5F55\uFF1A${this.fileDirectory}`);
		};
		this.getToken = (key) => {
			let putPolicy = new this.sdk.rs.PutPolicy({
				scope: `${this.bucket}:${key}`
			});
			return putPolicy.uploadToken();
		};
		this.uploadFile = (file, cb) => {
			let formUploader = new this.sdk.form_up.FormUploader();
			let extra = new this.sdk.form_up.PutExtra();
			formUploader.putFile(file.token || "", file.key, file.localFile, extra, (error, respBody, respInfo) => {
				if (error) {
					console.log('上传错误', error);
				}
				// if (respInfo.statusCode == 200) {
				//   console.log('respBody', respBody);
				// } else {
				//   console.log('statusCode', respInfo.statusCode);
				//   console.log('respBody', respBody);
				// }
				cb(respBody, error);
			});
		};
		this.opt = opt;
		if (typeof this.sdk !== "object") {
			console.log(styles_default.red, "\u8BF7\u914D\u7F6Esdk\u5E76\u4FDD\u8BC1sdk\u662F\u4E2A\u5BF9\u8C61");
			process.exit();
		}
		if (!this.sdk.hasOwnProperty("conf") || !this.sdk.hasOwnProperty("rs") || !this.sdk.hasOwnProperty("form_up")) {
			console.log(styles_default.red, "\u8BF7\u4FDD\u8BC1sdk\u662F\u4E03\u725B\u4E91\u7684sdk--qiniu");
			process.exit();
		}
		this.sdk.conf.ACCESS_KEY = opt.accessKey || "";
		this.sdk.conf.SECRET_KEY = opt.secretKey || "";
		this.bucket = opt.bucket || "";
		this.uploadPath = opt.remoteFilePath || "";
		this.fileDirectory = opt.filePath || "";
		this.token = "";
		this.uploading = false;
		this.openConfirm ? this.confirm(this.confirmFn, this.initFn) : this.init(this.uploadFile, this.getToken, this.refreshInCloud);
	}
};
var qiniu_default = QiuNiuUpload;


var AwsUpload = class extends upload_default {
	constructor(opt) {
		super(opt);
		const credentials = {
			accessKeyId: opt.accessKey,
			secretAccessKey: opt.secretKey,
		}; //秘钥形式的登录上传
		this.sdk.config.update(credentials);
		this.sdk.config.region = REGION
		this.cloudfront = new this.sdk.CloudFront();
		this.bucket = new this.sdk.S3({params: {Bucket: opt.bucket}})
		const logLocalDirPath = this.logLocalDirPath
		const logLocalPath = this.logLocalPath
		this.initFn = (input) => {
			if (this.uploading)
				return;
			input = input.toString().trim();
			if (["Y", "y", "YES", "yes"].indexOf(input) > -1) {
				this.uploading = true;
				this.init(this.uploadFile, null, this.refreshInCloud, () => {
					this.uploading = false;
					process.exit();
				});
			} else {
				process.exit();
			}
		};
		this.refreshInCloud = () => {
			console.log(styles_default.yellow, '开始刷新...');
			const newfilePath = this.newFileList.map(item => '/' + item.key)
			console.log(newfilePath);
			var params = {
				DistributionId: opt.awsDistributionId, /* required */
				InvalidationBatch: { /* required */
					CallerReference: Date.now().toString(), /* required */
					Paths: { /* required */
						Quantity: newfilePath.length, /* required */
						Items: newfilePath,
					}
				}
			};
			this.cloudfront.createInvalidation(params, function (err, data) {
				if (err) console.log(err, err.stack); // an error occurred
				else console.log(data);           // successful response
				console.log(styles_default.green, '刷新链接成功');
				console.log(logLocalDirPath);
				if (_fs.readdirSync(logLocalDirPath).length !== 0) {
					_fs.unlinkSync(`${logLocalPath}`)
				}
				process.exit()
			});
		}
		this.confirmFn = () => {
			console.log(styles_default.green, `---ACCESS_KEY\uFF1A${opt.accessKey}`);
			console.log(styles_default.green, `---SECRET_KEY\uFF1A${opt.secretKey}`);
			console.log(styles_default.green, `---\u4E0A\u4F20\u7A7A\u95F4\uFF1A${opt.bucket}`);
			console.log(styles_default.green, `---\u7A7A\u95F4\u6587\u4EF6\u76EE\u5F55\uFF1A${this.uploadPath}`);
			console.log(styles_default.green, `---\u672C\u5730\u6587\u4EF6\u76EE\u5F55\uFF1A${this.fileDirectory}`);
		};
		this.uploadFile = (file, cb) => {
			const fileStream = _fs.createReadStream(file.localFile);
			const fileType = mime.getType(file.localFile)
			var params = {Key: file.key, ContentType: fileType, Body: fileStream, 'Access-Control-Allow-Credentials': '*', 'ACL': 'public-read'};
			this.bucket.upload(params, function (error, respBody) {
				if (error) {
					console.log('上传错误', error);
				}
				cb(respBody, error);
			});
		};
		this.opt = opt;
		if (typeof this.sdk !== "object") {
			console.log(styles_default.red, "\u8BF7\u914D\u7F6Esdk\u5E76\u4FDD\u8BC1sdk\u662F\u4E2A\u5BF9\u8C61");
			process.exit();
		}
		this.uploadPath = opt.remoteFilePath || "";
		this.fileDirectory = opt.filePath || "";
		this.token = "";
		this.uploading = false;
		this.openConfirm ? this.confirm(this.confirmFn, this.initFn) : this.init(this.uploadFile, null, this.refreshInCloud);
	}
};
var aws_default = AwsUpload;

// src/alioss.ts

var AliOssUpload = class extends upload_default {
	constructor(opt) {
		super(opt);
		this.initFn = (input) => {
			if (this.uploading)
				return;
			input = input.toString().trim();
			if (["Y", "y", "YES", "yes"].indexOf(input) > -1) {
				this.uploading = true;
				this.init(this.uploadFile, null, () => {
					this.uploading = false;
					process.exit();
				});
			} else {
				process.exit();
			}
		};
		this.confirmFn = () => {
			console.log(styles_default.green, `---accessKeyId\uFF1A${this.accessKeyId}`);
			console.log(styles_default.green, `---secretAccessKey\uFF1A${this.secretAccessKey}`);
			console.log(styles_default.green, `---\u5730\u57DF\u8282\u70B9\uFF1A${this.endpoint}`);
			console.log(styles_default.green, `---\u4E0A\u4F20\u7A7A\u95F4\uFF1A${this.bucket}`);
		};
		this.uploadFile = (file, cb) => {
			if (typeof this.sdk !== "object") {
				console.log(styles_default.red, "\u8BF7\u914D\u7F6Esdk\u5E76\u4FDD\u8BC1sdk\u662F\u4E2A\u5BF9\u8C61");
				process.exit();
			}
			if (!this.sdk.hasOwnProperty("OSS")) {
				console.log(styles_default.red, "\u8BF7\u4FDD\u8BC1sdk\u662F\u963F\u91CC\u4E91\u7684sdk--aliyun-sdk");
				process.exit();
			}
			if (typeof this.ossUploadStream !== "function") {
				console.log(styles_default.red, "\u8BF7\u5F15\u5165\u914D\u7F6EossUploadStream--aliyun-oss-upload-stream");
				process.exit();
			}
			const ossStream = this.ossUploadStream(new this.sdk.OSS({
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey,
				endpoint: this.endpoint,
				apiVersion: this.apiVersion
			}));
			const upload = ossStream.upload({
				Bucket: this.bucket,
				Key: file.key
			});
			const read = _fs2.default.createReadStream(file.localFile);
			read.pipe(upload);
			upload.on("uploaded", function (details) {
				console.log("details:", details);
				cb(details);
			});
			upload.on("error", function (error) {
				cb(false, error);
			});
		};
		const {
			accessKeyId,
			secretAccessKey,
			endpoint,
			apiVersion,
			bucket,
			ossUploadStream
		} = opt;
		this.accessKeyId = accessKeyId || "";
		this.secretAccessKey = secretAccessKey || "";
		this.endpoint = endpoint || "";
		this.apiVersion = apiVersion || "2013-10-15";
		this.bucket = bucket || "";
		this.uploading = false;
		this.ossUploadStream = ossUploadStream;
		this.openConfirm ? this.confirm(this.confirmFn, this.initFn) : this.init(this.uploadFile);
	}
};
var alioss_default = AliOssUpload;


// exports.AliOssUpload = alioss_default; exports.QiuNiuUpload = qiniu_default; exports.UpyunUpload = upyun_default;
var _upload = {
	AliOssUpload: alioss_default,
	QiuNiuUpload: qiniu_default,
	UpyunUpload: upyun_default,
	AwsUpload: aws_default
}
// var _upload = require('@puhaha/upload-oss');
function upyunPlugin(option) {
	return {
		name: "upyun-plugin",
		closeBundle() {
			new (0, _upload.UpyunUpload)(option);
		}
	};
}

// src/qiniu.ts

function qiniuPlugin(option) {
	return {
		name: "qiniu-plugin",
		closeBundle() {
			new (0, _upload.QiuNiuUpload)(option);
		}
	};
}

// src/alioss.ts

function aliossPlugin(option) {
	return {
		name: "alioss-plugin",
		closeBundle() {
			new (0, _upload.AliOssUpload)(option);
		}
	};
}

function awsPlugin(option) {
	return {
		name: "aws-plugin",
		closeBundle() {
			new (0, _upload.AwsUpload)(option);
		}
	};
}

function uploadPlugin(option) {
	try {
		switch (option.sdkName) {
			case 'qiniu':
				return qiniuPlugin(option)
			case 'aws':
				return awsPlugin(option)
			case 'alioss':
				return aliossPlugin(option)
			case 'upyun':
				return upyunPlugin(option)
			default:
				break;
		}
	} catch (error) {
		console.log(error);
	}
}

exports.aliossPlugin = aliossPlugin; exports.qiniuPlugin = qiniuPlugin; exports.upyunPlugin = upyunPlugin; exports.awsPlugin = awsPlugin; exports.uploadPlugin = uploadPlugin;

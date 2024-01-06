// eslint-disable
const path = require("path");
// eslint-disable-next-line no-undef
const SftpClient = require("ssh2-sftp-client");

const sftp = new SftpClient();

let options = {
	port:"",
	host: "", // sftp地址
	username:"",
	password:"",
	localPath:path.join(__dirname, "dist/index.html")
};

const { port, host, username, password} = options;
sftp.connect({
	host,
	port,
	username,
	password
}).then(async() => {
	await sftp.put(options.localPath, "/html/index.html");
	console.log("str===>>>>上传结束");
	return Promise.resolve();
})
	.then((res)=>{
		sftp.end();
	})
	.catch((err) => {
		console.log(err);
		sftp.end();
	});



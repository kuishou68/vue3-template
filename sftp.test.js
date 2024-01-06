const path = require("path");
const SftpClient = require("ssh2-sftp-client");

const sftp = new SftpClient();

let options = {
	port:"",
	host: "", // sftp地址
	username:"",
	password:"",
	localPath:path.join(__dirname, "dist/index.html"),
	remotePath:"/html/index.html"
};

const { port, host, username, password, localPath, remotePath } = options;
sftp.connect({
	host,
	port,
	username,
	password
}).then(() => {
	// sftp.rmdir(remotePath, true)
}).then(() => {
	let promiste = sftp.put(options.localPath, options.remotePath);
	console.log("远程==>", options.remotePath);
	promiste.then((a)=>{
		console.log("str===>>>>上传完毕");
	});
	return promiste;
})
	.then((res)=>{
		sftp.end();
	})
	.catch((err) => {
		console.log(err);
		sftp.end();
	});



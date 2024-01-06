import axios from "axios";
import Cookie from "js-cookie";
import constant from "@/utils/constant";
import {getSessionExpiryDate} from "@/utils/util";
import { h } from 'vue';
import {message, Modal} from 'ant-design-vue';

// 跨域认证信息 header 名
const xsrfHeaderName = "Authorization";
const TOKEN_KEY = "bearerToken";

axios.defaults.timeout = 60000;//请求超时时间,慢接口会有影响,表现为network中的超时请求会被取消
axios.defaults.withCredentials = false;//请求是否携带cookie,默认false,如果是false的话,跨域不会携带cookie(跨域携带cookie需要同时sameSite:None && (secure:true||httpOnly:true))
axios.defaults.xsrfHeaderName = xsrfHeaderName;
axios.defaults.xsrfCookieName = xsrfHeaderName;
axios.defaults.headers.common["product"] = constant.product

if(Cookie.get(xsrfHeaderName)){
	axios.defaults.headers.common[xsrfHeaderName] = Cookie.get(xsrfHeaderName)||"";
}

// const logger = new SlsTracker(constant.reqLog);

// http method
const METHOD = {
	GET: "get",
	POST: "post",
	PUT: "put",
	DELETE: "delete"
};

/**
 * axios请求
 * @param url 请求地址
 * @param method {string} http method
 * @param params 请求参数
 * @param config
 * @returns {Promise<AxiosResponse<T>>}
 */
async function request(url, method, params={}, config={}) {
	switch (method) {
		case METHOD.GET:
			return axios.get(url, {params, ...config});
		case METHOD.POST:
			return axios.post(url, params, config);
		case METHOD.PUT:
			return axios.put(url, params, config);
		case METHOD.DELETE:
			return axios.delete(url, {data:params, ...config});
		default:
			return axios.get(url, {params, ...config});
	}
}

/**
 * 设置认证信息
 * @param auth {Object}
 */
function setAuthorization(auth) {
	let sessionExpiryDate = getSessionExpiryDate();
	axios.defaults.headers.common[xsrfHeaderName] = "Bearer "+auth.accessToken;
	Cookie.set(xsrfHeaderName, "Bearer "+auth.accessToken, {expires: sessionExpiryDate});

}

/**
 * 移出认证信息
 */
function removeAuthorization() {
	Cookie.remove(xsrfHeaderName);
	Cookie.remove(TOKEN_KEY);
}

/**
 * 检查认证信息
 * @returns {boolean}
 */
function checkAuthorization() {
	return !!Cookie.get(xsrfHeaderName);
}

/**
 * 加载 axios 拦截器
 * @param interceptors
 * @param options
 */
function loadInterceptors(interceptors, options) {
	const {request, response} = interceptors;
	// 加载请求拦截器
	request.forEach((item) => {
		let {onFulfilled, onRejected} = item;
		if (!onFulfilled || typeof onFulfilled !== "function") {
			onFulfilled = (config) => {
				return config;
			};
		}
		if (!onRejected || typeof onRejected !== "function") {
			onRejected = (error) => {
				return Promise.reject(error);
			};
		}
		axios.interceptors.request.use(
			(config) => {
				return onFulfilled(config, options);
			},
			(error) => {
				return onRejected(error, options);
			}
		);
	});
	// 加载响应拦截器
	response.forEach((item) => {
		let {onFulfilled, onRejected} = item;
		if (!onFulfilled || typeof onFulfilled !== "function") {
			onFulfilled = (response) => {
				return response;
			};
		}
		if (!onRejected || typeof onRejected !== "function") {
			onRejected = (error) => {
				return Promise.reject(error);
			};
		}
		axios.interceptors.response.use(
			(response) => {
				return onFulfilled(response, options);
			},
			(error) => {
				return onRejected(error, options);
			}
		);
	});
}

/**
 * 解析 url 中的参数
 * @param url
 * @returns {Object}
 */
function parseUrlParams(url) {
	const params = {};
	if (!url || url === "" || typeof url !== "string") {
		return params;
	}
	const paramsStr = url.split("?")[1];
	if (!paramsStr) {
		return params;
	}
	const paramsArr = paramsStr.replace(/&|=/g, " ").split(" ");
	for (let i = 0; i < paramsArr.length / 2; i++) {
		const value = paramsArr[i * 2 + 1];
		params[paramsArr[i * 2]] = value === "true" ? true : (value === "false" ? false : value);
	}
	return params;
}

/**
 * 清除身份并跳转到登录页面
 */
function toLogin(){
	// 清除缓存,退到登录页面
	localStorage.clear();
	removeAuthorization();

	setTimeout(() => {
		location.href = "/login";
	}, 1000);
}

/**
 * 接口鉴权
 * @param data
 * @param response
 */
function checkAuth(data) {
	// 认证失败
	if (data && ([401, 403].includes(data.code))) {
		message.error('认证失败,请重试!');
		toLogin();
	}
}

/**
 * 请求异常
 * @param error
 */
function requestError(error) {
	let {status:code} = (error.response || {});
	let {url} = (error.config || {});
	let msg= "";
	switch (code){
		case 401:
			checkAuth({code});
			return;
		case 404:
			msg="接口不存在";
			console.log(url);
			break;
		case 500:
		case 501:
		case 502:
		case 503:
			msg="服务器异常,请稍后重试";
			break;
		default:
			msg="请求异常,请稍后重试";
	}
	console.error(error);
	window.hideBKLoading();
	console.log("这段信息需要用 message 弹出☎️☎️☎️☎️☎️3333", msg);
	message.error(`${msg}`);
}

/**
 * 请求失败
 * @param res
 * @param msg
 */
function requestFail(res, msg = "操作失败,请重试") {
	let {data} = res;
	if (data && data.msg !== undefined && data.msg.length > 0) {
		msg = data.msg;
	}

	if(msg.length>100){ //错误字符超过100个用弹窗提示
		Modal.error({
			title: '请求错误',
			width: '50%',
			maskClosable: 'true',
			content: h('div', {style: 'height: 500px; overflow-y: scroll;'}, [
				h('p', `${msg}`),
			]),
			onOk() {
				console.log('ok');
			},
		});
	} else {
		msg = msg.substr(0, 100);
		message.error(`${msg}`);
	}


	checkAuth(data, res);
}

export {
	METHOD,
	xsrfHeaderName,
	TOKEN_KEY,
	request,
	setAuthorization,
	removeAuthorization,
	checkAuthorization,
	loadInterceptors,
	parseUrlParams,
	requestFail,
	requestError
};

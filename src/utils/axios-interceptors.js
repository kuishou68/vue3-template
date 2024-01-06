import Cookie from "js-cookie";
import constant from "@/utils/constant";

/**
 * 401,403拦截
 * @type {{onFulfilled(*, *): *, onRejected(*, *): Promise<never>}}
 */
const serverAuthError = {
	/**
	 * 响应数据之前做点什么
	 * @param response 响应对象
	 * @param options 应用配置 包含: {router, i18n, store, message}
	 * @returns {*}
	 */
	onFulfilled(response, options) {
		if (response.status === 403) {
			options.message.error({
				content: "系统认证失败,请重试"
			});
		}
		return response;
	},
	/**
	 * 响应出错时执行
	 * @param error 错误对象
	 * @param options 应用配置 包含: {router, i18n, store, message}
	 * @returns {Promise<never>}
	 */
	onRejected(error, options) {
		let{status} = error.response||{};
		if([403, 401].includes(status)) {
			options.message.error({
				content: "系统认证失败,请重试"
			});
			//TODO 跳转到登录
			// authService.login.logout();
			// Vue.prototype.bus.$emit("closeAllTabs");
			options.router.replace("/login", ()=>{});
		}
		return error;
	}
};
/**
 * 博卡认证失败
 * @type {{onFulfilled(*, *): *}}
 */
const responseBk403 = {
	onFulfilled(response, options) {
		if (response.status === 200) {
			let {data} = response;
			if (data && data.code === 403) {
				options.message.error({
					content: "认证失败,请重试"
				});
				//TODO 跳转到登录
				// authService.login.logout();
				// Vue.prototype.bus.$emit("closeAllTabs");
				options.router.replace("/login", ()=>{});
			}
		}
		return response;
	}
};
const responseError = {
};

const reqCommon = {
	/**
	 * 发送请求之前做些什么
	 * @param config axios config
	 * @param options 应用配置 包含: {router, i18n, store, message}
	 * @returns {*}
	 */
	onFulfilled(config, options) {
		const {message} = options;
		const {url, xsrfCookieName} = config;
		const pageNameDict=["login"];// 这个页面的请求不用校验token
		if (url.indexOf("login") === -1 && xsrfCookieName && !Cookie.get(xsrfCookieName) && pageNameDict.indexOf(options.router.currentRoute.value.name)) {
			message.warning("认证 token 已过期，请重新登录");
		}
		return config;
	},
	/**
	 * 请求出错时做点什么
	 * @param error 错误对象
	 * @param options 应用配置 包含: {router, i18n, store, message}
	 * @returns {Promise<never>}
	 */
	onRejected(error, options) {
		const {message} = options;
		message.error(error.message);
		return Promise.reject(error);
	}
};

/**
 * 服务器时间
 * @type {{onFulfilled(*): *}}
 */
const responseServerTime={
	onFulfilled(response){
		if(!Date.SERVER_TIME){//本地没有服务器时间
			Date.prototype._serverTimeDiff = 0;
			Object.defineProperty(Date, "SERVER_TIME", {
				get: function() {
					// return new Date(Date.prototype._serverTime);
					let tmp = new Date().getTime() + Date.prototype._serverTimeDiff;
					return new Date(tmp);
				}
			});
		}

		if(response && response.config && response.config.url){//TODO 更新本地缓存的服务器时间
			if(response.config.url.indexOf(constant.apiURl)==0){//
				if(response.headers && response.headers.date){//有服务器时间,更新本地时间
					{//定义服务器时间
						if(!Date.SERVER_TIME){//本地没有服务器时间
							// console.warn("=========== 创建")
							Date.prototype._serverTimeDiff = new Date().getTime() - new Date(response.headers.date).getTime();

							Object.defineProperty(Date, "SERVER_TIME", {
								get: function() {
									let tmp = new Date().getTime() + Date.prototype._serverTimeDiff;
									return new Date(tmp);
								}
							});
						}else{//本地已经有服务器时间了,更新一下
							Date.prototype._serverTimeDiff = new Date().getTime() - new Date(response.headers.date).getTime();
						}
					}
				}
			}
		}
		return response;
	}
};

export default {
	request: [reqCommon], // 请求拦截
	response: [serverAuthError, responseBk403, responseError, responseServerTime] // 响应拦截
};

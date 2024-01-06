import {loginIgnore} from '@/router/index'
import {checkAuthorization} from '@/utils/request'
import NProgress from 'nprogress'
import {useRouter} from "vue-router";
import {getStorage} from "@/utils/util";

NProgress.configure({showSpinner: false})

const $router = useRouter();
/**
 * 进度条开始
 * @param to
 * @param from
 * @param next
 */
const progressStart = (to, from, next) => {
	// start progress bar
	if (!NProgress.isStarted()) {
		NProgress.start()
	}
	next()
}

/**
 * 登录守卫
 * @param to
 * @param from
 * @param next
 * @param options
 */
const loginGuard = (to, from, next, options) => {
	const {message} = options
	// if (!loginIgnore.includes(to) && !checkAuthorization()) {
	// 	message.warning('登录已失效，请重新登录')
	// 	next({path: '/login'})
	// } else {
		//已登录,获取登录用户资料
		next()
	// }
}

/**
 * 权限守卫
 * @param to
 * @param from
 * @param next
 * @param options
 */
const authorityGuard = (to, from, next) => {
	let noLoadPage = ['login']; //不需要加载资料的页面
	if (!noLoadPage.includes(to.name) && checkAuthorization()) {
		const user = JSON.parse(getStorage("user"));
		const { userInfo } = user;
		// console.log("userInfo", userInfo);
		if(userInfo.id){
			next();
		}
	} else {
		next()
	}

}

/**
 * 进度条结束
 * @param to
 * @param form
 * @param options
 */
const progressDone = () => {
	// 进度条
	NProgress.done()
}

export default {
	beforeEach: [progressStart, loginGuard, authorityGuard],
	afterEach: [progressDone]
}


import filterList from "@/utils/common.filter";
import {loadGuards, setAppOptions} from "@/utils/routerUtil";
import {loadInterceptors} from "@/utils/request";
import axiosInterceptors from "@/utils/axios-interceptors";
import guards from "@/router/guards";

const bootstrap=(app, {router, store, message})=>{
	//配置全局filter
	app.config.globalProperties.$filters = filterList;

	// 公共信息缓存下来
	setAppOptions({router, store, message});

	//1. 加载路由
	// loadRoutes

	//1. 加载请求/响应拦截器
	loadInterceptors(axiosInterceptors, {router, store, message});

	//1. 加载守卫
	loadGuards(guards, {router, store, message});

};
export default bootstrap;

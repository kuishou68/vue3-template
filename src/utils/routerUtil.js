let appOptions={};

/**
 * 设置应用配置
 * @param options
 */
function setAppOptions(options) {
	const {router, store, message} = options;
	appOptions.router = router;
	appOptions.store = store;
	appOptions.message = message;
}

/**
 * 加载导航守卫
 * @param guards
 * @param options
 */
function loadGuards(guards, options) {
	const {beforeEach, afterEach} = guards;
	const {router} = options;

	//前置守卫
	beforeEach.forEach((guard) => {
		if (guard && typeof guard === "function") {
			router.beforeEach((to, from, next) => {
				return guard(to, from, next, options);
			});
		}
	});

	//后置守卫
	afterEach.forEach((guard) => {
		if (guard && typeof guard === "function") {
			router.afterEach((to, from) => {
				return guard(to, from, options);
			});
		}
	});
}

export {
	loadGuards,
	setAppOptions
};

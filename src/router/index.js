import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

/**
 * 不需要登录拦截的路由配置
 * @type {{names: [string, string], paths: [string], includes(*): boolean}}
 */
const loginIgnore = {
    names: ['404', '403'], // 根据路由名称匹配
    paths: ['/login'], // 根据路由fullPath匹配
    /**
     * 判断路由是否包含在该配置中
     * @param route vue-router 的 route 对象
     * @returns {boolean}
     */
    includes(route) {
        return this.names.includes(route.name) || this.paths.includes(route.path)
    }
}

function initRouter() {
    return createRouter({
        // https://router.vuejs.org/zh/api/interfaces/RouterOptions.html
        history: createWebHistory('/'),
        routes: [
            {
                path: '/',
                name: 'root',
                meta: {
                    keepAlive: true
                },
                component: () => {
                    return import('@/views/layout/RootView.vue')
                },
                redirect: 'home',
                children: [
                    {
                        path: '/setting',
                        name: 'setting',
                        meta: {
                            tabKey: 'setting',
                            title: '参数设置',
                            closable: false
                        },
                        component: () => {
                            return import('@/views/setting/SettingView.vue')
                        }
                    },
                    {
                        path: '/overallBoard',
                        name: 'overallBoard',
                        meta: {
                            tabKey: 'overallBoard',
                            title: '总体数据看板',
                            closable: false
                        },
                        component: () => {
                            return import('@/views/dataBoard/OverallBoardView.vue')
                        }
                    },
                ]
            },
            {
                path: '/login',
                name: 'login',
                component: () => {
                    return import('@/views/login/LoginView.vue')
                }
            },
            {
                path: '/lock',
                name: 'lock',
                component: () => {
                    return import('@/views/login/LockScreenView.vue')
                }
            },
            {
                path: '/:pathMatch(.*)*',
                redirect: 'login'
            }
        ]
    });
}
export { initRouter, loginIgnore }

// import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getStorage } from "@/utils/util";

export const userStore = defineStore('user',{
    state: () => {
        return {
            userInfo: {}
        }
    },
    persist: {
        enabled: true,
        // 自定义持久化参数
        strategies: [
            {
                // 自定义key
                key: 'user',
                // 自定义存储方式，默认sessionStorage
                storage: localStorage, // localStorage,
                // 指定要持久化的数据，默认所有 state 都会进行缓存，可以通过 paths 指定要持久化的字段，其他的则不会进行持久化。
                paths: ['userInfo']
            }
        ]
    },
    // 相当于计算属性(有数据缓存)
    getters: {
        getUserInfo(state) {
            return state.userInfo;
        }
    },
    // actions即可以是同步函数也可以是异步函数
    actions: {
        loadLoginUser(userInfo){
            // 可以从 storage 中取，也可以掉接口异步查询
            this.userInfo = userInfo || JSON.parse(getStorage('userInfo')) || {};
        }
    }
});


import 'ant-design-vue/dist/reset.css';
import "./utils/common.less";
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import {initRouter} from "./router/index";
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { message } from 'ant-design-vue'
import dayjs from "dayjs";
import piniaPluginPersist from 'pinia-plugin-persist';
import bootstrap from "../bootstrap";


const router = initRouter();
const app = createApp(App);
const store = createPinia()
store.use(piniaPluginPersist);

window.addEventListener(
    "click",
    () => {
        // 为了方便，我们把点击事件的时间直接存到sessionStorage中去，这样方便获取比较
        sessionStorage.setItem("lastClickTime", new Date().getTime());
    },
    true
);
// 全局提示
message.config({
    top: `100px`,
    duration: 2,
    maxCount: 3,
    rtl: true,
    prefixCls: 'my-message',
});

app.config.globalProperties.day=dayjs; //全局挂载 dayjs
app.use(store);
app.use(router);
app.mount('#app')
app.echarts=echarts

bootstrap(app, {
    router,
    store,
    message: message
})

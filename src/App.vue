
<template>
  <div>
    <a-config-provider :locale="locale" :theme="{ token: { colorPrimary: themeState.themes && themeState.currTheme ? themeState.themes[themeState.currTheme].themeColor1 : '#4A51FF', } }" >
      <RouterView />
    </a-config-provider>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import {ref, reactive, provide, onMounted, onBeforeUnmount } from 'vue'
import {useRouter} from "vue-router";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { themeStore } from '@/stores/theme';

dayjs.locale('zh-cn');

provide('ec', echarts);

// 国际化配置-默认中文
const locale = ref(zhCN);
const $router = useRouter();
const themeState = themeStore();

let timer = reactive(null)
// let showLock = ref(false);

onMounted(() => {
  // 初始化主题色
  themeState.getTheme && themeState.getTheme('themeColor');
  isTimeOut();
});
onBeforeUnmount(() => {
  // 最后一步，离开页面的时候，清除一下定时器，也解绑点击事件
  clearInterval(timer);
  window.removeEventListener("click", () => {}, true);
});

const isTimeOut = () => {
    // 使用定时器之前，要清除一下定时器
    clearInterval(timer);
    timer = setInterval(() => {
        let lastClickTime = sessionStorage.getItem("lastClickTime") * 1; // 把上次点击时候的字符串时间转换成数字时间
        let nowTime = new Date().getTime(); // 获取当前时间
        // console.log("当前时间和之前点击时间", nowTime, lastClickTime);
        // 监听页面是否处于活动状态
        document.addEventListener('visibilitychange', ()=> {
            // 没操作状态下
            if(document.hidden && !themeState.showLock.value){
                // 5秒钟不进行点击操作，就开始锁屏
                if (nowTime - lastClickTime > 1000 * 5) {
                    console.log("---------------开始锁屏----------------")
                    // 这里要清除定时器，结束任务
                    clearInterval(timer);
                    // 锁屏
                    // themeState.showLock = true;
                }
            }
        });
    }, 600000);
}
const unlock = () => {
    console.log("---------------手动解锁----------------")
    themeState.showLock = false;
    $router.replace({name: "home"});
}

</script>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>

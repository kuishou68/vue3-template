
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
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { themeStore } from '@/stores/theme';

dayjs.locale('zh-cn');

provide('ec', echarts);

// 国际化配置-默认中文
const locale = ref(zhCN);
const themeState = themeStore();

onMounted(() => {
  // 初始化主题色
  themeState.getTheme && themeState.getTheme('themeColor');
});
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

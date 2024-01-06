
<template>
    <div class="aside" >
        <div class="logoInfo" >
        </div>
        <div class="menuInfo">
            <a-menu
                v-model:openKeys="openKeys"
                v-model:selectedKeys="selectedKeys"
                popupClassName="customMenuClassName"
                mode="inline"
                :items="menuItems"
                :inline-collapsed="themeState.sideCollapsed"
                @click="handleClick"
            ></a-menu>
        </div>
        <div class="footerLogo">
        </div>
    </div>
</template>
<script setup>
import { reactive, ref, watch, h } from 'vue';
import { PieChartOutlined, LineChartOutlined, SettingOutlined } from '@ant-design/icons-vue';
import {useRoute, useRouter} from 'vue-router'
import { onMounted } from 'vue'
import {themeStore} from "@/stores/theme";

const route = useRoute();
const $router = useRouter()
const themeState = themeStore();

let selectedKeys = ref(['']);
let openKeys = ref(['overallBoard']); // compPanel dataAnalysis

let analyticRecord = ref({});
let menuItems = ref([
  { label: "数据看板", key: "overallBoard", disable: false, icon: () => h(LineChartOutlined), children: null },
    { label: "设置", key: "setting", disable: false, icon: () => h(SettingOutlined), children: null },
]);

onMounted(() => {
    // 通过 url 关联当前选择菜单
    selectedKeys.value = [route.name];
    // 初始化菜单
    initMenuItem();
});

const initMenuItem = () => {
    let isDisabled = false;
    menuItems.value.forEach((item) => {
        if(item.children && item.children.length > 0){
            // 没有分析时间，默认禁用第二层菜单，否者打开对应菜单查不到结果
            item.children.forEach((cItem) => {
                cItem.disable = isDisabled;
                // 根据路由对比二级菜单，默认选中一级菜单
                if(cItem.key === route.name){
                    openKeys.value = [item.key];
                }
            })
        }
    })
};

/**
 * disabled  是否禁用
 * key 路由path 唯一标识
 * icon  菜单图标
 * key  item 的唯一标志
 * label  菜单项标题
 * title  设置收缩时展示的悬浮标题
 * @param label
 * @param key
 * @param icon
 * @param children
 */
const getItem = (label, key, disabled, icon, children) => {
    return {
        label,
        key,
        disabled,
        icon,
        children,
    };
}

const handleClick = ({item, key, keyPath}) => {
    $router.push({name: key });
    // emit('click', keyPath);
};
watch(openKeys, val => {
    // console.log('openKeys', val);
});
</script>

<style scoped lang="less">
@import (reference) '@/utils/common';
.aside {
    //width: 224px;
    //background: @themeColor1; // @theme;
    background-image: linear-gradient(to right bottom, @themeColor2, @themeColor7);
    border-radius: 16px 16px 16px 16px;
    opacity: 1;
    height: 93vh;
    margin: -15px 16px 28px 16px;
    position: relative;
    //margin-top: -15px;
    transition: all 0.3s ease;

    .logoInfo {
        text-align: center;
        padding: 18px 0;

        //img {
        //    width: 200px;
        //    height: 40px;
        //}
    }

    .menuInfo {
        //padding: 0 16px;
        //height: 80vh;
        height: calc(100% - 137px);;
        .overflow-scroll;
        //&::-webkit-scrollbar {
        //    width: 0;
        //    height: 0;
        //}
    }

    .footerLogo{
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        padding: 16px 0;
        //margin-bottom: 12px;
    }
}
.customMenuClassName{
    width: 224px;
    //background: @themeColor1; // @theme;
    background-image: linear-gradient(to right bottom, @themeColor2, @themeColor7);
    color: #ffffff;
    border: none;
    
}
:deep(.ant-menu){
    //background: @themeColor1; // @theme;
    background-image: linear-gradient(to right bottom, @themeColor2, @themeColor7);
    color: #ffffff;
    border: none;
    .ant-menu-submenu, .ant-menu-submenu-inline {
        color: #ffffff;
    }
    .ant-menu-submenu, .ant-menu-submenu-inline:hover{
        //color: #ffffff;
        //.ant-menu-title-content{
            color: #FFED46;
        //}
    }
    .ant-menu-submenu-selected, .ant-menu-submenu-title{
        color: #ffffff;
    }
    .ant-menu-light .ant-menu-item-selected{
    
    }
}
</style>

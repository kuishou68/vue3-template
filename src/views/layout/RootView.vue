<template>
    <div class="rootView">
        <main class="main">
            <!--  头部栏  -->
            <header class="header">
                <header-comp >
                    <template #left>
                        <div class="collapsible-box" :style="{'margin-left': themeState.sideCollapsed ? '93px' : '224px' }">
                          <MenuUnfoldOutlined v-if="themeState.sideCollapsed" class="trigger" @click="changeCollapsed"/>
                          <MenuFoldOutlined v-else class="trigger" @click="changeCollapsed"/>
                        </div>
                    </template>
                </header-comp>
            </header>
            <div class="content">
                <!-- 侧边栏 -->
                <side-bar :collapsed="themeState.sideCollapsed" :style="{'width': themeState.sideCollapsed ? '80px' : '224px'}"/>
                <!--  主体面板  -->
                <article class="article" :style="{width: `calc(100% - ${themeState.sideCollapsed ? '127' : '270'}px)`}">
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component v-if="$route.meta.keepAlive" :is="Component" :key="$route.fullPath" />
                        </keep-alive>
                    </router-view>
                </article>
            </div>
            <!--  底部栏  -->
            <footer>
            </footer>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { themeStore } from "@/stores/theme";

import SideBar from "@/views/layout/SideBar.vue"
import HeaderComp from "@/views/layout/HeaderComp.vue";
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';

const themeState = themeStore();

onMounted(() => {
});

const changeCollapsed = () => {
  // console.log("themeState.sideCollapse", themeState.sideCollapsed);
  themeState.setCollapsed();
}

</script>

<style lang="less" scoped>
@import (reference) '@/utils/common';
.rootView{
    background: @themeColor4; // #EDF2FF;
    //background-image: linear-gradient(to right bottom, @themeColor1, @themeColor7);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    .main{
        width: 100%;
        //width: 100vw;
        height: 100vh;
        background: #EDF2FF;
        //background: @themeColor4; // #EDF2FF;
        //background-image: linear-gradient(to right bottom, @themeColor2, @themeColor7);
        border-radius: 0px 0px 0px 0px;
        opacity: 1;
        .header{
            height: 56px;
            background:  #FFFFFF; // @themeColor1;
            border-radius: 0px 0px 0px 0px;
            opacity: 1;
            .collapsible-box{
            }
        }
        .content{
            display: flex;
            width: 100%;
            background-size: 130%;
            background-repeat: no-repeat;
            background-position-x: 50%;
            //background-image: linear-gradient(to right bottom, @themeColor7, @themeColor4);

            .article{
                //width: 100%;
                height: 100%;
                margin: 12px;
                //background: rgba(255,255,255,0.5);
                border-radius: 16px 16px 16px 16px;
                opacity: 1;
                border: 1px solid #FFFFFF;
            }
        }
    }
}
</style>

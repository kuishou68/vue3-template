<template>
    <div class="headerCompView">
        <div class="header-left">
            <slot name="left"></slot>
        </div>
        <div class="header-right">
            <div class="theme-list">
              <a-popover placement="bottom" trigger="click" overlayClassName="themeUserPop" :overlayInnerStyle="{width: '230px'}">
                <template #content>
                  <div class="theme-item" v-for="(item, index) in themeOptions" :key="index" @click="onPressTheme(item.name)"
                       :style="{color: item.name === currentThemeName ? '#4A51FF' : ''}" >
                    <div class="item-left">
                      <a-tag :color="item.data.themeColor1" style="height: 20px; width: 20px;"></a-tag>
                      <span class="title"> {{item.name}} </span>
                    </div>
                    <div class="item-right">
                      <CheckOutlined v-if="item.name === currentThemeName" :style="{color: item.data.themeColor1 ? item.data.themeColor1 : ''}"/>
                    </div>
                  </div>
                </template>
                <div class="theme-options">
                  <BgColorsOutlined />
                  <span style="margin-left: 10px;">切换主题</span>
                </div>
              </a-popover>
            </div>
            <div class="comp-list">
            </div>
            <div class="operate-list">
                <!--  登录用户下拉 -->
                <a-popover placement="bottom" trigger="click" overlayClassName="avatarUserPop" :overlayInnerStyle="{width: '90px'}">
                    <template #content>
                        <div class="user-item" @click="outLogin">
                            <BkIcon type="icon-tuichu" size="24" color="#999999"/>
                            <span class="title">
                                退出
                            </span>
                        </div>
                    </template>
                    <div class="compOptions">
                        <span>{{ 'admin' }}</span>
                    </div>
                </a-popover>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {useRouter} from "vue-router";
import {getStorage, removeStorage} from "@/utils/util";
import {removeAuthorization} from "@/utils/request";
import {themeStore} from "@/stores/theme"
import {BgColorsOutlined, CheckOutlined} from "@ant-design/icons-vue";

const $router = useRouter();
const themeState = themeStore(); // { themes, currTheme, setTheme }
const props = defineProps({
  collapsedStatus: {
    type: Boolean,
    default: true
  }
});

let collapsed = ref(true);
let themeOptions = ref([]);
let currentThemeName = ref("默认");

onMounted(() => {
  collapsed.value = props.collapsedStatus;
  initTheme();
});

// 初始化主题
const initTheme = () => {
  let arr = [];
  for (let index in themeState.themes) {
    let item = {
      name: index,
      data: themeState.themes[index],
    }
    arr.push(item)
  }
  themeOptions.value = arr;
  currentThemeName.value = getStorage('themeName');
}

// 设置主题
const onPressTheme = (e) =>{
  themeState.currTheme = e;
  // console.log("themeState.currTheme", themeState.currTheme);
  themeState.setTheme(e, 'themeColor');
  currentThemeName.value = e;
};


// 退出登录
const outLogin = () => {
    removeStorage("theme");
    removeAuthorization();
    $router.push({name: 'login'});
    setTimeout(() => {

        // window.location.reload()
    }, 1000);
}
</script>

<style lang="less" scoped>
@import (reference) "@/utils/common";

.headerCompView{
    width: 100%;
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-left{
        //width: 50%;
    }
    .header-right{
        display: flex;
        .comp-list, .operate-list, .theme-list{
          cursor: pointer;
        }
        .comp-list{
            margin-right: 20px;
        }
        .operate-list{
        }
        .theme-list{
          margin-right: 20px;
        }
    }
}
.avatarCompPop {
    padding: 16px;
    .comp-item{
      height: 40px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      //color: #181818;
      line-height: 16px;
      border-bottom: 1px dashed #EFF1F5;
    }
    .comp-item:hover{
        color: #4A51FF;
    }
    .comp-options {
        padding: 8px;
        height: 300px;
        overflow-y: scroll;
        .beauty-scroll;
        .comp-name {
            vertical-align: middle;
            font-size: 14px;
            font-weight: 400;
            //color: #181818;
            line-height: 16px;
        }
    }
}
.avatarUserPop{
    .user-item{
        height: 40px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        line-height: 16px;
        border-bottom: 1px dashed #EFF1F5;
        .title{
            font-size: 14px;
            vertical-align: middle;
        }
    }
    .user-item:hover{
        color: #4A51FF;
    }
}
.themeUserPop{
  .theme-item{
    height: 40px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    line-height: 16px;
    border-bottom: 1px dashed #EFF1F5;
    .item-left{
      .flexCenter;
      .title{
        font-size: 14px;
        vertical-align: middle;
        line-height: 20px;
      }
    }
  }
  .theme-item:hover{
    color: #4A51FF;
  }
}
</style>

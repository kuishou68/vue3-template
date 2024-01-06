// import { ref } from 'vue'
import { defineStore } from 'pinia'
import {setStorage, getStorage} from "@/utils/util";

export const themeStore = defineStore('theme',{
    state: () => {
        return {
            showLock: false, // 锁屏状态
            currTheme: "默认", // 当前主题
            sideCollapsed: false, // 侧边栏收缩状态
            themes: {
                "默认": {
                    themeColor1: '#4A51FF',
                    themeColor2: '#4A51FF',
                    themeColor7: '#4A51FF', //
                    textColor1: '#181818',
                    textColor2: '#555555',
                },
                "海盐蓝": {
                    themeColor1: '#4691C8',
                    themeColor2: '#4691C8',
                    themeColor7: '#4691C8', //
                    textColor1: '#181818',
                    textColor2: '#555555',
                },
                "翠竹绿": {
                    themeColor1: '#347B45',
                    themeColor2: '#347B45',
                    themeColor7: '#347B45', //
                    textColor1: '#181818',
                    textColor2: '#555555',
                },
                "魅力紫": {
                    themeColor1: '#6837C9',
                    themeColor2: '#6837C9',
                    themeColor7: '#6837C9', //
                    textColor1: '#181818',
                    textColor2: '#555555',
                },
                "石榴红": {
                    themeColor1: '#DE3C39',
                    themeColor2: '#DE3C39',
                    themeColor7: '#DE3C39', //
                    textColor1: '#181818',
                    textColor2: '#555555',
                },
                // RiptideCaper: { //黄-绿
                //     themeColor1: `#13e3ce`,
                //     themeColor2: '#13e3ce',
                //     themeColor3: '#53e4c0',
                //     themeColor4: '#71e4b9',
                //     themeColor5: '#90e5b2',
                //     themeColor6: '#b1e5ac',
                //     themeColor7: '#D0E6A5',
                //     textColor1: '#EDF2FF',
                //     textColor2: '#EDF2FF'
                // },
            }
        }
    },
    persist: {
        enabled: true,
        // 自定义持久化参数
        strategies: [
            {
                // 自定义key
                key: 'theme',
                // 自定义存储方式，默认sessionStorage
                storage: localStorage, // localStorage,
                // 指定要持久化的数据，默认所有 state 都会进行缓存，可以通过 paths 指定要持久化的字段，其他的则不会进行持久化。
                paths: ['showLock', 'currTheme', 'sideCollapsed', 'themes']
            }
        ]
    },
    // 相当于计算属性(有数据缓存)
    getters: {
        getThemes(state){
            return state.themes
        },
    },
    // actions即可以是同步函数也可以是异步函数
    actions: {
        // 切换侧边栏收缩状态 collapsed
        setCollapsed(){
            this.sideCollapsed = !this.sideCollapsed; // this.sideCollapsed;
        },
        // 切换主题
        changeStyle (obj) {
            for (let key in obj) {
                document.getElementsByTagName("body")[0].style.setProperty(`--${key}`, obj[key]);
            }
        },
        setThemeColor (themeName){
            // setStorage("themeName", themeName); // 保存主题到本地，下次进入使用该主题
            let { showLock, currTheme, sideCollapsed, themes } = this;
            let theme = { showLock, currTheme, sideCollapsed, themes }
            setStorage("theme", JSON.stringify(theme));
            const themeConfig = this.getThemes[themeName];
            let themeInfo = {};
            if(getStorage("theme")) {
                themeInfo = JSON.parse(getStorage("theme"));
            }
            // 如果有主题名称，那么则采用我们定义的主题
            // console.log("themeConfig", themeConfig);
            if (themeConfig) { // 保存主题色到本地
                // setStorage("themeConfig", JSON.stringify(themeConfig));
                // this.changeStyle(themeConfig); // 改变样式
                this.changeStyle(themeConfig); // 改变样式
            } else {
                // let themeConfig = JSON.parse(getStorage("themeConfig"));
                // this.changeStyle(themeConfig);
                this.changeStyle(themeInfo.themes); // 改变样式
            }
        },
        setFontFamily (FontFamilyName) {
            setStorage("FontFamily", FontFamilyName);
            const themeConfig = {
                themeFontFamily: FontFamilyName
            };
            this.changeStyle(themeConfig);
        },
        setTheme ( theme, type ){
            if (type === 'themeColor') {
                this.setThemeColor(theme);
            } else if (type === 'FontFamily') {
                this.setFontFamily(theme);
            }
        },
        getTheme (type){
            let { currTheme } = this;
            if (type === 'themeColor') {
                // let theme = getStorage("themeName");
                // if (!currTheme) {
                //     currTheme = 'WhiteLilac_PeachSchnapps';
                // }
                // this.setThemeColor(currTheme);
                if(getStorage("theme")) {
                    let themeInfo = JSON.parse(getStorage("theme"));
                    this.setThemeColor(themeInfo.currTheme);
                } else {
                    this.setThemeColor(currTheme);
                }

            } else if (type === 'FontFamily') {
                let FontFamily = getStorage("FontFamily");
                this.setFontFamily(FontFamily);
            }
        },
    }
});


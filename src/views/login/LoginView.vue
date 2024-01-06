<template>
    <div class="loginView">
        <div class="header">
            <div class="logo">
            </div>
        </div>
           <div class="card">
                <div class="left">
                </div>

                <div class="right">
                    <div class="form">
                        <div class="titleText" @click="login">账号登录</div>
                        <a-form
                            ref="formRef"
                            name="custom-validation"
                            :model="formState"
                            :rules="formRules"
                            @finish="handleFinish"
                            @validate="handleValidate"
                            @finishFailed="handleFinishFailed"
                        >
                            <a-form-item has-feedback label="" name="userName">
                                <a-input v-model:value="formState.userName" size="large" autocomplete="off" placeholder="请输入用户名"/>
                            </a-form-item>
                            <a-form-item has-feedback label="" name="password">
                                <a-input-password v-model:value="formState.password" size="large" placeholder="请输入密码"/>
                            </a-form-item>
                            <div class="remember" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                                <a-checkbox v-model:checked="remember">记住登录信息</a-checkbox>
                                <a-button type="link" @click="showEditPasswordDialog = true" style="padding: 0;">修改密码</a-button>
                            </div>
                        </a-form>
                        <a-button type="primary" @click="submitLogin" size="large" style="width: 100%">立即登录</a-button>
                    </div>
                </div>
            </div>
        <div class="login-footer">
            <div class="copyright">版权所有 Copyright(©)1999-{{ new Date().getFullYear() }} </div>
        </div>
    </div>
    <!--   修改密码 -->
    <edit-password-dialog v-if="showEditPasswordDialog" :show="showEditPasswordDialog" :dataSource="formState" @hide="showEditPasswordDialog=false" @confirm="confirmUpdatePassword"/>
</template>
<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import EditPasswordDialog from "@/views/login/components/EditPasswordDialog.vue";
import {message} from "ant-design-vue";
import {getStorage, setStorage} from "@/utils/util";

const $router = useRouter();
const formRef = ref();
const formRules = {
    userName: [ { required: true, message: '用户名不能为空', trigger: 'change', }, ],
    password: [ { required: true, message: '密码不能为空', trigger: 'change', }, ],
}
const formState = reactive({
    userName: '',
    password: '',
});
let remember = ref(String(localStorage.remember)==="1");
let showEditPasswordDialog = ref(false);

onMounted(() => {
    if(remember.value){
        let rememberInfo = JSON.parse(getStorage("rememberInfo")) || {};
        Object.assign(formState, rememberInfo);
    }
});

// 确认修改密码弹窗关闭
const confirmUpdatePassword = (form) => {
  message.success("修改成功，请牢记新密码！");
}


// 提交登录
const submitLogin = () => {
    // 登录前缓存记住密码标识
    localStorage.setItem("remember", remember.value?1:0);
    if(remember.value){
        // 缓存登录信息
        localStorage.setItem("rememberInfo", JSON.stringify(formState));
    }else{
        // 清空登录信息
        localStorage.removeItem("rememberInfo");
    }
    
    delete formState.shopName;
    formState.userName = formState.userName.toLowerCase();

    message.success("登录成功！");
    $router.replace({name: "overallBoard"});

}

const handleFinish = values => {
    console.log(values, formState);
};
const handleFinishFailed = errors => {
    console.log(errors);
};
const handleValidate = (...args) => {
    console.log(args);
};
</script>

<style scoped lang="less">
@import (reference) "@/utils/common";

.loginView {
    //min-width: 800px;
    //min-height: 800px;
    height: 100vh;
    //width: 100vw;
    width: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    //padding-bottom: 100px;
    display: grid;
    align-items: center;
    //display: flex;
    //flex-direction: column;
    //justify-content: space-evenly;
    .header {
        width: 75%;
        margin: 0 auto;
        @extra: 300px;
        max-width: 1300px;

        .logo {
            width: calc(~"100%" - @extra);
            .inlineBlock();

            img {
                width: 310px;
            }
        }

        .extra {
            width: @extra;
            .inlineBlock();
            text-align: right;

            .item {
                .inlineBlock();
                margin-left: 32px;
                cursor: pointer;

                &:hover {
                    color: #9884EC;
                }

                img {
                    .inlineBlock();
                    width: 16px;
                    margin-right: 4px;
                }

                span {
                    .inlineBlock();
                }
            }
        }
    }

    .card {
        @cardWidth: 35%;
        width: 75%;
        height: 100%;
        max-width: 1300px;
        margin: 0 auto;
        background: #FFFFFF;
        box-shadow: 0 8px 16px 0 rgba(181, 188, 201, 0.19);
        border-radius: 16px;
        padding: 3% 5% 1% 3%;
        //padding: 106px 130px 59px 39px;

        .left{
          .inlineBlock();
          width: calc(~"100%" - @cardWidth);
            .img{
              width: 75%;
            }
        }
        .right{
            width: @cardWidth;
          .inlineBlock();
            .img{
              width: 100%;
            }
        }

        .titleText {
            text-align: left;
            font-size: 24px;
            font-weight: 600;
            color: #222222;
            padding: 40px 0;
        }

        .qrCode {
            text-align: center;

            &.scan_-1 {
                > img {
                    filter: blur(5px);
                }
            }

            .qrcodeStatus {
                height: 20px;
                font-size: 12px;

                &.status_-1 {
                    color: #f00;
                    cursor: pointer;
                }

                &.status_0 {
                    color: rgb(51, 51, 51);
                }

                &.status_1 {
                    color: #0f0;
                }
            }
        }

        .loginDesc {
            padding: 50px 0;
            text-align: center;
            font-size: 14px;
            font-weight: 400;
            color: #ABABAB;
        }
    }

    .login-footer {
        text-align: center;
        padding: 10px;
        width: 100%;
        bottom: 0;
        box-sizing: border-box;

        > .link {
            padding: 4px;

            > .item {
                .inlineBlock;
                padding: 0 12px;
                margin: 0;
                color: #666666;
                font-weight: 500;
                cursor: pointer;
                font-size: 13px;
                position: relative;

                &:hover {
                    color: #9884EC;
                }

                &:last-child {
                    &:after {
                        display: none;
                    }
                }

                &:after {
                    position: absolute;
                    content: "";
                    width: 1px;
                    height: 60%;
                    top: 22%;
                    right: 0;
                    background-color: #B1B2BB;
                }
            }
        }

        > .copyright {
            padding: 4px;
            margin-top: 10px;
            /*color: #666666;*/
            color: rgba(102, 102, 102, 0.43);
            font-size: 12px;
        }
    }
}
</style>

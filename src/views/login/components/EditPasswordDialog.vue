<!--修改密码弹窗-->
<template>
    <div>
        <a-modal v-model:open="showModal" wrapClassName="editPasswordDialog" title="修改密码" okText="提交" cancelText="取消" :closable="false" width="30%"
                 @cancel="closeDialog" @ok="handleOk">
            <a-form ref="formRef" name="basic" :rules="formRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" layout="horizontal" :model="formState" >
                <a-form-item has-feedback label="连锁代码" name="custId">
                    <a-input v-model:value="formState.custId" placeholder="请选择连锁代码" style="width: 340px;"></a-input>
                </a-form-item>
                <a-form-item has-feedback label="用户名" name="userName">
                    <a-input v-model:value="formState.userName" autocomplete="off" placeholder="请输入用户名" style="width: 340px;"/>
                </a-form-item>
                <a-form-item has-feedback label="当前密码" name="password">
                    <a-input-password v-model:value="formState.password" v-model:visible="visiblePass" placeholder="请输入密码" style="width: 340px;"/>
                </a-form-item>
                <a-form-item has-feedback label="新密码" name="newPassword">
                    <a-input-password v-model:value="formState.newPassword" v-model:visible="visiblePass" placeholder="请输入密码" style="width: 340px;"/>
                </a-form-item>
                <a-form-item has-feedback label="确认新密码" name="checkPass">
                    <a-input-password v-model:value="formState.checkPass" v-model:visible="visiblePass" placeholder="请输入" style="width: 340px;"/>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    dataSource: {
        type: Object,
        default(){ return {}; }
    }
});
const emit = defineEmits(['hide', 'confirm']);
const formRef = ref();
const visiblePass = ref(true); // 默认显示密码
const validatePass = async (_rule, value) => {
    if (value === '') {
        return Promise.reject('请输入 新密码');
    } else {
        if (formState.checkPass !== '') {
            formRef.value.validateFields('checkPass');
        }
        return Promise.resolve();
    }
};
const validateCheckPass = async (_rule, value) => {
    if (value === '') {
        return Promise.reject('请输入 确认新密码');
    } else if (value && value !== formState.newPassword) {
        return Promise.reject("两次输入的密码不一致！");
    } else {
        return Promise.resolve();
    }
};
const formRules = {
    newPassword: [ { required: true, validator: validatePass, trigger: 'change', }, ],
    checkPass: [ { validator: validateCheckPass, trigger: 'change', }, ],
}
const formState = reactive({
    custId: '',
    userName: '',
    password: '',
});

let showModal = ref(false);

onMounted(() => {
    showModal.value = props.show;
    // formState.custId = props.dataSource.custId;
    Object.assign(formState, props.dataSource);
});

const formItemLayout = computed(() => {
    const { layout } = formState;
    return layout === 'horizontal'
        ? {
            labelCol: {
                span: 4,
            },
            wrapperCol: {
                span: 14,
            },
        }
        : {};
});
// 关闭弹窗
const closeDialog = () => {
    emit('hide');
};
// 确认弹窗
const handleOk = () => {
    emit('confirm', formState);
    // showModal.value = false;
};
</script>

<style lang="less" scoped>
.editPasswordDialog {

}
</style>

<!--参数设置-->
<template>
  <div class="panelMain">
    <div class="header-panel">
      <div class="header-left">
      </div>
      <h1 style="width: 100%;">参数设置</h1>
      <div class="header-right" >
      </div>
    </div>
    <div class="panel-box">
      <a-row class="content-panel">
        <a-col :span="bsInfo.size.xxxl ? 6 : 12">
          <div class="content-left">
          </div>
        </a-col>
        <a-col :span="bsInfo.size.xxxl ? 6 : 12">
          <div class="content-center" :style="{'margin-right': bsInfo.size.xxxl ? '12px' : '0'}">
          </div>
        </a-col>
        <a-col v-if="bsInfo.size.xxxl" :span="12">
          <div class="content-right">
            <div class="right-top">
            </div>
            <div class="right-bottom">
            </div>
          </div>
        </a-col>
      </a-row>
      <a-row v-if="!bsInfo.size.xxxl" class="content-panel">
        <a-col :span="24">
          <div class="content-right">
            <div class="right-top">
            </div>
            <div class="right-bottom">
            </div>
          </div>
        </a-col>
      </a-row>
      <a-row>
    </a-row>
    </div>
  </div>
</template>

<script setup>
// 公共资源
import { ref, reactive, onMounted } from 'vue'
import {bsInfo} from "@/utils/browser";
// 组件
// 接口
onMounted(() => {
})
</script>

<style scoped lang="less">
@import (reference) '@/utils/common';
.custom-ant-table-body;

:deep(.tableHeader) {
  color: #ffffff !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  background: @theme !important; // #4A51FF
}
:deep(.tableTagHeader){
  color: #644A16 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  background: #FFC93D !important;
}
.panelMain {
  .header-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    h1 {
      text-align: center;
      padding: 28px 0;
    }
    .header-left {
      .text{
        font-size: 14px;
        font-weight: 400;
        color: #181818;
        line-height: 16px;
      }
    }
    .header-right {
      width: 30%;
      text-align: right;
      cursor: pointer;
      .icon {
        margin-right: 4px;
      }
      .setting-equity {
        font-size: 16px;
        font-weight: 500;
        color: #4a51ff;
        line-height: 22px;
      }
    }
  }
  .panel-box {
    height: 78vh;
    overflow-y: scroll;
    .beauty-scroll;
    
    .content-panel {
      display: flex;
      margin: 0 12px 12px 12px;
      
      .content-left {
        height: 568px;
        background: #ffffff;
        border-radius: 8px 8px 8px 8px;
        opacity: 1;
        padding: 16px;
        
        .card-header {
          .flexBetween;
          margin-bottom: 15px;
          
          .title-center {
            display: flex;
            align-items: center;
            width: calc(100% - 100px);
            img {
              width: 28px;
              height: 28px;
              margin-right: 8px;
            }
            
            .title {
              font-size: 16px;
              font-weight: 600;
              color: #181818;
              .overflowText;
            }
          }
        }
        
        .card-table {
          .custom-table-header {
            .icon {
              cursor: pointer;
              transition: transform 1s ease-in-out;
            }
            
            .clicked {
              transform: rotate(180deg);
            }
          }
        }
      }
      
      .content-center {
        height: 568px;
        background: #ffffff;
        border-radius: 8px 8px 8px 8px;
        opacity: 1;
        padding: 16px;
        margin: 0 12px;
        
        .card-header {
          .flexBetween;
          margin-bottom: 15px;
          
          .title-center {
            display: flex;
            align-items: center;
            width: calc(100% - 100px);
            img {
              width: 28px;
              height: 28px;
              margin-right: 8px;
            }
            
            .title {
              font-size: 16px;
              font-weight: 600;
              color: #181818;
              .overflowText;
            }
          }
        }
      }
      
      .content-right {
        height: 568px;
        
        .right-top {
          //height: 313px;
          height: 49%;
          background: #ffffff;
          border-radius: 8px 8px 8px 8px;
          opacity: 1;
          margin-bottom: 12px;
          padding: 16px;
          
          .card-header {
            .flexBetween;
            margin-bottom: 15px;
            
            .title-center {
              display: flex;
              align-items: center;
              width: calc(100% - 100px);
              img {
                width: 28px;
                height: 28px;
                margin-right: 8px;
              }
              
              .title {
                font-size: 16px;
                font-weight: 600;
                color: #181818;
                .overflowText;
              }
            }
          }
          
          .card-table{
            //height: 100%;
            .pay-body{
              height: 200px;
              overflow-y: scroll;
              .beauty-scroll;
            }
          }
          
          .item {
            display: flex;
            justify-content: space-around;
            align-items: center;
            height: 44px;
            border-radius: 4px 4px 4px 4px;
            opacity: 1;
            margin-bottom: 16px;
          }
          
          .item1 {
            background: linear-gradient(90deg, #d4e8b6 0%, rgba(212, 232, 182, 0) 100%);
          }
          
          .item2 {
            background: linear-gradient(90deg, #fff6cc 0%, rgba(255, 246, 204, 0) 100%);
          }
          
          .item3 {
            background: linear-gradient(90deg, #ffdfc1 0%, rgba(255, 223, 193, 0) 100%);
          }
          
          .item4 {
            background: linear-gradient(90deg, #ffdfde 0%, rgba(255, 223, 222, 0) 100%);
          }
          
          .item5 {
            background: linear-gradient(90deg, #eeeeee 0%, rgba(238, 238, 238, 0) 100%);
          }
        }
        
        .right-bottom {
          height: 49%;
          background: #ffffff;
          border-radius: 8px 8px 8px 8px;
          opacity: 1;
          padding: 16px;
          
          .card-header {
            .flexBetween;
            margin-bottom: 15px;
            
            .title-center {
              display: flex;
              align-items: center;
              width: calc(100% - 100px);
              img {
                width: 28px;
                height: 28px;
                margin-right: 8px;
              }
              
              .title {
                font-size: 16px;
                font-weight: 600;
                color: #181818;
                .overflowText;
              }
            }
            
            .title-right {
            }
          }
          
          .card-table {
            //width: 100%;
            height: 201px;
            //overflow: scroll;
            display: flex;
            //flex-wrap: wrap;
            //flex-direction: row;
            //.flexBetween;
            .left-table, .right-table{
              width: 49%;
            }
          }
        }
      }
    }
    
    .footer-panel {
      //height: 320px;
      margin: 0 12px;
      background: #ffffff;
      border-radius: 8px 8px 8px 8px;
      opacity: 1;
      padding: 16px;
      
      .card-header {
        .flexBetween;
        margin-bottom: 15px;
        
        .title-center {
          display: flex;
          align-items: center;
          width: calc(100% - 150px);
          img {
            width: 28px;
            height: 28px;
            margin-right: 8px;
          }
          
          .title {
            font-size: 16px;
            font-weight: 600;
            color: #181818;
            .overflowText;
          }
        }
      }
      
      .card-table {
      }
    }
  }
}
</style>

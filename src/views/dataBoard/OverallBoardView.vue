<template>
  <div class="panelMain">
    <h1>总体数据看板</h1>
    <div class="filter">
      查询日期：
      <a-range-picker v-model:value="dateTime" :format="dateFormat" :valueFormat="dateFormat" placeholderStart="请选择"
                      style="margin-right: 16px;" @change="handleDate"/>
      <a-radio-group v-model:value="dateInterval" option-type="button" :options="intervalOptions" style="background: none;" @change="handleIntervalDate"/>
      <a-button type="primary" style="float: right" @click="loadGetTotalReport">查询</a-button>
    </div>
    <div class="panel-box">
      <a-row>
        <a-col :span="24">
          <!-- 概略数据 -->
          <div class="header-panel" >
            <div class="header-item" v-for="(item, index) in sumDataMap" :key="index">
              <div class="title">{{ item.label }}</div>
              <div class="text">
                <span v-if="item.dataIndex === 'projectRate'">
                    {{ `${Math.round((item.value) * 100)}%` }}
                </span>
                <a-statistic v-else :value="item.value" :valueStyle="{'font-size': '28px', color: themeState.getThemeInfo ? '#FFFFFF' : '#181818', 'font-weight': 650}" />
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
      <a-row class="content-panel">
        <a-col :span="4">
          <div class="content-left">
            <div class="title">业绩排行</div>
            <div class="content-item" v-if="totalReportMap.employeeRankList && totalReportMap.employeeRankList.length > 0" >
              <div
                class="performance-item"
                v-for="(item, index) in totalReportMap.employeeRankList"
                :key="index"
              >
                <div class="item-index">
                  <span class="index-text" >{{ index + 1 }}</span>
                </div>
                <div class="item-right">
                  <div class="item-name">{{ item.empName }}</div>
                  <div class="item-num">{{ Math.round(item.empAmount) }}</div>
                </div>
              </div>
            </div>
            <div class="content-empty" v-else>
              暂无数据
            </div>
          </div>
        </a-col>
        <a-col :span="14">
          <div class="content-center">
            <div class="center-top">
              <div class="title">消费情况</div>
              <div id="visitorABC" class="" :style="{ width: '100%', height: '250px' }" />
            </div>
            <div class="center-bottom">
              <div class="bottom-left">
                <div class="title">个数占比</div>
                <div id="consumerNumber" class="" :style="{ width: '100%', height: '240px' }" />
              </div>
              <div class="bottom-right">
                <div class="title">业绩占比</div>
                <div id="consumerPerformance" class="" :style="{ width: '100%', height: '240px' }" />
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="content-right">
            <div class="right-top">
              <div :class="['item', `item${index + 1}`]" v-for="(item, index) in totalReportMap.memberLoyaltyList" :key="index" >
                <div class="item-left">
                  <div class="item-title">{{ item.label }}</div>
                </div>
                <div class="item-right">
                  <div class="item-num">{{ item.num }}人</div>
                  <div class="item-icon">
                  </div>
                </div>
              </div>
            </div>
            <div class="right-bottom">
              <div class="title">频次分析</div>
              <div id="wordFrequency" class="" :style="{ width: '100%', height: '240px' }" />
            </div>
          </div>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24">
          <div class="footer-panel">
            <div class="title">业绩分析（{{ dateRange[totalReportMap.groupDataType] }}）</div>
            <div id="performanceAnalysis" :style="{ width: '100%', height: '260px' }" />
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
// 组件
// 接口
// 公共资源
import {ref, onMounted, inject, watch, reactive, shallowReactive} from 'vue'
import { themeStore } from "@/stores/theme";
import dayjs from 'dayjs'
import {useRoute, useRouter} from "vue-router";
import {bsInfo} from "@/utils/browser";

const route = useRoute();
const $router = useRouter()
const themeState = themeStore();
// 概略数据 Map
const sumDataMap = ref([
  { dataIndex: 'amount', label: '业绩', value: '' },
  { dataIndex: 'averagePrice', label: '客单价', value: '' },
  { dataIndex: 'cashAmount', label: '现金', value: '' },
  { dataIndex: 'customerNum', label: '客量', value: '' },
  { dataIndex: 'projectRate', label: '成交率', value: '' },
  { dataIndex: 'customerAmount', label: '用户', value: '' }
]);
const dateFormat = 'YYYY-MM-DD';
const nowDate = new Date();
// 获取上个月的时间
const lastMonthDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1);
const firstDay = new Date(dayjs(nowDate.getFullYear()).format('YYYY').replace(/-/g, "/"), dayjs(nowDate.getMonth() - 1).format('MM') - 1, 1) //这个月的第一天
const currentMonth = firstDay.getMonth() //取得月份数
const lastDay = dayjs(new Date(firstDay.getFullYear(), currentMonth + 1, 0)).format("DD"); // 取上月最后一天
const dateTime = ref([dayjs(lastMonthDate).format("YYYY/MM/01"), dayjs(lastMonthDate).format(`YYYY/MM/${lastDay}`)]);
const intervalOptions = [
  { label: '近半年', value: '6' },
  { label: '近一年', value: '12' },
  { label: '去年', value: '-12' }
];
const dateRange = {
  "year": "年",
  "month": "月",
  "week": "周",
  "day": "天"
}

let dateInterval = ref("6");
let echarts = inject('ec'); //引入
let startDate = ref(dateTime.value[0]); // dayjs(new Date()).format("YYYY-MM-01")
let endDate = ref(dateTime.value[1]); // dayjs(new Date()).format("YYYY-MM-DD")
let analyticRecord = ref({});
/**
 *  为什么要用 shallowReactive ?
 *  切记不要使用ref或reactive来包装 echarts 实例。
 *  使用公共变量或shallowRef、 shallowReactive 避免对 echarts 实例进行深度监视。
 *  参考：https://github.com/apache/echarts/issues/16642
 */
let echartsDom = shallowReactive({
  visitorABC: { dom: undefined, options: {} },
  consumerNumber: { dom: undefined, options: {} },
  consumerPerformance: { dom: undefined, options: {} },
  performanceAnalysis: { dom: undefined, options: {} },
  wordFrequency: { dom: undefined, options: {} },
});

let totalReportMap = ref({
  "employeeRankList": [
    {
      "empAmount": 1070707.4602050781,
      "empId": "01",
      "empName": "张三"
    },
    {
      "empAmount": 342533,
      "empId": "02",
      "empName": "李四"
    }
  ],
  "groupDataList": [
    {
      "amount": 16408,
      "customerNum": 48,
      "dateStr": "22年12月14日"
    },
    {
      "amount": 6366,
      "customerNum": 13,
      "dateStr": "22年12月21日"
    },
    {
      "amount": 8961,
      "customerNum": 21,
      "dateStr": "22年12月28日"
    },
    {
      "amount": 57621,
      "customerNum": 111,
      "dateStr": "23年01月04日"
    },
    {
      "amount": 92810.07,
      "customerNum": 164,
      "dateStr": "23年01月11日"
    },
    {
      "amount": 28637,
      "customerNum": 55,
      "dateStr": "23年01月18日"
    },
    {
      "amount": 16004,
      "customerNum": 50,
      "dateStr": "23年01月25日"
    },
    {
      "amount": 25067,
      "customerNum": 81,
      "dateStr": "23年02月01日"
    },
    {
      "amount": 25740,
      "customerNum": 72,
      "dateStr": "23年02月08日"
    },
    {
      "amount": 41827,
      "customerNum": 85,
      "dateStr": "23年02月15日"
    },
    {
      "amount": 33211,
      "customerNum": 91,
      "dateStr": "23年02月22日"
    },
    {
      "amount": 17965,
      "customerNum": 46,
      "dateStr": "23年03月01日"
    },
    {
      "amount": 23563.7,
      "customerNum": 68,
      "dateStr": "23年03月08日"
    },
    {
      "amount": 38267,
      "customerNum": 87,
      "dateStr": "23年03月15日"
    },
    {
      "amount": 37760,
      "customerNum": 88,
      "dateStr": "23年03月22日"
    },
    {
      "amount": 44029.67,
      "customerNum": 100,
      "dateStr": "23年03月29日"
    },
    {
      "amount": 27317,
      "customerNum": 63,
      "dateStr": "23年04月05日"
    },
    {
      "amount": 22504,
      "customerNum": 64,
      "dateStr": "23年04月12日"
    },
    {
      "amount": 16743,
      "customerNum": 60,
      "dateStr": "23年04月19日"
    },
    {
      "amount": 27756.75,
      "customerNum": 88,
      "dateStr": "23年04月26日"
    },
    {
      "amount": 35033,
      "customerNum": 88,
      "dateStr": "23年05月03日"
    },
    {
      "amount": 25712,
      "customerNum": 76,
      "dateStr": "23年05月10日"
    },
    {
      "amount": 27470,
      "customerNum": 83,
      "dateStr": "23年05月17日"
    },
    {
      "amount": 29066,
      "customerNum": 76,
      "dateStr": "23年05月24日"
    },
    {
      "amount": 24653,
      "customerNum": 58,
      "dateStr": "23年05月31日"
    },
    {
      "amount": 22643,
      "customerNum": 66,
      "dateStr": "23年06月07日"
    },
    {
      "amount": 15746,
      "customerNum": 43,
      "dateStr": "23年06月14日"
    },
    {
      "amount": 29758,
      "customerNum": 88,
      "dateStr": "23年06月21日"
    },
    {
      "amount": 24689,
      "customerNum": 78,
      "dateStr": "23年06月28日"
    },
    {
      "amount": 13219,
      "customerNum": 48,
      "dateStr": "23年07月05日"
    },
    {
      "amount": 23363,
      "customerNum": 67,
      "dateStr": "23年07月12日"
    },
    {
      "amount": 16243,
      "customerNum": 49,
      "dateStr": "23年07月19日"
    },
    {
      "amount": 24752.6,
      "customerNum": 70,
      "dateStr": "23年07月26日"
    },
    {
      "amount": 23275,
      "customerNum": 69,
      "dateStr": "23年08月02日"
    },
    {
      "amount": 22728,
      "customerNum": 63,
      "dateStr": "23年08月09日"
    },
    {
      "amount": 22286,
      "customerNum": 65,
      "dateStr": "23年08月16日"
    },
    {
      "amount": 26210,
      "customerNum": 73,
      "dateStr": "23年08月23日"
    },
    {
      "amount": 23862,
      "customerNum": 63,
      "dateStr": "23年08月30日"
    },
    {
      "amount": 28848,
      "customerNum": 73,
      "dateStr": "23年09月06日"
    },
    {
      "amount": 35454,
      "customerNum": 81,
      "dateStr": "23年09月13日"
    },
    {
      "amount": 28849,
      "customerNum": 60,
      "dateStr": "23年09月20日"
    },
    {
      "amount": 43145,
      "customerNum": 104,
      "dateStr": "23年09月27日"
    },
    {
      "amount": 22434,
      "customerNum": 71,
      "dateStr": "23年10月04日"
    },
    {
      "amount": 28557.67,
      "customerNum": 65,
      "dateStr": "23年10月11日"
    },
    {
      "amount": 23570,
      "customerNum": 66,
      "dateStr": "23年10月18日"
    },
    {
      "amount": 17179,
      "customerNum": 62,
      "dateStr": "23年10月25日"
    },
    {
      "amount": 32854,
      "customerNum": 82,
      "dateStr": "23年11月01日"
    },
    {
      "amount": 21974,
      "customerNum": 65,
      "dateStr": "23年11月08日"
    },
    {
      "amount": 30807.6,
      "customerNum": 85,
      "dateStr": "23年11月15日"
    },
    {
      "amount": 23987,
      "customerNum": 74,
      "dateStr": "23年11月22日"
    },
    {
      "amount": 22601.6,
      "customerNum": 72,
      "dateStr": "23年11月29日"
    },
    {
      "amount": 26100,
      "customerNum": 85,
      "dateStr": "23年12月06日"
    },
    {
      "amount": 7632,
      "customerNum": 22,
      "dateStr": "23年12月13日"
    }
  ],
  "groupDataType": "week",
  "memberLoyalty": {
    "dateStr": "202312",
    "lessOneMonthNum": 225,
    "lessSixMonthNum": 194,
    "lessThreeMonthNum": 235,
    "lessTwelveMonthNum": 306,
    "moreThanOneYearNum": 327
  },
  "memberLoyaltyList": [
    {
      "condition": "LCD|LOM",
      "label": "活跃客户",
      "num": 225
    },
    {
      "condition": "LCD|LTM",
      "label": "反邀约客户",
      "num": 235
    },
    {
      "condition": "LCD|LSM",
      "label": "高危客户",
      "num": 194
    },
    {
      "condition": "LCD|LTWM",
      "label": "休眠客户",
      "num": 306
    },
    {
      "condition": "LCD|MOY",
      "label": "流失客户",
      "num": 327
    }
  ],
  "projectCategoryList": [
    {
      "amount": 14551.550003051758,
      "amountA": 3802.6000003814697,
      "amountB": 3726,
      "amountC": 6597.949996948242,
      "amountRate": 0.0102,
      "num": 440,
      "numA": 112,
      "numB": 124,
      "numC": 191,
      "numRate": 0.057,
      "projectStatisticsType": "1",
      "projectStatisticsTypeName": "洗吹"
    },
    {
      "amount": 299935,
      "amountA": 185860,
      "amountB": 101429,
      "amountC": 9791,
      "amountRate": 0.2106,
      "num": 2350,
      "numA": 1437,
      "numB": 796,
      "numC": 91,
      "numRate": 0.3044,
      "projectStatisticsType": "2",
      "projectStatisticsTypeName": "剪发"
    },
    {
      "amount": 542182.3999938965,
      "amountA": 438861.3999938965,
      "amountB": 94125,
      "amountC": 5154,
      "amountRate": 0.3808,
      "num": 2147,
      "numA": 1581,
      "numB": 514,
      "numC": 30,
      "numRate": 0.2781,
      "projectStatisticsType": "3",
      "projectStatisticsTypeName": "烫发"
    },
    {
      "amount": 391066.6000061035,
      "amountA": 316830.6000061035,
      "amountB": 64774,
      "amountC": 5572,
      "amountRate": 0.2747,
      "num": 1058,
      "numA": 838,
      "numB": 196,
      "numC": 11,
      "numRate": 0.1371,
      "projectStatisticsType": "4",
      "projectStatisticsTypeName": "染发"
    },
    {
      "amount": 176119.45999145508,
      "amountA": 120213.46000671387,
      "amountB": 41746,
      "amountC": 13666,
      "amountRate": 0.1237,
      "num": 1724,
      "numA": 1278,
      "numB": 397,
      "numC": 45,
      "numRate": 0.2233,
      "projectStatisticsType": "5",
      "projectStatisticsTypeName": "护理"
    }
  ],
  "projectRankList": [
    {
      "num": 1615,
      "projectId": "403",
      "projectName": "林月容剪发"
    },
    {
      "num": 850,
      "projectId": "507",
      "projectName": "A发根烫"
    },
    {
      "num": 559,
      "projectId": "517",
      "projectName": "烫前护理"
    },
    {
      "num": 544,
      "projectId": "506",
      "projectName": "A塑型抛光"
    },
    {
      "num": 421,
      "projectId": "402",
      "projectName": "洗发"
    },
    {
      "num": 389,
      "projectId": "404",
      "projectName": "剪发"
    },
    {
      "num": 361,
      "projectId": "602",
      "projectName": "果酸护理年卡"
    },
    {
      "num": 350,
      "projectId": "514",
      "projectName": "B常规染色"
    },
    {
      "num": 349,
      "projectId": "515",
      "projectName": "B护理"
    },
    {
      "num": 324,
      "projectId": "510",
      "projectName": "B烫刘海压贴"
    },
    {
      "num": 259,
      "projectId": "501",
      "projectName": "A微潮色"
    },
    {
      "num": 198,
      "projectId": "520",
      "projectName": "B补染-局部"
    },
    {
      "num": 160,
      "projectId": "407",
      "projectName": "剪刘海"
    },
    {
      "num": 150,
      "projectId": "512",
      "projectName": "B冷烫"
    },
    {
      "num": 116,
      "projectId": "519",
      "projectName": "B沐浴染"
    },
    {
      "num": 94,
      "projectId": "HD006",
      "projectName": "水润护理"
    },
    {
      "num": 93,
      "projectId": "426",
      "projectName": "染前隔离"
    },
    {
      "num": 65,
      "projectId": "KS002",
      "projectName": "娟剪发"
    },
    {
      "num": 63,
      "projectId": "HD007",
      "projectName": "摩根烫"
    },
    {
      "num": 63,
      "projectId": "KS001",
      "projectName": "剪发"
    },
    {
      "num": 55,
      "projectId": "518",
      "projectName": "烫中护理"
    },
    {
      "num": 52,
      "projectId": "KS003",
      "projectName": "基础烫发"
    },
    {
      "num": 46,
      "projectId": "511",
      "projectName": "B水润烫"
    },
    {
      "num": 44,
      "projectId": "HD001",
      "projectName": "轻奢烫发"
    },
    {
      "num": 43,
      "projectId": "HD004",
      "projectName": "轻奢染发"
    },
    {
      "num": 42,
      "projectId": "QS001",
      "projectName": "轻奢染"
    },
    {
      "num": 41,
      "projectId": "QS002",
      "projectName": "基础护理"
    },
    {
      "num": 37,
      "projectId": "23031701",
      "projectName": "头皮滋养补水"
    },
    {
      "num": 37,
      "projectId": "KS008",
      "projectName": "蛋白颅顶增高"
    },
    {
      "num": 32,
      "projectId": "23031704",
      "projectName": "法式头皮养护管理"
    }
  ],
  "sumData": {
    "amount": 1433259.6604003906,
    "averagePrice": 382.71,
    "cashAmount": 1055058,
    "customerAmount": 1421553.6604003906,
    "customerNum": 3745,
    "projectRate": 1.3162
  }
})

onMounted(() => {
  if(analyticRecord.value.endDate){
    handleIntervalDate();
  } else {
    loadGetTotalReport();
  }
  initEchartsDom();
});

// 在当前页 监听 pinia 中菜单收缩的变化，延迟重绘echarts
watch(() => themeState.sideCollapsed, (newValue, oldValue) => {
  if(newValue !== oldValue && route.name === "overallBoard") {
    delayedRepaint();
  }
});

// 监听屏幕设备，变化时可自适应屏幕
watch(bsInfo.size, () => {
  delayedRepaint();
});

// 初始化 echarts Dom，一个页面建议只 echarts.init初始化一次，重复使用可存入公共变量
const initEchartsDom = () => {
  const echartsIds = Object.keys(echartsDom);
  for(let i = 0; i < echartsIds.length; i++){
    echartsDom[echartsIds[i]].dom = echarts.init(document.getElementById(echartsIds[i]));
  }
}

// 所有图表延迟重绘
const delayedRepaint = () => {
  setTimeout(() => {
    const echartsIds = Object.keys(echartsDom);
    for(let i = 0; i < echartsIds.length; i++){
      echartsDom[echartsIds[i]].dom.resize();
    }
  }, 500)
}

// 日期查询
const handleDate = (date) => {
  startDate.value = date[0];
  endDate.value = date[1];
  dateInterval.value = "";
}

// 快捷日期区间
const handleIntervalDate = () => {
  // console.log("dateInterval-->", dateInterval.value);
  let strYear = dayjs(new Date()).format("YYYY");
  let strMonth = dayjs(new Date()).format("MM");
  let strDay = new Date().getDate(); // 当天
  let newStrMonth = "";
  let newStrDay = "";
  
  if(analyticRecord.value.endDate){
    // 参数设置-上次数据分析截止日期
    let analyticEndDate = analyticRecord.value.endDate.split('-');
    strYear = analyticEndDate[0] || "";
    strMonth = analyticEndDate[1] || "";
    newStrDay = analyticEndDate[2] || "";
  } else {
    newStrDay = Number(strDay) > 0 && Number(strDay) <= 10 ? `0${strDay}` : strDay;
  }
  switch (dateInterval.value){
    case "6":
      if(Number(strMonth) < 5) {
        // 上半年前6个月
        strYear = Number(strYear) - 1; // 年份-1;
        newStrMonth = Number(strMonth) + 5; // 月份 取去年的后半年
      } else {
        // 下半年前6个月
        newStrMonth = Number(strMonth) - 5; // 月份 取前半年
      }
      newStrMonth = Number(newStrMonth) > 0 && Number(newStrMonth) < 10 ? `0${newStrMonth}` : newStrMonth;
      startDate.value = `${strYear}/${newStrMonth}/${newStrDay}`;
      endDate.value = `${strYear}/${strMonth}/${newStrDay}`;
      break;
    case "12":
      // 近一年
      startDate.value = `${Number(strYear) - 1}/${strMonth}/${newStrDay}`;
      endDate.value = `${strYear}-${strMonth}/${newStrDay}`;
      break;
    case "-12":
      // 去年
      startDate.value = `${Number(strYear) - 1}/01/01`;
      endDate.value = `${Number(strYear) - 1}/12/31`;
      break;
  }
  
  dateTime.value = [startDate.value, endDate.value];
  
  // console.log("startDate", startDate.value);
  // console.log("endDate", endDate.value);
  loadGetTotalReport();
  // console.log("dateTime", dateTime.value);
}


// 加载总数据
const loadGetTotalReport = () => {
  let { sumData = {}, groupDataList=[], projectCategoryList=[], projectRankList=[] } = totalReportMap.value
  // 概略数据整理
  let sumDataKeys = Object.keys(sumData);
  if (sumDataKeys && sumDataKeys.length > 0) {
    for (let i = 0; i < sumDataKeys.length; i++) {
      let key = sumDataKeys[i];
      let value = sumData[key];
      sumDataMap.value.forEach((item) => {
        if (key == item.dataIndex) {
          // 项目率
          if (item.dataIndex != "projectRate") {
            item.value = Math.round(value);
          } else {
            item.value = value;
          }
        }
      });
    }
  }
  // 初始化echarts Dom
  initEchartsDom();
  // 项目类别图
  setProjectCategoryList(projectCategoryList);
  // 业绩分析
  setPerformanceAnalysis(groupDataList);
  // 消费频次分析
  setWordFrequency(projectRankList);
}

// 项目类别图
const setProjectCategoryList = (data) => {
  // 整理数据
  let projectStatisticsType = []; // 项目类别
  let amountA = []; // A客业绩
  let amountB = []; // B客业绩
  let amountC = []; // C客业绩
  let numRate = []; // 消费个数占比
  let amountRate = []; // 业绩占比
  
  data.forEach((item) => {
    projectStatisticsType.push(item.projectStatisticsTypeName);
    amountA.push(Math.round(item.amountA));
    amountB.push(Math.round(item.amountB));
    amountC.push(Math.round(item.amountC));
    numRate.push({
      name: item.projectStatisticsTypeName,
      value: Math.round(item.num)
    });
    amountRate.push({
      name: item.projectStatisticsTypeName,
      value: Math.round(item.amount)
    })
  });
  
  // ABC客各类别消费情况
  if(amountA && amountA.length > 0){
    const options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        top: '10%',
        left: '1%',
        right: '1%',
        bottom: '20%',
        containLabel: true
      },
      legend: {
        itemWidth: 12,
        itemHeight: 6,
        itemGap: 100,
        data: ['A客业绩', 'B客业绩', 'C客业绩']
      },
      xAxis: {
        type: 'category',
        data: projectStatisticsType,
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'A客业绩',
          type: 'bar',
          stack: 'total',
          showSymbol: false, //去掉折线上的小圆点
          label: {
            show: true
          },
          barWidth: 50,
          itemStyle: {
            normal: {
              label: {
                show: false, //开启显示 柱子上的数字
              }
            }
          },
          data: amountA,
        },
        {
          name: 'B客业绩',
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
          showSymbol: false, //去掉折线上的小圆点
          barWidth: 50,
          itemStyle: {
            normal: {
              label: {
                show: false, //开启显示 柱子上的数字
              }
            }
          },
          data: amountB,
        },
        {
          name: 'C客业绩',
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
          emphasis: {
            focus: 'series'
          },
          barWidth: 50,
          itemStyle: {
            normal: {
              label: {
                show: false, //开启显示 柱子上的数字
              },
              //这里设置柱形图圆角 [左上角，右上角，右下角，左下角]
              // barBorderRadius: [10, 10, 0, 0]
            }
          },
          data: amountC, // [120, 132, 101, 134, 90, 230, 210],
        }
      ]
    };
    echartsDom.visitorABC.options = options;
    echartsDom.visitorABC.dom.setOption(options);
  } else {
    echartsDom.visitorABC.dom.setOption({
      title: {
        text: '暂无数据',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 12,
          color: '#909399',
          fontWeight: 'normal'
        }
      }
    });
  }
 
  // 项目类别消费个数占比
  if(numRate && numRate.length > 0) {
    const options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} {d}% {c} ', //  ({d}%)
      },
      textStyle: {
        fontSize: 14,
        lineHeight: 20,
        rich: {
          a: {
            align: 'left',
            color: '#AAAAAA',
          },
          b: {
            align: 'left',
            color: '#AAAAAA',
          },
        },
      },
      legend: bsInfo.size.xxxl ? {
        orient: 'vertical',
        right: 10,
        top: 40,
        itemWidth: 8,
        itemHeight: 8,
        // 使用回调函数
        formatter: function (name) {
          let formatterText = "";
          data.map((item) => {
            if (item.projectStatisticsTypeName == name) {
              // 下面的 {a| 对应上面 textStyle.rich.a
              formatterText = `${name} {a| ${(item.amountRate * 100).toFixed(2)}% } {b| ${Math.round(item.amount)} }`;
            }
          });
          return formatterText;
        },
        data: projectStatisticsType,
      } : {
        orient: 'horizontal',
        bottom: 10,
        itemWidth: 8,
        itemHeight: 8,
        data: projectStatisticsType,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['40%', '60%'],
          left: 0,
          right: bsInfo.size.xxxl ? '50%' : 0,
          top: 0,
          bottom: bsInfo.size.xxxl ? 0 : '20%',
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: numRate
        }
      ]
    }
    echartsDom.consumerNumber.options = options;
    echartsDom.consumerNumber.dom.setOption(options);
  } else {
    echartsDom.consumerNumber.dom.setOption({
      title: {
        text: '暂无数据',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 12,
          color: '#909399',
          fontWeight: 'normal'
        }
      }
    });
  }
  
  // 消费业绩占比
  if(amountRate && amountRate.length > 0) {
    const options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} {d}% {c}', //  ({d}%)
      },
      textStyle: {
        fontSize: 14,
        lineHeight: 20,
        rich: {
          a: {
            align: 'left',
            color: '#AAAAAA',
          },
          b: {
            align: 'left',
            color: '#AAAAAA',
          },
        },
      },
      legend: bsInfo.size.xxxl ? {
        orient: 'vertical',
        right: 10,
        top: 40,
        itemWidth: 8,
        itemHeight: 8,
        // 使用回调函数
        formatter: function (name) {
          let formatterText = "";
          data.map((item) => {
            if (item.projectStatisticsTypeName == name) {
              // 下面的 {a| 对应上面 textStyle.rich.a
              formatterText = `${name} {a| ${(item.amountRate * 100).toFixed(2)}% } {b| ${Math.round(item.amount)} }`;
            }
          });
          return formatterText;
        },
        data: projectStatisticsType,
      } : {
        orient: 'horizontal',
        bottom: 10,
        itemWidth: 8,
        itemHeight: 8,
        data: projectStatisticsType,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['40%', '60%'],
          left: 0,
          right: bsInfo.size.xxxl ? '50%' : 0,
          top: 0,
          bottom: bsInfo.size.xxxl ? 0 : '20%',
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: amountRate
        }
      ]
    };
    echartsDom.consumerPerformance.options = options;
    echartsDom.consumerPerformance.dom.setOption(options);
  } else {
    echartsDom.consumerPerformance.dom.setOption({
      title: {
        text: '暂无数据',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 12,
          color: '#909399',
          fontWeight: 'normal'
        }
      }
    });
  }
  
}

// 业绩分析-处理数据、绘图
const setPerformanceAnalysis = (data) => {
  let dateStrData = [] // X轴
  let amountData = [] // Y轴-业绩
  let customerNumData = [] // Y轴-业绩

  // 整理数据
  data.map((item) => {
    dateStrData.push(item.dateStr)
    amountData.push(Math.round(item.amount))
    customerNumData.push(item.customerNum)
  });
  if(amountData && amountData.length > 0) {
    const options = {
      grid: {
        top: '20%',
        left: '1%',
        right: '1%',
        containLabel: true,
      },
      legend: {
        // bottom: '1%',
        // itemWidth: 6,
        // itemHeight: 6,
        // itemGap: 100,
        data: ['业绩', '客量（人）']
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dateStrData // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: [
        {
          type: 'value',
          name: '业绩',
          position: 'left'
        },
        {
          type: 'value',
          name: '客量（人）',
          position: 'right'
        }
      ],
      series: [
        {
          name: "业绩",
          data: amountData, // [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#4A51FF'
          },
          // symbol: 'none', // 'circle', // 拐点的形状
          symbolSize: 6, // 拐点大小
          showSymbol: false,
          emphasis: {
            // 鼠标hover上去的时候，拐点的颜色和样式
            itemStyle: {
              color: '#4A51FF', // 颜色
              borderColor: '#4A51FF', // 图形的描边颜色
              borderWidth: 1, // 描边的线宽
            }
          },
          areaStyle: {
            // opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(74, 81, 255)'
              },
              {
                offset: 1,
                color: 'rgb(255,255,255,0.25)'
              }
            ])
          },
          yAxisIndex: 0
        },
        {
          name: "客量（人）",
          data: customerNumData, // [20, 92, 91, 934, 120, 133, 120],
          type: 'line',
          smooth: true,
          showSymbol: false,
          // 线条样式
          lineStyle: {
            color: '#FFC93D'
          },
          emphasis: {
            // 鼠标hover上去的时候，拐点的颜色和样式
            itemStyle: {
              color: '#FFC93D', // 颜色
              borderColor: '#FFC93D', // 图形的描边颜色
              borderWidth: 5 // 描边的线宽
            }
          },
          // symbol: 'none', // 'circle', // 拐点的形状
          symbolSize: 6, // 拐点大小
          // 圆点样式
          itemStyle: {
            // 设置线条上点的颜色（和图例的颜色）
            normal: {
              color: '#FFC93D', // 颜色
              borderColor: '#FFC93D', // 图形的描边颜色
              borderWidth: 1, // 描边的线宽
            },
          },
          areaStyle: {
            // opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(255, 201, 61)'
              },
              {
                offset: 1,
                color: 'rgb(255,255,255,0.25)'
              }
            ])
          },
          yAxisIndex: 1
        }
      ]
    };
    echartsDom.performanceAnalysis.options = options;
    echartsDom.performanceAnalysis.dom.setOption(options);
  } else {
    echartsDom.performanceAnalysis.dom.setOption({
      title: {
        text: '暂无数据',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 12,
          color: '#909399',
          fontWeight: 'normal'
        }
      }
    });
  }
};

// 消费频次分析
const setWordFrequency = (data) => {
  // 整理数据
  let projectNameStr = [];
  data.map((item) => {
    projectNameStr.push({
      name: item.projectName,
      value: item.num
    });
  });
  // 绘图
  // let wordFrequency = echarts.init(document.getElementById('wordFrequency'));
  if(projectNameStr && projectNameStr.length > 0) {
    const options = {
      series: [
        {
          type: 'wordCloud',
          textStyle: {
            normal: {
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
            },
          },
          gridSize: 8,
          sizeRange: [12, 50],
          rotationRange: [0, 0],
          rotationStep: 45,
          shape: 'circle',
          data: projectNameStr.map(item => ({name: item.name, value: item.value})),
        },
      ],
    };
    echartsDom.wordFrequency.options = options;
    echartsDom.wordFrequency.dom.setOption(options);
  } else {
    echartsDom.wordFrequency.dom.setOption({
      title: {
        text: '暂无数据',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 12,
          color: '#909399',
          fontWeight: 'normal'
        }
      }
    });
  }
};
</script>

<style scoped lang="less">
@import (reference) '@/utils/common';
.custom-ant-picker;
.custom-ant-radio-group;
.custom-ant-table-body;

.gutter-box {
  background: #0092ff;
  padding: 8px 0;
}
.panelMain {
  h1 {
    text-align: center;
    padding: 28px 0;
  }
  .filter {
    margin: 12px;
  }
  .header-panel {
    // width: 1300px;
    height: 120px;
    background: #ffffff;
    //background: @themeColor1;
    //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
    border-radius: 8px 8px 8px 8px;
    opacity: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px;
    //margin: 10px;
    margin: 12px 12px 0 12px;
    .header-item {
      .title {
        font-size: 14px;
        font-weight: 400;
        color: #555555;
        line-height: 16px;
      }
      .text {
        font-size: 28px;
        font-weight: 650;
        color: #181818;
        line-height: 33px;
      }
    }
  }
  .panel-box {
    //height: 76vh;
    //height: calc(100% - 126px);
    overflow-y: scroll;
    .beauty-scroll;
    .content-panel {
      display: flex;
      //margin: 12px 0;
      margin: 12px;
      //width: calc(100% - 140px);
      .content-left {
        //width: 230px;
        //width: 20%;
        //min-width: 230px;
        height: 602px;
        background: #ffffff;
        //background: @themeColor1; // #ffffff;
        //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
        border-radius: 8px 8px 8px 8px;
        opacity: 1;
        padding: 16px;
        
        .title {
          font-size: 16px;
          font-weight: 600;
          color: #181818;
          line-height: 19px;
          margin-bottom: 20px;
        }
        
        .content-item {
          height: 550px;
          .overflow-scroll;
          .performance-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            line-height: 40px;
            border-bottom: 1px dashed #D2D2E4;
            .item-index {
              .index-text{
                margin-left: 4px;
              }
            }
            
            .item-right {
              width: 80%;
              .flexBetween;
              
              .item-name,
              .item-num {
                width: 40%;
                font-size: 14px;
                font-weight: 400;
                color: #555555;
                line-height: 16px;
              }
              
              .item-name {
              }
            }
          }
        }
        .content-empty{
          text-align: center;
          line-height: 40px;
          color: #909399;
        }
      }
      
      .content-center {
        //width: 612px;
        //width: 60%;
        margin: 0 12px;
        
        .center-top {
          height: 313px;
          background: #ffffff;
          //background: @themeColor1; // #ffffff;
          //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
          border-radius: 8px 8px 8px 8px;
          opacity: 1;
          margin-bottom: 12px;
          padding: 16px;
          
          .title {
            font-size: 16px;
            font-weight: 600;
            color: #181818;
            line-height: 19px;
            margin-bottom: 20px;
          }
        }
        
        .center-bottom {
          display: flex;
          //justify-content: space-between;
          //align-items: center;
          .bottom-left,
          .bottom-right {
            //width: 300px;
            width: 100%;
            height: 277px;
            background: #ffffff;
            //background: @themeColor1;  // #ffffff;
            //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
            border-radius: 8px 8px 8px 8px;
            opacity: 1;
            padding: 16px;
            
            .title {
              font-size: 16px;
              font-weight: 600;
              color: #181818;
              line-height: 19px;
            }
          }
          
          .bottom-right {
            margin-left: 12px;
          }
        }
      }
      
      .content-right {
        //width: 20%;
        //width: calc(100% - 800px);
        .right-top {
          //width: 415px;
          height: 313px;
          background: #ffffff;
          //background:@themeColor1;  // #ffffff;
          //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
          border-radius: 8px 8px 8px 8px;
          opacity: 1;
          margin-bottom: 12px;
          padding: 16px;
          
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            //.flexBetween;
            height: 44px;
            border-radius: 4px 4px 4px 4px;
            opacity: 1;
            margin-bottom: 16px;
            padding: 0 16px;
            
            .item-left {
              width: 60%;
            }
            
            .item-right {
              width: 40%;
              .flexBetween;
            }
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
          //width: 415px;
          height: 277px;
          background: #ffffff;
          //background: @themeColor1;  // #ffffff;
          //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
          border-radius: 8px 8px 8px 8px;
          opacity: 1;
          padding: 16px;
          
          .title {
            font-size: 16px;
            font-weight: 600;
            color: #181818;
            line-height: 19px;
          }
        }
      }
    }
    
    .footer-panel {
      height: 310px;
      margin: 0 12px;
      background: #ffffff;
      //background: @themeColor1;  // #ffffff;
      //background-image: linear-gradient(to right, @themeColor2, @themeColor7);
      border-radius: 8px 8px 8px 8px;
      opacity: 1;
      padding: 16px;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #181818;
        line-height: 19px;
      }
    }
  }
}
</style>


import { message } from 'ant-design-vue';
import dayjs from "dayjs";
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';//这是vue3导入XLSX的方法
import XLSXS from 'xlsx-js-style';
import { inject } from 'vue';
import elementResize from "element-resize-detector";

const echarts = inject('ec');

const [messageApi] = message.useMessage();

export function getSessionExpiryDate() {
  let nowDate = new Date().getTime()
  let expiryDate = new Date(dayjs(new Date()).format('yyyy-MM-dd') + ' 04:00').getTime()
  let sessionExpiryDate = new Date(dayjs(new Date()).format('yyyy-MM-dd') + ' 04:00')
  if (nowDate > expiryDate) {
    sessionExpiryDate = new Date(dayjs(new Date()).format('yyyy-MM-dd') + ' 04:00').getTime() + 24 * 60 * 60 * 1000
  }

  return new Date(sessionExpiryDate)
}


// 清除对象中没值的数据 unfined、null、[]、{}、''
export function clearEmptyPro(data) {
  let curVal
  let toString = Object.prototype.toString
  let dataType = toString.call(data)
  if (dataType || dataType === '[object Number]' || dataType === '[object Boolean]') {
    switch (dataType) {
      case '[object Object]':
        if (Object.keys(data).length > 0) {
          let momObj = {}
          for (let key in data) {
            let value = clearEmptyPro(data[key])
            let valueType = toString.call(value)
            valueType === '[object Boolean]' || valueType === '[object Number]' || value ? (momObj[key] = value) : ''
          }
          curVal = momObj
        } else {
          return
        }
        break
      case '[object Array]':
        if (data.length > 0) {
          let momValue = []
          data.forEach((e) => {
            let value = clearEmptyPro(e)
            let valueType = toString.call(value)
            valueType === '[object Boolean]' || valueType === '[object Number]' || value ? momValue.push(value) : ''
          })
          momValue.length > 0 ? (curVal = momValue) : ''
        } else {
          return
        }
        break
      case '[object Boolean]':
      default:
        curVal = data
        break
    }
  } else {
    return
  }
  return curVal
}
/* 缓存到本地 */
export const setStorage = (key, value) => {
  window.localStorage.setItem(key, value)
}

/* 获取本地缓存 */
export const getStorage = (key) => {
  return window.localStorage.getItem(key)
}

/* 删除本地缓存 */
export const removeStorage = (key) => {
  window.localStorage.removeItem(key)
}

export function formatImg(url = '', wid, hei, errorImg = '') {
  if (url === undefined || url === null || '' === url) {
    if (errorImg !== undefined && errorImg !== null && '' !== errorImg) {
      return errorImg + '?imageView2/1/w/' + wid + '/h/' + hei
    }
    return '/' + wid + '/h/' + hei
  }
  if (isNaN(wid) || wid < 1) {
    wid = 100
  }
  if (isNaN(hei) || hei < 1) {
    hei = 100
  }

  if (url.indexOf('?') !== -1) {
    return url + '&imageView2/1/w/' + wid + '/h/' + hei
  } else {
    return url + '?imageView2/1/w/' + wid + '/h/' + hei
  }
}

/**
 * 导出 excel 文件
 * @param array JSONData 数组
 * @param fileName 文件名
 * @param title 表头
 * @param filter 不导出字段
 */
export const exportExcel = (JSONData, FileName, title, filter) => {
  if (!JSONData) return;
  //转化json为object
  let arrData = typeof JSONData != "object" ? JSON.parse(JSONData) : JSONData;
  let excel = "<table>";
  //设置表头
  let row = "<tr>";
  // 设置 sheet 名
  let worksheet = FileName;
  if (title) { //使用标题项
    for (let i in title) {
      row += "<th align='center'>" + title[i] + "</th>";
    }
  } else {//不使用标题项
    for (let i in arrData[0]) {
      row += "<th align='center'>" + i + "</th>";
    }
  }
  excel += row + "</tr>";
  //设置数据
  for (let i = 0; i < arrData.length; i++) {
    let row = "<tr>";
    for (let index in arrData[i]) {
      //判断是否有过滤行
      if (filter) {
        if (filter.indexOf(index) == -1) {
          let value = arrData[i][index] == null ? "" : arrData[i][index];
          row += "<td>" + value + "</td>";
        }
      } else {
        let value = arrData[i][index] == null ? "" : arrData[i][index];
        row += "<td align='center'>" + value + "</td>";
      }
    }
    excel += row + "</tr>";
  }
  excel += "</table>";
  let excelFile =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
  excelFile +=
      '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
  excelFile +=
      '<meta http-equiv="content-type" content="application/vnd.ms-excel';
  excelFile += '; charset=UTF-8">';
  excelFile += "<head>";
  excelFile += "<!--[if gte mso 9]>";
  excelFile += "<xml>";
  excelFile += "<x:ExcelWorkbook>";
  excelFile += "<x:ExcelWorksheets>";
  excelFile += "<x:ExcelWorksheet>";
  excelFile += "<x:Name>";
  excelFile += `${worksheet}`;
  excelFile += "</x:Name>";
  excelFile += "<x:WorksheetOptions>";
  excelFile += "<x:DisplayGridlines/>";
  excelFile += "</x:WorksheetOptions>";
  excelFile += "</x:ExcelWorksheet>";
  excelFile += "</x:ExcelWorksheets>";
  excelFile += "</x:ExcelWorkbook>";
  excelFile += "</xml>";
  excelFile += "<![endif]-->";
  excelFile += "</head>";
  excelFile += "<body>";
  excelFile += excel;
  excelFile += "</body>";
  excelFile += "</html>";
  let uri =
      "data:application/vnd.ms-excel;charset=utf-8," +
      encodeURIComponent(excelFile);
  let link = document.createElement("a");
  link.href = uri;
  link.style = "visibility:hidden";
  link.download = FileName + ".xls";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


// 导出Excel文件的方法
export const exportExcelSheet = (allTable, excelName) => {
  const xlsxParam = {
    raw: true, // 如果为 true，则纯文本解析将不解析值
    // sheetRows: 1, //如果为 >0，则读取第一个 sheetRows 行
    // display: true, //如果为 true，则不会分析隐藏的行和单元格
  }
  let wb = XLSX.utils.book_new();
  // 循环添加每一个表格/sheet (如果是只有一个sheet页的话就不需要循环，直接添加进去就可以了)
  for (const item of allTable) {
    let sheet = XLSX.utils.table_to_sheet(document.querySelector(`#${item.eleName}`), xlsxParam);
    console.log("sheet", sheet);
    // debugger;
    XLSX.utils.book_append_sheet(wb, sheet, item.title)
  }
  console.log(wb) //打印查看wb的结构 看下图
  const wbout = XLSXS.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
  try {
    FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${excelName}.xlsx`)
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.log(e, wbout)
    }
  }
  return wbout
}

// json 转表格多sheet
export const exportJsonSheet = (blob, fileName) => {
  if (typeof blob == "object" && blob instanceof Blob) {
    blob = URL.createObjectURL(blob); // 创建blob地址
  }
  var aLink = document.createElement("a");
  aLink.href = blob;
  // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，有时候 file:///模式下不会生效
  aLink.download = fileName || "";
  var event;
  if (window.MouseEvent) event = new MouseEvent("click");
  //   移动端
  else {
    event = document.createEvent("MouseEvents");
    event.MouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
    );
  }
  aLink.dispatchEvent(event);
}

// 监听屏幕变化，防止父元素丢失导致的echarts宽度编程100px;
export const listenEcharts = (idName) => {
  const mainChart = document.getElementById(idName);
  // 初始化element-resize-detector组件
  const eResize = elementResize({
    strategy: 'scroll', // <- 推荐监听滚动，提升性能
    callOnAdd: true // 添加侦听器时是否应调用,默认true
  });
  echarts.init(mainChart) // 图标ID初始化
  eResize.listenTo(mainChart, function() {
    echarts.init(mainChart).resize() // 当元素尺寸发生改变是会触发此事件，刷新图表
  });
}

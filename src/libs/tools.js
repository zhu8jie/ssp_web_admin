export const forEach = (arr, fn) => {
    if (!arr.length || !fn) return
    let i = -1
    let len = arr.length
    while (++i < len) {
        let item = arr[i]
        fn(item, i, arr)
    }
}

// 获取当前时间 yyyy-mm-dd 00:00:00
export function writeStartsDate() {
    let now = new Date()
    now.setTime(now.getTime() - 24 * 60 * 60 * 1000)
    let year = now.getFullYear()
    let month = now.getMonth()
    let date = now.getDate()
    month = month + 1
    if (month < 10) month = '0' + month
    if (date < 10) date = '0' + date
    let time = ''
    time = year + '-' + month + '-' + date + ' ' + '00:00:00'
    return time
}

// 获取的准确时间 yyyy-mm-dd 00:00:00
export function writeEndDate() {
    let now = new Date()
    now.setTime(now.getTime() - 24 * 60 * 60 * 1000)
    let year = now.getFullYear()
    let month = now.getMonth()
    let date = now.getDate()
    let hour = now.getHours()
    let minu = now.getMinutes()
    let sec = now.getSeconds()
    month = month + 1
    if (month < 10) month = '0' + month
    if (date < 10) date = '0' + date
    if (hour < 10) hour = '0' + hour
    if (minu < 10) minu = '0' + minu
    if (sec < 10) sec = '0' + sec
    let time = ''
    time = year + '-' + month + '-' + date + ' ' + hour + ':' + minu + ':' + sec
    return time
}
// 获取当前时间 yyyy-mm-dd
export function getDayTime() {
    let startsDay = new Date()
    let startsMonth = startsDay.getMonth() + 1
    let startsTimeDay = startsDay.getDate()
    if (startsMonth < 10) {
        startsMonth = '0' + startsMonth
    }
    if (startsTimeDay < 10) {
        startsTimeDay = '0' + startsTimeDay
    }
    let yesterday = startsDay.getFullYear() + '-' + startsMonth + '-' + startsTimeDay
    return yesterday
}
// 获取前一天的时间
export function getYesterdayTime(data) {
    let startsDay = new Date(data.replace(new RegExp('-', 'gm'), '/'))
    startsDay.setTime(startsDay.getTime() - 24 * 60 * 60 * 1000)
    let startsMonth = startsDay.getMonth() + 1
    let startsTimeDay = startsDay.getDate()
    if (startsMonth < 10) {
        startsMonth = '0' + startsMonth
    }
    if (startsTimeDay < 10) {
        startsTimeDay = '0' + startsTimeDay
    }
    let yesterday = startsDay.getFullYear() + '-' + startsMonth + '-' + startsTimeDay
    return yesterday
}
/**
 *  是否手机号码
 */
export function validatePhone(rule, value, callback) {
    const reg = /^[1][3-9][0-9]{9}$/
    if (value === '' || value === undefined || value == null) {
        callback()
    } else {
        if ((!reg.test(value)) && value !== '') {
            callback(new Error('请输入正确的电话号码'))
        } else {
            callback()
        }
    }
}
/**
 *  是否统一社会信用代码
 */
export function validateCreditCode(rule, value, callback) {
    const reg = /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/
    if (value === '' || value === undefined || value === null) {
        callback()
    } else {
        if ((!reg.test(value)) && value !== '') {
            callback(new Error('请输入正确的统一社会信用代码'))
        } else {
            callback()
        }
    }
}
/**
 *  是否为身份证号
 */
export function validateIdNo(rule, value, callback) {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (value === '' || value === undefined || value === null) {
        callback()
    } else {
        if ((!reg.test(value)) && value !== '') {
            callback(new Error('请输入正确的身份证号码'))
        } else {
            callback()
        }
    }
}

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的交集, 两个数组的元素为数值或字符串
 */
export const getIntersection = (arr1, arr2) => {
    let len = Math.min(arr1.length, arr2.length)
    let i = -1
    let res = []
    while (++i < len) {
        const item = arr2[i]
        if (arr1.indexOf(item) > -1) res.push(item)
    }
    return res
}

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的并集, 两个数组的元素为数值或字符串
 */
export const getUnion = (arr1, arr2) => {
    return Array.from(new Set([...arr1, ...arr2]))
}
/*
 * 参数说明：
 * number：要格式化的数字
 * decimals：保留几位小数
 * dec_point：小数点符号
 * thousands_sep：千分位符号
 * */
export function monetFormat(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function(n, prec) {
            var k = Math.pow(10, prec)
            return '' + Math.ceil(n * k) / k
        }
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
    var re = /(-?\d+)(\d{3})/
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2")
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
}
/**
 * @param {Array} target 目标数组
 * @param {Array} arr 需要查询的数组
 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
 */
export const hasOneOf = (targetarr, arr) => {
    return targetarr.some(_ => arr.indexOf(_) > -1)
}

/**
 * @param {String|Number} value 要验证的字符串或数值
 * @param {*} validList 用来验证的列表
 */
export function oneOf(value, validList) {
    for (let i = 0; i < validList.length; i++) {
        if (value === validList[i]) {
            return true
        }
    }
    return false
}

/**
 * @param {Number} timeStamp 判断时间戳格式是否是毫秒
 * @returns {Boolean}
 */
const isMillisecond = timeStamp => {
    const timeStr = String(timeStamp)
    return timeStr.length > 10
}

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} currentTime 当前时间时间戳
 * @returns {Boolean} 传入的时间戳是否早于当前时间戳
 */
const isEarly = (timeStamp, currentTime) => {
    return timeStamp < currentTime
}

/**
 * @param {Number} num 数值
 * @returns {String} 处理后的字符串
 * @description 如果传入的数值小于10，即位数只有1位，则在前面补充0
 */
const getHandledValue = num => {
    return num < 10 ? '0' + num : num
}

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} startType 要返回的时间字符串的格式类型，传入'year'则返回年开头的完整时间
 */
const getDate = (timeStamp, startType) => {
    const d = new Date(timeStamp * 1000)
    const year = d.getFullYear()
    const month = getHandledValue(d.getMonth() + 1)
    const date = getHandledValue(d.getDate())
    const hours = getHandledValue(d.getHours())
    const minutes = getHandledValue(d.getMinutes())
    const second = getHandledValue(d.getSeconds())
    let resStr = ''
    if (startType === 'year') resStr = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + second
    else resStr = month + '-' + date + ' ' + hours + ':' + minutes
    return resStr
}

/**
 * @param {String|Number} timeStamp 时间戳
 * @returns {String} 相对时间字符串
 */
export const getRelativeTime = timeStamp => {
    // 判断当前传入的时间戳是秒格式还是毫秒
    const IS_MILLISECOND = isMillisecond(timeStamp)
    // 如果是毫秒格式则转为秒格式
    if (IS_MILLISECOND) Math.floor(timeStamp /= 1000)
    // 传入的时间戳可以是数值或字符串类型，这里统一转为数值类型
    timeStamp = Number(timeStamp)
    // 获取当前时间时间戳
    const currentTime = Math.floor(Date.parse(new Date()) / 1000)
    // 判断传入时间戳是否早于当前时间戳
    const IS_EARLY = isEarly(timeStamp, currentTime)
    // 获取两个时间戳差值
    let diff = currentTime - timeStamp
    // 如果IS_EARLY为false则差值取反
    if (!IS_EARLY) diff = -diff
    let resStr = ''
    const dirStr = IS_EARLY ? '前' : '后'
    // 少于等于59秒
    if (diff <= 59) resStr = diff + '秒' + dirStr
    // 多于59秒，少于等于59分钟59秒
    else if (diff > 59 && diff <= 3599) resStr = Math.floor(diff / 60) + '分钟' + dirStr
    // 多于59分钟59秒，少于等于23小时59分钟59秒
    else if (diff > 3599 && diff <= 86399) resStr = Math.floor(diff / 3600) + '小时' + dirStr
    // 多于23小时59分钟59秒，少于等于29天59分钟59秒
    else if (diff > 86399 && diff <= 2623859) resStr = Math.floor(diff / 86400) + '天' + dirStr
    // 多于29天59分钟59秒，少于364天23小时59分钟59秒，且传入的时间戳早于当前
    else if (diff > 2623859 && diff <= 31567859 && IS_EARLY) resStr = getDate(timeStamp)
    else resStr = getDate(timeStamp, 'year')
    return resStr
}

/**
 * @returns {String} 当前浏览器名称
 */
export const getExplorer = () => {
    const ua = window.navigator.userAgent
    const isExplorer = (exp) => {
        return ua.indexOf(exp) > -1
    }
    if (isExplorer('MSIE')) return 'IE'
    else if (isExplorer('Firefox')) return 'Firefox'
    else if (isExplorer('Chrome')) return 'Chrome'
    else if (isExplorer('Opera')) return 'Opera'
    else if (isExplorer('Safari')) return 'Safari'
}


/**
 * 判断一个对象是否存在key，如果传入第二个参数key，则是判断这个obj对象是否存在key这个属性
 * 如果没有传入key这个参数，则判断obj对象是否有键值对
 */
export const hasKey = (obj, key) => {
    if (key) return key in obj
    else {
        let keysArr = Object.keys(obj)
        return keysArr.length
    }
}

/**
 * @param {*} obj1 对象
 * @param {*} obj2 对象
 * @description 判断两个对象是否相等，这两个对象的值只能是数字或字符串
 */
export const objEqual = (obj1, obj2) => {
    const keysArr1 = Object.keys(obj1)
    const keysArr2 = Object.keys(obj2)
    if (keysArr1.length !== keysArr2.length) return false
    else if (keysArr1.length === 0 && keysArr2.length === 0) return true
    /* eslint-disable-next-line */
    else return !keysArr1.some(key => obj1[key] != obj2[key])
}

/**
 * [debounce 防抖]
 * @param  {Function} fn    [description]
 * @param  {Number}   delay [description]
 * @return {[type]}         [用户输入结束或暂停时，才会触发change事件]
 */
export function debounce(fn, delay = 500) {
    let timer = null

    return function() {
        if (timer) {
            clearTimeout(timer)
        }

        timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null
        }, delay)
    }
}

/**
 * [throttle 节流]
 * @param  {Function} fn    [description]
 * @param  {Number}   delay [description]
 * @return {[type]}         [无论你拖拽多快，都会在每隔100ms触发一次]
 */
export function throttle(fn, delay = 100) {
    let timer = null
    return function() {
        if (timer) {
            return
        }

        timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null
        }, delay)
    }
}
/**
 * 时间格式化
 * yyyy-MM-dd hh:mm:ss
 * @param  {[type]} time [description]
 * @param  {[type]} fmt  [description]
 * @return {[type]}      [description]
 **/
export function formatDate(time, fmt) {
    if (time) {
        var date = new Date(time)
        var o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'H+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
        }
        var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
        }
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + ''])
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
            }
        }

        return fmt
    } else {
        return ''
    }
}

/**
 * 产生随机整数，包含下限值，但不包括上限值
 * @param {Number} lower 下限
 * @param {Number} upper 上限
 * @return {Number} 返回在下限到上限之间的一个随机整数
 */
export function randomNumber(lower, upper) {
    return Math.floor(Math.random() * (upper - lower)) + lower
}



/**
 * [number2Thousand 数字转千分位]
 * 如果是整数，则直接返回千分位  例如 12345 =》 12,345
 * 如果带有小数点，则保留两位数字  例如12345.12 =》 12,345.12
 * @param  {[type]} num [description]
 * @return {[type]}     [description]
 */
export function number2Thousand(num) {
    // 非零/ 正负无穷
    if (!num || num === Infinity || num === -Infinity) {
        return 0
    } else {
        if (Number.isInteger(num)) {
            return parseInt(num).toLocaleString() // 数字
        } else {
            return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
        }
    }
    // return !!num ? (Number.isInteger(num) ? parseInt(num).toLocaleString() : num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')) : 0
}


/**
 * [getImgNaturalDimension 获取图片尺寸]
 * @param  {[type]}   src      [src 图片路径]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export function getImgNaturalDimension(src, callback) {
    if (typeof src.naturalWidth == "undefined") { // IE6/7/8
        var temImg = new Image()
        temImg.onload = function() {
            callback({
                width: temImg.width,
                height: temImg.height
            })
        }
        temImg.src = src
    } else { // 现代浏览器
        callback({
            width: src.naturalWidth,
            height: src.naturalHeight
        })
    }
}

/**
 * [getQueryString 获取url的字符串]
 * @param  {[type]} name [description]
 * @param  {[type]} url  [传入的url]
 * @return {[type]}      [description]
 */
export function getQueryString(name, url) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
    var _search = url.split('?')[1]

    if (typeof(_search) == undefined || typeof(_search) == 'undefined') {
        return null
    } else {
        var r = _search.match(reg)
    }

    if (r != null) return unescape(r[2])
    return null
}


/**
 * [miniCommonDivisor 最小公约数]
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
export function miniCommonDivisor(a, b) {
    var a = Number(a)
    var b = Number(b)
    return (b === 0) ? a : miniCommonDivisor(b, a % b)
}


/**
 * [evil 解决 使用eval，vue eslint会报 eval can be harmful]
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */
export function evil(fn) {
    // 一个变量指向Function，防止有些前端编译工具报错
    let Fn = Function
    return new Fn('return ' + fn)()
}

/**
 * [courseDownload 生成下载标签]
 * @param  {[type]} url      [description]
 * @param  {[type]} filename [description]
 * @return {[type]}          [description]
 */
export function createObjectURL(url, filename) {
    createBlob(url, function(blob) {
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename)
        } else {
            var link = document.createElement('a')
            var body = document.querySelector('body')

            link.href = window.URL.createObjectURL(blob)
            link.download = filename

            // fix Firefox
            link.style.display = 'none'
            body.appendChild(link)

            link.click()
            body.removeChild(link)

            window.URL.revokeObjectURL(link.href)
        }
    })
}

/**
 * [createBlob 生成blob]
 * @param  {[type]}   url [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
function createBlob(url, cb) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'

    xhr.onload = function() {
        if (xhr.status === 200) {
            cb(xhr.response)
        }
    }

    xhr.send()
}


/**
 * [fileReader2Promise 读取文件 转化为 promise]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
export function fileReader2Promise(file) {

    let _type = (!!file.type && file.type.indexOf('/') > -1) ? file.type.split('/')[1].toLowerCase() : null


    return new Promise((resolve, reject)=> {
        let reader = new FileReader()

        reader.onload = e => {

            let data = e.target.result
            let image = new Image()

            // 成功
            image.onload = ()=> {
                resolve({
                    width: image.width,
                    height: image.height,
                    bit: file.size,
                    name: file.name,
                    type: _type
                })
            }

            // 失败
            image.onerror = ()=> {
                reject(false)
            }

            image.src = data
        }

        reader.readAsDataURL(file)
    })
}
/**
 * [timeTo24ToInt 小时转24进制]
 * @return {[type]} [description]
 */
export function timeTo24ToInt(time) {
    let preTimeHour = parseInt(time[0].slice(0, 2))
    let lastTimeHour = parseInt(time[1].slice(0, 2))
    let _arr = []

    for (let i = 0; i < 24; i++) {
        _arr.push((i >= preTimeHour && i <= lastTimeHour) ? 1 : 0)
    }

    return parseInt(_arr.reverse().join(''), 2)
}
/**
 * [int24ToTime 数字转24位2进制，再转24时]
 * @return {[type]} [description]
 */
export function int24ToTime(num) {
    let numStr = num.toString(2)
    let fillArr = new Array(24 - numStr.length).fill(0).join('') // 补0

    let concatStrr = '' + fillArr + numStr

    let preIndex = 23 - concatStrr.lastIndexOf('1')
    let nextIndex = 23 - concatStrr.indexOf('1')

    let pre = preIndex >= 10 ? `${preIndex}:00` : `0${preIndex}:00`
    let next = nextIndex >= 10 ? `${nextIndex}:00` : `0${nextIndex}:00`

    return [pre, next]

}
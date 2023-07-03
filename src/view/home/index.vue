<template>
  <div class="revence-main">
    <Card v-show="flowShow || budgetShow" class="mon-card" dis-hover :bordered="false">
      <div class="echarts_title">
        <div class="title_header">整体趋势</div>
        <div class="title_search">
          <DatePicker
            :transfer="true"
            :value="search_time"
            format="yyyy-MM-dd"
            type="daterange"
            :options="options1"
            style="width: 200px"
            @on-change="filterByDate"
            :clearable="false"
          />
          <Select v-model="search_type" class="i-margin-right-11" style="width:120px" @on-change="gainLineData">
            <Option v-show="flowShow" :value="1">媒体</Option>
            <Option v-show="budgetShow" :value="2">预算方</Option>
          </Select>
          <Select @on-change="gainLineData" v-show="search_type ===1" class="i-margin-right-11 i-width-select"
                  filterable v-model="media_id" placeholder="全部媒体" :clearable="true">
            <Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          <Select @on-change="gainLineData" v-show="search_type ===2" class="i-margin-right-11 i-width-select"
                  filterable v-model="company_id" placeholder="全部预算方" :clearable="true">
            <Option v-for="item in companySelectList" :value="item.id" :key="item.id">{{ item.company_name }}</Option>
          </Select>
        </div>
      </div>
      <div class="revence_number">
        <div class="revence_content">
          <Card v-show=" (search_type===1 && showStatusMedia) || (search_type===2 && showStatusCompany) " :bordered="false" dis-hover class="earn-card"
                style="background: linear-gradient(86deg, #FFC444, #FF9518);">
            <img class="top_img" src="~@/assets/image/top_img4.png"/>
            <div class="m-number">{{homeBase.show_pv}}</div>
            <p>广告展现</p>
            <img class="bottom_img" src="~@/assets/image/bottom_img1.png"/>
          </Card>
          <Card v-show=" (search_type===1 && clickStatusMedia) || (search_type===2 && clickStatusCompany) " :bordered="false" dis-hover class="earn-card"
                style="background: linear-gradient(86deg, #1BB8EF, #4993FE);">
            <img class="top_img" src="~@/assets/image/top_img1.png"/>
            <div class="m-number">{{homeBase.click_pv}}</div>
            <p>广告点击</p>
            <img class="bottom_img" src="~@/assets/image/bottom_img2.png"/>
          </Card>
          <Card v-show=" (search_type===1 && incomeStatusMedia) || (search_type===2 && incomeStatusCompany) " :bordered="false" dis-hover class="earn-card"
                style="background: linear-gradient(86deg, #06CCD9, #02BECB);">
            <img class="top_img" src="~@/assets/image/top_img2.png"/>
            <div class="m-number">{{homeBase.income_int}}.<span>{{homeBase.income_float}}</span></div>
            <p v-show="search_type===1">预估收益</p>
            <p v-show="search_type===2">收益</p>
            <img class="bottom_img" src="~@/assets/image/bottom_img3.png"/>
          </Card>
          <Card  v-show=" (search_type===1 && profitStatusMedia) || (search_type===2 && profitStatusCompany) " :bordered="false" dis-hover class="earn-card"
                style="background:linear-gradient(86deg, #4F70F0, #333FDA);margin-right: 0px">
            <img class="top_img" src="~@/assets/image/top_img3.png" style="top: -15px"/>
            <div class="m-number">{{homeBase.profits_int}}.<span>{{homeBase.profits_float}}</span></div>
            <p>利润</p>
            <img class="bottom_img" src="~@/assets/image/bottom_img4.png"/>
          </Card>
        </div>
      </div>
      <div class="echatrs_select">
        <div class="select_data">
          <div style="display:inline-block" v-show="search_type===1">
            <Select v-model="mediaEchartX" class="i-margin-right-11" style="width:140px" @on-change="initMoniter">
              <Option v-for="item in echartsMediaTarget" :value="item.key" :disabled="item.key === mediaEchartY"
                      :key="'echarts1'+item.key">{{ item.label }}
              </Option>
            </Select>
            <Checkbox class="select_check" v-model="contrast">对比</Checkbox>
            <Select v-show="contrast" v-model="mediaEchartY" class="i-margin-right-11" style="width:140px"
                    @on-change="initMoniter">
              <Option v-for="item in echartsMediaTarget" :value="item.key" :disabled="item.key === mediaEchartX"
                      :key="'echarts2'+item.key">{{ item.label }}
              </Option>
            </Select>
          </div>
          <div style="display:inline-block" v-show="search_type===2">
            <Select v-model="companyEchartX" class="i-margin-right-11" style="width:140px" @on-change="initMoniter">
              <Option v-for="item in echartsCompanyTarget" :value="item.key" :disabled="item.key === companyEchartY"
                      :key="'echarts1'+item.key">{{ item.label }}
              </Option>
            </Select>
            <Checkbox class="select_check" v-model="contrast">对比</Checkbox>
            <Select v-show="contrast" v-model="companyEchartY" class="i-margin-right-11" style="width:140px"
                    @on-change="initMoniter">
              <Option v-for="item in echartsCompanyTarget" :value="item.key" :disabled="item.key === companyEchartX"
                      :key="'echarts2'+item.key">{{ item.label }}
              </Option>
            </Select>
          </div>
        </div>
      </div>
      <div v-show="lineStatus === 1" class="no_data">
        <p><img src="~@/assets/image/noDatas.png" alt=""></p>
        <p class="no_text">暂无数据</p>
      </div>
      <div v-show="lineStatus === 2">
        <div id="dataTrend" class="echart-content"></div>
      </div>
    </Card>
    <div class="data_show" v-show="flowShow || budgetShow" >
      <div class="data_detail data_media" v-show="flowShow">
        <div class="data_header">
          <div class="data_title">媒体数据</div>
          <div>
            <Select v-model="mediaTime" class="i-margin-right-11" style="width:152px" @on-change="getSspPie">
              <Option :value="1">今日</Option>
              <Option :value="2">昨日</Option>
              <Option :value="3">最近7天</Option>
              <Option :value="4">最近30天</Option>
            </Select>
            <Select v-model="mediaTarget" class="i-margin-right-11" style="width:152px" @on-change="getSspPie">
              <Option v-for="item in echartsMediaTarget" :value="item.key" :key="'媒体'+item.key">{{ item.label }}</Option>
            </Select>
          </div>
        </div>
        <div v-show="mediaPieStatus===1" id="mediaPie" style="height: 500px;width: 500px"></div>
        <div v-show="mediaPieStatus===2" class="nodata">
          <p><img src="~@/assets/image/noDatas.png" alt=""></p>
          <p class="no_text">暂无数据</p>
        </div>
      </div>
      <div class="data_detail data_company" v-show="budgetShow">
        <div class="data_header">
          <div class="data_title">预算方数据</div>
          <div>
            <Select v-model="companyTime" class="i-margin-right-11" style="width:152px" @on-change="getDspPie">
              <Option :value="1">今日</Option>
              <Option :value="2">昨日</Option>
              <Option :value="3">最近7天</Option>
              <Option :value="4">最近30天</Option>
            </Select>
            <Select v-model="companyTarget" class="i-margin-right-11" style="width:152px" @on-change="getDspPie">
              <Option v-for="item in echartsCompanyTarget" :value="item.key" :key="'预算方'+item.key">{{ item.label }}</Option>
            </Select>
          </div>
        </div>
        <div v-show="companyPieStatus===1" id="companyPie" style="height: 500px;width: 500px"></div>
        <div v-show="companyPieStatus===2" class="nodata">
          <p><img src="~@/assets/image/noDatas.png" alt=""></p>
          <p class="no_text">暂无数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import {getHomeSspData, getHomeDspData} from '@/api/common'
  import {monetFormat, getDayTime, getYesterdayTime, number2Thousand} from '@/libs/tools'
  import {commonMixin} from '@/mixin/basic-common-class.js'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import {mapActions} from 'vuex'

  export default {
    mixins: [commonMixin, inPageAccess],
    data() {
      return {
        contrast: false,
        colorList: ['#96BFFF', '#37A2DA', '#32C5E9', '#9FE6B8', '#FFDB5C', '#FF9F7F', '#E690D1', '#E7BCF3', '#9D96F5', '#8378EA'],
        lineColor: ['#0090E5', '#4CAF50'],
        lineStatus: 2,
        mediaEchartX: '',
        mediaEchartY: '',
        companyEchartX: '',
        companyEchartY: '',
        echartsMediaTarget: [],
        echartsCompanyTarget: [],
        mediaPieStatus: 2,
        companyPieStatus: 2,
        options1: {
          disabledDate(date) {
            let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
            return date.valueOf() >= Date.now() || date.valueOf() < disableData
          },
          shortcuts: [
            {
              text: '最近七天',
              value() {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                return [start, end]
              }
            },
            {
              text: '最近30天',
              value() {
                let end = new Date()
                let start = new Date()
                let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                if (start < disableData) {
                  start = new Date(disableData)
                }
                return [start, end]
              }
            }
          ]
        },
        search_time: null,
        sumData: {},
        lineData: {},
        myChart: null,
        search: {
          start_date: '',
          end_date: ''
        },
        homeBase: {
          show_pv: 0,
          click_pv: 0,
          income_int: 0,
          income_float: 0,
          profits_int: 0,
          profits_float: 0
        },
        search_type: 1, // 选择媒体预算位
        media_id: null, // 媒体的id
        company_id: null, // 预算方的id
        companySelectList: [],
        echartsTarget: [],
        mediaTime: 2,
        mediaTarget: 'income',
        companyTime: 2,
        companyTarget: 'income',
        legendData: [],
        mediaData: [],
        companyData: [],
        legendY: [],
        legendMediaData: [],
        legendCompanyData: [],
        showStatusMedia: true,
        clickStatusMedia: true,
        incomeStatusMedia: true,
        profitStatusMedia: true,
        showStatusCompany: true,
        clickStatusCompany: true,
        incomeStatusCompany: true,
        profitStatusCompany: true,
        menuList: [],
        flowShow: false,
        budgetShow: false
      }
    },
    methods: {
      ...mapActions([
        'getDspCompanyList'
      ]),
      viewData() {
        // eslint-disable-next-line standard/object-curly-even-spacing
        this.$router.push({name: 'ssp-data'})
      },
      number2Thousand(number) {
        return number2Thousand(number)
      },
      /**
       * [_getDspCompanyList 获取预算方]
       * @return {[type]} [description]
       */
      async _getDspCompanyList(action) {
        let storeUser = this.$store.state.user
        let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList()

        this.companySelectList = resArr
      },
      // 赋值时间的默认值
      getTimeData() {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        this.search_time = [start, end]
        this.search.start_date = this.getLocalTime(start.getTime())
        this.search.end_date = this.getLocalTime(end.getTime())
      },
      getLocalTime(tt) {
        let date = new Date(tt)
        let Y = date.getFullYear()
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let D = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()
        let data = Y + '-' + M + '-' + D
        return data
      },

      filterByDate(e) {
        let start = new Date(e[0]).getTime()
        let end = new Date(e[1]).getTime()
        if (end - start > 2678400000) {
          this.$Message.error('选择日期不能超过31天')
          this.getTimeData()
        } else {
          this.search.start_date = e[0]
          this.search.end_date = e[1]
          if (e[0]) {
            this.gainLineData()
          }
        }
      },
      /**
       * [doCreate 获取选中的菜单权限的最后一项]
       * @return {[type]} [description]
       */
      setMenuList(arr, level) {
        if (arr.length === 0) {
          return
        }
        arr.map(item => {
          if (!!item.children && item.children.length) {
            let _index = level
             this.setMenuList(item.children, ++_index)
          } else {
            this.menuList.push(item.name)
          }
        })
      },
      /**
       * [getHomeDevInfo 获取首页基本数据]
       * @return {[type]} [description]
       */
      commonData() {
        let menuList = this.$store.getters.menuList
        this.menuList = []
        this.setMenuList(menuList, 1)
        if (this.menuList.indexOf('ssp-data') >= 0) {
          let flowFields = this.$store.getters.getUserSspFields
          this.flowShow = true
          let flowList = this.$store.state.app.flowDataList
          let flowArr = flowList.filter(item => {
            return !this.$store.getters.getUserAllFields ? flowFields.includes(item.key) && item.inHomeSelect : item.inHomeSelect
          }).map((item, index) => {
            return item
          })
          this.echartsMediaTarget = flowArr
          this.legendMediaData = this.echartsMediaTarget.map((item, index) => {
            return item.label
          })
          this.showStatusMedia = !!this.legendMediaData.includes('广告展现pv')
          this.clickStatusMedia = !!this.legendMediaData.includes('广告点击pv')
          this.incomeStatusMedia = !!this.legendMediaData.includes('预估收益')
          this.profitStatusMedia = !!this.legendMediaData.includes('利润')
          this.mediaEchartX = this.showStatusMedia ? 'show_pv' : this.echartsMediaTarget[0].key
          this.contrast = this.echartsMediaTarget.length > 1
          this.mediaEchartY = this.incomeStatusMedia ? 'income' : this.echartsMediaTarget.length ? this.echartsMediaTarget[1].key : ''
          this.mediaTarget = this.echartsMediaTarget[0].key
        }
        if (this.menuList.indexOf('dsp-data') >= 0) {
          let budgetFields = this.$store.getters.getUserDspFields
          this.budgetShow = true
          let budgetList = this.$store.state.app.budgetDataList

          let budgetArr = budgetList.filter(item => {
            return !this.$store.getters.getUserAllFields ? budgetFields.includes(item.key) && item.inHomeSelect : item.inHomeSelect
          }).map((item, index) => {
            return item
          })

          this.echartsCompanyTarget = budgetArr
          this.legendCompanyData = this.echartsCompanyTarget.map((item, index) => {
            return item.label
          })
          this.showStatusCompany = !!this.legendCompanyData.includes('广告展现pv')
          this.clickStatusCompany = !!this.legendCompanyData.includes('广告点击pv')
          this.incomeStatusCompany = !!this.legendCompanyData.includes('收益')
          this.profitStatusCompany = !!this.legendCompanyData.includes('利润')
          this.companyEchartX = this.showStatusCompany ? 'show_pv' : this.echartsCompanyTarget[0].key
          this.companyEchartY = this.incomeStatusCompany ? 'income' : this.echartsCompanyTarget.length ? this.echartsCompanyTarget[1].key : ''
          this.contrast = this.echartsCompanyTarget.length > 1
          this.companyTarget = this.echartsCompanyTarget[0].key
        }
        this.search_type = this.menuList.indexOf('ssp-data') >= 0 ? 1 : 2
      },
      /**
       * [getHomeLine 获取线状图数据]
       * @return {[type]} [description]
       */
      gainLineData() {
        if (this.search_type === 1) {
          let data = {}
          data.start_date = this.search.start_date
          data.end_date = this.search.end_date
          if (this.media_id) {
            let udID = []
            udID.push(this.media_id)
            data.ud_id = udID
          }
          getHomeSspData(data).then(res => {
            if (res.code === 200) {
              this.getData(res)
            }
          })
        } else {
          let data = {}
          data.start_date = this.search.start_date
          data.end_date = this.search.end_date
          if (this.company_id) {
            let companyId = []
            companyId.push(this.company_id)
            data.dsp_company_id = companyId
          }
          getHomeDspData(data).then(res => {
            if (res.code === 200) {
              this.getData(res)
            }
          })
        }
      },
      // 折线图的提示
      getData(data) {
        let list = data.data.list
        if (list.length > 0) {
          this.lineStatus = 2
          let obj = {}

          let _list = list

            _list.map(item => {
              for (let key in item) {
                let temp = obj[key] ? obj[key] : []
                obj[key] = temp.concat(item[key])
              }
            })
          this.lineData = obj
          this.homeBase.show_pv = monetFormat(eval(this.lineData.show_pv.join('+')))
          this.homeBase.click_pv = monetFormat(eval(this.lineData.click_pv.join('+')))
          let income = eval(this.lineData.income.join('+'))
          this.homeBase.income_int = monetFormat(parseInt(income), 0, '.', ',')
          this.homeBase.income_float = income.toFixed(2).split('.')[1]
          let profits = eval(this.lineData.profits.join('+'))
          this.homeBase.profits_int = monetFormat(parseInt(profits), 0, '.', ',')
          this.homeBase.profits_float = profits.toFixed(2).split('.')[1]
          this.initMoniter()
        } else {
          this.lineStatus = 1
          this.homeBase.show_pv = 0
          this.homeBase.click_pv = 0
          this.homeBase.income_int = 0
          this.homeBase.income_float = 0
          this.homeBase.profits_int = 0
          this.homeBase.profits_float = 0
        }
      },
      initMoniter() {
        let dataTrend = document.getElementById('dataTrend')
        if (window.innerWidth - 250 > 1120) {
          dataTrend.style.width = window.innerWidth - 250 + 'px'
        } else {
          dataTrend.style.width = 1120 + 'px'
        }
        this.myChart = echarts.init(document.getElementById('dataTrend'))
        let preValueItem = {}
        let nextValueItem = {}
        let selectArr = this.search_type === 1 ? this.echartsMediaTarget : this.echartsCompanyTarget
        let preValue = this.search_type === 1 ? this.mediaEchartX : this.companyEchartX
        let nextValue = this.search_type === 1 ? this.mediaEchartY : this.companyEchartY
         selectArr.map(item => {
          if (item.key === preValue) {
            preValueItem = item
          }

          if (item.key === nextValue) {
            nextValueItem = item
          }
        })
        // y
        let _yAxis = [
          {
            type: 'value',
            name: `${preValueItem.label}(${preValueItem.unit})`,
            axisLine: {
              show: false,
              lineStyle: {
                color: this.lineColor[0]
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: this.lineColor[0]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#F2F4F3'
              }
            }
          }
        ]
        // y -value
        let _series = [{
          data: this.lineData[preValue],
          name: preValueItem.label,
          type: 'line'
        }]

        if (!!nextValue && this.contrast) {
          _yAxis.push({
            type: 'value',
            name: `${nextValueItem.label}(${nextValueItem.unit})`,
            axisLine: {
              show: false,
              lineStyle: {
                color: this.lineColor[1]
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: this.lineColor[1]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#F2F4F3'
              }
            }
          })

          _series.push({
            data: this.lineData[nextValue],
            name: nextValueItem.label,
            yAxisIndex: 1,
            type: 'line'
          })
        }
        this.myChart.clear()
        // 基于准备好的dom，初始化echarts实例
        // 绘制图表
        this.option = {
          color: this.lineColor,
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#ffffff', // 设置背景图片 rgba格式
            boxShadow: '0px 0px 9px 0px ;',
            borderRadius: 4,
            padding: 15,
            extraCssText: 'box-shadow: 0 0 9px rgba(0, 0, 0, 0.1);',
            textStyle: {
              color: '#333333',
              fontSize: 12
            },
            formatter: function (params) {
              // 系列
              let html = '<p style="padding-bottom:10px;border-bottom: 1px solid #E5E5E5;margin-bottom: 10px">' + params[0].name + '</p>'

              for (var i = 0; i < params.length; i++) {
                // 获取每个系列对应的颜色值
                html += '<p style="line-height: 25px"><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params[i].color + ';"></span>'
                html += params[i].seriesName + ': ' + number2Thousand(params[i].value) + '(' + (i == 0 ? preValueItem.unit : (nextValueItem.unit || '')) + ')</p>'
              }
              return html
            }
          },
          grid: {
            left: '9%',
            right: '9%',
            bottom: '7%',
            top: '10%'
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.lineData.date,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#F1F3F3',
                type: 'solid'
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#656565'
              }
            }
          },
          yAxis: _yAxis,
          series: _series
        }
        this.myChart.setOption(this.option)
      },
      // 获取媒体的饼图
      getSspPie() {
        let obj = {}
        if (this.mediaTime === 1) {
          obj.start_date = getDayTime()
          obj.end_date = getDayTime()
        } else if (this.mediaTime === 2) {
          let data = getDayTime()
          obj.start_date = getYesterdayTime(data)
          obj.end_date = getYesterdayTime(data)
        } else {
          if (this.mediaTime === 3) {
            const start1 = new Date()
            start1.setTime(start1.getTime() - 3600 * 1000 * 24 * 7)
            obj.start_date = this.getLocalTime(start1.getTime())
          } else if (this.mediaTime === 4) {
            const start2 = new Date()
            start2.setTime(start2.getTime() - 3600 * 1000 * 24 * 30)
            obj.start_date = this.getLocalTime(start2.getTime())
          }
          obj.end_date = getDayTime()
        }
        obj.group = 'ud_id'
        obj.order = this.mediaTarget
        getHomeSspData(obj).then(res => {
          if (res.code === 200) {
            let pieData = res.data.list
            if (pieData && pieData.length > 0) {
              this.mediaPieStatus = 1
              let data = []
              Object.keys(pieData).forEach((i, index) => {
                if (index < 21) {
                  let obj = {}
                  obj.value = pieData[i][this.mediaTarget]
                  obj.name = index===20 ? '其他' : pieData[i].company_short_name
                  data.push(obj)
                }
              })
              this.mediaData = data
              this.initPieMedia()
            } else {
              this.mediaPieStatus = 2
            }
          }
        })
      },
      // 获取预算方的饼图
      getDspPie() {
        let obj = {}
        if (this.companyTime === 1) {
          obj.start_date = getDayTime()
          obj.end_date = getDayTime()
        } else if (this.companyTime === 2) {
          let data = getDayTime()
          obj.start_date = getYesterdayTime(data)
          obj.end_date = getYesterdayTime(data)
        } else {
          if (this.companyTime === 3) {
            const start3 = new Date()
            start3.setTime(start3.getTime() - 3600 * 1000 * 24 * 7)
            obj.start_date = this.getLocalTime(start3.getTime())
          } else if (this.companyTime === 4) {
            const start4 = new Date()
            start4.setTime(start4.getTime() - 3600 * 1000 * 24 * 30)
            obj.start_date = this.getLocalTime(start4.getTime())
          }
          obj.end_date = getDayTime()
        }
        obj.group = 'dsp_company_id'
        obj.order = this.companyTarget
        getHomeDspData(obj).then(res => {
          if (res.code === 200) {
            let pieData = res.data.list
            if (pieData && pieData.length > 0) {
              let data = []
              Object.keys(pieData).forEach((i, index) => {
                if (index < 21) {
                  let obj = {}
                  obj.value = pieData[i][this.companyTarget]
                  obj.name =   obj.name = index===20 ? '其他' : pieData[i].dsp_company_name
                  data.push(obj)
                }
              })
              this.companyPieStatus = 1
              this.companyData = data
              this.initPieCompany()
            } else {
              this.companyPieStatus = 2
            }
          }
        })
      },

      initPieMedia() {
        const mediaPie = document.getElementById('mediaPie')
        if (window.innerWidth - 250 > 1120) {
          mediaPie.style.width = (window.innerWidth) / 2 - 130 + 'px'
        } else {
          mediaPie.style.width = 540 + 'px'
        }
        let myChartPie = echarts.init(document.getElementById('mediaPie'))
        let pieOption = {
          color: this.colorList,
          tooltip: {
            trigger: 'item',
            backgroundColor: '#ffffff', // 设置背景图片 rgba格式
            boxShadow: '0px 0px 9px 0px ;',
            borderRadius: 4,
            padding: 15,
            extraCssText: 'box-shadow: 0 0 9px rgba(0, 0, 0, 0.1);',
            textStyle: {
              color: '#333333',
              fontSize: 12
            },
            transitionDuration: 0,
            formatter: function (params) {
              // 系列
              let html = '<p style="padding-bottom:10px;border-bottom: 1px solid #E5E5E5;margin-bottom: 10px">' + params.name + '</p>'
              html += '<p style="line-height: 25px"><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params.color + ';"></span>'
              html += number2Thousand(params.value) + ' (' + params.percent + '%)</p>'
              return html
            }
          },
          legend: {
            icon: "circle",
            orient: 'horizontal',
            itemHeight: 10,
            x: 'left',
            y:'center',
            right: '80%',
            top: '76%',
            textStyle: {
              color: "#333333",
              padding:[0,15,0,0],
            },
            itemGap: 8,
          },
          series: [{
            type: 'pie',
            radius: ['28%', '46%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            label: {
              normal: {
                fontSize: 12
              }
            },
            data: this.mediaData
          }]
        }
        myChartPie.setOption(pieOption)
      },
      initPieCompany() {
        const companyPie = document.getElementById('companyPie')
        if (window.innerWidth - 250 > 1120) {
          companyPie.style.width = (window.innerWidth) / 2 - 130 + 'px'
        } else {
          companyPie.style.width = 540 + 'px'
        }
        let myChartPie2 = echarts.init(document.getElementById('companyPie'))
        let pieOption = {
          color: this.colorList,
          tooltip: {
            trigger: 'item',
            backgroundColor: '#ffffff', // 设置背景图片 rgba格式
            boxShadow: '0px 0px 9px 0px ;',
            borderRadius: 4,
            padding: 15,
            extraCssText: 'box-shadow: 0 0 9px rgba(0, 0, 0, 0.1);',
            textStyle: {
              color: '#333333',
              fontSize: 12
            },
            transitionDuration: 0,
            formatter: function (params) {
              // 系列
              let html = '<p style="padding-bottom:10px;border-bottom: 1px solid #E5E5E5;margin-bottom: 10px">' + params.name + '</p>'
              html += '<p style="line-height: 25px"><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params.color + ';"></span>'
              html += number2Thousand(params.value) + ' (' + params.percent + '%)</p>'
              return html
            }
          },
          legend: {
            icon: "circle",
            orient: 'horizontal',
            x: 'left',
            itemHeight: 10,
            y:'center',
            right: '70%',
            top: '76%',
            textStyle: {
              color: "#333333",
              padding:[0,15,0,0],
            },
            itemGap: 8
          },
          series: [{
            type: 'pie',
            radius: ['28%', '46%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            label: {
              normal: {
                fontSize: 12
              }
            },
            data: this.companyData
          }]
        }
        myChartPie2.setOption(pieOption)
      }
    },
    created() {
      // 从登录页面跳转到首页，此时需要加入路由[length = 0] 的判断，默认去第一条
      let _menu = this.$store.getters.menuList

      if (_menu.length && _menu[0].children.length && _menu[0].name !== 'home') {
        // 此处相当于做了一个中间件跳转
        this.$router.replace({name: _menu[0].children[0].name})
      } else {
          this.commonData()
          this.getTimeData()
          this.gainLineData()
          this.getSspPie()
          this.getDspPie()
          this._getDspCompanyList()
      }
    }
  }
</script>

<style lang="stylus" scoped>
  /deep/ .echatrs_select{
      .ivu-select-selection{
        border 0px
      }
    .ivu-checkbox-wrapper {
      font-size 12px
      color #999999
    }

    .select_check {
      .ivu-checkbox-checked .ivu-checkbox-inner {
        border-color #4083F8
        background #FFFFff
      }

      .ivu-checkbox-checked .ivu-checkbox-inner:after {
        border-color #4083F8
      }

      &.ivu-checkbox-wrapper-checked {
        color #4083F8
      }
    }
  }

  .revence-main {
    .revence_number {
      margin 25px 0
    }

    .revence_content {
      display flex
      .earn-card {
        width 25%
        height 80px
        margin-right 20px
        color #999999
        font-size 14px
        position relative
        overflow hidden
        padding: 0 24px
        border-radius 6px

        .top_img {
          position absolute
          top: 0px
          left 3px
        }

        .bottom_img {
          position absolute
          bottom -5px
          right -5px
        }

        /deep/ .ivu-card-body {
          padding 0px
        }

        p {
          font-size 14px
          color: #FFFFff
        }

        .m-number {
          margin-top: 10px
          font-size: 26px;
          font-weight: bold
          line-height: 32px
          color #FFFFff

          span {
            font-size 18px
          }
        }
      }
    }

    .mon-card {
      min-height calc(100vh - 240px)

      .echarts_title {
        height 40px
        line-height 40px
        display flex
        justify-content space-between

        .title_header {
          font-size: 16px;
          font-weight: bold;
          color: #333333;
        }

        .title_active {
          font-size: 12px;
          font-weight: 400;
          color: #3F83F7;
          margin-left 20px
        }
      }

      .echatrs_select {
        text-align center
        margin 15px 0
      }
    }

    .echart-content {
      margin-top: 10px
      height: 400px
      width 100%
    }

    .no_data {
      width: 100%
      height: 350px
      padding-top 100px
      text-align center

      .no_text {
        color: #999999
        font-size 14px
        margin-top 20px
      }
    }

  }

  .data_show {
    display flex
    justify-content space-between
    height 530px
    margin-top 10px
    margin-bottom 25px

    .data_detail {
      width 50%
      background: #FFFFFF;
      padding 15px
      height 530px
      &.data_media {
        margin-right 20px
      }
      .data_header {
        height 40px
        line-height 40px
        display flex
        justify-content space-between

        .data_title {
          color #333333
          font-size 16px
          font-weight bold
        }
      }

      .nodata {
        width: 100%
        height: 350px
        padding-top 150px
        text-align center

        .no_text {
          color: #999999
          font-size 14px
          margin-top 20px
        }
      }
    }
  }
</style>

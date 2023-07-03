<template>
  <div class="cascader_wrapper">
    <mutiCascaderContent ref="muti"
                         class="cascader_content"
                         :title="mutiTitle"
                         :titleLoading="loadTitle"
                         :datas="mutiDatas"
                         :onlyBottom="onlyBottom"
                         :warnWidth="warnWidth"
                         @update="reciveDatas"
                         @onSearch="onSearch" />
    <div :class="warnWidth==='预警中心'? 'warnWrapper select_wrapper': warnWidth==='公司' ? 'companyWrapper select_wrapper' : 'select_wrapper'">
      <div class="header">
        <span v-if="warnWidth==='预警中心'">已选:{{selectDatas.length}}个<span v-if="warnWidth==='预警中心'"><span v-if="selectDatas.length>0">，其中</span>{{selectDatas | selectText}}</span></span>
        <span v-else-if="title==='省份'">已选：{{ selectDatas | citylength}}个</span>
        <span v-else>已选:{{selectDatas.length}}个</span>
        <span v-show="selectDatas.length">
          <a href="javascript:void(0);"
             @click="clearAll">清空</a>
        </span>
      </div>

      <template v-if="!selectDatas.length">
        <div class="content-none" style="height: 250px">
          <img width="90" src="~@/assets/image/no_data.jpg" alt="">
          <p style="font-size:14px;">暂未选择</p>
        </div>
      </template>
      <div v-else
          :class="warnWidth==='预警中心'? 'warnContent content': 'content'">
        <div
            v-for="(item,index) in selectDatas"
            :key="`selected${index}`">
          <div  v-if="title==='省份'">
            <div class="item_wrapper" v-if="item.type==='app'" v-for="(it,i) in item.children" :key="'应用'+i">
              <span v-if="it.fatherCitylabel" :title="it.fatherCitylabel +'-'+ it.childrenCitylabel" class="item_label">{{it.fatherCitylabel}}-{{it.childrenCitylabel}}</span>
              <span v-else :title="it.label" class="item_label">{{ it.label }}</span>
              <span class="remove_btn"
                    @click="handleRemove(it)">
                   <Icon type="md-close" />
                </span>
            </div>
            <div  class="item_wrapper" v-if="item.type==='cityChildren'">
              <span v-if="item.fatherCitylabel" :title="item.fatherCitylabel +'-'+ item.childrenCitylabel" class="item_label">{{item.fatherCitylabel}}-{{item.childrenCitylabel}}</span>
              <span v-else :title="item.label" class="item_label">{{ item.label }}</span>
              <span class="remove_btn"
                    @click="handleRemove(item)">
                  <Icon type="md-close" />
                </span>
            </div>
          </div>
          <div v-else  class="item_wrapper">
            <span v-if="item.fatherlabel" :title="item.fatherlabel +'&'+ item.childrenlabel" class="item_label">{{item.fatherlabel}}&{{item.childrenlabel}}</span>
            <span v-else-if="item.fatherCitylabel" :title="item.fatherCitylabel +'-'+ item.childrenCitylabel" class="item_label">{{item.fatherCitylabel}}-{{item.childrenCitylabel}}</span>
            <span v-else :title="item.label" class="item_label">{{ item.label }}</span>
            <span class="remove_btn"
                  @click="handleRemove(item)">
            <Icon type="md-close" />
          </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mutiCascaderContent from './muti-cascader-content'
import { Icon } from 'view-design'

export default {
  name: 'retarget-muti-cascader-city',
  components: {
    mutiCascaderContent,
    Icon
  },
  props: {
    // 最底层才可以勾选
    onlyBottom: {
      type: Boolean,
      default: false
    },
    // 栏目 title
    title: {
      type: String,
      default: '省份'
    },
    // 栏目 title
    titleLoading: {
      type: String,
      default: '加载完成'
    },
    warnWidth: {
      type: String,
      default: '省份'
    },
    // 数据数组 [{value,label,children:[{value,label,children:[]}]}] 嵌套
    datas: {
      type: Array,
      default: () => []
    },
    // 默认选中 - 对象 value
    value: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      mutiDatas: [],
      selectDatas: []
    }
  },
  filters: {
    /**
     * [filterAdRatio 列表中尺寸格式化]
     * @param  {[type]} row [description]
     * @return {[type]}     [description]
     */
    selectText(item) {
      let select = [ //  选择广告场景
        {
          id: 3,
          title: '开屏广告',
          num: 0
        },
        {
          id: 1,
          title: '原生信息流广告',
          num: 0
        },
        {
          id: 2,
          title: 'Banner广告',
          num: 0
        },
        {
          id: 4,
          title: '插屏广告',
          num: 0
        },
        {
          id: 5,
          title: '激励视频广告',
          num: 0
        },
        {
          id: 6,
          title: '长视频广告',
          num: 0
        },
        {
          id: 8,
          title: '交互广告',
          num: 0
        }
      ]
      item.map(it => {
        if (it.ad_type_id) {
          select.map(its => {
            if (its.id === it.ad_type_id) {
              its.num = its.num + 1
            }
          })
        }
      })
     let text = ''
      select.map(its => {
        if (its.num > 0) {
          text += its.title + '类' + its.num + '个，'
        }
      })
      text = text.substring(0, text.length - 1)
      return text
    },
    citylength(val) {
       let length = 0
      val.map(its => {
        if (its.type === 'app') {
          length = length + Number(its.children.length)
        } else {
          length = length + 1
        }

      })
      return length
    }
  },
  methods: {
    // 递归遍历 children & 赋值对应 checked
    datasRecursive (list, checked) {
      return list.map(item => {
        item.check = checked
        if (item.children && item.children.length) {
          item.children = this.datasRecursive(item.children, checked)
        }
        return item
      })
    },
    update () {
      let reciveDataArr = this.selectDatas.map(item => item.value)
      this.$emit('input', reciveDataArr)
      let hasNameData = this.selectDatas.map(item => {
        return {value: item.value,
          label: item.label,
          type: item.type ? item.type : '',
          brand: item.brand ? item.brand : '',
          children: item.children ? item.children : ''}
      })
      this.$emit('name', hasNameData)
    },
    reciveDatas (data) {
      this.selectDatas = []
      this.handleReciveCycle(data)
      this.update()
    },
    handleReciveCycle (datas) {
      datas.map(item => {
          if (item.check && item.type !== 'app') {
            let arr = []
            this.selectDatas.map(it => {
               arr.push(it.value)
            })
            if (arr.indexOf(item.value) === -1) {
              this.selectDatas.push(item)
            }
          } else {
            if (item.children && item.children.length) {
              this.handleReciveCycle(item.children)
            }
          }
        return item
      })
    },
    checkArrayLittle (datas) {
      for (let i = 0; i < datas.length; i++) {
        if (datas[i].check) {
          return true
        }
      }
      return false
    },
    checkArrayAll (datas) {
      for (let i = 0; i < datas.length; i++) {
        if (!datas[i].check) {
          return false
        }
      }
      return true
    },
    handleRemove (item) {
      this.selectDatas = this.selectDatas.filter(_item => {
        return _item.value !== item.value
      })
      this.update()
      this.handleRemoveCycle(this.mutiDatas, item.value)
    },
    handleRemoveCycle (datas, v) {
      return datas.map(item => {
        if (v === item.value) {
          item.check = false
          item.little = false
          if (item.children && item.children.length) {
            item.children = item.children.map(_item => {
              _item.check = false
              _item.little = false
              return _item
            })
          }
        } else {
          if (item.children && item.children.length) {
            item.children = this.handleRemoveCycle(item.children, v)
            if (this.checkArrayAll(item.children)) {
              item.check = true
              item.little = false
            } else if (this.checkArrayLittle(item.children)) {
              item.check = false
              item.little = true
            } else {
              item.check = false
              item.little = false
            }
          }
        }
        return item
      })
    },
    setDefaultDatas (datas) {
      this.selectDatas = []
      // let hookDatas = this.datasRecursive(this.datas, false);
      this.mutiDatas = this.datas
      this.handleDefaultCycle(this.mutiDatas, datas)
    },
    updateDefaultDatas (datas) {
      this.mutiDatas = this.datas
    },
    handleDefaultCycle (mutiDatas, datas) {
      return mutiDatas.map(item => {
        if (datas.includes(item.value)) {
          item.check = true
          item.little = false
          if (item.children && item.children.length) {
            item.children = item.children.map(_item => {
              _item.check = true
              _item.little = false
              return _item
            })
          }
          let arr = []
          this.selectDatas.map(it => {
            arr.push(it.value)
          })
          if (arr.indexOf(item.value) === -1) {
            this.selectDatas.push(item)
          }
        } else {
          if (item.children && item.children.length) {
            item.children = this.handleDefaultCycle(item.children, datas)
            if (this.checkArrayAll(item.children)) {
              item.check = true
              item.little = false
            } else if (this.checkArrayLittle(item.children)) {
              item.check = false
              item.little = true
            } else {
              item.check = false
              item.little = false
            }
          }
        }
        return item
      })
    },
    onSearch (e) {
      this.$emit('onSearch', e)
    },
    // 取消全选
    clearAll () {
      // 调用子组件的清空实现
      this.$refs.muti.handleCheckAll(false)
    }
  },
  computed: {
    mutiTitle () {
      return this.title
    },
    loadTitle() {
      return this.titleLoading
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler: function (v) {
        if (v) {
          this.setDefaultDatas(v)
        }
      }
    },
    datas: {
      deep: true,
      immediate: true,
      handler: function (v) {
        if (v) {
          this.updateDefaultDatas(v)
        }
      }
    }
  },
  created () {
    this.mutiDatas = this.datas
  },
  mounted () { }
}
</script>

<style lang="less" scoped>
li {
  list-style: none;
  font-size: 14px;
}
.cascader_wrapper {
  display: flex;
  flex-wrap: wrap;
  .cascader_content {
    border: 1px solid #dadfe3;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .warnWrapper{
    width: 1000px !important;
    margin-left: 0px !important;
    .item_label{
      max-width: 920px !important;
    }
  }
  .companyWrapper{
    width: 500px !important;
    .item_label{
      max-width: 420px !important;
    }
  }
  .select_wrapper {
    border: 1px solid #dadfe3;
    font-size: 14px;
    width: 345px;
    border-radius: 4px;
    margin-left: 10px;
    margin-bottom: 10px;
    .header {
      display: flex;
      justify-content: space-between;
      padding: 0px 10px;
      margin-bottom: 0.5rem;
      background: #FAFAFA;
      border-bottom: 1px solid #EBEBEB;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .content {
      padding-left: 0.5rem;
      height: 250px;
      width: 100%;
      overflow-y: auto;
      .item_wrapper {
        position: relative;
        background: #F5F5F5;
        margin: 8px 12px 0;
        padding: 0 6px;
        &:hover{
          background: #F2F4FF;
          color: #465CFE
        }
        .item_label {
          margin-right: 10px;
          height: 28px;
          line-height: 28px;
          display: inline-block;
          max-width: 280px;
          vertical-align: middle;
          white-space:nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .remove_btn {
          position: absolute;
          right: 8px;
          top: 7px;
          line-height: 0;
          cursor: pointer;
        }
      }
    }
    .content-none {
      color: #c1c1c1;
      height: ceil(100%-20px);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 40px;
      .icon{
        color: #EBEBEB;
        font-size: 90px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>

<!--<style>-->
<!--.cursor_pointer {-->
<!--  cursor: pointer;-->
<!--}-->
<!--::-webkit-scrollbar {-->
<!--  -webkit-appearance: none;-->
<!--  width: 7px;-->
<!--}-->
<!--::-webkit-scrollbar-thumb {-->
<!--  border-radius: 4px;-->
<!--  background-color: rgba(0, 0, 0, 0.5);-->
<!--  /* -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5); */-->
<!--}-->
<!--</style>-->

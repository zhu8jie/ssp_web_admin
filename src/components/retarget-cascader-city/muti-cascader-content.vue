<template>
  <div class="wrapper_box"
       :class="_uid">
    <div class="wrapper">
      <div class="header">{{ title }}</div>
      <Input style="width: 120px;margin-left: 10px" class="search" type="text" v-model="search_text" placeholder="请搜索" />
      <ul class="content">
        <li class="title">
          <template v-if="!onlyBottom">
            <span class="check_box">
              <Checkbox :value="isCheckAll"
                        @on-change="handleCheckAll">{{" "}}</Checkbox>
            </span>
            <span>全选</span>
          </template>
        </li>
        <li class="item_wrapper"
            v-for="(item,index) in entites"
            :key="item.id">
          <span class="check_box">
            <template v-if="onlyBottom">
              <Checkbox v-if="!item.children"
                        v-model="item.check"
                        @on-change="handleSelect($event,item,index)"
                        :indeterminate="item.little" />
            </template>
            <template v-else>
              <Checkbox v-model="item.check"
                        @on-change="handleSelect($event,item,index)"
                        :indeterminate="item.little" />
            </template>
            <span class="check_label cursor_pointer"
                  @click="handleChildrenDatas(item,index,item.check)">{{ item.label }}</span>
          </span>
          <span class="icon">
            <Icon v-show="item.children"
                  type="ios-arrow-forward" />
          </span>
        </li>
      </ul>
    </div>
    <multiCascader ref="children"
                   v-if="childrenDatas.length"
                   :title="childrenTitle"
                   :datas="childrenDatas"
                   :parentId="hookParentId"
                   :onlyBottom="onlyBottom"
                   @update="childUpdate"
                   @onSearch="onSearch" />
  </div>
</template>

<script>
import { Checkbox, Icon } from 'view-design'

export default {
  name: 'multiCascader',
  components: {
    Checkbox,
    Icon
  },
  props: {
    onlyBottom: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '兴趣定向'
    },
    datas: {
      type: Array,
      default: () => []
    },
    parentId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
      hookParentId: this.parentId,
      entitesList: [],
      childrenDatas: [],
      selectedDatas: [],
      selectedIndex: -1,
      childrenCheck: false,
      search_text: null,
    }
  },
  computed: {
    isCheckAll () {
      return this.checkArrayAll(this.entites)
    },
    entites() {
      if (this.search_text) {
        return this.entitesList.filter((value) => {
          return value.label.includes(this.search_text)
        })
      } else {
        return this.entitesList
      }
    }
  },
  methods: {
    checkArrayAll (datas) {
      for (let i = 0; i < datas.length; i++) {
        if (!datas[i].check) {
          return false
        }
      }
      return true
    },
    checkArrayLittle (datas) {
      for (let i = 0; i < datas.length; i++) {
        let { little, check } = datas[i]
        if (little || check) {
          return true
        }
      }
      return false
    },
    handleCheckAll (checked) {
      this.entites = this.entites.map(item => {
        item.check = checked
        item.little = false
        if (item.children && item.children.length) {
          this.childrenCheck = checked
          item.children = this.hookMapSelect(item.children, checked)
        }
        return item
      })
      this.updateToParent()
    },
    handleChildrenDatas (item, index, checked) {
      this.selectedIndex = index
      let { value } = item
      this.hookParentId = `${this.parentId}-${value}`
      this.$emit('onSearch', value)
      // 点击父辈同级,如果没有子集则收缩
      if (this.$refs.children) {
        this.$refs.children.childrenDatas = []
        this.childrenDatas = []
      }

      if (item.children && item.children.length) {
        this.childrenDatas = item.children
        this.childrenTitle = item.label
      }
    },
    handleSelect (checked, item, index) {
      if (checked) item.little = false
      this.selectedIndex = index
      if (item.children && item.children.length) {
        item.children = this.hookMapSelect(item.children, checked)
        this.childrenDatas = item.children
        this.childrenTitle = item.label
      }
      this.updateToParent()
    },
    // 递归遍历 children & 赋值对应 checked
    hookMapSelect (list, checked) {
      return list.map(item => {
        item.check = checked
        if (item.children && item.children.length) {
          item.children = this.hookMapSelect(item.children, checked)
        }
        return item
      })
    },
    childUpdate (childDatas) {
      this.entites[this.selectedIndex].children = Object.assign([], childDatas)
      this.entites[this.selectedIndex].check = this.checkArrayAll(childDatas)
      if (this.entites[this.selectedIndex].check) {
        this.entites[this.selectedIndex].little = false
      } else {
        this.entites[this.selectedIndex].little = this.checkArrayLittle(
          childDatas
        )
      }
      this.updateToParent()
    },
    updateToParent () {
      this.$emit('update', this.entites)
    },
    onSearch (e) {
      this.$emit('onSearch', e)
    }
  },
  watch: {
    datas: {
      deep: true,
      immediate: true,
      handler: function (v) {
        if (v && v.length) {
          this.entitesList = Object.assign([], v)
        }
      }
    }
  },
  created () { },
  mounted () { }
}
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
.wrapper_box {
  overflow: hidden;
  .wrapper {
    float: left;
    border-right: 1px solid #dadfe3;
    font-size: 14px;
    width: 160px;
    .header {
      text-align: center;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid #dee4f5;
      background-color: #fafbfe;
      padding: 8px 12px;
    }
    .content {
      padding: 8px 12px;
      width: 100%;
      height: 200px;
      overflow-y: auto;
      .item_wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}
</style>

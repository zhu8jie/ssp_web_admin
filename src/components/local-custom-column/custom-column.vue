<template>
  <Drawer v-model="drawerModalFlag" :scrollable="false" title="自定义列" width="600px" :mask-closable="false"
          :closable="false" :styles="drawStyles">
    <div class="column_content">
      <div class="col_detail">
        <div class="media_table">
          <Row>
            <Col :span="17">
              <div class="col_title">可选择列</div>
              <div class="optional_detail">
                <div class="checkout_content">
                  <div class="check_title">
                    <Checkbox :value="isCheckAll" @click.prevent.native="handleCheckAll">全选</Checkbox>
                  </div>
                  <CheckboxGroup v-model="hasCheckArr" @on-change="checkChange">
                    <Checkbox class="option_check" v-for="item in checkArr" :key="item.__id" :label="item.title">
                      {{item.title}}
                    </Checkbox>
                  </CheckboxGroup>
                </div>
              </div>
            </Col>
            <Col :span="7">
              <div class="col_title">已选择列</div>
              <div class="select_con">
                <Tag v-for="(item, index) in hasCheckArr" :key="`${item}_${index}`" :name="item" closable
                     @on-close="tagClose">{{item}}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
    <div class="drawer-footer">
      <Button @click="drawerModalFlag = false">取消</Button>
      <Button type="primary" @click="submitData">保存</Button>
    </div>
  </Drawer>
</template>

<script>
  import {localSave, localRead} from '@/libs/util'

  export default {
    props: {
      datalist: Array // 勾选的列表
    },
    data() {
      return {
        drawerModalFlag: false, // 抽屉开关
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          padding: '25px 25px 54px 0',
          position: 'static'
        },
        hasCheckArr: [], // 已选择列
        isCheckAll: false // 是否全选
      }
    },
    computed: {
      /**
       * [checkArr 全部的勾选列表]
       * @return {[type]} [description]
       */
      checkArr() {
        return this.datalist.filter(item => {
          return !item.isHideInColumn
        })
      }
    },
    methods: {
      /**
       * [toggleDrawer 父级调用子集]
       * @return {[type]} [description]
       */
      toggleDrawer() {
        this.drawerModalFlag = !this.drawerModalFlag

        // 打开时判断选择情况 回显
        if (this.drawerModalFlag) {
          let _local = localRead(this.$route.name.toUpperCase())

          let _arr = []

          if (_local) {
            if (_local !== 'null') {
              _arr = _local.split(',')
            }
          } else {
            this.checkArr.map(_ => {
              _arr.push(_.title)
            })
          }

          this.hasCheckArr = _arr
          this.checkChange() // 判断是否全选
        }
      },
      /**
       * [submitData 数据确定]
       * @return {[type]} [description]
       */
      submitData() {
        this.toggleDrawer()

        localSave(this.$route.name.toUpperCase(), this.hasCheckArr.length ? this.hasCheckArr.toString() : null)

        this.$emit('on-change')
      },
      /**
       * [tagClose 已选择列 删除]
       * @param  {[type]} event [description]
       * @param  {[type]} name  [description]
       * @return {[type]}       [description]
       */
      tagClose(event, name) {
        let index = this.hasCheckArr.indexOf(name)
        if (index > -1) {
          this.hasCheckArr.splice(index, 1)
        }
      },
      /**
       * [checkChange 列 单选  从而判断是否全选]
       * @param  {[type]} arr [description]
       * @return {[type]}      [description]
       */
      checkChange() {
        this.isCheckAll = this.hasCheckArr.length === this.checkArr.length
      },
      /**
       * [handleCheckAll 全选]
       * @return {[type]} [description]
       */
      handleCheckAll() {
        this.isCheckAll = !this.isCheckAll

        let _arr = []
        if (this.isCheckAll) {
          this.checkArr.map(_ => {
            _arr.push(_.title)
          })
        }

        this.hasCheckArr = _arr
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  /deep/ .ivu-drawer-header {
    padding 14px 25px
  }

  .column_content {
    .col_title {
      font-weight bold
    }

    /deep/ .ivu-checkbox-inner {
      width 14px
      height 14px
    }

    /deep/ .ivu-checkbox-checked .ivu-checkbox-inner:after {
      top: 1px
      left: 4px
    }

    .col_detail {
      margin-top 0px

      .option_check {
        width 33%
        font-size 12px
        margin-right 0px

        &:hover {
          color #4083F8

          /deep/ .ivu-checkbox-inner {
            border-color #4083F8
          }
        }
      }

      .select_con {
        max-height 500px
        overflow: auto
        margin-top 10px

        /deep/ .ivu-tag {
          width: 150px
          display: flex
          justify-content: space-between
          height: 22px
          line-height: 22px
          background: #EBEBEB;
          border: 0px
          color: #333333
          margin-top: 6px

          .ivu-icon-ios-close {
            top: 6px
          }

          /deep/ &:hover {
            background: #E4EEFF;
            color #4083F8

            .ivu-tag-text {
              color #4083F8
            }
          }

        }
      }
    }
  }

  .drawer-footer {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    border 0px
  }
</style>

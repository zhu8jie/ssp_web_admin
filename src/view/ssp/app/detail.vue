<template>
    <Card :bordered="false" dis-hover class="page-main">
      <div class="page-title clearfix">
        <h2>{{headTitle}}</h2>
        <div class="is-handler">
           <Button style="padding: 0 40px; color: #3F83F7" type="text" @click="getBack">返回 ></Button>
        </div>
      </div>
        <div class="edit-content-card appDetail">
            <Form label-position="left" :label-width="250" >
              <FormItem class="appForm" label="应用平台">
                <p class="text">{{ appDataList.os_type_text || '无'}} </p>
              </FormItem>
              <FormItem class="appForm" label="应用商店">
                <p class="text">{{ appDataList.app_store_name || '无' }}</p>
              </FormItem>

              <FormItem class="appForm" label="应用商店详情页">
                <div class="text_url" v-if="appDataList.store_detail_url">
                  <a :href="appDataList['store_detail_url']">{{appDataList['store_detail_url']}}</a>
                  <Button class="tag-read" type="text" :data-clipboard-text="appDataList['store_detail_url']" @click="copy">复制</Button>
                </div>
                <p class="text" v-else>无</p>
              </FormItem>
              <FormItem class="appForm classifyForm" label="应用商店应用下载地址">
                <div class="text_url" v-if="appDataList.store_download_url">
                  <a :href="appDataList['store_download_url']">{{appDataList['store_download_url']}}</a>
                  <Button class="tag-read" type="text" :data-clipboard-text="appDataList['store_download_url']" @click="copy">复制</Button>
                </div>
                <p class="text" v-else>无</p>
              </FormItem>
              <FormItem class="appForm" label="应用名称">
                <p class="text">{{ appDataList.app_name || '无' }}</p>
              </FormItem>
              <FormItem class="appForm" label="应用类型">
                <p class="text"> {{ appDataList.app_type || '无' }}</p>
              </FormItem>
              <FormItem class="appForm" label="应用关键字">
                <p class="text"> {{ appDataList.keyword || '无' }} </p>
              </FormItem>
              <FormItem class="appForm classifyForm" label="应用简介">
                <p class="text"> {{ appDataList.desc || '无' }} </p>
              </FormItem>
              <FormItem class="appForm" label="应用包名">
                <p class="text"> {{ appDataList.package_name || '无' }} </p>
              </FormItem>
              <FormItem class="appForm" label="接入方式">
                <p class="text"> {{ appDataList.access_type_text || '无' }} </p>
              </FormItem>
              <FormItem class="appForm classifyForm" label="接入第三方SDK">
                <p class="text"> {{ appDataList.app_platform_name || '无' }} </p>
              </FormItem>
              <FormItem class="appForm" label="应用Icon" style="margin-bottom: 20px">
                <div class="account_img" style="width: 60px;height: 60px;line-height: 60px" @mouseenter="enter(1)" @mouseleave="leave" v-if="appDataList.icon">
                  <img class="imgs" :src="appDataList['icon']" alt="">
                  <div style="width: 60px;height: 60px;line-height: 60px"  v-show="seen && 1===current" class="account_shade" @click="showImg(appDataList['icon'])">
                    <img src="~@/assets/image/open.png" alt="">
                  </div>
                </div>
                <p class="text" v-else>无</p>
              </FormItem>
              <FormItem class="appForm"  label="计算机软件著作权登记证书" style="margin-bottom: 20px">
                <div class="account_img" style="width: 128px;height: 180px;line-height: 180px" @mouseenter="enter(2)" @mouseleave="leave" v-if="appDataList.copyright_img">
                  <img class="imgs" :src="appDataList['copyright_img']" alt="">
                  <div style="width: 128px;height: 180px;line-height: 180px" v-show="seen && 2===current" class="account_shade" @click="showImg(appDataList['copyright_img'])">
                    <img src="~@/assets/image/open.png" alt="">
                  </div>
                </div>
                <p class="text" v-else>无</p>
              </FormItem>
              <FormItem class="appForm classifyForm" label="公司关联关系及媒体授权证明">
                <div class="account_img" style="width: 128px;height: 180px;line-height: 180px" @mouseenter="enter(3)" @mouseleave="leave" v-if="appDataList.authorization_img">
                  <img class="imgs" :src="appDataList['authorization_img']" alt="">
                  <div style="width: 128px;height: 180px;line-height: 180px" v-show="seen && 3===current" class="account_shade" @click="showImg(appDataList['authorization_img'])">
                    <img src="~@/assets/image/open.png" alt="">
                  </div>
                </div>
                <p class="text" v-else>无</p>
              </FormItem>
              <FormItem class="appForm" label="带有广告展示的应用商店及下载地址" style="margin-bottom: 5px">
                 <div class="text_url" v-if="appDataList.app_check_store.length > 0" v-for="(item,index) in appDataList['app_check_store'] " :key="'text'+index">
                   <span style="margin-right: 20px">{{item.app_store_name}}</span>  <a :href="item.store_download_url">{{item.store_download_url}}</a>
                   <Button class="tag-read" type="text" :data-clipboard-text="item.store_download_url" @click="copy">复制</Button>
                 </div>
                  <p class="text" v-if="appDataList.app_check_store.length == 0">无</p>
              </FormItem>

              <FormItem class="appForm userForm" label='应用受众用户特征信息'>
                <Row>
                  <Col span="12">
                     <p class="feature_col">
                       <span class="feature_title">日活跃用户数量（DAU）</span>
                       <span class="feature_con">{{appDataList['app_dau'] }}(万人)</span>
                     </p>
                  </Col>
                  <Col span="12">
                    <p class="feature_col" style="border-left: 0px" t>
                      <span class="feature_title">应用用户特征</span>
                      <span class="feature_con" :title="appDataList.user_character">{{appDataList['user_character'] }}</span>
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col span="12">
                    <p class="feature_col">
                      <span class="feature_title">男女用户占比</span>
                      <span class="feature_con">{{appDataList['app_male_rate'] }}:{{appDataList['app_female_rate'] }}</span>
                    </p>
                  </Col>
                  <Col span="12">
                    <p class="feature_col" style="border-left: 0px">
                      <span class="feature_title">适合预算类型</span>
                      <span class="feature_con" :title="appDataList.fit_budget_type">{{appDataList['fit_budget_type'] }}</span>
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col span="12">
                    <p class="feature_col">
                      <span class="feature_title">用户年龄层</span>
                      <span class="feature_con">{{appDataList['user_age_group'] }}岁</span>
                    </p>
                  </Col>
                  <Col span="12">
                    <p class="feature_col" style="border-left: 0px">
                      <span class="feature_title">不可投放类型</span>
                      <span class="feature_con" :title="appDataList.no_put_type">{{appDataList['no_put_type'] }}</span>
                    </p>
                  </Col>
                </Row>
              </FormItem>
            </Form>

        </div>
      <Modal v-model="meterialModal" :footer-hide="true"
             class="native-model"
             width="500">
        <div class="img_content">
          <img :src="meterialUrl" alt/>
        </div>
      </Modal>
    </Card>
</template>

<script>
  import {showTitle, dataType} from '@/libs/util'
  import Clipboard from 'clipboard'
  import {getAppInfo} from '@/api/ssp'
  import { inPageAccess } from '@/mixin/in-page-access.js'
  export default {
    name: 'app-detail',
    mixins: [inPageAccess],
    data() {
      return {
        current: '',
        appDataList: {
          os_type_text: '',
          app_store_id: '',
          store_detail_url: '',
          store_download_url: '',
          app_name: '',
          app_type: '',
          keyword: '',
          desc: '',
          package_name: '',
          access_type_text: '',
          app_platform_name: '',
          icon: '',
          app_check_store: [],
          app_dau: '',
          app_male_rate: '',
          app_female_rate: '',
          user_age_group: '',
          user_character: '',
          fit_budget_type: '',
          no_put_type: '',
          status_text: ''
        },
        seen: false,
        meterialModal: false,
        meterialUrl: '',
        type: '',
        app_id: undefined
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      }
    },
    methods: {
      // 点击返回按钮
      getBack() {
        this.$router.push({ name: 'application-manage'})
      },
      // 获取详情页面的数据
      getDetailDate() {
        let app_id = parseInt(this.app_id)
        getAppInfo({
           app_id
        }).then(data => {
          let date = data
          if (date.code === 200) {
            this.appDataList = date.data
          }
        })
      },
      // 复制的引入
      copy() {
        let clipboard = new Clipboard('.tag-read')
        clipboard.on('success', e => {
          this.$Message.success('复制成功')
          // 释放内存
          clipboard.destroy()
        })
        clipboard.on('error', e => {
          // 不支持复制
          this.$Message.success('该浏览器不支持自动复制')
          // 释放内存
          clipboard.destroy()
        })
      },
      enter(index) {
        this.seen = true
        this.current = index
      },
      leave() {
        this.seen = false
      },
      showImg(data) {
        this.meterialModal = true
        this.meterialUrl = data
      }
    },
    created() {
      // 判断是否有修改权限
      let resultArr = this._isPageShow()
      console.log(resultArr)
      if (this._isSuperAdmin() || !!resultArr.includes('view')) {
        this.app_id = this.$route.query && this.$route.query.app_id
        this.getDetailDate()
      } else {
        this._gotoNoAccess()
      }
    }
  }
</script>
<style lang="stylus">
  .native-model{
      .img_content {
        margin 0 auto
        text-align center
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-direction: column;
        img {
          text-align center
          max-height 100%
          max-width 100%
          vertical-align middle
        }
      }
    .ivu-modal-footer{
      border 0px
      padding 0px
    }
  }
</style>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .page-title
    margin-top 15px
    padding-left 30px
  .appDetail {
    padding 0 30px 10px
    /deep/ .appForm {
      color #42444C
      font-size 14px
      margin-bottom 0px
     &.classifyForm{
       margin-bottom 20px
     }
      &.userForm{
        .ivu-form-item-label{
          padding 0px
          line-height 32px
        }
      }
      .ivu-form-item-label{
        padding 0px
        line-height 32px
      }
      .tag-read{
        color #3F83F7
      }
      .feature_col{
         width 100%
         display flex
         border: 1px solid #EFEFEF;
         margin-top -1px
         span{
           display inline-block
           width 50%
           height 35px
           line-height 35px
           text-align center
           padding 0 10px
           &.feature_title{
             background: #F3F5F7;
             border-right: 1px solid #EFEFEF;
           }
           &.feature_con{
             background: #FBFBFB;
             overflow: hidden;
             white-space: nowrap;
             text-overflow: ellipsis;
           }
         }
      }
    }

    .feature_form {
      margin-bottom 10px
      color #42444C
      font-size 14px
      font-weight bold

      .text {
        color #42444C
        font-size 14px
        font-weight normal
      }
    }

    .subtitle {
      padding 15px 0px
    }
    .account_img {
      width 150px
      height 150px
      line-height 100px
      display inline-block
      margin-right 20px
      text-align center
      background #eff1f5

      .imgs {
        max-height 100%
        max-width 100%
        vertical-align middle
      }

      .account_shade {
        width 150px
        height 150px
        line-height 150px
        position absolute
        top 0px
        background #000000
        opacity 0.5
        text-align center

        img {
          vertical-align middle
          width 30px
        }
      }
    }

  }

</style>

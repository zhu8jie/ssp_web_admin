<template>
  <Card :bordered="false" dis-hover class="page-main">
    <div class="page-title clearfix">
      <h2>{{headTitle}}</h2>
      <div class="is-handler">
        <Button style="padding: 0 40px;color: #3F83F7" type="text" @click="getBack">返回 ></Button>
      </div>
    </div>
    <div class="edit-content-card">
        <div class="media_detail appDetail">
          <p class="app_title">账户信息</p>
          <Form label-position="left" :label-width="192" >
            <FormItem class="appForm" label="账户名称">
              <p class="text">{{ ruleForm.dev_account || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="公司主体名称">
              <p class="text">{{ ruleForm.company_name || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="公司对外简称">
              <p class="text">{{ ruleForm.company_short_name || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="统一社会信用代码">
              <p class="text">{{ ruleForm.credit_code || '无'}} </p>
            </FormItem>
            <FormItem class="appForm"  label="营业执照照片" style="margin-bottom: 20px">
              <div class="account_img" style="width: 200px;height: 200px;line-height: 200px" @mouseenter="enter(1)" @mouseleave="leave" v-if="ruleForm.business_license">
                <img class="imgs" :src="ruleForm.business_license" alt="">
                <div style="width: 200px;height: 200px;line-height: 200px" v-show="seen && 1===current" class="account_shade" @click="showImg(ruleForm.business_license)">
                  <img src="~@/assets/image/open.png" alt="">
                </div>
              </div>
              <p class="text" v-else>无</p>
            </FormItem>
            <FormItem class="appForm" label="公司法人姓名">
              <p class="text">{{ ruleForm.legal_person_name || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="公司法人身份证号">
              <p class="text">{{ ruleForm.legal_person_code || '无'}} </p>
            </FormItem>
            <FormItem class="appForm"  label="公司法人身份证正反面照片" style="margin-bottom: 20px">
              <div v-if="ruleForm.legal_person_card_p || ruleForm.legal_person_card_b" class="">
                <div v-if="ruleForm.legal_person_card_p" class="account_img" style="width: 215px;height: 150px;line-height: 150px" @mouseenter="enter(2)"
                     @mouseleave="leave">
                  <img class="imgs" :src="ruleForm.legal_person_card_p" alt="">
                  <div style="width: 215px;height: 150px;line-height: 150px" v-show="seen && 2===current"
                       class="account_shade" @click="showImg(ruleForm.legal_person_card_p)">
                    <img src="~@/assets/image/open.png" alt="">
                  </div>
                </div>
                <div v-if="ruleForm.legal_person_card_b" class="account_img" style="width: 215px;height: 150px;line-height: 150px" @mouseenter="enter(3)"
                     @mouseleave="leave">
                  <img class="imgs" :src="ruleForm.legal_person_card_b" alt="">
                  <div style="width: 215px;height: 150px;line-height: 150px" v-show="seen && 3===current"
                       class="account_shade" @click="showImg(ruleForm.legal_person_card_b)">
                    <img src="~@/assets/image/open.png" alt="">
                  </div>
                </div>
              </div>
              <p class="text" v-else>无</p>
            </FormItem>
            <FormItem class="appForm" label="产品名单">
              <p class="text">{{ ruleForm.product_list || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="联系地址">
              <p class="text">
                <span v-for="(value,index) in provinceList" :key="'provinceList'+index" v-if="value.id === ruleForm.province_id">{{ value.name }}</span>
                <span v-for="(value,index) in cityList1" :key="'cityList1'+index"  v-if="value.id === ruleForm.city_id">{{ value.name }}</span>
                <span>{{ruleForm.address}}</span>
              </p>
            </FormItem>
            <FormItem class="appForm" label="联系人姓名">
              <p class="text">{{ ruleForm.dev_name || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="联系人电子邮箱">
              <p class="text">{{ ruleForm.dev_email || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="联系人手机号码">
              <p class="text">{{ ruleForm.dev_phone || '无'}} </p>
            </FormItem>
			  <FormItem class="appForm" label="合作主体">
				  <p class="text" v-if="ruleForm.cooperation_company">{{ ruleForm.cooperation_company === 1 ? '聚量' : '鼎广'}} </p>
				  <p v-else>-</p>
			  </FormItem>
			  <FormItem label="合同有效期" class="appForm">
				  <p v-if="ruleForm.cooperation_since && ruleForm.cooperation_until">{{ruleForm.cooperation_since}} ~ {{ruleForm.cooperation_until}}</p>
				  <p v-else>-</p>
			  </FormItem>
            <p class="app_title">财务信息</p>
            <FormItem class="appForm" label="收款方">
              <p class="text">{{ ruleForm.company_name || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="开户行">
              <p class="text">{{ financeDate.bank_name || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="开户行所在地">
              <p class="text">
                <span v-for="(value,index) in provinceList" :key="'bankProvince'+index" v-if="value.id === financeDate.bank_province_id">{{ value.name }}</span>
                <span v-for="(value,index) in cityList2" :key="'bankCity'+index"  v-if="value.id === financeDate.bank_city_id">{{ value.name }}</span>
              </p>
            </FormItem>
            <FormItem class="appForm" label="支行名称">
              <p class="text">{{ financeDate.bank_address || '无'}} </p>
            </FormItem>
            <FormItem class="appForm" label="银行账号">
              <p class="text">{{ financeDate.bank_id_card || '无'}} </p>
            </FormItem>
			  <FormItem class="appForm" label="发票类型">
				  <p v-if="ruleForm.invoice_type">{{ruleForm.invoice_type === 1 ? '增值税普通发票' :ruleForm.invoice_type === 2 ? '增值税专用发票（3%）' : '增值税专用发票（6%）' }}</p>
				  <p v-else>-</p>
			  </FormItem>
			  <FormItem class="appForm" label="发票项目">
				  <p v-if="ruleForm.invoice_project">{{ruleForm.invoice_project === 1 ? '广告发布费' : '非广告发布费的其他项目'}}</p>
				  <p v-else>-</p>
			  </FormItem>
			  <FormItem class="appForm" label="补扣额外税税率">
				  <p v-if="ruleForm.other_tax_rate && ruleForm.is_cut_other_tax===1">{{getNumberFloat(ruleForm.other_tax_rate)}}%</p>
				  <p v-else-if="ruleForm.is_cut_other_tax===2">0%</p>
				  <p v-else>-</p>
			  </FormItem>
			  <FormItem class="appForm" label="结算周期">
				  <p v-if="ruleForm.settlement_period">{{ruleForm.settlement_period === 1 ? '预付' : ruleForm.settlement_period === 2 ? '次月月底'  : ruleForm.settlement_period === 3 ? '次次25日前' : '次次月底'}}</p>
				  <p v-else>-</p>
			  </FormItem>
          </Form>
        </div>
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
  import {showTitle} from '@/libs/util'
  import { getProvinceApi, getCityApi, getBankTypeApi } from '@/api/common'
  import { getFinanceInfoApi, getDevUserInfoApi } from '@/api/ssp'
  import { inPageAccess } from '@/mixin/in-page-access.js'

  export default {
    name: 'media-view',
    mixins: [inPageAccess],
    data() {
      return {
        current: '',
        seen: false,
        meterialModal: false,
        meterialUrl: '',
        uploadImgModel: false,
        card_loading1: false,
        card_loading2: false,
        uploadImgUrl: '',
        source_id: [],
        batchUrl: '',
        cardA: [],
        cardB: [],
        provinceList: [],
        cityList1: [],
        cityList2: [],
        BankTypeList: [],
        bankNameList: [],
        img_loading: false,
        active: 1,
        ud_id: '',
        ruleForm: {
          dev_account: '', // 账号名称
          // password: '', // 密码
          company_name: '', // 公司主体名称 收款方
          company_short_name: '', // 公司对外简称
          credit_code: '', // 统一社会信用代码
          business_license: '', // 营业执照照片地址
          legal_person_name: '', // 公司法人姓名
          legal_person_code: '', // 公司法人身份证号
          legal_person_card_p: '', // 公司法人身份证正面照片
          legal_person_card_b: '', // 公司法人身份证反面照片
          product_list: '', // 产品名单
          province_id: '', // 省份ID
          city_id: '', // 城市ID
          address: '', // 联系地址
          dev_name: '', // 联系人姓名
          dev_email: '', // 联系人邮箱
          dev_phone: ''// 联系人手机号码
        },
        financeDate: {
          // bank_type_id: '', // 开户行类型
          bank_province_id: '', // 开户行省份
          bank_city_id: '', // 开户行城市
          bank_name: '', // 开户行名称
          bank_address: '', // 支行名称
          bank_id_card: '' // 银行账号
        },
        accountDate: []
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
        this.$router.push({ name: 'media-manage' })
      },
      // 获取该用户的信息渲染
      getUserData() {
        let ud_id = parseInt(this.ud_id)
        getDevUserInfoApi({
          ud_id
        }).then(data => {
          let date = data
          if (date.code === 200) {
            this.ruleForm = date.data
            if (date.data.province_id) {
               this.getCityData(date.data.province_id, 1)
            }
          }
        })
      },
		// 转换成千分位，保留两位小数
		getNumberFloat(num) {
			if (!num || num === Infinity || num === -Infinity) {
				return 0
			} else {
				if (Number.isInteger(num)) {
					return parseInt(num).toLocaleString() // 数字
				} else {
					return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
				}
			}
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
      },
     // 获取该用户的财务信息
      getbankDate() {
        let ud_id = parseInt(this.ud_id)
        getFinanceInfoApi({
          ud_id
        }).then(data => {
          let date = data
          if (date.code === 200) {
            this.financeDate = date.data
            if (date.data.bank_province_id) {
              this.getCityData(date.data.bank_province_id, 2)
            }
          }
        })
      },

      // 获取省份
      getProvinceData() {
        getProvinceApi().then(data => {
          let date = data
          if (date.code === 200) {
            this.provinceList = date.data.list
          }
        })
      },
      // 获取获取银行类型数据
      getBankTypeData() {
        getBankTypeApi().then(data => {
          let date = data
          if (date.code === 200) {
            this.BankTypeList = date.data.list
          }
        })
      },
      // 当省份变化时的改变
      provinceChange(val) {
        this.getCityData(val, this.active)
      },
      // 根据城市名省市名获取城市名
      getCityData(id, type) {
        let province_id = id
        getCityApi({
          province_id
        }).then(data => {
          let date = data
          if (date.code === 200) {
            if (type === 2) {
              this.cityList2 = date.data.list
            } else {
              this.cityList1 = date.data.list
            }
          }
        })
      },
      // 取消按钮的点击
      mediaCancel() {
        this.$router.push({ name: 'media-manage'})
      }
    },
    created() {
      // 判断是否有修改权限
      let resultArr = this._isPageShow()
      if (this._isSuperAdmin() || !!resultArr.includes('view')) {
        this.ud_id = this.$route.params && this.$route.params.ud_id
        this.getUserData()
        this.getbankDate()
        this.getProvinceData()
        this.getBankTypeData()
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
    .app_title{
      font-size: 16px;
      color: #3F83F7;
      margin: 15px 0;
    }
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

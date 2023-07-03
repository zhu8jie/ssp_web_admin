<template>
  <Card :bordered="false" dis-hover class="page-main">
    <div class="edit-content-card">
      <div class="media_content">
        <div class="media_header">
          <div class="media_xuan">
               <div :class="active===1?'xuan actives':'xuan'" @click="active=1">
                 <p>
                   <i class="icon icon-ID" :style="active===1?'color:#fff':'color:#9498a3'"/>
                   <span>账号信息</span>
                 </p>
               </div>
              <div  :class="active===2?'xuan actives':'xuan'" @click="active=2">
                <p>
                  <i class="icon icon-money" :style="active===2?'color:#fff':'color:#9498a3'"/>
                  <span>财务信息</span>
                </p>
              </div>
          </div>
        </div>
        <div class="media_detail">
          <div class="media" v-show="active===1">
            <Form ref="step1Ref" :model="ruleForm" :rules="rules" :label-width="192">
              <FormItem label="账户名称" prop="dev_account">
                <Input v-model.trim="ruleForm.dev_account" :maxlength="30" placeholder="请输入账号名称" autocomplete="off"/>
              </FormItem>
<!--              <FormItem label="密码" prop="password">-->
<!--                <Input type="password" password :maxlength="20" v-model.trim="ruleForm.password" placeholder="请输入您的密码" autocomplete="off"/>-->
<!--              </FormItem>-->
              <FormItem label="公司主体名称" prop="company_name">
                <Input v-model.trim="ruleForm.company_name" :maxlength="30" placeholder="请输入公司主体名称" autocomplete="off"/>
              </FormItem>
              <FormItem label="公司对外简称" prop="company_short_name">
                <Input v-model.trim="ruleForm.company_short_name" :maxlength="20" placeholder="请输入公司对外简称" autocomplete="off"/>
              </FormItem>
              <FormItem label="统一社会信用代码" prop="credit_code">
                <Input v-model.trim="ruleForm.credit_code" placeholder="请填写正确的社会信用代码" autocomplete="off"/>
              </FormItem>
              <FormItem label="营业执照照片" prop="business_license">
                <upload-image :idVal="1" refName="icp_url" :bit="2 * 1024" v-model="ruleForm.business_license" :widthVal="200" :heightVal="200">
                  <Icon type="md-add" size="24"/>
                  <p>点击上传</p>
                </upload-image>
                <p class="upload-img-format-tips">营业执照照片或彩色扫描件,格式：jpg，大小不大于2M</p>
              </FormItem>
              <FormItem label="公司法人姓名" prop="legal_person_name">
                <Input v-model.trim="ruleForm.legal_person_name" :maxlength="30" placeholder="请输入公司法人姓名" autocomplete="off"/>
              </FormItem>
              <FormItem label="公司法人身份证号" prop="legal_person_code">
                <Input v-model.trim="ruleForm.legal_person_code" placeholder="请输入公司法人身份证号" autocomplete="off"/>
              </FormItem>
              <FormItem label="公司法人身份证正反面照片" prop="legal_person_card_p">
                <div style="display: flex;justify-content: space-between">
                  <upload-image v-model="ruleForm.legal_person_card_p" :widthVal="215" :heightVal="150" :idVal="2" refName="card1">
                    <div class="upload_text">
                      <div class="imgs">
                        <img src="~@/assets/image/card1.png" alt="">
                        <img class="icons" src="~@/assets/image/upload_icon.png" alt="">
                      </div>
                      <p>上传身份证头像面</p>
                    </div>
                  </upload-image>
                  <upload-image refName="card2" v-model="ruleForm.legal_person_card_b" :widthVal="215" :heightVal="150" :idVal="3">
                    <div class="upload_text">
                      <div class="imgs">
                        <img src="~@/assets/image/card2.png" alt="">
                        <img class="icons" src="~@/assets/image/upload_icon.png" alt="">
                      </div>
                      <p>上传身份证国徽面</p>
                    </div>
                  </upload-image>
                </div>
                <p class="upload-img-format-tips">照片或彩色扫描件，格式：jpg，大小：不大于2M</p>
              </FormItem>
              <FormItem label="产品名单" prop="product_list">
                <Input v-model.trim="ruleForm.product_list" :maxlength="50" placeholder="填写多个产品名单时用英文逗号隔开"/>
              </FormItem>
              <FormItem label="联系地址" prop="address">
                <Row>
                  <Col :span="5">
                    <Select prop="province_id" v-model="ruleForm.province_id" placeholder="请选择"
                            @on-change="provinceChange">
                      <Option v-for="(value,index) in provinceList"
                              :value="value.id"
                              :label="value.name"
                              :key="'contactProvince'+index">{{ value.name }}
                      </Option>
                    </Select>
                  </Col>
                  <Col offset="1" :span="5">
                    <Select prop="city_id" v-model="ruleForm.city_id" placeholder="请选择">
                      <Option v-for="(value,index) in cityList1"
                              :value="value.id"
                              :key="'contactCity'+index">{{ value.name }}
                      </Option>
                    </Select>
                  </Col>
                  <Col offset="1" :span="12">
                    <Input prop="address" v-model="ruleForm.address"/>
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="联系人姓名" prop="dev_name">
                <Input v-model.trim="ruleForm.dev_name" :maxlength="10" placeholder="请输入联系人姓名" autocomplete="off"/>
              </FormItem>
              <FormItem label="联系人电子邮箱" prop="dev_email">
                <label>
                  <Input v-model.trim="ruleForm.dev_email" :maxlength="30" placeholder="请输入联系人邮箱" autocomplete="off"/>
                </label>
              </FormItem>
              <FormItem label="联系人手机号码" prop="dev_phone">
                <Input v-model.trim="ruleForm.dev_phone" placeholder="请输入联系人手机号码" :maxlength="11" autocomplete="off"/>
              </FormItem>
              <FormItem class="reg_operating reg_box">
                <Button @click="mediaCancel" size="large">取消</Button>
                <Button type="primary" :loading="submitClock" @click="userSave('step1Ref')">
                  <span v-if="!submitClock">修改并保存</span>
                  <span v-else>保存中...</span>
                </Button>
              </FormItem>
            </Form>
          </div>
          <div class="media" v-show="active===2">
            <Form ref="formCustom" :model="financeDate" :rules="rules1" :label-width="190">
              <FormItem label="收款方">
                <p>{{ruleForm.company_name}}</p>
                <p style="color: #999999;font-size: 12px;line-height: 16px;">收款方同公司主体名称，如需修改，请修改公司主体名称</p>
              </FormItem>
              <FormItem label="开户行" prop="bank_name">
                <Input type="text"  v-model.trim="financeDate.bank_name" placeholder="请输入开户行名称"/>
<!--                <Select v-model="financeDate.bank_type_id" placeholder="请选择">-->
<!--                  <Option v-for="(value,index) in BankTypeList"-->
<!--                          :value="value.id"-->
<!--                          :key="'bank_name'+index">{{ value.name }}-->
<!--                  </Option>-->
<!--                </Select>-->
              </FormItem>
              <FormItem label="开户行所在地" prop="bank_city_id">
                <Row type="flex" justify="space-between" class="code-row-bg">
                  <Col style="width: 250px">
                    <Select prop="bank_province_id" v-model="financeDate.bank_province_id" placeholder="请选择"
                            @on-change="provinceChange">
                      <Option v-for="(value,index) in provinceList"
                              :value="value.id"
                              :label="value.name"
                              :key="'bankProvince'+index">{{ value.name }}
                      </Option>
                    </Select>
                  </Col>
                  <Col style="width: 250px">
                    <Select prop="bank_city_id" v-model="financeDate.bank_city_id" placeholder="请选择">
                      <Option v-for="(value,index) in cityList2"
                              :value="value.id"
                              :key="'bankCity'+index">{{ value.name }}
                      </Option>
                    </Select>
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="支行名称" prop="bank_address">
                <Input type="text" :maxlength="30" v-model.trim="financeDate.bank_address" placeholder="请输入支行名称"/>
              </FormItem>
              <FormItem label="银行账号" prop="bank_id_card">
                <Input :maxlength="50" v-model.trim="financeDate.bank_id_card" placeholder="请和银行卡上的信息完相同" autocomplete="off"/>
              </FormItem>
              <FormItem class="reg_operating">
                <Button @click="mediaCancel" size="large">取消</Button>
                <Button type="primary" :loading="submitClock" @click="financeSave('formCustom')">
                  <span v-if="!submitClock">修改并保存</span>
                  <span v-else>保存中...</span>
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
  import {showTitle} from '@/libs/util'
  import {validatePhone, validateIdNo, validateCreditCode} from '@/libs/tools'
  import { getProvinceApi, getCityApi, getBankTypeApi } from '@/api/common'
  import { getFinanceInfoApi, getFinanceUpdateApi, getUserUpdateApi, getDevUserInfoApi } from '@/api/ssp'
  import uploadImage from '_c/upload-image'
  import { inPageAccess } from '@/mixin/in-page-access.js'

  export default {
    name: 'media-edit',
    components: { uploadImage },
    mixins: [inPageAccess],
    data() {
      return {
        uploadImgModel: false,
        card_loading1: false,
        card_loading2: false,
        uploadImgUrl: '',
        source_id: [],
        submitClock: false,
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
          bank_name: '', // 开户行名称
          bank_province_id: '', // 开户行省份
          bank_city_id: '', // 开户行城市
          bank_address: '', // 支行名称
          bank_id_card: '' // 银行账号
        },
        rules: {
          dev_account: [
            {required: true, message: '请输入账户名称', trigger: 'blur'},
            {max: 30, message: '长度不超过30', trigger: 'blur'}
          ],
          // password: [
          //   {required: true, message: '请输入密码', trigger: 'blur'},
          //   {min: 6, max: 20, message: '长度必须在6~20之间', trigger: 'blur'}
          // ],
          company_name: [
            {required: true, message: '请输入公司主体名称', trigger: 'blur'},
            {max: 30, message: '长度不超过30', trigger: 'blur'}
          ],
          company_short_name: [
            {required: true, message: '请输入公司对外简称', trigger: 'blur'},
            {max: 20, message: '长度不超过20', trigger: 'blur'}
          ],
          credit_code: [
            {required: true, message: '请输入统一社会信用代码', trigger: 'blur'},
            {validator: validateCreditCode, trigger: 'blur'}
          ],
          business_license: [
            {required: true, message: '请上传营业执照', trigger: 'blur'}
          ],
          legal_person_name: [
            {required: true, message: '请输入公司法人姓名', trigger: 'blur'},
            {max: 30, message: '长度不超过30', trigger: 'blur'}
          ],
          legal_person_code: [
            {validator: validateIdNo, trigger: 'blur'}
          ],
          product_list: [
            {required: true, message: '请输入产品名单', trigger: 'blur'},
            {max: 50, message: '长度不超过50', trigger: 'blur'}
          ],
          province_id: [
            {required: true, message: '请输入联系地址', trigger: 'blur'}
          ],
          city_id: [
            {required: true, message: '请输入联系地址', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入联系地址', trigger: 'blur'}
          ],
          dev_name: [
            {required: true, message: '请输入联系人姓名', trigger: 'blur'},
            {max: 10, message: '长度不超过10', trigger: 'blur'}
          ],
          dev_email: [
            {required: true, message: '请输入联系人邮箱', trigger: 'blur'},
            {max: 30, message: '长度不超过30', trigger: 'blur'},
            {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
          ],
          dev_phone: [
            {required: true, message: '请输入联系人手机号码', trigger: 'blur'},
            {validator: validatePhone, trigger: 'blur'}
          ]
        },
        rules1: {
          bank_name: [
            {required: true, message: '请输入开户行'}
          ],
          bank_province_id: [
            {type: 'number', required: true, message: '请选择开户行所在地', trigger: 'blur'}
          ],
          bank_city_id: [
            {type: 'number', required: true, message: '请选择开户行所在地', trigger: 'blur'}
          ],
          bank_address: [
            {required: true, message: '请输入支行名称', trigger: 'blur'}
          ],
          bank_id_card: [
            {required: true, message: '请输入银行账号', trigger: 'blur'}
          ]
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
        this.$router.push({name: 'media-manage'})
      },
      goBack() {
        this.$router.back(-1)
      },
      // 账号信息的保存
      userSave(name) {
        this.$refs[name].validate((valid) => {
          this.submitClock = true
          if (valid) {
            this.userDataSave()
          } else {
            this.$Message.error('请检查数据的填写')
          }
        })
      },
      userDataSave() {
        let userData = this.ruleForm
        userData.ud_id = parseInt(this.ud_id)
        getUserUpdateApi(userData).then(data => {
          let register = data
          this.submitClock = false
          if (register.code === 200) {
            this.$Bus.$emit('editEmitEvent')
            this.$Message.success('数据修改成功')
            this.goBack()
          }
        })
      },
      // 财务信息的保存
      financeSave() {
        this.$refs['formCustom'].validate((valid) => {
          this.submitClock = true
          if (valid) {
            this.financeDataSave()
          } else {
            this.$Message.error('请检查数据的填写')
          }
        })
      },
      financeDataSave() {
        let financeList = this.financeDate
        financeList.ud_id = parseInt(this.ud_id)
        getFinanceUpdateApi(financeList).then(data => {
          let register = data
          this.submitClock = false
          if (register.code === 200) {
            this.$Bus.$emit('editEmitEvent')
            this.$Message.success('数据修改成功')
            this.goBack()
          }
        })
      }
    },
    created() {
      // 判断是否有修改权限
      let resultArr = this._isPageShow()
      if (this._isSuperAdmin() || !!resultArr.includes('modify')) {
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

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .page-main{
    height: calc(100vh - 90px);
  }
  .media_content {
    padding 0 20px 10px
    position relative
    /*overflow hidden*/
    .media_header{
      position absolute
      top:0px
      left 50%
      margin-left -360px
      text-align center
      z-index 1000
      background #FFFFff
      .media_xuan{
        display flex
        justify-content: center;
        .xuan {
          width 350px
          height 50px
          line-height 50px
          text-align center
          background: #F3F5F9;
          color #9498A3
          cursor pointer
          &.actives{
            background: linear-gradient(90deg, #3C7EF7, #5296F9);
            color #FFFFff
          }
          .icon{
            font-size 24px
            margin-right 10px
            vertical-align: middle;
          }
        }

      }
    }
    .media_detail {
      padding-top 50px
      overflow auto
      max-height calc(100vh - 180px)
    }
    /deep/ .media {
        width 700px
        max-width 700px
        margin 20px auto
      .ivu-input {
        background: #FAFAFA;
        height: 34px;
        border: 1px solid #EFEFEF;
        border-radius 0px
        &:hover{
          border-color #3F83F7
        }
      }
      .upload_text{
        .imgs {
          margin-top 5px
          position relative
          width 130px
          height 78px
          left 50%
          transform translateX(-50%)
          .icons {
            width 20px
            height 20px
            position absolute
            right: -10px
            bottom -10px
          }
        }
        p{
          text-align center
          margin-top 5px
        }
      }
      .ivu-select-selection {
        background: #FAFAFA;
        border: 1px solid #F0F0F0;
        height 34px
        border-radius 0px
        &:hover{
          border-color #3F83F7
        }
      }
      .ivu-select-single {
        height 34px
        line-height 34px
      }
      .ivu-upload {
        text-align center
      }
      .ivu-upload-drag {
        width 100%
        height 100%
        background transparent
        border 0px;
      }
    }
  }
  .media {
    margin-top 30px
    padding: 10px 0px;
    .FormItem __label {
      padding: 0px !important;
      color: black;
    }
    .FormItem {
      margin-bottom: 8px;
    }
    .Select {
      width: 100%;
    }
  }
  .reg_operating {
    width: 700px;
    position: absolute;
    bottom: -20px;
    margin-bottom 0px
    padding-top: 10px;
    background: #ffff;
    &.reg_box{
      box-shadow: 0px -10px 15px 0px #eceaea;
    }

    button {
      height 40px;
      padding 0 40px
      margin 0 1%;
    }
  }

</style>

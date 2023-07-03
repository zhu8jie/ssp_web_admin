<template>
  <div class="layout">
    <div class="header">
      <div class="left">
        <img src="../../assets/image/logo.png" alt="">
        <span>数字欢喜</span>
      </div>
      <div class="text">申请开发者账号</div>
      <div class="right">已有账号，直接 <a href="/account/login">登录 ></a></div>
    </div>
    <div class="content">
      <div class="detail">
        <div class="schedule">
          <div :class="active===0?'sch_left':'sch_left active'" >
            <p>
              <img v-if="active===0" src="../../assets/image/account_user.png" alt="">
              <img v-if="active===1" src="../../assets/image/zhanghao.png" alt="">
              <span>账号信息</span>
            </p>
            <img class="success" v-if="active===1" src="../../assets/image/dui.png" alt="">
          </div>
          <div :class="active===0?'sch_right':'sch_right active'">
            <p>
              <img v-if="active===0" src="../../assets/image/money_icon.png" alt="">
              <img v-if="active===1" src="../../assets/image/caiwu.png" alt="">
              <span>财务信息</span>
            </p>
          </div>

        </div>
        <div class="step1" v-if="active===0">
          <Form ref="ruleForm"  :model="ruleForm" :rules="rules" :label-width="180">
            <FormItem label="账户名称" prop="dev_account">
              <Input v-model.trim="ruleForm.dev_account" :maxlength="30" placeholder="请输入账号名称" autocomplete="off">
              </Input>
            </FormItem >
            <FormItem label="密码" prop="password">
              <Input type="password" password :maxlength="20" v-model.trim="ruleForm.password" placeholder="请输入您的密码" autocomplete="off">
              </Input>
            </FormItem>
            <FormItem  label="公司主体名称" prop="comany_name">
              <Input v-model.trim="ruleForm.comany_name" :maxlength="30" placeholder="请输入公司主体名称" autocomplete="off">
              </Input>
            </FormItem >
            <FormItem  label="公司对外简称" prop="comany_short_name">
              <Input v-model.trim="ruleForm.comany_short_name" :maxlength="30" placeholder="请输入公司对外简称" autocomplete="off">
              </Input>
            </FormItem >
            <FormItem  label="统一社会信用代码" prop="credit_code">
              <Input v-model.trim="ruleForm.credit_code" placeholder="请填写正确的社会信用代码" autocomplete="off">
              </Input>
            </FormItem >
            <FormItem label="营业执照照片" prop="business_license">
              <div class="upload_img">
                <Upload
                  multiple
                  type="drag"
                  action=""
                  v-model="ruleForm.business_license"
                >
                  <div class="upload_text" style="margin-top: 60px">
                    <Icon type="md-add" size="24"/>
                    <p>点击上传</p>
                  </div>
                </Upload>
              </div>
              <p class="upload_des">营业执照照片或彩色扫描件,格式：jpg，大小不大于2M</p>
            </FormItem>
            <FormItem label="公司法人姓名" prop="legal_person_name">
              <Input v-model.trim="ruleForm.legal_person_name" :maxlength="30" placeholder="请输入公司法人姓名" autocomplete="off"></Input>
            </FormItem>
            <FormItem label="公司法人身份证号" :maxlength="18" prop="legal_person_code">
              <Input v-model.trim="ruleForm.legal_person_code" placeholder="请输入公司法人身份证号" autocomplete="off"></Input>
            </FormItem>
            <FormItem label="公司法人身份证正反面照片" prop="name">
              <div class="card_upload">
                <Upload
                  multiple
                  type="drag"
                  action="">
                  <div class="upload_text">
                    <div class="imgs">
                      <img src="../../assets/image/card1.png" alt="">
                      <img class="icons" src="../../assets/image/upload_icon.png" alt="">
                    </div>
                    <p>上传身份证头像面</p>
                  </div>
                </Upload>
              </div>
              <div class="card_upload">
                <Upload
                  multiple
                  type="drag"
                  action=""
                >
                  <div class="upload_text">
                    <div class="imgs">
                      <img src="../../assets/image/card2.png" alt="">
                      <img class="icons" src="../../assets/image/upload_icon.png" alt="">
                    </div>
                    <p>上传身份证国徽面</p>
                  </div>
                </Upload>
              </div>
              <p class="upload_des">照片或彩色扫描件，格式：jpg，大小：不大于2M</p>
            </FormItem>
            <FormItem label="产品名单" prop="product_list">
              <Input v-model.trim="ruleForm.product_list" :maxlength="50" placeholder="填写多个产品名单时用英文逗号隔开"></Input>
            </FormItem>
            <FormItem label="联系地址">
              <Col :span="6">
                <Select  prop="contactProvince" v-model="ruleForm.contactProvince" placeholder="请选择">
                  <option></option>
                </Select>
              </Col>
              <Col :span="6">
                <Select prop="contactCity" v-model="ruleForm.contactCity" placeholder="请选择">
                  <el-option></el-option>
                </Select>
              </Col>
              <Col :span="12">
                <Input prop="contactAddress" v-model.trim="ruleForm.contactAddress" :maxlength="50"></Input>
              </Col>
            </FormItem>
            <FormItem label="联系人姓名" prop="dev_name">
              <Input v-model.trim="ruleForm.dev_name" :maxlength="10" placeholder="请输入联系人姓名" autocomplete="off"></Input>
            </FormItem>
            <FormItem label="联系人电子邮箱" prop="dev_email">
              <label>
                <Input v-model.trim="ruleForm.dev_email" :maxlength="30" placeholder="请输入联系人邮箱" autocomplete="off"></Input>
              </label>
            </FormItem>
            <FormItem label="联系人手机号码" prop="dev_phone">
              <Input v-model.trim="ruleForm.dev_phone" :maxlength="11" placeholder="请输入联系人手机号码" autocomplete="off"></Input>
            </FormItem>
<!--            <FormItem label="手机验证码" prop="contactCode">-->
<!--              <Input v-model="ruleForm.contactCode"></Input>-->
<!--            </FormItem>-->
            <FormItem class="res-bottom">
              <Button  type="primary" round @click="toStep('ruleForm')">下一步</Button>
            </FormItem>
          </Form>
        </div>
        <div class="step1" v-if="active===1">
          <Form ref="formCustom"  :model="ruleForm" :rules="rules1" :label-width="180">
            <FormItem label="收款方" prop="payee">
              <Input v-model.trim="ruleForm.comany_name" :maxlength="30"></Input>
            </FormItem>
            <FormItem label="开户行" prop="bank_name">
              <Select prop="banks" v-model="ruleForm.bank_name" placeholder="请选择">
              </Select>
            </FormItem>
            <FormItem label="开户行所在地">
              <Col :span="12">
                <Select prop="bankProvince" v-model="ruleForm.bankProvince" placeholder="请选择">
                </Select>
              </Col>
              <Col :span="12">
                <Select prop="bankCity" v-model="ruleForm.bankCity" placeholder="请选择">
                </Select>
              </Col>
            </FormItem>
            <FormItem label="支行名称" prop="bankName">
              <Select v-model.trim="ruleForm.bankName" placeholder="请选择">
              </Select>
            </FormItem>
            <FormItem label="银行账号" prop="bank_id_card">
              <Input v-model.trim="ruleForm.bank_id_card" :maxlength="30" placeholder="请和银行卡上的信息完相同">
              </Input>
            </FormItem>
            <FormItem >
              <Checkbox v-model="checked">
                <a href="/account/developer" target="_blank">阅读并同意《开发者协议》</a>
              </Checkbox>
            </FormItem>
            <FormItem class="reg_operating">
             <Button @click="active=0">上一步</Button>
             <Button type="primary" @click="save">提交</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mediaRegister } from '@/api/ssp'
export default {
    name: 'mediaRegister',
    data() {
        return {
            active: 0,
            checked: false,
            ruleForm: {
                dev_account: '', // 账号名称
                password: '', // 密码
                comany_name: '', // 公司主体名称 收款方
                comany_short_name: '', // 公司对外简称
                credit_code: '', // 统一社会信用代码
                business_license: '', // 营业执照照片地址
                legal_person_name: '', // 公司法人姓名
                legal_person_code: '', // 公司法人身份证号
                legal_person_card_p: '', // 公司法人身份证正面照片
                legal_person_card_b: '', // 公司法人身份证反面照片
                product_list: '', // 产品名单
                contactProvince: '', // 联系地址1
                contactCity: '', // 联系地址2
                contactAddress: '', // 联系地址3
                dev_name: '', // 联系人姓名
                dev_email: '', // 联系人邮箱
                dev_phone: '', // 联系人手机号码
                bank_name: '', // 开户行
                bankProvince: '', // 开户行地址1
                bankCity: '', // 开户行地址1
                bankName: '', // 支行名称
                bank_id_card: '' // 银行账号
            },
            rules: {
                dev_account: [{
                    required: true,
                    message: '请输入活动名称',
                    trigger: 'blur'
                }, {
                    max: 30,
                    message: '长度不超过30',
                    trigger: 'blur'
                }],
                password: [{
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                }, {
                    min: 6,
                    max: 20,
                    message: '长度必须在6~20之间',
                    trigger: 'blur'
                }],
                comany_name: [{
                    required: true,
                    message: '请输入公司主体名称',
                    trigger: 'blur'
                }, {
                    max: 30,
                    message: '长度不超过30',
                    trigger: 'blur'
                }],
                comany_short_name: [{
                    required: true,
                    message: '请输入公司对外简称',
                    trigger: 'blur'
                }, {
                    max: 5,
                    message: '长度不超过5',
                    trigger: 'blur'
                }],
                credit_code: [{
                    required: true,
                    message: '请输入统一社会信用代码',
                    trigger: 'blur'
                }],
                legal_person_name: [{
                    required: true,
                    message: '请输入公司法人姓名',
                    trigger: 'blur'
                }, {
                    max: 30,
                    message: '长度不超过30',
                    trigger: 'blur'
                }],
                legal_person_code: [{
                    required: true,
                    message: '请输入公司法人身份证号',
                    trigger: 'blur'
                }],
                product_list: [{
                    required: true,
                    message: '请输入产品名单',
                    trigger: 'blur'
                }, {
                    max: 50,
                    message: '长度不超过50',
                    trigger: 'blur'
                }],
                contactProvince: [{
                    required: true,
                    message: '请输入联系地址',
                    trigger: 'blur'
                }],
                contactCity: [{
                    required: true,
                    message: '请输入联系地址',
                    trigger: 'blur'
                }],
                contactAddress: [{
                    required: true,
                    message: '请输入联系地址',
                    trigger: 'blur'
                }],
                dev_name: [{
                    required: true,
                    message: '请输入联系人姓名',
                    trigger: 'blur'
                }, {
                    max: 10,
                    message: '长度不超过10',
                    trigger: 'blur'
                }],
                dev_email: [{
                    required: true,
                    message: '请输入联系人邮箱',
                    trigger: 'blur'
                }, {
                    max: 30,
                    message: '长度不超过30',
                    trigger: 'blur'
                }, {
                    type: 'email',
                    message: '请输入正确的邮箱地址',
                    trigger: ['blur', 'change']
                }],
                dev_phone: [{
                    required: true,
                    message: '请输入联系人手机号码',
                    trigger: 'blur'
                }]
                // contactCode: [
                //     { required: true, message: '请输入验证码', trigger: 'blur' }
                // ]
            },
            rules1: {
                bank_name: [{
                    required: true,
                    message: '请选择开户行',
                    trigger: ['blur', 'change']
                }],
                bankProvince: [{
                    required: true,
                    message: '请选择开户行所在地',
                    trigger: ['blur', 'change']
                }],
                bankCity: [{
                    required: true,
                    message: '请选择开户行所在地',
                    trigger: ['blur', 'change']
                }],
                bankName: [{
                    required: true,
                    message: '请选择支行名称',
                    trigger: ['blur', 'change']
                }],
                bank_id_card: [{
                    required: true,
                    message: '请输入银行账号',
                    trigger: ['blur', 'change']
                }]
            }
        }
    },
    methods: {
        // 点击下一步
        toStep(name) {
            this.active = 1
            // this.$refs[name].validate((valid) => {
            //   if (valid) {
            //     this.active = 1
            //     this.$Message.success('Success!')
            //   } else {
            //   }
            // })
        },
        // 点击注册
        save() {
            let registerData = this.ruleForm
            mediaRegister(registerData).then(data => {
                let register = data.data
                console.log(register)
                if (register.code === 200) {

                }
            })
        }
    }
}
</script>
<style lang="stylus">
  .step1{
     .ivu-input{
       background: #FAFAFA;
       border: 1px solid #F0F0F0;
       height: 34px;
     }
  .ivu-select-selection{
    background: #FAFAFA;
    border: 1px solid #F0F0F0;
  }
  }
    .step1{
    .ivu-upload-drag{
      width 100%
      height 100%
      background transparent
      border 0px;
      }
    }
</style>
<style lang="stylus" scoped>
  .header {
    background: #0E1834;
    display flex
    justify-content space-between
    height: 60px;
    line-height: 60px;
    padding:0 20px ;
    color #FFFFff
    .left{
      img{
        vertical-align middle
        width 32px
      }
      span{
        color #F13440
        font-size 22px
        margin-left 8px
        font-weight bold
        vertical-align middle
      }
    }
    .text{
       font-size 20px
       font-weight bold
    }
  }
  .content {
    margin: 0 auto 20px;
    width 780px
    .con-title {
      margin: 20px 0;
      font-size: 25px;
      color: #000000;
    }
    .detail {
      padding: 20px 40px;
      text-align: left;
      .schedule{
        width 620px
        display flex
        height 50px
        justify-content space-between
        margin 0 40px
        position relative
        .sch_left{
          width 320px
          height 50px
          position absolute
          left 0
          background url("../../assets/image/sch-left.png") no-repeat center
          line-height 50px
          text-align center
          color #FFFFff
         &.active{
           background url("../../assets/image/yes_left.png") no-repeat center
           color: #9498A3
         }
          .success{
            position absolute
            left 0
            top 0px
          }
          img{
            width 20px
            height 15px
            vertical-align middle
            margin-right 10px
          }
          span{
            vertical-align middle
          }
        }
        .sch_right{
          width 300px
          height 50px
          background url("../../assets/image/sch-right.png") no-repeat center
          line-height 50px
          text-align center
          color: #9498A3
          position absolute
          left 310px
          &.active{
            background url("../../assets/image/no_right.png") no-repeat center
            color #FFFFff
          }
          img{
            width 20px
            vertical-align middle
            margin-right 10px
          }
          span{
            vertical-align middle
          }
        }
      }

      .step1 {
        margin-top 30px
        padding: 10px 40px;
        .upload_text{
          color #9A9A9A
          font-size 13px
          text-align center
        }
        .upload_img {
          width 200px
          height 200px
          background: #FAFAFA;
          border: 1px solid #F0F0F0;
        }
        .card_upload{
          display inline-block
          width: 215px;
          height: 150px;
          background: #FAFAFA;
          border: 1px solid #F0F0F0;
          .imgs{
            margin-top 25px
            position relative
            width 130px
            height 78px
            left 50%
            transform translateX(-50%)
            .icons{
              width 20px
              height 20px
              position absolute
              right:-10px
              bottom -10px
            }
          }
        }
        .upload_des {
          color #9A9A9A
          font-size 13px
          margin-top 5px
        }
        .FormItem __label {
          padding: 0px !important;
          color: black;
        }
        .FormItem {
          margin-bottom: 8px;
        }
        .Select{
          width: 100%;
        }
      }
      .res-bottom{
        button{
          padding: 0px 40px;
        }
      }
      .reg_operating{
        button{
          height 40px;
          padding 0 40px
          margin 0 1%;
        }
      }

    }
  }
</style>

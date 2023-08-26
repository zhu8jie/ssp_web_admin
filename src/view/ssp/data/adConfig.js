export const getDeleteCols = (self) => {
  return [
    {
      title: '预算位名称/ID',
      slot: 'budget',
      minWidth: 100
    },
    {
      title: '预算方广告位ID',
      slot: 'dsp_slot_code'
    },
    {
      title: '删除时间',
      slot: 'delete_time',
      minWidth: 80
    },
    {
      title: '操作人',
      slot: 'operator_name'
    },
    {
      title: '操作',
      slot: 'action',
      width: 80,
      align: 'center'
    }
  ]
}
export const getSelectCols = (self) => {
  return [
    {
      title: '预算位名称',
      slot: 'dsp_slot_name',
      minWidth: 180
    },
    {
      title: '关联广告位',
      slot: 'ssp_slot_count',
      minWidth: 90
    },
    {
      title: '产品名称',
      slot: 'product_id',
      minWidth: 100
    },
    {
      title: '预算位ID',
      slot: 'dsp_slot_id',
      minWidth: 90
    },
    {
      title: '预算方广告位ID',
      slot: 'dsp_slot_code',
      minWidth: 130
    },
    {
      title: '结算方式',
      slot: 'pay_type_text',
      minWidth: 130
    },
    {
      title: '近三天最新CPM',
      slot: 'cpm',
      minWidth: 120
    },
    {
      title: '广告场景',
      slot: 'ad_type',
      minWidth: 110
    },
    {
      title: '广告样式',
      slot: 'creative_type',
      minWidth: 110
    },
    {
      title: '采买类型',
      slot: 'pickup_status',
      minWidth: 80
    },
    {
      title: '状态',
      slot: 'status',
      minWidth: 60
    },
    {
      title: '素材尺寸比例',
      slot: 'ad_ratio',
      minWidth: 105
    },
    {
      title: '操作',
      slot: 'action',
      width: 70,
      fixed: 'right'
    }
  ]
}
export const getSelfCols = (self) => {
  return [
    {
      title: '预算位',
      slot: 'budget',
      width: 225
    },
    {
      title: '状态',
      slot: 'budget_status',
      width: 70,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            },
            style: {
              lineHeight: '15px'
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px',
                lineHeight: '15px'
              }
            }, '状态'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '指所选预算位的状态，如果是停用则无法投放，请选择正常状态的预算位')
          ])
        ])
      }
    },
    {
      title: '尺寸比例检验',
      slot: 'size_ratio',
      width: 75,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            },
            style: {
              lineHeight: '15px'
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px',
                lineHeight: '15px'
              }
            }, '尺寸比例检验'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '指所选预算位与当前广告位尺寸比例需要一致，且可以有上下5%的比例浮动，超过5%，则不匹配，无法提交')
          ])
        ])
      }
    },
    {
      title: '价格浮动系数',
      slot: 'price_float',
      width: 75,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            },
            style: {
              lineHeight: '15px'
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px',
                lineHeight: '15px'
              }
            }, '价格浮动系数'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '指该广告位配置当前预算位参与竞价时，CPM出价的浮动系数，范围是(0%,200%]，默认100%，表示CPM出价不浮动；最终出价为CPM出价*价格浮动系数')
          ])
        ])
      }
    },
    {
      title: '权重',
      slot: 'weight',
      width: 75,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px'
              }
            }, '权重'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '权重是0～1000内的任意整数，数值越大，优先级越高')
          ])
        ])
      }
    },
    {
      title: '展现控制',
      slot: 'view_control',
      width: 155
    },
    {
      title: '点击控制',
      slot: 'click_control',
      width: 155
    },
    {
      title: '时段控制',
      slot: 'time_control',
      width: 195
    },
    {
      title: '操作',
      slot: 'action',
      width: 70,
      align: 'center'
    }
  ]
}
export const getHandCols = (self) => {
  return [
    {
      title: '预算位',
      slot: 'budget',
      width: 225
    },
    {
      title: '状态',
      slot: 'budget_status',
      width: 70,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            },
            style: {
              lineHeight: '15px'
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px',
                lineHeight: '15px'
              }
            }, '状态'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '指所选预算位的状态，如果是停用则无法投放，请选择正常状态的预算位')
          ])
        ])
      }
    },
    {
      title: '尺寸比例检验',
      slot: 'size_ratio',
      width: 75,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            },
            style: {
              lineHeight: '15px'
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px',
                lineHeight: '15px'
              }
            }, '尺寸比例检验'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '指所选预算位与当前广告位尺寸比例需要一致，且可以有上下5%的比例浮动，超过5%，则不匹配，无法提交')
          ])
        ])
      }
    },
    {
      title: '价格浮动系数',
      slot: 'price_float',
      width: 75,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {
              transfer: true,
              content: 'Bottom Center text',
              placement: 'top-start',
              maxWidth: 400
            },
            style: {
              lineHeight: '15px'
            }
          }, [
            h('span', {
              style: {
                cursor: 'pointer',
                marginRight: '5px',
                lineHeight: '15px'
              }
            }, '价格浮动系数'),
            h('Icon', {
              props: {
                type: 'md-help-circle',
                color: '#c8c8c8',
                size: '16',
                cursor: 'pointer'
              },
              class: {iconClass: true}
            }),
            h('div', {
              slot: 'content',
              style: {
                fontSize: '12px'
              }
            }, '指该广告位配置当前预算位参与竞价时，CPM出价的浮动系数，范围是(0%,200%]，默认100%，表示CPM出价不浮动；最终出价为CPM出价*价格浮动系数')
          ])
        ])
      }
    },
    {
      title: '流量占比',
      slot: 'flow',
      width: 75
    },
    {
      title: '展现控制',
      slot: 'view_control',
      width: 155
    },
    {
      title: '点击控制',
      slot: 'click_control',
      width: 155
    },
    {
      title: '时段控制',
      slot: 'time_control',
      width: 195
    },
    {
      title: '操作',
      slot: 'action',
      width: 70,
      align: 'center'
    }
  ]
}
export const formRules = {
  data() {
    // 计费方式
    const billingMode = (rule, value, callback) => {
      let _form = this.deployData
      let showTxt = ''
      if (!_form.cpc && !_form.cpm) {
        showTxt = '请选择计费方式'
      }
      if (_form.cpc) {
        if (_form.floor_price_cpc < 0) {
          showTxt = '请输入正确的cpc底价'
        }
      }
      if (_form.cpm) {
        if (_form.floor_price_cpm < 0) {
          showTxt = '请输入正确的cpm底价'
        }
      }
      if (_form.cpm && _form.cpc) {
        if (_form.floor_price_cpm < 0 || _form.floor_price_cpc < 0) {
          showTxt = '请输入对应正确的底价'
        }
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }

    const payTypeValidFn = (rule, value, callback) => {
      let _form = this.deployData
      if (!_form.pay_type) {
        callback(new Error('请选择结算方式'))
      } else if (_form.pay_type === 1) {
        if (_form.valuation_price <= 0 || !/^\d+(\.\d{1,2})?$/.test(_form.valuation_price)) {
          callback(new Error('CPM价格大于0,最多可填2位小数'))
        } else {
          callback()
        }
      } else if (_form.pay_type === 2) {
        if (_form.divide_price <= 0 || _form.divide_price > 100) {
          callback(new Error('请填写大于0小于等于100的数字'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const selfDsp = (rule, value, callback) => {
      let _form = this.deployData
      if (!_form.self_dsp) {
        callback(new Error('请选择是否启用到自营DSP'))
      } else {
        callback()
      }
    }
    const flowSplit = (rule, value, callback) => {
      let arr = this.infos.flowData
      let showTxt = ''
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        sum += parseInt(item.proportion)
        if (!item.proportion || item.proportion < 1 || item.proportion > 100 || item.proportion % 1 !== 0) {
          showTxt = '自营流量的拆分值必须是1~100中的任意整数'
          break
        }
      }
      if (sum > 100) {
        showTxt = '自营流量的拆分值的和不能大于100'
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const controllerList = (rule, value, callback) => {
      let _form = this.flowData[0]
      let data = this.flowData
      let showTxt = this.ruleList(_form, data)
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }

    const controllerList1 = (rule, value, callback) => {
      let _form = this.flowData[1]
      let data = this.flowData
      let showTxt = this.ruleList(_form, data)
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const controllerList2 = (rule, value, callback) => {
      let _form = this.flowData[2]
      let data = this.flowData
      let showTxt = this.ruleList(_form, data)
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const controllerList3 = (rule, value, callback) => {
      let _form = this.flowData[3]
      let data = this.flowData
      let showTxt = this.ruleList(_form, data)
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const controllerList4 = (rule, value, callback) => {
      let _form = this.flowData[4]
      let data = this.flowData
      let showTxt = this.ruleList(_form, data)
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const controllerList5 = (rule, value, callback) => {
      let _form = this.flowData[5]
      let data = this.flowData
      let showTxt = this.ruleList(_form, data)
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const discountShow = (rule, value, callback) => {
      let _form = this.deployData
      let showTxt = ''
      if (_form.discount_show) {
        if (_form.discount_show < 1 || _form.discount_show > 100) {
          showTxt = '请填写大于0小于等于100的整数'
        }
        if (!/^[1-9]\d*$/.test(_form.discount_show)) {
          showTxt = '请填写大于0小于等于100的整数'
        }
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const maxRequests = (rule, value, callback) => {
      let _form = this.deployData
      let showTxt = ''
      if (_form.max_request_times < 0) {
        showTxt = '请填写大于等于0的整数'
      }
      if (!/^(0|[1-9][0-9]*)$/.test(_form.max_request_times)) {
        showTxt = '请填写大于等于0整数'
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const discountClick = (rule, value, callback) => {
      let _form = this.deployData
      let showTxt = ''
      if (_form.discount_click) {
        if (_form.discount_click < 1 || _form.discount_click > 100) {
          showTxt = '请填写大于0小于等于100的整数'
        }
        if (!/^[1-9]\d*$/.test(_form.discount_click)) {
          showTxt = '请填写大于0小于等于100的整数'
        }
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const cmPrice = (rule, value, callback) => {
      let _form = this.deployData
      let showTxt = ''
      if (_form.cpm_price < 0) {
        showTxt = 'CPM出价大于等于0，最多可填2位小数'
      }
      if (!/^\d+(\.\d{1,2})?$/.test(_form.cpm_price)) {
        showTxt = 'CPM出价大于等于0，最多可填2位小数'
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    const sizeRatio = (rule, value, callback) => {
      let size = this.size_ratio
      let showTxt = ''
	  if(!size || size.length === 0){
		  showTxt = '请选择素材尺寸比例'
	  }
      for (let j = 0; j < size.length; j++) {
        let _pre = size[j].width
        let _next = size[j].height
        if (_pre ===0 || _next === 0 || !/^[1-9]\d*$/.test(_next) || !/^[1-9]\d*$/.test(_pre)) {
          showTxt = '请选择素材尺寸比例'
          break
        }
      }
      if (showTxt) {
        callback(new Error(showTxt))
      } else {
        callback()
      }
    }
    return {
      deployRule: { // 正则
        discount_show: [{validator: discountShow}],
        discount_click: [{validator: discountClick}],
        // cpm_price: [{validator: cmPrice}], // cpm出价
        // billingMode: [{required: true, validator: billingMode}], // 计费方式及底价
        pay_type: [{required: true, validator: payTypeValidFn}],
        self_dsp: [{required: true, validator: selfDsp}],
        flow_split: [{required: true, validator: flowSplit}],
        size_ratio: [{required: true, validator: sizeRatio}],
        maxRequests: [{validator: maxRequests}],
        controller_list0: [{validator: controllerList}],
        controller_list1: [{validator: controllerList1}],
        controller_list2: [{validator: controllerList2}],
        controller_list3: [{validator: controllerList3}],
        controller_list4: [{validator: controllerList4}],
        controller_list5: [{validator: controllerList5}]
      },
      configRule: {
        flow_split: [{required: true, validator: flowSplit}],
        controller_list0: [{validator: controllerList}],
        controller_list1: [{validator: controllerList1}],
        controller_list2: [{validator: controllerList2}],
        controller_list3: [{validator: controllerList3}],
        controller_list4: [{validator: controllerList4}],
        controller_list5: [{validator: controllerList5}]
      }
    }
  },
  methods: {
     ruleList(_form, data) {
       let showTxt = ''
       let item = _form
       if (item.proportion) {
           let dataArr = item.data.selfActionData
           if (dataArr.length === 0) {
             // callback(new Error('请至少配置一个预算位'))
           }
           for (let j = 0; j < dataArr.length; j++) {
             let dateItem = dataArr[j]
             if (dateItem.ratio_is_ok === -1 || dateItem.ratio_is_ok === '-1') {
               showTxt = '尺寸比例检验不通过'
               break
             }
             if (dateItem.dsp_slot_id[0] === '0' || dateItem.dsp_slot_id.length === 0) {
               showTxt = '请选择预算位'
               break
             } else if (dateItem.price_float <= 0 || dateItem.price_float > 200 || dateItem.price_float % 1 !== 0) {
               showTxt = '价格浮动系数必须是1~200中的任意整数'
               break
             } else if (dateItem.control_weight < 0 || dateItem.control_weight > 1000 || dateItem.control_weight % 1 !== 0) {
               showTxt = '权重必须0~1000的任意整数'
               break
             } else if (dateItem.control_show_day < 0 || dateItem.control_show_day % 1 !== 0) {
               showTxt = '展现控制必须大于0的任意整数'
               break
             } else if (dateItem.control_click_day < 0 || dateItem.control_click_day % 1 !== 0) {
               showTxt = '点击控制必须是大于0的任意整数'
               break
             } else if (!dateItem.control_time_type) {
               showTxt = '请选择时段控制'
               break
             } else if (dateItem.control_time_type === 1) {
               if (dateItem.control_time_custom === '000000000000000000000000') {
                 showTxt = '请选择自定义时段'
                 break
               }
             }
             if (dateItem.tag_orientation === 1) {
               if (dateItem.tag_proportion < 0 || dateItem.tag_proportion > 100 || dateItem.tag_proportion % 1 !== 0) {
                 showTxt = '定向外流量占比必须是0~100的的任意整数'
                 break
               }
               if (!dateItem.tag_list[0] || dateItem.tag_list[0].length === 0) {
                 showTxt = '人群标签至少填写一条'
                 break
               }
             } else if (dateItem.tag_orientation === 2) {
               if (!dateItem.tag_list[0] || dateItem.tag_list[0].length === 0) {
                 showTxt = '人群标签至少填写一条'
                 break
               }
             }
           }
       }
       return showTxt
     }
  }
}

/**
 * [产品状态以及运营状态]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const productStatus = (self) => {
	return [
		{value: -5, label: '待测试'},
		{value: 0, label: '测试待开始'},
		{value: 1, label: '测试中'},
		{value: -3, label: '测试不通过'},
		{value: 4, label: '已采买'},
		{value: 3, label: '采买失败'},
		{value: 2, label: '有量未采买'},
		{value: -1, label: '无量'},
		{value: -2, label: '拒绝采买'}
		// {value: -4, label: '无状态'}
	]
}
/**
 * [标记]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const productMark = (self) => {
  return [
    {value: 1, label: '盈利'},
    {value: 2, label: '盈利-亏损'},
    {value: 3, label: '新盈利'},
    {value: 4, label: 'CTR异常'},
    {value: 5, label: 'DP'},
    {value: 6, label: '价格'}
  ]
}
/**
 * [广告位业务状态]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const adStatusList = (self) => {
  return [
    {value: 1, label: '有效'},
    {value: 3, label: '待审核'},
    {value: 2, label: '修改审核中'},
    {value: 4, label: '已拒绝'},
    {value: 5, label: '封禁'}
  ]
}

/**
 * [广告位状态]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const sspSlotStatus = (self) => {
  return [
    {value: 1, label: '启用'},
    {value: 2, label: '暂停'}
  ]
}

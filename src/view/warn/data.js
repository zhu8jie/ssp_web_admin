/**
 * [预警中心]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getWarnColumn = (self) => {
  return [
    {
      type: 'index',
      width: 36,
      align: 'center',
      isHideInColumn: true
    },
    {
      title: '预警编号',
      key: 'id',
      minWidth: 80,
      isHideInColumn: true
    },
    {
      title: '预警名称',
      slot: 'name',
      minWidth: 150
    },
    {
      title: '预警状态',
      slot: 'status',
      minWidth: 100
    },
    {
      title: '预警维度',
      slot: 'scan_target',
      minWidth: 120
    },
    {
      title: '数据维度',
      slot: 'alarm_scan_val_list',
      minWidth: 220
    },
    {
      title: '时间维度',
      slot: 'scan_freq',
      minWidth: 90
    },
    {
      title: '预警规则',
      slot: 'alarm_rule_list',
      minWidth: 200
    },
    {
      title: '规则关系',
      slot: 'rule_type',
      minWidth: 100
    },
    {
      title: '预警次数',
      slot: 'alarm_count',
      minWidth: 90
    },
    {
      title: '预警时间间隔',
      slot: 'alarm_min',
      minWidth: 110
    },
    {
      title: '被提醒人',
      slot: 'alarm_user_list',
      minWidth: 150
    },
    {
      title: '提醒方式',
      slot: 'alarm_type',
      minWidth: 150
    },
    {
      title: '创建人',
      slot: 'creator',
      minWidth: 90
    },
    {
      title: '创建时间',
      slot: 'created_at',
      minWidth: 160
    },
    {
      title: '修改人',
      slot: 'updater',
      minWidth: 90
    },
    {
      title: '修改时间',
      slot: 'updated_at',
      minWidth: 160
    },
    {
      title: '备注',
      slot: 'comment',
      minWidth: 120
    },
    {
      title: '操作',
      slot: 'action',
      minWidth: 120,
      fixed: 'right',
      isHideInColumn: true
    }
  ]
}
/**
 * [预警规则]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getRuleList = (self) => {
  return [
    {key: 24, label: '总广告请求pv', unit: '次', parentId: 1},
    {key: 1, label: '有效广告请求pv', unit: '次', parentId: 1},
    {key: 2, label: '广告返回pv', parentId: 1, unit: '次'},
    {key: 3, label: '广告展现pv', parentId: 1, unit: '次'},
    {key: 4, label: '广告点击pv', parentId: 1, unit: '次'},
    {key: 5, label: '下载完成数', parentId: 1, unit: '次'},
    {key: 6, label: '安装数', parentId: 1, unit: '次'},
    {key: 7, label: '激活数', parentId: 1, unit: '次'},
    {key: 8, label: '调起数', parentId: 1, unit: '次'},

    {key: 9, label: '请求变化率', parentId: 4, unit: '%'},
    {key: 10, label: '展现变化率', parentId: 4, unit: '%'},
    {key: 11, label: '点击变化率', parentId: 4, unit: '%'},
    {key: 12, label: '填充率变化率', parentId: 4, unit: '%'},
    {key: 13, label: '展现率变化率', parentId: 4, unit: '%'},
    {key: 14, label: '点击率变化率', parentId: 4, unit: '%'},

    {key: 15, label: '填充率', parentId: 2, unit: '%'},
    {key: 16, label: '展现率', parentId: 2, unit: '%'},
    {key: 17, label: '点击率', parentId: 2, unit: '%'},

    {key: 18, label: '下载率', parentId: 2, unit: '%'},
    {key: 19, label: '安装率', parentId: 2, unit: '%'},
    {key: 20, label: '激活率', parentId: 2, unit: '%'},
    {key: 21, label: '调起率', parentId: 2, unit: '%'},

    {key: 22, label: '媒体eCPM', parentId: 3, unit: '元'},
    {key: 23, label: '媒体CPC', parentId: 3, unit: '元'}
  ]
}
/**
 * [预警的计算]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getRuleEq = (self) => {
  return [
    {id: 1, label: '小于'},
    {id: 2, label: '等于'},
    {id: 3, label: '大于'},
    {id: 4, label: '小于等于'},
    {id: 5, label: '大于等于'}
  ]
}
/**
 * [预警的计算]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getRuleRate = (self) => {
  return [
    {id: 3, label: '上升'},
    {id: 1, label: '下降'}
  ]
}

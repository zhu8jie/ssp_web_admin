export const role = [
    {
        'home': {
            module_name: '首页',
            module_status: 1,
            module_type: 1,
            module_show: 1
        }
    },
    {
        'traffic': {
            module_name: '流量管理',
            module_status: 1,
            module_type: 1,
            module_show: 1,
            children: [{
                'media-manage': {
                    parent_code: 'traffic',
                    module_status: 1,
                    module_type: 1,
                    module_show: 1,
                    children: ['view', 'modify', 'banned', 'resetPsw', 'resetPsw', 'pseudoLogin']
                }
            }]
        }
    }
]

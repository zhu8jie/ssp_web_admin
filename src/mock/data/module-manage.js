export const moduleManageData = [
    {
        id: 1,
        module_name: '首页',
        rank_weight: 1,
        code: 'home',
        parent_code: null,
        module_API: ['/admin.xingchenjia.com/#/account/moudle1', '/admin.xingchenjia.com/#/account/moudle2'],
        module_status: 1,
        module_type: 1,
        module_show: 1,
        created_time: 1601008281,
        update_time: 1600185600,
        user_name: '管理员'
    },
    {
        id: 2,
        module_name: '流量管理',
        rank_weight: 1,
        code: 'traffic',
        parent_code: null,
        module_API: ['/admin.xingchenjia.com/#/account/moudle1', '/admin.xingchenjia.com/#/account/moudle2'],
        module_status: 0,
        module_type: 0,
        module_show: 0,
        created_time: 1601008281,
        update_time: 1600185600,
        user_name: 'admin',
        children: [
            {
                id: 201,
                module_name: '媒体管理',
                rank_weight: 2,
                code: 'media-manage',
                parent_code: 'traffic',
                module_API: ['/admin.xingchenjia.com/#/account/moudle1', '/admin.xingchenjia.com/#/account/moudle2'],
                module_status: 1,
                module_type: 1,
                module_show: 1,
                created_time: 1601008281,
                update_time: 1600185600,
                user_name: 'admin',
                children: [
                    {
                        id: 20101,
                        module_name: '查看',
                        rank_weight: 2,
                        code: 'view',
                        parent_code: 'media-manage',
                        module_API: ['/admin.xingchenjia.com/#/account/moudle1', '/admin.xingchenjia.com/#/account/moudle2'],
                        module_status: 1,
                        module_type: 0,
                        module_show: 1,
                        created_time: 1601008281,
                        update_time: 1600185600,
                        user_name: '管理员'
                    },
                    {
                        id: 20102,
                        module_name: '封禁',
                        rank_weight: 1,
                        code: 'banned',
                        parent_code: 'media-manage',
                        module_API: ['/admin.xingchenjia.com/#/account/moudle1', '/admin.xingchenjia.com/#/account/moudle2'],
                        module_status: 0,
                        module_type: 1,
                        module_show: 0,
                        created_time: 1601008281,
                        update_time: 1600185600,
                        user_name: '管理员'
                    }
                ]
            }
        ]
    }
]

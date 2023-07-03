/**
 * [人群标签]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getCrowdColumn = (self) => {
    return [
        {
            type: 'index',
            width: 36,
            align: 'center',
        },
        {
            title: '标签code',
            slot: 'code'
        },
        {
            title: '标签名称',
            key: 'name'
        },
        {
            title: '操作',
            slot: 'action',
            width: 60
        }
    ]
}

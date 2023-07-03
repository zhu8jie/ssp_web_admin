<template lang="html">
  <div class="ry-time-sheet">
    <table>
      <tbody id="J_timedSheet"></tbody>
    </table>
  </div>
</template>

<script>
  import '@/assets/js/TimeSheet'

  export default {
    name: 'timeSheet',
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        sheet: null,
        dimensions: [7, 48],
        dayList: [
          { name: '星期一', title: '' },
          { name: '星期二', title: '' },
          { name: '星期三', title: '' },
          { name: '星期四', title: '' },
          { name: '星期五', title: '' },
          { name: '星期六', title: '' },
          { name: '星期日', title: '' }
        ],
        hourList: [
          { name: '00:00', title: '00:00~00:30' },
          { name: '00:30', title: '00:30~01:00' },
          { name: '01:00', title: '01:00~01:30' },
          { name: '01:30', title: '01:30~02:00' },
          { name: '02:00', title: '02:00~02:30' },
          { name: '02:30', title: '02:30~03:00' },
          { name: '03:00', title: '03:00~03:30' },
          { name: '03:30', title: '03:30~04:00' },
          { name: '04:00', title: '04:00~04:30' },
          { name: '04:30', title: '04:30~05:00' },
          { name: '05:00', title: '05:00~05:30' },
          { name: '05:30', title: '05:30~06:00' },
          { name: '06:00', title: '06:00~06:30' },
          { name: '06:30', title: '06:30~07:00' },
          { name: '07:00', title: '07:00~07:30' },
          { name: '07:30', title: '07:30~08:00' },
          { name: '08:00', title: '08:00~08:30' },
          { name: '08:30', title: '08:30~09:00' },
          { name: '09:00', title: '09:00~09:30' },
          { name: '09:30', title: '09:30~10:00' },
          { name: '10:00', title: '10:00~10:30' },
          { name: '10:30', title: '10:30~11:00' },
          { name: '11:00', title: '11:00~11:30' },
          { name: '11:30', title: '11:30~12:00' },
          { name: '12:00', title: '12:00~12:30' },
          { name: '12:30', title: '12:30~13:00' },
          { name: '13:00', title: '13:00~13:30' },
          { name: '13:30', title: '13:30~14:00' },
          { name: '14:00', title: '14:00~14:30' },
          { name: '14:30', title: '14:30~15:00' },
          { name: '15:00', title: '15:00~15:30' },
          { name: '15:30', title: '15:30~16:00' },
          { name: '16:00', title: '16:00~16:30' },
          { name: '16:30', title: '16:30~17:00' },
          { name: '17:00', title: '17:00~17:30' },
          { name: '17:30', title: '17:30~18:00' },
          { name: '18:00', title: '18:00~18:30' },
          { name: '18:30', title: '18:30~19:00' },
          { name: '19:00', title: '19:00~19:30' },
          { name: '19:30', title: '19:30~20:00' },
          { name: '20:00', title: '20:00~20:30' },
          { name: '20:30', title: '20:30~21:00' },
          { name: '21:00', title: '21:00~21:30' },
          { name: '21:30', title: '21:30~22:00' },
          { name: '22:00', title: '22:00~22:30' },
          { name: '22:30', title: '22:30~23:00' },
          { name: '23:00', title: '23:00~23:30' },
          { name: '23:30', title: '23:30~24:00' }

        ]
      }
    },
    created() {
    },
    mounted() {
      let newvaule = this.value.padEnd(336, 0)
      let newarr = this.sliceArray(newvaule, 48)
      this.sheet = $('#J_timedSheet').TimeSheet({
        data: {
          dimensions: this.dimensions,
          colHead: this.hourList,
          rowHead: this.dayList,
          sheetHead: { name: '星期/时间' },
          sheetData: newarr,
          thColspan: 24,
          tdColspan: 2
        },
        remarks: false,
        end: (ev, selectedArea) => {
          this.updateRemark(this.sheet)
        }
      })
      this.updateRemark(this.sheet)
    },
    methods: {
      updateRemark(sheet) {
        let sheetStates = sheet.getSheetStates().flat()
        let newSheetStates = sheetStates.join('')
        this.$emit('input', newSheetStates)
      },
      sliceArray(arr, size) {
        var arr2 = []
        for (var i = 0; i < arr.length; i = i + size) {
          arr2.push(arr.slice(i, i + size).split(''))
          }
        return arr2
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "./index.less";
</style>

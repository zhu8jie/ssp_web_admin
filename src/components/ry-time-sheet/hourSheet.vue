<template lang="html">
  <div class="ry-time-sheet">
    <table>
      <tbody :id="ids"></tbody>
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
      },
      timeDefault: {
        type: String,
        default: ''
      },
      id: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        ids: null,
        sheet: null,
        dimensions: [1, 24],
        dayList: [
          {name: '选择区', title: ''}
        ],
        hourList: [
          {name: '00:00', title: '00:00~01:00'},
          {name: '01:00', title: '01:00~02:00'},
          {name: '02:00', title: '02:00~03:00'},
          {name: '03:00', title: '03:00~04:00'},
          {name: '04:00', title: '04:00~05:00'},
          {name: '05:00', title: '05:00~06:00'},
          {name: '06:00', title: '06:00~07:00'},
          {name: '07:00', title: '07:00~08:00'},
          {name: '08:00', title: '08:00~09:00'},
          {name: '09:00', title: '09:00~10:00'},
          {name: '10:00', title: '10:00~11:00'},
          {name: '11:00', title: '11:00~12:00'},
          {name: '12:00', title: '12:00~13:00'},
          {name: '13:00', title: '13:00~14:00'},
          {name: '14:00', title: '14:00~15:00'},
          {name: '15:00', title: '15:00~16:00'},
          {name: '16:00', title: '16:00~17:00'},
          {name: '17:00', title: '17:00~18:00'},
          {name: '18:00', title: '18:00~19:00'},
          {name: '19:00', title: '19:00~20:00'},
          {name: '20:00', title: '20:00~21:00'},
          {name: '21:00', title: '21:00~22:00'},
          {name: '22:00', title: '22:00~23:00'},
          {name: '23:00', title: '23:00~24:00'}
        ],
        listValue: this.value
      }
    },
    created() {
    },
    mounted() {
      let newvaule = this.listValue.padEnd(24, 0)
      let newarr = this.sliceArray(newvaule, 24)
      this.sheet = $('#' + this.ids).TimeSheet({
        data: {
          dimensions: this.dimensions,
          colHead: this.hourList,
          rowHead: this.dayList,
          sheetHead: {name: '小时'},
          sheetData: newarr,
          thColspan: 12,
          tdColspan: 1
        },
        remarks: false,
        end: (ev, selectedArea) => {
          this.updateRemark(this.sheet)
        }
      })
    },
    create() {
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
    },
    watch: {
      id: {
        immediate: true,
        handler: function (v) {
          if (v) {
            this.ids = v
          }
        }
      },
		value: {
			immediate: true,
			handler: function (v) {
				if (v) {
					this.$nextTick(function () {
						let newvaule = v.padEnd(24, 0)
						let newarr = this.sliceArray(newvaule, 24)
						this.sheet = $('#' + this.ids).TimeSheet({
							data: {
								dimensions: this.dimensions,
								colHead: this.hourList,
								rowHead: this.dayList,
								sheetHead: {name: '小时'},
								sheetData: newarr,
								thColspan: 12,
								tdColspan: 1
							},
							remarks: false,
							end: (ev, selectedArea) => {
								this.updateRemark(this.sheet)
							}
						})
					})
				}
			},
		}
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "./index.less";
  .TimeSheet td {
    min-width: 24px;
    height: 36px;
  }
</style>

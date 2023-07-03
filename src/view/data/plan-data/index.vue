
<template>
  <div class="page-main">
    <!-- 日报表 -->
    <play-day v-show="navType === 'day'" ref="playDay">
      <div class="group_radio" slot="tab">
        <RadioGroup v-model="navType" type="button">
          <Radio label="day">日数据</Radio>
          <Radio label="hour">小时数据</Radio>
        </RadioGroup>
      </div>
    </play-day>
    <!-- 小时报表 -->
    <play-hour v-show="navType === 'hour'" ref="playHour">
      <div class="group_radio" slot="tab">
      <RadioGroup v-model="navType" type="button">
        <Radio label="day">日数据</Radio>
        <Radio label="hour">小时数据</Radio>
      </RadioGroup>
      </div>
    </play-hour>
  </div>
</template>

<script>
  import {showTitle} from '@/libs/util'
  import playDay from './play-day/index'
  import playHour from './play-hour/index'
  export default {
    components: { playDay, playHour },
    data() {
      return {
        navType: 'day' // 报表类型， 默认天
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      }
    }
  }
</script>


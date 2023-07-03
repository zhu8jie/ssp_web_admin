import {mapActions} from 'vuex'

export const commonConfig = {
  data() {
    return {
      provinceCityList: [], // 城市的选择
      phoneBrandList: [] // 手机品牌
    }
  },
  created() {
    this._getProvinceCityApi() // 获取城市
    this._getPhoneBrand() // 获取手机品牌
  },
  computed: {
  },
  methods: {
    ...mapActions([
      'getProvinceCityApi',
      'getPhoneBrand'
    ]),
    /**
     * [_getProvinceCityApi 获取城市]
     * @return {[type]} [description]
     */
    async _getProvinceCityApi() {
      let storeUser = this.$store.state.user
      let resArr = storeUser.provinceCityArr.length ? storeUser.provinceCityArr : await this.getProvinceCityApi()

      this.provinceCityList = resArr
    },
    /**
     * [_getPhoneBrand 获取手机品牌]
     * @return {[type]} [description]
     */
    async _getPhoneBrand() {
      let storeUser = this.$store.state.user
      let resArr = storeUser.phoneBrandArr.length ? storeUser.phoneBrandArr : await this.getPhoneBrand()

      this.phoneBrandList = resArr
    }
  }
}

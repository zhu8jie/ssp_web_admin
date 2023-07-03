<template>
	<div class="upload-image" :style="{width: widthVal+'px', height: heightVal+'px'}">
		<Upload
			:action="actionUrl"
			:ref="refName"
			:format="format"
			:max-size="bit"
			v-show="!value && !loading"
			:data="{type: formDataType}"
			:show-upload-list="false"
			:on-exceeded-size="handleMaxSize"
			:before-upload="handleBeforeUpload"
		>
			<div :id="'uploadAgain'+idVal" class="logo-upload" :style="{width: widthVal+'px', height: heightVal+'px'}">
				<slot></slot>
			</div>
		</Upload>
		<div class="logo-image" :style="{width: widthVal+'px', height: heightVal+'px',lineHeight:heightVal + 'px'}" v-show="value || loading">
			<img :src="value" v-if="value && formDataType === 2" class="ry-align-center" :style="{maxWidth: widthVal-2+'px', maxHeight: heightVal-2 +'px'}">

			<video :src="value" v-if="value && formDataType === 3" controls="controls" class="ry-align-center" :style="{maxWidth: widthVal-2+'px', maxHeight: heightVal-2 +'px'}">
					您的浏览器不支持 video 标签。
			</video>

			<div class="cover" :style="{width: widthVal+'px', height: heightVal+'px',lineHeight:heightVal+'px' }" :class="{'is-edit': disEdit, 'cover-isupload': loading}">
				<div class="cover_content" :style="{width: widthVal+'px', height: heightVal+'px'}">
					<div class="left">
						<div class="tipContent" @click="modelShow">
							<i class="icon icon-zoom-up" />
							<p>放大查看</p>
						</div>
					</div>
					<div class="right">
						<div class="tipContent" @click="removeUpload">
							<i class="icon icon-upload" />
							<p>重新上传</p>
						</div>
					</div>
				</div>
			</div>
			 <!-- v-if="loading" -->
			<Spin fix class="spin-fix" v-if="loading">
				<Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                <div>上传中...</div>
			</Spin>
		</div>
		<Modal v-model="uploadImgModel" class="mediaModal" :width="935" class-name="vertical-center-modal">
			<div class="img_content">
				<img :src="value" v-if="value && formDataType === 2"/>
				<video :src="value" v-if="value && formDataType === 3" controls="controls">
					您的浏览器不支持 video 标签。
				</video>
			</div>
			<div slot="footer"></div>
		</Modal>
	</div>
</template>

<script>

import { fileReader2Promise } from '@/libs/tools'
import { uploadFile, uploadFileUrl } from '@/api/common'
export default {
	props: {
		index: Number, // 索引，只在数组形式下可用
		refName: String, // 组件自定义名字
		value: String, // 反显value值
		idVal: { // id 用于处理页面里多处使用问题
			type: Number,
			required: true
		},
		widthVal: { // 组件的宽度
			type: Number,
			default: 60 // 默认60宽
		},
		heightVal: { // 组件的高度
			type: Number,
			default: 60
		},
		disEdit: { // 是否可编辑
			type: Boolean,
			default: false
		},
		bit: { // 素材大小 KB
			type: Number,
			default: 5 * 1024 // 默认5M
		},
		formDataType: { // 上传类型， 默认图片 2
			type: Number,
			default: 2
		},
		format: { // 上传的format类型， 必须小写
			type: Array,
			default: function() {
				return ['jpg','jpeg','png']
			}
		},
		width: Number, // 素材宽度
		height: Number, // 素材高度
		isCalcErrorRatio: false, // 是否计算图片尺寸容错率
		errorRate: {// 容错率, 默认为5
			type: Number,
			default: 5
		},
		errorRatio: { // 容错比例, 默认1"1
			type: String,
			default: '1:1'
		},
		ratio: String, // 素材比例  例如 1:1 ,3:2
		minWidth: Number, // 最小宽度
		maxWidth: Number, // 最大高度
	},
	data() {
		return {
			actionUrl: uploadFileUrl,
			loading: false,
			uploadList: [],
			uploadImgModel: false,
			uploadImgUrl: ''
		}
	},
	watch: {
		uploadList(val) {
			if (val.length > 0) {
				this.uploadPublic()
			}
		}
	},
	methods: {
		removeUpload(field) {
			const sub = document.getElementById('uploadAgain' + this.idVal)
			sub.click()
			// !this.disEdit && this.$emit('input', undefined)
		},
		uploadPublic() { // 图片、视频公共批量上传
			let formData = new FormData()
			for (let i = 0; i < this.uploadList.length; i++) {
				formData.append('files', this.uploadList[i]) // 文件对象
			}
			formData.append('type', this.formDataType)

			this.loading = true

			uploadFile(formData).then(res => {
				let date = res
				if (date.code === 200) {
					this.source_id = []
					this.$Message.success('上传成功')
					let imgUrl = date.data.host + date.data.url[0]

					date.data && this.$emit('input', imgUrl)
				} else {
					this.loading = false
					this.$Message.error(date.msg)
				}

				this.uploadList = []
				this.loading = false
			}).catch(error => {
				this.uploadList = []
				this.loading = false
				this.$Message.error(error)
			})
		},
		/**
		 * [handleFormatError 文件格式校验]
		 * @return {[type]} [description]
		 */
		handleFormatError() {
			this.$Message.warning('图片格式错误')
			this.loading = false
		},
		/**
		 * [handleMaxSize 文件大小校验]
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
		handleMaxSize(file) {
			// this.$Message.warning('超过文件大小限制')
		},
		/**
		 * [handleBeforeUpload 图片上传之前]
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
		handleBeforeUpload(file) {

			this.uploadList = []

			// 图片上传
			if (this.formDataType === 2) {

				fileReader2Promise(file).then(res => {
					if (res) {
						console.log(res)
						let bitFlag = this.checkMaxBit(res.bit) // 检查文件大小 ,kb单位
						let minWidthFlag = this.checkMinWidth(res.width) // 检查最小宽度
						let maxWidthFlag = this.checkMaxWidth(res.width) // 检查最大宽度
						let typeFlag = this.checkFormat(res.type) // 检验文件类型
						let ratioFlag = this.checkErrorRatio(res.width, res.height) // 容错比
						let whRadioFlag = this.checkW2HRatio(res.width, res.height) // 只检测图片宽高比，不校容错

						if (bitFlag && typeFlag && ratioFlag && minWidthFlag && maxWidthFlag && whRadioFlag) {
							this.uploadList.push(file)
						}

					} else {
						this.$Message.error({content: '图片读取错误' , duration: 3})
					}
				}, err=> {
					this.$Message.error({content: '格式错误' , duration: 3})
				})

			} else if (this.formDataType === 3) { // 视频
				let type = file.type && file.type.indexOf('/') ? file.type.split('/')[1].toLowerCase() : ''

				let bitFlag = this.checkMaxBit(file.size) // 检查文件大小 ,kb单位
				let typeFlag = this.checkFormat(type) // 检验文件类型

				if(bitFlag && typeFlag) {
					this.uploadList.push(file)
				}
			}

			return false
		},
		/**
		 * [checkMaxBite 校验大小]
		 * return true / false
		 * @return {[type]} [description]
		 */
		checkMaxBit(bit) {

			if ((bit / 1000) > this.bit) {
				this.$Message.error({
					content: '超过文件大小限制',
					duration: 3
				})
				return false
			}

			return true
		},
		/**
		 * [checkFormat 校验文件类型, 必须满足]
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		checkFormat(type) {
			if (!this.format.includes(type)) {
				this.$Message.error({
					content: '格式错误',
					duration: 3
				})
				return false
			}

			return true
		},

		/**
		 * [checkMinWidth 校验最小宽度]
		 * @param  {[type]} width [description]
		 * @return {[type]}       [description]
		 */
		checkMinWidth(width) {
			// console.log(`最小宽度${this.minWidth}`)
			// console.log(`实际宽度${width}`)
			if (this.minWidth && width < this.minWidth) {
				this.$Message.error({
					content: '图片小于规定尺寸',
					duration: 3
				})
				return false
			}

			return true
		},

		/**
		 * [checkMaxWidth 校验最大尺寸]
		 * @param  {[type]} width [description]
		 * @return {[type]}       [description]
		 */
		checkMaxWidth(width) {
			if (this.maxWidth && width > this.maxWidth) {
				this.$Message.error({
					content: '图片大于规定尺寸',
					duration: 3
				})
				return false
			}

			return true
		},

		/**
		 * [checkW2HRatio 只校验图片宽高比]
		 * @return {[type]} [description]
		 */
		checkW2HRatio(width, height) {
			if (!this.isCalcErrorRatio && !!this.ratio) {

				let _arr = this.ratio.split(':')

				let _w = Number(_arr[0]) // 容错比例 宽
				let _h = Number(_arr[1]) // 容错比例 高

				if (width / height !== _w / _h) {
					this.$Message.error({
						content: '图片尺寸不符合规格',
						duration: 3
					})
					return false
				}
			}

			return true
		},

		/**
		 * [checkErrorRatio 校验尺寸容错率]
		 * @param  {[type]} ratio [description]
		 * @return {[type]}       [description]
		 */
		checkErrorRatio(width, height) {

			if (this.isCalcErrorRatio) {
				let _arr = this.errorRatio.split(':')

				let _w = Number(_arr[0]) // 容错比例 宽
				let _h = Number(_arr[1]) // 容错比例 高

				let needR = _w / _h
				let curtR = width / height

				let abs = Math.abs(needR - curtR) * 100

				if (parseInt(abs) > this.errorRate) {
					this.$Message.error({
						content: '图片尺寸不符合规格',
						duration: 3
					})
					return false
				}
			}

			return true
		},
		modelShow() {
			this.uploadImgModel = true
		}
	}
}
</script>
<style lang="stylus">
.mediaModal{
	.img_content {
		width 895px
		height 556px
		margin 0 auto
		text-align center
		line-height 400px
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-direction: column;
		img, video {
			text-align center
			max-width 400px
			max-height 400px
			vertical-align middle
		}
	}
	.ivu-modal-footer {
		border 0px;
		padding 0px
	}
}
</style>

<style lang="stylus" scoped>
@import './index.styl';
.demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
.spin-fix
	line-height: 2
</style>

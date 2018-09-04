<template>
	<div>
		<mt-tab-container v-model="selected" :swipeable="false" :value="selected">
			<mt-tab-container-item id="书架">
				<!-- <mt-header fixed :title="selected" class="book_shelf_header"></mt-header> -->
				<Bookshelf class="tab-container" :epub-data="epubData" v-if=""></Bookshelf>
				<!-- <epub></epub> -->
			</mt-tab-container-item>
		</mt-tab-container>
		
		<!-- 原footer 现隐藏 -->
		<mt-tabbar v-model="selected" class="footer" :fixed="true" :value="selected">
			<!-- <mt-tab-item id="书架">
				<img slot="icon" src="../assets/book.svg"> 书架
			</mt-tab-item> -->
			<!-- <mt-tab-item id="背景">
				<img slot="icon" src="../assets/setting.svg"> 背景
			</mt-tab-item> -->
			<!-- <mt-tab-item id="字体">
				<img slot="icon" src="../assets/font.svg"> 字体
			</mt-tab-item>
			<mt-tab-item id="我的">
				<img slot="icon" src="../assets/my.svg"> 我的
			</mt-tab-item> -->
		</mt-tabbar>
	</div>
</template>

<script>
import Bookshelf from './bookshelf/Bookshelf'
// import Bookcategory from './category/Bookcategory'
// import Ranklist from './ranklist/Rank'
// import Search from './search/Search'

export default {
  name: 'home',
  components: {

		Bookshelf,
    // Bookcategory,
    // Ranklist,
    // Search
  },
  data () {
    return {
			epubData:{
				url:'http://aqrv2.kingchannels.cn/files/encrypted/dcd/9ac84e4d2ab84388bb9efa382475e6b9_0_40767_encrypted.epub.txt.web.epub',
				PackageBaseUrl:'http://aqrv2.kingchannels.cn/files/encrypted/dcd/9ac84e4d2ab84388bb9efa382475e6b9_0_40767_encrypted_epub',
				realKey:'gf_OuRXuZ9o1NikG',
				AllowReadPercentage:0.6
			},
      selected: '书架'
    }
  },
  methods: {
    changeSelected (data) {
      this.selected = data
		}
  },
  mounted () {
    this.selected = this.$store.state.previousPosition
  }
}
</script>

<style lang="less" scoped>
.tab-container {
	width:100vw;
	height:100vh;
	display: flex;
	justify-content: center;
	align-items: center;
}

</style>

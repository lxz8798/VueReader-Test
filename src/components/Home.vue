<template>
	<div>
		<mt-tab-container v-model="selected" :swipeable="false" :value="selected">
			<mt-tab-container-item id="书架">
				<!-- <mt-header fixed :title="selected" class="book_shelf_header"></mt-header> -->
				<Bookshelf class="tab-container" :epub-data="epubData" v-if="epubDataFlag ? false : true"></Bookshelf>
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
			epubDataFlag:false,
			epubData:{
				url:'http://218.249.32.238/files/encrypted/1ec/06c664d19e824d938bdb4b47a5fa3773_0_10694_encrypted.epub.txt.web.epub',
				PackageBaseUrl:'http://218.249.32.238/files/encrypted/1ec/06c664d19e824d938bdb4b47a5fa3773_0_10694_encrypted_epub',
				realKey:'FVzcea1prATKE!pi',
				AllowReadPercentage:0.1
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

<template>
	<div>
		<mt-tab-container v-model="selected" :swipeable="false" :value="selected">
			<mt-tab-container-item id="书架">
				<mt-header fixed :title="selected" style="position: fixed; z-index:1; top:0;"></mt-header>
				<Bookshelf class="tab-container" @addBook="changeSelected"></Bookshelf>
			</mt-tab-container-item>
			<mt-tab-container-item id="背景">
				<mt-header fixed :title="selected"></mt-header>
				<keep-alive include="Bookshelf">
					<Bookcategory class="tab-container"></Bookcategory>
				</keep-alive>
			</mt-tab-container-item>
			<mt-tab-container-item id="字体">
				<mt-header fixed :title="selected"></mt-header>
				<keep-alive include="Rank">
					<Ranklist class="tab-container"></Ranklist>
				</keep-alive>
			</mt-tab-container-item>
			<mt-tab-container-item id="我的">
				<Search></Search>
			</mt-tab-container-item>
		</mt-tab-container>
		<!-- 原footer 现隐藏 -->
		<!-- <mt-tabbar v-model="selected" :fixed="true" :value="selected">
			<mt-tab-item id="书架">
				<img slot="icon" src="../assets/book.svg"> 书架
			</mt-tab-item>
			<mt-tab-item id="背景">
				<img slot="icon" src="../assets/setting.svg"> 背景
			</mt-tab-item>
			<mt-tab-item id="字体">
				<img slot="icon" src="../assets/font.svg"> 字体
			</mt-tab-item>
			<mt-tab-item id="我的">
				<img slot="icon" src="../assets/my.svg"> 我的
			</mt-tab-item>
		</mt-tabbar> -->
	</div>
</template>

<script>
import Bookshelf from './bookshelf/Bookshelf'
import Bookcategory from './category/Bookcategory'
import Ranklist from './ranklist/Rank'
import Search from './search/Search'

export default {
  name: 'home',
  components: {
    Bookshelf,
    Bookcategory,
    Ranklist,
    Search
  },
  data () {
    return {
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

<style scoped>
.tab-container {
	box-sizing: border-box;
	padding-top: 2rem;
	padding-bottom: 55px;
	width: 100vw;
	min-height: 100vh;
}
</style>

<template>
	<div>
    <div id="ePubArea"></div>
    <div class="epub-btn-wrap">
      <div id="ePubPrev">上一页</div>
      <div id="ePubNext">下一页</div>
    </div>

    <!-- 我的书架(原) -->
		<!-- <mt-button type="primary" class="add-book" v-if="!books.length" @click="$emit('addBook','分类')">添加小说</mt-button>
		<ul class="book-shelf" v-if="books.length">
			<v-touch tag="li" class="book-list-wrap" v-for="(book, index) in books" :key="index" @swipeleft="showDelBookBtn" @swiperight="hideDelBookBtn">
				<v-touch class="book-list" @tap="readbook(book)">
					<div class="read-book-history">
						<img :src="book.cover">
						<div class="info">
							<p class="title">{{book.title}}</p>
              <p>{{book.lastChapter}}</p>
							<p class="updated">{{book.updated}}</p>
						</div>
					</div>
					<v-touch class="del-book-btn" @tap="delBook($event,index)">删除</v-touch>
				</v-touch>
			</v-touch>
		</ul> -->
	</div>
</template>

<script>
import api from '@/api/api'
import moment from 'moment'
import util from '@/utils/util'
import { SET_EPUB_BOOK,SET_CURRENT_SOURCE, SET_READ_BOOK } from '@/store/mutationsType'
import { Indicator } from 'mint-ui'

moment.locale('zh-cn')
export default {
  name: 'Bookshelf',
  data () {
    return {
      books: []
    }
  },
  filters: {
    /**
    * 使用moment格式化时间
    */
    ago (time) {
      return moment(time).fromNow()
    }
  },
  created () {
    this.getBookUpdate()
  },
  mounted () {
    this.getePub()
    this.epubLoad()
  },
  methods: {
    /**
     * load
     */
    epubLoad () {
      
      let _that,_book,_rendition,_displayed,_prev,_next,_cfi,_key,_stored,_toc
     
      _book = ePub("../../../static/epub/test.epub")

      _rendition = _book.renderTo("ePubArea",{
        width: "100vw",
        height: 600
      })

      _displayed = _rendition.display();

      _next = document.getElementById("ePubNext");
      _next.addEventListener("click", function(e){
        _rendition.next();
      }, false);

      _prev = document.getElementById("ePubPrev");
      _prev.addEventListener("click", function(e){
        _rendition.prev();
      }, false);
      
      _book.ready.then(res => {
        Indicator.close()
        _key = _book.key()+'-locations';
        _stored = localStorage.getItem(_key);
        
        if (_stored) {
				 return _book.locations.load(_stored);
        } else {
          return _book.locations.generate(1600);
        }
      })
      .then(locations => {
        // console.log(locations,'locations')
      })
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext () {
      // this.$store.state.ePubBook.nextPage()
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev () {
      // this.$store.state.ePubBook.prevPage()
    },
    /**
     * 拿到epub渲染
     * @author 李啸竹
     */
    getePub () {
      let _that,_book,_rendition
      // _that.$store.commit(SET_EPUB_BOOK,'http://cabpv2.api.kingchannels.cn/files/upload/000/santi.epub',{restore:true});
      // _tempStore.state.ePubBook.renderTo("ePubArea", {width: 80, height: 120});
    },
    /**
    * 返回追更新的书本id
    * @author 李啸竹
    */
    getBookList () {
      let localShelf = util.getLocalStroageData('followBookList')
      let bookListArray = []
      for (let bookId in localShelf) {
        bookListArray.push(bookId)
      }
      return bookListArray
    },

    getBookUpdate () {
      let localShelf,
        that = this
      Indicator.open()
      api.getUpdate(this.getBookList()).then(response => {
        for (let i in response) {
          localShelf = util.getLocalStroageData('followBookList')
          response[i].then(book => {
            Object.assign(book.data, localShelf[book._id])
            book.data.cover = util.staticPath + book.data.cover
            that.books.push(book.data)

            Indicator.close()
          })
        }
      })
    },

    readbook (book) {
      this.$store.commit(SET_READ_BOOK, book)
      this.$store.commit(SET_CURRENT_SOURCE, book.source)
      this.$router.push('/readbook/' + book._id)
    },

    showDelBookBtn (e) {
      let target = e.target.parentElement
      while (target.className !== 'book-list') {
        target = target.parentElement
      }
      target.style.left = '-44vw'
    },

    hideDelBookBtn (e) {
      let target = e.target.parentElement
      while (target.className !== 'book-list') {
        target = target.parentElement
      }
      target.style.left = '0'
    },

    delBook ($event, index) {
      let storage = window.localStorage
      let localShelf = JSON.parse(storage.getItem('followBookList')) ? JSON.parse(storage.getItem('followBookList')) : {}
      // 删除该书籍在本地的缓存记录
      delete localShelf[this.books[index]._id]
      this.books.splice(index, 1)
      // 重新保存
      storage.setItem('followBookList', JSON.stringify(localShelf))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
div#ePubArea {
  position: relative;
  z-index: 1;
}
div.epub-btn-wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  position: relative;
  z-index: 99;
  div#ePubPrev,div#ePubNext {

  }
}

.add-book {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.add-book:focus {
	outline: none;
}

.book-shelf {
	width: 100vw;
	overflow: hidden;
	box-sizing: border-box;
	padding: .5rem 0 0 .5rem;
}

.book-list-wrap {
	position: relative;
	height: 5rem;
	margin-bottom: .2rem;
}

.book-list {
	position: absolute;
	left: 0;
	width: 140vw;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-bottom: .2rem;
}

.book-list img {
	width:70px;
  height:100px;
	float: left;
	margin-right: .4rem;
}

.info {
	display: flex;
	flex-direction: column;
	justify-content: center;
	box-sizing: border-box;
	width: 65%;
	height: 5rem;
	margin-left: .6rem;
	border-bottom: 1px solid #f2f2f2;
}

.info p {
	margin-top: .2rem;
	margin-bottom: .2rem;
}

.updated {
	color: #6d6666;
	font-size: .8rem;
}

.del-book-btn {
	color: #fff;
	background: red;
	width: 40vw;
	line-height: 5rem;
	text-align: center;
}

.read-book-history {
	display: flex;
	width: 100vw;
}
</style>

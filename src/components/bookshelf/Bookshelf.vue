<template>
	<div>
    <div @click="ePubPrev()">上一页</div>
    <div id="ePubArea"></div>
    <div @click="ePubNext()">下一页</div>
    
		<mt-button type="primary" class="add-book" v-if="!books.length" @click="$emit('addBook','分类')">添加小说</mt-button>
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
		</ul>
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
    // this.getTocFn()
    this.epubLoad()
  },
  methods: {
    /**
     * load
     */
    epubLoad () {
      let _that,_book,_rendition,_displayed
      _book = ePub("../../../static/epub/test.epub")
      _rendition = _book.renderTo("ePubArea",{
        width:"80%",
        height:400
      })
      
      console.log(_book)
    },
    /**
     * 获取epub目录
     * @author 李啸竹
     */
    getTocFn () {
      // let _temp = ePub('../../../static/epub/test.epub')
      // let _ePub = _temp.renderTo("ePubArea", {width: 800, height: 1200});
      // chapter2.xhtml#A1e1689fb-c547-496f-8c05-f8be721e2265
      let _that,_book,_rendition,_displayed
      
      _that = this
      // a = document.getElementById('ePubArea')
      _book = ePub('http://demo.cabpv2.api.kingchannels.cn/files/upload/test.epub')
      _rendition = _book.renderTo("ePubArea", {
        width: "80%", 
        height: 300
      });
      _displayed = _rendition.display();

      _book.ready.then(() => {
        let key = _book.key()+'-locations';
        let stored = localStorage.getItem(key);
        if (stored) {
          return _book.locations.load(stored);
        } else {
          // Or generate the locations on the fly
          // Can pass an option number of chars to break sections by
          // default is 150 chars
          return _book.locations.generate(1600);
        }
      })
      .then(locations => {
        localStorage.setItem(_book.key()+'-locations', _book.locations.save());
      })
      console.log(_book)
      // Book.ready.then((res) => {
      //   Book.getRange("epubcfi(/6/14[xchapter_001]!/4/2,/2/2/2[c001s0000]/1:0,/8/2[c001p0003]/1:663)").then(function(range) {
      //     let text = range.toString()
      //     console.log(res);
      //   });
      // })
      
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext () {
      this.$store.state.ePubBook.nextPage()
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev () {
      this.$store.state.ePubBook.prevPage()
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
<style scoped>
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

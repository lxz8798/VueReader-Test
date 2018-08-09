<template>
	<div class="epub-index-wrap">
    <div id="touch-wrap">
        <v-touch class="l" @tap="ePubPrev()" @swipeleft="ePubPrev()"></v-touch>
        <v-touch class="c" id="touch-center" @tap="ifClickHidden()"></v-touch>
        <v-touch class="r" @tap="ePubNext()" @swipeleft="ePubNext()"></v-touch>
    </div>
    <div id="ePubArea"></div>
    
    
    <div id="toc-wrap">
      <ul id="toc"></ul>
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
import aes from '@/utils/aes'
import { SET_EPUB_BOOK,SET_CURRENT_SOURCE, SET_READ_BOOK } from '@/store/mutationsType'
import { Indicator } from 'mint-ui'

moment.locale('zh-cn')
export default {
  name: 'Bookshelf',
  data () {
    return {
      books: [],
      rendition:{},
      ifHiddenFlag:true,
      displayed:'',
      epubText:''
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
    this.epubLoad()
    // this.testAES()
    // this.clickHidden();
  },
  methods: {
    
    ifClickHidden(){
      let _that,_ul,_header,_ePubPrev,_ePubNext

      _that = this
      _that.ifHiddenFlag = !_that.ifHiddenFlag

      _ul = document.getElementById('toc-wrap')
      _header = document.getElementsByClassName('mint-header')[0]
      _ePubNext = document.getElementById('ePubNext')
      _ePubPrev = document.getElementById('ePubPrev')

      if (_that.ifHiddenFlag) {
        _ul.classList.add('boxHidden')
        _header.style.transform = "translateY(-100%)"
        _header.style.transition = "all .3s ease-out"
      } else {
        _ul.classList.remove('boxHidden')
        _header.style.transform = "translateY(0)"
        _header.style.transition = "all .3s ease-in"
      }
      
    },
    
    /**
     * 载入 epub
     */
    epubLoad () {
      
      let _that,_Store,_key,_stored,_ul,_Uint8Array
      
      _that = this
      _Store = _that.$store

      // _Store.commit(SET_EPUB_BOOK,'http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub')
      // _Store.commit(SET_EPUB_BOOK,'http://demo.cabpv2.api.kingchannels.cn/files/test/源文件.epub')
      _Store.commit(SET_EPUB_BOOK,'http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub')

      _that.rendition = _Store.state.ePubBook.renderTo("ePubArea",{width: "100vw"})
      _that.displayed = _that.rendition.display()

      // _that.rendition.hooks.render.register(contents => { 
        
      //   // let _tempHTML = document.getElementById('ePubArea')[0]
      //   // _that.displayed = _that.rendition.display('chapter14.xhtml#Ac44c5814-9e83-47e0-b00f-03c913cab8b9')
      //   console.log(contents)
      // });

      // console.log(_Store.state.ePubBook,'_Store.state.ePubBook')
      _Store.state.ePubBook.ready.then(res => {
        
        if (_Store.state.ePubBook.archive) {
          
          _Uint8Array =  _Store.state.ePubBook.archive.zip.files["OPS/chapter14.xhtml"]._data.compressedContent.buffer
          // let _temp = new Int8Array(_Uint8Array)
          let _temp = new Uint16Array([19280, 1027, 20, 0, 8, 34951, 18806, 24943, 11435, 22, 0, 20, 0, 8, 0, 26989, 25965, 31092, 25968, 11339, 51240, 19657, 11342, 52425])
          // _temp2通过解析方法转成WordArray,返回未命名的words
          let _temp4 = aes.Uint8ArrayToString(_temp)
          // _temp2通过CryptoJS转WordArray,返回WordArray.init的words
          // let _temp2 = aes.encrypt(_temp,"^4fSY0aUwPl8%Buv")
          // 通过encript转成base64
          // let _temp2 = aes.encrypt('我去我去框架在klsadddddddlckasklcd<html><div>sadncakjcn</div><html>','^4fSY0aUwPl8%Buv')
          // 通过btoa转成base64，这是还是2进制
          // let _temp3 = aes.decrypt(_temp2,'^4fSY0aUwPl8%Buv')
          // console.log(_Uint8Array,'_Uint8Array')
          console.log(_temp,'Int8Array')
          // console.log(_temp2,'encrypt')
          console.log(_temp4,'Int8parse')
          // console.log(_temp3,'decrypt')
        }
      })

      // book.spine.hooks.serialize // Section is being converted to text
      // book.spine.hooks.content // Section has been loaded and parsed
      // rendition.hooks.render // Section is rendered to the screen
      // rendition.hooks.content // Section contents have been loaded
      // rendition.hooks.unloaded // Section contents are being unloaded
      
      // _Store.state.ePubBook.ready.then(books => {
      //   let meta = _Store.state.ePubBook.package.metadata; // Metadata from the package json
      //   let toc = _Store.state.ePubBook.navigation.toc; // Table of Contents
      //   let landmarks = _Store.state.ePubBook.navigation.landmarks; // landmarks
      //   let spine = _Store.state.ePubBook.spine; // landmarks
      //   let cover = _Store.state.ePubBook.cover; // landmarks
      //   let resources = _Store.state.ePubBook.resources; // landmarks
      //   let pageList = _Store.state.ePubBook.pageList; // page list (if present)

      //   _Store.state.ePubBook.loaded.manifest.then((manifest) => { console.log(manifest) });
      //   _Store.state.ePubBook.loaded.spine.then((spine) => { console.log(spine) });
      //   _Store.state.ePubBook.loaded.metadata.then((metadata) => { console.log(metadata) });
      //   _Store.state.ePubBook.loaded.cover.then((cover) => { console.log(cover) });
      //   _Store.state.ePubBook.loaded.navigation.then((navigation) => { console.log(navigation) });
      //   _Store.state.ePubBook.loaded.resources.then((resources) => { console.log(resources) });
      // })

      _Store.state.ePubBook.ready.then(res => {
        Indicator.close()
        _key = _Store.state.ePubBook.key()+'-locations';
        _stored = localStorage.getItem(_key);
        // console.log(res,'res')
        if (_stored) {
				 return _Store.state.ePubBook.locations.load(_stored);
        } else {
          return _Store.state.ePubBook.locations.generate(1600);
        }
      })
      .then(locationsCfi => {
        // console.log(locationsCfi,'locationsCfi')
      })

      // _that.rendition.on("relocated", function(location){
      //   console.log(location,'asdc');
      // });
      // _Store.state.ePubBook.loaded.navigation.then(function(toc){
      //   console.log(toc)
      // })
      //目录
      _Store.state.ePubBook.loaded.navigation.then(getToc => {
         
        let _ul = document.getElementById('toc'),
            _docfrag = document.createDocumentFragment()
        // console.log(getToc.parse(),'getToc.get()')
        getToc.toc.forEach((chapter,index) => {
          console.log(chapter,'console.log(chapter)') 
          //新建li标签
          let _item = document.createElement("li"),
          //新建a标签
          _link = document.createElement("a")
          //给a标签添加id名
          _link.id = "chap-" + chapter.id
          //给a标签添加label
          _link.textContent = chapter.label
          //把chapter的链接赋值给a标签
          _link.href = chapter.href
          //添加到li里
          _item.appendChild(_link)
          _docfrag.appendChild(_item)
          _link.onclick = function () {
            let _url = _link.getAttribute("href");
            _that.rendition.display(_url)
            return false
          }
        })
        _ul.appendChild(_docfrag)
      })
      //默认样式
      _that.rendition.themes.default({
        img:{
          'width':'100% !important'
        },
        h2: {
        'font-size': '32px',
        color: 'purple'
        },
        p: {
          "margin": '10px'
        }
      })
      // console.log(_Store.state.ePubBook,'_Store.state.ePubBook')
    },
    testAES () {
      
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext () {     
      this.rendition.next()
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev () {
      this.rendition.prev();
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
div.epub-index-wrap {
  .headerHidden {
    background: #000;
    // transform: translateY(100%);
    // transition: all .3s ease-out;
  }
  div.boxHidden {
    transform: translateX(100%);
    transition: all .3s ease-out;
  }
  div#toc-wrap {
    position: fixed;
    top:0;
    right:0;
    z-index: 99;
    width:45%;
    height: 100%;
    padding:5%;
    background: rgba(255, 255, 255, .9);

    transition: all .3s ease-in;
    ul#toc {
      font-size: 14px;
      height: inherit;
    }
  }
  div#touch-wrap {
    position: fixed;
    top:0;
    height: 0;
    width:100vw;
    height: 100vh;
    z-index: 99;
    
    display: flex;
    flex-direction: row;

    div.l {
      width:25vw;
      height: inherit;
    }
    div.c {
      width:50vw;
      height: inherit;
    }
    div.r {
      width:25vw;
      height: inherit;
    }
    
  }
  div#ePubArea {
    position: fixed;
    top:0;
    left:0;
    width:100%;
    height: 100%;
    .clickHidden {
      display:none;
    } 
  }
  
  div.epub-btn-wrap {
    position: fixed;
    top:0;
    left:0;
    z-index: 1;
    
    div#ePubPrev,div#ePubNext {
      background:rgba(0, 0, 0, .1);
      width:25px;
      height: 125px;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 15px;
        height: 15px;
      }
    }
    div#ePubPrev {
      position: fixed;
      top:40%;
      left:0;
    }
    div#ePubNext {
      position: fixed;
      top:40%;
      right:0;
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
}
</style>

<template>
	<div class="epub-index-wrap">
    <div id="touch-wrap">
        <v-touch class="l" @tap="ePubPrev()" @swipeleft="ePubPrev()"></v-touch>
        <v-touch class="c" id="touch-center" @tap="ifClickHidden()"></v-touch>
        <v-touch class="r" @tap="ePubNext()" @swipeleft="ePubNext()"></v-touch>
    </div>
    
    <div id="ePubArea"></div>
    
    
    <div id="toc-wrap">
      <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-epub-sort"></use>
      </svg>
      <ul id="toc"></ul>      
    </div>

	</div>
</template>

<script>
import api from "@/api/api";
import moment from "moment";
import util from "@/utils/util";
import aes from "../../../static/js/aes";

import {
  SET_EPUB_BOOK,
  SET_CURRENT_SOURCE,
  SET_READ_BOOK
} from "@/store/mutationsType";
import { Indicator } from "mint-ui";

moment.locale("zh-cn");
export default {
  name: "Bookshelf",
  data() {
    return {
      books: [],
      rendition: {},
      ifHiddenFlag: true,
      displayed: "",
      decryptAfterToU8:[],
      epubText: ""
    };
  },
  filters: {
    /**
     * 使用moment格式化时间
     */
    ago(time) {
      return moment(time).fromNow();
    }
  },
  created() {
    this.getBookUpdate();
    this.getEpub()
    this.startReader()
  },
  mounted() {
    // this.clickHidden();
  },
  methods: {
    /**
     * 添加目录显示隐藏事件
     * 李啸竹
     */
    ifClickHidden() {
      let _that, _ul, _header, _ePubPrev, _ePubNext;

      _that = this;
      _that.ifHiddenFlag = !_that.ifHiddenFlag;

      _ul = document.getElementById("toc-wrap");
      _header = document.getElementsByClassName("mint-header")[0];
      _ePubNext = document.getElementById("ePubNext");
      _ePubPrev = document.getElementById("ePubPrev");

      if (_that.ifHiddenFlag) {
        _ul.classList.add("boxHidden");
        _header.style.transform = "translateY(-100%)";
        _header.style.transition = "all .3s ease-out";
      } else {
        _ul.classList.remove("boxHidden");
        _header.style.transform = "translateY(0)";
        _header.style.transition = "all .3s ease-in";
      }
    },
    /**
     * 载入 epub
     * 李啸竹
     */
    getEpub () {
      // 发请求拿授权及 epub 地址
      $.ajax({
        type: "post",
        url: "http://124.204.40.3:50696/content/authorize",
        data: {
          authorzieParameters: JSON.stringify({
            contentexternalid: "29612-Epub",
            device: {
              devicekey: "tb)DPkFKpWJ5H7uL",
              DeviceType: 4,
              Title: "测试"
            },
            FromSalePlatformTitle: "建工",
            userinfo: {
              nickname: "未登录",
              ExternalId: "未登录"
            }
          })
        },
        success: function(data) {
          console.log(data.Data)
          try {
            Indicator.close();
            // 储存解密相关信息
            if (!sessionStorage.epubBookInfo) {
              sessionStorage.epubBookInfo = JSON.stringify({
                devicekey: "tb)DPkFKpWJ5H7uL",
                decryptStr: data.Data.Key
              })
            }
            localStorage.resourceUrl = data.Data.Url
          } catch (e) {
            console.log(e.message)
          }
        }
      })
    },
    startReader () {
      let zip,
          _that,
          _isAes,
          _epubUrl,
          _book,
          _displayed,
          _ePubKey,
          _decryptObj,
          _devicekey,
          _getSpine,
          _getEpubFolder,
          _getEpubFiles,
          _encryptu8,
          _decryptu8,
          _beforeChangeHtml;

      _epubUrl = localStorage.resourceUrl
            // localStorage.resourceUrl
            // "http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub"
            // "http://124.204.40.3:50693/files/encrypted/271/b81659cbfc054337be6be289966511cb_0_1185959_encrypted.epub"
            // "http://demo.cabpv2.api.kingchannels.cn/files/test/源文件.epub"
            // "http://demo.cabpv2.api.kingchannels.cn/files/test/二次加密.epub"

      _book = new ePub(_epubUrl)
      
      // 阅读时的处理
      _book.ready.then(content => {
        // 解析空数组 
        let _epubCanonical = []
        // 拿到spine下的所有xhtml
        _getSpine = _book.spine.items
        // console.log(_getSpine,'_getSpine')
        for (let i = 0; i < _getSpine.length; i++) {
          _epubCanonical.push(_getSpine[i].canonical)
        }
        localStorage.epubCanonical = JSON.stringify(_epubCanonical)
      })

      // 加载时的处理，添加目录
      _book.loaded.navigation.then(getToc => {

        let _touchWrap,_touchL,_touchC,_touchR,_ul, _url, _docfrag, _item, _link;

        _ul = document.getElementById("toc");
        _docfrag = document.createDocumentFragment();

        // 创建目录
        getToc.toc.forEach((chapter, index) => {
          //新建li标签
          (_item = document.createElement("li")),
            //新建a标签
            (_link = document.createElement("a"));
          //给a标签添加id名
          _link.id = "chap-" + chapter.id;
          //给a标签添加label
          _link.textContent = chapter.label;
          //把chapter的链接赋值给a标签
          _link.href = chapter.href;
          //添加到li里
          _item.appendChild(_link);
          _docfrag.appendChild(_item);
          _link.onclick = function() {
            let _url = _link.getAttribute("href");
            this.rendition.display(_url);
            return false;
          };
        });
        _ul.appendChild(_docfrag);
      });
      
      this.rendition = _book.renderTo('ePubArea', { width: "100vw" });
      this.rendition.display()
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext() {
      try {
        this.rendition.next();
      } catch (e) {
        console.log(e.message)
      }
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev() {
      try {
        this.rendition.prev();
      } catch (e) {
        console.log(e.message)
      }
    },
    /**
     * 返回追更新的书本id
     * @author 李啸竹
     */
    getBookList() {
      let localShelf = util.getLocalStroageData("followBookList");
      let bookListArray = [];
      for (let bookId in localShelf) {
        bookListArray.push(bookId);
      }
      return bookListArray;
    },

    getBookUpdate() {
      let localShelf,
        that = this;
      Indicator.open();
      api.getUpdate(this.getBookList()).then(response => {
        for (let i in response) {
          localShelf = util.getLocalStroageData("followBookList");
          response[i].then(book => {
            Object.assign(book.data, localShelf[book._id]);
            book.data.cover = util.staticPath + book.data.cover;
            that.books.push(book.data);

            Indicator.close();
          });
        }
      });
    },

    readbook(book) {
      this.$store.commit(SET_READ_BOOK, book);
      this.$store.commit(SET_CURRENT_SOURCE, book.source);
      this.$router.push("/readbook/" + book._id);
    },

    showDelBookBtn(e) {
      let target = e.target.parentElement;
      while (target.className !== "book-list") {
        target = target.parentElement;
      }
      target.style.left = "-44vw";
    },

    hideDelBookBtn(e) {
      let target = e.target.parentElement;
      while (target.className !== "book-list") {
        target = target.parentElement;
      }
      target.style.left = "0";
    },

    delBook($event, index) {
      let storage = window.localStorage;
      let localShelf = JSON.parse(storage.getItem("followBookList"))
        ? JSON.parse(storage.getItem("followBookList"))
        : {};
      // 删除该书籍在本地的缓存记录
      delete localShelf[this.books[index]._id];
      this.books.splice(index, 1);
      // 重新保存
      storage.setItem("followBookList", JSON.stringify(localShelf));
    }
  }
};
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
    transition: all 0.3s ease-out;
  }
  div#toc-wrap {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 99;
    width: 45%;
    height: 100%;
    padding: 5%;
    background: rgba(255, 255, 255, 0.9);

    transition: all 0.3s ease-in;
    ul#toc {
      font-size: 14px;
      height: inherit;
    }
  }
  div#touch-wrap {
    position: fixed;
    top: 0;
    height: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99;

    display: flex;
    flex-direction: row;

    div.l {
      width: 25vw;
      height: inherit;
    }
    div.c {
      width: 50vw;
      height: inherit;
    }
    div.r {
      width: 25vw;
      height: inherit;
    }
  }
  div#ePubArea {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    .clickHidden {
      display: none;
    }
  }

  div.epub-btn-wrap {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;

    div#ePubPrev,
    div#ePubNext {
      background: rgba(0, 0, 0, 0.1);
      width: 25px;
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
      top: 40%;
      left: 0;
    }
    div#ePubNext {
      position: fixed;
      top: 40%;
      right: 0;
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
    padding: 0.5rem 0 0 0.5rem;
  }

  .book-list-wrap {
    position: relative;
    height: 5rem;
    margin-bottom: 0.2rem;
  }

  .book-list {
    position: absolute;
    left: 0;
    width: 140vw;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 0.2rem;
  }

  .book-list img {
    width: 70px;
    height: 100px;
    float: left;
    margin-right: 0.4rem;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    width: 65%;
    height: 5rem;
    margin-left: 0.6rem;
    border-bottom: 1px solid #f2f2f2;
  }

  .info p {
    margin-top: 0.2rem;
    margin-bottom: 0.2rem;
  }

  .updated {
    color: #6d6666;
    font-size: 0.8rem;
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

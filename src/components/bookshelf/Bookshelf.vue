<template>
	<div class="epub-index-wrap">
    <div class="head-catalog-wrap">
      <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-epub-sort"></use>
      </svg>
    </div>

    <div id="touch-wrap">
        <v-touch class="l" @tap="ePubPrev()" @swipeleft="ePubPrev()"></v-touch>
        <v-touch class="c" id="touch-center" @tap="ifClickHidden()"></v-touch>
        <v-touch class="r" @tap="ePubNext()" @swipeleft="ePubNext()"></v-touch>
    </div>
    
    <div id="ePubArea"></div>
    
    <div id="toc-wrap">
      <ul id="toc">
        <li v-for="item in tocList" :title="item.href" :id="'chap-'+item.id">
          <span @click="gotoDisplay(item.href)">{{item.label}}</span>
          <ul v-for="sub in item.subitems">
            <li @click="gotoDisplay(sub.href)">{{sub.label}}</li>
          </ul>
        </li>
      </ul>      
    </div>

	</div>
</template>

<script>
import api from "@/api/api";
import moment from "moment";
import util from "@/utils/util";
import aes from "../../../static/js/aes";
import Qs from "qs";
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
      book: {},
      rendition: {},
      tocList:[],
      currentSectionIndex: 0,
      ifHiddenFlag: true,
      displayed: "",
      decryptAfterToU8: [],
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
    this.getEpub();
    this.openEpub();
    this.readyReader();
    this.getBookUpdate();
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
      } else {
        _ul.classList.remove("boxHidden");
      }
    },
    /**
     * 载入 epub
     * 李啸竹
     */
    getEpub() {
      // 发请求拿授权及 epub 地址
      let params = {
        Url: "http://124.205.220.186:8001/content/authorize",
        data: {
          authorzieParameters: {
            contentexternalid: "P00003-01-32568-Epub",
            organizationExternalId: null,
            device: {
              devicekey: "Q)JY%4aH0%EwZ.GO",
              DeviceType: 4,
              Title: "电脑试读"
            },
            FromSalePlatformTitle: "可知",
            userinfo: { nickname: "未登录", ExternalId: "未登录" }
          }
        }
      };

      let routeParams = window.location.href;
      let parseUrl = routeParams.split("?")[1];
      let QsParseUrl = Qs.parse(parseUrl);
      console.log(Qs.stringify(params, { indices: false }), "模拟提交");
      
      // console.log('QsParseUrl.data')
      $.ajax({
        type: "post",
        url: QsParseUrl.Url,
        data: {
          authorzieParameters: JSON.stringify(
            QsParseUrl.data.authorzieParameters
          )
        },
        success: function(data) {
          try {
            if (data) {
              if (!sessionStorage.epubBookInfo && !sessionStorage.resourceUrl) {
                sessionStorage.resourceUrl = data.Data.Url;
                sessionStorage.epubBookInfo = JSON.stringify({
                  devicekey: QsParseUrl.data.authorzieParameters.device.devicekey,
                  decryptStr: data.Data.Key
                });
              } else {
                sessionStorage.removeItem("resourceUrl");
                sessionStorage.removeItem("epubBookInfo");
                sessionStorage.resourceUrl = data.Data.Url;
                sessionStorage.epubBookInfo = JSON.stringify({
                  devicekey: QsParseUrl.data.authorzieParameters.device.devicekey,
                  decryptStr: data.Data.Key
                });
              }
              Indicator.close();
            }
          } catch (e) {
            console.log(e.message);
          }
        }
      });
    },
    openEpub() {
      // "http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub"
      // "http://124.204.40.3:50693/files/encrypted/271/b81659cbfc054337be6be289966511cb_0_1185959_encrypted.epub"
      // "http://demo.cabpv2.api.kingchannels.cn/files/test/源文件.epub"
      // "http://demo.cabpv2.api.kingchannels.cn/files/test/二次加密.epub"

      let _epubUrl = sessionStorage.resourceUrl;

      this.book = new ePub(_epubUrl);

      this.rendition = this.book.renderTo("ePubArea", {flow: "scrolled-doc", width: "100vw" });
      
      this.rendition.display();
    },
    readyReader() {
      let _getSpine

      // 阅读时的处理
      this.book.ready.then(content => {

        try {
          _getSpine = this.book.spine.items;
          // 加载时的处理，添加目录
          this.book.loaded.navigation.then(getToc => {
            if (!localStorage.toc) {
              localStorage.toc = JSON.stringify(getToc.toc)
              localStorage.spine = JSON.stringify(_getSpine)
            } else {
              localStorage.removeItem('toc')
              localStorage.removeItem('spine')
              localStorage.toc = JSON.stringify(getToc.toc)
              localStorage.spine = JSON.stringify(_getSpine)

              this.tocList = getToc.toc
            }
          });
        } catch (e) {
          console.log(e.message);
        }
      });
      // 其他样式风格
      // rendition.themes.register("dark", "themes.css");
      this.rendition.themes.default({
        img: {
          width: "96%"
        }
      });
    },
    gotoDisplay(href){
      if (this.rendition) {
        try {
          this.rendition.display(href)
        } catch (e) {
          throw e
        }
      }
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext() {
      try {
        this.rendition.next();
      } catch (e) {
        console.log(e.message);
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
        console.log(e.message);
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
    transform: translateX(0%) !important;
    transition: all 0.3s ease-out;
  }
  div#toc-wrap {
    position: fixed;
    z-index: 98;

    width: 94vw;
    height: 94vh;
    padding: 3vw;
    background: rgba(255, 255, 255, 0.9);

    transform: translateX(100%);
    transition: all 0.3s ease-in;
    ul#toc {
      font-size: 14px;
    }
  }
  div#touch-wrap {
    position: fixed;
    top: 0;
    height: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;

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

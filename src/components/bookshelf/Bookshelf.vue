<template>
	<div class="epub-index-wrap">

    <div class="book_shelf_icon" @click="ifClickHidden()">
        <i class="iconfont epub-sort"></i>
    </div>

    <mt-header fixed :title="selected" id="my_header"></mt-header>

    <div id="touch-wrap">
        <v-touch class="l" @tap="ePubPrev()" @swipeleft="ePubPrev()" @swiperight="ePubnext()"></v-touch>
        <v-touch class="c" id="touch-center" @tap="topHidden()"></v-touch>
        <v-touch class="r" @tap="ePubNext()" @swipeleft="ePubNext()" @swiperight="ePubPrev()"></v-touch>
    </div>

    <div id="ePubArea"></div>

    <div id="curr_page_number">
      {{currentSectionIndex}}
    </div>
    
    <div id="toc-wrap" :class="ifHiddenFlag ? 'boxHiddenA' : 'boxHiddenB'">
      <ul id="toc">
        <li v-for="item in tocList" :title="item.href">
          <span @click="gotoDisplay(item.href)" :id="item.id">{{item.label}}</span>
          <ul class="subUl" v-for="sub in item.subitems">
            <li @click="gotoDisplay(sub.href)" :id="sub.id">
              <span>{{sub.label}}</span>
              <ul class="childUl" v-for="child in sub.subitems">
                <li @click="gotoDisplay(child.href)" :id="child.id">{{child.label}}</li>
              </ul>
            </li>
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
      tocList: [],
      selected: "我的书架",
      currentSectionIndex: 0,
      ifHiddenFlag: true,
      topHiddenFlag: true,
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
  async created() {
    await this.getEpub();
    await this.openEpub();
    await this.readyReader();
    await this.getBookUpdate();
    await this.topHidden();
  },
  methods: {
    /**
     * 载入 epub
     * 李啸竹
     */
    getEpub() {
      return new Promise((resolve, ject) => {
        // 发请求拿授权及 epub 地址
        let params = {
          Url: "http://124.205.220.186:8001/content/authorize",
          data: {
            authorzieParameters: {
              contentexternalid: "P00003-01-32568-Epub",
              organizationExternalId: "",
              isOnline:true,
              device: {
                devicekey: "Q)JY%4aH0%EwZ.GO",
                DeviceType: "4",
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
                if (
                  !sessionStorage.epubBookInfo &&
                  !sessionStorage.resourceUrl
                ) {
                  sessionStorage.resourceUrl = data.Data.Url;
                  sessionStorage.PackageBaseUrl = data.Data.PackageBaseUrl;
                  sessionStorage.epubBookInfo = JSON.stringify({
                    devicekey:
                      QsParseUrl.data.authorzieParameters.device.devicekey,
                    decryptStr: data.Data.Key
                  });
                } else {
                  sessionStorage.removeItem("resourceUrl");
                  sessionStorage.removeItem("epubBookInfo");
                  sessionStorage.removeItem("PackageBaseUrl");
                  sessionStorage.resourceUrl = data.Data.Url;
                  sessionStorage.PackageBaseUrl = data.Data.PackageBaseUrl;
                  sessionStorage.epubBookInfo = JSON.stringify({
                    devicekey:
                      QsParseUrl.data.authorzieParameters.device.devicekey,
                    decryptStr: data.Data.Key
                  });
                }
                Indicator.close();
              }
            } catch (e) {
              console.log(e.message);
            }
            resolve();
          }
        });
      });
    },
    /**
     * 添加目录显示隐藏事件
     * 李啸竹
     */

    openEpub() {
      return new Promise((resolve, reject) => {
        // "http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub"
        // "http://124.204.40.3:50693/files/encrypted/271/b81659cbfc054337be6be289966511cb_0_1185959_encrypted.epub"
        // "http://demo.cabpv2.api.kingchannels.cn/files/test/源文件.epub"
        // "http://demo.cabpv2.api.kingchannels.cn/files/test/二次加密.epub"

        let _epubUrl = sessionStorage.resourceUrl;

        this.book = new ePub(_epubUrl);

        this.rendition = this.book.renderTo("ePubArea", {
          width: "100vw",
          height: 'auto'
        })
        // 其他样式风格
        
        // this.rendition.themes.register("Other", "Other.css");
        
        this.rendition.themes.default({
          img: {
            width: "96%"
          }
        })

        this.rendition.themes.fontSize("120%");

        // this.rendition.themes.select("Other")

        this.rendition.display(this.currentSectionIndex);
        // resolve();
      });
    },
    async ifClickHidden() {
      let _ul, _header, _ePubPrev, _ePubNext;

      _ePubNext = document.getElementById("ePubNext");
      _ePubPrev = document.getElementById("ePubPrev");

      this.ifHiddenFlag = !this.ifHiddenFlag;
      
      await this.readyReader();
    },
    readyReader() {
      return new Promise((resolve, reject) => {
        let _getSpine;
        // 阅读时的处理
        this.book.ready.then(content => {
          try {
            _getSpine = this.book.spine.items;
            // 加载时的处理，添加目录
            this.book.loaded.navigation.then(getToc => {
              console.log(getToc,'getToc')
              if (!localStorage.toc) {
                localStorage.toc = JSON.stringify(getToc.toc);
                localStorage.spine = JSON.stringify(_getSpine);
              } else {
                localStorage.removeItem("toc");
                localStorage.removeItem("spine");
                localStorage.toc = JSON.stringify(getToc.toc);
                localStorage.spine = JSON.stringify(_getSpine);

                this.tocList = getToc.toc;
              }
              resolve();
            });
            // 当前位置之类的，可以做进度
            this.rendition.on("relocated", function(location){
              this.currentSectionIndex = location
            })
          } catch (e) {
            console.log(e.message);
          }
        });
        
      });
    },
    gotoDisplay(id) {
      return new Promise((resolve, rejcet) => {
        console.log(id, "href");
        if (this.rendition) {
          try {
            this.rendition.display(id);
            resolve();
          } catch (e) {
            throw e;
          }
        }
      });
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext() {
      return new Promise((resolve, rejcet) => {
        try {
          this.rendition.next();
          resolve();
        } catch (e) {
          console.log(e.message);
        }
      });
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev() {
      return new Promise((resolve, rejcet) => {
        try {
          this.rendition.prev();
          resolve();
        } catch (e) {
          console.log(e.message);
        }
      });
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
    topHidden() {
      let _header;

      _header = document.getElementById("my_header");
      
      this.topHiddenFlag = !this.topHiddenFlag;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
div.epub-index-wrap {
  div.book_shelf_icon {
    position: fixed;
    top: 0.4rem;
    right: 0.2rem;
    width: 1.8rem;
    height: 1.8rem;
    z-index: 99;
    color: white;
    .iconfont {
      font-size: 23px;
    }
  }
  div.headerHiddenA {
    transform: translateY(-100%) !important;
    transition: all 0.3s ease-out;
  }
  div.headerHiddenB {
    transform: translateY(0%) !important;
    transition: all 0.3s ease-in;
  }
  div.boxHiddenA {
    transform: translateX(-100%) !important;
    transition: all 0.3s ease-out;
  }
  div.boxHiddenB {
    transform: translateX(0%) !important;
    transition: all 0.3s ease-in;
  }
  div#toc-wrap {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 80;

    width: 60vw;
    height: 100vh;
    padding: 3vw;

    background: rgb(243, 243, 243);
    border: 1px solid rgb(235, 235, 235);

    // transform: translateX(100%);
    // transition: all 0.3s ease-in;

    overflow-x: hidden;
    overflow-y: scroll;
    ul#toc {
      font-size: 14px;
      margin-bottom: 1rem;
      li {
        line-height: 1.2rem;
      }
      ul.subUl {
        padding-left: 1rem;
        ul.childUl {
          padding-left: 1rem;
        }
      }
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
      width: 40vw;
      height: inherit;
    }
    div.c {
      width: 20vw;
      height: inherit;
    }
    div.r {
      width: 40vw;
      height: inherit;
    }
  }
  div.curr_page_num {
    position: fixed;
    right:10px;
    bottom:10px;
    z-index:99;
  }
  div#ePubArea {
    display: flex;
    justify-content: center;
    align-items: center;

    overflow-x: hidden;
    overflow-y: scroll;
  }
  div#curr_page_number {
    color:#ccc;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding-right:.5rem;
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

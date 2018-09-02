<template>
  <div class="epub-index-wrap">
    <!-- 功能没有，暂时隐藏 -->
    <!-- <div class="book_shelf_icon" @click="ifClickHidden()">
        <i class="iconfont epub-ziyuan"></i>
    </div> -->

    <!-- <mt-header fixed :title="selected" id="my_header"></mt-header> -->
    <div class="header_wrap"
         :class="HiddenFlag ? 'headerHiddenB' : 'headerHiddenA'">
      <ul>
        <li>
          <i class="iconfont epub-jiantou"></i>
        </li>
        <!-- 暂时隐藏 -->
        <!-- <li @click="searchEven()" :class="seatchEvenFlag ? 'searchAnimateA' : 'searchAnimateB'">
          <i class="iconfont epub-fangdajing"></i>
        </li>
        <li><i class="iconfont epub-icon-test"></i></li>
        <li><i class="iconfont epub-gengduo"></i></li> -->
      </ul>
      <span :class="seatchEvenFlag ? 'search-wrapA' : 'search-wrapB'">
        <input type="text"
               class="searchInput">
      </span>
    </div>

    <div id="touch-wrap">
      <v-touch class="l"
               @tap="ePubPrev()"
               @swipeleft="ePubPrev()"
               @swiperight="ePubnext()"></v-touch>
      <v-touch class="c"
               id="touch-center"
               @tap="topHidden()"></v-touch>
      <v-touch class="r"
               @tap="ePubNext()"
               @swipeleft="ePubNext()"
               @swiperight="ePubPrev()"></v-touch>
    </div>

    <div id="ePubArea"></div>

    <!-- <div id="curr_page_number" v-model="currentSectionIndex">{{currentSectionIndex}}</div> -->

    <div id="toc-wrap"
         :class="ifHiddenFlag ? 'boxHiddenA' : 'boxHiddenB'">
      <div class="toc_title_wrap">
        <span>目录</span>
        <!-- <span>历史</span> -->
      </div>
      <ul id="toc">
        <li v-for="item in tocList"
            :title="item.href">
          <span @click="gotoDisplay(item.href)"
                :id="item.id">{{item.label}}</span>
          <ul v-for="sub in item.subitems">
            <li @click="gotoDisplay(sub.href)"
                :id="sub.href">
              <span @click="TakeUp(sub.href)"
                    class="span_title">{{sub.label}}</span>
              <ul class="childUl"
                  v-for="(child,index) in sub.subitems"
                  :key="index">
                <li @click="gotoDisplay(child.href)"
                    :id="child.id">
                  <span>{{child.label}}</span>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="foot_wrap"
         v-if="setFontAndBG"
         :class="HiddenFlag ? 'footerHiddenB' : 'footerHiddenA'">
      <ul>
        <li>
          <i class="iconfont epub-sort"
             @click="ifClickHidden()"></i>
        </li>
        <li>
          <i class="iconfont epub-sanjiaojiantoushang"></i>
        </li>
        <li></li>
        <li>
          <i class="iconfont epub-sanjiaojiantoushang"></i>
        </li>
        <li>
          <i class="iconfont epub-shezhi"
             @click="setBG()"></i>
        </li>
        <li class="setting_wrap"></li>
      </ul>
    </div>

    <div class="foot_wrap2"
         v-else
         :class="HiddenFlag ? 'SetiingHiddenA' : 'SetiingHiddenB'">
      <div class="font_set">
        <ul>
          <li>{{seetingTitle}}</li>
          <li>A-</li>
          <li>A+</li>
          <li>默认</li>
        </ul>
      </div>
      <div class="bg_set">
        <ul>
          <li>{{bgTitle}}</li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li>
            <i class="iconfont epub-moonbyueliang"></i>
          </li>
        </ul>
      </div>
    </div>

    <div id="mask_wrap"
         @click="ifClickHidden()"
         v-if="!ifHiddenFlag">

    </div>

  </div>
</template>

<script>
import api from '@/api/api'
import moment from 'moment'
import util from '@/utils/util'
import Qs from 'qs'
import {
  SET_EPUB_BOOK,
  SET_CURRENT_SOURCE,
  SET_READ_BOOK
} from '@/store/mutationsType'
import { Indicator } from 'mint-ui'

moment.locale('zh-cn')
export default {
  name: 'Bookshelf',
  data() {
    return {
      books: [],
      book: {},
      rendition: {},
      tocList: [],
      seatchEvenFlag: false,
      ulTakeUpFlag: true,
      setFontAndBG: true,
      selected: '我的书架',
      seetingTitle: '字体大小',
      bgTitle: '背景色',
      currentSectionIndex: 0,
      ifHiddenFlag: true,
      HiddenFlag: true,
      displayed: '',
      decryptAfterToU8: [],
      epubText: ''
    }
  },
  filters: {
    /**
     * 使用moment格式化时间
     */
    ago(time) {
      return moment(time).fromNow()
    }
  },
  async created() {
    await this.getEpub()
    await this.openEpub()
    await this.readyReader()
    await this.getBookUpdate()
    await this.topHidden()
  },
  methods: {
    setBG() {
      this.setFontAndBG = !this.setFontAndBG
      console.log('sadcasdc')
    },
    /**
     * 收起
     * 李啸竹
     */
    TakeUp(id) {
      let temp = document.getElementById(id).parentNode
      console.log(temp, 'temptemptemp')
      if (this.ulTakeUpFlag) {
        this.ulTakeUpFlag = false
        temp.style.height = '3rem'
        temp.style.overflow = 'hidden'
        temp.style.opcity = '0'

        temp.style.transition = 'all .3s ease-in'
      } else {
        this.ulTakeUpFlag = true
        // temp.style.height = "auto"

        temp.style.overflow = ''
        temp.style.opcity = '1'
        temp.style.transition = 'all .3s ease-out'
      }
    },
    /**
     * 搜索
     * 李啸竹
     */
    searchEven() {
      this.seatchEvenFlag = !this.seatchEvenFlag
    },
    /**
     * 载入 epub
     * 李啸竹
     */
    getEpub() {
      return new Promise((resolve, ject) => {
        // 发请求拿授权及 epub 地址
        let params = {
          title: 'zhongzhi',
          zhongzhiData: {
            id: 592770,
            authorizeToken: 'oPl9wrSr^S)WAxF6Tn6!bIC_eOppw&)6&miMBOfZ',
            BridgePlatformName: 'phei_zhongzhi_web_demo',
            accessToken: 'iHG3#flPI5R8oWoUKFTRGOIwQuaX#fkVzzao)Fra',
            deviceToken: '3fe672e487314b34b1044825e46a0dd5',
            decryptKey: 'CrKBHyXVGtknYiXy',
            AppId: 11
          },
          Url: 'http://218.249.32.238/content/authorize',
          data: {
            authorzieParameters: {
              contentexternalid: 'P00001-01-978-7-121-33314-9-Epub',
              organizationExternalId: 'B5C6517D-8879-4DA0-A742-59A3E8E39582',
              device: {
                devicekey: 'i0TPLKk";saUBVG7',
                DeviceType: 4,
                Title: '电脑试读'
              },
              FromSalePlatformTitle: '可知',
              userinfo: { nickname: '未登录', ExternalId: '未登录' }
            }
          }
        }

        // let params = {
        //   Url:'http://demo.phei.api.kingchannels.cn/content/authorize',
        //   data:{
        //       id:592770,
        //       authorizeToken:'oPl9wrSr^S)WAxF6Tn6!bIC_eOppw&)6&miMBOfZ',
        //       BridgePlatformName:'phei_zhongzhi_web_demo',
        //       accessToken:'iHG3#flPI5R8oWoUKFTRGOIwQuaX#fkVzzao)Fra',
        //       deviceToken:'3fe672e487314b34b1044825e46a0dd5',
        //       decryptKey:'CrKBHyXVGtknYiXy',
        //       AppId:11
        //   }
        // }

        let routeParams = window.location.href
        let parseUrl = routeParams.split('?')[1]
        let QsParseUrl = Qs.parse(parseUrl)
        console.log(Qs.stringify(params, { indices: false }), '模拟提交')
        let mdata = {}
        if (QsParseUrl.title === 'zhongzhi') {
          mdata = {
            id: QsParseUrl.zhongzhiData.id,
            authorizeToken: QsParseUrl.zhongzhiData.authorizeToken,
            BridgePlatformName: QsParseUrl.zhongzhiData.BridgePlatformName,
            accessToken: QsParseUrl.zhongzhiData.accessToken,
            deviceToken: QsParseUrl.zhongzhiData.deviceToken,
            deviceKey: QsParseUrl.zhongzhiData.deviceKey,
            AppId: QsParseUrl.zhongzhiData.AppId
          }
        } else {
          mdata = {
            authorzieParameters: JSON.stringify(
              QsParseUrl.data.authorzieParameters
            )
          }
        }
        // console.log('QsParseUrl.data')
        $.ajax({
          type: 'post',
          url: QsParseUrl.Url,
          data: mdata,
          success: function(data) {
            try {
              if (data) {
                if (
                  !sessionStorage.epubBookInfo &&
                  !sessionStorage.resourceUrl
                ) {
                  sessionStorage.resourceUrl = data.Data.Url
                  sessionStorage.PackageBaseUrl = data.Data.PackageBaseUrl
                  sessionStorage.epubBookInfo = JSON.stringify({
                    devicekey:
                      QsParseUrl.data.authorzieParameters.device.devicekey,
                    decryptStr: data.Data.Key
                  })
                } else {
                  sessionStorage.removeItem('resourceUrl')
                  sessionStorage.removeItem('epubBookInfo')
                  sessionStorage.removeItem('PackageBaseUrl')
                  sessionStorage.resourceUrl = data.Data.Url
                  sessionStorage.PackageBaseUrl = data.Data.PackageBaseUrl
                  sessionStorage.epubBookInfo = JSON.stringify({
                    devicekey:
                      QsParseUrl.data.authorzieParameters.device.devicekey,
                    decryptStr: data.Data.Key
                  })
                }
                Indicator.close()
              }
            } catch (e) {
              console.log(e.message)
            }
            resolve()
          }
        })
      })
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

        // let _epubUrl = sessionStorage.resourceUrl;
        let _epubUrl =
          'http://kezhiv2.api.kingchannels.cn/files/removed_image2.epub'
        // let _epubUrl = '';

        this.book = new ePub(_epubUrl)

        this.rendition = this.book.renderTo('ePubArea', {
          width: '100vw',
          height: 600,
          manager: 'continuous',
          flow: 'paginated'
        })
        // 其他样式风格

        // this.rendition.themes.register("Other", "Other.css");

        this.rendition.themes.default({
          p: {
            color: '#333333'
          },
          img: {
            width: '96%'
          }
        })

        // 当前位置之类的，可以做进度
        this.rendition.on('relocated', function(location) {
          this.currentSectionIndex = location.start.displayed.page
        })
        this.rendition.themes.font('MSYH')
        this.rendition.themes.fontSize('120%')

        // this.rendition.themes.select("Other")

        this.rendition.display(this.currentSectionIndex)
        // resolve();
      })
    },
    async ifClickHidden() {
      let _ul, _header, _ePubPrev, _ePubNext

      _ePubNext = document.getElementById('ePubNext')
      _ePubPrev = document.getElementById('ePubPrev')

      this.ifHiddenFlag = !this.ifHiddenFlag

      await this.readyReader()
    },
    readyReader() {
      return new Promise((resolve, reject) => {
        let _getSpine
        // 阅读时的处理
        this.book.ready.then(content => {
          try {
            _getSpine = this.book.spine.items
            // 加载时的处理，添加目录
            this.book.loaded.navigation.then(getToc => {
              console.log(getToc, 'getToc')
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
              resolve()
            })
          } catch (e) {
            console.log(e.message)
          }
        })
      })
    },
    gotoDisplay(id) {
      return new Promise((resolve, rejcet) => {
        console.log(id, 'href')
        if (this.rendition) {
          try {
            this.rendition.display(id)
            resolve()
          } catch (e) {
            throw e
          }
        }
      })
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext() {
      return new Promise((resolve, rejcet) => {
        try {
          this.rendition.next().then(res => {
            console.log(res)
          })
          // this.rendition.next();
          resolve()
        } catch (e) {
          console.log(e.message)
        }
      })
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev() {
      return new Promise((resolve, rejcet) => {
        try {
          this.rendition.prev()
          resolve()
        } catch (e) {
          console.log(e.message)
        }
      })
    },
    /**
     * 返回追更新的书本id
     * @author 李啸竹
     */
    getBookList() {
      let localShelf = util.getLocalStroageData('followBookList')
      let bookListArray = []
      for (let bookId in localShelf) {
        bookListArray.push(bookId)
      }
      return bookListArray
    },
    getBookUpdate() {
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
    topHidden() {
      let _header, _footer

      _header = document.getElementsByClassName('header_wrap')[0]
      _footer = document.getElementsByClassName('foot_wrap')[0]

      this.HiddenFlag = !this.HiddenFlag
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
div.epub-index-wrap {
  div#mask_wrap {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 70;

    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.3);
  }

  div.header_wrap {
    width: 100vw;
    height: 3.5rem;
    background: white;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1);

    position: fixed;
    top: 0;
    left: 0;

    z-index: 80;

    span.search-wrapA {
      width: 65vw;
      height: 2rem;

      position: fixed;
      top: 0.6rem;
      left: 2rem;
      z-index: 60;

      opacity: 1;
      transform: scaleX(100%);
      transition: all 0.3s ease-out;
      input.searchInput {
        width: inherit;
        height: inherit;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 20px;
      }
    }
    span.search-wrapB {
      width: 1vw;
      opacity: 0;
      transform: scaleX(0);
      transition: all 0.3s ease-in;
    }
    ul {
      position: relative;
      z-index: 70;
      height: 3.5rem;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      flex: 1;
      li {
        i.iconfont {
          font-size: 30px;
        }
      }
      li:nth-child(1) {
        flex: 0.9;
        i.iconfont {
          font-size: 25px;
        }
      }
      li.searchAnimateA {
        transform: translateX(-650%) !important;
        transition: all 0.3s ease-in;

        display: flex;
        flex-direction: row;
      }
      li.searchAnimateB {
        transform: translateX(0) !important;
        transition: all 0.3s ease-out;
      }
      li:nth-child(4) {
        padding-right: 0.3rem;
      }
    }
  }
  div.SetiingHiddenA {
    transform: translateY(0);
    transition: all 0.3s ease-in;
  }
  div.SetiingHiddenB {
    transform: translateY(100%);
    transition: all 0.3s ease-in;
  }
  div.foot_wrap2 {
    width: 100vw;
    height: 6rem;
    background: white;
    box-shadow: 0 -5px 5px rgba(0, 0, 0, 0.1);

    position: fixed;
    bottom: 0;
    left: 0;

    z-index: 80;
    flex: 1;
    div.font_set {
      width: inherit;
      height: 3rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-content: center;
      flex: 0.5;
      ul {
        width: inherit;
        height: inherit;
        display: flex;
        justify-content: space-around;
        align-items: center;
        li {
          width: 4rem;
          height: 1.5rem;
          border: 1px solid RGBA(161, 161, 161, 1);

          border-radius: 2rem;

          display: flex;
          justify-content: center;
          align-items: center;
        }
        li:nth-child(1) {
          width: 5rem;
          border: none;
        }
      }
    }
    div.bg_set {
      width: inherit;
      height: 3rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-content: center;
      flex: 0.5;
      ul {
        width: inherit;
        height: inherit;
        display: flex;
        justify-content: space-around;
        align-items: center;
        li {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 2rem;
          border: 1px solid RGBA(161, 161, 161, 1);

          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        li:nth-child(1) {
          flex: 0.35;
          border: none;
        }
        li:nth-child(2) {
          border: 1px solid RGBA(64, 71, 79, 1);
          background: white;
        }
        li:nth-child(3) {
          border: 1px solid RGBA(240, 234, 198, 1);
          background: RGBA(240, 234, 198, 1);
        }
        li:nth-child(4) {
          border: 1px solid RGBA(178, 242, 225, 1);
          background: RGBA(178, 242, 225, 1);
        }
        li:nth-child(5) {
          border: 1px solid RGBA(178, 199, 242, 1);
          background: RGBA(178, 199, 242, 1);
        }
        li:nth-child(6) {
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid RGBA(64, 71, 79, 1);
          background: RGBA(64, 71, 79, 1);
        }
      }
    }
  }
  div.foot_wrap {
    width: 100vw;
    height: 3.5rem;
    background: white;
    box-shadow: 0 -5px 5px rgba(0, 0, 0, 0.1);

    position: fixed;
    bottom: 0;
    left: 0;

    z-index: 80;
    ul {
      width: inherit;
      height: inherit;
      display: flex;
      justify-content: space-around;
      align-items: center;

      li {
        display: flex;
        justify-content: center;
        align-items: center;
        i.iconfont {
          font-size: 25px;
          color: RGBA(64, 71, 79, 1);
        }
      }

      li:nth-child(1) {
        flex: 0.3;
      }
      li:nth-child(2) {
        flex: 0.3;
        transform: rotate(270deg);
      }
      li:nth-child(3) {
        flex: 1;
        height: 2px;

        background: RGBA(64, 71, 79, 1);
      }
      li:nth-child(4) {
        flex: 0.3;
        transform: rotate(90deg);
      }
      li:nth-child(5) {
        flex: 0.3;
      }
    }
  }
  div.book_shelf_icon {
    position: fixed;
    top: 45%;
    right: 0.2rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    z-index: 99;
    color: white;
    background: #40474f;
    display: flex;
    justify-content: center;
    align-items: center;
    .iconfont {
      font-size: 23px;
    }
  }

  div.footerHiddenA {
    transform: translateY(100%) !important;
    transition: all 0.3s ease-out;
  }
  div.footerHiddenB {
    transform: translateY(0%) !important;
    transition: all 0.3s ease-in;
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
    z-index: 90;

    width: 70vw;
    height: 100vh;

    background: rgb(248, 248, 248);

    // transform: translateX(100%);
    // transition: all 0.3s ease-in;

    overflow-x: hidden;
    overflow-y: scroll;
    div.toc_title_wrap {
      width: inherit;
      height: 3rem;

      background: #40474f;
      color: white;

      display: flex;
      justify-content: center;
      align-items: center;

      span {
        height: 3rem;
        line-height: 3rem;
        flex: 1;
        text-align: center;
      }
      span:nth-child(1) {
      }
      span:nth-child(2) {
        width: inherit;
        display: flex;
        justify-content: center;
        align-self: center;
        background: white;
        color: #40474f;
      }
    }

    ul#toc {
      width: 70vw;
      margin-bottom: 1rem;
      font-size: 0.8rem;

      li {
        width: inherit;

        ul {
          width: inherit;
        }
        ul {
          width: inherit;
          display: inline-block;
        }
        span.span_title {
          background: rgba(0, 0, 0, 0.03);
        }
        span {
          width: 64vw;
          padding: 3vw;
          height: 2rem;
          line-height: 2.2rem;
          display: inline-block;
        }
        span:hover {
          color: #2053e4;
        }
      }
    }
  }
  div#touch-wrap {
    position: fixed;
    top: 10%;
    width: 100vw;
    height: calc(100vh - 140px);
    z-index: 70;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
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
    right: 10px;
    bottom: 10px;
    z-index: 99;
  }
  div#ePubArea {
    display: flex;
    justify-content: center;
    align-items: center;

    overflow-x: hidden;
  }
  div#curr_page_number {
    color: #ccc;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding-right: 0.5rem;
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

<template>
  <div class="epub-index-wrap">
    <!-- 功能没有，暂时隐藏 -->
    <!-- <div class="book_shelf_icon" @click="ifClickHidden()">
        <i class="iconfont epub-ziyuan"></i>
    </div> -->

    <!-- <mt-header fixed :title="selected" id="my_header"></mt-header> -->
    <div class="header_wrap" :class="HAndFFlag ? 'headerHiddenB' : 'headerHiddenA'">
      <ul>
        <li>
          <i class="iconfont epub-jiantou" @click="backGo()"></i>
        </li>
        <li class="bookTitle">{{bookTitle}}</li>
        <li style="visibility: hidden; width:80px; border:1px solid red;"></li>
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
      <!-- <v-touch class="l" @tap="ePubPrev()" @swipeleft="ePubPrev()" @swiperight="ePubNext()"></v-touch> -->
      <v-touch class="c" id="touch-center" @tap="topHidden()"></v-touch>
      <!-- <v-touch class="r" @tap="ePubNext()" @swipeleft="ePubNext()" @swiperight="ePubPrev()"></v-touch> -->
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
        <li v-for="(item,index) in tocList" :title="item.label" @click="gotoDisplay(item.href,index)" class="isLimitB">
          {{item.label}}
        </li>
      </ul>
    </div>
    
    <div class="foot_wrap" v-if="setFontAndBG" :class="HAndFFlag ? 'footerHiddenB' : 'footerHiddenA'">

      <!-- <div class="percent_wrap">
        <vue-slider v-model="value"></vue-slider>
      </div> -->
      <ul>
        <li><i class="iconfont epub-sort" @click="ifClickHidden()"></i></li>
        <li><i class="iconfont epub-sanjiaojiantoushang" @click="ePubPrev($event)"></i></li>
        <li class="range">
          <mt-range v-model="currPage"></mt-range>
        </li>
        <li><i class="iconfont epub-sanjiaojiantoushang" @click="ePubNext($event)"></i></li>
        <li><i class="iconfont epub-shezhi" @click="setBGFun()" ></i></li>
        <li class="setting_wrap"></li>
      </ul>
      
    </div>
    
    <div class="foot_wrap2" v-else>
      <div class="font_set">
        <ul>
          <li>{{seetingTitle}}</li>
          <li @click="setFont('sub')">A-</li>
          <li @click="setFont('add')">A+</li>
          <li @click="setFont('default')">默认</li>
        </ul>
      </div>
      <div class="bg_set">
        <ul>
          <li>{{bgTitle}}</li>
          <li @click="setBG(1)"></li>
          <li @click="setBG(2)"></li>
          <li @click="setBG(3)"></li>
          <li @click="setBG(4)"></li>
          <li @click="setBG(5)">
            <i class="iconfont epub-moonbyueliang"></i>
          </li>
        </ul>
      </div>
    </div>

    <div id="mask_wrap"
         @click="ifClickHidden()"
         v-if="ifMaskHidden">
    </div>

    <div id="Recommendation_wrap" v-if="RecommendationFlag">
      <ul>
        <li class="rqcode">
          <slot name="RecommendQRCode"><img src="http://124.193.177.45:50695/kezhiRQcode.jpg" alt="二维码地址"></slot>
        </li>
        <li class="title">
          {{RecommendationTitle}}
        </li>
        <li class="RecommendationButton" @click="RecommendationFlag=false">确定</li>
      </ul>
    </div>

  </div>
</template>

<script>
// import vueSlider from "vue-slider-component";
import { Indicator } from "mint-ui";
import { Range } from 'mint-ui';
// import Qs from "qs";
export default {
  name: "epub",
  props: ["epubData"],
  // components: { vueSlider },
  data() {
    return {
      fontColor: "#B9B9B9",
      books: [],
      bookData: {},
      book: {},
      rendition: {},
      displayed: {},
      tocList: [],
      AllowReadPercentage: 0,
      totalLen: 0,
      IndicatorFlag: false,
      seatchEvenFlag: false,
      ulTakeUpFlag: true,
      setFontAndBG: true,
      RecommendationFlag: false,
      ifMaskHidden: false,
      ifHiddenFlag: true,
      HiddenFlag: false,
      HAndFFlag: false,
      bookTitle: "我的书架",
      seetingTitle: "字体大小",
      bgTitle: "背景色",
      RecommendationTitle: "下载客户端,体验全书阅读",
      bgStyle: null,
      currPage: 0,
      totalPageNum:0,
      displayed: "",
      decryptAfterToU8: [],
      epubText: "",
      count: 18,
      defaultFont: 18
    };
  },
  async created() {
    await this.getEpub();
    await this.openEpub();
    await this.listenSectionRenditions();
    // await this.loaddingFn();
    // await this.readyReader();
    // await this.getBookUpdate();
    // await this.topHidden();
    // await this.percentTotal();
    // await this.setBG()
  },
  watch: {
    epubData: function(n, o) {
      console.log(n);
    },
    currPage:function(e){
      console.log(e,'123123123')
      let _this = this;
      let cfi = _this.book.locations.cfiFromPercentage(_this.currPage/100);
      // console.log(cfi)
      _this.rendition.display(cfi)
    }
  },
  methods: {
    
    backGo() {
      this.$router.back(-1);
    },
    setFont(num) {
      switch (num) {
        case "sub":
          this.count--;
          this.rendition.themes.fontSize(this.count + "px");
          break;
        case "add":
          this.count++;
          this.rendition.themes.fontSize(this.count + "px");
          break;
        case "default":
          this.rendition.themes.fontSize(this.defaultFont + "px");
          break;
      }
    },
    setBGFun() {
      if (this.setFontAndBG) {
        this.setFontAndBG = false;
      }
    },
    /**
     * 收起
     * 李啸竹
     */
    TakeUp(id) {
      let temp = document.getElementById(id).parentNode;

      if (this.ulTakeUpFlag) {
        this.ulTakeUpFlag = false;
        temp.style.height = "3rem";
        temp.style.overflow = "hidden";
        temp.style.opcity = "0";

        temp.style.transition = "all .3s ease-in";
      } else {
        this.ulTakeUpFlag = true;
        // temp.style.height = "auto"

        temp.style.overflow = "";
        temp.style.opcity = "1";
        temp.style.transition = "all .3s ease-out";
      }
    },
    /**
     * 搜索
     * 李啸竹
     */
    searchEven() {
      this.seatchEvenFlag = !this.seatchEvenFlag;
    },
    /**
     * 载入
     * 李啸竹
     */
    getEpub() {
      return new Promise((resolve, ject) => {
        let params = {};
        let _this = this;
        params = function(url, PackageBaseUrl, realKey, AllowReadPercentage) {
          params = {
            // 参数
            data: {
              Url: _this.epubData.url,
              PackageBaseUrl: _this.epubData.PackageBaseUrl,
              realKey: _this.epubData.realKey,
              AllowReadPercentage: _this.epubData.AllowReadPercentage
            }
          };
          try {
            if (_this.epubData) {
              // 把参数存在起来
              if (!sessionStorage.resourceUrl && !sessionStorage.epubBookInfo) {
                sessionStorage.resourceUrl = _this.epubData.url;
                sessionStorage.PackageBaseUrl = _this.epubData.PackageBaseUrl;
                sessionStorage.realKey = _this.epubData.realKey;
                sessionStorage.AllowReadPercentage =
                  _this.epubData.AllowReadPercentage;
              } else {
                sessionStorage.removeItem("resourceUrl");
                sessionStorage.removeItem("devicekey");
                sessionStorage.removeItem("PackageBaseUrl");
                sessionStorage.removeItem("AllowReadPercentage");

                sessionStorage.resourceUrl = _this.epubData.url;
                sessionStorage.PackageBaseUrl = _this.epubData.PackageBaseUrl;
                sessionStorage.realKey = _this.epubData.realKey;
                sessionStorage.AllowReadPercentage =
                  _this.epubData.AllowReadPercentage;
              }
              resolve(_this.epubData);
            }
          } catch (error) {
            throw error;
          }
        };
        params();
      });
    },
    loaddingFn() {
      let _this = this;

      Indicator.open({
        text: "Loading",
        spinnerType: "fading-circle"
      });
      _this.rendition.on("rendered", function(section) {
        if (!section.output) {
          _this.IndicatorFlag = false;
          Indicator.open({
            text: "Loading",
            spinnerType: "fading-circle"
          });
        } else {
          _this.IndicatorFlag = true;
          Indicator.close();
        }
      });
    },
    /**
     * 监听章节渲染
     * 李啸竹
     */
    listenSectionRenditions () {
      let _this = this
      _this.displayed.then(() => {
        let currentLocation = _this.rendition.currentLocation();
        // let currentPage = _this.book.locations.percentageFromCfi(currentLocation.start.cfi)
        _this.currPage = _this.book.locations.percentageFromCfi(currentLocation.start.cfi)
      })
      
      _this.rendition.on("rendered", function(section) {        
        console.log(section)
        let doc = document.querySelectorAll("iframe");
        for (let i = 0; i < doc.length; i++) {
          let imgs = doc[i].contentWindow.document.getElementsByTagName("body")[0].querySelectorAll("img");
          for (let j = 0; j < imgs.length; j++) {
            imgs[j].src = imgs[j].dataset.src;
          }
        }
        
        if (section.output != undefined) {
          Indicator.close()
        }
      });
      _this.rendition.on('relocated', function(location){
        let percent = _this.book.locations.percentageFromCfi(location.start.cfi);
        let percentage = Math.floor(percent * 100);        
        _this.currPage = percentage
        // 获得当前书籍的试读比例
        let ReadPercentage = sessionStorage.AllowReadPercentage;
        // 计算出比例
        let limit = _this.book.locations.total * ReadPercentage
        
        _this.totalPageNum = limit + 3; 
        if (_this.currPage >= _this.totalPageNum && ReadPercentage != 1) {
          _this.RecommendationFlag = true
          _this.rendition.display(0)
          _this.displayed.then(e => {
            e.preventDefault()
          })
          // _this.book.destroy()
        } 
      })
    },
    /**
     * 添加目录显示隐藏事件
     * 李啸竹
     */
    openEpub() {
      let _this = this;
      return new Promise((resolve, reject) => {
               
        var _epubUrl = sessionStorage.resourceUrl;

        _this.book = new ePub(_epubUrl);

        _this.rendition = _this.book.renderTo("ePubArea", {
          width: "100vw",
          height: "100%",
          flow: "scrolled-continuous",
          manager: "continuous",
          spread: "always"
        });

        // 默认开启loading
        Indicator.open({
          text: "Loading",
          spinnerType: "fading-circle"
        });
        
        _this.displayed = _this.rendition.display();

        // 在ready里面获取cfi
        _this.book.ready.then(() => {
          // Load in stored locations from json or local storage
          var key = _this.book.key()+'-locations';
          var stored = localStorage.getItem(key);

          if (stored) {
            return _this.book.locations.load(stored);
          } else {
            // Or generate the locations on the fly
            // Can pass an option number of chars to break sections by
            // default is 150 chars
            return _this.book.locations.generate(1600);
          }
        })
        // 通过locations保存cfi
        .then(locations => {
          // console.log(_this.book.locations.save(),'通过key()拿到cfi')
          localStorage.setItem(_this.book.key()+'-locations', _this.book.locations.save());
        })

        _this.listenSectionRenditions()

        // 拿到precent
        _this.rendition.on("relocated", function(locations) {
          // _this.currPage = locations.start.cfi
        });

        _this.rendition.themes.default({
          "div > p": {
            "padding-bottom": "1rem"
          },
          "div.center": {
            width: "100% !important",
            display: "flex !important",
            "margin": "2rem 0 !important",
            "justify-content": "center !important",
            "align-items": "center !important",
            "flex-direction": "column !important"
          },
          h1: {
            "font-size": "22px",
            "line-height": "100% !important;",
            color: "RGBA(234, 84, 4, 1)",
            "text-align": "left !important;",
            "text-indent": "0",
            "margin-top": "2rem !important"
          },
          h2: {
            "font-size": "20px",
            "line-height": "100% !important;",
            color: "RGBA(234, 84, 4, 1)",
            "text-align": "left !important;",
            "margin-top": "2rem !important",
            "text-indent": "0"
          },
          h3: {
            "font-size": "18px",
            "line-height": "100% !important;",
            color: "RGBA(234, 84, 4, 1)",
            "text-align": "left !important;",
            "margin-top": "2rem !important",
            "text-indent": "0"
          },
          h4: {
            "margin-top": "0 !important",
            "font-size": "16px",
            color: "RGBA(234, 84, 4, 1)",
            "text-align": "left !important;",
            "text-indent": "0"
          },
          p: {
            "text-align": "left;",
            "line-height": "2.5rem;",
            "text-indent": "0 !important;",
            "margin-top": "1.5rem !important;"
          },
          html:{
            "margin-top": "1.5rem !important;"
          },
          body:{
            "padding":"0"
          },
          div: {
            "line-height": "2.5rem !important;"
          },
          a: {
            color: "RGBA(51, 51, 51, 1) !important;",
            "text-decoration": "none;"
          },
          img: {
            width: "98% !important;",
            height:"100% !important;"
          }
        });

        // _this.rendition.on("layout", function(layout) {
        //   console.log(layout, "layout");
        // });

        _this.book.loaded.metadata.then(function(meta) {
          _this.bookTitle = meta.title;
        });

        _this.rendition.themes.font("MSYH");
        _this.rendition.themes.fontSize("18px");

        // resolve();
      });
    },
    async ifClickHidden() {
      let _ePubPrev, _ePubNext;

      _ePubNext = document.getElementById("ePubNext");
      _ePubPrev = document.getElementById("ePubPrev");

      if (this.ifHiddenFlag) {
        this.ifHiddenFlag = false;
        this.ifMaskHidden = true;
      } else {
        this.ifHiddenFlag = true;
        this.ifMaskHidden = false;
      }

      await this.readyReader();
    },
    readyReader() {
      let _this = this;
      return new Promise((resolve, reject) => {
        // 阅读时的处理
        try {
          // 加载时的处理，添加目录
          _this.book.loaded.navigation.then(getToc => {
            let ReadPercentage = sessionStorage.AllowReadPercentage,
              total = getToc.length,
              limit = Math.ceil(total * ReadPercentage);
            if (!localStorage.limit) {
              localStorage.limit = limit;
            } else {
              localStorage.removeItem("limit");
              localStorage.limit = limit;
            }

            // 处理目录
            function handleTocList(v) {
              var list = [];
              function next(v) {
                for (let i = 0; i < v.length; i++) {
                  list.push({
                    label: v[i].label,
                    id: v[i].id,
                    href: v[i].href,
                    length: v[i].subitems.length
                  });
                  if (v[i].subitems.length) {
                    next(v[i].subitems);
                  }
                }
              }
              next(v);
              return list;
            }

            _this.tocList = handleTocList(getToc.toc);
            // console.log(_this.tocList,'_this.tocList')
            resolve(getToc.length);
          });
        } catch (e) {
          console.log(e.message);
        }
      });
    },
    gotoDisplay(id, key) {
      let _this = this
      let ReadPercentage = sessionStorage.AllowReadPercentage;
      let stored = _this.book.key();
      let cfi = JSON.parse(localStorage.getItem(stored));
      let liActive = document.querySelectorAll('.isLimitB');
      
      if (key <= _this.totalPageNum && ReadPercentage != 1) {
        _this.ifHiddenFlag = true;
        _this.ifMaskHidden = false;
        _this.RecommendationFlag = false;
        liActive[key].style.color = '#2053e4'
        _this.rendition.display(id);
      } else {
        _this.ifHiddenFlag = true;
        _this.ifMaskHidden = false;
        _this.RecommendationFlag = true;
        liActive[key].style.color = '#2053e4';
        _this.rendition.display(_this.totalPageNum);
      }
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext(e) {
      return new Promise((resolve, rejcet) => {
        let _this = this;
        try {
          _this.HiddenFlag = false;
          _this.rendition.next().then(() => {
            // _this.currPage = 0
            e.preventDefault()
          })
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
    ePubPrev(e) {
      let _this = this;
      return new Promise((resolve, rejcet) => {
        try {
          _this.HiddenFlag = false;
          _this.rendition.prev().then(() => {
            e.preventDefault()
          });
          resolve();
        } catch (e) {
          console.log(e.message);
        }
      });
    },
    topHidden() {
      let _header, _footer;

      _header = document.getElementsByClassName("header_wrap")[0];
      _footer = document.getElementsByClassName("foot_wrap")[0];

      this.HAndFFlag = !this.HAndFFlag;
      this.setFontAndBG = true;
      // this.ifMaskHidden = true;
      this.HiddenFlag = !this.HiddenFlag;
    },
    setBG(num) {
      let _this = this;
      let changeBG = document.getElementById("ePubArea");
      switch (num) {
        case 1:
          changeBG.style.background = "#F7F7F7";
          changeBG.style.transition = "all 0.3s ease-in";
          break;
        case 2:
          changeBG.style.background = "#f0eac6";
          changeBG.style.transition = "all 0.3s ease-in";
          break;
        case 3:
          changeBG.style.background = "#b2f2e1";
          changeBG.style.transition = "all 0.3s ease-in";
          break;
        case 4:
          changeBG.style.background = "#b2c7f2";
          changeBG.style.transition = "all 0.3s ease-in";
          break;
        case 5:
          changeBG.style.background = "#40474f";
          changeBG.style.transition = "all 0.3s ease-in";
          break;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.mint-indicator {
  z-index: 70;
  .mint-indicator-mask {
    z-index: 70;
  }
}
div#ePubArea {
  width: 100%;
  height: 100vh;
  box-shadow: 0 0 4px #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #f7f7f7;
}
// @media only screen
//   and (min-device-width : 320px)
//   and (max-device-width : 667px) {
//     #ePubArea {
//       height: 96.5%;
//     }
//     #ePubArea iframe {
//       pointer-events: none;
//     }
//     .arrow {
//       position: inherit;
//       display: none;
//     }
// }
div.epub-index-wrap {
  div#Recommendation_wrap {
    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 90;
    ul {
      width: 5rem;
      height: 6.5rem;
      background: white;
      border-radius: 0 0 0.2rem 0.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: column;
      li {
        width: 3.5rem;
      }
      li.rqcode {
        margin-top: 1rem;
        width: inherit;
        height: 3.5rem;

        display: flex;
        justify-content: center;
        align-items: center;
        img {
          width: 3.5rem;
          height: 3.5rem;
        }
      }
      li.title {
        width: inherit;
        height: 2rem;
        line-height: 2rem;
        padding-bottom: 0.5rem;
        text-align: center;
        font-size: 0.3rem;
        height: 0.5rem;
        line-height: 0.5rem;
      }
      li.RecommendationButton {
        width: inherit;
        height: 1rem;
        line-height: 1rem;
        text-align: center;
        font-size: 0.4rem;
        color: white;
        background: rgb(237, 90, 10);
        border-radius: 0 0 0.2rem 0.2rem;
      }
    }
  }
  div#mask_wrap {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 80;

    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.3);
  }

  div.header_wrap {
    width: 100vw;
    height: 1.2rem;
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
        border-radius: 18px;
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
      height: inherit;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      flex: 1;
      font-size: 25px;
      li:nth-child(1) {
        flex: 0.3;
        i.iconfont {
          font-size: 20px;
        }
      }
      li:nth-child(2).bookTitle {
        font-size: 18px;
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
    transition: all 0.3s ease-out;
  }
  div.foot_wrap2 {
    width: 100vw;
    height: 2.4rem;
    background: white;
    box-shadow: 0 -5px 5px rgba(0, 0, 0, 0.1);
    font-size: 0.3rem;

    position: fixed;
    bottom: 0;
    left: 0;

    z-index: 80;
    flex: 1;

    div.font_set {
      width: 100vw;
      height: 1.2rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-content: center;
      flex: 1;
      ul {
        width: 100vw;
        height: inherit;
        display: flex;
        justify-content: space-around;
        align-items: center;
        li {
          width: 1.5rem;
          height: 0.7rem;
          border: 1px solid RGBA(161, 161, 161, 1);

          border-radius: 1rem;

          display: flex;
          justify-content: center;
          align-items: center;
        }
        li:nth-child(1) {
          width: 2rem;
          border: none;
        }
      }
    }
    div.bg_set {
      width: 100vw;
      height: 1.2rem;
      font-size: 0.3rem;
      flex: 0.5;
      ul {
        width: 100vw;
        height: 1.2rem;
        display: flex;
        justify-content: space-around;
        align-items: center;
        li {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 2rem;
          border: 1px solid RGBA(161, 161, 161, 1);

          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        li:nth-child(1) {
          width: 1.8rem;
          display: flex;
          justify-content: center;
          align-items: center;
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
    height: 1.2rem;
    font-size: 0.4rem;
    background: white;
    box-shadow: 0 -5px 5px rgba(0, 0, 0, 0.1);

    position: fixed;
    bottom: 0;
    left: 0;

    z-index: 80;
    div.percent_wrap {
      width: 10rem;
      height: 2px;
      z-index: 99;

      position: fixed;
      bottom: 60%;
      left: 23.3%;
      .vue-slider-component
        .vue-slider-dot.vue-slider-always
        .vue-slider-tooltip-wrap {
        display: none !important;
      }
      .vue-slider-component .vue-slider-dot {
        top: -7px !important;
      }
      .vue-slider-component .vue-slider {
        height: 2px;
        background: none;
      }
      .vue-slider-component.vue-slider-horizontal .vue-slider-process {
        height: 2px;
        background: RGBA(64, 71, 79, 1);
      }
    }
    ul {
      height: inherit;
      display: flex;
      justify-content: space-around;
      align-items: center;
      li {
        display: flex;
        justify-content: center;
        align-items: center;
        i.iconfont {
          font-size: 20px;
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
        width:200px;

        div.mt-range {
          width: inherit;
          div.mt-range-content {
            width:inherit;
            margin-right:20px;
            div.mt-range-runway {
              right: -20px;
            }
            div.mt-range-progress {
              background: #fb7124;
            }
            div.mt-range-thumb {
              position: absolute;
              top: 10%;
              width:20px;
              height: 20px;
              border:1px solid rgba(0,0,0,.1);
              box-shadow: 1px 2px 3px rgba(0,0,0,.4);
              display: none;
            }
          }
        }
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
    font-size: 0.4rem;
    background: rgb(248, 248, 248);

    // transform: translateX(100%);
    // transition: all 0.3s ease-in;

    overflow-x: hidden;
    overflow-y: scroll;
    div.toc_title_wrap {
      width: inherit;
      height: 1.2rem;

      background: #40474f;
      color: white;

      display: flex;
      justify-content: center;
      align-items: center;

      span {
        height: 1rem;
        line-height: 1rem;
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
      margin-bottom: 0.4rem;
      font-size: 0.3rem;
      li.isLimitA {
        width: 64vw;
        padding: 3vw;
        height: 1rem;
        line-height: 1rem;
        display: inline-block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        color: #6d6666;
      }
      li.isLimitB {
        width: 64vw;
        padding: 3vw;
        height: 1rem;
        line-height: 1rem;
        display: inline-block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        ul {
          width: inherit;
        }
        ul {
          width: inherit;
          display: inline-block;
        }
      }
      li:hover {
        color: #2053e4;
      }
    }
  }
  div#touch-wrap {
    position: fixed;
    top:0;
    left:0;
    
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 60;
    div.l {
      width: 35vw;
      height: inherit;
    }
    div.c {
      width: 30vw;
      height: 30vh;
      position: fixed;
      top:35%;
      left:35%;
    }
    div.r {
      width: 35vw;
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

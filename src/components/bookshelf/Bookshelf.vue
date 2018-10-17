<template>
  <div class="epub-index-wrap">
    <!-- 功能没有，暂时隐藏 -->
    <!-- <div class="book_shelf_icon" @click="ifClickHidden()">
        <i class="iconfont epub-ziyuan"></i>
    </div> -->

    <!-- <mt-header fixed :title="selected" id="my_header"></mt-header> -->
    <!-- 书籍引导操作 -->
    <div class='guide-box' v-if="showGuideBox" @click="closeGuideBox">
        <div class='guide-l'><img class='mb3' src="../../assets/guide/hander_click_left.png" alt="">点击、滑动此区域，上翻一页</div>
        <div class='guide-c'><img src="../../assets/guide/hander_click.png" alt="">　　点击此区域，唤醒菜单栏</div>
        <div class='guide-r'><img class='mb3' src="../../assets/guide/hander_click_right.png" alt="">点击、滑动此区域，下翻一页</div>
    </div>
    <div class="header_wrap" :class="HAndFFlag ? 'headerHiddenB' : 'headerHiddenA'">
      <ul>
        <li>
          <i class="iconfont epub-jiantou" @click="backGo()"></i>
        </li>
        <li class="bookTitle">{{bookTitle}}</li>
        <li></li>
        <!-- 暂时隐藏 -->
        <!-- <li @click="searchEven()" :class="seatchEvenFlag ? 'searchAnimateA' : 'searchAnimateB'">
          <i class="iconfont epub-fangdajing"></i>
        </li>
        <li><i class="iconfont epub-icon-test"></i></li>
        <li><i class="iconfont epub-gengduo"></i></li> -->
      </ul>
      <span :class="seatchEvenFlag ? 'search-wrapA' : 'search-wrapB'">
        <input type="text" class="searchInput">
      </span>
    </div>

    <v-touch id="touch-wrap" @swipeleft="ePubNext($event)" @swiperight="ePubPrev($event)">
      <v-touch id="ePubPrev" class="l" @tap="ePubPrev($event)"></v-touch>
      <v-touch class="c" id="touch-center" @tap="topHidden()"></v-touch>
      <v-touch id="ePubNext" class="r" @tap="ePubNext($event)"></v-touch>
    </v-touch>
    <div class='chapter-name'>{{chapterName}}</div>
    <div id="ePubArea"></div>

    <!-- <div id="curr_page_number" v-model="currentSectionIndex">{{currentSectionIndex}}</div> -->

    <div id="toc-wrap" :class="ifHiddenFlag ? 'boxHiddenA' : 'boxHiddenB'">
      <div class="toc_title_wrap">
        <span>目录</span>
        <!-- <span>历史</span> -->
      </div>
      <ul id="toc">
          <!-- 点击高亮目录 -->
        <!-- <li v-for="(item,index) in sectionLibList" :key="index" :class="{'readable':!item.sign? true:false,'selected':index == 0}" @click="gotoDisplay($event,item)" class="isLimitB toc-item"> -->
        <li v-for="(item,index) in sectionLibList" :key="index" :class="{'readable':!item.sign? true:false}" @click="gotoDisplay($event,item)" class="isLimitB toc-item">
            <!--  :title="item.label" -->
          <span>{{item.Title}}</span>
        </li>
      </ul>
    </div>

    <div class="foot_wrap" v-if="setFontAndBG" :class="HAndFFlag ? 'footerHiddenB' : 'footerHiddenA'">

      <!-- <div class="percent_wrap">
        <vue-slider v-model="value"></vue-slider>
      </div> -->
      <ul>
        <li><i class="iconfont epub-sort" @click="ifClickHidden()"></i></li>
        <li><i class="iconfont epub-sanjiaojiantoushang" @click="ePubPrev($event,false)"></i></li>
        <li class="range">
          <mt-range v-model="currPage">
            <div v-if="currPageFlag" slot="end" class="currEndPage">{{currPage + '%'}}</div>
            <div v-if="!currPageFlag" slot="end" class="currEndPage"><span></span></div>
          </mt-range>
        </li>
        <li><i class="iconfont epub-sanjiaojiantoushang" @click="ePubNext($event,false)"></i></li>
        <li><i class="iconfont epub-shezhi" @click="setBGFun()"></i></li>
        <li class="setting_wrap"></li>
      </ul>

    </div>

    <div class="foot_wrap2" v-else>
      <div class="font_set">
        <ul>
          <li>{{seetingTitle}}</li>
          <li @click.self="setFont('sub')">A-</li>
          <li @click.self="setFont('add')">A+</li>
          <li @click.self="setFont('default')">默认</li>
        </ul>
      </div>
      <div class="bg_set">
        <ul>
          <li class='bg-item'>{{bgTitle}}</li>
          <li @click="setBG(1)" class='bg-item selected'></li>
          <li @click="setBG(2)" class='bg-item'></li>
          <li @click="setBG(3)" class='bg-item'></li>
          <li @click="setBG(4)" class='bg-item'></li>
          <li @click="setBG(5)" class='bg-item'>
            <i class="iconfont epub-moonbyueliang"></i>
          </li>
        </ul>
      </div>
    </div>

    <div id="mask_wrap" @click="ifClickHidden()" v-if="ifMaskHidden">
    </div>
    <!-- 暂时隐藏比例弹窗 -->
    <!-- <div id="Recommendation_wrap" v-if="RecommendationFlag">
      <ul>
        <li class="rqcode">
          <slot name="RecommendQRCode"><img class='code-img' src="http://124.193.177.45:50695/kezhiRQcode.jpg" alt="二维码地址"></slot>
          <span class="close-rqcode" @click="hideMenc()"><img class="close-rqcode" src="../../assets/guide/close.png" @click="hideMenc()" alt=""/></span>
        </li>
        <li class="title">
          {{RecommendationTitle}}
        </li>
        <li class="RecommendationButton" @click="goPay()">确定</li>
      </ul>
    </div> -->

  </div>
</template>

<script>
// import vueSlider from "vue-slider-component";
import { Indicator,Toast } from 'mint-ui'
import { Range } from 'mint-ui'
// import Qs from "qs";
export default {
    name: 'epub',
    props: ['epubData'],
    // components: { vueSlider },
    data() {
        return {
            fontColor: '#B9B9B9',
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
            liLock: false,
            preventPaging: false,
            bookTitle: '我的书架',
            seetingTitle: '字体大小',
            bgTitle: '背景色',
            RecommendationTitle: '下载客户端,体验全书阅读',
            bgStyle: null,
            goPayUrl: 'http://www.keledge.com/static/public/guidance.html',
            limit: 0,
            currPage: 0,
            currPageFlag:false,
            currPageCfi: '',
            displayed: '',
            decryptAfterToU8: [],
            epubText: '',
            count: 18,
            defaultFont: 18,

            hideMencFlag: false,

            isprobation: false,
            allParentIndex: 0,
            allreadableIndex: 0,
            allreadableArr: [],
            cparentIndex: 0,
            childrenIndex: 0,
            tocList: [],
            suffix:'',
            sectionLibList:[],
            isHtml:false,
            hrefHeader:'',
            canRead: true,
            canClickNext: false,
            showGuideBox: sessionStorage.showGuideBox=='yes'?false:true,
            startTime: 0,
            currHref: null, //存贮当前页对应的目录，做高亮显示,
            chapterName: null
        }
    },
    async mounted() {
        await this.getEpub()
        await this.openEpub()
        await this.listenSectionRenditions()
        // await this.loaddingFn();
        // await this.readyReader();
        // await this.getBookUpdate();
        // await this.topHidden();
        // await this.percentTotal();
        // await this.setBG()
    },
    watch: {
        epubData: function(n, o) {
            console.log(n)
        },
        currPage: function(e) {
            // let _this = this
            // let cfi = _this.book.locations.cfiFromPercentage(_this.currPage / 100);
            // let cfi = _this.book.locations.percentageFromCfi(_this.currPage / 100);
            // console.log(cfi)
            // _this.rendition.display(cfi)
        }
    },
    destroyed() {
        sessionStorage.removeItem("cPage")
    },
    methods: {
        // 计算试读比例+++++++++++++++++++++++++++++++++++++++++++++++
        readableNum(data) {
            var indexNum = null,otherData,computeData,readableData,onReadableData,flag = true
            data.forEach((item, index) => {
                if (item.href.indexOf('toc') > -1 && flag) {
                    flag = false
                    indexNum = index
                }
            })
            if (!indexNum) {
                data.forEach((item, index) => {
                    if (item.subitems.length && flag) {
                        flag = false
                        indexNum = index
                    }
                })
            }
            // 除去开头前言目录等  不加入试读比例计算
            otherData = this.setCatalogue(data.slice(0, indexNum), true)
            // 除去开头前言目录等 得到新数据
            computeData = data.slice(indexNum, data.length)
            readableData = this.setCatalogue(computeData.slice(0,Math.ceil(computeData.length * this.epubData.AllowReadPercentage)),true)
            readableData.forEach(item => {
                this.allreadableArr.push(item.href.split('#')[0])
            })
            this.allreadableIndex = indexNum + this.unique(this.allreadableArr).length - 1
            onReadableData = this.setCatalogue(
                computeData.slice(
                    Math.ceil(computeData.length * this.epubData.AllowReadPercentage),
                    computeData.length
                ),
                false
            )
            this.sectionLibList = otherData.concat(readableData, onReadableData)
        },
        // 递归处理目录
        setCatalogue(val, sign) {
            let flag = 0,
                List = [],
                _this = this
            function next(val, flag, sign) {
                for (let i = 0; i < val.length; i++) {
                    if(val[i].label.replace(/\s+/g, '')!=""){
                      List.push({
                          Title: val[i].label,
                          href: val[i].href,
                          id: val[i].id,
                          length: flag ? flag : 0,
                          sign: sign
                      })
                    }
                    // console.log(_this.epub.spine.get(val[i].href))
                    if (val[i].subitems.length) {
                        next(val[i].subitems, flag + 1, sign)
                    }
                }
            }
            next(val, flag, sign)
            return List
        },
        // 数组去重
        unique(arr) {
            var res = []
            var json = {}
            for (var i = 0; i < arr.length; i++) {
                if (!json[arr[i]]) {
                    res.push(arr[i])
                    json[arr[i]] = 1
                }
            }
            return res
        },
        // ++++++++++++++++++++++++++++++++++++++++++++++
        hideMenc(){
            console.log();
            if(this.hideMencFlag){
                this.RecommendationFlag = false
                this.hideMencFlag = false
            }
        },
        backGo() {
            this.$router.back(-1)
        },
        goPay() {
            let _this = this

            if (_this.RecommendationFlag) {
                _this.RecommendationFlag = false
                _this.hideMencFlag = false
                window.location.href = _this.goPayUrl
            }
        },
        setFont(num) {
            switch (num) {
                case 'sub':
                  if(this.count<=12){
                    Toast({
                      message: '最小字体',
                      position: 'top',
                      duration: 2000
                    })
                  }else{  
                    this.count--
                    this.rendition.themes.fontSize(this.count + 'px')
                  }
                    break
                case 'add':
                  if(this.count>=40){
                    Toast({
                      message: '最大字体',
                      position: 'top',
                      duration: 2000
                    })
                  }else{
                    this.count++
                    this.rendition.themes.fontSize(this.count + 'px')
                  }
                    break
                case 'default':
                    this.rendition.themes.fontSize(this.defaultFont + 'px')
                    break
            }
        },
        setBGFun() {
            if (this.setFontAndBG) {
                this.setFontAndBG = false
            }
        },
        /**
         * 收起
         * 李啸竹
         */
        TakeUp(id) {
            let temp = document.getElementById(id).parentNode

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
         * 载入
         * 李啸竹
         */
        getEpub() {
            return new Promise((resolve, ject) => {
                let params = {}
                let _this = this
                params = function(
                    url,
                    PackageBaseUrl,
                    realKey,
                    AllowReadPercentage
                ) {
                    params = {
                        // 参数
                        data: {
                            Url: _this.epubData.url,
                            PackageBaseUrl: _this.epubData.PackageBaseUrl,
                            realKey: _this.epubData.realKey,
                            AllowReadPercentage:
                                _this.epubData.AllowReadPercentage
                        }
                    }
                    try {
                        if (_this.epubData) {
                            // 把参数存在起来
                            if (
                                !sessionStorage.resourceUrl &&
                                !sessionStorage.epubBookInfo
                            ) {
                                sessionStorage.resourceUrl = _this.epubData.url
                                sessionStorage.PackageBaseUrl =
                                    _this.epubData.PackageBaseUrl
                                sessionStorage.realKey = _this.epubData.realKey
                                sessionStorage.AllowReadPercentage =
                                    _this.epubData.AllowReadPercentage
                            } else {
                                sessionStorage.removeItem('resourceUrl')
                                sessionStorage.removeItem('devicekey')
                                sessionStorage.removeItem('PackageBaseUrl')
                                sessionStorage.removeItem('AllowReadPercentage')

                                sessionStorage.resourceUrl = _this.epubData.url
                                sessionStorage.PackageBaseUrl =
                                    _this.epubData.PackageBaseUrl
                                sessionStorage.realKey = _this.epubData.realKey
                                sessionStorage.AllowReadPercentage =
                                    _this.epubData.AllowReadPercentage
                            }
                            sessionStorage.defaultBaseUrl = '/static/img/book-open.svg'
                            resolve(_this.epubData)
                        }
                    } catch (error) {
                        throw error
                    }
                }
                params()
            })
        },
        loaddingFn() {
            let _this = this

            Indicator.open({
                text: 'Loading',
                spinnerType: 'fading-circle'
            })
            _this.rendition.on('rendered', function(section) {
                if (!section.output) {
                    _this.IndicatorFlag = false
                    Indicator.open({
                        text: 'Loading',
                        spinnerType: 'fading-circle'
                    })
                } else {
                    _this.IndicatorFlag = true
                    Indicator.close()
                }
            })
        },
        /**
         * 监听章节渲染
         * 李啸竹
         */
        listenSectionRenditions() {
            let _this = this

            _this.rendition.on('rendered', function(section) {
                let doc = document.querySelectorAll('iframe')
                for (let i = 0; i < doc.length; i++) {
                    let imgs = doc[i].contentWindow.document
                        .getElementsByTagName('body')[0]
                        .querySelectorAll('img')
                    for (let j = 0; j < imgs.length; j++) {
                        imgs[j].src = imgs[j].dataset.src
                    }
                }

                if (section.output != undefined) {
                    Indicator.close()
                }
            })

            this.rendition.on('locationChanged', res => {
                console.log(res,'res==');
                // this.currHref = res.id;
                let href = res.href;
                this.canClickNext = true;
                //兼容部分资源href不一样 只有一个 /  res.href
                if(res.href.indexOf("/")>-1 && !this.hrefHeader){
                    this.hrefHeader = res.href.split('/')[0] + '/'
                }
                if (res.index > this.allreadableIndex && this.isprobation) {
                    _this.RecommendationFlag = true
                    _this.hideMencFlag = true
                    _this.preventPaging = true
                    _this.canRead = false;
                    return 
                }else{
                    _this.canRead = true;
                }
                this.cparentIndex = res.index
                sessionStorage.setItem('cPage', JSON.stringify(res))
                _this.currPage = Math.floor(res.percentage * 100)
                // 通过监听locationChange，获取当章节名称
                for(let i=0;i<this.sectionLibList.length;i++){
                    if(this.sectionLibList[i].href.indexOf(href)!=-1){
                        this.chapterName = this.sectionLibList[i].Title
                        return false;
                    }
                }
            })



            // _this.rendition.on('locationChanged', function(locationChanged) {
            //     console.log(locationChanged,_this.limit)
               
            //     let nextClick = document.getElementById('ePubNext')
            //     _this.currPage = Math.floor(locationChanged.percentage * 100)
            //     _this.limit = Math.floor(
            //         _this.book.navigation.length * sessionStorage.AllowReadPercentage
            //     )
            //     // console.log(_this.limit,'_this.limit')
            //     // console.log(_this.tocList,'_this.tocList')
            //     // console.log(_this.tocList[_this.limit-1].href.split('#')[0],'_this.tocList[_this.limit-1].href')
            //     for (let i = 0; i < _this.tocList.length; i++) {
            //         if (
            //             _this.currPage <= 100 &&
            //             locationChanged.href == _this.tocList[_this.limit].href.split('#')[0] &&
            //             sessionStorage.AllowReadPercentage != 1
            //         ) {
            //             _this.RecommendationFlag = true
            //             _this.hideMencFlag = true
            //             _this.preventPaging = true
            //             // _this.rendition.prev()
            //             return
            //         }
            //     }
            //     sessionStorage.setItem("cPage",JSON.stringify(locationChanged))
            // })
            // _this.rendition.on('relocated', function(location){
            // let percent = _this.book.locations.percentageFromCfi(location.start.cfi);
            // let percentage = Math.floor(percent * 100);
            // // 获得进得条的数值
            // _this.currPage = percentage

            // })
        },
        /**
         * 添加目录显示隐藏事件
         * 李啸竹
         */
        openEpub() {
            let cPage = sessionStorage.getItem('cPage')
                ? JSON.parse(sessionStorage.getItem('cPage'))
                : {}
            let _this = this
            return new Promise((resolve, reject) => {
                var _epubUrl = sessionStorage.resourceUrl
                _this.book = new ePub(_epubUrl)

                _this.rendition = _this.book.renderTo('ePubArea', {
                    width: window.innerwidth,
                    height: window.innerHeight - 26
                    // flow: "scrolled",
                    // manager: "continuous",
                    // spread: "always"
                })

                // 默认开启loading
                Indicator.open({
                    text: 'Loading',
                    spinnerType: 'fading-circle'
                })

                // _this.displayed = _this.rendition.display()

                // 在ready里面获取cfi
                _this.book.ready.then(() => {
                        return _this.book.locations.generate()
                    })
                    // 通过locations保存cfi
                    .then(locations => {
                        // console.log(_this.book.locations.save(),'通过key()拿到cfi')
                        _this.book.locations.save()
                    }).then(()=>{
                        if(sessionStorage.getItem("cPage")){
                            _this.currPage = Math.floor(_this.book.locations.percentageFromCfi(JSON.parse(sessionStorage.getItem("cPage")).start)*100)
                            _this.currPageFlag = true
                        }
                    })
                    // +++++++++++++++++++++++++++++++++++++++++目录

                    this.book.loaded.navigation.then(getToc => {
                        if(!getToc.toc.length){
                            return
                        }
                        this.suffix = getToc.toc[0].href.split('.')[1]
                        this.tocList = getToc.toc
                        if (this.epubData.AllowReadPercentage == 1) {
                            this.sectionLibList = this.setCatalogue(getToc.toc,true)
                        } else {
                            this.readableNum(getToc.toc)
                            this.isprobation = true
                            if (this.suffix == 'html') {
                                this.isHtml = true
                            }
                        }
                        let arr = []
                        this.sectionLibList.forEach(item => {
                            arr.push(item.href.split('#')[0])
                        })
                        this.allParentIndex = this.unique(arr).length - 1
                    })
                    .then(() => {
                        if (cPage.href) {
                        //  && (cPage.percentage > 0 || this.isHtml)    百分比
                        //   console.log(cPage)
                            if (this.isHtml) {
                                this.rendition.display(cPage.href)
                            } else {
                                this.rendition.display(cPage.start)
                            }
                            this.cparentIndex = cPage.index
                        } else {
                            this.rendition.display()
                        }
                    })
                    // ++++++++++++++++++++++++++++++++++++++++++++++
                    
                _this.listenSectionRenditions()

                _this.rendition.themes.default({
                    // '*':{
                    //     '-webkit-touch-callout':'none', /*系统默认菜单被禁用*/
                    //     '-webkit-user-select':'none', /*webkit浏览器*/
                    //     '-khtml-user-select':'none', /*早期浏览器*/
                    //     '-moz-user-select':'none', /*火狐*/
                    //     '-ms-user-select':'none',  /*IE10*/
                    //     'user-select':'none',
                    // },
                    h1: {
                        'font-size': '22px',
                        color: '#333 !important',
                        'text-align': 'left !important;',
                        'text-indent': '0',
                        'margin-top': '2rem !important'
                    },
                    h2: {
                        'font-size': '20px',
                        color: '#333 !important',
                        'text-align': 'left !important;',
                        'margin-top': '2rem !important',
                        'text-indent': '0'
                    },
                    h3: {
                        'font-size': '18px',
                        color: '#333 !important',
                        'text-align': 'left !important;',
                        'margin-top': '2rem !important',
                        'text-indent': '0'
                    },
                    h4: {
                        'margin-top': '0 !important',
                        'font-size': '16px',
                        color: '#333 !important',
                        'text-align': 'left !important;',
                        'text-indent': '0'
                    },
                    'div.contents1': {
                        'text-indent': '0',
                        margin: '0',
                        'font-size': '20px'
                    },
                    'div.contents2': {
                        'text-indent': '0',
                        margin: '0',
                        'font-size': '20px'
                    },
                    'div.contents3': {
                        'text-indent': '0',
                        margin: '0',
                        'font-size': '20px'
                    },
                    p: {
                        'text-align': 'left;',
                        'line-height': '1.5 !important',  //L
                        'text-indent': '0 !important;',
                        'margin-top': '1.5rem !important;'
                    },
                    html: {},
                    body: {
                        'text-indent': '0 !important;',
                    },
                    div: {
                        'line-height': '1.5 !important'  //L
                    },
                    'div.pic': {},
                    'div.cover': {
                        width: '100%',
                        display: 'flex',
                        'justify-content': 'center',
                        'align-items': 'center'
                    },
                    a: {
                        color: 'RGBA(51, 51, 51, 1) !important;',
                        'text-decoration': 'none;',
                        'line-height': '1.5 !important'   //L
                    },
                    img: {
                        'max-width': '100% !important', //L
                        'object-fit': 'contain !important',//L
                        'height': 'auto !important',//L
                        'margin-left': '0 !important',// w
                        'margin-rgiht': '0 !important',// w
                        'margin-height': (window.innerHeight - 26)+'!important'// w 处理图片长度太长断屏
                    }
                })

                _this.book.loaded.metadata.then(function(meta) {
                    _this.bookTitle = meta.title
                    if(!_this.bookTitle){
                        _this.getDetail()
                    }
                })

                _this.rendition.themes.font('MSYH')
                _this.rendition.themes.fontSize('18px')

                // resolve();
            })
        },
        // 获取资源详情
        getDetail(){
            this.$http.get(baseUrl+"/Content/Detail",{
                params:{
                    id:this.$route.query.id
                }
            }).then((res)=>{
                if(res.data.Success){
                    this.bookTitle = res.data.Data.Title
                }
            })
        },
        ifClickHidden() {
            let _ePubPrev, _ePubNext

            _ePubNext = document.getElementById('ePubNext')
            _ePubPrev = document.getElementById('ePubPrev')

            if (this.ifHiddenFlag) {
                this.ifHiddenFlag = false
                this.ifMaskHidden = true
            } else {
                this.ifHiddenFlag = true
                this.ifMaskHidden = false
            }
        },
        gotoDisplay(event,val) {
            this.HAndFFlag = false;
            this.HiddenFlag = false;
            let _this = this
            _this.ifHiddenFlag = true
            _this.ifMaskHidden = false
            if (val.sign) {
                // 点击高亮目录
                // let currentDom = event.currentTarget;
                // let selectedFlag = currentDom.classList.contains('selected');
                if(selectedFlag){
                    return;
                }else{
                    document.querySelector('.toc-item.selected').classList.remove('selected');
                    currentDom.classList.add('selected');
                }
                _this.preventPaging = false
                _this.rendition.display(val.href.indexOf('/')>-1?val.href:this.hrefHeader +val.href)
            } else {
                _this.RecommendationFlag = true
                _this.hideMencFlag = true
                _this.preventPaging = true
            }
        },
        /**
         * 下一页
         * @author 李啸竹
         */
        ePubNext(e,flag=true) {
            console.log(123);
            // return;
            let myDate = new Date();
            let nowTime = myDate.getTime();
            let mistiming = nowTime - this.startTime
            this.startTime = nowTime;
            if(mistiming<=180){
                return;
            }
            if(flag){
                this.HAndFFlag = false;
                this.HiddenFlag = false;
            }
            this.canClickNext = false;//重置向下点击为false，防止暴力狂点击
            setTimeout(()=>{
                this.canClickNext = true;
            },1000);
            let _this = this
            _this.HiddenFlag = false
            // console.log(_this.canRead,'==');
            // console.log(_this.preventPaging,'==preventPaging');
            if (_this.preventPaging && !_this.canRead) {
                console.log('显示二维码')
                _this.RecommendationFlag = true
                this.hideMencFlag = true
            } else {
                _this.rendition.next()
                e.preventDefault()
            }
        },
        /**
         * 上一页
         * @author 李啸竹
         */
        ePubPrev(e,flag=true) {
            if(flag){
                this.HAndFFlag = false;
                this.HiddenFlag = false;
            }
            let _this = this
            return new Promise((resolve, rejcet) => {
                try {
                    _this.HiddenFlag = false
                    _this.preventPaging = false
                    _this.rendition.prev()
                    resolve()
                } catch (e) {
                    console.log(e.message)
                }
            })
        },
        topHidden() {
            let _header, _footer

            _header = document.getElementsByClassName('header_wrap')[0]
            _footer = document.getElementsByClassName('foot_wrap')[0]

            this.HAndFFlag = !this.HAndFFlag
            this.setFontAndBG = true
            // this.ifMaskHidden = true;
            this.HiddenFlag = !this.HiddenFlag
        },
        setBG(num) {
            let _this = this
            let changeBG = document.getElementById('ePubArea')
            let liDom = document.querySelector('li.selected');
            let clickLiDom = document.querySelectorAll('li.bg-item')[num];
            if(liDom != clickLiDom){
                liDom.classList.remove('selected');
                clickLiDom.classList.add('selected');
            }
            switch (num) {
                case 1:
                    changeBG.style.background = '#F7F7F7'
                    changeBG.style.transition = 'all 0.3s ease-in'
                    break
                case 2:
                    changeBG.style.background = '#f0eac6'
                    changeBG.style.transition = 'all 0.3s ease-in'
                    break
                case 3:
                    changeBG.style.background = '#b2f2e1'
                    changeBG.style.transition = 'all 0.3s ease-in'
                    break
                case 4:
                    changeBG.style.background = '#b2c7f2'
                    changeBG.style.transition = 'all 0.3s ease-in'
                    break
                case 5:
                    changeBG.style.background = '#40474f'
                    changeBG.style.transition = 'all 0.3s ease-in'
                    break
            }
        },
        closeGuideBox(){
            sessionStorage.showGuideBox = 'yes';
            this.showGuideBox = false;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
@-webkit-keyframes spin {
    0%   {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
.mint-indicator {
    z-index: 70;
    // width:100vw;
    // height: 100vh;
    // position: fixed;
    // top: 0;
    // left: 0;
    // z-index: 60;
    // background:rgba(0,0,0,.3);
    .mint-indicator-mask {
        z-index: 60;
    }
}
.guide-box{
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    text-align: center;
    background: rgba(0,0,0,0.7);
    color: #ffffff;
    font-size: 0.3rem;
    font-family: cursive;
    div{
        img{
            width: 10vw;
            // margin-bottom: 8vh;
            margin-bottom: 3vh;
        }
        img.mb3{
            width: 11vw;
        }
    }
    div.guide-l {
        width: 25vw;
        height: inherit;
        writing-mode: tb-rl;
        -webkit-writing-mode: vertical-rl;
        writing-mode: vertical-rl;
        line-height: 25vw;
    }
    div.guide-c {
        width: 50vw;
        height: 100%;
        writing-mode: tb-rl;
        -webkit-writing-mode: vertical-rl;
        writing-mode: vertical-rl;
        line-height: 50vw;
        border-left: 1px dashed #ccc;
        border-right: 1px dashed #ccc;
    }
    div.guide-r {
        width: 25vw;
        height: inherit;
        writing-mode: tb-rl;
        -webkit-writing-mode: vertical-rl;
        writing-mode: vertical-rl;
        line-height: 25vw;
    }
}
div.chapter-name{
    height: 26px;
    line-height: 26px;
    position: relative;
    top: 1px;
    z-index: 60;
    background: #fff;
    text-indent: 15px;
}
div#ePubArea {
    width: 100%;

    box-shadow: 0 0 4px #ccc;

    background: #f7f7f7;
    div.epub-container {
    }
    div.epub-view {
        height: 100% !important;
    }
}
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
                position: relative;
                img.code-img {
                    width: 3.5rem;
                    height: 3.5rem;
                }
                span.close-rqcode{
                    position: absolute;
                    top: -0.7rem;
                    right: 0.3rem;
                    img{
                        width: 0.4rem;
                    }
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
            height: 60px;
            line-height: 60px;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            flex: 1;
            font-size: 25px;
            li {
                height: inherit;
                line-height: inherit;
            }
            li:nth-child(1) {
                flex: 0.1;
                margin-left: 5px;
                i.iconfont {
                    font-size: 20px;
                }
            }
            li:nth-child(2).bookTitle {
                flex: 0.8;
                overflow: hidden;
                font-size: 18px;
                white-space: nowrap;
                text-overflow: ellipsis;
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
            li:nth-child(3) {
                flex: 0.2;
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
                    border: 1px solid RGBA(153, 153, 153, 1);
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
                li.selected {
                    border: 1px solid #000;
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
                width: 200px;

                div.mt-range {
                    width: inherit;
                    div.currEndPage {
                        color: #fb7124;
                        font-size: 12px;
                        position: absolute;
                        top: 40%;
                        left: 48%;
                        span{
                            display: inline-block;
                            width: 10px;
                            height: 10px;
                            -webkit-animation: spin 2s linear infinite;
                            animation: spin 2s linear infinite;
                            background-image: url('../../assets/basic/loading.png');
                            background-repeat: no-repeat;
                            background-size: contain;
                            background-position: center;
                        }
                    }
                    div.mt-range-content {
                        width: inherit;
                        margin-right: 20px;
                        div.mt-range-runway {
                            right: -20px;
                        }
                        div.mt-range-progress {
                            background: #fb7124;
                        }
                        div.mt-range-thumb {
                            position: absolute;
                            top: 10%;
                            width: 20px;
                            height: 20px;
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.4);
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
                // line-height: 1rem;
                display: inline-block;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                position: relative;
                box-sizing: border-box;
                // ul {
                //     width: inherit;
                //     display: inline-block;
                // }
            }
            .readable{
                // color: #cecece !important;
            }
            .readable::before{
                content: '';
                background-image: url('http://124.193.177.45:50695/epub/lock.svg');
                background-position: left center;
                background-repeat: no-repeat;
                background-size: cover;
                width: 14px;
                height: 14px;
                position: absolute;
                top: 50%;
                margin-top: -10px;
                right: 0;
            }
            li {
                span:nth-child(2) {
                    width: 0.2rem;
                    height: 0.1rem;
                    display: inline-block;
                    margin-left: 0.15rem;
                    img {
                        width: inherit;
                        height: initial;
                    }
                }
            }
            li.selected {
                color: #2053e4;
            }
        }
    }
    div#touch-wrap {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 60;
        div.l {
            // width: 35vw;
            width: 25vw;
            height: inherit;
        }
        div.c {
            width: 50vw;
            height: 100%;
        }
        div.r {
            // width: 35vw;
            width: 25vw;
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

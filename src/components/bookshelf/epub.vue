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
          <i class="iconfont epub-jiantou" @click="history.go(-1)"></i>
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

      <!-- <div class="percent_wrap">
        <vue-slider v-model="value"></vue-slider>
      </div> -->
      <ul>
        <li><i class="iconfont epub-sort" @click="ifClickHidden()"></i></li>
        <li><i class="iconfont epub-sanjiaojiantoushang" @click="ePubPrev()"></i></li>
        <li>
          
        </li>
        <li><i class="iconfont epub-sanjiaojiantoushang" @click="ePubNext()"></i></li>
        <li><i class="iconfont epub-shezhi" @click="setBGFun()" ></i></li>
        <li class="setting_wrap"></li>
      </ul>
      
    </div>
    
    <div class="foot_wrap2"
         v-else
         :class="HiddenFlag ? 'SetiingHiddenA' : 'SetiingHiddenB'">
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
         v-if="!ifHiddenFlag">

    </div>

  </div>
</template>

<script>
export default {
    name:'epub',
    data () {
        return {

        }
    }
}
</script>

<style lang="less" scoped>

</style>


<template>
	<div class="epub-index-wrap">
    <div id="touch-wrap">
        <v-touch class="l" @tap="ePubPrev()" @swipeleft="ePubPrev()"></v-touch>
        <v-touch class="c" id="touch-center" @tap="ifClickHidden()"></v-touch>
        <v-touch class="r" @tap="ePubNext()" @swipeleft="ePubNext()"></v-touch>
    </div>
    
    <div id="ePubArea"></div>
    
    
    <!-- <div id="toc-wrap">
      <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-epub-sort"></use>
      </svg>
      <ul id="toc"></ul>      
    </div> -->

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
    this.ePubStream();
    // this.epubLoad()
  },
  mounted() {
    // this.clickHidden();
  },
  methods: {
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
    ePubStream() {
      // this.$http.get('http://124.204.40.3:50696/content/authorize')
      // this.$http.get('http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub')
      // url ="http://demo.cabpv2.api.kingchannels.cn/files/test/源文件.epub"
      
      $.ajax({
        type: "post",
        url: "http://124.204.40.3:50696/content/authorize",
        data: {
          authorzieParameters: JSON.stringify({
            contentexternalid: "29552-Epub",
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
          let $el,
            $iframe,
            zip,
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
          
          
          Indicator.close();
          // 临时关闭加载动画
          $el = document.getElementById("ePubArea");
          // 从返回结果里得到epub地址
          // _epubUrl = data.Data.Url;
          // 测试Epub地址
          _epubUrl =
            "http://demo.cabpv2.api.kingchannels.cn/files/encrypted/2c0/6dfe60feebd24297b1052bc65452715e_0_654595_encrypted.epub";
            // "http://demo.cabpv2.api.kingchannels.cn/files/test/源文件.epub"
            // "http://demo.cabpv2.api.kingchannels.cn/files/test/二次加密.epub"
          // bookInfo
          
          if (!localStorage.epubBookInfo) {
            localStorage.epubBookInfo = JSON.stringify({
              devicekey: "tb)DPkFKpWJ5H7uL",
              decryptObj: "^4fSY0aUwPl8%Buv"
            })
          }
          
          // 声明一个新的epub对象，并使用base64/blob来替换静态资源选项
          _book = new ePub(_epubUrl,{ replacements: "string" });
          // 拿到加密的key字符串
          // _ePubKey = data.Data.Key;
          // _devicekey
          _devicekey = "tb)DPkFKpWJ5H7uL";
          // 真实解密得到的key
          // _decryptObj = aes.decrypt(_ePubKey,_devicekey)
          // 模拟密钥
          _decryptObj = "^4fSY0aUwPl8%Buv";
          // console.log(_decryptObj1,_decryptObj2,'解密key得到的结果')

          _book.ready.then(content => {
            // var _decryptAfterToU8
            // 打开图书时判断档案是否存在，且拿到u8
            if (_book.archive) {
              
              // 遍历测试
                let epubCanonical,epuCfiBase,epubHref,epubUrl
                // 拿到spine下的所有xhtml
                _getSpine = _book.spine.items
                // 遍历赋值
                for (let i in _getSpine) {
                  epubCanonical = _getSpine[i].canonical
                  epuCfiBase = _getSpine[i].cfiBase
                  epubHref = _getSpine[i].href
                  epubUrl = _getSpine[i].url
                  _book.archive.zip.folder("OPS").file(epubHref).async("uint8array")
                }

                // 把epub资源赋值给对象                
                
                // console.log(_book.archive,'_book.archive')
                // _getEpubFiles = _book.archive.zip.folder("OPS").file(epubHref).async("uint8array")
                // _getEpubFiles.then(u8 => {
                  // console.log(_book.archive.zip.folder("OPS").file(epubHref),'_data.compressedContent')
                  // console.log(u8,'得到正确的uint8array')
                  // 对u8进行解密 转换等操作
                  // _beforeChangeHtml = _getEpubFiles.then(u8 => {
                    
                    // _encryptu8 = window.btoa(String.fromCharCode.apply(null, u8));
                    // console.log(_encryptu8,'解密前的u8转成的base64')
                    // _decryptu8 = aes.decrypt(_encryptu8, _decryptObj);
                    // console.log(_decryptu8,'解密返回的结果')
                    // this.decryptAfterToU8 = aes.stringify(_decryptu8);
                    // console.log(this.decryptAfterToU8.toString(),'jszip.CompressedObject()')
                    // wordarray 转成 uint8array
                    // return this.decryptAfterToU8
                    // _book.open(this.decryptAfterToU8)

                    // this.rendition = _book.renderTo('ePubArea', { width: "100vw" });
                    // this.rendition.display()
                  // })
                // })
                
                // console.log(epubCanonical,epuCfiBase,epubHref,epubUrl)

            }
          });

          // 渲染时修改页面内容
          // this.rendition.hooks.content.register(contents => {

          //   let rootDocment = contents.root("iframe");
          //   rootDocment.setAttribute('srcdoc','<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN" xmlns:epub="http://www.idpf.org/2007/ops"><head><title /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><link rel="stylesheet" type="text/css" href="css/main.css" /></head><body><h1 id="Acd6a11f5-5e0b-4019-be0a-cb0562b7a714">第12章 智能建筑工程项目风险管理</h1><p>由于智能建筑工程项目的特点，决定了在项目实施过程中存在着大量的不确定因素，这些不确定因素无疑会给项目的目标实现带来影响。其中有些影响甚至是灾难性的，智能建筑工程项目的风险就是指那些在项目实施过程中可能出现的灾难性事件或不满意的结果。</p><p>风险事件发生的不确定性，是由于外部环境千变万化，也因为智能建筑工程项目本身的复杂性和人们预测能力的局限性。风险事件是一种潜在性的可能事件，无论人们是否喜欢，风险是不以人的意志为转移的。但这并不意味着风险是无法避免的。风险的存在要求人们要积极面对风险，做到有备无患，才能将风险的影响减到最小。</p><h2 id="Abd397ad0-50ec-467f-875e-fde4fb79e527">12.1 工程项目风险管理概述</h2><p>可以说，风险存在于任何工程项目中，并往往会给工程项目的推进和工程项目的成功带来负面影响。当前，智能建筑工程项目风险高是个不争的事实，工程项目的规模越大、技术越新、越复杂，其风险程度就越高。</p><p>不过，人们也无须过分地恐惧风险，只要掌握风险发生的因果关系，风险是可以管理并得到控制的。关注项目风险，掌握风险管理的知识与技能，从项目组织、职责、流程与制度上建立一套风险管理机制是确保项目成功的前提与保障。</p><h3 id="Ac44c5814-9e83-47e0-b00f-03c913cab8b9">12.1.1 项目风险管理的概念</h3><p><b>1.项目风险管理的定义</b></p><p>什么是风险?从词源学上看，风险（RISK）一词可以追溯到古代拉丁语“RESCUM”，意思是“在海上遭遇损失或伤害的可能性”，或“危险的、应避免的东西”。经济学对风险的定义是指出现损失或损害的可能性。该定义强调了常与风险相关的消极方面，以及所涉及的不确定性。换言之，任何风险都包括两个基本要素：一是风险因素发生的不确定性；二是风险发生带来的损失。</p><p>风险管理是一个识别和度量项目风险，制定、选择和管理风险处理方案的系列过程。风险管理的目标是减少风险的危害程度，它包括将积极因素所产生的影响最大化和使消极因素产生的影响最小化两方面内容。</p><p>项目风险管理是指为了最好地达到项目的目标，识别、分配、应对、减少和避免项目生命期内风险的现代科学管理方法。</p><p>从资源分配的角度来看，风险管理是一项投资，也就是说，风险管理需要花费与识别风险、分析风险和规避减轻风险相关的成本。项目风险管理的成本必须包括在项目成本、进度和资源的计划编制中。风险效用或风险承受度是指从潜在回报中得到满足或快乐的程度。风险喜好者乐于高风险，风险厌恶者不喜欢冒险，风险中性者试图在风险和潜在回报之间取得平衡。</p><p>项目风险管理涉及分析和决定对付风险的备选战略，它是一种行业准则，要求项目团队不断地评估什么会对项目产生消极的影响，并确定这些事件发生的概率，以及确定这些事件如果发生所造成的影响。风险管理中包含的四个主要过程是：风险识别、风险量化、风险应对计划的制定和风险应对控制。风险管理计划是风险管理的重要工作。</p><p>智能建筑工程项目经常涉及下列风险：缺乏用户的参与、缺少高级管理层的支持、不明确的用户需求、拙劣的计划编制等等。利用项目管理知识领域的一般风险条件表，有助于识别智能建筑工程项目的潜在风险。</p><p>近十几年来，人们在项目管理系统中提出了全面风险管理的概念。全面风险管理是用系统的、动态的方法进行风险控制，以减少项目实行过程中的不确定性。它不仅使各层次的项目管理者建立风险意识，重视风险问题，防患于未然，而且在各个阶段、各个方面实施有效的风险控制，形成一个前后连贯的管理过程。</p><p><b>2.项目风险管理的重要性</b></p><p>一般情况下，项目的立项、可行性研究及设计与计划等都是基于正常的、理想的技术、管理和组织以及对将来情况（政治、经济、社会等各方面）预测的基础之上而进行的。而在项目的实际运行实施过程中，所有的这些因素都可能产生变化，而这些变化将可能使原定的目标受到干扰甚至不能实现，这些事先不能确定的内部和外部的干扰因素就是项目风险，风险即是项目中的不可靠因素。风险会造成项目实施的失控现象，如工期延长、成本增加、计划修改、投资加大等，这些都会造成经济效益的降低，甚至项目的失败。</p><p>正是由于风险会造成很大的伤害，在现代项目管理中，风险管理已成为必不可少的重要一环。良好的风险管理能获得巨大的经济效果，同时它有助于企业竞争能力的提高，素质和管理水平的提高。风险管理，一个经常被忽略的项目管理领域，却常常能够在通往项目最终成功的道路上，取得重大的进步。</p><p>大多数重大工程项目都要受一系列计划的指导，这些计划规定了一系列合理和预定的过程，经过这些过程，项目得以执行。风险管理计划是这一系列指导文件的敏感部分。这种计划可用于公布风险管理规划过程的结果或最新状态。</p><p>在项目开始前，项目风险管理人员就应制订项目风险管理计划，并在项目进行的过程中，实行目标管理，进行有效的指挥和协调。项目风险管理实质上是整个组织全体成员的共同任务，没有广大群众的参与，是无法实现目标的，因此，实行风险目标管理要求自上而下层层展开，又要求自下而上层层保证风险管理目标的实现。在管理实践过程中要群策群力，积极发挥所有员工能动的作用，开发他们的潜在积极性和能力。</p><p>风险管理对选择项目、确定项目范围和制定现实的进度计划和成本估算有积极的影响。风险管理有助于项目利益相关者了解项目的核心本质，使团队成员参与确定优势与劣势，并有助于结合其他项目管理知识领域来评估项目的优劣、可行性和成功率。</p><p>此外，要记住重要的一点：项目风险管理是一种投资，与其相关的会发生一些项目成本。在许多方面，项目风险管理像是保险的一种形式，它是为减轻潜在的不利事件对项目的影响而采取的一项活动。一个项目愿意在风险管理活动中进行的投资，取决于项目的本质、项目团队的经验和两者的约束条件。在任何情况下，项目风险管理的成本不应超过潜在的收益。</p><p><b>3.项目风险管理的过程</b></p><p>根据《建设工程项目管理规范》的规定：企业应建立风险管理体系，明确各层次管理人员的风险管理责任，减少项目实施过程中的不确定因素对项目的影响。项目风险管理过程应包括项目实施全过程的风险识别、风险评估、风险响应和风险控制。</p><p>（1）<b>项目风险识别</b></p></body></html>')
          //   rootDocment.innerHTML = '<h1 id="Acd6a11f5-5e0b-4019-be0a-cb0562b7a714">第12章 智能建筑工程项目风险管理</h1><p>由于智能建筑工程项目的特点，决定了在项目实施过程中存在着大量的不确定因素，这些不确定因素无疑会给项目的目标实现带来影响。其中有些影响甚至是灾难性的，智能建筑工程项目的风险就是指那些在项目实施过程中可能出现的灾难性事件或不满意的结果。</p><p>风险事件发生的不确定性，是由于外部环境千变万化，也因为智能建筑工程项目本身的复杂性和人们预测能力的局限性。风险事件是一种潜在性的可能事件，无论人们是否喜欢，风险是不以人的意志为转移的。但这并不意味着风险是无法避免的。风险的存在要求人们要积极面对风险，做到有备无患，才能将风险的影响减到最小。</p><h2 id="Abd397ad0-50ec-467f-875e-fde4fb79e527">12.1 工程项目风险管理概述</h2><p>可以说，风险存在于任何工程项目中，并往往会给工程项目的推进和工程项目的成功带来负面影响。当前，智能建筑工程项目风险高是个不争的事实，工程项目的规模越大、技术越新、越复杂，其风险程度就越高。</p><p>不过，人们也无须过分地恐惧风险，只要掌握风险发生的因果关系，风险是可以管理并得到控制的。关注项目风险，掌握风险管理的知识与技能，从项目组织、职责、流程与制度上建立一套风险管理机制是确保项目成功的前提与保障。</p><h3 id="Ac44c5814-9e83-47e0-b00f-03c913cab8b9">12.1.1 项目风险管理的概念</h3><p><b>1.项目风险管理的定义</b></p><p>什么是风险?从词源学上看，风险（RISK）一词可以追溯到古代拉丁语“RESCUM”，意思是“在海上遭遇损失或伤害的可能性”，或“危险的、应避免的东西”。经济学对风险的定义是指出现损失或损害的可能性。该定义强调了常与风险相关的消极方面，以及所涉及的不确定性。换言之，任何风险都包括两个基本要素：一是风险因素发生的不确定性；二是风险发生带来的损失。</p><p>风险管理是一个识别和度量项目风险，制定、选择和管理风险处理方案的系列过程。风险管理的目标是减少风险的危害程度，它包括将积极因素所产生的影响最大化和使消极因素产生的影响最小化两方面内容。</p><p>项目风险管理是指为了最好地达到项目的目标，识别、分配、应对、减少和避免项目生命期内风险的现代科学管理方法。</p><p>从资源分配的角度来看，风险管理是一项投资，也就是说，风险管理需要花费与识别风险、分析风险和规避减轻风险相关的成本。项目风险管理的成本必须包括在项目成本、进度和资源的计划编制中。风险效用或风险承受度是指从潜在回报中得到满足或快乐的程度。风险喜好者乐于高风险，风险厌恶者不喜欢冒险，风险中性者试图在风险和潜在回报之间取得平衡。</p><p>项目风险管理涉及分析和决定对付风险的备选战略，它是一种行业准则，要求项目团队不断地评估什么会对项目产生消极的影响，并确定这些事件发生的概率，以及确定这些事件如果发生所造成的影响。风险管理中包含的四个主要过程是：风险识别、风险量化、风险应对计划的制定和风险应对控制。风险管理计划是风险管理的重要工作。</p><p>智能建筑工程项目经常涉及下列风险：缺乏用户的参与、缺少高级管理层的支持、不明确的用户需求、拙劣的计划编制等等。利用项目管理知识领域的一般风险条件表，有助于识别智能建筑工程项目的潜在风险。</p><p>近十几年来，人们在项目管理系统中提出了全面风险管理的概念。全面风险管理是用系统的、动态的方法进行风险控制，以减少项目实行过程中的不确定性。它不仅使各层次的项目管理者建立风险意识，重视风险问题，防患于未然，而且在各个阶段、各个方面实施有效的风险控制，形成一个前后连贯的管理过程。</p><p><b>2.项目风险管理的重要性</b></p><p>一般情况下，项目的立项、可行性研究及设计与计划等都是基于正常的、理想的技术、管理和组织以及对将来情况（政治、经济、社会等各方面）预测的基础之上而进行的。而在项目的实际运行实施过程中，所有的这些因素都可能产生变化，而这些变化将可能使原定的目标受到干扰甚至不能实现，这些事先不能确定的内部和外部的干扰因素就是项目风险，风险即是项目中的不可靠因素。风险会造成项目实施的失控现象，如工期延长、成本增加、计划修改、投资加大等，这些都会造成经济效益的降低，甚至项目的失败。</p><p>正是由于风险会造成很大的伤害，在现代项目管理中，风险管理已成为必不可少的重要一环。良好的风险管理能获得巨大的经济效果，同时它有助于企业竞争能力的提高，素质和管理水平的提高。风险管理，一个经常被忽略的项目管理领域，却常常能够在通往项目最终成功的道路上，取得重大的进步。</p><p>大多数重大工程项目都要受一系列计划的指导，这些计划规定了一系列合理和预定的过程，经过这些过程，项目得以执行。风险管理计划是这一系列指导文件的敏感部分。这种计划可用于公布风险管理规划过程的结果或最新状态。</p><p>在项目开始前，项目风险管理人员就应制订项目风险管理计划，并在项目进行的过程中，实行目标管理，进行有效的指挥和协调。项目风险管理实质上是整个组织全体成员的共同任务，没有广大群众的参与，是无法实现目标的，因此，实行风险目标管理要求自上而下层层展开，又要求自下而上层层保证风险管理目标的实现。在管理实践过程中要群策群力，积极发挥所有员工能动的作用，开发他们的潜在积极性和能力。</p><p>风险管理对选择项目、确定项目范围和制定现实的进度计划和成本估算有积极的影响。风险管理有助于项目利益相关者了解项目的核心本质，使团队成员参与确定优势与劣势，并有助于结合其他项目管理知识领域来评估项目的优劣、可行性和成功率。</p><p>此外，要记住重要的一点：项目风险管理是一种投资，与其相关的会发生一些项目成本。在许多方面，项目风险管理像是保险的一种形式，它是为减轻潜在的不利事件对项目的影响而采取的一项活动。一个项目愿意在风险管理活动中进行的投资，取决于项目的本质、项目团队的经验和两者的约束条件。在任何情况下，项目风险管理的成本不应超过潜在的收益。</p><p><b>3.项目风险管理的过程</b></p><p>根据《建设工程项目管理规范》的规定：企业应建立风险管理体系，明确各层次管理人员的风险管理责任，减少项目实施过程中的不确定因素对项目的影响。项目风险管理过程应包括项目实施全过程的风险识别、风险评估、风险响应和风险控制。</p><p>（1）<b>项目风险识别</b></p>'
          //   console.log(rootDocment, "rootDocment");
          // });


          // ul 侧边栏
          _book.loaded.navigation.then(getToc => {

            let _ul, _url, _docfrag, _item, _link;

            _ul = document.getElementById("toc");
            _docfrag = document.createDocumentFragment();

            // console.log(getToc.parse(),'getToc.get()')
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

          // console.log(this.rendition, "this.rendition final");
        }
      });
    },
    /**
     * 载入 epub
     */
    epubLoad() {
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
    },
    /**
     * 下一页
     * @author 李啸竹
     */
    ePubNext() {
      this.rendition.next();
    },
    /**
     * 上一页
     * @author 李啸竹
     */
    ePubPrev() {
      this.rendition.prev();
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

import Vue from 'vue'
import { resolve } from 'url';
import { rejects } from 'assert';

export default {

  /**
     * 获取所有的排行榜类型
     * @returns {null}
     */
  getRankType () {
    return Vue.http.get('/rank-category')
  },

  /**
     * 根据id获取排行榜
     * @returns {String} id为周榜id，月榜id，总榜id
     */
  getRankList (id) {
    return Vue.http.get('/ranking/' + id)
  },

  /**
     * 获取所有分类
     * @returns {null}
     * http://api.zhuishushenqi.com/cats/lv2
     */
  getCategory () {
    return Vue.http.get('/categories')
  },

  /**
     * 获取细分的类别
     */
  getCategoryDetail () {
    return Vue.http.get('/sub-categories')
  },

  /**
     * 根据分类获取小说列表
     * @param {String} gender 可选：male/female/press
     * @param {String} type 可选：hot(热门)/new(新书）/reputation(好评)/over(完结)/monthly(包月)
     * @param {String} major
     * @param {String} minor
     * @param {Number} start
     * @param {Number} limit
     * http://novel.juhe.im/category-info?gender=male&type=hot&major=奇幻&minor=&start=0&limit=20
     */
  // todo 入参需要用es6优化
  getNovelListByCat (gender, type, major, minor = '', start = 0, limit = 20) {
    return Vue.http.get('/category-info?gender=' + gender + '&type=' + type + '&major=' + major + '&minor=' + minor + '&start=' + start + '&limit=' + limit)
  },

  /**
     * 根据id获取小说
     * @param {String} bookId 小说id
     */
  getBook (bookId) {
    return Vue.http.get('/book-info/' + bookId)
  },

  /**
     * 获取小说源(正版源)
     * @param {String} bookId 小说id
     * http://novel.juhe.im/book-sources?view=summary&book=567d2cb9ee0e56bc713cb2c0
     */
  getGenuineSource (bookId) {
    // return Vue.http.get('/book-sources?view=summary&book=' + bookId)
    return Vue.http.get('/book-sources?view=summary&book=' + bookId)
  },

  /**
     * 获取小说源(正版源与盗版源)
     * @param {String} bookId 小说id
     * 'http://api.zhuishushenqi.com/atoc?view=summary&book=548d9c17eb0337ee6df738f5'
     */
  getMixSource (bookId) {
    return Vue.http.get('/book-sources?view=summary&book=' + bookId)
  },

  /**
     * 获取小说章节（混合源，大概可认为是正版网站的公众章节+最快更新的盗版网站章节的混合）
     * @param {String} bookId 小说id
     *  http://api.zhuishushenqi.com/mix-atoc/50bff3ec209793513100001c?view=chapters
     */
  getMixChapters (bookId) {
    return Vue.http.get('/atoc/' + bookId + '?view=chapters')
  },

  /**
     * 获取小说章节
     * @param {String} sourceId 小说源id
     */
  getChapters (sourceId) {
    return Vue.http.get('/book-chapters/' + sourceId)
  },

  /**
     * 获取小说章节内容
     * @param {String} chapterUrl 章节url
     * http://chapterup.zhuishushenqi.com/chapter/http://vip.zhuishushenqi.com/chapter/5817f1161bb2ca566b0a5973?cv=1481275033588
     */
  getBookChapterContent (chapterUrl) {
    return Vue.http.get('http://chapter2.zhuishushenqi.com/chapter/' + chapterUrl)
  },

  /**
     * 获取搜索热词
     * @returns {null}
     */
  getHotWords () {
    return Vue.http.get('/search?keyword=')
  },

  /**
     * 搜索自动补充
     * @param {String} searchWord 搜索内容
     * http://api05iye5.zhuishushenqi.com/book/auto-complete?query=%E6%96%97%E7%BD%97
     */
  autoComplete (searchWord) {
    return Vue.http.get('/search?keyword=' + searchWord)
  },

  /**
     * 模糊搜索
     *  @param {String} searchWord 搜索内容
     */
  fuzzySearch (searchWord) {
    return Vue.http.get('/search?keyword=' + searchWord)
  },
  /**
     * 获取小说最新章节（书架）
     * @param {Array} bookList 获取更新的小说id
     * http://api05iye5.zhuishushenqi.com/book?view=updated&id=531169b3173bfacb4904ca67,51d11e782de6405c45000068
     * http://novel.juhe.im/chapters/http%3A%2F%2Fvip.zhuishushenqi.com%2Fchapter%2F56f8da09176d03ac1983f6d7%3Fcv%3D1486473051386
     */
  async getUpdate (bookList) {
    // return Vue.http.get('/book-info/' + bookList[1])
    // return new Promise((resolve,reject) => {
    //   resolve(() => {
    //     bookList.map(item => {
    //       return Vue.http.get('/book-info/' + item)
    //     })
    //   })
    // })

    // return new Promise((resolve,reject)=>{
      let _tempArray = {},
          _temp = {}
      
      for (let i = 0; i < bookList.length; i++) {
        _tempArray[i] = new Promise ((resolve, rejects) => {
          resolve(Vue.http.get('/book-info/' + bookList[i]))
        })
        // _tempArray[i] = new Promise ((resolve, rejects) => {
        //   resolve(Vue.http.get('/book-info/' + bookList[i]))
        // })
        // return _tempArray[i]
      }
      return _tempArray
    // })
   
  }

}

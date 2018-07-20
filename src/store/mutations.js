import {
  SET_RANK,
  SET_BACK_POSITION,
  SET_CURRENT_SOURCE,
  SET_SEC_PATH,
  SET_THIRD_PATH,
  SET_HEAD_TITLE,
  SET_READ_BOOK,
  SET_EPUB_BOOK,
  SET_EPUB_PREV,
  SET_EPUB_NEXT,
  EPUB_LOAD,
  GET_EPUB_TOC
} from './mutationsType'

export default {
  [SET_RANK] (state, rankDetail) {
    state.weekRankId = rankDetail._id
    state.monthRankId = rankDetail.monthRank
    state.totalRankId = rankDetail.totalRank
    state.headTitle = rankDetail.shortTitle
  },
  [SET_BACK_POSITION] (state, position) {
    state.previousPosition = position
  },
  [SET_CURRENT_SOURCE] (state, source) {
    state.source = source
  },
  [SET_SEC_PATH] (state, prePath) {
    state.backPath.secPath = prePath
  },
  [SET_THIRD_PATH] (state, prePath) {
    state.backPath.thirdPath = prePath
  },
  [SET_HEAD_TITLE] (state, text) {
    state.headTitle = text
  },
  [SET_READ_BOOK] (state, book) {
    state.bookInfo = book
  },
  [SET_EPUB_BOOK] (state, ePubBookPath, ePubOptions) {
    state.ePubOptions = ePubOptions
    state.ePubBook = ePub(ePubBookPath,ePubOptions)
  },
  [SET_EPUB_PREV] (state, ePubPrev) {
    state.ePubPrev = ePubPrev
  },
  [SET_EPUB_NEXT] (state, ePubNext) {
    state.ePubNext = ePubNext
  },
  [EPUB_LOAD] (state, loadPath) {
    state.loadPath = loadPath
  },
  [GET_EPUB_TOC] (state, getToc) {
    state.getToc = getToc
  }
}

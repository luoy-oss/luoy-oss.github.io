document.addEventListener('DOMContentLoaded', function () {
  let headerContentWidth, $nav
  let mobileSidebarOpen = false

  const adjustMenu = init => {
    const getAllWidth = ele => {
      let width = 0
      ele.length && Array.from(ele).forEach(i => { width += i.offsetWidth })
      return width
    }

    if (init) {
      const blogInfoWidth = getAllWidth(document.querySelector('#blog-info > a').children)
      const menusWidth = getAllWidth(document.getElementById('menus').children)
      headerContentWidth = blogInfoWidth + menusWidth
      $nav = document.getElementById('nav')
    }

    let hideMenuIndex = ''
    if (window.innerWidth <= 768) hideMenuIndex = true
    else hideMenuIndex = headerContentWidth > $nav.offsetWidth - 120

    if (hideMenuIndex) {
      $nav.classList.add('hide-menu')
    } else {
      $nav.classList.remove('hide-menu')
    }
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true)
    $nav.classList.add('show')
  }

  // sidebar menus
  const sidebarFn = {
    open: () => {
      btf.sidebarPaddingR()
      document.body.style.overflow = 'hidden'
      btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
      document.getElementById('sidebar-menus').classList.add('open')
      mobileSidebarOpen = true
    },
    close: () => {
      const $body = document.body
      $body.style.overflow = ''
      $body.style.paddingRight = ''
      btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
      document.getElementById('sidebar-menus').classList.remove('open')
      mobileSidebarOpen = false
    }
  }

  /**
   * 首頁top_img底下的箭頭
   */
  const scrollDownInIndex = () => {
    const $scrollDownEle = document.getElementById('scroll-down')
    $scrollDownEle && $scrollDownEle.addEventListener('click', function () {
      btf.scrollToDest(document.getElementById('content-inner').offsetTop, 300)
    })
  }

  /**
   * 首頁線條動畫
   */
  const initHomeLineAnimation = () => {
    if (!GLOBAL_CONFIG_SITE.isHome) {
      window.__homeLineAnimator && window.__homeLineAnimator.destroy()
      window.__homeLineAnimator = null
      return
    }

    const canvas = document.getElementById('line-canvas')
    const header = document.getElementById('page-header')
    if (!canvas || !header) return

    window.__homeLineAnimator && window.__homeLineAnimator.destroy()
    const animator = createHomeLineAnimator(canvas, header)
    if (!animator) return
    window.__homeLineAnimator = animator
    let hasPlayed = false
    let shouldForcePlay = false
    try {
      hasPlayed = window.sessionStorage && window.sessionStorage.getItem('homeLinePlayed') === '1'
      const navEntry = window.performance && window.performance.getEntriesByType
        ? window.performance.getEntriesByType('navigation')[0]
        : null
      const navType = navEntry && navEntry.type ? navEntry.type : ''
      shouldForcePlay = navType === 'reload' || navType === 'navigate'
    } catch (error) {
      hasPlayed = false
      shouldForcePlay = true
    }

    if (shouldForcePlay) {
      animator.initOnce(() => {
        try {
          window.sessionStorage && window.sessionStorage.setItem('homeLinePlayed', '1')
        } catch (error) {
          // ignore
        }
      })
    } else if (hasPlayed) {
      animator.renderStatic()
    } else {
      animator.initOnce(() => {
        try {
          window.sessionStorage && window.sessionStorage.setItem('homeLinePlayed', '1')
        } catch (error) {
          // ignore
        }
      })
    }
  }

  /**
   * 創建首頁線條動畫控制器
   */
  const createHomeLineAnimator = (canvas, header) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const baseRoot = GLOBAL_CONFIG.root.endsWith('/') ? GLOBAL_CONFIG.root : `${GLOBAL_CONFIG.root}/`
    const dataUrl = `${baseRoot}line.json`
    const maxPoints = 8000
    let resizeObserver = null
    let rafId = 0
    let resizeHandler = null
    let points = []
    let mappedPoints = []
    let startTime = 0
    let lastDrawCount = 0
    let lastProgress = 0
    let drawOrder = []
    let canvasWidth = 0
    let canvasHeight = 0
    let destroyed = false
    let completed = false
    let mode = 'once'
    const getDuration = () => {
      const config = GLOBAL_CONFIG && GLOBAL_CONFIG.lineAnimation ? GLOBAL_CONFIG.lineAnimation : {}
      const modeValue = config.mode || 'sequence'
      const durationValue = modeValue === 'random'
        ? Number(config.random_duration || config.duration || 3000)
        : Number(config.duration || 3000)
      return Number.isFinite(durationValue) && durationValue > 0 ? durationValue : 3000
    }

    /**
     * 取得點集位置配置
     */
    const getPositionConfig = () => {
      const config = GLOBAL_CONFIG && GLOBAL_CONFIG.lineAnimation ? GLOBAL_CONFIG.lineAnimation : {}
      const modeValue = config.position_mode || 'center'
      const ratio = config.offset_ratio || {}
      const ratioX = Number(ratio.x)
      const ratioY = Number(ratio.y)
      const scaleValue = Number(config.scale)
      return {
        mode: modeValue,
        offsetXRatio: normalizeRatio(ratioX),
        offsetYRatio: normalizeRatio(ratioY),
        scale: normalizeScale(scaleValue)
      }
    }

    /**
     * 正規化偏移占比
     */
    const normalizeRatio = value => {
      if (!Number.isFinite(value)) return 0
      return Math.max(-1, Math.min(1, value))
    }

    const normalizeScale = value => {
      if (!Number.isFinite(value)) return 1
      return Math.max(0.1, Math.min(2, value))
    }

    /**
     * 取得位置錨點
     */
    const getPositionAnchor = modeValue => {
      switch (modeValue) {
        case 'left_top':
          return { anchorX: 0, anchorY: 0 }
        case 'left_bottom':
          return { anchorX: 0, anchorY: 1 }
        case 'right_top':
          return { anchorX: 1, anchorY: 0 }
        case 'right_bottom':
          return { anchorX: 1, anchorY: 1 }
        case 'middle_left':
          return { anchorX: 0, anchorY: 0.5 }
        case 'middle_right':
          return { anchorX: 1, anchorY: 0.5 }
        default:
          return { anchorX: 0.5, anchorY: 0.5 }
      }
    }
    const pointRadius = 0.5
    const pointSprite = createPointSprite(pointRadius)
    const spriteHalfSize = pointSprite ? pointSprite.width / 2 : 0

    /**
     * 建立點的離屏貼圖
     */
    function createPointSprite (radius) {
      const size = Math.max(4, Math.ceil(radius * 6))
      const sprite = document.createElement('canvas')
      sprite.width = size
      sprite.height = size
      const spriteCtx = sprite.getContext('2d')
      if (!spriteCtx) return null

      const center = size / 2
      const glowRadius = radius * 3
      const gradient = spriteCtx.createRadialGradient(center, center, 0, center, center, glowRadius)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.7)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      spriteCtx.fillStyle = gradient
      spriteCtx.beginPath()
      spriteCtx.arc(center, center, glowRadius, 0, Math.PI * 2)
      spriteCtx.fill()
      return sprite
    }

    /**
     * 下採樣點集
     */
    const downsample = list => {
      if (!list || list.length <= maxPoints) return list || []
      const step = Math.ceil(list.length / maxPoints)
      return list.filter((_, index) => index % step === 0)
    }

    /**
     * 計算點集邊界
     */
    const getBounds = list => {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      list.forEach(item => {
        minX = Math.min(minX, item.x)
        minY = Math.min(minY, item.y)
        maxX = Math.max(maxX, item.x)
        maxY = Math.max(maxY, item.y)
      })

      return { minX, minY, maxX, maxY }
    }

    /**
     * 映射點集到畫布坐標
     */
    const mapPoints = (list, width, height) => {
      if (!list.length || width === 0 || height === 0) {
        return []
      }

      const padding = Math.max(20, Math.min(width, height) * 0.06)
      const { minX, minY, maxX, maxY } = getBounds(list)
      const rangeX = Math.max(1, maxX - minX)
      const rangeY = Math.max(1, maxY - minY)
      const fitScale = Math.min((width - padding * 2) / rangeX, (height - padding * 2) / rangeY)
      const { mode, offsetXRatio, offsetYRatio, scale } = getPositionConfig()
      const appliedScale = fitScale * scale
      const { anchorX, anchorY } = getPositionAnchor(mode)
      const availableX = Math.max(0, width - rangeX * appliedScale)
      const availableY = Math.max(0, height - rangeY * appliedScale)
      const offsetX = availableX * anchorX - minX * appliedScale + availableX * offsetXRatio
      const offsetY = availableY * anchorY - minY * appliedScale + availableY * offsetYRatio

      const mapped = list.map(point => ({
        x: point.x * appliedScale + offsetX,
        y: point.y * appliedScale + offsetY
      }))

      return mapped
    }

    /**
     * 重置畫布尺寸並重新映射點集
     */
    const resizeCanvas = () => {
      canvasWidth = header.clientWidth
      canvasHeight = header.clientHeight
      if (!canvasWidth || !canvasHeight) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(canvasWidth * dpr)
      canvas.height = Math.round(canvasHeight * dpr)
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      mappedPoints = mapPoints(points, canvasWidth, canvasHeight)
      const modeValue = GLOBAL_CONFIG && GLOBAL_CONFIG.lineAnimation ? GLOBAL_CONFIG.lineAnimation.mode : 'sequence'
      if (modeValue === 'random') {
        drawOrder = buildRandomOrder(mappedPoints.length)
      } else {
        drawOrder = Array.from({ length: mappedPoints.length }, (_, index) => index)
      }
      startTime = 0
      lastDrawCount = 0
      lastProgress = 0
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      if (mode === 'static' || completed) {
        renderFull()
      }
    }

    /**
     * 繪製指定區間點集
     */
    /**
     * 產生隨機順序索引
     */
    const buildRandomOrder = count => {
      const order = Array.from({ length: count }, (_, index) => index)
      for (let i = count - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = order[i]
        order[i] = order[j]
        order[j] = temp
      }
      return order
    }

    /**
     * 繪製指定區間點集
     */
    const getPointByOrder = index => {
      const orderIndex = drawOrder[index]
      return mappedPoints[orderIndex]
    }

    const drawPointsRange = (fromIndex, toIndex) => {
      if (fromIndex >= toIndex) return
      if (pointSprite) {
        for (let i = fromIndex; i < toIndex; i++) {
          const point = getPointByOrder(i)
          ctx.drawImage(pointSprite, point.x - spriteHalfSize, point.y - spriteHalfSize)
        }
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.beginPath()
        for (let i = fromIndex; i < toIndex; i++) {
          const point = getPointByOrder(i)
          ctx.moveTo(point.x + pointRadius, point.y)
          ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2)
        }
        ctx.fill()
      }
    }

    /**
     * 靜態渲染全部點集
     */
    const renderFull = () => {
      if (!mappedPoints.length) return
      if (!drawOrder.length || drawOrder.length !== mappedPoints.length) {
        drawOrder = Array.from({ length: mappedPoints.length }, (_, index) => index)
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      drawPointsRange(0, mappedPoints.length)
      lastDrawCount = mappedPoints.length
      lastProgress = 1
    }

    /**
     * 繪製當前動畫幀
     */
    const drawOnce = (time, onComplete) => {
      if (destroyed) return
      if (!mappedPoints.length) {
        rafId = requestAnimationFrame(nextTime => drawOnce(nextTime, onComplete))
        return
      }

      if (!startTime) startTime = time
      const elapsed = time - startTime
      const duration = getDuration()
      const progress = Math.min(1, elapsed / duration)
      const visibleCount = Math.max(1, Math.floor(progress * mappedPoints.length))
      drawPointsRange(lastDrawCount, visibleCount)

      lastDrawCount = visibleCount
      lastProgress = progress
      if (progress < 1) {
        rafId = requestAnimationFrame(nextTime => drawOnce(nextTime, onComplete))
      } else {
        completed = true
        if (typeof onComplete === 'function') onComplete()
      }
    }

    /**
     * 加載點集數據
     */
    const loadData = async () => {
      if (window.__homeLineData) return window.__homeLineData
      const response = await fetch(dataUrl)
      const data = await response.json()
      window.__homeLineData = data
      return data
    }

    /**
     * 初始化動畫（只播放一次）
     */
    const initOnce = async onComplete => {
      try {
        const data = await loadData()
        points = downsample(data)
        completed = false
        mode = 'once'
        resizeCanvas()
        if (window.ResizeObserver) {
          resizeObserver = new ResizeObserver(resizeCanvas)
          resizeObserver.observe(header)
        } else {
          resizeHandler = () => resizeCanvas()
          window.addEventListener('resize', resizeHandler)
        }
        rafId = requestAnimationFrame(nextTime => drawOnce(nextTime, onComplete))
      } catch (error) {
        destroy()
      }
    }

    /**
     * 靜態渲染
     */
    const renderStatic = async () => {
      try {
        const data = await loadData()
        points = downsample(data)
        completed = true
        mode = 'static'
        resizeCanvas()
        if (window.ResizeObserver) {
          resizeObserver = new ResizeObserver(resizeCanvas)
          resizeObserver.observe(header)
        } else {
          resizeHandler = () => resizeCanvas()
          window.addEventListener('resize', resizeHandler)
        }
        renderFull()
      } catch (error) {
        destroy()
      }
    }

    /**
     * 銷毀動畫並清理資源
     */
    const destroy = () => {
      destroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      if (resizeObserver) resizeObserver.disconnect()
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    }

    return { initOnce, renderStatic, destroy }
  }

  /**
   * 代碼
   * 只適用於Hexo默認的代碼渲染
   */
  const addHighlightTool = function () {
    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const isHighlightCopy = highLight.highlightCopy
    const isHighlightLang = highLight.highlightLang
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const highlightHeightLimit = highLight.highlightHeightLimit
    const isShowTool = isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined
    const $figureHighlight = highLight.plugin === 'highlighjs' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

    const isPrismjs = highLight.plugin === 'prismjs'

    let highlightShrinkEle = ''
    let highlightCopyEle = ''
    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''

    if (isHighlightShrink !== undefined) {
      highlightShrinkEle = `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>`
    }

    if (isHighlightCopy) {
      highlightCopyEle = '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>'
    }

    const copy = (text, ctx) => {
      if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        document.execCommand('copy')
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.success)
        } else {
          const prevEle = ctx.previousElementSibling
          prevEle.innerText = GLOBAL_CONFIG.copy.success
          prevEle.style.opacity = 1
          setTimeout(() => { prevEle.style.opacity = 0 }, 700)
        }
      } else {
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
        } else {
          ctx.previousElementSibling.innerText = GLOBAL_CONFIG.copy.noSupport
        }
      }
    }

    // click events
    const highlightCopyFn = (ele) => {
      const $buttonParent = ele.parentNode
      $buttonParent.classList.add('copy-true')
      const selection = window.getSelection()
      const range = document.createRange()
      if (isPrismjs) range.selectNodeContents($buttonParent.querySelectorAll('pre code')[0])
      else range.selectNodeContents($buttonParent.querySelectorAll('table .code pre')[0])
      selection.removeAllRanges()
      selection.addRange(range)
      const text = selection.toString()
      copy(text, ele.lastChild)
      selection.removeAllRanges()
      $buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = (ele) => {
      const $nextEle = [...ele.parentNode.children].slice(1)
      ele.firstChild.classList.toggle('closed')
      if (btf.isHidden($nextEle[$nextEle.length - 1])) {
        $nextEle.forEach(e => { e.style.display = 'block' })
      } else {
        $nextEle.forEach(e => { e.style.display = 'none' })
      }
    }

    const highlightToolsFn = function (e) {
      const $target = e.target.classList
      if ($target.contains('expand')) highlightShrinkFn(this)
      else if ($target.contains('copy-button')) highlightCopyFn(this)
    }

    const expandCode = function () {
      this.classList.toggle('expand-done')
    }

    function createEle (lang, item, service) {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
        hlTools.addEventListener('click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        ele.addEventListener('click', expandCode)
        fragment.appendChild(ele)
      }

      if (service === 'hl') {
        item.insertBefore(fragment, item.firstChild)
      } else {
        item.parentNode.insertBefore(fragment, item)
      }
    }

    if (isHighlightLang) {
      if (isPrismjs) {
        $figureHighlight.forEach(function (item) {
          const langName = item.getAttribute('data-language') ? item.getAttribute('data-language') : 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle(highlightLangEle, item)
        })
      } else {
        $figureHighlight.forEach(function (item) {
          let langName = item.getAttribute('class').split(' ')[1]
          if (langName === 'plain' || langName === undefined) langName = 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          createEle(highlightLangEle, item, 'hl')
        })
      }
    } else {
      if (isPrismjs) {
        $figureHighlight.forEach(function (item) {
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle('', item)
        })
      } else {
        $figureHighlight.forEach(function (item) {
          createEle('', item, 'hl')
        })
      }
    }
  }

  /**
   * PhotoFigcaption
   */
  function addPhotoFigcaption () {
    document.querySelectorAll('#article-container img').forEach(function (item) {
      const parentEle = item.parentNode
      const altValue = item.title || item.alt
      if (altValue && !parentEle.parentNode.classList.contains('justified-gallery')) {
        const ele = document.createElement('div')
        ele.className = 'img-alt is-center'
        ele.textContent = altValue
        parentEle.insertBefore(ele, item.nextSibling)
      }
    })
  }

  /**
   * Lightbox
   */
  const runLightbox = () => {
    btf.loadLightbox(document.querySelectorAll('#article-container img:not(.no-lightbox)'))
  }

  /**
   * justified-gallery 圖庫排版
   */
  const runJustifiedGallery = function (ele) {
    const htmlStr = arr => {
      let str = ''
      const replaceDq = str => str.replace(/"/g, '&quot;') // replace double quotes to &quot;
      arr.forEach(i => {
        const alt = i.alt ? `alt="${replaceDq(i.alt)}"` : ''
        const title = i.title ? `title="${replaceDq(i.title)}"` : ''
        str += `<div class="fj-gallery-item"><img src="${i.url}" ${alt + title}"></div>`
      })
      return str
    }

    const lazyloadFn = (i, arr, limit) => {
      const loadItem = limit
      const arrLength = arr.length
      if (arrLength > loadItem) i.insertAdjacentHTML('beforeend', htmlStr(arr.splice(0, loadItem)))
      else {
        i.insertAdjacentHTML('beforeend', htmlStr(arr))
        i.classList.remove('lazyload')
      }
      return arrLength > loadItem ? loadItem : arrLength
    }

    const fetchUrl = async (url) => {
      const response = await fetch(url)
      return await response.json()
    }

    const runJustifiedGallery = (item, arr) => {
      if (!item.classList.contains('lazyload')) item.innerHTML = htmlStr(arr)
      else {
        const limit = item.getAttribute('data-limit')
        lazyloadFn(item, arr, limit)
        const clickBtnFn = () => {
          const lastItemLength = lazyloadFn(item, arr, limit)
          fjGallery(item, 'appendImages', item.querySelectorAll(`.fj-gallery-item:nth-last-child(-n+${lastItemLength})`))
          btf.loadLightbox(item.querySelectorAll('img'))
          lastItemLength < limit && item.nextElementSibling.removeEventListener('click', clickBtnFn)
        }
        item.nextElementSibling.addEventListener('click', clickBtnFn)
      }
      btf.initJustifiedGallery(item)
      btf.loadLightbox(item.querySelectorAll('img'))
    }

    const addJustifiedGallery = () => {
      ele.forEach(item => {
        item.classList.contains('url')
          ? fetchUrl(item.textContent).then(res => { runJustifiedGallery(item, res) })
          : runJustifiedGallery(item, JSON.parse(item.textContent))
      })
    }

    if (window.fjGallery) {
      addJustifiedGallery()
      return
    }

    getCSS(`${GLOBAL_CONFIG.source.justifiedGallery.css}`)
    getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(addJustifiedGallery)
  }

  /**
   * rightside scroll percent
   */
  const rightsideScrollPercent = currentTop => {
    const perNum = btf.getScrollPercent(currentTop, document.body)
    const $goUp = document.getElementById('go-up')
    if (perNum < 95) {
      $goUp.classList.add('show-percent')
      $goUp.querySelector('.scroll-percent').textContent = perNum
    } else {
      $goUp.classList.remove('show-percent')
    }
  }

  /**
   * 滾動處理
   */
  const scrollFn = function () {
    const $rightside = document.getElementById('rightside')
    const innerHeight = window.innerHeight + 56

    // 當滾動條小于 56 的時候
    if (document.body.scrollHeight <= innerHeight) {
      $rightside.style.cssText = 'opacity: 1; transform: translateX(-58px)'
      return
    }

    // find the scroll direction
    function scrollDirection (currentTop) {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }

    let initTop = 0
    let isChatShow = true
    const $header = document.getElementById('page-header')
    const isChatBtnHide = typeof chatBtnHide === 'function'
    const isChatBtnShow = typeof chatBtnShow === 'function'
    const isShowPercent = GLOBAL_CONFIG.percent.rightside

    const scrollTask = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      const isDown = scrollDirection(currentTop)
      if (currentTop > 56) {
        if (isDown) {
          if ($header.classList.contains('nav-visible')) $header.classList.remove('nav-visible')
          if (isChatBtnShow && isChatShow === true) {
            chatBtnHide()
            isChatShow = false
          }
        } else {
          if (!$header.classList.contains('nav-visible')) $header.classList.add('nav-visible')
          if (isChatBtnHide && isChatShow === false) {
            chatBtnShow()
            isChatShow = true
          }
        }
        $header.classList.add('nav-fixed')
        if (window.getComputedStyle($rightside).getPropertyValue('opacity') === '0') {
          $rightside.style.cssText = 'opacity: 0.8; transform: translateX(-58px)'
        }
      } else {
        if (currentTop === 0) {
          $header.classList.remove('nav-fixed', 'nav-visible')
        }
        $rightside.style.cssText = "opacity: ''; transform: ''"
      }

      isShowPercent && rightsideScrollPercent(currentTop)

      if (document.body.scrollHeight <= innerHeight) {
        $rightside.style.cssText = 'opacity: 0.8; transform: translateX(-58px)'
      }
    }, 200)

    window.scrollCollect = scrollTask

    window.addEventListener('scroll', scrollCollect)
  }

  /**
  * toc,anchor
  */
  const scrollFnToDo = function () {
    const isToc = GLOBAL_CONFIG_SITE.isToc
    const isAnchor = GLOBAL_CONFIG.isAnchor
    const $article = document.getElementById('article-container')

    if (!($article && (isToc || isAnchor))) return

    let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('card-toc')
      $cardToc = $cardTocLayout.getElementsByClassName('toc-content')[0]
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      window.mobileToc = {
        open: () => {
          $cardTocLayout.style.cssText = 'animation: toc-open .3s; opacity: 1; right: 55px'
        },

        close: () => {
          $cardTocLayout.style.animation = 'toc-close .2s'
          setTimeout(() => {
            $cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
          }, 100)
        }
      }

      // toc元素點擊
      $cardToc.addEventListener('click', e => {
        e.preventDefault()
        const target = e.target.classList
        if (target.contains('toc-content')) return
        const $target = target.contains('toc-link')
          ? e.target
          : e.target.parentElement
        btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI($target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          window.mobileToc.close()
        }
      })

      autoScrollToc = item => {
        const activePosition = item.getBoundingClientRect().top
        const sidebarScrollTop = $cardToc.scrollTop
        if (activePosition > (document.documentElement.clientHeight - 100)) {
          $cardToc.scrollTop = sidebarScrollTop + 150
        }
        if (activePosition < 100) {
          $cardToc.scrollTop = sidebarScrollTop - 150
        }
      }
    }

    // find head position & add active class
    const list = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let detectItem = ''
    const findHeadPosition = function (top) {
      if (top === 0) {
        return false
      }

      let currentId = ''
      let currentIndex = ''

      list.forEach(function (ele, index) {
        if (top > btf.getEleTop(ele) - 80) {
          const id = ele.id
          currentId = id ? '#' + encodeURI(id) : ''
          currentIndex = index
        }
      })

      if (detectItem === currentIndex) return

      if (isAnchor) btf.updateAnchor(currentId)

      detectItem = currentIndex

      if (isToc) {
        $cardToc.querySelectorAll('.active').forEach(i => { i.classList.remove('active') })

        if (currentId === '') {
          return
        }

        const currentActive = $tocLink[currentIndex]
        currentActive.classList.add('active')

        setTimeout(() => {
          autoScrollToc(currentActive)
        }, 0)

        if (isExpand) return
        let parent = currentActive.parentNode

        for (; !parent.matches('.toc'); parent = parent.parentNode) {
          if (parent.matches('li')) parent.classList.add('active')
        }
      }
    }

    // main of scroll
    window.tocScrollFn = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      if (isToc && GLOBAL_CONFIG.percent.toc) {
        $tocPercentage.textContent = btf.getScrollPercent(currentTop, $article)
      }
      findHeadPosition(currentTop)
    }, 100)

    window.addEventListener('scroll', tocScrollFn)
  }

  /**
   * Rightside
   */
  const rightSideFn = {
    switchReadMode: () => { // read-mode
      const $body = document.body
      $body.classList.add('read-mode')
      const newEle = document.createElement('button')
      newEle.type = 'button'
      newEle.className = 'fas fa-sign-out-alt exit-readmode'
      $body.appendChild(newEle)

      function clickFn () {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', clickFn)
      }

      newEle.addEventListener('click', clickFn)
    },
    switchDarkMode: () => { // Switch Between Light And Dark Mode
      const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      if (nowMode === 'light') {
        activateDarkMode()
        saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
      } else {
        activateLightMode()
        saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
      }
      // handle some cases
      typeof utterancesTheme === 'function' && utterancesTheme()
      typeof changeGiscusTheme === 'function' && changeGiscusTheme()
      typeof FB === 'object' && window.loadFBComment && window.loadFBComment()
      typeof runMermaid === 'function' && window.runMermaid()
    },
    showOrHideBtn: (e) => { // rightside 點擊設置 按鈕 展開
      const rightsideHideClassList = document.getElementById('rightside-config-hide').classList
      rightsideHideClassList.toggle('show')
      if (e.classList.contains('show')) {
        rightsideHideClassList.add('status')
        setTimeout(() => {
          rightsideHideClassList.remove('status')
        }, 300)
      }
      e.classList.toggle('show')
    },
    scrollToTop: () => { // Back to top
      btf.scrollToDest(0, 500)
    },
    hideAsideBtn: () => { // Hide aside
      const $htmlDom = document.documentElement.classList
      $htmlDom.contains('hide-aside')
        ? saveToLocal.set('aside-status', 'show', 2)
        : saveToLocal.set('aside-status', 'hide', 2)
      $htmlDom.toggle('hide-aside')
    },

    runMobileToc: () => {
      if (window.getComputedStyle(document.getElementById('card-toc')).getPropertyValue('opacity') === '0') window.mobileToc.open()
      else window.mobileToc.close()
    }
  }

  document.getElementById('rightside').addEventListener('click', function (e) {
    const $target = e.target.id ? e.target : e.target.parentNode
    switch ($target.id) {
      case 'go-up':
        rightSideFn.scrollToTop()
        break
      case 'rightside_config':
        rightSideFn.showOrHideBtn($target)
        break
      case 'mobile-toc-button':
        rightSideFn.runMobileToc()
        break
      case 'readmode':
        rightSideFn.switchReadMode()
        break
      case 'darkmode':
        rightSideFn.switchDarkMode()
        break
      case 'hide-aside-btn':
        rightSideFn.hideAsideBtn()
        break
      default:
        break
    }
  })

  /**
   * menu
   * 側邊欄sub-menu 展開/收縮
   */
  const clickFnOfSubMenu = () => {
    document.querySelectorAll('#sidebar-menus .site-page.group').forEach(function (item) {
      item.addEventListener('click', function () {
        this.classList.toggle('hide')
      })
    })
  }

  /**
   * 複製時加上版權信息
   */
  const addCopyright = () => {
    const copyright = GLOBAL_CONFIG.copyright
    document.body.oncopy = (e) => {
      e.preventDefault()
      let textFont; const copyFont = window.getSelection(0).toString()
      if (copyFont.length > copyright.limitCount) {
        textFont = copyFont + '\n' + '\n' + '\n' +
        copyright.languages.author + '\n' +
        copyright.languages.link + window.location.href + '\n' +
        copyright.languages.source + '\n' +
        copyright.languages.info
      } else {
        textFont = copyFont
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }
  }

  /**
   * 網頁運行時間
   */
  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.innerText = btf.diffDate(publishDate) + ' ' + GLOBAL_CONFIG.runtime
    }
  }

  /**
   * 最後一次更新時間
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.innerText = btf.diffDate(lastPushDate, true)
    }
  }

  /**
   * table overflow
   */
  const addTableWrap = () => {
    const $table = document.querySelectorAll('#article-container :not(.highlight) > table, #article-container > table')
    if ($table.length) {
      $table.forEach(item => {
        btf.wrap(item, 'div', { class: 'table-wrap' })
      })
    }
  }

  /**
   * tag-hide
   */
  const clickFnOfTagHide = function () {
    const $hideInline = document.querySelectorAll('#article-container .hide-button')
    if ($hideInline.length) {
      $hideInline.forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this
          $this.classList.add('open')
          const $fjGallery = $this.nextElementSibling.querySelectorAll('.fj-gallery')
          $fjGallery.length && btf.initJustifiedGallery($fjGallery)
        })
      })
    }
  }

  const tabsFn = {
    clickFnOfTabs: function () {
      document.querySelectorAll('#article-container .tab > button').forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this
          const $tabItem = $this.parentNode

          if (!$tabItem.classList.contains('active')) {
            const $tabContent = $tabItem.parentNode.nextElementSibling
            const $siblings = btf.siblings($tabItem, '.active')[0]
            $siblings && $siblings.classList.remove('active')
            $tabItem.classList.add('active')
            const tabId = $this.getAttribute('data-href').replace('#', '')
            const childList = [...$tabContent.children]
            childList.forEach(item => {
              if (item.id === tabId) item.classList.add('active')
              else item.classList.remove('active')
            })
            const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId} .fj-gallery`)
            if ($isTabJustifiedGallery.length > 0) {
              btf.initJustifiedGallery($isTabJustifiedGallery)
            }
          }
        })
      })
    },
    backToTop: () => {
      document.querySelectorAll('#article-container .tabs .tab-to-top').forEach(function (item) {
        item.addEventListener('click', function () {
          btf.scrollToDest(btf.getEleTop(btf.getParents(this, '.tabs')), 300)
        })
      })
    }
  }

  const toggleCardCategory = function () {
    const $cardCategory = document.querySelectorAll('#aside-cat-list .card-category-list-item.parent i')
    if ($cardCategory.length) {
      $cardCategory.forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.preventDefault()
          const $this = this
          $this.classList.toggle('expand')
          const $parentEle = $this.parentNode.nextElementSibling
          if (btf.isHidden($parentEle)) {
            $parentEle.style.display = 'block'
          } else {
            $parentEle.style.display = 'none'
          }
        })
      })
    }
  }

  const switchComments = function () {
    let switchDone = false
    const $switchBtn = document.querySelector('#comment-switch > .switch-btn')
    $switchBtn && $switchBtn.addEventListener('click', function () {
      this.classList.toggle('move')
      document.querySelectorAll('#post-comment > .comment-wrap > div').forEach(function (item) {
        if (btf.isHidden(item)) {
          item.style.cssText = 'display: block;animation: tabshow .5s'
        } else {
          item.style.cssText = "display: none;animation: ''"
        }
      })

      if (!switchDone && typeof loadOtherComment === 'function') {
        switchDone = true
        loadOtherComment()
      }
    })
  }

  const addPostOutdateNotice = function () {
    const data = GLOBAL_CONFIG.noticeOutdate
    const diffDay = btf.diffDate(GLOBAL_CONFIG_SITE.postUpdate)
    if (diffDay >= data.limitDay) {
      const ele = document.createElement('div')
      ele.className = 'post-outdate-notice'
      ele.textContent = data.messagePrev + ' ' + diffDay + ' ' + data.messageNext
      const $targetEle = document.getElementById('article-container')
      if (data.position === 'top') {
        $targetEle.insertBefore(ele, $targetEle.firstChild)
      } else {
        $targetEle.appendChild(ele)
      }
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })
  }

  const relativeDate = function (selector) {
    selector.forEach(item => {
      const $this = item
      const timeVal = $this.getAttribute('datetime')
      $this.innerText = btf.diffDate(timeVal, true)
      $this.style.display = 'inline'
    })
  }

  const unRefreshFn = function () {
    window.addEventListener('resize', () => {
      adjustMenu(false)
      btf.isHidden(document.getElementById('toggle-menu')) && mobileSidebarOpen && sidebarFn.close()
    })

    document.getElementById('menu-mask').addEventListener('click', e => { sidebarFn.close() })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyload && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()
  }

  window.refreshFn = function () {
    initAdjust()

    if (GLOBAL_CONFIG_SITE.isPost) {
      GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      toggleCardCategory()
    }

    scrollFnToDo()
    GLOBAL_CONFIG_SITE.isHome && scrollDownInIndex()
    initHomeLineAnimation()
    addHighlightTool()
    GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption()
    scrollFn()

    const $jgEle = document.querySelectorAll('#article-container .fj-gallery')
    $jgEle.length && runJustifiedGallery($jgEle)

    runLightbox()
    addTableWrap()
    clickFnOfTagHide()
    tabsFn.clickFnOfTabs()
    tabsFn.backToTop()
    switchComments()
    document.getElementById('toggle-menu').addEventListener('click', () => { sidebarFn.open() })
  }

  refreshFn()
  unRefreshFn()
})

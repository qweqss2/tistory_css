$(document).ready(function(){
  var h = $(".column-center-inner").height();
  $("#sidebar-right-1").height(h + 'px');
});

$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: 'https://api.signal.bz/news/realtime',
    dataType: 'json',
    success: function(data) {
      var names = data.top10;
      p_text = '';
      $.each(names, function(index, e) {
        rk = e.rank;
        rks = String(rk).padStart(2, '-')
        rks = rks.replace('-', '&nbsp;');
        kw = e.keyword;

        p_text += '<li> ' + rks + '. <a href=\"https://search.naver.com/search.naver?where=news&sort=1&query='+kw+'\" target=\"_new\">' + kw + '</a></li>';
      });

      $('#asideRight').html(p_text);
    }
  });
});

+function ($) { "use strict";

  /**
   * The zoom service
   */
  function ZoomService () {
    this._activeZoom            =
    this._initialScrollPosition =
    this._initialTouchPosition  =
    this._touchMoveListener     = null

    this._$document = $(document)
    this._$window   = $(window)
    this._$body     = $(document.body)

    this._boundClick = $.proxy(this._clickHandler, this)
  }

  ZoomService.prototype.listen = function () {
    this._$body.on('click', '[data-action="zoom"]', $.proxy(this._zoom, this))
  }

  ZoomService.prototype._zoom = function (e) {
    var target = e.target

    if (!target || target.tagName != 'IMG') return

    if (this._$body.hasClass('zoom-overlay-open')) return

    if (e.metaKey || e.ctrlKey) return window.open(e.target.src, '_blank')

    if (target.width >= (window.innerWidth - Zoom.OFFSET)) return

    this._activeZoomClose(true)

    this._activeZoom = new Zoom(target)
    this._activeZoom.zoomImage()

    // todo(fat): probably worth throttling this
    this._$window.on('scroll.zoom', $.proxy(this._scrollHandler, this))

    this._$document.on('keyup.zoom', $.proxy(this._keyHandler, this))
    this._$document.on('touchstart.zoom', $.proxy(this._touchStart, this))

    // we use a capturing phase here to prevent unintended js events
    // sadly no useCapture in jquery api (http://bugs.jquery.com/ticket/14953)
    document.addEventListener('click', this._boundClick, true)

    e.stopPropagation()
  }

  ZoomService.prototype._activeZoomClose = function (forceDispose) {
    if (!this._activeZoom) return

    if (forceDispose) {
      this._activeZoom.dispose()
    } else {
      this._activeZoom.close()
    }

    this._$window.off('.zoom')
    this._$document.off('.zoom')

    document.removeEventListener('click', this._boundClick, true)

    this._activeZoom = null
  }

  ZoomService.prototype._scrollHandler = function (e) {
    if (this._initialScrollPosition === null) this._initialScrollPosition = window.scrollY
    var deltaY = this._initialScrollPosition - window.scrollY
    if (Math.abs(deltaY) >= 40) this._activeZoomClose()
  }

  ZoomService.prototype._keyHandler = function (e) {
    if (e.keyCode == 27) this._activeZoomClose()
  }

  ZoomService.prototype._clickHandler = function (e) {
    e.stopPropagation()
    e.preventDefault()
    this._activeZoomClose()
  }

  ZoomService.prototype._touchStart = function (e) {
    this._initialTouchPosition = e.touches[0].pageY
    $(e.target).on('touchmove.zoom', $.proxy(this._touchMove, this))
  }

  ZoomService.prototype._touchMove = function (e) {
    if (Math.abs(e.touches[0].pageY - this._initialTouchPosition) > 10) {
      this._activeZoomClose()
      $(e.target).off('touchmove.zoom')
    }
  }

  /**
   * The zoom object
   */
  function Zoom (img) {
    this._fullHeight      =
    this._fullWidth       =
    this._overlay         =
    this._targetImageWrap = null

    this._targetImage = img

    this._$body = $(document.body)

    this._transitionDuration = 300
  }

  Zoom.OFFSET = 80 //margins

  Zoom.prototype.zoomImage = function () {
    var img = document.createElement('img')
    img.onload = $.proxy(function () {
      this._fullHeight = Number(img.height)
      this._fullWidth = Number(img.width)
      this._zoomOriginal()
    }, this)
    img.src = this._targetImage.src
  }

  Zoom.prototype._zoomOriginal = function () {
    this._targetImageWrap           = document.createElement('div')
    this._targetImageWrap.className = 'zoom-img-wrap'

    this._targetImage.parentNode.insertBefore(this._targetImageWrap, this._targetImage)
    this._targetImageWrap.appendChild(this._targetImage)

    $(this._targetImage)
      .addClass('zoom-img')
      .attr('data-action', 'zoom-out')

    this._overlay           = document.createElement('div')
    this._overlay.className = 'zoom-overlay'

    document.body.appendChild(this._overlay)

    this._calculateZoom()
    this._triggerAnimation()
  }

  Zoom.prototype._calculateZoom = function () {
    this._targetImage.offsetWidth // repaint before animating

    var originalFullImageWidth  = this._fullWidth
    var originalFullImageHeight = this._fullHeight

    var scrollTop = window.scrollY

    var viewportHeight = (window.innerHeight - Zoom.OFFSET)
    var viewportWidth  = (window.innerWidth - Zoom.OFFSET)

    var viewportAspectRatio = viewportWidth / viewportHeight

    var imageAspectRatio = originalFullImageWidth / originalFullImageHeight
    var imageTargetAspectRatio = this._targetImage.width / this._targetImage.height

    this._trueHeight = this._targetImage.height
    this._trueWidth = this._targetImage.width

    if (imageAspectRatio < imageTargetAspectRatio) {
      this._trueHeight = (this._fullHeight * this._targetImage.width) / this._fullWidth

    } else {
      this._trueWidth = (this._fullWidth * this._targetImage.height) / this._fullHeight
    }

    var maxScaleFactor = originalFullImageWidth / this._trueWidth

    if (originalFullImageWidth < viewportWidth && originalFullImageHeight < viewportHeight) {
      this._imgScaleFactor = maxScaleFactor

    } else if (imageAspectRatio < viewportAspectRatio) {
      this._imgScaleFactor = (viewportHeight / originalFullImageHeight) * maxScaleFactor

    } else {
      this._imgScaleFactor = (viewportWidth / originalFullImageWidth) * maxScaleFactor
    }
  }

  Zoom.prototype._triggerAnimation = function () {
    this._targetImage.offsetWidth // repaint before animating

    var imageOffset = $(this._targetImage).offset()
    var scrollTop   = $(window).scrollTop()

    var viewportY = scrollTop + (window.innerHeight / 2)
    var viewportX = (window.innerWidth / 2)

    var imageCenterY = imageOffset.top + (this._trueHeight / 2)
    var imageCenterX = imageOffset.left + (this._trueWidth / 2)

    this._translateY = viewportY - imageCenterY
    this._translateX = viewportX - imageCenterX

    $(this._targetImage).velocity({
      scale: this._imgScaleFactor,
      height: this._trueHeight,
      width: this._trueWidth,
    }, this._transitionDuration);

    $(this._targetImageWrap).velocity({
      translateX: this._translateX,
      translateY: this._translateY,
      translateZ: 0,
    }, this._transitionDuration);


    this._$body.addClass('zoom-overlay-open')

}

  Zoom.prototype.close = function () {
    this._$body
      .removeClass('zoom-overlay-open')
      .addClass('zoom-overlay-transitioning')

    $(this._targetImage).velocity('reverse', { duration: this._transitionDuration });

    var myself = this

    $(this._targetImageWrap).velocity(
      {
        translateX: 0,
        translateY: 0,
      },
      {
        duration: this._transitionDuration,
        complete: function(elements) {
          myself.dispose() // should probably use proxy here
        }
      });

  }

  Zoom.prototype.dispose = function () {
    if (this._targetImageWrap && this._targetImageWrap.parentNode) {
      $(this._targetImage)
        .removeClass('zoom-img')
        .attr('data-action', 'zoom')
        .css({'width': '','height': '', 'transform': ''})

      this._targetImageWrap.parentNode.replaceChild(this._targetImage, this._targetImageWrap)
      this._overlay.parentNode.removeChild(this._overlay)

      this._$body.removeClass('zoom-overlay-transitioning')
    }
  }

  // wait for dom ready (incase script included before body)
  $(function () {
    $(".post-body img").attr( 'data-action', 'zoom' );
    new ZoomService().listen()
  })

}(jQuery)


$(document).ready(function(){

  $( window ).scroll( function() {
    if ( $( this ).scrollTop() > 200 ) { $( '.jb-top' ).fadeIn(); }
    else { $( '.jb-top' ).fadeOut(); }
  } );
  $( '.jb-top' ).click( function() { $( 'html, body' ).animate( { scrollTop : 0 }, 600 ); return false; } );
});
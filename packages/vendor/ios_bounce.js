$(function(){
  $(document.body).on('touchstart', '.ember-list-view', function(event){
    var target = $(event.target),
    scrollable = target.closest('.ember-list-view'),
    scrollFix = scrollable.data('scrollFix');

    if (!scrollFix) {
      scrollFix = new ScrollFix(scrollable[0], event.originalEvent);

      scrollable.data('scrollFix', scrollFix);
    }
  });
});

var ScrollFix = function(elem, event) {
  // Variables to track inputs
  var startY, startTopScroll,
  bouncyTouchStart = function(event){
    startY = event.touches[0].pageY;
    startTopScroll = elem.scrollTop;

    if(startTopScroll <= 0){
      elem.scrollTop = 1;
    }

    if(startTopScroll + elem.offsetHeight >= elem.scrollHeight) {
      elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
    }
  };

  elem.addEventListener('touchstart',  bouncyTouchStart, false);

  if(event){ bouncyTouchStart(event); }
};

$(document).ready(function(){
    $.ajax({
      type: 'GET',
      url: 'https://api.signal.bz/news/realtime',
      dataType: 'json',
      success: function(data) {
    
        var names = data.top10;
        console.log(names);
        p_text = '<li style=\"text-align:center;\">º 포탈 실시간 검색어 º</li>'
        $.each(names, function(index, e) {
          rk = e.rank;
          kw = e.keyword;
    
          p_text += '<li>' + rk + ' : <a href=\"https://search.naver.com/search.naver?query='+kw+'\" target=\"_new\">' + kw + '</a></li>';
        });
    
        $('#asideRight').html(p_text);
      }
    });
});
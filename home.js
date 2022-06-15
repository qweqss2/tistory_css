$(document).ready(function(){
    var currentdate = new Date(); 
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    
    console.log(datetime);
    
    $.ajax({
      type: 'GET',
      url: 'https://api.signal.bz/news/realtime',
      dataType: 'json',
      success: function(data) {
    
        var names = data.top10;
        console.log(names);
        p_text = ''
        $.each(names, function(index, e) {
          rk = e.rank;
          kw = e.keyword;
    
          p_text += '<li>' + rk + ' : <a href=\"https://search.naver.com/search.naver?query='+kw+'\" target=\"_new\">' + kw + '</a></li>';
        });
    
        $('#asideRight').html(p_text);
      }
    });
    
});
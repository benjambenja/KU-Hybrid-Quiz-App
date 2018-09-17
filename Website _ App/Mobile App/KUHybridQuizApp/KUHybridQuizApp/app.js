function postData(toPost) {
 $.ajax({
 url:"https://api.myjson.com/bins/18pz57",
 type:"PUT",
 data:'{"submissions":toPost}',
 contentType:"application/json; charset=utf-8",
 dataType:"json",    
});
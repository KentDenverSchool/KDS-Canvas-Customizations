/*
Handles non-google-docs files being embeded from drive and displays them in preview mode to prevent
rendering issues
*/
onPage(/\/courses\/\d+\/modules\/items/, function() {
    var url = $('#file_content');
    var url_src = url.attr('src');
    if(url_src.indexOf('drive.google.com') >= 0) {
        var str_arr = url_src.split("/");
        str_arr.pop();
        var new_url = str_arr.join('/') + "/preview";
        url.attr('src', new_url);
    }
}); 

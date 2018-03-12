$(document).ready(function() {
  $(".locale").each(function() {
    classes = $(this).attr("class").split(" ");
    $("." + classes[1]).text(chrome.i18n.getMessage(classes[1]));
  });
});

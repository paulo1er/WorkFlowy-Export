$(document).ready(function() {
  $("[data-translate]").each(function() {
    $(this).text(chrome.i18n.getMessage($(this).data("translate")));
  });
});

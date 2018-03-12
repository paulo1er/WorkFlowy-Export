(function() {
  function main() {
    chrome.storage.local.get(["preview_html", "preview_title"], function (option) {
      $('#content').html(option.preview_html);
      $('title').text(option.preview_title);
    });
  }
  window.onload = main;
}());

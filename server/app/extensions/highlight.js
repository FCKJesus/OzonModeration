(function(wordsToHighlight) {
    function highlightWords(words) {
        var bodyText = document.body.innerHTML;

        words.forEach(function(word) {
            var regex = new RegExp('\\b' + word + '\\b', 'g');
            bodyText = bodyText.replace(regex, '<span style="background-color: yellow;">' + word + '</span>');
        });

        document.body.innerHTML = bodyText;
    }

    // Parse the JSON string to an array
    var wordsArray = JSON.parse(wordsToHighlight);
    highlightWords(wordsArray);
})(arguments[0]);
// ==UserScript==
// @name         Funny Clicker
// @namespace    http://tampermonkey.net/
// @version      0.2
// @match 
// @description  Baby's first attempt at a userscript using plain JS.
// @author       You
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

function findByText(node, text) {
    if(node.nodeValue == text) {
        return node.parentNode;
    }

    for (var i = 0; i < node.childNodes.length; i++) {
        var returnValue = findByText(node.childNodes[i], text);
        if (returnValue != null) {
            return returnValue;
        }
    }

    return null;
}

function sliderslip() {
    var slider = document.querySelectorAll('input[type=range]')[1];
    // console.log(slider.value, slider.ariaValueNow);
    slider.value = Math.round(Math.random() * 4 + 6) + (Math.random() > 0.9 ? 1 : 0);
    slider.ariaValueNow = slider.value;
}

function funtime() {
  //do work
    var button;
    button = findByText(document, "Run");
    setInterval(function click() {
        console.log("Searching for a clickable....")
        sliderslip(); // slip the slider around randomly while checking if run is available.
        button = findByText(document, "Run");
        if (button != null) {
            var button2 = findByText(document, "Download");
            if (button2 != null) {
                button2.click();
                button.click();
            }
        }
    }, Math.random()*10000);
}

// trigger funtime when document.ready
var checkLoad = function() {
    document.readyState !== "complete" ? setTimeout(checkLoad, 10) : setTimeout(funtime, 5000);
};

checkLoad();


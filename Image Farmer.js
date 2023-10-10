// ==UserScript==
// @name         Image Scraper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant    GM.getValue
// @grant    GM.setValue
// ==/UserScript==

(async function() {
  'use strict';

    var baseURL = "https://*.com/";
    const badNames = new Set(["img"]);

    // https://stackoverflow.com/questions/62879340/gm-getvalue-is-undefined
    await GM.setValue("locked", false);

    // may require some CORS getaround: https://stackoverflow.com/a/46529778
    function toDataURL(url) {
        return fetch(url).then((response) => {
            return response.blob();
        }).then(blob => {
            return URL.createObjectURL(blob);
        });
    }

    async function imageSave() {
        var img = document.querySelectorAll(`[class*="lb-image"]`)[0];
        console.log("URL Check:: " + img.src);
        const fileN = img.src.split('/').slice(-1)[0].split('.')[0];
        const srcP = img.src.split('?')[0];
        const a = document.createElement("a");
        a.href = await toDataURL(srcP + '?original');
        a.download = badNames.has(fileN) ? "" : fileN;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function findByText(node, text) {
        if(node.nodeValue == text) return node.parentNode;

        for (var i = 0; i < node.childNodes.length; i++) {
            var returnValue = findByText(node.childNodes[i], text);
            if (returnValue != null) {
                return returnValue;
            }
        }

        return null;
    }

    async function funtime() {
        var locked = await GM.getValue("locked")
        var pageN = parseInt(window.location.href.split('/').slice(-1)[0]);
        if (!isNaN(pageN)) {
            if (!locked) {
                if (findByText(document, "에러 메세지")) {
                    window.location.href = baseURL + (pageN+1);
                } else {
                    await GM.setValue("locked", true);
                    console.log("Found an image page!");
                    var allImages = document.querySelectorAll('img');
                    var startImg;
                    for (let i = 0; i < allImages.length; ++i) {
                        let img = allImages[i];
                        if (img.src.startsWith('https://*.*.net')) {
                            startImg = img;
                            break;
                        }
                    }
                    startImg.click();

                    let lb = document.getElementById("lightbox");
                    while (!lb) {
                        lb = document.getElementById("lightbox");
                    }

                    var prevArrow = document.querySelectorAll(`[class*="lb-prev"]`)[0];
                    while (prevArrow.style.display != "none") {
                        nextArrow.click();
                    }
                    console.log("Clicked image. Awaiting next check");
                }
            } else {
                let lb = document.getElementById("lightbox");
                if (lb) {
                    var nextArrow = document.querySelectorAll(`[class*="lb-next"]`)[0];
                    // console.log(nextArrow.style.display);
                    while (nextArrow === null) {
                        nextArrow = document.querySelectorAll(`[class*="lb-next"]`)[0];
                    }
                    if (nextArrow !== null && nextArrow.style.display != "none") {
                        await imageSave();
                        nextArrow.click();
                    } else {
                        console.log("End of list.");
                        await imageSave();

                        await GM.setValue("locked", false);
                        window.location.href = baseURL + (pageN+1);
                    }
                }
            }
        } else {
            console.log("Invalid page. Ignoring");
        }
    }


    // trigger funtime when document.ready
    var checkLoad = async function() {
        document.readyState !== "complete" ? setTimeout(checkLoad, 1000) : setInterval(funtime, 10000);
    };

    checkLoad();
})();

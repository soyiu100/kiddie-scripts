// ==UserScript==
// @name         makawren Script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       You
// @match        http://www.*.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// ==/UserScript==

/**
Description of site being scraped:
Custom imageboard style site. Instead of being a feed (like the host's blog templating service does), it has posts collected and paginated to view.
There are odd quirks about the site, such as:
- "not a robot" button for first time visitors,
- js alert that would pop up (and block the script) if a page requested doesn't exist,
- unable to navigate away directly from an image page using window.location.href??
- clicking through pages as a non-robot user will not change the URL (this confused me for someone unfamiliar with PHP)

The first measure is easily counterable, by just clicking on it manually, as it doesn't trigger afterwards.
For the second measure, I needed to get the page URL indices of the images that I wanted to scrape. 
Thankfully, the link structure between pages were predictable to gather.
Then I needed to iterate through the pages and download the images, which uses a blunt and crude mass download tactic, 
  then set on an ample timeout before navigating away. (This can cause duplicate downloads in between the state changes. :) ) 
The third measure is truly confusing, and I'm still not sure if it's actually because of a bug in my script. 
  But to get around it, I navigate to the home page and back to the page I want, and it works.

The last reason this site was hell was not only the gatekeeping measures, but also the hosting company serving the images lost (deleted?) hundreds of old images from the early 2010s.
At first, I was frustrated thinking my script was faulty, only to realize the images were actually just forever lost, and that just made me sad.
*/
(function() {
    'use strict';

    function findValidPages() {
        let pageIDs = localStorage.getItem("pageIDs") ?? '[]';
        console.log(pageIDs);
        pageIDs = JSON.parse(pageIDs);
        let allLinks = document.querySelectorAll('a');
        allLinks.forEach((link) => {
            let urlSplit = link.href.split("document_srl=");
            if (!isNaN(urlSplit[1])) {
                pageIDs.push(parseInt(link.href.split("document_srl=")[1]));
            }
        });
        localStorage.setItem("pageIDs", JSON.stringify(pageIDs));
        let maka = (localStorage.getItem("maka") ?? 19) - 1;
        localStorage.setItem("maka", maka);
        window.location.href = 'http://www.*.com/xe/index.php?mid=master&category=339&page=' + maka;
    }

    function toDataURL(url) {
        return fetch(url).then((response) => {
            return response.blob();
        }).then(blob => {
            return URL.createObjectURL(blob);
        });
    }

    const badNames = new Set(["img"]);

    async function imageSave(img) {
        const fileN = img.getAttribute("filename") ? img.getAttribute("filename").split('.')[0] : img.src.split('/').slice(-1)[0].split('.')[0];
        let srcP;
        if (img.src.startsWith('https://*.net') || img.src.startsWith('https://*.net')) {
            srcP = img.src.split('?')[0];
        } else {
            let sp = img.src.split('image');
            if (sp[1]) {
                srcP = sp[0] + 'original' + sp[1];
            } else {
                srcP = img.src;
            }
        }
        const a = document.createElement("a");
        a.href = await toDataURL(srcP + '?original');
        a.download = badNames.has(fileN) ? "" : fileN;
        $(document.body).append( a );
        a.click();
        $(document.body).remove( a );
    }


    async function funtime() {
        let locked = localStorage.getItem("sweet_locked");
        if (locked == 0) {
            // https://stackoverflow.com/questions/62879340/gm-getvalue-is-undefined
            // await GM.setValue("misses", 0);
            localStorage.setItem("sweet_locked", 1);
            console.log("Found an image page!");
            var allImages = document.querySelectorAll('img');
            for (let i = 0; i < allImages.length; ++i) {
                let img = allImages[i];
                console.log(img.src)
                if (img.src.startsWith('https://*.net') || img.src.startsWith('https://*.net') || img.src.startsWith('http://*')) {
                    await imageSave(img);
                }
                img = null;
            }
        } else if (locked == 1) {
            console.log("final lock");
            localStorage.setItem("sweet_locked", 2);

            await new Promise(r => setTimeout(r, document.querySelectorAll('img').length * 914)).then(async () => {
                localStorage.setItem("sweet_locked", 0);
                let wren = localStorage.getItem("wren") ?? 0;
                localStorage.setItem("wren", parseInt(wren) + 1);
                window.location.href = 'http://www.*.com/xe/index.php' // deafult back to fp
            });
        }
    }


    // trigger funtime when document.ready
    var checkLoad = async function() {
        localStorage.setItem("sweet_locked", 0);

        //localStorage.removeItem("pageIDs");
        //localStorage.removeItem("maka");
        //localStorage.removeItem("wren");
        let maka = localStorage.getItem("maka") ?? 19; // info collector index
        let wren = localStorage.getItem("wren") ?? 0; // actual index of page index
        if (document.readyState !== "complete") {
            setTimeout(checkLoad, 500);
        } else {
            let targetURL;
            if (maka == 0) {
                let pageIDs = localStorage.getItem("pageIDs");
                pageIDs = JSON.parse(pageIDs);
                targetURL = 'http://www.*.com/xe/index.php?mid=master&document_srl=' + pageIDs[wren];
                if (targetURL != window.location.href) window.location.href = targetURL;
                setInterval(funtime, 500);
            } else {
                targetURL = 'http://www.*.com/xe/index.php?mid=master&category=339&page=' + maka;
                if (targetURL != window.location.href) window.location.href = targetURL;
                findValidPages();
            }
        }
    };

    checkLoad();
})();

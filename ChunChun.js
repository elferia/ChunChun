(async function() {
    'use strict';

    // 指定したレベルの譜面のスコアを取りに行く
    var fetchLevelRecord = function(level) {
        var FD = new FormData();
        FD.append('selected', level);
        FD.append('changeSelect', 'changeSelect');
        return getXHRPromise('https://chunithm-net.com/mobile/MusicLevel.html', FD);
    };

    // XHR Promiseの再発明
    var getXHRPromise = function(url, formData) {
        return new Promise((resolve, reject) => {
            var XHR = new XMLHttpRequest();
            XHR.addEventListener('load', function() { resolve(this); });
            // エラーを踏んだらサヨウナラ
            XHR.open(formData ? 'POST' : 'GET', url);
            XHR.responseType = 'document';
            XHR.send(formData || null);
        });
    };

    // レコード一覧ページから譜面のスコアを抽出してmusicDataに突っ込む
    var extractScore = function(recordDoc) {
        for (let musicElement of recordDoc.querySelectorAll('.musiclist_box')) {
            let scoreOuterElement = musicElement.querySelector('.play_musicdata_highscore');
            if (scoreOuterElement === null) {
                continue;
            }

            let difficulty = musicElement.classList.contains('bg_expert') ? 2 : 3; // Lv12以上にADVANCEDが来たら終わる
            let title = musicElement.querySelector('.music_title').innerText;
            let score = scoreOuterElement.querySelector('.text_b').innerText;
            musicData.push({difficulty: difficulty, title: title, score: parseInt(score.replace(/,/g, ''), 10)});
        }
    };

    // CHUNITHM【チュウニズム】攻略wikiから譜面定数を引っ張ってくる
    var fetchDLevel = function() {
        return getXHRPromise('https://cors-anywhere.herokuapp.com/https://chunithm.gamerch.com/CHUNITHM%20STAR%20%E6%A5%BD%E6%9B%B2%E4%B8%80%E8%A6%A7%EF%BC%88Lv%E9%A0%86%EF%BC%89');
    };

    // CHUNITHM【チュウニズム】攻略wikiページから譜面定数を抽出してdLevelOfに格納する
    var extractDLevel = function(musicListDoc) {
        for (let tableHeading of musicListDoc.querySelectorAll('.ui_box')) {
            if (!tableHeading.innerText.startsWith('Lv')) {
                continue;
            }

            let difficulty = -1;
            for (let row of tableHeading.nextElementSibling.querySelectorAll('tr')) {
                let isDifficultyColumn = row.childElementCount === 1 && row.firstElementChild.getAttribute('data-col') === '0';
                let isMusicRow = row.childElementCount === 3;

                if (isDifficultyColumn) {
                    difficulty = row.innerText === 'EXP' ? 2 : 3; // Lv11以上にADVANCEDが来たら終わる
                }
                if (isMusicRow) {
                    let title = row.querySelector('[data-col="2"]').innerText;
                    let dLevel = row.querySelector('[data-col="4"]').innerText;
                    dLevelOf[canonicalize(title, difficulty)] = parseFloat(dLevel);
                }
            }
        }
    };

    // musicDataとdLevelOfからレーティングを計算しmusicDataに格納する。合わせて譜面定数も格納する
    var calcRatings = function() {
        for (let data of musicData) {
            let bonus = 0;
            if (data.score >= 1007500) {
                bonus = 2;
            } else if (data.score >= 1005000) {
                bonus = 1.5 + (data.score - 1005000) * 10 / 50000;
            } else if (data.score >= 1000000) {
                bonus = 1 + (data.score - 1000000) * 5 / 50000;
            } else if (data.score >= 975000) {
                bonus = (data.score - 975000) * 2 / 50000;
            } else if (data.score >= 950000) {
                bonus = -1.5 + (data.score - 950000) * 3 / 50000;
            } else if (data.score >= 925000) {
                bonus = -3 + (data.score - 925000) * 3 / 50000;
            } else {
                bonus = -5 + (data.score - 900000) * 4 / 50000;
            }

            let dLevel = dLevelOf[canonicalize(data.title, data.difficulty)];
            data.dLevel = dLevel;
            data.rating = Math.floor((dLevel + bonus) * 100) / 100;
        }
    };

    // 曲名と難易度から正規化された譜面名を作る
    var canonicalize = function(title, difficulty) {
        return title.replace(/[\s!！'’[［\]］]/g, '') + difficulty;
    };

    // musicDataからtableを作って表示する
    var showMusicData = function() {
        var createTdElement = function(text) {
            let elem = document.createElement('td');
            elem.innerText = text;
            return elem;
        };

        let table = document.createElement('table');
        table.setAttribute('style', 'position: absolute; background-color: #fff; z-index: 030;');

        for (let data of musicData) {
            let row = document.createElement('tr');
            table.appendChild(row);

            row.appendChild(createTdElement(data.title));
            row.appendChild(createTdElement(data.difficulty === 2 ? 'EXPERT' : 'MASTER'));
            row.appendChild(createTdElement(data.dLevel));
            row.appendChild(createTdElement(data.rating));
        }

        document.body.insertBefore(table, document.body.firstChild);
        table.addEventListener('click', getCopierToClipboard(table));
    };

    // クリップボードにコピーする
    var getCopierToClipboard = function(copiedNode) {
        return function() {
            var selection = getSelection();
            if (selection.containsNode(copiedNode)) {
                return;
            }

            var range = document.createRange();
            range.selectNode(copiedNode);

            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
        };
    };

    var musicData = [];
    var dLevelOf = {};

    var p = (async function() {
        for (let i = 12; i < 15; ++i) {
            // うにネットはPOST-REDIRECT-GETを使っているので並列に取得してはいけない
            var XHR = await fetchLevelRecord(i);
            extractScore(XHR.response);
        }
    })();

    var q = (async function() {
        var XHR = await fetchDLevel();
        extractDLevel(XHR.response);
    })();

    await Promise.all([p, q]);
    calcRatings();
    musicData.sort(function(a, b) {
        if (isNaN(a.rating)) {
            return -1;
        }

        if (isNaN(b.rating)) {
            return 1;
        }

        return b.rating - a.rating;
    });
    showMusicData();
})();

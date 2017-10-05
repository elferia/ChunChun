# ChunChun
chunithm-netから譜面別レーティングを計算するbookmarklet

## 概要
（少し古いバージョンのスクリーンショットです）

![](https://raw.githubusercontent.com/elferia/ChunChun/master/abstract.PNG)

## インストール
まず下記リンクをブックマークツールバーにD&D

[ChunChun](https://github.com/elferia/ChunChun)

次にブックマークを編集して、リンクを以下のテキストに置き換え

```
javascript:(function(){var a=document.createElement('script');a.src='https://rawgit.com/elferia/ChunChun/master/ChunChun.user.js';document.body.appendChild(a)})();
```

## 使い方
1. chunithm-netにログイン
2. Aimeを選択する
3. ブックマークをクリック
4. 数秒ほど待つとレーティングの高い順に「曲名 - 難易度 - 譜面定数 - レーティング」が表示される
5. 表をクリックするとクリップボードにコピーされるので、スプレッドシートにペーストするなど
6. ページ遷移すれば消える

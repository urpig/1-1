# 小葵與阿公的煉金冒險：點石成金的真相

台灣國二下理化第一章《化學反應與化學計量》互動教材。本 repo 僅收錄這個單元。

## 五張探索卡片

1. 化學反應現象實驗室
2. 質量守恆實驗室
3. 原子、分子與莫耳
4. 化學反應式平衡器
5. 莫耳與化學計量工坊

四頁講義的觀念整合於操作、圖解與 22 題分步計算練習；科學名詞提供定義、例子和單位。進度保存在瀏覽器本機。

## 本機執行

需要 Node.js 24 或更新版本，無需安裝額外套件。

```sh
node server.mjs
```

開啟 http://127.0.0.1:4176/chemistry/index.html 。

## 建置與測試

```sh
node build-chemistry.mjs
node --test tests/chemistry.test.mjs
```

離線檔案輸出至 `outputs/chemistry-adventure.html`。`release/` 與 `outputs/` 不納入版本控制。

## 靜態網站

根目錄 `index.html` 會導向 `dist/chemistry/index.html`，可由 GitHub Pages 的 `main` 分支根目錄提供服務。

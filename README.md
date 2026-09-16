# 行銷管理課程前測問卷（互動式網頁版）

教學實踐研究計畫「在 GenAI 時代培養行銷教育中的認識論否決能力」之基線調查。
主持人：世新大學企業管理學系　林建江 助理教授。

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 互動式網頁問卷。單檔、無建置流程，採 Apple Human Interface Guidelines 設計語言 |
| `Code.gs` | Google Apps Script 後端：提供網頁、把作答寫入 Google 試算表、寄送填答副本 |
| `GoogleForm.gs` | 原始的 Google 表單自動生成腳本（題庫來源，可保留作為備援收案管道） |
| `appsscript.json` | Apps Script 專案資訊清單：時區、OAuth 範圍、網頁應用程式部署設定 |
| `.clasp.json.example` | 用 clasp 命令列部署時的設定範本 |

## 部署到 Google Apps Script

1. 建立一份 Google 試算表，從網址取得 ID：
   `https://docs.google.com/spreadsheets/d/`**`這一段就是 ID`**`/edit`
2. 前往 <https://script.google.com/> → 新增專案。
3. 把 `Code.gs` 內容貼進預設的 `Code.gs`，並填入 `SPREADSHEET_ID`。
   （若改用「試算表 → 擴充功能 → Apps Script」建立繫結式腳本，此欄可留空。）
4. 左側「檔案 ＋ → HTML」，命名為 **`index`**（不含副檔名），貼入 `index.html` 全部內容。
5. 執行一次 `setup()`，完成授權並建立工作表。
6. 「部署 → 新增部署作業 → 網頁應用程式」：
   - 執行身分：**我**
   - 誰可以存取：**任何人**
7. 取得的網址即為發給學生的問卷連結。之後每次改動都要按「部署 → 管理部署作業 → 編輯 → 版本：新版本」才會生效。

> **注意**：`GoogleForm.gs` 請放在**另一個** Apps Script 專案。同一專案內所有 `.gs` 共用一個全域範圍，
> 而它與 `Code.gs` 都宣告了 `FORM_TITLE` 與 `CONTACT_EMAIL`，放在一起會互相覆蓋。

### 或用 clasp 命令列部署

專案已附 `appsscript.json` 與 `.claspignore`（後者會排除 `GoogleForm.gs`）：

```bash
npm i -g @google/clasp
clasp login
clasp create --type webapp --title "行銷管理前測問卷"   # 或 clasp clone <既有專案 ID>
cp .clasp.json.example .clasp.json && ${EDITOR:-vi} .clasp.json   # 填入 scriptId
clasp push
clasp deploy --description "v1"
```

`clasp push` 時 `index.html` 會直接對應到 Apps Script 專案裡的 `index` HTML 檔，不需改名。

### 試算表結構

腳本會自動建立兩個工作表：

- **填答資料**：一位填答者一列。欄位順序由前端送出的欄名決定，凍結前三欄（填答時間／紀錄編號／電子郵件）。
  日後在 `index.html` 增減題目時，新欄位會自動補在最右邊，**既有欄位順序不變，舊資料不會錯位**。
  除逐題原始分數外，另含九個構面的平均分（`IM_平均`、`TD_平均` …），可直接進 SPSS／R。
- **題目對照**：欄位代碼 ↔ 完整題目文字，第一次收到作答時自動建立。

### 後端可調整參數（`Code.gs` 開頭）

| 參數 | 預設 | 說明 |
| --- | --- | --- |
| `SPREADSHEET_ID` | `''` | 試算表 ID；繫結式腳本可留空 |
| `ALLOW_RESUBMIT` | `false` | `false` 時同一信箱只能填一次，重複送出會被擋下並提示 |
| `SEND_COPY` | `true` | 是否允許寄送填答副本（Gmail 每日寄信額度：一般帳號 100 封、Workspace 1500 封；額度用盡只會讓副本寄送失敗，**不影響作答寫入**） |
| `CONTACT_EMAIL` | 佔位字串 | 請與 `index.html` 內的同名設定一併填入真實信箱 |

維護用函式：`setup()` 初始化、`stats()` 查看收案數與平均填答時間、`resetResponses()` 清空作答（保留標題列）。

## 發放前檢查清單

- [ ] `Code.gs` 與 `index.html` 兩處的 `CONTACT_EMAIL` 都已填入真實信箱
- [ ] `SPREADSHEET_ID` 已填（或確認是繫結式腳本）
- [ ] 執行過 `setup()`，試算表已出現「填答資料」工作表
- [ ] 自己先完整填一次，確認試算表有寫入、副本信件有收到
- [ ] 確認 `ALLOW_RESUBMIT` 設定符合需求（`false` 表示一個信箱只能填一次）
- [ ] 部署設定為「執行身分：我／誰可以存取：任何人」，並用**無痕視窗**測試連結可開啟
- [ ] 知情同意書的去識別化說明已送 IRB 備查

## 題目結構

- 知情同意（同意開關，未開啟無法開始）
- **電子郵件**（必填，用於前後測配對；可勾選寄送填答副本）
- 第一部分　基本背景資料：A 個人資料、B 學業自評、C 課程修習、D GenAI 使用經驗（共 9 題）
- 第二部分　量表題項：九個構面共 46 題，五點李克特量表，每頁一個構面
- 附加題　情境判斷 SJ1（選填）
- 檢查頁：逐段顯示完成度，可直接跳回補答

### 題數

| 項目 | 題數 |
| --- | --- |
| 基本背景資料 | 9 |
| 量表（IM 5／TD 5／AIL 5／CT 5／**SA 6**／MDQ 5／CO 5／**CA 7**／CL 3） | **46** |
| 必答小計（完成頁顯示的「作答題數」） | **55** |
| 情境判斷 SJ1 | 選填，不計入 |

九構面並非各 5 題——主體性信念 6 題、AI 輸出批判審視 7 題，因此量表是 46 題而非 45 題，
與原始 `GoogleForm.gs` 實數一致。進度條的分母為 56（55 題加電子郵件），但電子郵件不以「題」呈現。

勾選「其他」後必須填寫說明才能繼續，與 Google 表單 `showOtherOption(true)` 的行為一致。

## 關於電子郵件與研究倫理

原始 Google 表單版本為完全匿名。加入電子郵件後，本問卷屬於**可回溯的去識別化**調查而非匿名調查，
因此 `index.html` 內的知情同意書已同步改寫，明確告知：

- 信箱僅用於前後測配對、避免重複填答、寄送填答副本三項用途
- 資料儲存於計畫主持人管理的 Google 試算表，僅研究團隊可存取
- 分析前會以編號取代電子郵件

若需送 IRB 審查，請以此版本說明為準。**網頁各處一律使用「去識別化」，不再出現「匿名」字樣**；
若研究計畫書或其他說明文件仍寫「以匿名方式保存與分析」，請一併改為「以去識別化方式保存與分析」，
避免同一份研究出現前後矛盾的隱私承諾。

## 前端可調整參數（`index.html` 內 `<script>` 開頭）

對應 Google Apps Script 表單版本的同名變數：

- `CONTACT_EMAIL` — 發放前務必填入真實聯絡信箱
- `DURATION_TEXT` — 預估填答時間，預設「15–20 分鐘」，同意書與首頁共用同一個值
- `SHOW_ITEM_CODES` — 是否在題目前顯示 IM1／TD1 等題號代碼（預設關閉，避免作答提示效應）
- `SHOW_CONSTRUCT_NAMES` — 是否顯示「內在動機」等構面名稱（預設關閉，理由同上）

## 執行環境

`index.html` 會自行偵測所處環境，同一份檔案三種情境都能跑：

| 環境 | 資料寫入 |
| --- | --- |
| Apps Script 網頁應用程式 | `google.script.run` → Google 試算表 |
| Claude Artifact | Artifact 資料庫的 `responses` 集合 |
| 直接用瀏覽器開啟檔案 | 僅保存在本機，完成頁提供 CSV 下載備份 |

三種情境都會即時把進度寫入瀏覽器 `localStorage`，關閉頁面後可接續填答。

## 響應式版面

同一份 `index.html` 依視窗寬度切換三種版面，沒有另外的「手機版網址」：

| 斷點 | 版面 |
| --- | --- |
| < 420px | 單欄、左右留白 16px、標題 28px |
| 420–759px | 單欄、內容欄 680px |
| 760–1023px | 單欄、內容欄 720px（平板） |
| ≥ 1024px | **雙欄**：左側 264px 固定側邊欄（完成百分比、已作答題數、16 個段落的狀態清單，可點擊跳回已抵達的段落），右側內容欄 |
| 觸控裝置（`pointer: coarse`） | 所有點擊目標 ≥ 44pt |
| 橫放且高度 < 520px | 壓縮標題與底部操作列，隱藏提示文字 |

≥1024px 時量表每個選項下方直接顯示「非常不同意」等語意標籤，因此隱藏圖例列與選後標籤；
窄螢幕維持只顯示數字 1–5，靠卡片頂端的圖例對照。

## 行動裝置

多數填答者以手機作答，因此：

- `index.html` 自帶 `charset` 與 `viewport` meta（`viewport-fit=cover`），
  即使直接開啟檔案、不經 `doGet()` 的外殼也不會縮版。
- 所有點擊目標在觸控裝置上不低於 Apple 建議的 44pt：量表選項 48px、返回鍵 45px、主要按鈕 56px。
- 輸入欄位字級 17px（≥16px），避免 iOS Safari 聚焦時自動放大畫面。
- 底部操作列與安全區域內距相容，iPhone 的Home Indicator 不會蓋住按鈕。

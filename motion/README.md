# 島嶼食堂 ISLAND TABLE｜期中提案 Motion Graphics

使用 [Remotion](https://www.remotion.dev/)（React + TypeScript）製作，嵌入簡報播放。

| 影片 | 內容 | 規格 | 長度 |
|---|---|---|---|
| Motion 1 | 問題重新定義（比較表） | 1920×1080、30fps、H.264 | 40 秒 |
| Motion 2 | Insight → Strategy 流程圖 | 1920×1080、30fps、H.264 | 30 秒（製作中） |

---

## 一、第一次使用

需要先安裝 [Node.js](https://nodejs.org/)（18 以上）。在 `motion/` 資料夾打開終端機：

```bash
npm install        # 只需要做一次
npm run studio     # 開啟 Remotion Studio，瀏覽器即時預覽
```

字型（Noto Sans TC、Noto Serif TC）已經打包在專案裡，離線也能預覽與輸出。

## 二、修改內容：只改 `src/data/content.json`

畫面上所有的文字、數字、來源、秒數、顏色都在這個檔案。**元件程式不用動。**

修改規則：
- 只改 `"引號裡面的字"` 和數字，不要刪掉逗號 `,`、冒號 `:`、括號 `{ } [ ]`。
- 文字裡如果要放雙引號，請改用中文引號「」。
- 存檔後 Studio 會自動重新整理；畫面變空白多半是 JSON 格式壞了（少逗號或多逗號）。

### Motion 1 欄位對照（`motion1`）

| 欄位 | 畫面位置 |
|---|---|
| `eyebrow` | 左上方小標（橘字） |
| `headline` | 大標（襯線字） |
| `columns.left` / `columns.right` | 表格兩欄的欄名（「客戶以為」/「證據顯示」） |
| `rows[]` | 表格的每一列：左邊是客戶假設，右邊是對應的證據 |
| `rows[].key` | 列的編號（A / B / C） |
| `rows[].hypothesis` | 客戶的假設（左欄，最後會被劃掉）。建議一行內、15 字以內 |
| `rows[].evidence` | 右欄證據，分兩種，見下方 |
| `reframe.eyebrow` | 結尾卡片上的小標 |
| `reframe.problemDefinition` | 我們重新定義的 Problem Definition 一句話 |
| `seconds` | 各段秒數，見「三、調整秒數」 |

**數據型證據**（`"type": "stat"`）

```json
{
  "type": "stat",
  "value": 62.5,          // 大數字，會從 0 跑到這個值；填 0 會顯示「00」當作待填
  "decimals": 1,          // 小數位數
  "unit": "%",            // 單位，可以是 "%"、" 成"、" 倍"、" 間" 等
  "barPercent": 62.5,     // 下方色塊條的長度，0–100
  "label": "數據說明一句話",
  "source": "來源：Client Data Room，2026/10"
}
```

**引句型證據**（`"type": "quote"`）

```json
{
  "type": "quote",
  "quote": "受訪者原話（不用加「」，畫面會自動加）",
  "speaker": "上班族，27 歲",
  "source": "來源：深度訪談，2026/10"
}
```

（上面的 `//` 註解只是說明用，實際的 content.json 裡不能寫註解。）

### 版面限制（教室投影）
- 所有文字最小 36px，所以每格能放的字有限：
  - 假設：約 10–12 個字一行
  - 數據說明：約 16 個字一行
  - 引句：約 20 個字一行，最多兩行
- 字太多會被擠壓或超出卡片。寧可拆短，細節交給講者口述。
- 不使用 icon、圖示、emoji。

## 三、調整秒數

`motion1.seconds`：

```json
"seconds": {
  "hypotheses": 8,        // 假設逐條出現
  "evidence": [6, 6, 5],  // 每一列證據各自的秒數（數量要跟 rows 一樣）
  "strike": 7,            // 假設依序被劃掉
  "reframe": 8            // Problem Definition 停留
}
```

影片總長會自動加總（目前 8 + 17 + 7 + 8 = 40 秒）。每個重點最少要停留 2 秒，讓講者有時間說明。

## 四、顏色

`brand.colors` 裡的 HEX 色碼可以直接替換：

| 欄位 | 用途 |
|---|---|
| `bg` | 暖米白底色 |
| `primary` | 赤陶橘主色（網點、強調、劃線） |
| `ink` | 主要文字 |
| `muted` | 來源小字 |
| `line` | 表格細線、色塊條底色 |
| `card` | 白色卡片 |

## 五、輸出 MP4

```bash
npm run render:m1   # → out/motion1.mp4
npm run render:m2   # → out/motion2.mp4（Motion 2 完成後）
npm run render      # 兩支一起輸出
```

輸出設定在 `remotion.config.ts`：H.264、`--x264-preset veryfast`。

第一次輸出時，Remotion 會自動下載它需要的瀏覽器（約 100 MB），要有網路。

## 六、專案結構

```
src/
├─ data/content.json        ← 唯一需要修改的檔案
├─ lib/theme.ts             顏色、字型、字級
├─ lib/anim.ts              秒數換算、ease-out 緩動
├─ components/              共用元件（網點、淡入、數字跑動、來源小字）
├─ motion1/                 Motion 1：layout.ts（版面與時間軸）＋ scenes/
└─ motion2/                 Motion 2（製作中）
```

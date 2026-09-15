/**
 * 行銷管理課程問卷（前測）V3 —— Google 表單自動生成腳本
 * 教學實踐研究計畫：在 GenAI 時代培養行銷教育中的認識論否決能力
 * 主持人：世新大學企業管理學系 林建江 助理教授
 *
 * 使用方式：
 *   1. 前往 https://script.google.com/ → 新增專案
 *   2. 貼上本檔全部內容，存檔
 *   3. 上方函式選單選擇 createSurvey，按「執行」，首次執行需授權
 *   4. 執行紀錄（檢視 → 執行記錄）會印出表單編輯網址與填答網址
 *
 * 注意：研究者版說明頁（V2/V3 修改說明）依原文指示不納入施測版本。
 */

// ===== 可調整參數 =====
var FORM_TITLE   = '行銷管理課程問卷（前測）V3';
var CONTACT_EMAIL = '（請填入聯絡信箱）';   // ← 送出前務必填入真實信箱
var SHOW_ITEM_CODES     = false;  // true = 題目前顯示 IM1/TD1 等代碼（方便後續編碼對照）
var SHOW_CONSTRUCT_NAMES = false; // true = 顯示「內在動機」「工具依賴度」等構面名稱
var COLLECT_EMAIL       = false;  // true = 自動蒐集填答者 Google 帳號（匿名研究建議 false）

var LIKERT = ['1 非常不同意', '2 不同意', '3 普通', '4 同意', '5 非常同意'];

var CONSENT = [
  '親愛的同學，您好：',
  '',
  '本問卷為教育部教學實踐研究計畫之基線調查，由世新大學企業管理學系林建江助理教授主持。本調查目的在了解您在課程開始前的學習狀況與生成式 AI 工具使用經驗，作為課程設計改善的參考依據。',
  '',
  '參與本調查完全出於自願，您可以隨時停止填答，不參與或中途退出均不會影響您的課程成績或與授課教師的關係。所有填答資料將以匿名方式保存與分析，個人資訊絕不對外揭露，僅供本計畫學術研究使用。研究成果若公開發表，亦不會出現任何可辨識個人身份的資料。',
  '',
  '若您對本研究有任何疑問，歡迎聯絡計畫主持人：林建江助理教授，電子郵件：' + CONTACT_EMAIL + '。',
  '',
  '問卷填答約需 15 分鐘，感謝您撥冗填答！'
].join('\n');

var SCALE_INTRO = '以下每題請依照您個人的實際狀況或感受，選擇最符合的程度。本量表沒有正確或錯誤答案，請根據第一直覺誠實作答。每題均請作答，請勿遺漏。\n\n計分方式：1 = 非常不同意　2 = 不同意　3 = 普通（說不上同意或不同意）　4 = 同意　5 = 非常同意';

// ===== 量表題庫 =====
var SCALES = [
  {
    name: '一、內在動機（Intrinsic Motivation）',
    items: [
      ['IM1', '我對行銷管理這門課的學習內容感到真心好奇。'],
      ['IM2', '即使沒有成績壓力，我也會想深入了解行銷相關知識。'],
      ['IM3', '學習行銷管理的過程本身就讓我感到有趣。'],
      ['IM4', '我願意在課外花時間主動探索行銷相關議題。'],
      ['IM5', '在行銷課程中學到新知識，對我而言是一種享受。']
    ]
  },
  {
    name: '二、工具依賴度（AI Tool Dependency）',
    items: [
      ['TD1', '遇到課業問題時，我的第一反應是開啟 GenAI 工具來尋求協助。'],
      ['TD2', '在沒有 GenAI 工具可以使用的情況下，我完成作業會比較費力。'],
      ['TD3', '當 GenAI 提供答案後，我通常不會再另外搜尋其他資料來比對。'],
      ['TD4', '使用 GenAI 工具後，我覺得不需要再花很多時間查找其他資訊來源。'],
      ['TD5', '我對 GenAI 工具產生的內容通常覺得夠用，不太需要大幅度修改。']
    ]
  },
  {
    name: '三、AI 素養（AI Literacy）',
    items: [
      ['AIL1', '我了解生成式 AI 工具的基本運作方式（例如：它是根據機率來預測文字，而不是真正「理解」問題的意思）。'],
      ['AIL2', '我清楚了解 GenAI 工具可能在不知情的情況下產生錯誤資訊，而且這種錯誤有時從外觀上難以判斷。'],
      ['AIL3', '我能夠根據不同任務的需求，選擇適合的 GenAI 工具。'],
      ['AIL4', '我能夠設計有效的提示語（prompt），引導 GenAI 產出我需要的內容。'],
      ['AIL5', '我能夠辨別 GenAI 提供的資訊是否可信，並進一步查證。']
    ]
  },
  {
    name: '四、批判性思考傾向（Critical Thinking Disposition）',
    items: [
      ['CT1', '面對問題時，我習慣從多個角度思考，而不是接受第一個看起來合理的答案。'],
      ['CT2', '當我讀到某個論點時，我會主動尋找與它相反的證據或觀點。'],
      ['CT3', '我願意在得出結論之前，花時間仔細評估所有可用的資訊。'],
      ['CT4', '即使某個答案來自權威來源，我仍然會思考它是否合理。'],
      ['CT5', '遇到複雜問題時，我享受深入分析的過程，而不急著找到快速答案。']
    ]
  },
  {
    name: '五、主體性信念（Student Agency Beliefs）',
    items: [
      ['SA1', '我相信自己能夠影響自己在這門課中的學習方向。'],
      ['SA2', '我有能力主動調整自己的學習方式，以達到更好的學習效果。'],
      ['SA3', '遇到學習上的困難時，我會主動尋找資源來解決問題。'],
      ['SA4', '我會主動決定自己在這門課中優先學習哪些內容，而不只是被動地跟著課程進度走。'],
      ['SA5', '我願意為自己的學習決策和成果負起責任。'],
      ['SA6', '即使課程要求不高，我也會主動要求自己達到更高的標準。']
    ]
  },
  {
    name: '六、行銷任務自我效能（Marketing Task Self-Efficacy）',
    items: [
      ['MDQ1', '我相信自己有能力蒐集並分析某個產業的相關資訊，找出其中的機會與風險。'],
      ['MDQ2', '我相信自己能夠根據現有資料，判斷哪一群消費者最可能對某個產品感興趣。'],
      ['MDQ3', '我相信自己能夠為一個產品或服務想出吸引消費者的宣傳方式。'],
      ['MDQ4', '面對行銷上的複雜問題，我有信心自己能夠做出有根據的判斷。'],
      ['MDQ5', '我能夠比較不同行銷方案各自的優缺點，並選出最適合的方向。']
    ]
  },
  {
    name: '七、認知卸載傾向（Cognitive Offloading Tendency）',
    items: [
      ['CO1', '需要整理複雜資訊時，我通常會先請 GenAI 幫我做初步歸納。'],
      ['CO2', '遇到需要創意發想的任務，我習慣先參考 GenAI 的建議，再進一步發展自己的想法。'],
      ['CO3', '我通常讓 GenAI 幫我決定文章或報告的大致架構，再由我填入具體內容。'],
      ['CO4', '自從使用 GenAI 之後，我有時會覺得不需要把課程內容背得那麼熟。'],
      ['CO5', '面對學習任務時，我傾向先讓 GenAI 處理，再由我來判斷結果是否合用。']
    ]
  },
  {
    name: '八、AI 輸出批判審視（Critical Appraisal of AI）',
    items: [
      ['CA1', '當 GenAI 提供行銷相關資訊時，我會查核其內容是否正確。'],
      ['CA2', '我會評估 GenAI 所產出的行銷分析或報告內容的品質高低。'],
      ['CA3', '我會判斷 GenAI 給出的行銷建議是否符合實際市場的情況。'],
      ['CA4', '使用 GenAI 輔助行銷決策後，我會反思它的建議是否真正符合我的需求。'],
      ['CA5', '我能夠分析 GenAI 在處理行銷問題時可能存在的限制。'],
      ['CA6', '我會留意 GenAI 所產生的行銷內容是否帶有特定立場或偏見。'],
      ['CA7', '針對 GenAI 提供的行銷資訊，我會再透過其他來源加以確認。']
    ]
  },
  {
    name: '九、認知負荷（Cognitive Load）',
    items: [
      ['CL1', '當我需要整合多個資訊來源（課本、上課內容、網路資料）來完成作業時，我感到心智上非常費力。'],
      ['CL2', '在學習過程中，我常常感到自己需要同時處理太多事情，以至於難以全部理解。'],
      ['CL3', '即使我花了很多時間和精力，我仍然覺得有些學習內容很難真正弄懂。']
    ]
  }
];

// ===== 主程式 =====
function createSurvey() {
  var form = FormApp.create(FORM_TITLE);
  form.setTitle(FORM_TITLE);
  form.setDescription(CONSENT);
  form.setCollectEmail(COLLECT_EMAIL);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setConfirmationMessage('您的填答已送出，感謝您的參與！');

  // --- 知情同意 ---
  form.addMultipleChoiceItem()
    .setTitle('我已閱讀上述說明，並同意參與本研究')
    .setChoiceValues(['我同意參與'])
    .setRequired(true);

  // --- 第一部分：基本背景資料 ---
  form.addPageBreakItem()
    .setTitle('第一部分：基本背景資料')
    .setHelpText('A. 個人基本資料');

  form.addMultipleChoiceItem()
    .setTitle('A1. 性別')
    .setChoiceValues(['男', '女', '其他', '不願透露'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('A2. 年級')
    .setChoiceValues(['一年級', '二年級', '三年級', '四年級', '研究生'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('A3. 科系')
    .setRequired(true);

  form.addSectionHeaderItem().setTitle('B. 學業表現自評');

  form.addMultipleChoiceItem()
    .setTitle('B1. 您上一學期的學業成績，相較於班上同學，您認為自己屬於：')
    .setChoiceValues(['前 10%', '前 25%', '中間 50%', '後 25%', '後 10%'])
    .setRequired(true);

  form.addSectionHeaderItem().setTitle('C. 相關課程修習狀況');

  form.addParagraphTextItem()
    .setTitle('C1. 您曾修習過哪些與行銷相關的課程？')
    .setHelpText('請填寫課程名稱，若無請填「無」')
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('C2. 您修習本課程（行銷管理）的主要動機是（可複選）')
    .setChoiceValues(['必修課程', '個人對行銷領域有興趣', '對課程內容有期待', '希望對未來職涯有幫助'])
    .showOtherOption(true)
    .setRequired(true);

  form.addSectionHeaderItem().setTitle('D. GenAI 工具使用經驗');

  form.addMultipleChoiceItem()
    .setTitle('D1. 您目前使用生成式 AI 工具（如 ChatGPT、Claude、Gemini、Copilot 等）的頻率：')
    .setChoiceValues(['從未使用', '每月數次', '每週數次', '幾乎每天', '每天多次'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('D2. 您開始使用 GenAI 工具大約多久了：')
    .setChoiceValues(['從未使用', '不到 6 個月', '6 個月至 1 年', '1 至 2 年', '超過 2 年'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('D3. 您主要使用 GenAI 工具的用途是（可複選）')
    .setChoiceValues(['撰寫作業或報告', '查詢資料與整理筆記', '程式撰寫或除錯', '創意發想與腦力激盪', '翻譯或語言學習', '娛樂消遣'])
    .showOtherOption(true)
    .setRequired(true);

  // --- 第二部分：量表題項（分三頁，降低填答疲勞）---
  var pageTitles = ['第二部分：量表題項（1/3）', '第二部分：量表題項（2/3）', '第二部分：量表題項（3/3）'];
  var pages = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

  for (var p = 0; p < pages.length; p++) {
    var page = form.addPageBreakItem().setTitle(pageTitles[p]);
    if (p === 0) { page.setHelpText(SCALE_INTRO); }
    for (var i = 0; i < pages[p].length; i++) {
      addScale_(form, SCALES[pages[p][i]]);
    }
  }

  // --- 附加題 ---
  form.addPageBreakItem().setTitle('附加題：情境判斷（選填）');

  form.addParagraphTextItem()
    .setTitle('SJ1. 請閱讀以下情境，並以 2 至 4 句話描述您會如何處理：')
    .setHelpText('「您正在為一個本地飲料品牌撰寫市場競爭分析報告。您使用 ChatGPT 詢問台灣手搖飲市場的現況，GenAI 提供了一份看起來完整的市場分析，包含市場規模數字與主要競爭者名單。請問您接下來會怎麼做？」')
    .setRequired(false);

  Logger.log('編輯網址：' + form.getEditUrl());
  Logger.log('填答網址：' + form.getPublishedUrl());
}

/**
 * 以格線題（Grid）呈現單一構面的所有題目。
 */
function addScale_(form, scale) {
  var rows = scale.items.map(function (item) {
    return SHOW_ITEM_CODES ? item[0] + '. ' + item[1] : item[1];
  });

  form.addGridItem()
    .setTitle(SHOW_CONSTRUCT_NAMES ? scale.name : '請依照您個人的實際狀況或感受作答')
    .setRows(rows)
    .setColumns(LIKERT)
    .setRequired(true);
}

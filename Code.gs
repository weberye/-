/**
 * 行銷管理課程問卷（前測）V3 —— Google Apps Script 網頁版後端
 * 教學實踐研究計畫：在 GenAI 時代培養行銷教育中的認識論否決能力
 * 主持人：世新大學企業管理學系 林建江 助理教授
 *
 * 部署方式：
 *   1. 前往 https://script.google.com/ → 新增專案
 *   2. 把本檔內容貼進 Code.gs
 *   3. 左側「檔案 +」→ HTML，命名為 index（不含副檔名），貼入 index.html 全部內容
 *   4. 建立一份 Google 試算表，把網址中的 ID 填入下方 SPREADSHEET_ID
 *      （或把本腳本用「擴充功能 → Apps Script」繫結在該試算表上，即可留空）
 *   5. 執行一次 setup()，完成授權並建立工作表
 *   6. 右上「部署 → 新增部署作業 → 網頁應用程式」
 *        執行身分：我
 *        誰可以存取：任何人
 *      取得的網址就是發給學生的問卷連結
 *
 * 題庫與畫面都在 index.html；本檔只負責「把一筆作答寫進試算表」，
 * 欄位由前端送來的 columns 決定，因此日後改題目不必同步改這裡。
 */

// ===== 可調整參數 =====
var SPREADSHEET_ID  = '';           // 試算表 ID；繫結式腳本可留空
var SHEET_NAME      = '填答資料';    // 一列一位填答者
var CODEBOOK_SHEET  = '題目對照';    // 欄位代碼 ↔ 完整題目
var ALLOW_RESUBMIT  = false;        // false＝同一信箱只能填一次
var SEND_COPY       = true;         // 是否允許寄送填答副本給填答者
var FORM_TITLE      = '行銷管理課程問卷（前測）V3';
var CONTACT_EMAIL   = '（請填入聯絡信箱）';   // ← 與 index.html 內的設定保持一致

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ===== 網頁應用程式入口 =====

/**
 * index.html 是為了同時能在 Claude Artifact 上執行而寫的「片段」，
 * 沒有 html / head / body 外殼，這裡補上，順便給行動裝置安全區域內距。
 */
function doGet(e) {
  var body = HtmlService.createHtmlOutputFromFile('index').getContent();
  var page =
    '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);color-scheme:light dark}' +
    'body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>' +
    '</head><body>' + body + '</body></html>';

  return HtmlService.createHtmlOutput(page)
    .setTitle(FORM_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ===== 前端呼叫的 API =====

/**
 * 寫入一筆作答。
 * @param {Object} rec  {responseId, email, sendCopy, columns:[欄名], values:{欄名:值}, labels:{欄名:題目}}
 * @return {Object} {ok:true, copySent, row} 或 {ok:false, code}
 */
function submitResponse(rec) {
  if (!rec || !rec.columns || !rec.columns.length || !rec.values) {
    return { ok: false, code: 'bad_request' };
  }
  var email = String(rec.email || '').trim();
  if (!EMAIL_RE.test(email)) return { ok: false, code: 'bad_email' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return { ok: false, code: 'busy' };
  }

  try {
    var sheet = ensureSheet_();
    var header = syncHeader_(sheet, rec.columns);

    if (!ALLOW_RESUBMIT && findRowByEmail_(sheet, header, email) > 0) {
      return { ok: false, code: 'duplicate' };
    }

    var row = header.map(function (name) {
      if (name === '填答時間') return new Date();
      return Object.prototype.hasOwnProperty.call(rec.values, name) ? rec.values[name] : '';
    });
    sheet.appendRow(row);
    SpreadsheetApp.flush();

    writeCodebook_(rec.labels);

    var copySent = false;
    if (SEND_COPY && rec.sendCopy) copySent = sendCopy_(email, header, row);

    return { ok: true, copySent: copySent, row: sheet.getLastRow() };
  } catch (err) {
    console.error(err);
    return { ok: false, code: 'server_error', message: String(err) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 若部署為「執行身分：存取的使用者」且填答者已登入同網域帳號，
 * 可用來預先帶入信箱；匿名存取時回傳空字串。
 */
function getPrefill() {
  var email = '';
  try { email = Session.getActiveUser().getEmail() || ''; } catch (err) { email = ''; }
  return { email: email };
}

// ===== 試算表 =====

function ss_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('請在 SPREADSHEET_ID 填入試算表 ID，或將本腳本繫結於試算表。');
}

function ensureSheet_() {
  var book = ss_();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  return sheet;
}

/**
 * 確保標題列存在且涵蓋這次送來的所有欄位；新增的欄位補在最右邊，
 * 既有欄位順序永遠不動，舊資料不會錯位。
 */
function syncHeader_(sheet, columns) {
  var width = sheet.getLastColumn();
  var header = width ? sheet.getRange(1, 1, 1, width).getValues()[0].filter(String) : [];

  if (!header.length) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
    sheet.getRange(1, 1, 1, columns.length)
      .setFontWeight('bold')
      .setBackground('#F2F2F7');
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(3);
    return columns.slice();
  }

  var missing = columns.filter(function (c) { return header.indexOf(c) < 0; });
  if (missing.length) {
    sheet.getRange(1, header.length + 1, 1, missing.length).setValues([missing])
      .setFontWeight('bold').setBackground('#F2F2F7');
    header = header.concat(missing);
  }
  return header;
}

function findRowByEmail_(sheet, header, email) {
  var col = header.indexOf('電子郵件') + 1;
  var last = sheet.getLastRow();
  if (col < 1 || last < 2) return 0;

  var values = sheet.getRange(2, col, last - 1, 1).getValues();
  var target = email.toLowerCase();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === target) return i + 2;
  }
  return 0;
}

/** 題目對照表：只在空白時寫入一次，之後補上新欄位。 */
function writeCodebook_(labels) {
  if (!labels) return;
  var book = ss_();
  var sheet = book.getSheetByName(CODEBOOK_SHEET);
  if (!sheet) {
    sheet = book.insertSheet(CODEBOOK_SHEET);
    sheet.getRange(1, 1, 1, 2).setValues([['欄位代碼', '題目內容']])
      .setFontWeight('bold').setBackground('#F2F2F7');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 640);
  }

  var last = sheet.getLastRow();
  var known = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  var rows = [];
  Object.keys(labels).forEach(function (code) {
    if (known.indexOf(code) < 0) rows.push([code, labels[code]]);
  });
  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 2).setValues(rows).setWrap(true);
  }
}

// ===== 副本信件 =====

function sendCopy_(email, header, row) {
  try {
    var skip = ['紀錄編號', '同意參與', '開始時間', '填答秒數'];
    var cells = header.map(function (name, i) {
      if (skip.indexOf(name) >= 0) return '';
      var value = row[i];
      if (value instanceof Date) value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
      return '<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#6e6e73;white-space:nowrap">' +
        escapeHtml_(name) + '</td><td style="padding:6px 12px;border-bottom:1px solid #eee">' +
        escapeHtml_(value) + '</td></tr>';
    }).join('');

    var html =
      '<div style="font-family:-apple-system,\'PingFang TC\',sans-serif;color:#1d1d1f;max-width:640px">' +
      '<h2 style="font-size:20px;margin:0 0 6px">' + escapeHtml_(FORM_TITLE) + '</h2>' +
      '<p style="color:#6e6e73;font-size:14px;line-height:1.7;margin:0 0 18px">' +
      '這是您的填答副本，僅供自行留存。您的電子郵件僅用於前後測配對與避免重複填答，' +
      '分析前會以編號取代。如有任何疑問，請聯絡計畫主持人林建江助理教授：' + escapeHtml_(CONTACT_EMAIL) + '。</p>' +
      '<table style="border-collapse:collapse;font-size:14px;width:100%">' + cells + '</table></div>';

    MailApp.sendEmail({
      to: email,
      subject: FORM_TITLE + ' — 您的填答副本',
      htmlBody: html,
      body: '感謝您填答 ' + FORM_TITLE + '。您的填答已送出。'
    });
    return true;
  } catch (err) {
    console.error('副本寄送失敗：' + err);   // 多半是每日寄信額度用盡，不影響作答已寫入
    return false;
  }
}

function escapeHtml_(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 維護工具（在編輯器內手動執行） =====

/** 首次設定：完成授權、建立工作表，並印出試算表與問卷網址。 */
function setup() {
  var sheet = ensureSheet_();
  Logger.log('試算表：' + ss_().getUrl());
  Logger.log('工作表：' + sheet.getName() + '（目前 ' + Math.max(0, sheet.getLastRow() - 1) + ' 筆作答）');
  Logger.log('部署後的問卷網址請至「部署 → 管理部署作業」取得。');
}

/** 目前收案概況。 */
function stats() {
  var sheet = ensureSheet_();
  var last = sheet.getLastRow();
  Logger.log('已收到 ' + Math.max(0, last - 1) + ' 筆作答');
  if (last > 1) {
    var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var col = header.indexOf('填答秒數') + 1;
    if (col > 0) {
      var secs = sheet.getRange(2, col, last - 1, 1).getValues()
        .map(function (r) { return Number(r[0]) || 0; }).filter(function (v) { return v > 0; });
      if (secs.length) {
        var avg = secs.reduce(function (a, b) { return a + b; }, 0) / secs.length;
        Logger.log('平均填答時間：' + Math.round(avg / 60) + ' 分鐘');
      }
    }
  }
}

/** 清空所有作答（保留標題列）。請謹慎使用。 */
function resetResponses() {
  var sheet = ensureSheet_();
  var last = sheet.getLastRow();
  if (last > 1) sheet.deleteRows(2, last - 1);
  Logger.log('已清空 ' + (last - 1) + ' 筆作答。');
}

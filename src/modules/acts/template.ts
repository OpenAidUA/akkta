import type { ActDocument, ClientSnapshot } from './domain';
import { amountToWordsUAH } from './amount-to-words';

export interface ActTemplateData {
  act: ActDocument;
  clientSnapshot: ClientSnapshot;
  contractorName?: string;
  contractorEdrpou?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatMoney(n: number): string {
  return n.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function renderActHtml(data: ActTemplateData): string {
  const { act, clientSnapshot } = data;
  const meta = act.meta;
  const parties = act.parties;
  const items = act.items;
  const totals = act.totals;
  const total = totals?.total ?? 0;
  const totalWords = amountToWordsUAH(total);

  const contractorName = escapeHtml(
    data.contractorName || parties.contractor.name,
  );
  const contractorRep = escapeHtml(parties.contractor.representative);
  const clientName = escapeHtml(clientSnapshot.name || parties.client.name);
  const clientRep = escapeHtml(parties.client.representative || '');
  const clientEdrpou = clientSnapshot.edrpou
    ? escapeHtml(clientSnapshot.edrpou)
    : '';
  const contractRef = act.contractRef ? escapeHtml(act.contractRef) : '';
  const city = meta.city ? escapeHtml(meta.city) : '';
  const dateFormatted = formatDate(meta.date);

  const itemsHtml = items
    .map((item, i) => {
      const itemTotal = item.total ?? item.quantity * item.unitPrice;
      return `
        <tr>
          <td class="num">${i + 1}</td>
          <td class="desc">${escapeHtml(item.title)}${item.description ? `<br/><span class="item-desc">${escapeHtml(item.description)}</span>` : ''}</td>
          <td class="unit">послуга</td>
          <td class="qty">${formatMoney(item.quantity)}</td>
          <td class="price">${formatMoney(item.unitPrice)}</td>
          <td class="total">${formatMoney(itemTotal)}</td>
        </tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: A4;
      margin: 15mm 20mm 15mm 20mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', 'DejaVu Serif', serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #000;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20pt;
    }

    .header-table td {
      width: 50%;
      vertical-align: top;
      padding: 4pt 0;
    }

    .header-table .col-right {
      text-align: right;
    }

    .party-label {
      font-weight: bold;
      font-size: 11pt;
      text-transform: uppercase;
      margin-bottom: 6pt;
      display: block;
    }

    .party-name {
      font-weight: bold;
      font-size: 12pt;
    }

    .party-detail {
      font-size: 10pt;
      color: #333;
      line-height: 1.5;
    }

    .title-section {
      text-align: center;
      margin: 24pt 0 16pt;
    }

    .act-title {
      font-size: 16pt;
      font-weight: bold;
    }

    .act-subtitle {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 2pt;
    }

    .preamble {
      text-align: justify;
      margin-bottom: 16pt;
      text-indent: 20pt;
      font-size: 11pt;
    }

    /* Items table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8pt;
    }

    .items-table th,
    .items-table td {
      border: 1px solid #000;
      padding: 4pt 6pt;
      font-size: 10pt;
    }

    .items-table th {
      background: #f5f5f5;
      font-weight: bold;
      text-align: center;
    }

    .items-table td.num {
      text-align: center;
      width: 30pt;
    }

    .items-table td.desc {
      text-align: left;
    }

    .items-table td.unit {
      text-align: center;
      width: 55pt;
    }

    .items-table td.qty {
      text-align: center;
      width: 55pt;
    }

    .items-table td.price {
      text-align: right;
      width: 75pt;
    }

    .items-table td.total {
      text-align: right;
      width: 85pt;
    }

    .item-desc {
      font-size: 9pt;
      color: #555;
    }

    .total-row td {
      font-weight: bold;
    }

    .total-words {
      margin: 12pt 0;
      font-size: 11pt;
      text-indent: 20pt;
    }

    .total-words b {
      font-weight: bold;
    }

    .completion-text {
      margin: 16pt 0;
      font-size: 10pt;
      line-height: 1.6;
    }

    .completion-text p {
      margin-bottom: 4pt;
      text-indent: 20pt;
      text-align: justify;
    }

    /* Signatures */
    .signatures {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30pt;
    }

    .signatures td {
      width: 50%;
      vertical-align: top;
      padding: 4pt 0;
    }

    .sig-label {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 4pt;
    }

    .sig-role {
      font-size: 10pt;
      color: #333;
    }

    .sig-line {
      margin-top: 30pt;
      border-bottom: 1px solid #000;
      width: 80%;
      padding-bottom: 2pt;
      font-size: 10pt;
    }

    .sig-name {
      margin-top: 4pt;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <!-- HEADER: Two columns -->
  <table class="header-table">
    <tr>
      <td>
        <span class="party-label">Виконавець:</span>
        <div class="party-name">${contractorName}</div>
      </td>
      <td class="col-right">
        <span class="party-label">Замовник:</span>
        <div class="party-name">${clientName}</div>
        ${clientEdrpou ? `<div class="party-detail">ЄДРПОУ ${clientEdrpou}</div>` : ''}
      </td>
    </tr>
  </table>

  <!-- TITLE -->
  <div class="title-section">
    <div class="act-title">АКТ № ${escapeHtml(meta.number)}</div>
    <div class="act-subtitle">прийому-передачі виконаних робіт (наданих послуг)</div>
  </div>

  <!-- PREAMBLE -->
  <p class="preamble">
    Ми, що нижче підписалися, представник Виконавця і представник Замовника, уклали цей акт про те,
    що Виконавець виконав роботи${contractRef ? ` згідно договору ${contractRef}` : ''}${city ? ` м. ${city}` : ''} від ${dateFormatted}.
  </p>

  <!-- ITEMS TABLE -->
  <table class="items-table">
    <thead>
      <tr>
        <th>№</th>
        <th>Назва робіт (послуги)</th>
        <th>Од. вим.</th>
        <th>Кіль-ть</th>
        <th>Ціна</th>
        <th>Сума</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
      <tr class="total-row">
        <td colspan="5" style="text-align: right; border: 1px solid #000; padding: 4pt 6pt;">Разом:</td>
        <td class="total">${formatMoney(total)}</td>
      </tr>
    </tbody>
  </table>

  <!-- TOTAL IN WORDS -->
  <p class="total-words">
    Всього робіт надано на суму (прописом): <b>${totalWords}</b>.
  </p>

  <!-- COMPLETION TEXT -->
  <div class="completion-text">
    <p>Роботи виконані повністю, сторони претензій одна до одної не мають.</p>
    <p>Акт складено у 2-х екземплярах, по одному для Виконавця та Замовника.</p>
  </div>

  <!-- SIGNATURES -->
  <table class="signatures">
    <tr>
      <td>
        <div class="sig-label">Роботу здав</div>
        <div class="sig-role">від ВИКОНАВЦЯ:</div>
        <div class="sig-line">____________</div>
        <div class="sig-name">${contractorRep}</div>
      </td>
      <td>
        <div class="sig-label">Роботу прийняв</div>
        <div class="sig-role">від ЗАМОВНИКА:</div>
        <div class="sig-line">____________</div>
        <div class="sig-name">${clientRep}</div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Convert a number to Ukrainian words for currency (гривні / копійки).
 * Supports numbers up to 999_999_999_999.99
 */

const ONES_MASCULINE = [
  '',
  'один',
  'два',
  'три',
  'чотири',
  "п'ять",
  'шість',
  'сім',
  'вісім',
  "дев'ять",
];

const ONES_FEMININE = [
  '',
  'одна',
  'дві',
  'три',
  'чотири',
  "п'ять",
  'шість',
  'сім',
  'вісім',
  "дев'ять",
];

const TEENS = [
  'десять',
  'одинадцять',
  'дванадцять',
  'тринадцять',
  'чотирнадцять',
  "п'ятнадцять",
  'шістнадцять',
  'сімнадцять',
  'вісімнадцять',
  "дев'ятнадцять",
];

const TENS = [
  '',
  '',
  'двадцять',
  'тридцять',
  'сорок',
  "п'ятдесят",
  'шістдесят',
  'сімдесят',
  'вісімдесят',
  "дев'яносто",
];

const HUNDREDS = [
  '',
  'сто',
  'двісті',
  'триста',
  'чотириста',
  "п'ятсот",
  'шістсот',
  'сімсот',
  'вісімсот',
  "дев'ятсот",
];

type PluralForms = [string, string, string]; // 1, 2-4, 5+

const THOUSANDS: PluralForms = ['тисяча', 'тисячі', 'тисяч'];
const MILLIONS: PluralForms = ['мільйон', 'мільйони', 'мільйонів'];
const BILLIONS: PluralForms = ['мільярд', 'мільярди', 'мільярдів'];

const UAH_FORMS: PluralForms = ['гривня', 'гривні', 'гривень'];
const KOP_FORMS: PluralForms = ['копійка', 'копійки', 'копійок'];

function pluralize(n: number, forms: PluralForms): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function tripletToWords(n: number, feminine: boolean): string {
  if (n === 0) return '';

  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const remainder = n % 100;
  const t = Math.floor(remainder / 10);
  const o = remainder % 10;

  if (h > 0) parts.push(HUNDREDS[h]);

  if (t === 1) {
    // teens
    parts.push(TEENS[o]);
  } else {
    if (t > 1) parts.push(TENS[t]);
    if (o > 0) {
      parts.push(feminine ? ONES_FEMININE[o] : ONES_MASCULINE[o]);
    }
  }

  return parts.join(' ');
}

function integerToWords(n: number): string {
  if (n === 0) return 'нуль';

  const parts: string[] = [];

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const ones = n % 1_000;

  if (billions > 0) {
    parts.push(tripletToWords(billions, false));
    parts.push(pluralize(billions, BILLIONS));
  }

  if (millions > 0) {
    parts.push(tripletToWords(millions, false));
    parts.push(pluralize(millions, MILLIONS));
  }

  if (thousands > 0) {
    // thousands are feminine in Ukrainian
    parts.push(tripletToWords(thousands, true));
    parts.push(pluralize(thousands, THOUSANDS));
  }

  if (ones > 0) {
    // UAH is feminine
    parts.push(tripletToWords(ones, true));
  }

  return parts.join(' ');
}

/**
 * Converts amount in UAH to text.
 * Example: 12300.00 → "Дванадцять тисяч триста гривень 00 коп."
 */
export function amountToWordsUAH(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const intPart = Math.floor(rounded);
  const kopPart = Math.round((rounded - intPart) * 100);

  const intWords = integerToWords(intPart);
  const capitalized = intWords.charAt(0).toUpperCase() + intWords.slice(1);

  const uahWord = pluralize(intPart, UAH_FORMS);
  const kopStr = String(kopPart).padStart(2, '0');
  const kopWord = pluralize(kopPart, KOP_FORMS);

  return `${capitalized} ${uahWord} ${kopStr} ${kopWord}`;
}

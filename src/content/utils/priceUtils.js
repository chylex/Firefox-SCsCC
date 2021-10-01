import { cleanSymbPatt, wordPatt } from './patts';

const alphabeticPatt = new RegExp(wordPatt);
const alphaNumericPatt = new RegExp(wordPatt.replace(/^\[/, '[0-9'));

export const checkPriceSpecCases = (txt, match) => {
  const charind = txt.indexOf(match);

  const bChar = txt.charAt(charind - 1);
  const aChar = txt.charAt(charind + match.length);

  // in case text is like: somestring1 234 $
  // if there is a word character before it
  if (/^\d/.test(match) && alphabeticPatt.test(bChar)) {
    if (/^\d+\s+\d/.test(match)) return match.replace(/^\d+\s+/, ''); // convert only 234 $
    return null;
  }

  if (alphaNumericPatt.test(bChar) || alphaNumericPatt.test(aChar)) return null;

  return match;
};

export const cleanPrice = (price) => {
  // remove currency symbols and spaces
  let cleanedPrice = price.replace(cleanSymbPatt, '');

  // remove thousand separator
  const countDots = cleanedPrice.split('.').length - 1;
  const countCommas = cleanedPrice.split(',').length - 1;
  if (countDots > 1) {
    cleanedPrice = cleanedPrice.replace(/\\./g, '');
  }
  if (countCommas > 1) {
    cleanedPrice = cleanedPrice.replace(/,/g, '');
  }

  // normalize decimal separator
  if (countCommas === 1) {
    cleanedPrice = cleanedPrice.replace(/,/g, '.');
  }

  return cleanedPrice;
};

export const formatPrice = (price, preferences) => {
  // set rounding
  let formattedPrice;
  if (preferences.round || Math.abs(price) >= 10) {
    formattedPrice = price.toFixed(0);
  } else if (Math.abs(price) >= 1) {
    formattedPrice = price.toFixed(1);
  } else {
    const log10 = price ? Math.floor(Math.log10(price)) : 0;
    const div = log10 < 0 ? 10 ** (1 - log10) : 100;
    formattedPrice = (Math.round(price * div) / div).toString();
  }

  // set decimal separator
  if (preferences.sepDec !== '.') formattedPrice = formattedPrice.replace('.', preferences.sepDec);

  // set thousand separator
  if (preferences.sepTho !== '') {
    const sepDecIndex = formattedPrice.indexOf(preferences.sepDec);
    for (let i = sepDecIndex === -1 ? formattedPrice.length : sepDecIndex - 3; i > 0; i -= 3) {
      formattedPrice = formattedPrice.slice(0, i) + preferences.sepTho + formattedPrice.slice(i);
    }
  }

  // add symbol
  if (preferences.symbPos === 'a') {
    formattedPrice = formattedPrice + ((preferences.symbSep) ? ' ' : '') + preferences.symbol;
  } else {
    formattedPrice = preferences.symbol + ((preferences.symbSep) ? ' ' : '') + formattedPrice;
  }

  return formattedPrice;
};

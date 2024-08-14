const axios = require('axios');

const SYMBOL = 'BTCUSDT';
const API_URL = 'https://testnet.binance.vision';

const open = {
  isOpenedMargin1: false,
  isOpenedMargin2: false
}

/**
 * reach the 'suporte'
 * 
 * @param {number} margin
 * @public
 */
function buy(margin = 0) {
  console.log(`comprar: margem ${margin}`);
  open[`isOpenedMargin${margin}`] = true;
}


/**
 * reach the 'resistência'
 * 
 * @param {number} price
 */
function sell(margin = 0) {
  console.log(`vender: margem ${margin}`);
  open[`isOpenedMargin${margin}`] = false;
}


/**
 * * Simple movement average - média móvel
 * @param {Array} data 
 */
function calculateSimpleMovementAverage(data) {
  const closes = data.map(candle => parseFloat(candle[4]));
  const sum = closes.reduce((a, b) => a + b);

  return sum / data.length;

}
/**
 * 
 */
async function start({ BUY_PRICE = 0, SELL_PRICE = 0, margin = 0 }) {
  const { data } = await axios.get(`${API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`);
  const candle = data[data.length - 1];
  const price = parseFloat(candle[4]);

  const isOpened = open[`isOpenedMargin${margin}`];

  console.clear();
  console.log(`Price ${price}`);

  const sma13 = calculateSimpleMovementAverage(data.slice(8));
  const sma21 = calculateSimpleMovementAverage(data);

  console.log('SMA: (21) ' + sma21);
  console.log('SMA: (13) ' + sma13);
  console.log('Is opened? ' + open.isOpenedMargin1);
  // console.log(open);

  Boolean(sma13 > sma21)
    && Boolean(!isOpened)
    && Promise.resolve(buy(margin));

  Boolean(sma13 < sma21)
    && Boolean(isOpened)
    && Promise.resolve(sell(margin));
}
setInterval(() => {
  start({ BUY_PRICE: 59320, SELL_PRICE: 59330, margin: 1 })
  // start({ BUY_PRICE: 59330, SELL_PRICE: 59340, margin: 2 })
}, 3000);

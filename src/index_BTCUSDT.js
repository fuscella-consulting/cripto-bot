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
 * 
 */
async function start({ BUY_PRICE = 0, SELL_PRICE = 0, margin = 0 }) {
  const { data } = await axios.get(`${API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`);
  const candle = data[data.length - 1];
  const price = parseFloat(candle[4]);

  const isOpened = open[`isOpenedMargin${margin}`];

  console.clear();
  console.log(`Price ${price}`);
  // console.log(open);

  Boolean(!isOpened)
    && Boolean(price <= BUY_PRICE)
    && Promise.resolve(buy(margin));
  Boolean(isOpened)
    && Boolean(price >= SELL_PRICE)
    && Promise.resolve(sell(margin));
}
setInterval(() => {
  start({ BUY_PRICE: 59320, SELL_PRICE: 59330, margin: 2 })
  start({ BUY_PRICE: 59330, SELL_PRICE: 59340, margin: 1 })
}, 3000);

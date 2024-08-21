const crypto = require('crypto');
const axios = require('axios');

const SYMBOL = 'ETHUSDT';
const API_URL = 'https://testnet.binance.vision';
const API_KEY = 'EK9lz9smSa7uhb1lTA6jcfyiaXtkdbHlf6bnmviAFPAPq4nkI9Uf1Pc4TbWNnNah';
const API_SECRET_KEY = '3P05bXieEGIrxQX2lZlOxiCTuBYIL1M4FOJt5fVFVBsBUpJL1FJob2RNIKMsAtqp';
const QUANTITY = '0.001';

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
  newOrder(SYMBOL, QUANTITY, 'buy');
  open[`isOpenedMargin${margin}`] = true;
}


/**
 * reach the 'resistência'
 * 
 * @param {number} price
 */
function sell(margin = 0) {
  console.log(`vender: margem ${margin}`);
  newOrder(SYMBOL, QUANTITY, 'sell');
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
async function start({ margin = 0 }) {
  const { data } = await axios.get(`${API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`);
  const candle = data[data.length - 1];
  const price = parseFloat(candle[4]);

  const isOpened = open[`isOpenedMargin${margin}`];

  console.clear();
  console.log(`Price ${price}`);

  const sma = calculateSimpleMovementAverage(data);
  // const sma13 = calculateSimpleMovementAverage(data.slice(8));
  // const sma21 = calculateSimpleMovementAverage(data);

  console.log('SMA', sma * 0.9999999);
  console.log('SMA', sma * 1.0009999);

  Boolean(price <= (sma * 0.9999999))
    && Boolean(!isOpened)
    && Promise.resolve(buy(margin));

  Boolean(price >= (sma * 1.0009999))
    && Boolean(isOpened)
    && Promise.resolve(sell(margin));
}

async function newOrder(symbol, quantity, side) {
  const order = { symbol, quantity, side };
  order.type = 'MARKET';
  order.timestamp = Date.now();

  const signature = crypto
    .createHmac('sha256', API_SECRET_KEY)
    .update(new URLSearchParams(order).toString())
    .digest('hex');

  order.signature = signature;

  try {
    const { data } = await axios.post(
      `${API_URL}/api/v3/order`,
      new URLSearchParams(order).toString(),
      { headers: { 'X-MBX-APIKEY': API_KEY } }
    );

    console.log(data);

  } catch (err) {
    console.log(err.response.data);
  }
}

setInterval(() => {
  start({ margin: 1 })
  // start({ BUY_PRICE: 59320, SELL_PRICE: 59330, margin: 1 })
  // start({ BUY_PRICE: 59330, SELL_PRICE: 59340, margin: 2 })
}, 3000);

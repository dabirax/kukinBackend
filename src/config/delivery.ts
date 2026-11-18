const DEFAULT_DELIVERY_FEE = 4500;

function getDeliveryFee() {
  const configured = Number(process.env.DELIVERY_FEE_NAIRA);

  if (!Number.isFinite(configured) || configured < 0) {
    return DEFAULT_DELIVERY_FEE;
  }

  return Number(configured.toFixed(2));
}

module.exports = { getDeliveryFee, DEFAULT_DELIVERY_FEE };

function calcTotals(items: any[]) {
  const totals = items.reduce(
    (result, item) => {
      const amount = Number(item.amount) || 0;
      const price = Number(item.price) || 0;

      result.noOfItems += amount;
      result.subtotal += amount * price;

      return result;
    },
    { subtotal: 0, noOfItems: 0 }
  );

  return {
    subtotal: Number(totals.subtotal.toFixed(2)),
    noOfItems: totals.noOfItems,
  };
}

module.exports = { calcTotals };

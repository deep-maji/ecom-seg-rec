export const BRL_TO_INR_RATE = 15.7009;

export const formatBrl = (amount) =>
  `R$${Number(amount).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;

export const formatInr = (amountInBrl) =>
  `₹${(Number(amountInBrl) * BRL_TO_INR_RATE).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

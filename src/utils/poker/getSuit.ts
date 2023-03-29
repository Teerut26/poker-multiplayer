const getSuit = (card: number) =>
  ["HEART", "CLUB", "DIAMOND", "SPADE"][Math.ceil(card / 13) - 1];

export default getSuit;

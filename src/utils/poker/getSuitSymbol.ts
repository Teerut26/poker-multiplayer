const getSuitSymbol = (card: number) =>
  ["♥", "♣", "♦", "♠"][Math.ceil(card / 13) - 1];

export default getSuitSymbol;

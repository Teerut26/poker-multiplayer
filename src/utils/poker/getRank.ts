const getRank = (card: number) =>
  ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][
    (card % 13 || 13) - 1
  ];

export default getRank;

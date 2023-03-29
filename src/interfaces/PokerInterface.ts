export enum PlayingCard {
  AceOfSpades = "AS",
  TwoOfSpades = "2S",
  ThreeOfSpades = "3S",
  FourOfSpades = "4S",
  FiveOfSpades = "5S",
  SixOfSpades = "6S",
  SevenOfSpades = "7S",
  EightOfSpades = "8S",
  NineOfSpades = "9S",
  TenOfSpades = "10S",
  JackOfSpades = "JS",
  QueenOfSpades = "QS",
  KingOfSpades = "KS",
  AceOfHearts = "AH",
  TwoOfHearts = "2H",
  ThreeOfHearts = "3H",
  FourOfHearts = "4H",
  FiveOfHearts = "5H",
  SixOfHearts = "6H",
  SevenOfHearts = "7H",
  EightOfHearts = "8H",
  NineOfHearts = "9H",
  TenOfHearts = "10H",
  JackOfHearts = "JH",
  QueenOfHearts = "QH",
  KingOfHearts = "KH",
  AceOfDiamonds = "AD",
  TwoOfDiamonds = "2D",
  ThreeOfDiamonds = "3D",
  FourOfDiamonds = "4D",
  FiveOfDiamonds = "5D",
  SixOfDiamonds = "6D",
  SevenOfDiamonds = "7D",
  EightOfDiamonds = "8D",
  NineOfDiamonds = "9D",
  TenOfDiamonds = "10D",
  JackOfDiamonds = "JD",
  QueenOfDiamonds = "QD",
  KingOfDiamonds = "KD",
  AceOfClubs = "AC",
  TwoOfClubs = "2C",
  ThreeOfClubs = "3C",
  FourOfClubs = "4C",
  FiveOfClubs = "5C",
  SixOfClubs = "6C",
  SevenOfClubs = "7C",
  EightOfClubs = "8C",
  NineOfClubs = "9C",
  TenOfClubs = "10C",
  JackOfClubs = "JC",
  QueenOfClubs = "QC",
  KingOfClubs = "KC",
  BlueBack = "BLUE_BACK",
  RedBack = "RED_BACK",
}

export type CardCode =
  | "AS"
  | "2S"
  | "3S"
  | "4S"
  | "5S"
  | "6S"
  | "7S"
  | "8S"
  | "9S"
  | "10S"
  | "JS"
  | "QS"
  | "KS"
  | "AH"
  | "2H"
  | "3H"
  | "4H"
  | "5H"
  | "6H"
  | "7H"
  | "8H"
  | "9H"
  | "10H"
  | "JH"
  | "QH"
  | "KH"
  | "AD"
  | "2D"
  | "3D"
  | "4D"
  | "5D"
  | "6D"
  | "7D"
  | "8D"
  | "9D"
  | "10D"
  | "JD"
  | "QD"
  | "KD"
  | "AC"
  | "2C"
  | "3C"
  | "4C"
  | "5C"
  | "6C"
  | "7C"
  | "8C"
  | "9C"
  | "10C"
  | "JC"
  | "QC"
  | "KC"
  | "BLUE_BACK"
  | "RED_BACK";

export type GameStatus =
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "waiting"
  | "end";
export type PlayerStatus = "waiting" | "playing" | "fold" | "allin";

export interface RoomTypes {
  id: string;
  name: string;
  description: string;
  owner: OwnerTypes;
  players: PlayerTypes[];
  status: GameStatus;
  createdAt: string;
  money: number;
  turnCurrent: number;
  cards?: CardCode[];
  winner?: Winner;
}

export interface Winner {
  player: PlayerTypes;
  cardInfo: ToValue;
}

export interface OwnerTypes {
  id: string;
  name: string;
  avatar: string;
}

export interface PlayerTypes {
  id: string;
  name: string;
  avatar: string;
  cards?: CardCode[];
  money: number;
  status: PlayerStatus;
}

export interface ToValue {
  type: number;
  cards: number[];
  value: number;
  name: string;
}

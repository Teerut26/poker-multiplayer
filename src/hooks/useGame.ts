import { db } from "@/configs/firebase";
import {
  PlayerTypes,
  RoomTypes,
  ToValue,
  Winner,
} from "@/interfaces/PokerInterface";
import { child, get, onValue, ref, set, update } from "firebase/database";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import PokerCalculator from "@/utils/poker";
import _ from "lodash";

interface returnTypes {
  startGame: (roomId: string) => void;
  game: RoomTypes | undefined;
  check: () => Promise<void>;
  raise: (money: number) => Promise<void>;
  fold: () => Promise<void>;
  resetGame: () => Promise<void>;
  cardRank: ToValue | undefined;
}

interface inputTypes {
  roomId?: string;
}

export default function useGame(input?: inputTypes): returnTypes {
  const { data: session } = useSession();
  const [game, setGame] = useState<RoomTypes | undefined>();
  const [cardRank, setCardRank] = useState<undefined | ToValue>();

  useEffect(() => {
    if (input?.roomId) {
      const starCountRef = ref(db, `room/${input.roomId}`);
      const unsubscribe = onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        setGame({ ...data, players: Object.values(data.players) } as RoomTypes);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [input?.roomId]);

  function parseCard(card: string): [string, string] | null {
    const regex = /^([2-9]|10|[JQKA])([CDHS])$/;
    const matches: any = card.match(regex);
    if (matches) {
      return [matches[1], matches[2]];
    }
    return null;
  }

  //check winner
  useEffect(() => {
    if (game?.owner.id === session?.user.id && game?.status === "end") {
      let winner = null as null | Winner;
      let communityCards = game.cards;

      const playerWinnerResult = game.players.map((player) => {
        const handCards = [...communityCards!, ...player.cards!];
        const handToInt = handCards.map((card) => {
          return PokerCalculator.convert(
            parseCard(card!)![0],
            parseCard(card!)![1]
          );
        });
        return { cardInfo: PokerCalculator.hand(handToInt), player } as Winner;
      });

      //sort by value
      winner = _.maxBy(playerWinnerResult, (o) => o.cardInfo.value) as Winner;

      setWinner(winner);
    }
  }, [game]);

  const setWinner = async (winner: Winner) => {
    const roomRaw = await get(child(ref(db), `room/${game?.id}`));
    const roomCheck = roomRaw.val();

    //update money player winner
    const playerWinner = (
      Object.values(roomCheck.players) as PlayerTypes[]
    ).find(
      (player: PlayerTypes) => player.id === winner.player.id
    ) as PlayerTypes;

    const money = playerWinner.money + roomCheck.money;
    update(ref(db, `room/${game?.id}/players/${playerWinner.id}`), {
      money,
    } as PlayerTypes);

    await update(ref(db, `room/${game?.id}`), {
      winner,
      money: 0,
    } as RoomTypes);

    await restartGame();
  };

  const restartGame = async () => {
    const roomRaw = await get(child(ref(db), `room/${game?.id}`));
    const roomCheck = roomRaw.val();

    (Object.values(roomCheck.players) as PlayerTypes[]).map(async (player) => {
      update(ref(db, `room/${game?.id}/players/${player.id}`), {
        cards: [] as any,
        status: "waiting",
      });
    });

    await update(ref(db, `room/${game?.id}`), {
      cards: [] as any,
      status: "waiting",
      money: 0,
    } as RoomTypes);
  };

  const startGame = async (roomId: string) => {
    let cardDeck = [
      "2C",
      "2D",
      "2H",
      "2S",
      "3C",
      "3D",
      "3H",
      "3S",
      "4C",
      "4D",
      "4H",
      "4S",
      "5C",
      "5D",
      "5H",
      "5S",
      "6C",
      "6D",
      "6H",
      "6S",
      "7C",
      "7D",
      "7H",
      "7S",
      "8C",
      "8D",
      "8H",
      "8S",
      "9C",
      "9D",
      "9H",
      "9S",
      "10C",
      "10D",
      "10H",
      "10S",
      "JC",
      "JD",
      "JH",
      "JS",
      "QC",
      "QD",
      "QH",
      "QS",
      "KC",
      "KD",
      "KH",
      "KS",
      "AC",
      "AD",
      "AH",
      "AS",
    ];

    if (!(await checkOwner(roomId))) return;

    const players = Object.values(
      (await get(child(ref(db), `room/${roomId}/players`))).val()
    ) as PlayerTypes[];

    let playerWithCard = players.map((player) => {
      const playerCards = [];
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * cardDeck.length);
        const card = cardDeck[randomIndex];
        playerCards.push(card);
        cardDeck.splice(randomIndex, 1);
      }
      return {
        ...player,
        cards: playerCards,
        status: "playing",
      };
    });

    const communityCards = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * cardDeck.length);
      const card = cardDeck[randomIndex];
      communityCards.push(card);
      cardDeck.splice(randomIndex, 1);
    }

    playerWithCard.map(async (player) => {
      await update(
        child(ref(db), `room/${roomId}/players/${player.id}`),
        player
      );
    });

    update(child(ref(db), `room/${roomId}`), {
      cards: communityCards,
      status: "preflop",
    } as RoomTypes);
  };

  const check = async () => {
    await runSequence();
  };

  const raise = async (money: number) => {
    money = Number.parseInt(money as any);
    const roomCheck = await get(child(ref(db), `room/${input?.roomId}`));
    let roomVal = roomCheck.val() as RoomTypes;
    roomVal.players = Object.values(roomVal.players);

    const playerCheck = await get(
      child(ref(db), `room/${input?.roomId}/players/${session?.user.id}`)
    );
    const playerVal = playerCheck.val() as PlayerTypes;

    if (money > playerVal.money) return;

    await update(
      child(ref(db), `room/${input?.roomId}/players/${session?.user.id}`),
      {
        money: playerVal.money - money,
      } as PlayerTypes
    );

    console.log(money);

    await update(child(ref(db), `room/${input?.roomId}`), {
      money: roomVal.money + money,
    } as RoomTypes);

    runSequence();
  };

  const fold = async () => {
    await update(
      child(ref(db), `room/${input?.roomId}/players/${session?.user.id}`),
      {
        status: "fold",
      } as PlayerTypes
    );

    await runSequence();
  };

  const runSequence = async () => {
    const roomCheck = await get(child(ref(db), `room/${input?.roomId}`));
    let roomVal = roomCheck.val() as RoomTypes;
    roomVal.players = Object.values(roomVal.players).filter(
      (player) => player.status !== "fold"
    ) as PlayerTypes[];
    roomVal.turnCurrent = roomVal.turnCurrent + 1;
    if (roomVal.turnCurrent > roomVal.players.length - 1) {
      const room = await get(child(ref(db), `room/${input?.roomId}`));
      const roomValTmp = room.val() as RoomTypes;
      await update(child(ref(db), `room/${input?.roomId}`), {
        status:
          roomValTmp.status === "preflop"
            ? "flop"
            : roomValTmp.status === "flop"
            ? "turn"
            : roomValTmp.status === "turn"
            ? "river"
            : "end",
      } as RoomTypes);
      roomVal.turnCurrent = 0;
    }
    await update(child(ref(db), `room/${input?.roomId}`), {
      turnCurrent: roomVal.turnCurrent,
    } as RoomTypes);
  };

  const checkOwner = async (roomId: string): Promise<boolean> => {
    const roomCheck = await get(child(ref(db), `room/${roomId}`));
    const roomVal = roomCheck.val() as RoomTypes;

    return roomVal.owner.id === session?.user.id;
  };

  const resetGame = async () => {
    const roomCheck = await get(child(ref(db), `room/${input?.roomId}`));
    const roomVal = roomCheck.val() as RoomTypes;

    const players = Object.values(roomVal.players).map((player) => {
      return { ...player, status: "waiting", money: 10000, cards: [] };
    }) as PlayerTypes[];

    players.map(async (player) => {
      await update(
        child(ref(db), `room/${input?.roomId}/players/${player.id}`),
        player
      );
    });

    await update(child(ref(db), `room/${input?.roomId}`), {
      status: "waiting",
      turnCurrent: 0,
      cards: [] as any,
      money: 0,
    } as RoomTypes);
  };

  useEffect(() => {
    if (game?.cards && game?.cards?.length > 0) {
      const length =
        game?.status === "flop"
          ? 3
          : game?.status === "turn"
          ? 4
          : game?.status === "river"
          ? 5
          : -1;
      if (
        game.players.filter((player) => player.id === session?.user.id)[0]
          ?.cards
      ) {
        const handCards = [
          ...(length > 0 ? game?.cards!.slice(0, length) : []),
          ...(game.cards
            ? game.players.filter((player) => player.id === session?.user.id)[0]
                ?.cards!
            : []),
        ];
        const handToInt = handCards.map((card) => {
          return PokerCalculator.convert(
            parseCard(card!)![0],
            parseCard(card!)![1]
          );
        });

        setCardRank(PokerCalculator.hand(handToInt));
      }
    }
  }, [game]);

  return { game, startGame, check, raise, fold, resetGame, cardRank };
}

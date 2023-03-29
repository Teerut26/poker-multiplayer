import { db } from "@/configs/firebase";
import { PlayerTypes, RoomTypes } from "@/interfaces/PokerInterface";
import { child, get, onValue, ref, remove, set, push } from "firebase/database";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

interface returnTypes {
  rooms: RoomTypes[];
  room: RoomTypes | undefined;
  createRoom: (name: string) => Promise<string>;
  joinRoom: (roomId: string) => void;
  deleteRoom: (roomId: string) => Promise<void>;
  isOwner: (roomId: string) => Promise<boolean>;
  isYourTurn: boolean;
}

interface inputTypes {
  roomId?: string;
}

export default function useRoom(input?: inputTypes): returnTypes {
  const [rooms, setRooms] = useState<RoomTypes[]>([]);
  const [room, setRoom] = useState<RoomTypes | undefined>();
  const [isYourTurn, setIsYourTurn] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    const starCountRef = ref(db, "room");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      setRooms(
        data
          ? (Object.values(data) as RoomTypes[]).map((room) => ({
              ...room,
              players: room.players ? Object.values(room.players) : [],
            }))
          : []
      );
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (input?.roomId) {
      const starCountRef = ref(db, `room/${input.roomId}`);
      const unsubscribe = onValue(starCountRef, (snapshot) => {
        const data = {
          ...snapshot.val(),
          players: Object.values(snapshot.val().players),
        } as RoomTypes;
        setRoom(data);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [input?.roomId]);

  useEffect(() => {
    if (room && room.status !== "waiting") {
      setIsYourTurn(
        room.players.findIndex((item) => item.id === session?.user.id) ===
          room.turnCurrent
      );
    } else if (room && room.status === "waiting") {
      setIsYourTurn(false);
    }
  }, [room]);

  const createRoom = async (name: string): Promise<string> => {
    const roomId = uuid();

    //check room name
    const roomCheck = await get(child(ref(db), `room`));
    if (roomCheck.exists()) {
      const roomData = roomCheck.val();
      const roomNameCheck = (Object.values(roomData) as RoomTypes[]).find(
        (room) => room.name === name
      );
      if (roomNameCheck) {
        throw new Error("Room name already exists");
      }
    }

    try {
      set(ref(db, "room/" + roomId), {
        id: roomId,
        name,
        owner: {
          id: session?.user.id,
          name: session?.user.username,
          avatar: session?.user.image_url,
        },
        money: 0,
        status: "waiting",
        turnCurrent: 0,
      } as RoomTypes);

      set(ref(db, `room/${roomId}/players/${session?.user.id}`), {
        id: session?.user.id,
        name: session?.user.username,
        avatar: session?.user.image_url,
        money: 10000,
        status: "waiting",
      } as PlayerTypes);

      return roomId;
    } catch (error) {
      throw new Error("Error create room");
    }
  };

  const joinRoom = async (roomId: string) => {
    const roomCheck = await get(child(ref(db), `room/${roomId}`));

    if (!roomCheck) return;
    const roomVal = roomCheck.val() as RoomTypes;
    if (roomVal.status !== "waiting") {
      return;
    }
    const playerCheck = (Object.values(roomVal.players) as PlayerTypes[]).find(
      (item) => item.id === session?.user.id
    );

    if (playerCheck) return;

    if (session?.user.id) {
      set(ref(db, "room/" + roomId + "/players/" + session?.user.id), {
        id: session?.user.id,
        name: session?.user.username,
        avatar: session?.user.image_url,
        cards: [],
        money: 10000,
        status: "waiting",
      } as PlayerTypes);
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const roomCheck = await get(child(ref(db), `room/${roomId}`));
      const roomVal = roomCheck.val() as RoomTypes;

      if (roomVal.owner.id !== session?.user.id) {
        throw new Error("You are not owner of this room");
      }
      await remove(ref(db, `room/${roomId}`));
    } catch (error) {
      throw new Error("Error delete room");
    }
  };

  const isOwner = async (roomId: string) => {
    const roomCheck = await get(child(ref(db), `room/${roomId}`));
    const roomVal = roomCheck.val() as RoomTypes;

    if (roomVal.owner.id === session?.user.id) {
      return true;
    }

    return false;
  };

  return { room, rooms, createRoom, joinRoom, deleteRoom, isOwner, isYourTurn };
}

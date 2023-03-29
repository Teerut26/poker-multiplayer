import CardDeck from "@/components/CardDeck";
import useRoom from "@/hooks/useRoom";
import styled from "@emotion/styled";
import { Avatar, Button, Divider, Form, Input, Modal } from "antd";
import { NextPage, NextPageContext } from "next";
import { useSession } from "next-auth/react";
import numeral from "numeral";
import { useEffect, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import useGame from "@/hooks/useGame";
import { GameStatus } from "@/interfaces/PokerInterface";
import RefreshIcon from "@mui/icons-material/Refresh";

export function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      id: context.query.id,
    },
  };
}

const Table = styled.div`
  background-image: radial-gradient(
    circle,
    rgba(36, 96, 168, 1) 0%,
    rgba(9, 29, 87, 1) 100%
  );
`;

const FoldButton = styled.button`
  background-color: #f44336;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.5rem;
  &:disabled {
    opacity: 0.5;
  }
`;

const CheckButton = styled.button`
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.5rem;
  &:disabled {
    opacity: 0.5;
  }
`;

const CallButton = styled.button`
  background-color: #2196f3;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  padding: 0.5rem;
  font-weight: 600;
  &:disabled {
    opacity: 0.5;
  }
`;

const RaiseButton = styled.button`
  background-color: #ff9800;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  padding: 0.5rem;
  font-weight: 600;
  &:disabled {
    opacity: 0.5;
  }
`;

interface Props {
  id: string;
}

const Room: NextPage<Props> = ({ id }) => {
  const { room, joinRoom, isYourTurn } = useRoom({ roomId: id });
  const { data: session } = useSession();
  const { check, fold, raise, cardRank } = useGame({ roomId: id });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const player = room?.players.find((item) => item.id === session?.user.id);

  useEffect(() => {
    joinRoom(id);
  }, []);

  const checkOw = () => {
    return room?.owner.id === session?.user.id;
  };

  const checkShowFace = (hasShow: GameStatus[]) => {
    return hasShow.includes(room?.status!);
  };

  return (
    <>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => setIsModalOpen((pre) => !pre)}
      >
        <Form
          onFinish={async () => {
            await raise(form.getFieldValue("raise"));
            setIsModalOpen((pre) => !pre);
          }}
          requiredMark
          form={form}
          layout="vertical"
        >
          <Form.Item rules={[{ required: true }]} label="Raise" name="raise">
            <Input size="large" type="number" />
          </Form.Item>
        </Form>
      </Modal>
      <Table className="tw-flex tw-min-h-screen tw-flex-col tw-items-center tw-justify-center">
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3">
          <div className="tw-flex tw-justify-center tw-rounded-md tw-bg-[#151E2D] tw-px-10 tw-py-1 tw-text-2xl tw-text-white">
            ${numeral(room?.money).format("0,0")}
          </div>
          <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-2">
            {room?.cards ? (
              room?.cards?.map((card, id) => (
                <CardDeck
                  type={card}
                  key={id}
                  showFace={checkShowFace(
                    id < 3
                      ? ["flop", "turn", "river", "end"]
                      : id === 3
                      ? ["turn", "river", "end"]
                      : id === 4
                      ? ["river", "end"]
                      : []
                  )}
                />
              ))
            ) : (
              <>
                <CardDeck type={"BLUE_BACK"} />
                <CardDeck type={"BLUE_BACK"} />
                <CardDeck type={"BLUE_BACK"} />
                <CardDeck type={"BLUE_BACK"} />
                <CardDeck type={"BLUE_BACK"} />
              </>
            )}
          </div>
          <div className="tw-flex tw-gap-2">
            {room?.players.map((player, id) => (
              <Avatar
                key={id}
                style={{ backgroundColor: "#1890ff" }}
                src={player.avatar}
              />
            ))}
          </div>
          <Divider plain style={{ color: "#FFFFFF" }}>
            My card ({cardRank?.name} - {cardRank?.value})
          </Divider>
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-5">
            <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-2">
              {player?.cards ? (
                player?.cards.map((card, id) => (
                  <CardDeck
                    key={id}
                    type={card}
                    size="10rem"
                    isFlipped={true}
                  />
                ))
              ) : (
                <>
                  <CardDeck type="AH" size="10rem" isFlipped={true} />
                  <CardDeck type="AH" size="10rem" isFlipped={true} />
                </>
              )}
            </div>
            <div className="tw-text-md tw-flex tw-justify-center tw-rounded-md tw-bg-[#151E2D] tw-px-10 tw-py-1 tw-text-white">
              ${numeral(player?.money).format("0,0")}
            </div>

            <div className="tw-flex tw-justify-center tw-gap-2">
              <FoldButton
                onClick={() => fold()}
                disabled={!isYourTurn || room?.status === "end"}
              >
                Fold
              </FoldButton>
              <CheckButton
                onClick={() => check()}
                disabled={!isYourTurn || room?.status === "end"}
              >
                Check
              </CheckButton>
              {/* <CallButton  disabled={!isYourTurn}>Call</CallButton> */}
              <RaiseButton
                // onClick={() => raise(100)}
                onClick={() => setIsModalOpen((pre) => !pre)}
                disabled={!isYourTurn || room?.status === "end"}
              >
                Raise
              </RaiseButton>
            </div>
            {checkOw() && <AdminPanel id={id} />}
          </div>
        </div>
      </Table>
    </>
  );
};

function AdminPanel({ id }: { id: string }) {
  const { game, startGame, resetGame } = useGame({ roomId: id });

  return (
    <div className="tw-flex  tw-flex-wrap tw-gap-2">
      <Button
        onClick={() => startGame(id)}
        icon={<PlayArrowIcon />}
        type="primary"
        disabled={!(game?.status === "waiting")}
      >
        Start Game
      </Button>
      <Button
        onClick={() => resetGame()}
        icon={<RefreshIcon />}
        type="primary"
        disabled={!(game?.status !== "waiting")}
      >
        Reset Game
      </Button>
    </div>
  );
}

export default Room;

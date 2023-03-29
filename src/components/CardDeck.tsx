import { CardCode } from "@/interfaces/PokerInterface";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  type: CardCode;
  size?: string;
  isFlipped?: boolean;
  showFace?: boolean;
}

const CardDeck: NextPage<Props> = ({ type, size, isFlipped, showFace }) => {
  showFace = showFace || false;
  isFlipped = isFlipped || false;
  size = size || "10rem";

  const [isFace, setIsFace] = useState(false);

  const handleFlip = () => {
    isFlipped && setIsFace(!isFace);
  };

  useEffect(() => {
    setIsFace(showFace!);
  }, [showFace]);

  return (
    <AnimatePresence>
      <motion.img
        animate={{ rotateY: isFace ? 0 : 180 }}
        initial={{ rotateY: 0 }}
        onClick={handleFlip}
        src={`/cards/${isFace ? type : "BLUE_BACK"}.svg`}
        style={{ width: size }}
        alt=""
        draggable="false"
        className="tw-select-none tw-shadow-md"
      />
    </AnimatePresence>
  );
};

export default CardDeck;

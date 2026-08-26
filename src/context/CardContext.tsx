import { createContext, ReactNode, useContext, useState } from "react";
import type { MoveCard } from "../types/card";

type CardContextValue = {
  cards: MoveCard[];
  addCard: (card: MoveCard) => void;
  getCardById: (id: string) => MoveCard | undefined;
  toggleBookmark: (id: string) => void;
  deleteCard: (id: string) => void;
};

const CardContext = createContext<CardContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function CardProvider({ children }: Props) {
  const [cards, setCards] = useState<MoveCard[]>([]);

  function addCard(card: MoveCard) {
    setCards((prevCards) => [...prevCards, card]);
  }

  function getCardById(id: string) {
    return cards.find((card) => card.id === id);
  }

  function toggleBookmark(id: string) {
    setCards((prevCards) => 
      prevCards.map((card) => 
        card.id === id  
          ? { ...card, isBookmarked: !card.isBookmarked}
        : card
      )
    )
  }

  function deleteCard(id: string) {
    setCards((prevCards) =>
      prevCards.filter((card) => card.id !== id)
    );
  }

  return (
    <CardContext.Provider
      value={{ cards, addCard, getCardById, toggleBookmark, deleteCard }}
    >
      {children}
    </CardContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardContext);

  if (!context) {
    throw new Error("useCards는 CardProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}

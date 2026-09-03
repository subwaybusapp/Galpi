import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { MoveCard } from "../types/card";

type CardContextValue = {
  cards: MoveCard[];
  addCard: (card: MoveCard) => Promise<void>;
  getCardById: (id: string) => MoveCard | undefined;
  toggleBookmark: (id: string) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
};

const CardContext = createContext<CardContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function CardProvider({ children }: Props) {
  const [cards, setCards] = useState<MoveCard[]>([]);

  useEffect(() => {
    let unsubscribeCards: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeCards?.();
      unsubscribeCards = undefined;
      setCards([]);

      if (!user) {
        return;
      }

      const userId = user.uid;
      const cardsRef = collection(db, "users", userId, "cards");

      unsubscribeCards = onSnapshot(
        cardsRef,
        (snapshot) => {
          if (auth.currentUser?.uid !== userId) {
            return;
          }

          const nextCards = snapshot.docs
            .map((cardDocument) => ({
              ...(cardDocument.data() as Omit<MoveCard, "id">),
              id: cardDocument.id,
            }))
            .sort((firstCard, secondCard) =>
              firstCard.id.localeCompare(secondCard.id)
            );

          setCards(nextCards);
        },
        (error) => {
          console.error("카드 목록을 불러오지 못했습니다.", error);
        }
      );
    });

    return () => {
      unsubscribeCards?.();
      unsubscribeAuth();
    };
  }, []);

  async function addCard(card: MoveCard) {
    const user = auth.currentUser;

    if (!user) {
      setCards((prevCards) => [...prevCards, card]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "cards", card.id), card);
  }

  function getCardById(id: string) {
    return cards.find((card) => card.id === id);
  }

  async function toggleBookmark(id: string) {
    const targetCard = cards.find((card) => card.id === id);

    if (!targetCard) {
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === id
            ? { ...card, isBookmarked: !card.isBookmarked }
            : card
        )
      );
      return;
    }

    await updateDoc(doc(db, "users", user.uid, "cards", id), {
      isBookmarked: !targetCard.isBookmarked,
    });
  }

  async function deleteCard(id: string) {
    const user = auth.currentUser;

    if (!user) {
      setCards((prevCards) =>
        prevCards.filter((card) => card.id !== id)
      );
      return;
    }

    await deleteDoc(doc(db, "users", user.uid, "cards", id));
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

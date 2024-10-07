import React, { createContext, useContext, useState, useCallback } from 'react';

// Define the shape of a WorkspaceCard
interface WorkspaceCard {
  id: number;
  title: string;
  data: any; // You might want to be more specific about the data structure
}

// Define the shape of the context
interface WorkspaceCardContextType {
  WorkspaceCards: WorkspaceCard[];
  createWorkspaceCard: (newWorkspaceCard: Omit<WorkspaceCard, 'id'>) => void;
  getWorkspaceCard: (id: number) => WorkspaceCard | undefined;
  updateWorkspaceCard: (
    id: number,
    updatedWorkspaceCard: Partial<WorkspaceCard>,
  ) => void;
  deleteWorkspaceCard: (id: number) => void;
}

// Create the context
const WorkspaceCardEditorContext = createContext<WorkspaceCardContextType>({
  WorkspaceCards: [],
  createWorkspaceCard: () => null,
  getWorkspaceCard: () => undefined,
  updateWorkspaceCard: () => null,
  deleteWorkspaceCard: () => null,
});

// Custom hook to use the WorkspaceCard context
export const useWorkspaceEditorCardContext = (): WorkspaceCardContextType => {
  const context = useContext(WorkspaceCardEditorContext);
  if (!context) {
    throw new Error(
      'useWorkspaceCardContext must be used within a WorkspaceCardProvider',
    );
  }
  return context;
};

// Props for the WorkspaceCardProvider component
interface WorkspaceCardProviderProps {
  children: React.ReactNode;
}

// Create a provider component
const WorkspaceCardProvider = ({ children }: WorkspaceCardProviderProps) => {
  const [WorkspaceCards, setWorkspaceCards] = useState<WorkspaceCard[]>([]);

  // Create a new WorkspaceCard
  const createWorkspaceCard = useCallback(
    (newWorkspaceCard: Omit<WorkspaceCard, 'id'>) => {
      setWorkspaceCards((prevWorkspaceCards) => [
        ...prevWorkspaceCards,
        { ...newWorkspaceCard, id: Date.now() },
      ]);
    },
    [WorkspaceCards],
  );

  // Read a specific WorkspaceCard
  const getWorkspaceCard = useCallback(
    (id: number) => {
      return WorkspaceCards.find((WorkspaceCard) => WorkspaceCard.id === id);
    },
    [WorkspaceCards],
  );

  // Update a WorkspaceCard
  const updateWorkspaceCard = useCallback(
    (id: number, updatedWorkspaceCard: Partial<WorkspaceCard>) => {
      setWorkspaceCards((prevWorkspaceCards) =>
        prevWorkspaceCards.map((WorkspaceCard) =>
          WorkspaceCard.id === id
            ? { ...WorkspaceCard, ...updatedWorkspaceCard }
            : WorkspaceCard,
        ),
      );
    },
    [WorkspaceCards],
  );

  // Delete a WorkspaceCard
  const deleteWorkspaceCard = useCallback((id: number) => {
    setWorkspaceCards((prevWorkspaceCards) =>
      prevWorkspaceCards.filter((WorkspaceCard) => WorkspaceCard.id !== id),
    );
  }, [WorkspaceCards]);

  const value: WorkspaceCardContextType = {
    WorkspaceCards,
    createWorkspaceCard,
    getWorkspaceCard,
    updateWorkspaceCard,
    deleteWorkspaceCard,
  };

  return (
    <WorkspaceCardEditorContext.Provider value={value}>
      {children}
      </WorkspaceCardEditorContext.Provider>
  );
};

export default WorkspaceCardProvider;

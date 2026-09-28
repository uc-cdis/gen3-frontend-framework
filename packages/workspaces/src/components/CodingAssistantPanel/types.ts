export type UIMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
};

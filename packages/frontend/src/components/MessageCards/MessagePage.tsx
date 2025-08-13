import React from 'react';

interface MessagePageProps {
  children: React.ReactNode;
}
const MessagePage = ({ children }: MessagePageProps) => {
  // place children in center of div that is 1/2 the visible height
  return (
    <div className="flex justify-center items-center w-full h-vh">
      {children}
    </div>
  );
};

export default MessagePage;

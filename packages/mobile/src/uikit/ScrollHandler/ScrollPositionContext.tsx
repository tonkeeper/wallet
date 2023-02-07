import React, { FC, useState } from 'react';

export const ScrollPositionContext = React.createContext<{
  isEnd: boolean;
  changeEnd: (_: boolean) => void;
}>({
  // @ts-ignore
  isEnd: false,
  changeEnd: (_: boolean) => {},
});

export const ScrollPositionProvider: FC = ({ children }) => {
  const [isEnd, setEnd] = useState(false);

  return (
    <ScrollPositionContext.Provider
      value={{
        isEnd,
        changeEnd(newEnd) {
          setEnd(newEnd);
        },
      }}
    >
      {children}
    </ScrollPositionContext.Provider>
  );
};

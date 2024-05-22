import { useEffect, useState } from 'react';
import missions from './../pages/EmotionalGraphPage/missions.json';

const useUser = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('userData')) ?? {
      experience: 0,
      preferedTheme: 'dark',
    },
  );

  const getLevel = () => {
    return (
      missions
        .reverse()
        .findLast((level) => user.experience >= level.requiredExp)?.level ?? 0
    );
  };

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user]);

  return { user, setUser, getLevel };
};

export default useUser;

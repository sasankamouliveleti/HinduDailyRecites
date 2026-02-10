import { useContext } from 'react';
import { StreaksContext, StreaksContextValue } from '../contexts/StreaksContext';

export function useStreaks(): StreaksContextValue {
  return useContext(StreaksContext);
}

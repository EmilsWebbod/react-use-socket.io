import { useState, useRef, useEffect } from 'react';

export default function useSafeState<T>(
  defaultState: T
): [T, (nextState: T) => void] {
  const [state, setState] = useState(defaultState);
  const mountedRef = useRef(false);

  function setSafeState(nextState: T) {
    return mountedRef.current && setState(nextState);
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => (mountedRef.current = false);
  });

  return [state, setSafeState];
}

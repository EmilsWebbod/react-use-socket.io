declare module 'easy-state' {
  export interface EasyState<T> {
    getState: () => T;
    setState: (state: ((prevState: T) => void) | T) => void;
    subscribe: (prevState: T, nextState: T) => void;
  }

  export default function<T>(state: T): EasyState<T>;
}

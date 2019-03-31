type OnChangeFn<T extends object> = (data: T) => void;

export interface SocketProps<T extends object> {
  url?: string;
  namespace?: string;
  on?: string;
  onChange?: OnChangeFn<T>;
}

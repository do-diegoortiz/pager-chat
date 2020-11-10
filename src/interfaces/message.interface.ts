export interface IMessage {
  type: "text" | "image";
  username: string;
  time: Date;
  text?: string;
  url?: string;
  alt?: string | null;
}

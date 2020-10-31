import { IMessage } from "../interfaces";

const DEFAULT_MESSAGE: IMessage = {
  type: "text",
  username: "",
  time: new Date(),
  text: "",
};

export default DEFAULT_MESSAGE;

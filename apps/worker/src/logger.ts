import { data } from "./store";

export const startLogger = () => {
  setInterval(() => console.log('--------------------------------',data), 5000);
};

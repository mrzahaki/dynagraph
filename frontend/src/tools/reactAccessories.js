import { randomIDMaker } from "./string";

export const useState = (self, init) => {
  let name = randomIDMaker(5);
  self.state[name] = init;
  return [() => self.state[name],
      ((state) => {
        self.setState({
              [name]: state })
      }).bind(self)
  ];
}
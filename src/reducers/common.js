import { TEST } from "../types";

const INITIAL_STATE = { testData: null };

const common = (state = INITIAL_STATE, action) => {
  let { testData } = state;
  switch (action.type) {
    case TEST:
      return { ...state, testData: action.payload };
    default:
      return state;
  }
};

export default common;

import { doTest } from "../actions";
import requests from "../utils/requests";

export function testOperation() {
  return async (dispatch, getState) => {
    try {
      let chunk = await requests.users.doTest();
      let testData = chunk.data;
      await dispatch(doTest(testData));
    } catch (e) {
      console.log("ERROR", e);
    }
  };
}

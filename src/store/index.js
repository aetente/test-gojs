import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from "../reducers";

const composedEnhancer = applyMiddleware(thunkMiddleware);

let store = createStore(rootReducer, composedEnhancer);

export default store;

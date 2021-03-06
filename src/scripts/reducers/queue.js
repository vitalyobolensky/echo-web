import {
  ADD_TO_QUEUE, ADD_TO_QUEUE_TOP, REMOVE_FROM_QUEUE, SET_QUEUE
} from '../constants/ActionTypes';

import {combineReducers} from 'redux';

const items = (state = [], action) => {
  switch (action.type) {
    case ADD_TO_QUEUE: return state.concat(action.payload);
    case ADD_TO_QUEUE_TOP: return action.payload.concat(state);
    case REMOVE_FROM_QUEUE: return state.filter(item => !action.payload.includes(item.id));
    case SET_QUEUE: return action.payload;
    default: return state;
  }
};

export default combineReducers({
  items
});

import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const restaurants = getCollectionFn('restaurants');
export const rodentReports = getCollectionFn('rodentReports');
export const users = getCollectionFn('users');
export const comments = getCollectionFn('comments');
export const reactions = getCollectionFn('reactions');

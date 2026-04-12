 import { restaurants } from '../config/mongoCollections.js';
  // TODO - import validation

    export const getAllRestaurants = async() => {
        const restaurantCollection = await restaurants();
        const restaurantList = await restaurantCollection.find({}).toArray();

        return restaurantList;
    };

    export const getRestaurantById = async() => {

    };

    export const createRestaurant = async() => {

    };

    export const updateRestaurant = async() => {

    };

    export const deleteRestaurant = async() => {

    };


    export const getRestaurantComments = async() => {

    };

    export const addCommentToRestaurant = async() => {

    };

    export const getRestaurantRodentReports = async() => {

    };

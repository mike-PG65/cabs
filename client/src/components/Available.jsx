import React from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchCars } from '../redux/carSlice';

const Available = () => {

    const dispatch = useDispatch()
    const {list: cars = [], error, loading} = useSelector((state) => state.cars || {});
    // console.log("Cars slice:", list, loading, error);

    useEffect(()=>{
        dispatch(fetchCars())
    },
     [dispatch])
  return (
    <div>
        { cars.map((car) => (
            <p> {car.brand}</p>
        ))}
    </div>
  )
}

export default Available
import './App.css'
import React, { useState, useEffect, useRef, createRef } from 'react'
// import * as ReactDOM from "react-dom/client";
import {
  Routes,
  Route,
} from "react-router-dom";

import Home from './routes/home';
import History from './routes/history';


function App() {

  return (

    <div>
      <Routes>

        <Route index element={<Home />} />
        <Route path=":routeId" element={<History />} />

      </Routes>
    </div>


  )
}

export default App
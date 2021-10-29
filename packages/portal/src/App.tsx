import React from "react";
import Provider from "@reduxjs/toolkit"
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import Discovery from "./Discovery/Discovery";



const App: React.FC<any> = () => {
    return ( <div className="flex flex-col min-h-screen min-w-full bg-gray-200">
            <Header> </Header>
            <Discovery></Discovery>
            <Footer></Footer>
        </div>
    )
}

export default App;

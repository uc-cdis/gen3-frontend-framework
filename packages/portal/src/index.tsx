import React from 'react';
import { render } from 'react-dom';
import App from './App'
import './styles/globals.css';
import {CoreProvider} from "@gen3/core";

render(
    <CoreProvider>
    <App> </App>
    </CoreProvider>
    , document.getElementById('root'))

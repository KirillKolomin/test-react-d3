import React from 'react';
import {LineChartControl} from "../features/line-chart-control/LineChartControl";
import styles from './App.module.scss';

function App() {
    return (
        <div className={styles['app']}>
            <LineChartControl></LineChartControl>
        </div>
    );
}

export default App;

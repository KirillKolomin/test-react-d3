import React, {useState} from 'react';
import {FC, memo} from "react";
import styles from './ShiftingPanel.module.scss';

interface ShiftingPanelProps {
    direction: 'left' | 'right';
}

const ShiftingPanel: FC<ShiftingPanelProps> = ({direction}) => {
    const [isChecked, setIsChecked] = useState(false);
    const className = `${styles[direction]} ${isChecked ? `${styles['checked']} ${styles['shifting-panel']}` : styles['shifting-panel']}`

    return <>
        <label className={className}>
            <input className="visually-hidden" type="checkbox"
                   onChange={(event) => setIsChecked(event.target.checked)}/>
        </label>
    </>
}

export default memo(ShiftingPanel);

import {Value} from "../../entities/line-chart/interfaces/value";
import {FC, memo, SyntheticEvent, useRef} from "react";
import styles from './ValuesPanel.module.scss';

interface ValuesPanelProps {
    values: Value[] | null;
    onNewValueAdd: (value: number) => void;
    onValueRemove: (index: number) => void;
}

const ENTER_KEY = 'Enter';
const MINUTES_START_IN_ISO = 14;
const MILLISECONDS_END_IN_ISO = 23;

const ValuesPanel: FC<ValuesPanelProps> = ({values, onValueRemove, onNewValueAdd}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleInputKeyDownEvent = (event: SyntheticEvent<HTMLInputElement, KeyboardEvent>) => {
        if (event.nativeEvent.key !== ENTER_KEY || inputRef.current == null) {
            return;
        }

        event.preventDefault();
        onNewValueAdd(+inputRef.current.value ?? 0);
        inputRef.current.value = '0';
    }
    const adaptTimeToView = (date: Date) => date.toISOString().slice(MINUTES_START_IN_ISO, MILLISECONDS_END_IN_ISO);

    const valueElements = values && values.map((value, index) => (
        <li className={styles['value-item']} key={value.date.toISOString()}>
            <span>{adaptTimeToView(value.date)}</span>
            <span className={styles['value-item__value']}><b>{value.value}</b></span>
            <button className={`${styles['value-item__button']} ${styles['remove-button']}`} onClick={() => onValueRemove(index)}>Remove</button>
        </li>
    ))

    return <>
        <section className={styles['values-panel']}>
            <h3>Data</h3>
            <input ref={inputRef} className={styles['values-panel__input']} type="number" onKeyDown={handleInputKeyDownEvent} />
            <p className={styles['values-panel__list-style']}>List of values</p>
            <ul className={styles['value-list']}>{valueElements}</ul>
        </section>
    </>
}

export default memo(ValuesPanel);

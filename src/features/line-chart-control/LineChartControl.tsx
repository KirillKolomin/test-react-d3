import {FC, memo, useCallback, useEffect, useState} from "react";
import {Value} from "../../entities/line-chart/interfaces/value";
import ShiftingPanel from "../../shared/components/shifting-panel/ShiftingPanel";
import LineChart from "../../widgets/line-chart/LineChart";
import ValuesPanel from "../../widgets/values-panel/ValuesPanel";
import styles from './LineChartControl.module.scss';

const LOCAL_STORAGE_VALUE_KEY = 'values';

export const LineChartControl: FC = () => {
    const [values, setValues] = useState<Value[]>([]);
    const [isLogarithmicChecked, setIsLogarithmicChecked] = useState(false);

    const setValuesToLocalStorage = (values: Value[]) => {
        localStorage.setItem(LOCAL_STORAGE_VALUE_KEY, JSON.stringify(values));
    }
    const addNewValue = useCallback((value: number): void => {
        const newValues = [...values, {
            date: new Date(),
            value,
        }];

        setValues(newValues);
        setValuesToLocalStorage(newValues);
    }, [values]);
    const removeValue = useCallback((index: number): void => {
        const newValues = values.filter((_value, i) => i !== index);

        setValues(newValues);
        setValuesToLocalStorage(newValues);
    }, [values])

    useEffect(function restoreValuesFromLocalStorage() {
        const storedValues = localStorage.getItem(LOCAL_STORAGE_VALUE_KEY);

        if (storedValues) {
            const values = JSON.parse(storedValues);

            if (Array.isArray(values)) {
                const restoredValues = values.map(({value, date}) => ({date: new Date(date), value}))
                setValues(restoredValues);
            }
        }
    }, []);

    return <section className={styles['line-chart-control']}>
        <ShiftingPanel direction="left"></ShiftingPanel>
        <div className={styles['content']}>
            <div className={`b01sb ${styles['content__chart']}`}>
                <LineChart values={values} isLogAxisOn={isLogarithmicChecked}></LineChart>
            </div>
            <div className={`b01sb  ${styles['content__values-panel']}`}>
                <label>
                    <input type="checkbox"
                           onChange={(event) => setIsLogarithmicChecked(event.target.checked)}
                           checked={isLogarithmicChecked}/>
                    log axis
                </label>

                <ValuesPanel values={values} onNewValueAdd={addNewValue} onValueRemove={removeValue}></ValuesPanel>
            </div>
        </div>
        <ShiftingPanel direction="right"></ShiftingPanel>
    </section>
}

export default memo(LineChartControl);

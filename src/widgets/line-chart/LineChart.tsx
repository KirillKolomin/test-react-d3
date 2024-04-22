import {Value} from "../../entities/line-chart/interfaces/value";
import {extent, scaleUtc, scaleLinear, line} from "d3";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import styles from './LineChart.module.scss';
import { throttle } from 'lodash';

interface LineChartProps {
    values: Value[] | null;
}

interface ViewLabel {
    date: Date;
    value: number;
    x: number;
    y: number;
}

const MILLISECONDS_PER_FRAME = 1000 / 60;
const MARGIN_TOP = 20;
const MARGIN_RIGHT = 20;
const MARGIN_BOTTOM = 20;
const MARGIN_LEFT = 20;


const LineChart: FC<LineChartProps> = ({values}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [curve, setCurve] = useState<string | null>(null);
    const [labels, setLabels] = useState<ViewLabel[] | null>(null);
    const [viewBox, setViewBox] = useState(`0, 0, 0, 0`);
    const calculateViewBox = (size: DOMRect) => {
        setViewBox(`0, 0, ${size.width}, ${size.height}`);
    }
    const calculateChart = useCallback((size: DOMRect) => {
        if (values == null) {
            return;
        }

        const dateExtent = extent(values, ({date}) => date) as [Date, Date];
        const valueExtent = extent(values, ({value}) => value) as [number, number];

        const timeScaleX = scaleUtc(dateExtent, [MARGIN_LEFT, size.width - MARGIN_RIGHT]);
        const valueScaleY = scaleLinear(valueExtent, [size.height - MARGIN_BOTTOM, MARGIN_TOP]);

        const curve = line<Value>((data) => timeScaleX(data.date), (data) => valueScaleY(data.value))(values);
        const labels = values.map(({date, value}) => ({
            date,
            value,
            x: timeScaleX(date),
            y: valueScaleY(value),
        }))

        setCurve(curve);
        setLabels(labels);
    }, [values]);

    useEffect(function connectWithResizeObserver() {
        const onResizeObserved = throttle(([entry]: ResizeObserverEntry[]) => {
            calculateViewBox(entry.contentRect);
            calculateChart(entry.contentRect);
        }, MILLISECONDS_PER_FRAME)
        const observer = new ResizeObserver(onResizeObserved);
        const svgElement = svgRef.current;

        if (!svgElement) {
            return;
        }

        observer.observe(svgElement);

        return () => {
            onResizeObserved.cancel();
            observer.unobserve(svgElement)
        };
    }, [calculateChart]);

    const labelElements = labels ? labels.map(label =>
        <text x={label.x} y={label.y} key={label.date.toISOString()} textAnchor="start">{label.value}</text>
    ) : null;

    return <svg ref={svgRef} className={styles['line-chart']} color="steelblue" viewBox={viewBox}>
        {curve && <path fill="none" stroke="currentColor" strokeWidth="1.5" d={curve}/>}
        {labels && <g fill="black" stroke="black">{labelElements}</g>}
    </svg>
}

export default memo(LineChart);

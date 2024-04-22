import {Value} from "../../entities/line-chart/interfaces/value";
import {extent, scaleUtc, scaleLinear, line} from "d3";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import styles from './LineChart.module.scss';
import {throttle} from 'lodash';

interface LineChartProps {
    values: Value[];
}

interface YAxisTick {
    value: number;
    translate: number;
}

interface XAxisTick {
    value: string;
    translate: number;
}

interface ViewLabel {
    date: Date;
    value: number;
    x: number;
    y: number;
}

const MILLISECONDS_PER_FRAME = 1000 / 60;
const MARGIN_TOP = 20;
const MARGIN_RIGHT = 50;
const MARGIN_BOTTOM = 20;
const MARGIN_LEFT = 20;
const Y_AXIS_TICKS_AMOUNT = 15;
const X_AXIS_TICKS_AMOUNT = 15;
const Y_AXIS_WIDTH = 50;
const X_AXIS_HEIGHT = 50;
const X_AXIS_LABELS_ROTATE = -30;
const MINUTES_START_IN_ISO = 14;
const MILLISECONDS_END_IN_ISO = 23;
const ADDITIONAL_X_AXIS_LABEL_HORIZONTAL_TRANSLATE = -20;
const ADDITIONAL_X_AXIS_LABEL_VERTICAL_TRANSLATE = -20;

const LineChart: FC<LineChartProps> = ({values}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [size, setSize] = useState<DOMRect | null>(null)
    const [yAxisTicks, setYAxisTicks] = useState<YAxisTick[] | null>(null);
    const [xAxisTicks, setXAxisTicks] = useState<XAxisTick[] | null>(null);
    const [curve, setCurve] = useState<string | null>(null);
    const [labels, setLabels] = useState<ViewLabel[] | null>(null);
    const [viewBox, setViewBox] = useState(`0, 0, 0, 0`);
    const calculateViewBox = (size: DOMRect) => {
        setViewBox(`0, 0, ${size.width}, ${size.height}`);
    }
    const calculateChart = useCallback((size: DOMRect) => {
        if (!values.length) {
            setLabels(null);
            setCurve(null);
            setYAxisTicks(null);
            setXAxisTicks(null);

            return;
        }

        const dateExtent = extent(values, ({date}) => date) as [Date, Date];
        const valueExtent = extent(values, ({value}) => value) as [number, number];

        const timeScaleX = scaleUtc(dateExtent, [MARGIN_LEFT + Y_AXIS_WIDTH, size.width - MARGIN_RIGHT]);
        const valueScaleY = scaleLinear(valueExtent, [size.height - MARGIN_BOTTOM - X_AXIS_HEIGHT, MARGIN_TOP]);

        const curve = line<Value>((data) => timeScaleX(data.date), (data) => valueScaleY(data.value))(values);
        const labels = values.map(({date, value}) => ({
            date,
            value,
            x: timeScaleX(date),
            y: valueScaleY(value),
        }))

        const yAxisTranslateScale = scaleLinear([0, Y_AXIS_TICKS_AMOUNT], [size.height - MARGIN_BOTTOM - X_AXIS_HEIGHT, MARGIN_TOP]);
        const yAxisValueScale = scaleLinear([0, Y_AXIS_TICKS_AMOUNT], valueExtent);
        const yAxisTicks = Array.from(new Array(Y_AXIS_TICKS_AMOUNT).keys()).map((index) => ({
            value: yAxisValueScale(index),
            translate: yAxisTranslateScale(index),
        }));
        const xAxisTranslateScale = scaleLinear([0, X_AXIS_TICKS_AMOUNT], [MARGIN_LEFT + Y_AXIS_WIDTH, size.width - MARGIN_RIGHT]);
        const xAxisDateScale = scaleLinear([0, X_AXIS_TICKS_AMOUNT], dateExtent);
        const xAxisTicks = Array.from(new Array(X_AXIS_TICKS_AMOUNT).keys()).map((index) => ({
            value: xAxisDateScale(index).toISOString().slice(MINUTES_START_IN_ISO, MILLISECONDS_END_IN_ISO),
            translate: xAxisTranslateScale(index),
        }));

        setYAxisTicks(yAxisTicks);
        setXAxisTicks(xAxisTicks);
        setCurve(curve);
        setLabels(labels);
    }, [values]);

    useEffect(function connectWithResizeObserver() {
        const onResizeObserved = throttle(([entry]: ResizeObserverEntry[]) => {
            setSize(entry.contentRect);
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
    const yAxisTickElements = yAxisTicks && size ? yAxisTicks.map(tick => (
        <g key={tick.translate} transform={`translate(0,${tick.translate})`}>
            <line opacity="0.5" stroke="currentColor" x1={Y_AXIS_WIDTH} x2={size.width - MARGIN_RIGHT}></line>
            <text fill="currentColor" x="0" dy="0.4rem">{Math.floor(tick.value)}</text>
        </g>
    )) : null;
    const xAxisTickElements = xAxisTicks && size ? xAxisTicks.map(tick => (
        <g key={tick.translate} transform={`translate(${tick.translate}, 0)`}>
            <line opacity="0.5" stroke="currentColor" y1={-X_AXIS_HEIGHT} y2={-(size.height - MARGIN_TOP - X_AXIS_HEIGHT)}></line>
            <text transform={`rotate(${X_AXIS_LABELS_ROTATE}) translate(${ADDITIONAL_X_AXIS_LABEL_HORIZONTAL_TRANSLATE}, ${ADDITIONAL_X_AXIS_LABEL_VERTICAL_TRANSLATE})`} fill="currentColor" x="0" dy="0.4rem">{tick.value}</text>
        </g>
    )) : null;

    return <svg ref={svgRef} className={styles['line-chart']} color="steelblue" viewBox={viewBox}>
        {yAxisTickElements && <g transform={`translate(${MARGIN_LEFT},0)`}>
            {yAxisTickElements}
        </g>}
        {xAxisTickElements && size && <g transform={`translate(0,${size.height - MARGIN_BOTTOM})`}>
            {xAxisTickElements}
        </g>}
        {curve && <path fill="none" stroke="currentColor" strokeWidth="1.5" d={curve}/>}
        {labels && <g fill="black" stroke="black">{labelElements}</g>}
    </svg>
}

export default memo(LineChart);

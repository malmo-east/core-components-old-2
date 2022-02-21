/* eslint-disable complexity */
import React, { useCallback, useState, useRef, FC, useEffect, MouseEvent } from 'react';
import cn from 'classnames';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import max from 'date-fns/max';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import { Calendar, usePeriodWithReset } from '@alfalab/core-components-calendar';
import {
    formatDate,
    parseDateString,
    isValidInputValue,
} from '@alfalab/core-components-calendar-input';
import {
    DateInput,
    DateInputProps,
    isCompleteDateInput,
} from '@alfalab/core-components-date-input';

import { isDayButton } from '../utils';
import { CalendarRangeProps } from '../Component';
import { useStaticViewMonthes } from '../hooks';

import styles from './index.module.css';

export type CalendarRangeStaticProps = Omit<CalendarRangeProps, 'calendarPosition'>;

export const CalendarRangeStatic: FC<CalendarRangeStaticProps> = ({
    className,
    defaultMonth = startOfMonth(new Date()).getTime(),
    minDate,
    maxDate,
    valueFrom = '',
    valueTo = '',
    onDateFromChange = () => null,
    onDateToChange = () => null,
    onChange = () => null,
    inputFromProps = {},
    inputToProps = {},
    offDays,
    events,
    dataTestId,
}) => {
    const calendarToRef = useRef<HTMLDivElement>(null);

    const [inputFromValue, setInputFromValue] = useState<string>(valueFrom);
    const [inputToValue, setInputToValue] = useState<string>(valueTo);

    let dateFrom = isValidInputValue(inputFromValue, minDate, maxDate, offDays)
        ? parseDateString(inputFromValue).getTime()
        : null;

    const dateTo = isValidInputValue(inputToValue, dateFrom || minDate, maxDate, offDays)
        ? parseDateString(inputToValue).getTime()
        : null;

    if (isCompleteDateInput(inputToValue) && !dateTo) {
        dateFrom = null;
    }

    const bothInvalid =
        isCompleteDateInput(inputFromValue) &&
        isCompleteDateInput(inputToValue) &&
        parseDateString(inputFromValue).getTime() > parseDateString(inputToValue).getTime();

    const [nextMonthHighlighted, setNextMonthHighlighted] = useState(false);

    const period = usePeriodWithReset({
        initialSelectedFrom: dateFrom ? parseDateString(inputFromValue).getTime() : undefined,
        initialSelectedTo: dateTo ? parseDateString(inputToValue).getTime() : undefined,
    });

    const validateInputFromValue = useCallback(
        (value: string) => isValidInputValue(value, minDate, dateFrom || maxDate, offDays),
        [dateFrom, maxDate, minDate, offDays],
    );

    const validateInputToValue = useCallback(
        (value: string) => isValidInputValue(value, dateFrom || minDate, maxDate, offDays),

        [dateFrom, minDate, maxDate, offDays],
    );

    const [inputFromInvalid, setInputFromInvalid] = useState<boolean>(
        validateInputFromValue(inputFromValue) === false,
    );

    const [inputToInvalid, setInputToInvalid] = useState<boolean>(
        validateInputToValue(inputToValue) === false,
    );

    const { monthFrom, monthTo, handleMonthFromChange, handleMonthToChange } = useStaticViewMonthes(
        {
            selectedFrom: period.selectedFrom,
            selectedTo: period.selectedTo,
            defaultMonth,
        },
    );

    const handleValidInputFrom = useCallback(() => {
        setInputFromInvalid(inputFromValue !== '' && !validateInputFromValue(inputFromValue));
    }, [inputFromValue, validateInputFromValue]);

    const handleValidInputTo = useCallback(() => {
        setInputToInvalid(inputToValue !== '' && !validateInputToValue(inputToValue));
    }, [inputToValue, validateInputToValue]);

    const handleInputFromChange: Required<DateInputProps>['onChange'] = useCallback(
        (_, payload) => {
            setInputFromValue(payload.value);
        },
        [],
    );

    const handleInputToChange: Required<DateInputProps>['onChange'] = useCallback((_, payload) => {
        setInputToValue(payload.value);
    }, []);

    const handleCalendarToMouseOver = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;

        if (calendarToRef.current?.contains(target)) {
            const dayHighlighted = isDayButton(target) || isDayButton(target.parentElement);

            setNextMonthHighlighted(highlighted => {
                if (highlighted && !dayHighlighted) return false;
                if (!highlighted && dayHighlighted) return true;
                return highlighted;
            });
        } else {
            setNextMonthHighlighted(false);
        }
    }, []);

    const handleClearFrom = useCallback(() => {
        setInputFromValue('');
    }, []);

    const handleClearTo = useCallback(() => {
        setInputToValue('');
    }, []);

    useEffect(() => {
        setInputFromValue(period.selectedFrom ? formatDate(period.selectedFrom) : '');
    }, [period.selectedFrom]);

    useEffect(() => {
        setInputToValue(period.selectedTo ? formatDate(period.selectedTo) : '');
    }, [period.selectedTo]);

    useEffect(() => {
        setInputFromValue(valueFrom);
    }, [valueFrom]);

    useEffect(() => {
        setInputToValue(valueTo);
    }, [valueTo]);

    useEffect(() => {
        if (!inputFromValue || isCompleteDateInput(inputFromValue)) {
            handleValidInputFrom();
        }

        period.setStart(dateFrom || undefined);
        if (dateTo) {
            period.setEnd(dateTo);
        }

        if (inputFromValue !== valueFrom) {
            onDateFromChange({
                value: inputFromValue,
                date: dateFrom,
            });

            onChange({
                valueFrom: inputFromValue,
                valueTo: inputToValue,
                dateFrom,
                dateTo,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputFromValue]);

    useEffect(() => {
        if (!inputToValue || isCompleteDateInput(inputToValue)) {
            handleValidInputTo();
        }

        period.setEnd(dateTo || undefined);
        if (dateFrom) {
            period.setStart(dateFrom);
        }

        if (inputToValue !== valueTo) {
            onDateToChange({
                value: inputToValue,
                date: dateTo,
            });

            onChange({
                valueFrom: inputFromValue,
                valueTo: inputToValue,
                dateFrom,
                dateTo,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputToValue]);

    const { calendarProps: calendarFromProps, ...dateInputFromProps } = inputFromProps;
    const { calendarProps: calendarToProps, ...dateInputToProps } = inputToProps;

    const CalendarFromComponent = dateInputFromProps.Calendar || Calendar;
    const CalendarToComponent = dateInputToProps.Calendar || Calendar;

    return (
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <div
            className={cn(styles.component, styles.static, className)}
            onMouseOver={handleCalendarToMouseOver}
            data-test-id={dataTestId}
        >
            <div>
                <DateInput
                    {...dateInputFromProps}
                    mobileMode={
                        dateInputFromProps.mobileMode === 'popover'
                            ? 'input'
                            : dateInputFromProps.mobileMode
                    }
                    value={inputFromValue}
                    onChange={handleInputFromChange}
                    onClear={handleClearFrom}
                    onBlur={handleValidInputFrom}
                    error={bothInvalid || inputFromInvalid || dateInputFromProps.error}
                    clear={true}
                    block={true}
                />
                <CalendarFromComponent
                    {...calendarFromProps}
                    className={cn(styles.calendar, calendarFromProps?.className)}
                    month={monthFrom}
                    selectorView='month-only'
                    offDays={offDays}
                    events={events}
                    onChange={period.updatePeriod}
                    onMonthChange={handleMonthFromChange}
                    minDate={minDate}
                    maxDate={maxDate && max([maxDate, endOfMonth(subMonths(maxDate, 1))]).getTime()}
                    selectedFrom={period.selectedFrom}
                    selectedTo={period.selectedTo || (nextMonthHighlighted ? monthTo : undefined)}
                    rangeComplete={Boolean(period.selectedFrom && period.selectedTo)}
                />
            </div>

            <span className={styles.divider} />

            <div>
                <DateInput
                    {...dateInputToProps}
                    mobileMode={
                        dateInputToProps.mobileMode === 'popover'
                            ? 'input'
                            : dateInputToProps.mobileMode
                    }
                    value={inputToValue}
                    onChange={handleInputToChange}
                    onClear={handleClearTo}
                    onBlur={handleValidInputTo}
                    error={bothInvalid || inputToInvalid}
                    clear={true}
                    block={true}
                />
                <CalendarToComponent
                    {...calendarToProps}
                    className={cn(styles.calendar, calendarToProps?.className)}
                    ref={calendarToRef}
                    month={monthTo}
                    selectorView='month-only'
                    offDays={offDays}
                    events={events}
                    onChange={period.updatePeriod}
                    onMonthChange={handleMonthToChange}
                    minDate={minDate && startOfMonth(addMonths(minDate, 1)).getTime()}
                    maxDate={maxDate}
                    selectedFrom={period.selectedFrom}
                    selectedTo={period.selectedTo}
                />
            </div>
        </div>
    );
};
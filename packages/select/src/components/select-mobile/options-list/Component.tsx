import React, { useCallback, useContext, useEffect } from 'react';
import cn from 'classnames';
import { Button } from '@alfalab/core-components-button';
import { BaseModalContext } from '@alfalab/core-components-base-modal';

import { GroupShape, OptionShape, OptionsListProps, GroupDividerItem } from '../../../typings';
import { Optgroup as DefaultOptgroup } from '../../optgroup';
import { isGroup } from '../../../utils';

import styles from './index.module.css';

const createCounter = () => {
    let count = 0;
    // eslint-disable-next-line no-plusplus
    return () => count++;
};

export const OptionsList = ({
    size = 's',
    className,
    optionGroupClassName,
    Option,
    getOptionProps,
    options = [],
    Optgroup = DefaultOptgroup,
    dataTestId,
    emptyPlaceholder,
    showFooter,
    onApply = () => null,
    onClear = () => null,
}: OptionsListProps) => {
    const { footerHighlighted, setHasFooter } = useContext(BaseModalContext);

    useEffect(() => {
        setHasFooter(true);
    }, [setHasFooter]);

    const renderOption = useCallback(
        (option: OptionShape, index: number) => (
            <Option key={option.key} {...getOptionProps(option, index)} />
        ),
        [getOptionProps],
    );

    const counter = createCounter();
    const renderGroup = useCallback(
        (group: GroupShape) => (
            <Optgroup
                className={optionGroupClassName}
                key={(group.divider as GroupDividerItem).key}
                divider={(group.divider as GroupDividerItem).content}
                size={size}
            >
                {group.options.map(option => renderOption(option, counter()))}
            </Optgroup>
        ),
        [optionGroupClassName, counter, renderOption, size],
    );

    if (options.length === 0 && !emptyPlaceholder) {
        return null;
    }

    return (
        <div className={cn(styles.optionsList, styles[size], className)} data-test-id={dataTestId}>
            {options.map(option =>
                isGroup(option) ? renderGroup(option) : renderOption(option, counter()),
            )}

            {emptyPlaceholder && options.length === 0 && (
                <div className={styles.emptyPlaceholder}>{emptyPlaceholder}</div>
            )}

            {showFooter && (
                <div
                    className={cn(styles.footer, className, {
                        [styles.highlighted]: footerHighlighted,
                    })}
                >
                    <Button
                        size='s'
                        view='primary'
                        onClick={onApply}
                        className={styles.footerButton}
                    >
                        Применить
                    </Button>

                    <Button
                        size='s'
                        view='secondary'
                        onClick={onClear}
                        className={styles.footerButton}
                    >
                        Сбросить
                    </Button>
                </div>
            )}
        </div>
    );
};

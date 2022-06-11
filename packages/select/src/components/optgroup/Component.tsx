import React from 'react';
import cn from 'classnames';
import { OptgroupProps } from '../../typings';

import styles from './index.module.css';

export const Optgroup = ({
    children,
    className,
    optionGroupDividerClassName,
    divider,
    key,
    size = 's',
}: OptgroupProps) => (
    <React.Fragment>
        <div className={cn(styles.optgroup, className, styles[size])} key={key}>
            <div className={cn(styles.divider, optionGroupDividerClassName)}>{divider}</div>
        </div>
        {children}
    </React.Fragment>
);

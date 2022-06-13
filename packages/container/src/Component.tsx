import React, { DetailedHTMLFactory, HTMLAttributes } from 'react';
import cn from 'classnames';

import styles from './index.module.css';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentProps = {
    /**
     * Предопределенная максимальная ширина контейнера или номер для максимальной ширины в пикселях
     */
    size?: ContainerSize;

    /**
     * Если для fluid установлено значение true, значение size prop игнорируется, и контейнер всегда занимает 100% ширины
     */
    fluid?: boolean;

    /**
     * Дополнительный класс
     */
    className?: string;

    /**
     * Идентификатор для систем автоматизированного тестирования
     */
    dataTestId?: string;
};

export const Container = React.forwardRef<HTMLDivElement, ComponentProps>(
    ({ children, className, dataTestId, size, fluid, ...restProps }, ref) => {
        const componentProps = {
            className: cn(styles.component, className, {
                containerFluid: fluid,
                containerXs: size === 'xs',
                containerSm: size === 'sm',
                containerMd: size === 'md',
                containerLg: size === 'lg',
                containerXl: size === 'xl',
            }),
            'data-test-id': dataTestId || null,
        };

        const { ...restContainerProps } = restProps as DetailedHTMLFactory<
            HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;

        return (
            <div {...componentProps} {...restContainerProps} ref={ref}>
                {children}
            </div>
        );
    },
);

/**
 * Для отображения в сторибуке
 */
Container.defaultProps = {
    size: 'md',
};

Container.displayName = 'Container';

import { EventEmitter } from 'events';
import { Transform, TransformOptions } from 'readable-stream';
import { MetricOptions } from '@metrics/metric';

interface BaseMetricsOptions {
    /**
     * Valid characters: `a-zA-Z0-9_`
     */
    name: string;
    description: string;
    labels?: Record<string, string | number | boolean | null>;
}

export interface MetricsCounter extends EventEmitter {
    /**
     * Increment the counter
     *
     * @example <caption>Increment by 1</caption>
     * counter.inc();
     * @example <caption>Increment by 10</caption>
     * counter.inc(10);
     * @example <caption>Increment by 1 with labels</caption>
     * counter.inc({ labels: { url: 'https://www.mysite.com' } });
     * @example <caption>Increment by 10 with labels</caption>
     * counter.inc(10, { labels: { url: 'https://www.mysite.com' } });
     */
    inc(
        value?: number | BaseMetricsOptions,
        options?: Pick<BaseMetricsOptions, 'labels'>,
    ): void;
}

export interface MetricsGauge extends EventEmitter {
    set(value: number, options?: Pick<BaseMetricsOptions, 'labels'>): void;
}

export interface MetricsHistogramOptions extends BaseMetricsOptions {
    buckets?: number[];
}

export type EndTimer = (options?: Pick<BaseMetricsOptions, 'labels'>) => void;

export interface MetricsHistogram extends EventEmitter {
    /**
     * When called, will popupale the metrics stream with a histogram value.
     *
     * @param value
     * @param options
     */
    observe(
        value: number,
        options?: Pick<MetricsHistogramOptions, 'labels' | 'buckets'>,
    ): void;
    /**
     *  Measure time between two points.
     *
     * @example <caption>Measure time between two points</caption>
     * const end = histogram.timer();
     * // some stuff happens
     * end();
     * @example <caption>Measure time between two points with labels</caption>
     * const end = histogram.timer({ labels: { url: 'https://www.mysite.com' } });
     * // some stuff happens
     * end();
     * @example <caption>Measure time between two points with labels in the end function</caption>
     * const end = histogram.timer();
     * // some stuff happens
     * end({ labels: { url: 'https://www.mysite.com' } });
     * @example <caption>Set custom buckets</caption>
     * const end = histogram.timer({ buckets: [0.1, 0.5, 1, 2, 5] });
     * // some stuff happens
     * end();
     */
    timer(
        options?: Pick<MetricsHistogramOptions, 'labels' | 'buckets'>,
    ): EndTimer;
}

export interface MetricsSummaryOptions extends BaseMetricsOptions {
    quantiles?: number[];
}

export interface MetricsSummary extends EventEmitter {
    /**
     * When called, will popupale the metrics stream with a histogram value.
     *
     * @param value
     * @param options
     */
    observe(
        value: number,
        options?: Pick<MetricsSummaryOptions, 'labels' | 'quantiles'>,
    ): void;
    /**
     *  Measure time between two points.
     *
     * @example <caption>Measure time between two points</caption>
     * const end = summary.timer();
     * // some stuff happens
     * end();
     * @example <caption>Measure time between two points with labels</caption>
     * const end = summary.timer({ labels: { url: 'https://www.mysite.com' } });
     * // some stuff happens
     * end();
     * @example <caption>Measure time between two points with labels in the end function</caption>
     * const end = summary.timer();
     * // some stuff happens
     * end({ labels: { url: 'https://www.mysite.com' } });
     * @example <caption>Set custom buckets</caption>
     * const end = summary.timer({ quantiles: [0.001, 0.01, 0.5, 0.9, 0.99] });
     * // some stuff happens
     * end();
     */
    timer(
        options?: Pick<MetricsSummaryOptions, 'labels' | 'quantiles'>,
    ): EndTimer;
}

export interface MetricsClientOptions extends TransformOptions {
    /**
     * An optional unique identifier of the MetricsClient instance.
     * A random ID will be generated if not provided.
     */
    id?: string;
}

export default class MetricsClient extends Transform {
    constructor(options?: MetricsClientOptions);

    counter(options: BaseMetricsOptions): MetricsCounter;
    gauge(options: BaseMetricsOptions): MetricsGauge;
    histogram(options: MetricsHistogramOptions): MetricsHistogram;
    summary(options: BaseMetricsOptions): MetricsHistogram;
    metric(options: MetricOptions): void;
    timer(options: MetricOptions): (options?: Partial<MetricOptions>) => void;
}

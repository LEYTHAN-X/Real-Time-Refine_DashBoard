import { DollarOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import { Text } from '../text';
import { Area, AreaConfig } from '@ant-design/plots';
import { useList } from '@refinedev/core';
import { DASHBOARD_DEALS_CHART_QUERY } from '@/graphql/queries';
import { mapDealsData } from '@/utilities/helpers';
import { GetFieldsFromList } from '@refinedev/nestjs-query';
import { DashboardDealsChartQuery } from '@/graphql/types';
import React, { useMemo } from 'react'; // Changed to import useMemo directly

// Optional: TypeScript interface for dealData (uncomment if using TypeScript)
// interface DealData {
//   timeText: string;
//   value: number;
//   state: string;
// }

const DealsChart = () => {
    const { data, isLoading, error } = useList<
        GetFieldsFromList<DashboardDealsChartQuery>
    >({
        resource: 'dealStages',
        filters: [
            {
                field: 'title',
                operator: 'in',
                value: ['WON', 'LOST'],
            },
        ],
        meta: {
            gqlQuery: DASHBOARD_DEALS_CHART_QUERY,
        },
    });

    const dealData = useMemo(() => {
        // Defensive check for undefined data
        return mapDealsData(data?.data ?? []);
    }, [data?.data]);

    const config: AreaConfig = {
        data: dealData,
        xField: 'timeText',
        yField: 'value',
        isStack: false,
        seriesField: 'state',
        animation: true,
        startOnZero: false,
        smooth: true,
        legend: {
            offsetY: -6,
        },
        yAxis: {
            tickCount: 4,
            label: {
                formatter: (v: string) => {
                    const num = Number(v);
                    return isNaN(num) ? '$0k' : `$${num / 1000}k`;
                },
            },
        },
        tooltip: {
            formatter: (data) => {
                const num = Number(data.value);
                return {
                    name: data.state,
                    value: isNaN(num) ? '$0k' : `$${num / 1000}k`,
                };
            },
        },
    };

    return (
        <Card
            style={{ height: '100%' }}
            styles={{
                header: { padding: '8px 16px' },
                body: { padding: '24px 24px 0 24px' },
            }}
            title={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <DollarOutlined />
                    <Text
                        size="sm"
                        style={{
                            marginLeft: '0.5rem',
                        }}
                    >
                        Deals
                    </Text>
                </div>
            }
        >
            {isLoading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <Text type="danger">Failed to load deals data</Text>
            ) : dealData.length === 0 ? (
                <Text>No deals data available</Text>
            ) : (
                <Area {...config} height={325} />
            )}
        </Card>
    );
};

export default DealsChart;
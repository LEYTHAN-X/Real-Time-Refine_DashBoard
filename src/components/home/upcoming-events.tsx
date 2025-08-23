import { CalendarOutlined } from '@ant-design/icons';
import { Badge, Card, List } from 'antd';
import { Text } from '../text';
import UpcomingEventsSkeleton from '../skeleton/upcoming-events';
import { getDate } from '@/utilities/helpers';
import { useList } from '@refinedev/core';
import { DASHBOARD_CALENDAR_UPCOMING_EVENTS_QUERY } from '@/graphql/queries';
import dayjs from 'dayjs';

// Optional: TypeScript interface for event item (uncomment if using TypeScript)
// interface Event {
//   id: string;
//   title: string;
//   startDate: string;
//   endDate: string;
//   color: string;
// }

const UpcomingEvents = () => {
    const { data, isLoading } = useList({
        resource: 'events',
        pagination: { pageSize: 5 },
        sorters: [
            {
                field: 'startDate',
                order: 'asc',
            },
        ],
        filters: [
            {
                field: 'startDate',
                operator: 'gte',
                value: dayjs().format('YYYY-MM-DD')
            },
        ],
        meta: {
            gqlQuery: DASHBOARD_CALENDAR_UPCOMING_EVENTS_QUERY,
        },
    });

    return (
        <div>
            <Card
                style={{ height: '100%' }}
                styles={{
                    header: { padding: '8px 16px' },
                    body: { padding: '0 1rem' },
                }}
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <CalendarOutlined />
                        <Text size="sm" style={{ marginLeft: '0.7rem' }}>
                            Upcoming Events
                        </Text>
                    </div>
                }
            >
                {isLoading ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={Array(5).fill({})}
                        renderItem={(_, index) => (
                            <List.Item key={index}>
                                <UpcomingEventsSkeleton />
                            </List.Item>
                        )}
                    />
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={data?.data || []}
                        renderItem={(item) => {
                            // Optional: Validate dates before passing to getDate
                            const renderDate = item.startDate
                                ? getDate(item.startDate, item.endDate)
                                : 'Invalid Date';

                            return (
                                <List.Item key={item.id}>
                                    <List.Item.Meta
                                        avatar={<Badge color={item.color} />}
                                        title={<Text size="xs">{renderDate}</Text>}
                                        description={
                                            <Text ellipsis={{ tooltip: true }} strong>
                                                {item.title}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
                {!isLoading && data?.data.length === 0 && (
                    <span
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%', // Changed to 100% for responsiveness
                            minHeight: '220px', // Ensure minimum height for consistency
                        }}
                    >
                        No upcoming events
                    </span>
                )}
            </Card>
        </div>
    );
};

export default UpcomingEvents;
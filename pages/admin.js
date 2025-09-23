import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Typography, Space, Button, message } from 'antd';
import { ReloadOutlined, BarChartOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        message.error('获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const dailyStatsColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '总次数',
      dataIndex: 'total',
      key: 'total',
      align: 'center',
    },
    {
      title: '成功次数',
      dataIndex: 'success',
      key: 'success',
      align: 'center',
      render: (value) => <Text style={{ color: '#52c41a' }}>{value}</Text>,
    },
    {
      title: '失败次数',
      dataIndex: 'failed',
      key: 'failed',
      align: 'center',
      render: (value) => <Text style={{ color: '#ff4d4f' }}>{value}</Text>,
    },
    {
      title: '成功率',
      key: 'successRate',
      align: 'center',
      render: (_, record) => {
        const rate = record.total > 0 ? ((record.success / record.total) * 100).toFixed(1) : 0;
        return <Text>{rate}%</Text>;
      },
    },
  ];

  const dailyStatsData = stats?.dailyStats ? Object.entries(stats.dailyStats).map(([date, data]) => ({
    key: date,
    date,
    ...data,
  })).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

  const successRate = stats?.totalAttempts > 0 ? ((stats.successfulAttempts / stats.totalAttempts) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Zeppa 后台数据管理</Title>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchStats}
            loading={loading}
          >
            刷新数据
          </Button>
        </div>

        {/* 统计卡片 */}
        <div style={{ marginBottom: '24px' }}>
          <Space size="large" wrap>
            <Card>
              <Statistic
                title="总尝试次数"
                value={stats?.totalAttempts || 0}
                prefix={<BarChartOutlined />}
                loading={loading}
              />
            </Card>
            <Card>
              <Statistic
                title="成功次数"
                value={stats?.successfulAttempts || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
            <Card>
              <Statistic
                title="失败次数"
                value={stats?.failedAttempts || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
                loading={loading}
              />
            </Card>
            <Card>
              <Statistic
                title="成功率"
                value={successRate}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: successRate >= 80 ? '#3f8600' : successRate >= 60 ? '#faad14' : '#cf1322' }}
                loading={loading}
              />
            </Card>
            <Card>
              <Statistic
                title="唯一用户数"
                value={stats?.uniqueAccountCount || 0}
                prefix={<UserOutlined />}
                loading={loading}
              />
            </Card>
          </Space>
        </div>

        {/* 每日统计表格 */}
        <Card title="每日统计" style={{ marginBottom: '24px' }}>
          <Table
            columns={dailyStatsColumns}
            dataSource={dailyStatsData}
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>

        {/* 用户列表 */}
        <Card title="用户账号列表">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {stats?.uniqueAccounts?.map((account, index) => (
              <Text key={index} code style={{ margin: '4px' }}>
                {account}
              </Text>
            )) || <Text type="secondary">暂无数据</Text>}
          </div>
        </Card>

        {/* 最后更新时间 */}
        {stats?.lastUpdated && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Text type="secondary">
              最后更新时间: {new Date(stats.lastUpdated).toLocaleString('zh-CN')}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}


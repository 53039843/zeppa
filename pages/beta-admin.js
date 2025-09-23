import React, { useState, useEffect } from 'react';
import { Card, Typography, Statistic, Row, Col, Table, Button, message, Alert, Divider } from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import Head from 'next/head';
import axios from 'axios';

const { Title, Text } = Typography;

const BetaAdmin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/test-stats');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        message.error('加载统计数据失败');
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 计算成功率
  const getSuccessRate = () => {
    if (!stats || stats.totalAttempts === 0) return 0;
    return ((stats.successfulAttempts / stats.totalAttempts) * 100).toFixed(1);
  };

  // 准备日统计表格数据
  const getDailyTableData = () => {
    if (!stats || !stats.dailyStats) return [];
    
    return Object.entries(stats.dailyStats).map(([date, data], index) => ({
      key: index,
      date,
      total: data.total,
      success: data.success,
      failed: data.failed,
      successRate: data.total > 0 ? ((data.success / data.total) * 100).toFixed(1) + '%' : '0%'
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const dailyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '总尝试',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: '成功',
      dataIndex: 'success',
      key: 'success',
      render: (value) => <Text style={{ color: '#52c41a' }}>{value}</Text>
    },
    {
      title: '失败',
      dataIndex: 'failed',
      key: 'failed',
      render: (value) => <Text style={{ color: '#ff4d4f' }}>{value}</Text>
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Head>
        <title>内测数据管理 - Zeppa Beta Admin</title>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={2}>
            <BarChartOutlined style={{ marginRight: '8px' }} />
            内测数据统计
          </Title>
          <Text type="secondary">实时监控内测用户使用情况</Text>
        </div>

        <Alert
          message="内测数据收集说明"
          description="此页面仅用于内测期间收集用户使用数据，帮助改进产品功能。所有数据仅供开发团队内部分析使用。"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总尝试次数"
                value={stats?.totalAttempts || 0}
                prefix={<UserOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="成功次数"
                value={stats?.successfulAttempts || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="失败次数"
                value={stats?.failedAttempts || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="成功率"
                value={getSuccessRate()}
                suffix="%"
                precision={1}
                valueStyle={{ color: getSuccessRate() > 50 ? '#3f8600' : '#cf1322' }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card>
              <Statistic
                title="独立用户数"
                value={stats?.uniqueAccountCount || 0}
                prefix={<UserOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <Statistic
                title="最后更新时间"
                value={stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('zh-CN') : '暂无数据'}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title="每日统计详情" 
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadStats}
              loading={loading}
            >
              刷新数据
            </Button>
          }
        >
          <Table
            columns={dailyColumns}
            dataSource={getDailyTableData()}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        </Card>

        <Divider />

        <div style={{ textAlign: 'center', color: '#999' }}>
          <Text type="secondary">
            数据文件位置: /test-data/beta-test-data.txt<br/>
            统计文件位置: /test-data/test-statistics.json
          </Text>
        </div>
      </div>
    </div>
  );
};

export default BetaAdmin;

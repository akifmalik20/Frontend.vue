<script setup lang="ts">
import { useChatbotAnalytics } from '@/composables/useChatBotAnalytics.ts'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart.vue'

// Logic extraction
const {
  store,
  summary,
    context,
  handleClientChange,
  handleUserChange,handleGroupByChange,handleResetFilters,handleTableUserClick,
  charts,truncateText,
  detailedStatsList,
  topUsers,
  recentActivity,
  trendsDatasets,
  formatNumber,
  formatTime,
  getEntityName,
  handleApplyFilters,
  handlePeriodChange,
  handleTableClientClick,
  transStore
} = useChatbotAnalytics()
</script>

<template>
  <div class="analytics-dashboard">
    <!-- Header with Filters -->
    <div class="dashboard-header">
      <div class="header-title">
        <font-awesome-icon :icon="['fas', 'chart-pie']" />
        <h1>  {{ transStore.t('Analytics')}} <span class="header-light">{{transStore.t('analytics.dashboard')}}</span></h1>
        <span v-if="context.filter_level !== 'global'" class="filter-badge">
          <font-awesome-icon :icon="context.filter_level === 'client' ? ['fas', 'building'] : ['fas', 'user-circle']" />
          {{ context.filter_level === 'client' ? context.client?.name : context.user?.username }}
        </span>
      </div>

      <div class="header-filters">
        <!-- Client Dropdown -->
        <div class="filter-group">
          <label>
            <font-awesome-icon :icon="['fas', 'building']" />  {{transStore.t('analytics.client')}}
          </label>
          <select
              v-model="store.tempSelectedClient"
              @change="handleClientChange"
              class="filter-select"
              :disabled="store.loadingClients"
          >
            <option :value="null"> {{transStore.t('analytics.all.clients')}}</option>
            <option
                v-for="client in store.clientOptions"
                :key="client.id"
                :value="client.id"
            >
              {{ client.name || client.company_name || `Client ${client.id}` }}
            </option>
          </select>
        </div>

        <!-- User Dropdown (enabled only when client selected) -->
        <div class="filter-group">
          <label>
            <font-awesome-icon :icon="['fas', 'user']" />  {{transStore.t('analytics.user')}}
          </label>
          <select
              v-model="store.tempSelectedUser"
              @change="handleUserChange"
              class="filter-select"
              :disabled="!store.tempSelectedClient || store.loadingClients"
          >
            <option :value="null">{{transStore.t('analytics.all.user')}}</option>
            <option
                v-for="user in store.userOptions"
                :key="user.id"
                :value="user.id"
            >
              {{ user.name || user.username || `User ${user.id}` }}
            </option>
          </select>
        </div>



        <!-- Period Dropdown -->
        <div class="filter-group">
          <label>
            <font-awesome-icon :icon="['fas', 'calendar-alt']" />  {{transStore.t('analytics.period')}}
          </label>
          <select v-model="store.selectedPeriod" @change="handlePeriodChange" class="filter-select">
            <option value="today"><font-awesome-icon :icon="['fas', 'sun']" />  {{transStore.t('analytics.today')}}</option>
            <option value="week"><font-awesome-icon :icon="['fas', 'calendar-week']" /> {{transStore.t('analytics.this.week')}}</option>
            <option value="month"><font-awesome-icon :icon="['fas', 'calendar-alt']" />  {{transStore.t('analytics.this.month')}}</option>
            <option value="quarter"><font-awesome-icon :icon="['fas', 'calendar-alt']" /> {{transStore.t('analytics.this.quater')}}</option>
            <option value="year"><font-awesome-icon :icon="['fas', 'calendar']" /> {{transStore.t('analytics.this.year')}}</option>
            <option value="all"><font-awesome-icon :icon="['fas', 'infinity']" />{{transStore.t('analytics.all.time')}}</option>
          </select>
        </div>

        <!-- Group By Dropdown -->
        <div class="filter-group">
          <label>
            <font-awesome-icon :icon="['fas', 'chart-bar']" />  {{transStore.t('analytics.gorup.by')}}
          </label>
          <select v-model="store.selectedGroupBy" @change="handleGroupByChange" class="filter-select">
            <option value="day"><font-awesome-icon :icon="['fas', 'calendar-day']" />  {{transStore.t('analytics.daily')}}</option>
            <option value="month"><font-awesome-icon :icon="['fas', 'calendar-alt']" />  {{transStore.t('analytics.monthly')}}</option>
          </select>
        </div>
        <!-- Apply Filters Button -->
        <button
            @click="handleApplyFilters"
            class="btn-apply"
            :disabled="store.loading"
        >
          <font-awesome-icon :icon="['fas', 'filter']" />  {{transStore.t('analytics.apply.filter')}}
        </button>
        <!-- Clear Filters Button -->
        <button v-if="context.filter_level !== 'global'" @click="handleResetFilters" class="btn-reset">
          <font-awesome-icon :icon="['fas', 'times-circle']" /> {{transStore.t('analytics.clear.filter')}}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p><font-awesome-icon :icon="['fas', 'chart-line']" />  {{transStore.t('analytics.loading.data')}}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
      <p>{{ store.error }}</p>
      <button @click="store.fetchAnalytics()" class="btn-retry">
        <font-awesome-icon :icon="['fas', 'sync-alt']" />  {{transStore.t('analytics.retry')}}
      </button>
    </div>

    <!-- Dashboard Content -->
    <template v-else-if="store.analyticsData">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card total-tokens">
          <div class="kpi-icon-wrapper">
            <font-awesome-icon :icon="['fas', 'coins']" />
          </div>
          <div class="kpi-content">
            <span class="kpi-label">{{transStore.t('analytics.total.tokens')}}</span>
            <div class="kpi-value">{{ formatNumber(summary.total_tokens?.all || 0) }}</div>
            <div class="kpi-footer">
              <span><font-awesome-icon :icon="['fas', 'cube']" /> {{ formatNumber(summary.total_tokens?.embeddings || 0) }}</span>
              <span><font-awesome-icon :icon="['fas', 'robot']" /> {{ formatNumber(summary.total_tokens?.ai_response || 0) }}</span>
            </div>
          </div>
        </div>

        <div class="kpi-card embeddings">
          <div class="kpi-icon-wrapper">
            <font-awesome-icon :icon="['fas', 'cubes']" />
          </div>
          <div class="kpi-content">
            <span class="kpi-label"> {{transStore.t('analytics.embeddings')}}</span>
            <div class="kpi-value">{{ formatNumber(summary.total_tokens?.embeddings || 0) }}</div>
            <div class="kpi-footer">
              <span><font-awesome-icon :icon="['fas', 'file']" /> {{ formatNumber(summary.averages?.embeddings_per_document || 0) }}</span>
              <span><font-awesome-icon :icon="['fas', 'message']" /> {{ formatNumber(summary.averages?.embeddings_per_request || 0) }}</span>
            </div>
          </div>
        </div>

        <div class="kpi-card ai-response">
          <div class="kpi-icon-wrapper">
            <font-awesome-icon :icon="['fas', 'brain']" />
          </div>
          <div class="kpi-content">
            <span class="kpi-label">{{transStore.t('analytics.ai.response')}}</span>
            <div class="kpi-value">{{ formatNumber(summary.total_tokens?.ai_response || 0) }}</div>
            <div class="kpi-footer">
              <span><font-awesome-icon :icon="['fas', 'message']" /> {{ formatNumber(summary.averages?.response_tokens_per_request || 0) }}</span>
            </div>
          </div>
        </div>

        <div class="kpi-card activity">
          <div class="kpi-icon-wrapper">
            <font-awesome-icon :icon="['fas', 'chart-line']" />
          </div>
          <div class="kpi-content">
            <span class="kpi-label"> {{transStore.t('analytics.activity')}}</span>
            <div class="kpi-value">{{ summary.usage_counts?.chat_requests || 0 }}</div>
            <div class="kpi-footer">
              <span><font-awesome-icon :icon="['fas', 'file-upload']" /> {{ summary.usage_counts?.documents_uploaded || 0 }}</span>
              <span><font-awesome-icon :icon="['fas', 'users']" /> {{ summary.usage_counts?.active_users || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <font-awesome-icon :icon="['fas', 'chart-line']" />
              <h3> {{transStore.t('analytics.daily.trends')}}</h3>
            </div>
            <div class="chart-legend">
              <span class="legend-item upload">
                <font-awesome-icon :icon="['fas', 'circle']" style="color: #FF6384;" />  {{transStore.t('analytics.upload')}}
              </span>
              <span class="legend-item query">
                <font-awesome-icon :icon="['fas', 'circle']" style="color: #36A2EB;" />  {{transStore.t('analytics.query')}}
              </span>
              <span class="legend-item response">
                <font-awesome-icon :icon="['fas', 'circle']" style="color: #FFCE56;" />  {{transStore.t('analytics.response')}}
              </span>
            </div>
          </div>
          <div class="chart-container">
            <LineChart
                v-if="charts.daily_trends?.labels?.length"
                :labels="charts.daily_trends.labels"
                :datasets="trendsDatasets"
            />
            <div v-else class="no-chart-data">
              <font-awesome-icon :icon="['fas', 'chart-line']" />
              <p> {{transStore.t('analytics.no.trend')}}</p>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <font-awesome-icon :icon="['fas', 'chart-pie']" />
              <h3> {{transStore.t('analytics.token.distribution')}}</h3>
            </div>
          </div>
          <div class="chart-container">
            <PieChart
                v-if="charts.token_distribution?.labels?.length"
                :labels="charts.token_distribution.labels"
                :data="charts.token_distribution.values"
                :colors="charts.token_distribution.colors"
            />
            <div v-else class="no-chart-data">
              <font-awesome-icon :icon="['fas', 'chart-pie']" />
              <p> {{transStore.t('analytics.no.distribution')}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <font-awesome-icon :icon="['fas', 'chart-bar']" />
              <h3>{{transStore.t('analytics.usage.breakdown')}}</h3>
            </div>
          </div>
          <div class="chart-container">
            <BarChart
                v-if="charts.usage_breakdown?.labels?.length"
                :labels="charts.usage_breakdown.labels"
                :data="charts.usage_breakdown.values"
            />
            <div v-else class="no-chart-data">
              <font-awesome-icon :icon="['fas', 'chart-bar']" />
              <p> {{transStore.t('analytics.no.usage')}}</p>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <font-awesome-icon :icon="['fas', 'ranking-star']" />
              <h3>{{transStore.t('analytics.top.user')}}</h3>
            </div>
          </div>
          <div class="chart-container">
            <HorizontalBarChart
                v-if="topUsers?.labels?.length"
                :labels="topUsers.labels"
                :data="topUsers.tokens"
            />
            <div v-else class="no-chart-data">
              <font-awesome-icon :icon="['fas', 'users']" />
              <p> {{transStore.t('analytics.no.user')}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats and Activity -->
      <div class="details-grid">
        <!-- Client/User Breakdown -->
        <div class="details-card">
          <div class="card-header">
            <font-awesome-icon :icon="context.filter_level === 'global' ? ['fas', 'building'] : ['fas', 'user']" />
            <h3>{{ context.filter_level === 'global' ? 'Client Breakdown' : 'User Details' }}</h3>
            <span class="card-badge">
              <font-awesome-icon :icon="['fas', 'chart-simple']" /> {{ detailedStatsList.length }}  {{transStore.t('analytics.records')}}
            </span>
          </div>
          <div class="table-container">
            <table class="stats-table">
              <thead>
              <tr>
                <th><font-awesome-icon :icon="['fas', 'building']" /> {{transStore.t('analytics.client')}}</th>
                <th><font-awesome-icon :icon="['fas', 'message']" />  {{transStore.t('analytics.requests')}}</th>
                <th><font-awesome-icon :icon="['fas', 'file']" />  {{transStore.t('analytics.docs')}}</th>
                <th><font-awesome-icon :icon="['fas', 'cube']" /> {{transStore.t('analytics.embeddings')}}</th>
                <th><font-awesome-icon :icon="['fas', 'brain']" />  {{transStore.t('analytics.response')}}</th>
                <th><font-awesome-icon :icon="['fas', 'coins']" />  {{transStore.t('analytics.total')}}</th>
                <th><font-awesome-icon :icon="['fas', 'eye']" />  {{transStore.t('analytics.action')}}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in detailedStatsList" :key="item.client_id || item.user_id">
                <td>
                    <span class="entity-name">
                      <font-awesome-icon :icon="context.filter_level === 'global' ? ['fas', 'building'] : ['fas', 'user-circle']" />
                      {{ getEntityName(item) }}
                    </span>
                </td>
                <td><span class="badge-requests">{{ item.total_requests || 0 }}</span></td>
                <td><span class="badge-docs">{{ item.total_uploads || 0 }}</span></td>
                <td>{{ formatNumber(item.total_embeddings || 0) }}</td>
                <td>{{ formatNumber(item.total_response_tokens || 0) }}</td>
                <td><strong>{{ formatNumber(item.total_tokens || 0) }}</strong></td>
                <td>
                  <button
                      v-if="context.filter_level === 'global' && item.client_id"
                      @click="handleTableClientClick(item.client_id)"
                      class="btn-icon"
                      :title="'View client details'"
                  >
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </button>
                  <button
                      v-else-if="context.filter_level === 'client' && item.user_id"
                      @click="handleTableUserClick(item.user_id)"
                      class="btn-icon"
                      :title="'View user details'"
                  >
                    <font-awesome-icon :icon="['fas', 'user-check']" />
                  </button>
                </td>
              </tr>
              <tr v-if="!detailedStatsList.length">
                <td colspan="7" class="no-data">
                  <font-awesome-icon :icon="['fas', 'database']" />  {{transStore.t('analytics.no.data.avail')}}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="details-card">
          <div class="card-header">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <h3> {{transStore.t('analytics.recent.activity')}}</h3>
            <span class="card-badge">
              <font-awesome-icon :icon="['fas', 'list']" />  {{transStore.t('analytics.latest')}}
            </span>
          </div>
          <div class="activity-feed">
            <div v-if="recentActivity.length" v-for="activity in recentActivity" :key="activity.timestamp" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <font-awesome-icon :icon="activity.type === 'document_upload' ? ['fas', 'file-upload'] : ['fas', 'comment-dots']" />
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <span class="activity-user">
                    <font-awesome-icon :icon="['fas', 'user-circle']" /> {{ activity.user }}
                  </span>
                  <span class="activity-time">
                    <font-awesome-icon :icon="['fas', 'clock']" /> {{ formatTime(activity.timestamp) }}
                  </span>
                </div>
                <p class="activity-description">{{ truncateText(activity.description, 60) }}</p>
                <div class="activity-meta">
                  <span class="activity-tokens">
                    <font-awesome-icon :icon="['fas', 'coins']" /> {{ formatNumber(activity.tokens) }}  {{transStore.t('analytics.tokens')}}
                  </span>
                  <span v-if="!context.client" class="activity-client">
                    <font-awesome-icon :icon="['fas', 'building']" /> {{ activity.client_name || activity.client }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="no-activity">
              <font-awesome-icon :icon="['fas', 'history']" />
              <p> {{transStore.t('analytics.no.recent')}}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- No Data State -->
    <div v-else class="no-data-state">
      <font-awesome-icon :icon="['fas', 'chart-pie']" />
      <p> {{transStore.t('analytics.no.analytic.data')}}</p>
      <button @click="store.fetchAnalytics()" class="btn-retry">
        <font-awesome-icon :icon="['fas', 'sync-alt']" />  {{transStore.t('analytics.refresh')}}
      </button>
    </div>
  </div>
</template>



<style scoped>
.analytics-dashboard {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header Styles */
.dashboard-header {
  background: white;
  border-radius: 20px;
  padding: 24px 32px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f2f5;
  flex-wrap: wrap;
  gap: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.header-title svg {
  font-size: 32px;
  color: #4361ee;
  background: #eef2ff;
  padding: 12px;
  border-radius: 14px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-light {
  font-weight: 400;
  color: #64748b;
}

.filter-badge {
  background: #eef2ff;
  color: #4361ee;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
}

.filter-badge svg {
  font-size: 14px;
  padding: 0;
  background: none;
}

.header-filters {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group label svg {
  font-size: 12px;
  color: #4361ee;
}

.filter-select {
  padding: 10px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  min-width: 160px;
  transition: all 0.2s;
  font-weight: 500;
}

.filter-select:hover:not(:disabled) {
  border-color: #4361ee;
}

.filter-select:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.filter-select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-apply {
  padding: 10px 24px;
  background: #4361ee;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  height: 46px;
  margin-bottom: 0;
}

.btn-apply:hover:not(:disabled) {
  background: #3651d4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(67, 97, 238, 0.2);
}

.btn-apply:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-reset {
  padding: 10px 20px;
  background: #fef2f2;
  border: 1.5px solid #fee2e2;
  border-radius: 12px;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  height: 46px;
  margin-bottom: 0;
}

.btn-reset:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.kpi-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f2f5;
  transition: all 0.3s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
  border-color: #e2e8f0;
}

.kpi-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.total-tokens .kpi-icon-wrapper {
  background: linear-gradient(135deg, #4361ee 0%, #06b6d4 100%);
  color: white;
}

.embeddings .kpi-icon-wrapper {
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  color: white;
}

.ai-response .kpi-icon-wrapper {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.activity .kpi-icon-wrapper {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin: 4px 0 8px 0;
}

.kpi-footer {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.kpi-footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kpi-footer svg {
  font-size: 12px;
  color: #94a3b8;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f2f5;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-title svg {
  font-size: 20px;
  color: #4361ee;
  background: #eef2ff;
  padding: 8px;
  border-radius: 12px;
}

.chart-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.chart-container {
  height: 300px;
  position: relative;
}

.no-chart-data {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 12px;
}

.no-chart-data svg {
  font-size: 40px;
  margin-bottom: 10px;
  color: #cbd5e1;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}

.details-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header svg {
  font-size: 20px;
  color: #4361ee;
  background: #eef2ff;
  padding: 8px;
  border-radius: 12px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.card-badge {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th {
  text-align: left;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.stats-table th svg {
  margin-right: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.stats-table td {
  padding: 14px 8px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.stats-table tr:hover td {
  background: #f8fafc;
}

.entity-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #4361ee;
}

.entity-name svg {
  font-size: 14px;
  color: #94a3b8;
}

.badge-requests,
.badge-docs {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #4361ee;
  color: white;
}

/* Activity Feed */
.activity-feed {
  max-height: 450px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.activity-icon.document_upload {
  background: #eef2ff;
  color: #4361ee;
}

.activity-icon.chat_request {
  background: #f0fdf4;
  color: #10b981;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.activity-user {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity-user svg {
  color: #94a3b8;
  font-size: 12px;
}

.activity-time {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.activity-time svg {
  font-size: 11px;
}

.activity-description {
  font-size: 13px;
  color: #475569;
  margin: 0 0 8px 0;
  word-break: break-word;
  line-height: 1.5;
}

.activity-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  flex-wrap: wrap;
}

.activity-tokens {
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fffbeb;
  padding: 4px 10px;
  border-radius: 20px;
}

.activity-client {
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
}

.no-activity {
  padding: 30px;
  text-align: center;
  color: #94a3b8;
}

.no-activity svg {
  font-size: 40px;
  margin-bottom: 10px;
  color: #cbd5e1;
}

/* Loading State */
.loading-state {
  background: white;
  border-radius: 20px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f2f5;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f1f5f9;
  border-top-color: #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p svg {
  margin-right: 8px;
  color: #4361ee;
}

/* Error State & No Data State */
.error-state,
.no-data-state {
  background: white;
  border-radius: 20px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f0f2f5;
}

.error-state svg,
.no-data-state svg {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state svg {
  color: #ef4444;
}

.no-data-state svg {
  color: #94a3b8;
}

.error-state p,
.no-data-state p {
  color: #64748b;
  margin-bottom: 20px;
  font-size: 16px;
}

.btn-retry {
  padding: 12px 28px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #3651d4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(67, 97, 238, 0.2);
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #94a3b8;
}

.no-data svg {
  margin-right: 8px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .header-filters {
    gap: 12px;
  }

  .filter-group {
    min-width: 130px;
  }

  .filter-select {
    min-width: 130px;
  }
}

@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    padding: 20px;
  }

  .header-title {
    flex-wrap: wrap;
  }

  .header-filters {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .filter-group {
    width: 100%;
    min-width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .btn-apply,
  .btn-reset {
    width: 100%;
    justify-content: center;
    margin-top: 4px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-card {
    padding: 20px;
  }

  .kpi-value {
    font-size: 28px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-legend {
    flex-wrap: wrap;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
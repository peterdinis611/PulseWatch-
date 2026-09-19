const MONITOR_FIELDS = `
  id
  name
  type
  enabled
  intervalSec
  timeoutMs
  lastStatus
  lastError
  lastLatencyMs
  lastCheckedAt
  createdAt
  updatedAt
  config {
    url
    method
    expectedStatus
    host
    port
    tls
    secure
    startTls
    allowUnauthorized
    serverName
    minDaysUntilExpiry
    recordType
    nameserver
    expectedValue
    service
    topic
  }
`;

const STRESS_FIELDS = `
  id
  name
  url
  method
  vus
  durationSec
  expectedStatus
  p95Ms
  maxFailRate
  lastStatus
  lastError
  lastSummary {
    httpReqs
    avgMs
    p95Ms
    failRate
    checksPassed
    checksFailed
  }
  lastRunAt
  scheduleEnabled
  scheduleIntervalSec
  scheduleLastRunAt
  createdAt
  updatedAt
`;

export const HEALTH_QUERY = `
  query Health {
    health { status database timestamp }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id email name createdAt }
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id email name createdAt }
    }
  }
`;

export const SHELL_QUERY = `
  query Shell {
    me { id email name createdAt }
    monitors { ${MONITOR_FIELDS} }
    unreadNotificationCount
  }
`;

export const MONITOR_QUERY = `
  query Monitor($id: String!) {
    monitor(id: $id) { ${MONITOR_FIELDS} }
  }
`;

export const CREATE_MONITOR = `
  mutation CreateMonitor($input: CreateMonitorInput!) {
    createMonitor(input: $input) { ${MONITOR_FIELDS} }
  }
`;

export const UPDATE_MONITOR = `
  mutation UpdateMonitor($id: String!, $input: UpdateMonitorInput!) {
    updateMonitor(id: $id, input: $input) { ${MONITOR_FIELDS} }
  }
`;

export const DELETE_MONITOR = `
  mutation DeleteMonitor($id: String!) {
    deleteMonitor(id: $id)
  }
`;

export const RUN_MONITOR = `
  mutation RunMonitor($id: String!) {
    runMonitorCheck(id: $id) { ${MONITOR_FIELDS} }
  }
`;

const MONITOR_CHECK_RESULT = `
  status
  error
  latencyMs
  checkedAt
`;

export const PROBE_MONITOR = `
  mutation ProbeMonitor($input: CreateMonitorInput!) {
    probeMonitor(input: $input) { ${MONITOR_CHECK_RESULT} }
  }
`;

export const QUICK_MONITOR_CHECK = `
  mutation QuickMonitorCheck($id: String!, $input: UpdateMonitorInput) {
    quickMonitorCheck(id: $id, input: $input) { ${MONITOR_CHECK_RESULT} }
  }
`;

export const MONITOR_HISTORY_QUERY = `
  query MonitorHistory($id: String!, $hours: Int) {
    monitorChecks(id: $id, hours: $hours) {
      id monitorId status error latencyMs checkedAt
    }
    monitorUptime(id: $id, hours: $hours) {
      periodHours totalChecks upChecks uptimePercent avgLatencyMs
    }
  }
`;

export const SETTINGS_QUERY = `
  query MonitorSettings {
    monitorSettings {
      defaultIntervalSec
      defaultTimeoutMs
      notifyOnDown
      notifyOnRecover
      webhookUrl
      slackWebhookUrl
      alertEmail
      updatedAt
    }
  }
`;

export const UPDATE_SETTINGS = `
  mutation UpdateMonitorSettings($input: UpdateMonitorSettingsInput!) {
    updateMonitorSettings(input: $input) {
      defaultIntervalSec
      defaultTimeoutMs
      notifyOnDown
      notifyOnRecover
      webhookUrl
      slackWebhookUrl
      alertEmail
      updatedAt
    }
  }
`;

export const STRESS_TESTS_QUERY = `
  query StressTests {
    stressTests { ${STRESS_FIELDS} }
  }
`;

export const K6_STATUS_QUERY = `
  query K6Status {
    k6Status {
      installed
      message
    }
  }
`;

export const MONITOR_UPDATED_SUB = `
  subscription MonitorUpdated {
    monitorUpdated { ${MONITOR_FIELDS} }
  }
`;

export const LOAD_PAGE_QUERY = `
  query LoadPage {
    stressTests { ${STRESS_FIELDS} }
    k6Status {
      installed
      message
    }
  }
`;

export const STRESS_TEST_QUERY = `
  query StressTest($id: String!) {
    stressTest(id: $id) { ${STRESS_FIELDS} }
    stressTestRuns(id: $id) {
      id
      stressTestId
      status
      error
      summary {
        httpReqs
        avgMs
        p95Ms
        failRate
        checksPassed
        checksFailed
      }
      startedAt
      finishedAt
    }
  }
`;

export const CREATE_STRESS = `
  mutation CreateStressTest($input: CreateStressTestInput!) {
    createStressTest(input: $input) { ${STRESS_FIELDS} }
  }
`;

export const UPDATE_STRESS = `
  mutation UpdateStressTest($id: String!, $input: UpdateStressTestInput!) {
    updateStressTest(id: $id, input: $input) { ${STRESS_FIELDS} }
  }
`;

export const DELETE_STRESS = `
  mutation DeleteStressTest($id: String!) {
    deleteStressTest(id: $id)
  }
`;

export const RUN_STRESS = `
  mutation RunStressTest($id: String!) {
    runStressTest(id: $id) { ${STRESS_FIELDS} }
  }
`;

export const NOTIFICATIONS_QUERY = `
  query Notifications {
    notifications {
      id type title body monitorId stressTestId readAt createdAt
    }
    unreadNotificationCount
  }
`;

export const MARK_READ = `
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(id: $id) {
      id readAt
    }
  }
`;

export const MARK_ALL_READ = `
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const NOTIFICATION_SUB = `
  subscription NotificationReceived {
    notificationReceived {
      id type title body monitorId stressTestId readAt createdAt
    }
  }
`;

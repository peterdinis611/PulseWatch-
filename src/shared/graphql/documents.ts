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

export const SETTINGS_QUERY = `
  query MonitorSettings {
    monitorSettings {
      defaultIntervalSec
      defaultTimeoutMs
      notifyOnDown
      notifyOnRecover
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
      updatedAt
    }
  }
`;

export const STRESS_TESTS_QUERY = `
  query StressTests {
    stressTests { ${STRESS_FIELDS} }
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
      id type title body readAt createdAt
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
      id type title body readAt createdAt
    }
  }
`;

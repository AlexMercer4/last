# API Service Layer Documentation

This directory contains the complete API service layer for the counseling platform, including React Query hooks for data fetching, caching, and state management.

## Structure

```
src/api/
├── index.js           # Export all API services
├── auth.js           # Authentication APIs
├── users.js          # User management APIs
├── appointments.js   # Appointment APIs
├── messages.js       # Messaging APIs
├── files.js          # File upload/download APIs
├── notes.js          # Student notes APIs
├── notifications.js  # Notification APIs
└── analytics.js      # Analytics APIs

src/hooks/
├── index.js          # Export all hooks
├── useAuth.js        # Authentication hooks
├── useUsers.js       # User management hooks
├── useAppointments.js # Appointment hooks
├── useMessages.js    # Messaging hooks
├── useFiles.js       # File management hooks
├── useNotes.js       # Student notes hooks
├── useNotifications.js # Notification hooks
├── useAnalytics.js   # Analytics hooks
└── useApiState.js    # Utility hooks for API states
```

## Usage Examples

### Authentication

```javascript
import { useLogin, useLogout, useCurrentUser } from '@/hooks';

function LoginForm() {
  const loginMutation = useLogin();
  const { data: currentUser, isLoading } = useCurrentUser();
  
  const handleLogin = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // User will be redirected automatically
    } catch (error) {
      // Error is handled by the hook with toast notification
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### User Management

```javascript
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks';

function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  
  const handleCreateUser = async (userData) => {
    await createUserMutation.mutateAsync(userData);
    // Success toast and cache update handled automatically
  };
  
  const handleUpdateUser = async (id, userData) => {
    await updateUserMutation.mutateAsync({ id, userData });
    // Optimistic updates and error handling included
  };
  
  if (isLoading) return <div>Loading users...</div>;
  
  return (
    <div>
      {users?.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onUpdate={handleUpdateUser}
        />
      ))}
    </div>
  );
}
```

### Appointments with Filtering

```javascript
import { useAppointments, useCreateAppointment } from '@/hooks';

function AppointmentsPage() {
  const [filters, setFilters] = useState({
    status: 'SCHEDULED',
    dateFrom: new Date().toISOString().split('T')[0],
  });
  
  const { data: appointments, isLoading } = useAppointments(filters);
  const createAppointmentMutation = useCreateAppointment();
  
  const handleBookAppointment = async (appointmentData) => {
    await createAppointmentMutation.mutateAsync(appointmentData);
    // Notifications and cache updates handled automatically
  };
  
  return (
    <div>
      <FilterComponent filters={filters} onChange={setFilters} />
      {isLoading ? (
        <div>Loading appointments...</div>
      ) : (
        <AppointmentList 
          appointments={appointments} 
          onBook={handleBookAppointment}
        />
      )}
    </div>
  );
}
```

### Real-time Messaging

```javascript
import { 
  useConversations, 
  useConversationMessages, 
  useSendMessage 
} from '@/hooks';

function MessagesPage() {
  const { data: conversations } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const { data: messages, isLoading } = useConversationMessages(
    selectedConversation?.id
  );
  const sendMessageMutation = useSendMessage();
  
  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;
    
    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation.id,
      messageData: { content }
    });
    // Optimistic updates show message immediately
  };
  
  return (
    <div className="flex">
      <ConversationList 
        conversations={conversations}
        selected={selectedConversation}
        onSelect={setSelectedConversation}
      />
      <MessageThread 
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        isSending={sendMessageMutation.isPending}
      />
    </div>
  );
}
```

### File Upload with Progress

```javascript
import { useUploadFile, useConversationFiles } from '@/hooks';
import { useFileUpload } from '@/hooks/useApiState';

function ResourcesTab({ conversationId }) {
  const { data: files } = useConversationFiles(conversationId);
  const uploadFileMutation = useUploadFile();
  const { upload, uploadProgress, isUploading } = useFileUpload();
  
  const handleFileUpload = async (file) => {
    await upload(
      (onProgress) => uploadFileMutation.mutateAsync({
        conversationId,
        file,
        onUploadProgress: onProgress
      })
    );
  };
  
  return (
    <div>
      <FileUploader 
        onUpload={handleFileUpload}
        progress={uploadProgress}
        isUploading={isUploading}
      />
      <FileList files={files} />
    </div>
  );
}
```

### Student Notes Management

```javascript
import { 
  useStudentNotes, 
  useCreateNote, 
  useUpdateNote,
  useSearchNotes 
} from '@/hooks';

function StudentNotesPage({ studentId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  
  const { data: notes } = useStudentNotes(studentId, filters);
  const { data: searchResults } = useSearchNotes(searchQuery, filters);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  
  const handleCreateNote = async (noteData) => {
    await createNoteMutation.mutateAsync({ studentId, noteData });
  };
  
  const handleUpdateNote = async (noteId, noteData) => {
    await updateNoteMutation.mutateAsync({ noteId, noteData });
    // Optimistic updates provide immediate feedback
  };
  
  const displayNotes = searchQuery ? searchResults : notes;
  
  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <NotesList 
        notes={displayNotes}
        onCreate={handleCreateNote}
        onUpdate={handleUpdateNote}
      />
    </div>
  );
}
```

### Notifications with Real-time Updates

```javascript
import { 
  useNotifications, 
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead 
} from '@/hooks';

function NotificationCenter() {
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const handleMarkAsRead = async (notificationId) => {
    await markAsReadMutation.mutateAsync(notificationId);
    // Optimistic updates reduce perceived latency
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2>Notifications ({unreadCount?.count || 0})</h2>
        <button onClick={handleMarkAllAsRead}>
          Mark All as Read
        </button>
      </div>
      <NotificationList 
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
```

### Analytics Dashboard

```javascript
import { 
  useDashboardStats, 
  useAppointmentAnalytics,
  useStudentAnalytics 
} from '@/hooks';

function AnalyticsDashboard() {
  const { data: dashboardStats } = useDashboardStats();
  const { data: appointmentStats } = useAppointmentAnalytics({
    dateFrom: '2024-01-01',
    dateTo: new Date().toISOString().split('T')[0]
  });
  const { data: studentStats } = useStudentAnalytics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard 
        title="Total Appointments" 
        value={dashboardStats?.totalAppointments}
      />
      <StatsCard 
        title="Active Students" 
        value={dashboardStats?.activeStudents}
      />
      <ChartComponent data={appointmentStats} />
      <EngagementMetrics data={studentStats} />
    </div>
  );
}
```

## Key Features

### 1. Optimistic Updates
- Messages appear immediately when sent
- User profile changes show instantly
- File uploads show progress and completion
- Notifications update counts in real-time

### 2. Error Handling
- Automatic retry for network errors and 5xx responses
- User-friendly error messages with toast notifications
- Rollback of optimistic updates on failure
- Comprehensive error logging for debugging

### 3. Caching Strategy
- Smart cache invalidation based on data relationships
- Background refetching for stale data
- Pagination support with `keepPreviousData`
- Role-based cache management

### 4. Performance Optimizations
- Query deduplication prevents duplicate requests
- Stale-while-revalidate pattern for better UX
- Selective cache updates to minimize re-renders
- Efficient pagination for large datasets

### 5. Type Safety (Future Enhancement)
- All APIs return consistent response formats
- Error objects follow standardized structure
- Query keys are centralized and reusable

## Best Practices

1. **Always use the provided hooks** instead of calling API functions directly
2. **Handle loading states** in your components for better UX
3. **Use optimistic updates** for actions that are likely to succeed
4. **Implement proper error boundaries** for unhandled errors
5. **Cache invalidation** is handled automatically, but you can customize it
6. **Use filters and pagination** for large datasets
7. **Test error scenarios** to ensure proper fallback behavior

## Integration with Socket.io

The API layer is designed to work seamlessly with Socket.io for real-time features:

- Message hooks automatically update when new messages arrive via Socket.io
- Notification hooks sync with real-time notification events
- Appointment hooks can be updated when appointments change
- File upload completion can trigger real-time updates to all participants

This API service layer provides a robust foundation for the counseling platform with excellent developer experience, performance, and user experience.
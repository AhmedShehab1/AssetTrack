export default function NotificationsPage() {
  const { fetchNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications({ size: 50 }).then(data => {
      if (data?.content) setNotifications(data.content);
    });
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
      <ul className="notifications-list">
        {notifications.length === 0 
          ? <li>No notifications yet.</li>
          : notifications.map(n => <li key={n.id}>{n.message}</li>)
        }
      </ul>
    </div>
  );
}
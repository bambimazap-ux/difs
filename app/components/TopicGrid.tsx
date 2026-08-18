import { Folder } from 'lucide-react';

export default function TopicGrid({ initialTopics, initialTasks, setActiveFilter }: any) {
  return (
    <div className="topics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', paddingBottom: '32px' }}>
      {initialTopics.map((topic: any) => {
        const topicTasks = initialTasks.filter((t: any) => t.topic_id === topic.id);
        const completedTasks = topicTasks.filter((t: any) => t.status === 'DONE').length;
        const progress = topicTasks.length > 0 ? Math.round((completedTasks / topicTasks.length) * 100) : 0;
        
        return (
          <div 
            key={topic.id} 
            className="topic-folder-card premium-shadow" 
            onClick={() => setActiveFilter(topic.id)} 
            style={{ cursor: 'pointer', background: 'white', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.2s', border: '1px solid rgba(0,0,0,0.05)' }}
            role="button"
            tabIndex={0}
            aria-label={`תיקיית נושא: ${topic.title}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: '#e8f0fe', padding: '12px', borderRadius: '16px', display: 'flex' }}>
                <Folder size={28} color="#1a73e8" fill="#1a73e8" fillOpacity={0.2} />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#202124', lineHeight: '1.3' }}>{topic.title}</h3>
              <div style={{ fontSize: '13px', color: '#5f6368' }}>{topicTasks.length} משימות</div>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5f6368', marginBottom: '6px', fontWeight: 600 }}>
                <span>התקדמות</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '6px', background: '#f1f3f4', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: progress === 100 ? '#1e8e3e' : '#1a73e8', width: `${progress}%`, transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>
          </div>
        );
      })}
      {initialTopics.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
          <Folder size={48} color="#ccc" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <h3 style={{ fontSize: '18px', color: '#555', marginBottom: '8px' }}>אין עדיין נושאים</h3>
          <p style={{ fontSize: '14px' }}>הוסף נושא חדש כדי להתחיל לנהל משימות</p>
        </div>
      )}
    </div>
  );
}

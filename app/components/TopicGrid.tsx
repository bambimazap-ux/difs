import { Folder, Plus } from 'lucide-react';

export default function TopicGrid({ initialTopics, initialTasks, setActiveFilter }: any) {
  return (
    <div className="topics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', paddingBottom: '32px', alignItems: 'start' }}>
      {initialTopics.map((topic: any) => {
        const topicTasks = initialTasks.filter((t: any) => t.topic_id === topic.id);
        const completedTasks = topicTasks.filter((t: any) => t.status === 'DONE').length;
        const progress = topicTasks.length > 0 ? Math.round((completedTasks / topicTasks.length) * 100) : 0;
        
        return (
          <div 
            key={topic.id} 
            className="topic-folder-card premium-shadow" 
            style={{ 
              background: 'var(--card-bg, white)', 
              borderRadius: '12px', 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              transition: 'transform 0.2s', 
              border: '1px solid var(--border-color, #e0e0e0)',
              breakInside: 'avoid',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>{topic.title}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{topicTasks.length} משימות</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topicTasks.slice(0, 3).map((t: any) => (
                <div 
                  key={t.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px', 
                    fontSize: '14px',
                    color: t.status === 'DONE' ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: t.status === 'DONE' ? 'line-through' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveFilter(topic.id)}
                >
                  <div style={{ marginTop: '2px', color: t.status === 'DONE' ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {t.status === 'DONE' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                    )}
                  </div>
                  <span style={{ lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>

            {topicTasks.length > 3 && (
              <div 
                onClick={() => setActiveFilter(topic.id)}
                style={{ 
                  marginTop: '4px', 
                  fontSize: '13px', 
                  color: 'var(--primary-color)', 
                  cursor: 'pointer', 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> עוד {topicTasks.length - 3} משימות...
              </div>
            )}
            
            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                <span>התקדמות</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: progress === 100 ? 'var(--success-color)' : 'var(--primary-color)', width: `${progress}%`, transition: 'width 0.5s ease-out' }}></div>
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

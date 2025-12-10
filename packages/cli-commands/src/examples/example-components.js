import path from 'path';
import { writeFileAtomicString, ensureDirectory } from 'file-operations';
import logger from '@sequential/sequential-logging';

export async function createExampleComponents(tasksDir) {
  const componentsDir = path.join(tasksDir, '..', '.sequential', '.state', 'components');
  await ensureDirectory(componentsDir);

  const components = [
    {
      name: 'example-counter.jsx',
      code: `export default function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
      <h2>Counter Component</h2>
      <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>
        {count}
      </div>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          marginRight: '10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
      <button
        onClick={() => setCount(count - 1)}
        style={{
          padding: '10px 20px',
          background: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Decrement
      </button>
    </div>
  );
}`
    },
    {
      name: 'example-form.jsx',
      code: `export default function TaskForm() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Example Form Component</h2>
      {submitted ? (
        <div style={{
          background: '#e8f5e9',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          padding: '15px',
          marginTop: '20px'
        }}>
          <h3>Thank you! Form submitted</h3>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', message: '' });
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Form
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                minHeight: '100px'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}`
    },
    {
      name: 'example-data-display.jsx',
      code: `export default function DataDisplay() {
  const [data, setData] = React.useState([
    { id: 1, title: 'Task 1', status: 'completed', progress: 100 },
    { id: 2, title: 'Task 2', status: 'in-progress', progress: 65 },
    { id: 3, title: 'Task 3', status: 'pending', progress: 0 }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      case 'pending': return '#ff9800';
      default: return '#999';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Task Progress Display</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {data.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{item.title}</h3>
              <span style={{
                background: getStatusColor(item.status),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {item.status}
              </span>
            </div>
            <div style={{
              background: '#e0e0e0',
              borderRadius: '4px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  background: getStatusColor(item.status),
                  height: '100%',
                  width: \`\${item.progress}%\`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              Progress: {item.progress}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`
    }
  ];

  for (const component of components) {
    const filePath = path.join(componentsDir, component.name);
    await writeFileAtomicString(filePath, component.code);
    logger.info(`  ✓ Created example component: ${component.name}`);
  }
}

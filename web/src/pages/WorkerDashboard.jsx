import React, { useEffect, useState } from 'react';
import { getMyTasks, submitFieldLog } from '../api';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadTasks() {
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function submitLog(latitude = null, longitude = null) {
    const formData = new FormData();

    formData.append('task_id', activeTaskId);
    formData.append('notes', notes);

    if (photo) {
      formData.append('photo', photo);
    }

    if (latitude !== null && longitude !== null) {
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
    }

    await submitFieldLog(formData);

    setActiveTaskId(null);
    setNotes('');
    setPhoto(null);
    setError('');

    await loadTasks();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitting(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await submitLog(
              position.coords.latitude,
              position.coords.longitude
            );
          } catch (err) {
            setError(err.message);
          } finally {
            setSubmitting(false);
          }
        },
        async () => {
          try {
            await submitLog();
          } catch (err) {
            setError(err.message);
          } finally {
            setSubmitting(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000
        }
      );
    } else {
      try {
        await submitLog();
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '40px auto' }}>
      <h2>My Tasks</h2>

      {error && (
        <p style={{ color: 'red', background: '#ffecec', padding: 10 }}>
          {error}
        </p>
      )}

      <ul>
        {tasks.map(t => (
          <li key={t.id} style={{ marginBottom: 12 }}>
            {t.task_type} — {t.status}

            {t.status !== 'done' && (
              <button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setActiveTaskId(t.id);
                  setError('');
                }}
              >
                Log Activity
              </button>
            )}
          </li>
        ))}
      </ul>

      {activeTaskId && (
        <form onSubmit={handleSubmit}>
          <h4>Submit Field Log for Task #{activeTaskId}</h4>

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', minHeight: 100, marginBottom: 10 }}
          />

          <br />

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => setPhoto(e.target.files[0])}
          />

          <br /><br />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}

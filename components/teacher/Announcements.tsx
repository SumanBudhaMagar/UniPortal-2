

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Announcement, Course } from './types';

interface AnnouncementsProps {
  announcements: Announcement[];
  courses: Course[];
  onCreateAnnouncement: (data: any) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export default function Announcements({
  announcements,
  courses,
  onCreateAnnouncement,
  onDeleteAnnouncement
}: AnnouncementsProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title || !message) {
      alert('Please fill all required fields');
      return;
    }

    setSaving(true);
    await onCreateAnnouncement({
      title,
      message,
      course_id: selectedCourse || null,
      priority
    });

    setTitle('');
    setMessage('');
    setSelectedCourse('');
    setPriority('medium');
    setShowForm(false);
    setSaving(false);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'bg-red-100 text-red-800 border-red-300';
    if (p === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>📢 Announcements</CardTitle>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Announcement'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            <div>
              <Label>Message *</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message here..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Course (Optional)</Label>
                <select 
                  className="w-full p-2 border rounded"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select 
                  className="w-full p-2 border rounded"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No announcements yet. Create your first one!
            </div>
          ) : (
            announcements.map((ann) => (
              <div 
                key={ann.id} 
                className={`p-4 rounded-lg border-2 ${getPriorityColor(ann.priority)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{ann.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-white border font-semibold">
                      {ann.priority.toUpperCase()}
                    </span>
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-sm mb-2">{ann.message}</p>
                <div className="text-xs opacity-70">
                  {new Date(ann.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
